require('dotenv').config();

const SteamUser = require('steam-user');
const SteamAPI = require('steamapi');
const steam = new SteamAPI(process.env.API_KEY);
const client = new SteamUser();

interface EnteredGame {
  gameName: String;
  id: String;
}

const victims: String[] = [
  process.env.ACCOUNT_ID_ONE,
  process.env.ACCOUNT_ID_TWO,
  process.env.ACCOUNT_ID_THREE,
  process.env.ACCOUNT_ID_FOUR,
  process.env.ACCOUNT_ID_FIVE,
  process.env.ACCOUNT_ID_SIX
];

const details = {
  accountName: process.env.STEAM_USERNAME,
  password: process.env.STEAM_PASSWORD
};

client.logOn(details);

client.on('loggedOn', () => {
  console.log('Logged in');
  client.setPersona(1);
});

client.on('user', (sid: any, user: any): void => {
  const victim: String[] = victims.filter(
    (accountId: String) => accountId == sid.accountid
  );
  const gameId = user.gameid;
  const hasVictim: boolean = victim.length == 1;
  const isPlayingGame: boolean = gameId > 0;
  const wasPlayingDifferentGame: boolean =
    gameId != client.users[sid.getSteamID64()].gameid &&
    client.users[sid.getSteamID64()].gameid != undefined;

  if (!hasVictim) return;

  if (isPlayingGame && wasPlayingDifferentGame) {
    steam
      .getGameDetails(gameId)
      .then((game: any) => {
        client.chat.sendFriendMessage(sid, game.name);
      })
      .catch(() => {
        client.chat.sendFriendMessage(sid, user.game_name);
      });
  }
});

