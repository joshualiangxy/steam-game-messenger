import SteamUser from 'steam-user';
import isNil from "lodash/isNil";
import { SteamID } from '../../types/types';
import { EMPTY_GAME_ID, EMPTY_GAME_NAME, TIME_LIMIT } from './victim.const';

export default class Victim {
  private accountId: string;
  private ingame: boolean;
  private isMessageSent: boolean;
  private gameId: string | null;
  private gameName: string | null;
  private lastIngame: Date | undefined;

  public constructor(accountId: string) {
    this.accountId = accountId;
    this.ingame = false;
    this.isMessageSent = true;
    this.gameId = null;
    this.gameName = null;
  }

  public get isIngame(): boolean {
    return this.ingame;
  }

  public isInitializing(): boolean {
    return isNil(this.gameId) && isNil(this.gameName);
  }

  private isDifferentGame(
    gameId: string | null,
    gameName: string | null
  ): boolean {
    return this.gameId !== gameId || this.gameName !== gameName;
  }

  public async update(
    gameId: string | null,
    gameName: string | null
  ): Promise<boolean> {
    const isIngame = gameId !== EMPTY_GAME_ID || gameName !== EMPTY_GAME_NAME;
    const isInitializing = this.isInitializing();

    if (!this.isDifferentGame(gameId, gameName)) {
      const updated = this.ingame !== isIngame;
      this.ingame = isIngame;

      return updated;
    }

    if (!isInitializing) {
      // Exiting game
      if (this.isIngame && !isIngame) this.lastIngame = new Date();
      // Entering/changing game
      if (isIngame) this.isMessageSent = false;
    }

    this.ingame = isIngame;

    if (this.isIngame || isInitializing) {
      this.gameId = gameId;
      this.gameName = gameName;
    }

    return !isInitializing;
  }

  private shouldSendMessage(gameName: string): boolean {
    if (!this.isIngame || gameName !== this.gameName) return false;
    if (!this.isMessageSent) return true;
    if (isNil(this.lastIngame)) return false;

    const now = new Date();

    return now.valueOf() - this.lastIngame.valueOf() > TIME_LIMIT;
  }

  public async sendMessage(
    client: typeof SteamUser,
    steamId: SteamID,
    gameName: string | null,
    playerName: string | null
  ): Promise<void> {
    if (isNil(gameName))
      throw new Error('gameName cannot be null');

    if (isNil(playerName))
      throw new Error('playerName cannot be null');

    if (!this.shouldSendMessage(gameName)) {
      console.log(`${gameName} not sent to ${playerName}`);
      return;
    }

    await client.chat.sendFriendMessage(steamId, gameName);

    this.isMessageSent = true;
    console.log(`${gameName} sent to ${playerName}`);
  }

  public toString(): string {
    return this.accountId;
  }
}

