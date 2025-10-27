import { useCallback, useState } from 'react';

import { getRunStateManager } from '@/lib/delvers-descent/run-state-manager';
import type { CollectedItem, RunState } from '@/types/delvers-descent';

// eslint-disable-next-line max-lines-per-function
export const useRunState = () => {
  const [activeRunState, setActiveRunState] = useState<RunState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const runStateManager = getRunStateManager();

  const initializeRun = useCallback(
    async (runId: string, initialEnergy: number): Promise<RunState> => {
      if (!runId || initialEnergy <= 0) {
        throw new Error('Invalid run ID or initial energy');
      }

      setIsLoading(true);
      setError(null);

      try {
        await runStateManager.initializeRun(runId, initialEnergy);
        const newState = runStateManager.getCurrentState();
        if (!newState) {
          throw new Error('Failed to initialize run state');
        }
        setActiveRunState(newState);
        return newState;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to initialize run';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [runStateManager]
  );

  const moveToNode = useCallback(
    async (nodeId: string, energyCost: number): Promise<RunState> => {
      if (!activeRunState) {
        throw new Error('No active run state');
      }

      setIsLoading(true);
      setError(null);

      try {
        await runStateManager.moveToNode(nodeId, energyCost);
        const newState = runStateManager.getCurrentState();
        if (!newState) {
          throw new Error('Failed to move to node');
        }
        setActiveRunState(newState);
        return newState;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to move to node';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [runStateManager, activeRunState]
  );

  const addToInventory = useCallback(
    async (item: CollectedItem): Promise<RunState> => {
      if (!activeRunState) {
        throw new Error('No active run state');
      }

      setIsLoading(true);
      setError(null);

      try {
        await runStateManager.addToInventory(item);
        const newState = runStateManager.getCurrentState();
        if (!newState) {
          throw new Error('Failed to add item to inventory');
        }
        setActiveRunState(newState);
        return newState;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to add item to inventory';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [runStateManager, activeRunState]
  );

  const removeFromInventory = useCallback(
    async (itemId: string): Promise<RunState> => {
      if (!activeRunState) {
        throw new Error('No active run state');
      }

      setIsLoading(true);
      setError(null);

      try {
        await runStateManager.removeFromInventory(itemId);
        const newState = runStateManager.getCurrentState();
        if (!newState) {
          throw new Error('Failed to remove item from inventory');
        }
        setActiveRunState(newState);
        return newState;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to remove item from inventory';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [runStateManager, activeRunState]
  );

  const updateEnergy = useCallback(
    async (newEnergy: number): Promise<RunState> => {
      if (!activeRunState) {
        throw new Error('No active run state');
      }

      setIsLoading(true);
      setError(null);

      try {
        await runStateManager.updateEnergy(newEnergy);
        const newState = runStateManager.getCurrentState();
        if (!newState) {
          throw new Error('Failed to update energy');
        }
        setActiveRunState(newState);
        return newState;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update energy';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [runStateManager, activeRunState]
  );

  const completeRun = useCallback(async (): Promise<void> => {
    if (!activeRunState) {
      throw new Error('No active run state');
    }

    setIsLoading(true);
    setError(null);

    try {
      await runStateManager.completeRun();
      setActiveRunState(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to complete run';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [runStateManager, activeRunState]);

  const bustRun = useCallback(async (): Promise<void> => {
    if (!activeRunState) {
      throw new Error('No active run state');
    }

    setIsLoading(true);
    setError(null);

    try {
      await runStateManager.bustRun();
      setActiveRunState(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to bust run';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [runStateManager, activeRunState]);

  const getCurrentNode = useCallback((): string => {
    return runStateManager.getCurrentNode();
  }, [runStateManager]);

  const getInventoryValue = useCallback((): number => {
    return runStateManager.getTotalInventoryValue();
  }, [runStateManager]);

  const clearActiveRun = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      setActiveRunState(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to clear active run';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshData = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const currentState = runStateManager.getCurrentState();
      setActiveRunState(currentState);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to refresh data';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [runStateManager]);

  return {
    activeRunState,
    isLoading,
    error,
    initializeRun,
    moveToNode,
    addToInventory,
    removeFromInventory,
    updateEnergy,
    completeRun,
    bustRun,
    getCurrentNode,
    getInventoryValue,
    clearActiveRun,
    refreshData,
  };
};
