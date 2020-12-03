import dotenv from 'dotenv';
import SteamAPI from 'steamapi';
import SteamUser from 'steam-user';
import fs from 'fs';
import path from 'path';
import Victim from './Victim';

dotenv.config();

interface LoginDetail {
  accountName: string;
  password: string;
};

interface SteamID {
  accountid: string;
  getSteamID64(): string;
}

interface User {
  gameid: string;
  game_name: string;
  player_name: string;
}

const maxDelay: number = 300000;

const getData = (): string[] => {
  const victimsPath: string = path.resolve(__dirname, '../data/victims.json');
  const data: string = fs.readFileSync(victimsPath, 'utf8');
  const victims: string[] = JSON.parse(data).victims;

  return victims;
}

const isNoLongerIngame = (gameId: number, gameName: string): boolean => {
  return gameId == 0 && gameName == '';
}

const initialize = (): void => {
  const steam: typeof SteamAPI = new SteamAPI(process.env.API_KEY);
  const client: typeof SteamUser = new SteamUser();
  const details: LoginDetail = {
    accountName: process.env.STEAM_USERNAME,
    password: process.env.STEAM_PASSWORD
  };
  const victims = getData().map((accountId: string) => new Victim(accountId));

  client.logOn(details);

  client.on('loggedOn', (): void => {
    console.log('Logged in');
    client.setPersona(1);
  });

  client.on('user',(sid: SteamID, user: User): void => {
    const accountId: string = sid.accountid;
    const victim: Victim = victims.find(
      (victim: Victim) => victim.isSameVictim(accountId));

    if (!victim) return;

    console.log(user);
    const gameId: number = parseInt(user.gameid);
    let gameName: string = user.game_name;

    if (isNoLongerIngame(gameId, gameName)) {
      victim.resetLastSeenTime();
      return;
    }

    if (victim.isPlayingNewGame(gameId, gameName)) {
      victim.setPrevGame(gameId, gameName);

      Promise.resolve()
        .then(async (): Promise<{ name: string }> => {
          // Random delay to make it seem more authentic
          await new Promise(res => setTimeout(res, Math.random() * maxDelay));
          return steam.getGameDetails(gameId);
        })
        .then((game: { name: string }): void => {
          gameName = game.name;
        })
        .then((): void => {
          victim.setCurrGame(gameId, gameName);
        })
        .finally((): void => {
          if (victim.isStillIngame(gameId, gameName)) {
            client.chat.sendFriendMessage(sid, gameName);
            console.log(`message sent to: ${user.player_name}`);
          } else {
            console.log(`message not sent to: ${user.player_name}`);
          }

          console.log(`game name: ${gameName}`);
        });
    }
  });
}

initialize();
