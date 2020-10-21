require('dotenv').config();
const SteamUser = require('steam-user');
const SteamAPI = require('steamapi');
const steam = new SteamAPI(process.env.API_KEY);
const client = new SteamUser();
const maxTime = 30000;
const victims = [
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
client.on('user', (sid, user) => {
    const victim = victims.filter((accountId) => accountId == sid.accountid);
    const gameId = user.gameid;
    const isVictim = victim.length == 1;
    const isPlayingGame = gameId > 0;
    const wasPlayingDifferentGame = gameId != client.users[sid.getSteamID64()].gameid &&
        client.users[sid.getSteamID64()].gameid != undefined;
    const hasChangedGame = isPlayingGame && wasPlayingDifferentGame;
    let gameName = '';
    if (!isVictim)
        return;
    if (hasChangedGame) {
        steam
            .getGameDetails(gameId)
            .then(async (game) => {
            await new Promise(res => setTimeout(res, Math.random() * maxTime));
            return game;
        })
            .then((game) => {
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
