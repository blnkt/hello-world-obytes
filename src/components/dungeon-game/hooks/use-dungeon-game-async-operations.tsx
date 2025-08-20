import { useCallback, useState } from 'react';

import {
  clearDungeonGameSaveData,
  loadDungeonGameState,
  saveDungeonGameState,
} from '../../../lib/storage/dungeon-game-persistence';
import type {
  DungeonGameSaveData,
  LoadOperationResult,
  SaveOperationResult,
} from '../../../types/dungeon-game';

// Hook for save operations
const useSaveOperation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const saveGameState = useCallback(
    async (
      gameData: Omit<DungeonGameSaveData, 'version' | 'timestamp'>
    ): Promise<SaveOperationResult> => {
      setIsLoading(true);
      setLastError(null);

      try {
        const result = await saveDungeonGameState(gameData);

        if (result.success) {
          setLastError(null);
        } else {
          setLastError(result.error || 'Save failed');
        }

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        setLastError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { isLoading, lastError, saveGameState };
};

// Hook for load operations
const useLoadOperation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const loadGameState = useCallback(async (): Promise<LoadOperationResult> => {
    setIsLoading(true);
    setLastError(null);

    try {
      const result = await loadDungeonGameState();

      if (result.success) {
        setLastError(null);
      } else {
        setLastError(result.error || 'Load failed');
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setLastError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, lastError, loadGameState };
};

// Hook for clear operations
const useClearOperation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const clearGameState = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setLastError(null);

    try {
      const success = await clearDungeonGameSaveData();

      if (success) {
        setLastError(null);
      } else {
        setLastError('Failed to clear save data');
      }

      return success;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setLastError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, lastError, clearGameState };
};

export const useDungeonGameAsyncOperations = () => {
  const saveHook = useSaveOperation();
  const loadHook = useLoadOperation();
  const clearHook = useClearOperation();

  // Combine loading states - if any operation is loading, the overall state is loading
  const isLoading =
    saveHook.isLoading || loadHook.isLoading || clearHook.isLoading;

  // Combine error states - prioritize the most recent error
  const lastError =
    clearHook.lastError || loadHook.lastError || saveHook.lastError;

  return {
    isLoading,
    lastError,
    saveGameState: saveHook.saveGameState,
    loadGameState: loadHook.loadGameState,
    clearGameState: clearHook.clearGameState,
  };
};
