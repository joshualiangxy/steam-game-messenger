import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isNil from 'lodash/isNil';
import SteamAPI from 'steamapi';
import SteamUser from 'steam-user';
import Victim from './module/victim';
import config from './config';
import { Game, LoginDetail, SteamID, User } from './types/types';
import { EMPTY_GAME_ID, EMPTY_GAME_NAME } from './module/victim/victim.const';

const MAX_DELAY: number = 300000;
const PERSONA_ONLINE: number = 1;

const { steam: { username, password, apiKey }, victims } = config;

const getData = (): Map<string, Victim> => {
  const result: Map<string, Victim> = new Map<string, Victim>();

  victims.forEach(
    (accountId: string) => result.set(accountId, new Victim(accountId))
  );

  return result;
}

/*
const isNoLongerIngame = (gameId: number, gameName: string): boolean => {
  return gameId == 0 && gameName == '';
}
*/

const initialize = (): void => {
  const steam: typeof SteamAPI = new SteamAPI(apiKey);
  const client: typeof SteamUser = new SteamUser();
  const loginDetails: LoginDetail = { accountName: username, password };
  const users: Map<string, Victim> = getData();

  client.logOn(loginDetails);

  client.on('loggedOn', (): void => {
    console.log('Logged in');
    client.setPersona(PERSONA_ONLINE);
  });

  client.on('user', async (steamId: SteamID, user: User): Promise<void> => {
    const accountId: string = steamId.accountid.toString();

    if (!users.has(accountId)) return;

    const victim: Victim | undefined = users.get(accountId);

    if (!victim) {
      throw new Error(`victim not found for ${accountId}`);
    }

    const playerName: string | null = get(user, 'player_name');
    const gameId: string | null = get(user, 'gameid', EMPTY_GAME_ID);
    let gameName: string | null = get(user, 'game_name', EMPTY_GAME_NAME);

    if (!isNil(gameId) && isEmpty(gameName) && gameId !== EMPTY_GAME_ID) {
      try {
        const { name }: Game = await steam.getGameDetails(gameId);
        gameName = name;
      } catch (err) {
        console.error(`Failed to fetch game details for ${gameId}: `, err);
      }
    }

    const updated = await victim.update(gameId, gameName);

    if (victim.isInitializing()) {
      return;
    }

    if (updated && victim.isIngame) {
      // Random delay to make it seem more authentic
      await new Promise(res => setTimeout(res, Math.random() * MAX_DELAY));

      await victim.sendMessage(client, steamId, gameName, playerName);
    }
  });
}

initialize();

