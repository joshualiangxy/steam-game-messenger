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
  ): Promise<void> {
    const isIngame = gameId !== EMPTY_GAME_ID || gameName !== EMPTY_GAME_NAME;

    if (this.isDifferentGame(gameId, gameName)) {
      if (!this.isInitializing()) {
        // Exiting game
        if (this.isIngame && !isIngame) this.lastIngame = new Date();
        // Entering/changing game
        if (isIngame) this.isMessageSent = false;
      }
    }

    this.ingame = isIngame;

    if (this.isIngame || this.isInitializing()) {
      this.gameId = gameId;
      this.gameName = gameName;
    }
  }

  private shouldSendMessage(gameName: string): boolean {
    if (gameName !== this.gameName) return false;
    if (!this.isMessageSent) return true;

    const now = new Date();

    if (isNil(this.lastIngame)) return false;

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

  /*
  private currentGameId: number;
  private currentGameName: string;
  private prevGameId: number;
  private prevGameName: string;
  private lastSeenIngame: DateTime;

  constructor(accountId: string) {
    this.accountId = accountId;
    this.lastSeenIngame = DateTime.local();
  }

  isSameVictim(accountId: string): boolean {
    return this.accountId === accountId;
  }

  isPlayingNewGame(gameId: number, gameName: string): boolean {
    if (gameId == NaN || gameName == null) return false;

    if (this.prevGameId == NaN || this.prevGameName == null
       || (this.prevGameName == gameName
           && this.prevGameId == this.prevGameId)) {
      return DateTime.local().diff(this.lastSeenIngame).as('milliseconds')
          > Victim.timeLimit;
    }

    return true;
  }

  isStillIngame(gameId: number, gameName: string): boolean {
    return this.currentGameId == gameId && this.currentGameName == gameName;
  }

  resetLastSeenTime(): void {
    this.lastSeenIngame = DateTime.local();
  }

  setPrevGame(gameId: number, gameName: string): void {
    this.prevGameId = gameId;
    this.prevGameName = gameName;
  }

  setCurrGame(gameId: number = this.currentGameId, gameName: string): void {
    this.currentGameId = gameId;
    this.currentGameName = gameName;
  }
  */
}

