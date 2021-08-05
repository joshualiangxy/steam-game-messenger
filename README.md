# steam-game-messenger

This is a simple CLI program I made to annoy my friends by reminding them that
they are playing games instead of spending time studying. The program simply
messages them if they enter a new steam game.

## Setup
1. Clone the repository
2. Install the dependencies using `npm install`
3. You will need to set up your config in a `local.json` file. View the
   `common.json` file at `/src/conf/common.json` to see what configurations you
   need to override. You can place the file at `/src/conf/local.json`.
   You can find the account ids of your victims by simply printing out the user
   object found in the `'user'` event.
4. Run the program using `npm start`

