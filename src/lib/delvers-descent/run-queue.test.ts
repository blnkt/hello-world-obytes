import { getRunQueueManager, RunQueueManager } from './run-queue';

// Mock storage
jest.mock('@/lib/storage', () => ({
  storage: {
    getString: jest.fn(),
    set: jest.fn(),
  },
}));

// Mock progression manager
const mockProcessRunCompletion = jest.fn().mockResolvedValue(undefined);
const mockProcessRunBust = jest.fn().mockResolvedValue(undefined);
const mockGetProgressionData = jest.fn().mockReturnValue({
  allTimeDeepestDepth: 0,
  totalRunsCompleted: 0,
  totalRunsBusted: 0,
  totalRunsAttempted: 0,
});

jest.mock('./progression-manager', () => ({
  getProgressionManager: jest.fn(() => ({
    processRunCompletion: mockProcessRunCompletion,
    processRunBust: mockProcessRunBust,
    getProgressionData: mockGetProgressionData,
  })),
}));

describe('RunQueueManager', () => {
  let manager: RunQueueManager;
  let mockStorage: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Get mock storage
    const { storage } = require('@/lib/storage');
    mockStorage = storage;

    // Mock empty storage by default
    mockStorage.getString.mockReturnValue(null);
    mockStorage.set.mockImplementation(() => {}); // Default successful save

    // Reset progression manager mocks
    mockGetProgressionData.mockReturnValue({
      allTimeDeepestDepth: 0,
      totalRunsCompleted: 0,
      totalRunsBusted: 0,
      totalRunsAttempted: 0,
    });

    // Create new manager instance
    manager = new RunQueueManager();
  });

  describe('generateRunFromSteps', () => {
    it('should generate a run with correct energy calculation', () => {
      const run = manager.generateRunFromSteps('2024-01-15', 8000);

      expect(run.id).toMatch(/^run-2024-01-15-\d+$/);
      expect(run.date).toBe('2024-01-15');
      expect(run.steps).toBe(8000);
      expect(run.baseEnergy).toBe(8000);
      expect(run.bonusEnergy).toBe(0);
      expect(run.totalEnergy).toBe(8000);
      expect(run.hasStreakBonus).toBe(false);
      expect(run.status).toBe('queued');
    });

    it('should apply streak bonus for 10,000+ steps', () => {
      const run = manager.generateRunFromSteps('2024-01-15', 12000);

      expect(run.steps).toBe(12000);
      expect(run.baseEnergy).toBe(12000);
      expect(run.bonusEnergy).toBe(2400); // 20% of 12000
      expect(run.totalEnergy).toBe(14400);
      expect(run.hasStreakBonus).toBe(true);
    });

    it('should handle edge case of exactly 10,000 steps', () => {
      const run = manager.generateRunFromSteps('2024-01-15', 10000);

      expect(run.steps).toBe(10000);
      expect(run.baseEnergy).toBe(10000);
      expect(run.bonusEnergy).toBe(2000); // 20% of 10000
      expect(run.totalEnergy).toBe(12000);
      expect(run.hasStreakBonus).toBe(true);
    });

    it('should handle zero steps', () => {
      const run = manager.generateRunFromSteps('2024-01-15', 0);

      expect(run.steps).toBe(0);
      expect(run.baseEnergy).toBe(0);
      expect(run.bonusEnergy).toBe(0);
      expect(run.totalEnergy).toBe(0);
      expect(run.hasStreakBonus).toBe(false);
    });
  });

  describe('calculateRunEnergy', () => {
    it('should calculate energy without streak bonus', () => {
      const energy = manager.calculateRunEnergy(5000, false);
      expect(energy).toBe(5000);
    });

    it('should calculate energy with streak bonus', () => {
      const energy = manager.calculateRunEnergy(10000, true);
      expect(energy).toBe(12000); // 10000 + 20%
    });

    it('should handle fractional bonus energy correctly', () => {
      const energy = manager.calculateRunEnergy(10001, true);
      expect(energy).toBe(12001); // 10001 + Math.floor(10001 * 0.2) = 10001 + 2000
    });
  });

  describe('addRunToQueue', () => {
    it('should add a run to the queue', async () => {
      const run = manager.generateRunFromSteps('2024-01-15', 8000);

      await manager.addRunToQueue(run);

      expect(mockStorage.set).toHaveBeenCalledWith(
        'delvingRuns',
        JSON.stringify([run])
      );
    });

    it('should throw error if run already exists for date', async () => {
      const run1 = manager.generateRunFromSteps('2024-01-15', 8000);
      const run2 = manager.generateRunFromSteps('2024-01-15', 9000);

      await manager.addRunToQueue(run1);

      await expect(manager.addRunToQueue(run2)).rejects.toThrow(
        'Run already exists for date 2024-01-15'
      );
    });

    it('should handle storage errors', async () => {
      const run = manager.generateRunFromSteps('2024-01-15', 8000);
      mockStorage.set.mockImplementation(() => {
        throw new Error('Storage error');
      });

      await expect(manager.addRunToQueue(run)).rejects.toThrow('Storage error');
    });
  });

  describe('removeRunFromQueue', () => {
    it('should remove a run from the queue', async () => {
      const run = manager.generateRunFromSteps('2024-01-15', 8000);
      await manager.addRunToQueue(run);

      await manager.removeRunFromQueue(run.id);

      expect(mockStorage.set).toHaveBeenCalledWith(
        'delvingRuns',
        JSON.stringify([])
      );
    });

    it('should throw error if run not found', async () => {
      await expect(
        manager.removeRunFromQueue('nonexistent-id')
      ).rejects.toThrow('Run with id nonexistent-id not found');
    });
  });

  describe('getQueuedRuns', () => {
    it('should return only queued runs', async () => {
      const run1 = manager.generateRunFromSteps('2024-01-15', 8000);
      const run2 = manager.generateRunFromSteps('2024-01-16', 9000);

      await manager.addRunToQueue(run1);
      await manager.addRunToQueue(run2);

      // Update one run to completed
      await manager.updateRunStatus(run1.id, 'completed');

      const queuedRuns = manager.getQueuedRuns();
      expect(queuedRuns).toHaveLength(1);
      expect(queuedRuns[0].id).toBe(run2.id);
    });

    it('should return empty array when no queued runs', () => {
      const queuedRuns = manager.getQueuedRuns();
      expect(queuedRuns).toEqual([]);
    });
  });

  describe('getAllRuns', () => {
    it('should return all runs regardless of status', async () => {
      const run1 = manager.generateRunFromSteps('2024-01-15', 8000);
      const run2 = manager.generateRunFromSteps('2024-01-16', 9000);

      await manager.addRunToQueue(run1);
      await manager.addRunToQueue(run2);

      // Completed runs are removed from queue, so only run2 should remain
      await manager.updateRunStatus(run1.id, 'completed');

      const allRuns = manager.getAllRuns();
      expect(allRuns).toHaveLength(1);
      expect(allRuns[0].id).toBe(run2.id);
    });
  });

  describe('getRunById', () => {
    it('should return run by ID', async () => {
      const run = manager.generateRunFromSteps('2024-01-15', 8000);
      await manager.addRunToQueue(run);

      const foundRun = manager.getRunById(run.id);
      expect(foundRun).toEqual(run);
    });

    it('should return null for non-existent run', () => {
      const foundRun = manager.getRunById('nonexistent-id');
      expect(foundRun).toBeNull();
    });
  });

  describe('getRunsByStatus', () => {
    it('should return runs filtered by status', async () => {
      const run1 = manager.generateRunFromSteps('2024-01-15', 8000);
      const run2 = manager.generateRunFromSteps('2024-01-16', 9000);
      const run3 = manager.generateRunFromSteps('2024-01-17', 10000);

      await manager.addRunToQueue(run1);
      await manager.addRunToQueue(run2);
      await manager.addRunToQueue(run3);

      await manager.updateRunStatus(run1.id, 'completed');
      await manager.updateRunStatus(run2.id, 'busted');

      // Completed and busted runs are removed from queue
      const completedRuns = manager.getRunsByStatus('completed');
      const bustedRuns = manager.getRunsByStatus('busted');
      const queuedRuns = manager.getRunsByStatus('queued');

      expect(completedRuns).toHaveLength(0);
      expect(bustedRuns).toHaveLength(0);
      expect(queuedRuns).toHaveLength(1);
    });
  });

  describe('updateRunStatus', () => {
    it('should update run status', async () => {
      const run = manager.generateRunFromSteps('2024-01-15', 8000);
      await manager.addRunToQueue(run);

      await manager.updateRunStatus(run.id, 'active');

      const updatedRun = manager.getRunById(run.id);
      expect(updatedRun?.status).toBe('active');
    });

    it('should throw error if run not found', async () => {
      await expect(
        manager.updateRunStatus('nonexistent-id', 'active')
      ).rejects.toThrow('Run with id nonexistent-id not found');
    });
  });

  describe('generateRunsFromStepHistory', () => {
    it('should generate runs from step history', async () => {
      const stepHistory = [
        { date: '2024-01-15', steps: 8000 },
        { date: '2024-01-16', steps: 12000 },
        { date: '2024-01-17', steps: 5000 },
      ];

      await manager.generateRunsFromStepHistory(stepHistory);

      const allRuns = manager.getAllRuns();
      expect(allRuns).toHaveLength(3);

      expect(allRuns[0].date).toBe('2024-01-15');
      expect(allRuns[0].steps).toBe(8000);
      expect(allRuns[0].hasStreakBonus).toBe(false);

      expect(allRuns[1].date).toBe('2024-01-16');
      expect(allRuns[1].steps).toBe(12000);
      expect(allRuns[1].hasStreakBonus).toBe(true);

      expect(allRuns[2].date).toBe('2024-01-17');
      expect(allRuns[2].steps).toBe(5000);
      expect(allRuns[2].hasStreakBonus).toBe(false);
    });

    it('should skip dates that already have runs', async () => {
      const run = manager.generateRunFromSteps('2024-01-15', 8000);
      await manager.addRunToQueue(run);

      const stepHistory = [
        { date: '2024-01-15', steps: 9000 }, // Should be skipped
        { date: '2024-01-16', steps: 12000 }, // Should be added
      ];

      await manager.generateRunsFromStepHistory(stepHistory);

      const allRuns = manager.getAllRuns();
      expect(allRuns).toHaveLength(2);

      // Original run should be unchanged
      const originalRun = allRuns.find((r) => r.date === '2024-01-15');
      expect(originalRun?.steps).toBe(8000);

      // New run should be added
      const newRun = allRuns.find((r) => r.date === '2024-01-16');
      expect(newRun?.steps).toBe(12000);
    });
  });

  describe('clearAllRuns', () => {
    it('should clear all runs', async () => {
      const run1 = manager.generateRunFromSteps('2024-01-15', 8000);
      const run2 = manager.generateRunFromSteps('2024-01-16', 9000);

      await manager.addRunToQueue(run1);
      await manager.addRunToQueue(run2);

      await manager.clearAllRuns();

      expect(manager.getAllRuns()).toEqual([]);
      expect(mockStorage.set).toHaveBeenCalledWith(
        'delvingRuns',
        JSON.stringify([])
      );
    });
  });

  describe('getRunStatistics', () => {
    it('should return correct statistics', async () => {
      const run1 = manager.generateRunFromSteps('2024-01-15', 8000);
      const run2 = manager.generateRunFromSteps('2024-01-16', 12000);
      const run3 = manager.generateRunFromSteps('2024-01-17', 5000);

      await manager.addRunToQueue(run1);
      await manager.addRunToQueue(run2);
      await manager.addRunToQueue(run3);

      // Update progression data mock to reflect completed/busted runs
      mockGetProgressionData.mockReturnValue({
        allTimeDeepestDepth: 5,
        totalRunsCompleted: 1,
        totalRunsBusted: 1,
        totalRunsAttempted: 2,
      });

      await manager.updateRunStatus(run1.id, 'completed');
      await manager.updateRunStatus(run2.id, 'busted');

      const stats = manager.getRunStatistics();

      // Total runs includes queued (1) + completed (1) + busted (1) from progression data
      expect(stats.totalRuns).toBe(3);
      expect(stats.queuedRuns).toBe(1);
      // Completed/busted counts come from progression data, not queue
      expect(stats.completedRuns).toBe(1);
      expect(stats.bustedRuns).toBe(1);
      expect(stats.activeRuns).toBe(0);
      // Only queued run's steps are counted (run3)
      expect(stats.totalSteps).toBe(5000);
      expect(stats.averageSteps).toBe(5000);
    });

    it('should handle empty runs', () => {
      const stats = manager.getRunStatistics();

      expect(stats.totalRuns).toBe(0);
      expect(stats.queuedRuns).toBe(0);
      expect(stats.completedRuns).toBe(0);
      expect(stats.bustedRuns).toBe(0);
      expect(stats.activeRuns).toBe(0);
      expect(stats.totalSteps).toBe(0);
      expect(stats.averageSteps).toBe(0);
    });
  });

  describe('hasQueuedRuns', () => {
    it('should return true when there are queued runs', async () => {
      const run = manager.generateRunFromSteps('2024-01-15', 8000);
      await manager.addRunToQueue(run);

      expect(manager.hasQueuedRuns()).toBe(true);
    });

    it('should return false when there are no queued runs', () => {
      expect(manager.hasQueuedRuns()).toBe(false);
    });

    it('should return false when all runs are completed', async () => {
      const run = manager.generateRunFromSteps('2024-01-15', 8000);
      await manager.addRunToQueue(run);
      await manager.updateRunStatus(run.id, 'completed');

      expect(manager.hasQueuedRuns()).toBe(false);
    });
  });

  describe('getOldestQueuedRun', () => {
    it('should return oldest queued run', async () => {
      const run1 = manager.generateRunFromSteps('2024-01-15', 8000);
      const run2 = manager.generateRunFromSteps('2024-01-16', 9000);
      const run3 = manager.generateRunFromSteps('2024-01-17', 10000);

      await manager.addRunToQueue(run3);
      await manager.addRunToQueue(run1);
      await manager.addRunToQueue(run2);

      const oldestRun = manager.getOldestQueuedRun();
      expect(oldestRun?.date).toBe('2024-01-15');
    });

    it('should return null when no queued runs', () => {
      const oldestRun = manager.getOldestQueuedRun();
      expect(oldestRun).toBeNull();
    });
  });

  describe('getNewestQueuedRun', () => {
    it('should return newest queued run', async () => {
      const run1 = manager.generateRunFromSteps('2024-01-15', 8000);
      const run2 = manager.generateRunFromSteps('2024-01-16', 9000);
      const run3 = manager.generateRunFromSteps('2024-01-17', 10000);

      await manager.addRunToQueue(run1);
      await manager.addRunToQueue(run2);
      await manager.addRunToQueue(run3);

      const newestRun = manager.getNewestQueuedRun();
      expect(newestRun?.date).toBe('2024-01-17');
    });

    it('should return null when no queued runs', () => {
      const newestRun = manager.getNewestQueuedRun();
      expect(newestRun).toBeNull();
    });
  });

  describe('storage integration', () => {
    it('should load runs from storage on initialization', () => {
      const existingRuns = [
        {
          id: 'run-1',
          date: '2024-01-15',
          steps: 8000,
          baseEnergy: 8000,
          bonusEnergy: 0,
          totalEnergy: 8000,
          hasStreakBonus: false,
          status: 'queued' as const,
        },
      ];

      mockStorage.getString.mockReturnValue(JSON.stringify(existingRuns));

      const newManager = new RunQueueManager();
      const runs = newManager.getAllRuns();

      expect(runs).toEqual(existingRuns);
    });

    it('should handle corrupted storage data', () => {
      mockStorage.getString.mockReturnValue('invalid json');

      const newManager = new RunQueueManager();
      const runs = newManager.getAllRuns();

      expect(runs).toEqual([]);
    });

    it('should handle null storage data', () => {
      mockStorage.getString.mockReturnValue(null);

      const newManager = new RunQueueManager();
      const runs = newManager.getAllRuns();

      expect(runs).toEqual([]);
    });
  });
});

describe('Singleton getRunQueueManager', () => {
  it('should return the same instance', () => {
    const manager1 = getRunQueueManager();
    const manager2 = getRunQueueManager();

    expect(manager1).toBe(manager2);
  });
});
