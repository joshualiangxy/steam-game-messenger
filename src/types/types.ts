export interface LoginDetail {
  accountName: string;
  password: string;
};

export interface SteamID {
  accountid: string;
  getSteamID64(): string;
}

export interface User {
  gameid: string | null;
  game_name: string | null;
  player_name: string;
}

export interface Game {
  name: string;
}

