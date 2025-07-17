import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';

import {
  useStepCountAsExperience,
  getManualEntryMode,
  setManualEntryMode,
} from '../health';
import {
  getManualStepsByDay,
  setManualStepsByDay,
  clearManualStepsByDay,
  setManualStepEntry,
  getStepsByDay,
  setStepsByDay,
  clearStepsByDay,
} from '../storage';

// Mock the HealthKit functions
jest.mock('@kingstinct/react-native-healthkit', () => ({
  default: {
    getMostRecentQuantitySample: jest.fn(),
    getStatisticsForQuantity: jest.fn(),
    queryStatisticsForQuantity: jest.fn().mockResolvedValue([]),
  },
  getMostRecentQuantitySample: jest.fn(),
  getStatisticsForQuantity: jest.fn(),
  queryStatisticsForQuantity: jest.fn().mockResolvedValue([]),
  HKQuantityTypeIdentifier: {
    stepCount: 'stepCount',
  },
  HKUnits: {
    Count: 'count',
  },
  HKStatisticsOptions: {
    cumulativeSum: 'cumulativeSum',
  },
}));

// Mock the getStepsGroupedByDay function to return more reasonable data
jest.mock('../health', () => {
  const originalModule = jest.requireActual('../health');
  return {
    ...originalModule,
    getStepsGroupedByDay: jest.fn().mockImplementation(async (startDate: Date, endDate: Date) => {
      // Return a reasonable number of entries based on the date range
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const results = [];
      
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        results.push({
          date,
          steps: 0, // Default to 0 steps for HealthKit data in tests
        });
      }
      
      return results;
    }),
  };
});

// Mock MMKV storage with persistent state
const mockMMKVStorage = new Map();

jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn((key) => {
      const value = mockMMKVStorage.get(key);
      return value || null;
    }),
    setString: jest.fn((key, value) => {
      mockMMKVStorage.set(key, value);
    }),
    set: jest.fn((key, value) => {
      mockMMKVStorage.set(key, value);
    }),
    delete: jest.fn((key) => {
      mockMMKVStorage.delete(key);
    }),
    clearAll: jest.fn(() => {
      mockMMKVStorage.clear();
    }),
  })),
  useMMKVString: jest.fn(),
}));

