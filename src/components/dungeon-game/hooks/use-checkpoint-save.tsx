import { useCallback } from 'react';

import type { DungeonGameSaveData } from '../../../types/dungeon-game';
import { useDungeonGamePersistence } from './use-dungeon-game-persistence';

interface CheckpointSaveConfig {
  enabled: boolean;
}

interface GameState {
  level: number;
  gameState: 'Active' | 'Win' | 'Game Over';
  revealedTiles: number;
  turnsUsed: number;
}

// Helper function to create save data
const createSaveData = (
  gameState: GameState
): Omit<DungeonGameSaveData, 'version' | 'timestamp'> => {
  return {
    gameState: gameState.gameState,
    level: gameState.level,
    gridState: [], // TODO: Add actual grid state
    turnsUsed: gameState.turnsUsed,
    achievements: {
      totalGamesPlayed: 0, // TODO: Track from global state
      gamesWon: 0,
      gamesLost: 0,
      highestLevelReached: 0,
      totalTurnsUsed: 0,
      totalTreasureFound: 0,
    },
    statistics: {
      winRate: 0,
      averageTurnsPerGame: 0,
      longestGameSession: 0,
      totalPlayTime: 0,
    },
    itemEffects: [], // TODO: Add actual item effects
  };
};

// Helper function to perform checkpoint save
const performCheckpointSave = async (
  gameState: GameState,
  saveGameState: (
    data: Omit<DungeonGameSaveData, 'version' | 'timestamp'>
  ) => Promise<any>,
  checkpointType: string
) => {
  try {
    const saveData = createSaveData(gameState);
    await saveGameState(saveData);
    console.log(`Checkpoint save: ${checkpointType}`);
  } catch (error) {
    console.error(`Checkpoint save failed for ${checkpointType}:`, error);
  }
};

export const useCheckpointSave = (
  config: CheckpointSaveConfig = { enabled: true }
) => {
  const { saveGameState } = useDungeonGamePersistence();

  // Checkpoint save for new game
  const saveNewGame = useCallback(
    async (gameState: GameState) => {
      if (!config.enabled) return;
      await performCheckpointSave(gameState, saveGameState, 'New game started');
    },
    [config.enabled, saveGameState]
  );

  // Checkpoint save for level completion
  const saveLevelCompletion = useCallback(
    async (gameState: GameState) => {
      if (!config.enabled) return;
      await performCheckpointSave(gameState, saveGameState, 'Level completed');
    },
    [config.enabled, saveGameState]
  );

  // Checkpoint save for game over
  const saveGameOver = useCallback(
    async (gameState: GameState) => {
      if (!config.enabled) return;
      await performCheckpointSave(gameState, saveGameState, 'Game over');
    },
    [config.enabled, saveGameState]
  );

  // Checkpoint save for level progression
  const saveLevelProgression = useCallback(
    async (gameState: GameState) => {
      if (!config.enabled) return;
      await performCheckpointSave(
        gameState,
        saveGameState,
        'Level progression'
      );
    },
    [config.enabled, saveGameState]
  );

  return {
    saveNewGame,
    saveLevelCompletion,
    saveGameOver,
    saveLevelProgression,
    isEnabled: config.enabled,
  };
};
