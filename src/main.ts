require('dotenv').config();

const SteamUser = require('steam-user');
const SteamAPI = require('steamapi');
const steam: typeof SteamAPI = new SteamAPI(process.env.API_KEY);
const client: typeof SteamUser = new SteamUser();

const victims: String[] = [
  process.env.ACCOUNT_ID_ONE,
  process.env.ACCOUNT_ID_TWO,
  process.env.ACCOUNT_ID_THREE,
  process.env.ACCOUNT_ID_FOUR,
  process.env.ACCOUNT_ID_FIVE,
  process.env.ACCOUNT_ID_SIX
];

const details: Object = {
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
  const gameId: number = user.gameid;
  const isVictim: boolean = victim.length == 1;
  const isPlayingGame: boolean = gameId > 0;
  const wasPlayingDifferentGame: boolean =
    gameId != client.users[sid.getSteamID64()].gameid &&
    client.users[sid.getSteamID64()].gameid != undefined;
  const hasChangedGame: boolean = isPlayingGame && wasPlayingDifferentGame;
  let gameName: String = '';

  if (!isVictim) return;

  if (hasChangedGame) {
    steam
      .getGameDetails(gameId)
      .then((game: any) => {
        gameName = game.name;
        client.chat.sendFriendMessage(sid, gameName);
      })
      .catch(() => {
        gameName = user.game_name;
        client.chat.sendFriendMessage(sid, gameName);
      })
      .then(() => {
        console.log(`message sent to: ${user.player_name}`);
        console.log(`message sent: ${gameName}`);
      });
  }
});