describe('useStepCountAsExperience with Manual Steps', () => {
  beforeEach(() => {
    // Clear all storage before each test
    mockMMKVStorage.clear();
    clearManualStepsByDay();
    clearStepsByDay();
    setManualEntryMode(false);
  });

  afterEach(() => {
    // Clean up after each test
    clearManualStepsByDay();
    clearStepsByDay();
    setManualEntryMode(false);
  });

  it('should include manual step entries in experience calculation', async () => {
    // Set up manual step entries
    const manualSteps = [
      { date: '2024-06-01', steps: 5000, source: 'manual' as const },
      { date: '2024-06-02', steps: 3000, source: 'manual' as const },
    ];
    await setManualStepsByDay(manualSteps);

    // Set up HealthKit step entries
    const healthKitSteps = [
      { date: new Date('2024-06-01'), steps: 2000 },
      { date: new Date('2024-06-03'), steps: 4000 },
    ];
    await setStepsByDay(healthKitSteps);



    const lastCheckedDateTime = new Date('2024-06-01');
    const { result } = renderHook(() =>
      useStepCountAsExperience(lastCheckedDateTime)
    );

    await waitFor(() => {
      
      // Check that manual step entries are included in the results
      const manualEntries = result.current.stepsByDay.filter(day => {
        const dayDate = typeof day.date === 'string' ? new Date(day.date) : day.date;
        return dayDate.toISOString().split('T')[0] === '2024-06-01' || 
               dayDate.toISOString().split('T')[0] === '2024-06-02';
      });
      
      expect(manualEntries).toHaveLength(2);
      expect(manualEntries.find(day => {
        const dayDate = typeof day.date === 'string' ? new Date(day.date) : day.date;
        return dayDate.toISOString().split('T')[0] === '2024-06-01';
      })?.steps).toBe(5000);
      expect(manualEntries.find(day => {
        const dayDate = typeof day.date === 'string' ? new Date(day.date) : day.date;
        return dayDate.toISOString().split('T')[0] === '2024-06-02';
      })?.steps).toBe(3000);
      
      expect(result.current.experience).toBe(12000); // 5000 (manual) + 3000 (manual) + 4000 (HealthKit) - manual takes priority over HealthKit for same date
    });
  });

  it('should prioritize manual entries over HealthKit entries for the same date', async () => {
    // Set up manual step entry for today
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    await setManualStepEntry({
      date: todayString,
      steps: 8000,
      source: 'manual',
    });

    // Set up HealthKit step entry for the same date
    const healthKitSteps = [
      { date: today, steps: 3000 },
    ];
    await setStepsByDay(healthKitSteps);

    const lastCheckedDateTime = new Date(today);
    lastCheckedDateTime.setHours(0, 0, 0, 0);

    const { result } = renderHook(() =>
      useStepCountAsExperience(lastCheckedDateTime)
    );

    await waitFor(() => {
      // Should use manual entry (8000) instead of HealthKit entry (3000)
      const todayEntry = result.current.stepsByDay.find(day => {
        const dayDate = typeof day.date === 'string' 
          ? new Date(day.date) 
          : day.date;
        return dayDate.toISOString().split('T')[0] === todayString;
      });
      expect(todayEntry?.steps).toBe(8000);
    });
  });

  it('should merge manual and HealthKit entries correctly', async () => {
    // Set up mixed data
    const manualSteps = [
      { date: '2024-06-01', steps: 5000, source: 'manual' as const },
      { date: '2024-06-03', steps: 7000, source: 'manual' as const },
    ];
    await setManualStepsByDay(manualSteps);

    const healthKitSteps = [
      { date: new Date('2024-06-02'), steps: 4000 },
      { date: new Date('2024-06-04'), steps: 6000 },
    ];
    await setStepsByDay(healthKitSteps);

    const lastCheckedDateTime = new Date('2024-06-01');
    const { result } = renderHook(() =>
      useStepCountAsExperience(lastCheckedDateTime)
    );

    await waitFor(() => {
      // Check that all expected entries are present
      const manualEntries = result.current.stepsByDay.filter(day => {
        const dayDate = typeof day.date === 'string' ? new Date(day.date) : day.date;
        return dayDate.toISOString().split('T')[0] === '2024-06-01' || 
               dayDate.toISOString().split('T')[0] === '2024-06-03';
      });
      
      const healthKitEntries = result.current.stepsByDay.filter(day => {
        const dayDate = typeof day.date === 'string' ? new Date(day.date) : day.date;
        return dayDate.toISOString().split('T')[0] === '2024-06-02' || 
               dayDate.toISOString().split('T')[0] === '2024-06-04';
      });
      
      expect(manualEntries).toHaveLength(2);
      expect(healthKitEntries).toHaveLength(2);
      expect(result.current.experience).toBe(22000); // 5000 + 4000 + 7000 + 6000
    });
  });

  it('should handle empty manual entries gracefully', async () => {
    // Only HealthKit data
    const healthKitSteps = [
      { date: new Date('2024-06-01'), steps: 3000 },
    ];
    await setStepsByDay(healthKitSteps);

    const lastCheckedDateTime = new Date('2024-06-01');
    const { result } = renderHook(() =>
      useStepCountAsExperience(lastCheckedDateTime)
    );

    await waitFor(() => {
      // Check that HealthKit entry is present
      const healthKitEntry = result.current.stepsByDay.find(day => {
        const dayDate = typeof day.date === 'string' ? new Date(day.date) : day.date;
        return dayDate.toISOString().split('T')[0] === '2024-06-01';
      });
      
      expect(healthKitEntry).toBeDefined();
      expect(healthKitEntry?.steps).toBe(3000);
      expect(result.current.experience).toBe(3000);
    });
  });

  it('should handle empty HealthKit entries gracefully', async () => {
    // Only manual data
    const manualSteps = [
      { date: '2024-06-01', steps: 5000, source: 'manual' as const },
    ];
    await setManualStepsByDay(manualSteps);

    const lastCheckedDateTime = new Date('2024-06-01');
    const { result } = renderHook(() =>
      useStepCountAsExperience(lastCheckedDateTime)
    );

    await waitFor(() => {
      // Check that manual entry is present
      const manualEntry = result.current.stepsByDay.find(day => {
        const dayDate = typeof day.date === 'string' ? new Date(day.date) : day.date;
        return dayDate.toISOString().split('T')[0] === '2024-06-01';
      });
      
      expect(manualEntry).toBeDefined();
      expect(manualEntry?.steps).toBe(5000);
      expect(result.current.experience).toBe(5000);
    });
  });

  it('should calculate cumulative experience including manual entries', async () => {
    // Set up manual step entries
    const manualSteps = [
      { date: '2024-06-01', steps: 5000, source: 'manual' as const },
      { date: '2024-06-02', steps: 3000, source: 'manual' as const },
    ];
    await setManualStepsByDay(manualSteps);

    const lastCheckedDateTime = new Date('2024-06-01');
    const { result } = renderHook(() =>
      useStepCountAsExperience(lastCheckedDateTime)
    );

    await waitFor(() => {
      expect(result.current.cumulativeExperience).toBeGreaterThan(0);
      expect(result.current.firstExperienceDate).toBeTruthy();
    });
  });
}); 