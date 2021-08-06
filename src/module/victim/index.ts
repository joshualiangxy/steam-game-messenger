import SteamUser from 'steam-user';
import isNil from "lodash/isNil";
import { SteamID } from '../../types';
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
    const isIngame: boolean = gameId !== EMPTY_GAME_ID
      || gameName !== EMPTY_GAME_NAME;
    const isInitializing: boolean = this.isInitializing();

    if (!this.isDifferentGame(gameId, gameName)) {
      const updated: boolean = this.ingame !== isIngame;
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

    const now: Date = new Date();

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

    const now: Date = new Date();

    if (!this.shouldSendMessage(gameName)) {
      console.log(`${now.toTimeString()}: ${gameName} not sent to ${playerName}`);
      return;
    }

    await client.chat.sendFriendMessage(steamId, gameName);

    this.isMessageSent = true;
    console.log(`${now.toTimeString()}: ${gameName} sent to ${playerName}`);
  }

  public toString(): string {
    return this.accountId;
  }
}

