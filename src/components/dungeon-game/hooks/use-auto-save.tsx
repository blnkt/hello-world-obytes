import { useCallback, useEffect, useRef } from 'react';

import type { DungeonGameSaveData } from '../../../types/dungeon-game';
import { useDungeonGamePersistence } from './use-dungeon-game-persistence';

interface AutoSaveConfig {
  enabled: boolean;
  debounceMs: number;
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

// Helper function to check if state has changed significantly
const shouldSave = (
  newState: GameState,
  lastState: GameState | null
): boolean => {
  if (!lastState) return true;

  return (
    newState.level !== lastState.level ||
    newState.gameState !== lastState.gameState ||
    newState.revealedTiles !== lastState.revealedTiles ||
    newState.turnsUsed !== lastState.turnsUsed
  );
};

export const useAutoSave = (
  config: AutoSaveConfig = { enabled: true, debounceMs: 500 }
) => {
  const { saveGameState } = useDungeonGamePersistence();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveStateRef = useRef<GameState | null>(null);

  // Debounced save function
  const debouncedSave = useCallback(
    (gameState: GameState) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const saveData = createSaveData(gameState);
          await saveGameState(saveData);
          lastSaveStateRef.current = gameState;
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }, config.debounceMs);
    },
    [saveGameState, config.debounceMs]
  );

  // Trigger auto-save if state has changed
  const triggerAutoSave = useCallback(
    (gameState: GameState) => {
      if (!config.enabled) return;

      if (shouldSave(gameState, lastSaveStateRef.current)) {
        debouncedSave(gameState);
      }
    },
    [config.enabled, debouncedSave]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    triggerAutoSave,
    isEnabled: config.enabled,
  };
};
