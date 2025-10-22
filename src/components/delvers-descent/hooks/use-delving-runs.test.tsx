import { act, renderHook } from '@testing-library/react';

import { getRunQueueManager } from '@/lib/delvers-descent/run-queue';
import type { DelvingRun } from '@/types/delvers-descent';

import { useDelvingRuns } from './use-delving-runs';

// Mock the run queue manager
jest.mock('@/lib/delvers-descent/run-queue', () => ({
  getRunQueueManager: jest.fn(),
}));

describe('useDelvingRuns', () => {
  let mockRunQueueManager: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock run queue manager
    mockRunQueueManager = {
      getAllRuns: jest.fn(),
      getRunStatistics: jest.fn(),
      generateRunFromSteps: jest.fn(),
      addRunToQueue: jest.fn(),
      removeRunFromQueue: jest.fn(),
      updateRunStatus: jest.fn(),
      getQueuedRuns: jest.fn(),
      getRunsByStatus: jest.fn(),
      getRunById: jest.fn(),
      hasQueuedRuns: jest.fn(),
      getOldestQueuedRun: jest.fn(),
      getNewestQueuedRun: jest.fn(),
      calculateRunEnergy: jest.fn(),
      clearAllRuns: jest.fn(),
    };

    (getRunQueueManager as jest.Mock).mockReturnValue(mockRunQueueManager);
  });

  describe('initialization', () => {
    it('should load initial runs and statistics', () => {
      const mockRuns: DelvingRun[] = [
        {
          id: '1',
          date: '2024-01-15',
          steps: 8000,
          baseEnergy: 8000,
          bonusEnergy: 0,
          totalEnergy: 8000,
          hasStreakBonus: false,
          status: 'queued',
        },
      ];

      const mockStats = {
        totalRuns: 1,
        queuedRuns: 1,
        activeRuns: 0,
        completedRuns: 0,
        bustedRuns: 0,
        totalSteps: 8000,
        totalEnergy: 8000,
        averageStepsPerRun: 8000,
        averageEnergyPerRun: 8000,
      };

      mockRunQueueManager.getAllRuns.mockReturnValue(mockRuns);
      mockRunQueueManager.getRunStatistics.mockReturnValue(mockStats);

      const { result } = renderHook(() => useDelvingRuns());

      expect(result.current.runs).toEqual(mockRuns);
      expect(result.current.stats).toEqual(mockStats);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle errors during initialization', () => {
      mockRunQueueManager.getAllRuns.mockImplementation(() => {
        throw new Error('Failed to load runs');
      });

      const { result } = renderHook(() => useDelvingRuns());

      expect(result.current.runs).toEqual([]);
      expect(result.current.stats).toBeNull();
      expect(result.current.error).toBe('Failed to load runs');
    });
  });

  describe('generateRun', () => {
    it('should generate and add a new run', async () => {
      const mockRun: DelvingRun = {
        id: '1',
        date: '2024-01-15',
        steps: 8000,
        baseEnergy: 8000,
        bonusEnergy: 0,
        totalEnergy: 8000,
        hasStreakBonus: false,
        status: 'queued',
      };

      const updatedRuns = [mockRun];
      const updatedStats = {
        totalRuns: 1,
        queuedRuns: 1,
        activeRuns: 0,
        completedRuns: 0,
        bustedRuns: 0,
        totalSteps: 8000,
        totalEnergy: 8000,
        averageStepsPerRun: 8000,
        averageEnergyPerRun: 8000,
      };

      mockRunQueueManager.generateRunFromSteps.mockReturnValue(mockRun);
      mockRunQueueManager.addRunToQueue.mockResolvedValue(undefined);
      mockRunQueueManager.getAllRuns.mockReturnValue(updatedRuns);
      mockRunQueueManager.getRunStatistics.mockReturnValue(updatedStats);

      const { result } = renderHook(() => useDelvingRuns());

      let generatedRun: DelvingRun;
      await act(async () => {
        generatedRun = await result.current.generateRun(
          '2024-01-15',
          8000,
          false
        );
      });

      expect(generatedRun!).toEqual(mockRun);
      expect(result.current.runs).toEqual(updatedRuns);
      expect(result.current.stats).toEqual(updatedStats);
      expect(mockRunQueueManager.generateRunFromSteps).toHaveBeenCalledWith(
        '2024-01-15',
        8000,
        false
      );
      expect(mockRunQueueManager.addRunToQueue).toHaveBeenCalledWith(mockRun);
    });

    it('should handle errors during run generation', async () => {
      mockRunQueueManager.generateRunFromSteps.mockImplementation(() => {
        throw new Error('Failed to generate run');
      });

      const { result } = renderHook(() => useDelvingRuns());

      await act(async () => {
        await expect(
          result.current.generateRun('2024-01-15', 8000, false)
        ).rejects.toThrow('Failed to generate run');
      });

      expect(result.current.error).toBe('Failed to generate run');
    });
  });

  describe('removeRun', () => {
    it('should remove a run from the queue', async () => {
      const updatedRuns: DelvingRun[] = [];
      const updatedStats = {
        totalRuns: 0,
        queuedRuns: 0,
        activeRuns: 0,
        completedRuns: 0,
        bustedRuns: 0,
        totalSteps: 0,
        totalEnergy: 0,
        averageStepsPerRun: 0,
        averageEnergyPerRun: 0,
      };

      mockRunQueueManager.removeRunFromQueue.mockResolvedValue(undefined);
      mockRunQueueManager.getAllRuns.mockReturnValue(updatedRuns);
      mockRunQueueManager.getRunStatistics.mockReturnValue(updatedStats);

      const { result } = renderHook(() => useDelvingRuns());

      await act(async () => {
        await result.current.removeRun('run-1');
      });

      expect(mockRunQueueManager.removeRunFromQueue).toHaveBeenCalledWith(
        'run-1'
      );
      expect(result.current.runs).toEqual(updatedRuns);
      expect(result.current.stats).toEqual(updatedStats);
    });

    it('should handle errors during run removal', async () => {
      mockRunQueueManager.removeRunFromQueue.mockRejectedValue(
        new Error('Failed to remove run')
      );

      const { result } = renderHook(() => useDelvingRuns());

      await act(async () => {
        await expect(result.current.removeRun('run-1')).rejects.toThrow(
          'Failed to remove run'
        );
      });

      expect(result.current.error).toBe('Failed to remove run');
    });
  });

  describe('updateRunStatus', () => {
    it('should update run status', async () => {
      const updatedRuns: DelvingRun[] = [
        {
          id: '1',
          date: '2024-01-15',
          steps: 8000,
          baseEnergy: 8000,
          bonusEnergy: 0,
          totalEnergy: 8000,
          hasStreakBonus: false,
          status: 'active',
        },
      ];

      const updatedStats = {
        totalRuns: 1,
        queuedRuns: 0,
        activeRuns: 1,
        completedRuns: 0,
        bustedRuns: 0,
        totalSteps: 8000,
        totalEnergy: 8000,
        averageStepsPerRun: 8000,
        averageEnergyPerRun: 8000,
      };

      mockRunQueueManager.updateRunStatus.mockResolvedValue(undefined);
      mockRunQueueManager.getAllRuns.mockReturnValue(updatedRuns);
      mockRunQueueManager.getRunStatistics.mockReturnValue(updatedStats);

      const { result } = renderHook(() => useDelvingRuns());

      await act(async () => {
        await result.current.updateRunStatus('run-1', 'active');
      });

      expect(mockRunQueueManager.updateRunStatus).toHaveBeenCalledWith(
        'run-1',
        'active'
      );
      expect(result.current.runs).toEqual(updatedRuns);
      expect(result.current.stats).toEqual(updatedStats);
    });
  });

  describe('getter functions', () => {
    it('should call appropriate getter methods', () => {
      const mockRuns: DelvingRun[] = [
        {
          id: '1',
          date: '2024-01-15',
          steps: 8000,
          baseEnergy: 8000,
          bonusEnergy: 0,
          totalEnergy: 8000,
          hasStreakBonus: false,
          status: 'queued',
        },
      ];

      mockRunQueueManager.getQueuedRuns.mockReturnValue(mockRuns);
      mockRunQueueManager.getRunsByStatus.mockReturnValue(mockRuns);
      mockRunQueueManager.getRunById.mockReturnValue(mockRuns[0]);
      mockRunQueueManager.hasQueuedRuns.mockReturnValue(true);
      mockRunQueueManager.getOldestQueuedRun.mockReturnValue(mockRuns[0]);
      mockRunQueueManager.getNewestQueuedRun.mockReturnValue(mockRuns[0]);
      mockRunQueueManager.calculateRunEnergy.mockReturnValue(8000);

      const { result } = renderHook(() => useDelvingRuns());

      expect(result.current.getQueuedRuns()).toEqual(mockRuns);
      expect(result.current.getRunById('1')).toEqual(mockRuns[0]);
    });
  });

  describe('clearAllRuns', () => {
    it('should clear all runs', async () => {
      mockRunQueueManager.clearAllRuns.mockResolvedValue(undefined);

      const { result } = renderHook(() => useDelvingRuns());

      await act(async () => {
        await result.current.clearAllRuns();
      });

      expect(mockRunQueueManager.clearAllRuns).toHaveBeenCalled();
      expect(result.current.runs).toEqual([]);
      expect(result.current.stats).toEqual({
        totalRuns: 0,
        queuedRuns: 0,
        activeRuns: 0,
        completedRuns: 0,
        bustedRuns: 0,
        totalSteps: 0,
        averageSteps: 0,
      });
    });
  });

  describe('refresh', () => {
    it('should refresh data manually', async () => {
      const mockRuns: DelvingRun[] = [
        {
          id: '1',
          date: '2024-01-15',
          steps: 8000,
          baseEnergy: 8000,
          bonusEnergy: 0,
          totalEnergy: 8000,
          hasStreakBonus: false,
          status: 'queued',
        },
      ];

      const mockStats = {
        totalRuns: 1,
        queuedRuns: 1,
        activeRuns: 0,
        completedRuns: 0,
        bustedRuns: 0,
        totalSteps: 8000,
        totalEnergy: 8000,
        averageStepsPerRun: 8000,
        averageEnergyPerRun: 8000,
      };

      mockRunQueueManager.getAllRuns.mockReturnValue(mockRuns);
      mockRunQueueManager.getRunStatistics.mockReturnValue(mockStats);

      const { result } = renderHook(() => useDelvingRuns());

      await act(async () => {
        await result.current.refreshData();
      });

      expect(result.current.runs).toEqual(mockRuns);
      expect(result.current.stats).toEqual(mockStats);
      expect(result.current.error).toBeNull();
    });
  });
});
