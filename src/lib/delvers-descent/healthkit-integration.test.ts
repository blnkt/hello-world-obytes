import type { DailyStepsData } from './healthkit-integration';
import {
  calculateRunEnergyFromSteps,
  calculateStreakBonusData,
  calculateStreakBonusEligibility,
  formatDateForDelving,
  getAllQueuedRuns,
  getDailyStepsForDate,
  getDailyStepsForDateRange,
  getDaysBetweenDates,
  getDelvingRunStatistics,
  getMostRecentQueuedRun,
  getOldestQueuedRun,
  getTodayStepsData,
  hasQueuedDelvingRuns,
  hasQueuedRunForDate,
  isDateInPast,
  syncHealthKitWithDelvingRuns,
  validateDailyStepsData,
} from './healthkit-integration';
import { getRunQueueManager } from './run-queue';

// Mock the run queue manager
jest.mock('./run-queue', () => ({
  getRunQueueManager: jest.fn(),
}));

describe("HealthKit Integration for Delver's Descent", () => {
  let mockRunQueueManager: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock run queue manager
    mockRunQueueManager = {
      calculateRunEnergy: jest.fn(),
      generateRunsFromStepHistory: jest.fn(),
      getAllRuns: jest.fn(),
      getQueuedRuns: jest.fn(),
      getNewestQueuedRun: jest.fn(),
      getOldestQueuedRun: jest.fn(),
      hasQueuedRuns: jest.fn(),
      getRunStatistics: jest.fn(),
    };

    (getRunQueueManager as jest.Mock).mockReturnValue(mockRunQueueManager);
  });

  describe('calculateStreakBonusEligibility', () => {
    it('should return true for 10,000+ steps', () => {
      expect(calculateStreakBonusEligibility(10000)).toBe(true);
      expect(calculateStreakBonusEligibility(15000)).toBe(true);
      expect(calculateStreakBonusEligibility(20000)).toBe(true);
    });

    it('should return false for less than 10,000 steps', () => {
      expect(calculateStreakBonusEligibility(9999)).toBe(false);
      expect(calculateStreakBonusEligibility(5000)).toBe(false);
      expect(calculateStreakBonusEligibility(0)).toBe(false);
    });
  });

  describe('formatDateForDelving', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      expect(formatDateForDelving(date)).toBe('2024-01-15');
    });

    it('should handle single digit months and days', () => {
      const date = new Date('2024-01-05');
      expect(formatDateForDelving(date)).toBe('2024-01-05');
    });

    it('should handle different years', () => {
      const date = new Date('2023-12-31');
      expect(formatDateForDelving(date)).toBe('2023-12-31');
    });
  });

  describe('getDailyStepsForDate', () => {
    const stepsByDay = [
      { date: new Date('2024-01-15'), steps: 8000 },
      { date: new Date('2024-01-16'), steps: 12000 },
      { date: new Date('2024-01-17'), steps: 5000 },
    ];

    it('should return correct data for existing date', () => {
      const result = getDailyStepsForDate('2024-01-16', stepsByDay);
      expect(result).toEqual({
        date: '2024-01-16',
        steps: 12000,
        hasStreakBonus: true,
      });
    });

    it('should return null for non-existent date', () => {
      const result = getDailyStepsForDate('2024-01-20', stepsByDay);
      expect(result).toBeNull();
    });

    it('should calculate streak bonus correctly', () => {
      const result1 = getDailyStepsForDate('2024-01-15', stepsByDay);
      expect(result1?.hasStreakBonus).toBe(false);

      const result2 = getDailyStepsForDate('2024-01-16', stepsByDay);
      expect(result2?.hasStreakBonus).toBe(true);
    });
  });

  describe('calculateStreakBonusData', () => {
    const stepsByDay = [
      { date: new Date('2024-01-15'), steps: 8000 },
      { date: new Date('2024-01-16'), steps: 12000 },
      { date: new Date('2024-01-17'), steps: 5000 },
    ];

    it('should calculate streak bonus data correctly', () => {
      const result = calculateStreakBonusData(stepsByDay);
      expect(result).toEqual([
        {
          date: '2024-01-15',
          steps: 8000,
          qualifiesForBonus: false,
        },
        {
          date: '2024-01-16',
          steps: 12000,
          qualifiesForBonus: true,
        },
        {
          date: '2024-01-17',
          steps: 5000,
          qualifiesForBonus: false,
        },
      ]);
    });
  });

  describe('getTodayStepsData', () => {
    it("should return today's data when available", () => {
      const today = new Date();
      const todayStr = formatDateForDelving(today);
      const stepsByDay = [{ date: today, steps: 10000 }];

      const result = getTodayStepsData(stepsByDay);
      expect(result).toEqual({
        date: todayStr,
        steps: 10000,
        hasStreakBonus: true,
      });
    });

    it('should return null when no data for today', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const stepsByDay = [{ date: yesterday, steps: 5000 }];

      const result = getTodayStepsData(stepsByDay);
      expect(result).toBeNull();
    });
  });

  describe('hasQueuedRunForDate', () => {
    it('should return true when run exists for date', () => {
      mockRunQueueManager.getAllRuns.mockReturnValue([
        { id: '1', date: '2024-01-15', status: 'queued' },
        { id: '2', date: '2024-01-16', status: 'completed' },
      ]);

      expect(hasQueuedRunForDate('2024-01-15')).toBe(true);
    });

    it('should return false when no run exists for date', () => {
      mockRunQueueManager.getAllRuns.mockReturnValue([
        { id: '1', date: '2024-01-15', status: 'queued' },
      ]);

      expect(hasQueuedRunForDate('2024-01-20')).toBe(false);
    });
  });

  describe('getMostRecentQueuedRun', () => {
    it('should return newest queued run', () => {
      const mockRun = { id: '2', date: '2024-01-16', status: 'queued' };
      mockRunQueueManager.getNewestQueuedRun.mockReturnValue(mockRun);

      const result = getMostRecentQueuedRun();
      expect(result).toBe(mockRun);
    });

    it('should return null when no queued runs', () => {
      mockRunQueueManager.getNewestQueuedRun.mockReturnValue(null);

      const result = getMostRecentQueuedRun();
      expect(result).toBeNull();
    });
  });

  describe('getOldestQueuedRun', () => {
    it('should return oldest queued run', () => {
      const mockRun = { id: '1', date: '2024-01-15', status: 'queued' };
      mockRunQueueManager.getOldestQueuedRun.mockReturnValue(mockRun);

      const result = getOldestQueuedRun();
      expect(result).toBe(mockRun);
    });

    it('should return null when no queued runs', () => {
      mockRunQueueManager.getOldestQueuedRun.mockReturnValue(null);

      const result = getOldestQueuedRun();
      expect(result).toBeNull();
    });
  });

  describe('getAllQueuedRuns', () => {
    it('should return all queued runs', () => {
      const mockRuns = [
        { id: '1', date: '2024-01-15', status: 'queued' },
        { id: '2', date: '2024-01-16', status: 'queued' },
      ];
      mockRunQueueManager.getQueuedRuns.mockReturnValue(mockRuns);

      const result = getAllQueuedRuns();
      expect(result).toBe(mockRuns);
    });
  });

  describe('getDelvingRunStatistics', () => {
    it('should return run statistics', () => {
      const mockStats = {
        totalRuns: 5,
        queuedRuns: 2,
        completedRuns: 3,
      };
      mockRunQueueManager.getRunStatistics.mockReturnValue(mockStats);

      const result = getDelvingRunStatistics();
      expect(result).toBe(mockStats);
    });
  });

  describe('hasQueuedDelvingRuns', () => {
    it('should return true when there are queued runs', () => {
      mockRunQueueManager.hasQueuedRuns.mockReturnValue(true);

      expect(hasQueuedDelvingRuns()).toBe(true);
    });

    it('should return false when there are no queued runs', () => {
      mockRunQueueManager.hasQueuedRuns.mockReturnValue(false);

      expect(hasQueuedDelvingRuns()).toBe(false);
    });
  });

  describe('syncHealthKitWithDelvingRuns', () => {
    it('should sync HealthKit data with delving runs', async () => {
      const stepsByDay = [
        { date: new Date('2024-01-15'), steps: 8000 },
        { date: new Date('2024-01-16'), steps: 12000 },
      ];

      mockRunQueueManager.generateRunsFromStepHistory.mockResolvedValue(
        undefined
      );

      await syncHealthKitWithDelvingRuns(stepsByDay);

      expect(
        mockRunQueueManager.generateRunsFromStepHistory
      ).toHaveBeenCalledWith(
        [
          { date: '2024-01-15', steps: 8000 },
          { date: '2024-01-16', steps: 12000 },
        ],
        new Set(['2024-01-16']) // Only 12000 steps qualifies for bonus
      );
    });

    it('should handle errors during sync', async () => {
      const stepsByDay = [{ date: new Date('2024-01-15'), steps: 8000 }];

      mockRunQueueManager.generateRunsFromStepHistory.mockRejectedValue(
        new Error('Sync failed')
      );

      await expect(syncHealthKitWithDelvingRuns(stepsByDay)).rejects.toThrow(
        'Sync failed'
      );
    });
  });

  describe('calculateRunEnergyFromSteps', () => {
    it('should calculate energy correctly', () => {
      mockRunQueueManager.calculateRunEnergy.mockReturnValue(12000);

      const result = calculateRunEnergyFromSteps(10000, true);
      expect(result).toBe(12000);
      expect(mockRunQueueManager.calculateRunEnergy).toHaveBeenCalledWith(
        10000,
        true
      );
    });
  });

  describe('validateDailyStepsData', () => {
    it('should validate correct data', () => {
      const validData: DailyStepsData = {
        date: '2024-01-15',
        steps: 8000,
        hasStreakBonus: false,
      };

      expect(validateDailyStepsData(validData)).toBe(true);
    });

    it('should reject invalid data', () => {
      expect(validateDailyStepsData(null as any)).toBe(false);
      expect(validateDailyStepsData(undefined as any)).toBe(false);
      expect(validateDailyStepsData({} as any)).toBe(false);
      expect(validateDailyStepsData({ date: 'invalid' } as any)).toBe(false);
      expect(
        validateDailyStepsData({ date: '2024-01-15', steps: -1 } as any)
      ).toBe(false);
      expect(
        validateDailyStepsData({
          date: '2024-01-15',
          steps: 1000,
          hasStreakBonus: 'true',
        } as any)
      ).toBe(false);
      expect(
        validateDailyStepsData({
          date: '2024/01/15',
          steps: 1000,
          hasStreakBonus: true,
        } as any)
      ).toBe(false);
    });
  });

  describe('getDailyStepsForDateRange', () => {
    const stepsByDay = [
      { date: new Date('2024-01-15'), steps: 8000 },
      { date: new Date('2024-01-16'), steps: 12000 },
      { date: new Date('2024-01-18'), steps: 5000 },
    ];

    it('should return data for date range', () => {
      const result = getDailyStepsForDateRange(
        '2024-01-15',
        '2024-01-17',
        stepsByDay
      );
      expect(result).toEqual([
        {
          date: '2024-01-15',
          steps: 8000,
          hasStreakBonus: false,
        },
        {
          date: '2024-01-16',
          steps: 12000,
          hasStreakBonus: true,
        },
      ]);
    });

    it('should handle empty range', () => {
      const result = getDailyStepsForDateRange(
        '2024-01-20',
        '2024-01-22',
        stepsByDay
      );
      expect(result).toEqual([]);
    });
  });

  describe('isDateInPast', () => {
    it('should correctly identify past dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = formatDateForDelving(yesterday);

      expect(isDateInPast(yesterdayStr)).toBe(true);
    });

    it('should correctly identify today as not past', () => {
      const today = new Date();
      const todayStr = formatDateForDelving(today);

      expect(isDateInPast(todayStr)).toBe(false);
    });

    it('should correctly identify future dates as not past', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = formatDateForDelving(tomorrow);

      expect(isDateInPast(tomorrowStr)).toBe(false);
    });
  });

  describe('getDaysBetweenDates', () => {
    it('should calculate days between dates correctly', () => {
      expect(getDaysBetweenDates('2024-01-01', '2024-01-03')).toBe(2);
      expect(getDaysBetweenDates('2024-01-15', '2024-01-15')).toBe(0);
      expect(getDaysBetweenDates('2024-01-01', '2024-01-31')).toBe(30);
    });

    it('should handle reverse order dates', () => {
      expect(getDaysBetweenDates('2024-01-03', '2024-01-01')).toBe(2);
    });
  });
});
