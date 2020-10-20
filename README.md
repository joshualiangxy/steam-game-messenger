# steam-game-messenger

This is a simple CLI program I made to annoy my friends by reminding them that
they are playing games instead of spending time studying. The program simply
messages them if they enter a new steam game.

## Setup
1. Clone the repository
2. Install the dependencies using `yarn install`
3. You will need to set up your list of victims in the victims array in 
   src/main.ts. You can find the account ids by simply printing out the user
   object found in the `'user'` event.
4. You will need to set up environment variables for your STEAM_USERNAME and
   STEAM_PASSWORD
5. Run the program using node on the main.js file

