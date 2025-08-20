import { useCallback, useState } from 'react';

import { type DungeonGameSaveData } from '@/types/dungeon-game';

import { useDungeonGamePersistence } from './use-dungeon-game-persistence';
import { useGameGridState } from './use-game-grid-state';

// Mock the game state provider context for now
// In a real implementation, this would be imported from the provider
const useGameStateContext = () => ({
  setGameState: (_state: 'Active' | 'Win' | 'Game Over') => {},
  setLevel: (_level: number) => {},
  resetGame: () => {},
  updateGameState: (_updates: any) => {},
});

export interface ResumeChoiceHandlerConfig {
  onGameReady: () => void;
  onError: (message: string) => void;
}

export interface ResumeChoiceHandlerReturn {
  isLoading: boolean;
  error: string | null;
  handleResume: () => Promise<void>;
  handleNewGame: () => Promise<void>;
}

const convertGridStateToRevealedTiles = (
  gridState: DungeonGameSaveData['gridState']
): Set<string> => {
  const revealedTilesSet = new Set<string>();
  gridState.forEach((tile) => {
    if (tile.isRevealed) {
      revealedTilesSet.add(`${tile.x}-${tile.y}`);
    }
  });
  return revealedTilesSet;
};

const restoreGameState = (params: {
  saveData: DungeonGameSaveData;
  setLevel: (level: number) => void;
  setGameState: (state: 'Active' | 'Win' | 'Game Over') => void;
  setTurnsUsed: (turns: number) => void;
  setRevealedTiles: (tiles: Set<string>) => void;
}) => {
  const { saveData, setLevel, setGameState, setTurnsUsed, setRevealedTiles } =
    params;

  // Update game state with loaded data
  setLevel(saveData.level);
  setGameState(saveData.gameState);
  setTurnsUsed(saveData.turnsUsed);

  // Convert grid state to revealed tiles set
  const revealedTilesSet = convertGridStateToRevealedTiles(saveData.gridState);
  setRevealedTiles(revealedTilesSet);
};

const handleResumeError = (
  err: unknown,
  setError: (error: string | null) => void,
  onError: (message: string) => void
) => {
  const errorMessage =
    err instanceof Error ? err.message : 'Failed to load game state';
  setError(errorMessage);
  onError(errorMessage);
};

const handleNewGameError = (
  err: unknown,
  setError: (error: string | null) => void,
  onError: (message: string) => void
) => {
  const errorMessage =
    err instanceof Error ? err.message : 'Failed to clear game state';
  setError(errorMessage);
  onError(errorMessage);
};

// eslint-disable-next-line max-lines-per-function
export const useResumeChoiceHandler = ({
  onGameReady,
  onError,
}: ResumeChoiceHandlerConfig): ResumeChoiceHandlerReturn => {
  const { loadGameState, clearGameState } = useDungeonGamePersistence();
  const { setRevealedTiles, setTurnsUsed } = useGameGridState({});
  const { setGameState, setLevel, resetGame } = useGameStateContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResume = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await loadGameState();
      if (!result.success || !result.data) {
        throw new Error(result.error || 'No save data available');
      }

      const saveData: DungeonGameSaveData = result.data;
      restoreGameState({
        saveData,
        setLevel,
        setGameState,
        setTurnsUsed,
        setRevealedTiles,
      });

      onGameReady();
    } catch (err) {
      handleResumeError(err, setError, onError);
    } finally {
      setIsLoading(false);
    }
  }, [
    loadGameState,
    setLevel,
    setGameState,
    setTurnsUsed,
    setRevealedTiles,
    onGameReady,
    onError,
  ]);

  const handleNewGame = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Clear existing save data
      await clearGameState();

      // Reset game to initial state
      resetGame();

      onGameReady();
    } catch (err) {
      handleNewGameError(err, setError, onError);
    } finally {
      setIsLoading(false);
    }
  }, [clearGameState, resetGame, onGameReady, onError]);

  return {
    isLoading,
    error,
    handleResume,
    handleNewGame,
  };
};
