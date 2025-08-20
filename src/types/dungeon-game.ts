export interface DungeonGameSaveData {
  version: string;
  timestamp: number;
  gameState: GameState;
  level: number;
  gridState: GridTileState[];
  turnsUsed: number;
  achievements: AchievementProgress;
  statistics: GameStatistics;
  itemEffects: ActiveItemEffect[];
}

export type GameState = 'Active' | 'Win' | 'Game Over';

export interface GridTileState {
  id: string;
  x: number;
  y: number;
  isRevealed: boolean;
  type: TileType;
  hasBeenVisited: boolean;
}

export type TileType = 'treasure' | 'trap' | 'exit' | 'bonus' | 'neutral';

export interface AchievementProgress {
  totalGamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  highestLevelReached: number;
  totalTurnsUsed: number;
  totalTreasureFound: number;
}

export interface GameStatistics {
  winRate: number;
  averageTurnsPerGame: number;
  longestGameSession: number;
  totalPlayTime: number;
}

export interface ActiveItemEffect {
  id: string;
  type: ItemEffectType;
  duration: number;
  remainingDuration: number;
  effectValue: number;
  appliedAt: number;
}

export type ItemEffectType = 'speed' | 'strength' | 'luck' | 'defense';

export interface PersistenceMetadata {
  lastSaveTime: number;
  saveCount: number;
  dataSize: number;
  isValid: boolean;
}

export interface SaveOperationResult {
  success: boolean;
  error?: string;
  metadata?: PersistenceMetadata;
}

export interface LoadOperationResult {
  success: boolean;
  data?: DungeonGameSaveData;
  error?: string;
  metadata?: PersistenceMetadata;
}
