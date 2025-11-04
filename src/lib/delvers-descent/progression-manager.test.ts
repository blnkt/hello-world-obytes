import { getItem, setItem } from '@/lib/storage';

import {
  getProgressionManager,
  ProgressionManager,
} from './progression-manager';

// Mock storage
jest.mock('@/lib/storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockGetItem = getItem as jest.MockedFunction<typeof getItem>;
const mockSetItem = setItem as jest.MockedFunction<typeof setItem>;

// Helper to reset singleton
function resetProgressionManager() {
  // Access the module's internal singleton
  const module = require('./progression-manager');
  module.progressionManagerInstance = null;
}

describe('ProgressionManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItem.mockReturnValue(null);
    mockSetItem.mockResolvedValue(undefined);
    // Reset singleton instance before each test
    resetProgressionManager();
  });

  afterEach(() => {
    jest.clearAllMocks();
    resetProgressionManager();
  });

  describe('initialization', () => {
    it('should initialize with default values when no saved data exists', () => {
      mockGetItem.mockReturnValue(null);
      const manager = getProgressionManager();
      const data = manager.getProgressionData();

      expect(data.allTimeDeepestDepth).toBe(0);
      expect(data.totalRunsCompleted).toBe(0);
      expect(data.totalRunsBusted).toBe(0);
      expect(data.totalRunsAttempted).toBe(0);
    });

    it('should load saved progression data', () => {
      mockGetItem.mockReturnValue({
        allTimeDeepestDepth: 5,
        totalRunsCompleted: 10,
        totalRunsBusted: 3,
        totalRunsAttempted: 13,
      });

      resetProgressionManager();
      const newManager = new ProgressionManager();
      const data = newManager.getProgressionData();

      expect(data.allTimeDeepestDepth).toBe(5);
      expect(data.totalRunsCompleted).toBe(10);
      expect(data.totalRunsBusted).toBe(3);
      expect(data.totalRunsAttempted).toBe(13);
    });

    it('should handle partial saved data gracefully', () => {
      mockGetItem.mockReturnValue({
        allTimeDeepestDepth: 3,
        // Missing other fields
      });

      resetProgressionManager();
      const newManager = new ProgressionManager();
      const data = newManager.getProgressionData();

      expect(data.allTimeDeepestDepth).toBe(3);
      expect(data.totalRunsCompleted).toBe(0);
      expect(data.totalRunsBusted).toBe(0);
      expect(data.totalRunsAttempted).toBe(0);
    });
  });

  describe('updateDeepestDepth', () => {
    it('should update depth when new depth is greater', async () => {
      const manager = getProgressionManager();
      await manager.updateDeepestDepth(5);

      expect(mockSetItem).toHaveBeenCalled();
      const data = manager.getProgressionData();
      expect(data.allTimeDeepestDepth).toBe(5);
    });

    it('should not update depth when new depth is less', async () => {
      const manager = getProgressionManager();
      await manager.updateDeepestDepth(5);
      jest.clearAllMocks();

      await manager.updateDeepestDepth(3);

      expect(mockSetItem).not.toHaveBeenCalled();
      const data = manager.getProgressionData();
      expect(data.allTimeDeepestDepth).toBe(5);
    });

    it('should not update depth when new depth is equal', async () => {
      const manager = getProgressionManager();
      await manager.updateDeepestDepth(5);
      jest.clearAllMocks();

      await manager.updateDeepestDepth(5);

      expect(mockSetItem).not.toHaveBeenCalled();
      const data = manager.getProgressionData();
      expect(data.allTimeDeepestDepth).toBe(5);
    });
  });

  describe('incrementCompletedRuns', () => {
    it('should increment completed runs count', async () => {
      const manager = getProgressionManager();
      await manager.incrementCompletedRuns();

      expect(mockSetItem).toHaveBeenCalled();
      const data = manager.getProgressionData();
      expect(data.totalRunsCompleted).toBe(1);
      expect(data.totalRunsAttempted).toBe(1);
    });

    it('should increment multiple times', async () => {
      const manager = getProgressionManager();
      await manager.incrementCompletedRuns();
      await manager.incrementCompletedRuns();
      await manager.incrementCompletedRuns();

      const data = manager.getProgressionData();
      expect(data.totalRunsCompleted).toBe(3);
      expect(data.totalRunsAttempted).toBe(3);
    });
  });

  describe('incrementBustedRuns', () => {
    it('should increment busted runs count', async () => {
      const manager = getProgressionManager();
      await manager.incrementBustedRuns();

      expect(mockSetItem).toHaveBeenCalled();
      const data = manager.getProgressionData();
      expect(data.totalRunsBusted).toBe(1);
      expect(data.totalRunsAttempted).toBe(1);
    });

    it('should increment multiple times', async () => {
      const manager = getProgressionManager();
      await manager.incrementBustedRuns();
      await manager.incrementBustedRuns();

      const data = manager.getProgressionData();
      expect(data.totalRunsBusted).toBe(2);
      expect(data.totalRunsAttempted).toBe(2);
    });
  });

  describe('processRunCompletion', () => {
    it('should update depth and increment completed count', async () => {
      const manager = getProgressionManager();
      await manager.processRunCompletion(7);

      const data = manager.getProgressionData();
      expect(data.allTimeDeepestDepth).toBe(7);
      expect(data.totalRunsCompleted).toBe(1);
      expect(data.totalRunsAttempted).toBe(1);
    });

    it('should update depth only if greater than current', async () => {
      const manager = getProgressionManager();
      await manager.processRunCompletion(5);
      jest.clearAllMocks();

      await manager.processRunCompletion(3);

      const data = manager.getProgressionData();
      expect(data.allTimeDeepestDepth).toBe(5); // Should remain 5
      expect(data.totalRunsCompleted).toBe(2);
    });
  });

  describe('processRunBust', () => {
    it('should update depth and increment busted count', async () => {
      const manager = getProgressionManager();
      await manager.processRunBust(4);

      const data = manager.getProgressionData();
      expect(data.allTimeDeepestDepth).toBe(4);
      expect(data.totalRunsBusted).toBe(1);
      expect(data.totalRunsAttempted).toBe(1);
    });

    it('should update depth only if greater than current', async () => {
      const manager = getProgressionManager();
      await manager.processRunBust(5);
      jest.clearAllMocks();

      await manager.processRunBust(2);

      const data = manager.getProgressionData();
      expect(data.allTimeDeepestDepth).toBe(5); // Should remain 5
      expect(data.totalRunsBusted).toBe(2);
    });
  });

  describe('totalRunsAttempted calculation', () => {
    it('should calculate totalRunsAttempted as sum of completed and busted', async () => {
      const manager = getProgressionManager();
      await manager.incrementCompletedRuns();
      await manager.incrementCompletedRuns();
      await manager.incrementBustedRuns();

      const data = manager.getProgressionData();
      expect(data.totalRunsCompleted).toBe(2);
      expect(data.totalRunsBusted).toBe(1);
      expect(data.totalRunsAttempted).toBe(3);
    });
  });

  describe('persistence', () => {
    it('should persist data across manager instances', async () => {
      const manager = getProgressionManager();
      await manager.processRunCompletion(10);
      await manager.incrementBustedRuns();

      // Verify data was saved
      expect(mockSetItem).toHaveBeenCalled();

      // Simulate app restart by checking what was saved
      const lastCall =
        mockSetItem.mock.calls[mockSetItem.mock.calls.length - 1];
      const savedData = lastCall[1] as {
        allTimeDeepestDepth: number;
        totalRunsCompleted: number;
        totalRunsBusted: number;
        totalRunsAttempted: number;
      };
      expect(savedData.allTimeDeepestDepth).toBe(10);
      expect(savedData.totalRunsCompleted).toBe(1);
      expect(savedData.totalRunsBusted).toBe(1);
      expect(savedData.totalRunsAttempted).toBe(2);
    });
  });

  describe('getProgressionData', () => {
    it('should return a copy of progression data', () => {
      const manager = getProgressionManager();
      const data1 = manager.getProgressionData();
      const data2 = manager.getProgressionData();

      expect(data1).not.toBe(data2); // Different objects
      expect(data1).toEqual(data2); // Same values
    });

    it('should recalculate totalRunsAttempted', async () => {
      const manager = getProgressionManager();
      await manager.incrementCompletedRuns();
      await manager.incrementBustedRuns();

      const data = manager.getProgressionData();
      expect(data.totalRunsCompleted).toBe(1);
      expect(data.totalRunsBusted).toBe(1);
      expect(data.totalRunsAttempted).toBe(2);
    });
  });
});
