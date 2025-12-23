import { UserStats, GameStats } from '../types';

const STORAGE_KEY = 'ELITE_LEAGUE_STATS_V1';

const defaultStats: GameStats = {
  unlockedLevels: 1,
  highScore: 0,
};

class EliteLeagueHubService {
  private listeners: (() => void)[] = [];
  public stats: UserStats = {};

  constructor() {
    this.loadStats();
  }

  private loadStats() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      this.stats = stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.error("Failed to load stats", e);
      this.stats = {};
    }
  }

  private saveStats() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.stats));
    this.notify();
  }

  // --- NEW: Reset All Progress ---
  public resetAllProgress() {
    localStorage.removeItem(STORAGE_KEY);
    this.stats = {};
    this.notify();
    window.location.reload(); // Hard refresh to reset all app state
  }

  public getGameStats(gameId: string): GameStats {
    if (!this.stats[gameId]) {
      this.stats[gameId] = { ...defaultStats };
    }
    return this.stats[gameId];
  }

  public completeLevel(gameId: string, level: number, score: number) {
    const current = this.getGameStats(gameId);
    if (level === current.unlockedLevels && current.unlockedLevels < 20) {
      current.unlockedLevels += 1;
    }
    if (score > current.highScore) {
      current.highScore = score;
    }
    this.stats[gameId] = current;
    this.saveStats();
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }
}

export const EliteLeagueHub = new EliteLeagueHubService();