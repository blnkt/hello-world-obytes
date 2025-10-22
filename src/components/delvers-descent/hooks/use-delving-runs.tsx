import { useCallback, useEffect, useState } from 'react';

import { getRunQueueManager } from '@/lib/delvers-descent/run-queue';
import type { DelvingRun, DelvingStats } from '@/types/delvers-descent';

// eslint-disable-next-line max-lines-per-function
export const useDelvingRuns = () => {
  const [runs, setRuns] = useState<DelvingRun[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DelvingStats | null>(null);

  const runQueueManager = getRunQueueManager();

  const refreshData = useCallback(async () => {
    try {
      const allRuns = runQueueManager.getAllRuns();
      const runStats = runQueueManager.getRunStatistics();
      setRuns(allRuns);
      setStats(runStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    }
  }, [runQueueManager]);

  const generateRun = useCallback(
    async (
      date: string,
      steps: number,
      _hasStreakBonus: boolean
    ): Promise<DelvingRun> => {
      setIsLoading(true);
      setError(null);

      try {
        const newRun = runQueueManager.generateRunFromSteps(date, steps);
        await runQueueManager.addRunToQueue(newRun);

        await refreshData();
        return newRun;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to generate run';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [runQueueManager, refreshData]
  );

  const removeRun = useCallback(
    async (runId: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await runQueueManager.removeRunFromQueue(runId);
        await refreshData();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to remove run';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [runQueueManager, refreshData]
  );

  const updateRunStatus = useCallback(
    async (runId: string, status: DelvingRun['status']): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await runQueueManager.updateRunStatus(runId, status);
        await refreshData();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update run status';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [runQueueManager, refreshData]
  );

  const clearAllRuns = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await runQueueManager.clearAllRuns();
      setRuns([]);
      setStats({
        totalRuns: 0,
        queuedRuns: 0,
        completedRuns: 0,
        bustedRuns: 0,
        activeRuns: 0,
        totalSteps: 0,
        averageSteps: 0,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to clear runs';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [runQueueManager]);

  const getRunById = useCallback(
    (runId: string): DelvingRun | undefined => {
      const run = runQueueManager.getRunById(runId);
      return run !== null ? run : undefined;
    },
    [runQueueManager]
  );

  const getQueuedRuns = useCallback((): DelvingRun[] => {
    return runQueueManager.getQueuedRuns();
  }, [runQueueManager]);

  const getActiveRuns = useCallback((): DelvingRun[] => {
    return runQueueManager.getRunsByStatus('active');
  }, [runQueueManager]);

  const getCompletedRuns = useCallback((): DelvingRun[] => {
    return runQueueManager.getRunsByStatus('completed');
  }, [runQueueManager]);

  const getBustedRuns = useCallback((): DelvingRun[] => {
    return runQueueManager.getRunsByStatus('busted');
  }, [runQueueManager]);

  const getRunStatistics = useCallback((): DelvingStats => {
    return runQueueManager.getRunStatistics();
  }, [runQueueManager]);

  const generateRunsFromStepHistory = useCallback(
    async (
      stepHistory: {
        date: string;
        steps: number;
        hasStreakBonus: boolean;
      }[]
    ): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await runQueueManager.generateRunsFromStepHistory(stepHistory);
        await refreshData();
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to generate runs from step history';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [runQueueManager, refreshData]
  );

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    runs,
    isLoading,
    error,
    stats,
    generateRun,
    removeRun,
    updateRunStatus,
    clearAllRuns,
    getRunById,
    getQueuedRuns,
    getActiveRuns,
    getCompletedRuns,
    getBustedRuns,
    getRunStatistics,
    generateRunsFromStepHistory,
    refreshData,
  };
};
