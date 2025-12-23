export interface GameStats {
  unlockedLevels: number; // 1-20
  highScore: number;
}

export interface UserStats {
  [gameId: string]: GameStats;
}

export type GameCategory = 'Easy' | 'Intermediate' | 'Advanced';

export interface GameDefinition {
  id: string;
  name: string;
  description: string;
  category: GameCategory;
  component: React.FC<GameProps>;
  icon: string;
}

export interface GameProps {
  onGameOver: (score: number, levelCompleted?: boolean) => void;
  onRegisterSolution: (solution: string) => void;
  currentLevel: number;
}

export type ThemeColor = 'gold' | 'navy' | 'red';