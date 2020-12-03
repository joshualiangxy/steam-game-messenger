import { DateTime } from 'luxon';

export default class Victim {
  private static timeLimit: number = 300000;
  private accountId: string;
  private currentGameId: number;
  private currentGameName: string;
  private prevGameId: number;
  private prevGameName: string;
  private lastSeenIngame: DateTime;

  constructor(accountId: string) {
    this.accountId = accountId;
    this.lastSeenIngame = DateTime.local();
    this.prevGameId = NaN;
    this.prevGameName = null;
  }

  isSameVictim(accountId: string): boolean {
    return this.accountId == accountId;
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
}

