import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';

// Explicitly mock storage to ensure singleton behavior
jest.mock('../storage', () => require('../../../__mocks__/storage.tsx'));

import {
  useStepCountAsExperience,
  getManualEntryMode,
  setManualEntryMode,
  detectStreaks,
  useStreakTracking,
} from '../health';
import {
  getManualStepsByDay,
  setManualStepsByDay,
  clearManualStepsByDay,
  setManualStepEntry,
  getStepsByDay,
  setStepsByDay,
  clearStepsByDay,
  getDailyStepsGoal,
  setDailyStepsGoal,
  getCurrency,
  setCurrency,
  getExperience,
  setExperience,
  getCumulativeExperience,
  setCumulativeExperience,
  getFirstExperienceDate,
  setFirstExperienceDate,
} from '../storage';

describe('useStepCountAsExperience with Manual Steps', () => {
  beforeEach(() => {
    // Clear all storage before each test
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

  it('should process manual entries identically to HealthKit entries in mergeExperienceMMKV', async () => {
    // Test that manual entries are processed the same way as HealthKit entries
    // by comparing cumulative experience calculations
    
    // Scenario 1: Only HealthKit data
    const healthKitSteps = [
      { date: new Date('2024-06-01'), steps: 5000 },
      { date: new Date('2024-06-02'), steps: 3000 },
    ];
    await setStepsByDay(healthKitSteps);
    
    const lastCheckedDateTime = new Date('2024-06-01');
    const { result: resultHealthKit } = renderHook(() =>
      useStepCountAsExperience(lastCheckedDateTime)
    );

    await waitFor(() => {
      expect(resultHealthKit.current.experience).toBe(8000);
      expect(resultHealthKit.current.cumulativeExperience).toBeGreaterThan(0);
    });

    // Clear storage
    clearStepsByDay();
    clearManualStepsByDay();

    // Scenario 2: Only manual data with same step counts
    const manualSteps = [
      { date: '2024-06-01', steps: 5000, source: 'manual' as const },
      { date: '2024-06-02', steps: 3000, source: 'manual' as const },
    ];
    await setManualStepsByDay(manualSteps);

    const { result: resultManual } = renderHook(() =>
      useStepCountAsExperience(lastCheckedDateTime)
    );

    await waitFor(() => {
      expect(resultManual.current.experience).toBe(8000);
      // The cumulative experience should be calculated the same way
      expect(resultManual.current.cumulativeExperience).toBeGreaterThan(0);
    });

    // Clear storage again
    clearStepsByDay();
    clearManualStepsByDay();

    // Scenario 3: Mixed data
    const mixedHealthKitSteps = [
      { date: new Date('2024-06-01'), steps: 2000 },
    ];
    await setStepsByDay(mixedHealthKitSteps);

    const mixedManualSteps = [
      { date: '2024-06-02', steps: 3000, source: 'manual' as const },
    ];
    await setManualStepsByDay(mixedManualSteps);

    const { result: resultMixed } = renderHook(() =>
      useStepCountAsExperience(lastCheckedDateTime)
    );

    await waitFor(() => {
      expect(resultMixed.current.experience).toBe(5000); // 2000 + 3000
      expect(resultMixed.current.cumulativeExperience).toBeGreaterThan(0);
    });
  });

  it('should ensure manual entries trigger currency conversion correctly', async () => {
    // Test that manual entries trigger the same currency conversion logic as HealthKit
    
    // Set up manual step entries
    const manualSteps = [
      { date: '2024-06-01', steps: 10000, source: 'manual' as const },
    ];
    await setManualStepsByDay(manualSteps);

    const lastCheckedDateTime = new Date('2024-06-01');
    const { result } = renderHook(() =>
      useStepCountAsExperience(lastCheckedDateTime)
    );

    await waitFor(() => {
      // Verify that manual entries are included in experience calculation
      expect(result.current.experience).toBe(10000);
      
      // The currency conversion should happen automatically
      // We can't directly test the currency conversion here since it's internal,
      // but we can verify that the experience is calculated correctly
      expect(result.current.cumulativeExperience).toBeGreaterThan(0);
    });
  });

  it('should verify manual entries trigger currency conversion with correct rate', async () => {
    // Test that manual entries trigger currency conversion with the correct conversion rate
    // Currency conversion rate is 0.1 (10 XP = 1 Currency)
    
    // Clear any existing data
    await setExperience(0);
    await setCurrency(0);
    
    // Set up manual step entries
    const manualSteps = [
      { date: '2024-06-01', steps: 10000, source: 'manual' as const }, // 10000 XP should = 1000 currency
    ];
    await setManualStepsByDay(manualSteps);

    const lastCheckedDateTime = new Date('2024-06-01');
    const { result } = renderHook(() =>
      useStepCountAsExperience(lastCheckedDateTime)
    );

    await waitFor(() => {
      // Verify that manual entries are included in experience calculation
      expect(result.current.experience).toBe(10000);
      expect(result.current.cumulativeExperience).toBeGreaterThan(0);
    });

    // Wait for currency to be updated
    await waitFor(async () => {
      const currency = await getCurrency();
      console.log('[TEST DEBUG] Currency after manual entry:', currency);
      expect(currency).toBe(1000); // 10000 XP * 0.1 = 1000 currency
    });
  });

  it('should verify manual entries trigger currency conversion identically to HealthKit', async () => {
    // Test that manual entries trigger currency conversion identically to HealthKit entries
    
    // Clear any existing data
    await setExperience(0);
    await setCurrency(0);
    await setStepsByDay([]);
    
    // Test with HealthKit data first
    const healthKitSteps = [
      { date: new Date('2024-06-01'), steps: 8000 },
    ];
    await setStepsByDay(healthKitSteps);

    const lastCheckedDateTime = new Date('2024-06-01');
    const { result: healthKitResult } = renderHook(() =>
      useStepCountAsExperience(lastCheckedDateTime)
    );

    await waitFor(() => {
      expect(healthKitResult.current.experience).toBe(8000);
    });

    // Wait for currency to be updated
    let healthKitCurrency: number;
    await waitFor(async () => {
      healthKitCurrency = await getCurrency();
      expect(healthKitCurrency).toBe(800); // 8000 XP * 0.1 = 800 currency
    });

    // Clear data and test with manual entries
    await setExperience(0);
    await setCurrency(0);
    await setStepsByDay([]);
    
    const manualSteps = [
      { date: '2024-06-01', steps: 8000, source: 'manual' as const },
    ];
    await setManualStepsByDay(manualSteps);

    const { result: manualResult } = renderHook(() =>
      useStepCountAsExperience(lastCheckedDateTime)
    );

    await waitFor(() => {
      expect(manualResult.current.experience).toBe(8000);
    });

    // Wait for currency to be updated
    await waitFor(async () => {
      const manualCurrency = await getCurrency();
      expect(manualCurrency).toBe(800); // Should be identical to HealthKit
      expect(manualCurrency).toBe(healthKitCurrency);
    });
  });

  it('should verify manual entries trigger incremental currency conversion', async () => {
    // Test that manual entries trigger incremental currency conversion when experience increases
    
    // Clear any existing data
    await setExperience(0);
    await setCurrency(0);
    
    // Set initial manual entry
    const initialManualSteps = [
      { date: '2024-06-01', steps: 5000, source: 'manual' as const },
    ];
    await setManualStepsByDay(initialManualSteps);

    const lastCheckedDateTime = new Date('2024-06-01');
    const { result: initialResult } = renderHook(() =>
      useStepCountAsExperience(lastCheckedDateTime)
    );

    await waitFor(() => {
      expect(initialResult.current.experience).toBe(5000);
    });

    // Wait for currency to be updated
    await waitFor(async () => {
      const initialCurrency = await getCurrency();
      expect(initialCurrency).toBe(500); // 5000 XP * 0.1 = 500 currency
    });

    // Add more manual entries to increase experience
    const updatedManualSteps = [
      { date: '2024-06-01', steps: 5000, source: 'manual' as const },
      { date: '2024-06-02', steps: 3000, source: 'manual' as const },
    ];
    await setManualStepsByDay(updatedManualSteps);

    // Create a new hook instance to trigger new calculation
    const { result: updatedResult } = renderHook(() =>
      useStepCountAsExperience(lastCheckedDateTime)
    );

    await waitFor(() => {
      expect(updatedResult.current.experience).toBe(8000); // 5000 + 3000
    });

    // Wait for currency to be updated
    await waitFor(async () => {
      const updatedCurrency = await getCurrency();
      // Should only add the difference: (8000 - 5000) * 0.1 = 300 additional currency
      expect(updatedCurrency).toBe(800); // 500 + 300 = 800
    });
  });

  it('should integrate manual steps with streak detection system', async () => {
    // Test that manual steps are properly included in streak detection
    
    // Set up manual step entries that would create a streak
    const manualSteps = [
      { date: '2024-06-01', steps: 8000, source: 'manual' as const }, // Above goal
      { date: '2024-06-02', steps: 7500, source: 'manual' as const }, // Above goal
      { date: '2024-06-03', steps: 3000, source: 'manual' as const }, // Below goal
      { date: '2024-06-04', steps: 8500, source: 'manual' as const }, // Above goal
      { date: '2024-06-05', steps: 9000, source: 'manual' as const }, // Above goal
    ];
    await setManualStepsByDay(manualSteps);

    // Set daily goal to 7000 steps
    await setDailyStepsGoal(7000);

    const lastCheckedDateTime = new Date('2024-06-01');
    const { result, unmount } = renderHook(() =>
      useStreakTracking(lastCheckedDateTime)
    );

    await waitFor(() => {
      // Verify that manual entries are included in streak detection
      expect(result.current.streaks).toBeDefined();
    });

    // Unmount and re-mount the hook to pick up the new streaks after the effect runs
    unmount();
    const { result: result2 } = renderHook(() => useStreakTracking(lastCheckedDateTime));

    await waitFor(() => {
      expect(result2.current.streaks.length).toBeGreaterThan(0);
      
      // Should detect a streak from 2024-06-01 to 2024-06-02 (2 days)
      const firstStreak = result2.current.streaks[0];
      expect(firstStreak.daysCount).toBe(2);
      expect(firstStreak.startDate).toContain('2024-06-01');
      expect(firstStreak.endDate).toContain('2024-06-02');
    });
  });

  it('should detect streaks with mixed HealthKit and manual data', async () => {
    // Test streak detection with both HealthKit and manual data
    
    // Set up HealthKit data
    const healthKitSteps = [
      { date: new Date('2024-06-01'), steps: 8000 }, // Above goal
      { date: new Date('2024-06-03'), steps: 7500 }, // Above goal
    ];
    await setStepsByDay(healthKitSteps);
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Set up manual data for the same dates (manual should take priority)
    const manualSteps = [
      { date: '2024-06-01', steps: 9000, source: 'manual' as const }, // Higher than HealthKit
      { date: '2024-06-02', steps: 8500, source: 'manual' as const }, // New manual entry
      { date: '2024-06-03', steps: 7000, source: 'manual' as const }, // Lower than HealthKit
    ];
    await setManualStepsByDay(manualSteps);
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Set daily goal to 7000 steps
    await setDailyStepsGoal(7000);
    await new Promise((resolve) => setTimeout(resolve, 10));

    const lastCheckedDateTime = new Date('2024-06-01');
    
    // First, let's check what the merged data looks like
    const { result: stepResult } = renderHook(() =>
      useStepCountAsExperience(lastCheckedDateTime)
    );

    // Wait for merged stepsByDay to contain all three days
    await waitFor(() => {
      expect(stepResult.current.stepsByDay.length).toBeGreaterThanOrEqual(3);
      const dates = stepResult.current.stepsByDay.map(d => d.date.toISOString().split('T')[0]);
      expect(dates).toContain('2024-06-01');
      expect(dates).toContain('2024-06-02');
      expect(dates).toContain('2024-06-03');
    });



    const { result, unmount } = renderHook(() =>
      useStreakTracking(lastCheckedDateTime)
    );

    await waitFor(() => {
      // Verify that manual entries are prioritized in streak detection
      expect(result.current.streaks).toBeDefined();
    });

    // Unmount and re-mount the hook to pick up the new streaks after the effect runs
    unmount();
    const { result: result2 } = renderHook(() => useStreakTracking(lastCheckedDateTime));

    await waitFor(() => {
      expect(result2.current.streaks.length).toBeGreaterThan(0);
      
      // Should detect a streak from 2024-06-01 to 2024-06-03 (3 days)
      const firstStreak = result2.current.streaks[0];
      expect(firstStreak.daysCount).toBe(3);
      expect(firstStreak.startDate).toContain('2024-06-01');
      expect(firstStreak.endDate).toContain('2024-06-03');
      
      // The average steps should be calculated from manual entries
      expect(firstStreak.averageSteps).toBe(8167); // (9000 + 8500 + 7000) / 3 rounded
    });
  });

  it('should handle manual entries in detectStreaks function directly', async () => {
    // Test the detectStreaks function directly with manual data
    
    // Set up manual step entries
    const manualSteps = [
      { date: '2024-06-01', steps: 8000, source: 'manual' as const },
      { date: '2024-06-02', steps: 7500, source: 'manual' as const },
      { date: '2024-06-03', steps: 3000, source: 'manual' as const }, // Below goal
      { date: '2024-06-04', steps: 8500, source: 'manual' as const },
      { date: '2024-06-05', steps: 9000, source: 'manual' as const },
    ];
    await setManualStepsByDay(manualSteps);

    // Get the merged step data
    const lastCheckedDateTime = new Date('2024-06-01');
    const { result } = renderHook(() =>
      useStepCountAsExperience(lastCheckedDateTime)
    );

    await waitFor(() => {
      const stepsByDay = result.current.stepsByDay;
      const dailyGoal = 7000;
      
      // Test detectStreaks function directly
      const detectedStreaks = detectStreaks(stepsByDay, dailyGoal);
      
      // Should detect two streaks:
      // 1. 2024-06-01 to 2024-06-02 (2 days)
      // 2. 2024-06-04 to 2024-06-05 (2 days)
      expect(detectedStreaks).toHaveLength(2);
      
      const firstStreak = detectedStreaks[0];
      expect(firstStreak.daysCount).toBe(2);
      expect(firstStreak.startDate).toContain('2024-06-01');
      expect(firstStreak.endDate).toContain('2024-06-02');
      
      const secondStreak = detectedStreaks[1];
      expect(secondStreak.daysCount).toBe(2);
      expect(secondStreak.startDate).toContain('2024-06-04');
      expect(secondStreak.endDate).toContain('2024-06-05');
    });
  });

  it('should update cumulative experience calculation to include manual entries', async () => {
    // Test that cumulative experience calculation properly includes manual entries
    
    // Clear any existing data
    await setExperience(0);
    await setCumulativeExperience(0);
    await setFirstExperienceDate('');
    
    // Set up manual step entries
    const manualSteps = [
      { date: '2024-06-01', steps: 10000, source: 'manual' as const },
      { date: '2024-06-02', steps: 8000, source: 'manual' as const },
      { date: '2024-06-03', steps: 12000, source: 'manual' as const },
    ];
    await setManualStepsByDay(manualSteps);

    const lastCheckedDateTime = new Date('2024-06-01');
    const { result } = renderHook(() =>
      useStepCountAsExperience(lastCheckedDateTime)
    );

    await waitFor(() => {
      // Verify that manual entries are included in experience calculation
      expect(result.current.experience).toBe(30000); // 10000 + 8000 + 12000
      expect(result.current.cumulativeExperience).toBe(30000); // Should be equal to experience for first time
      expect(result.current.firstExperienceDate).toBe('2024-06-01T00:00:00.000Z');
    });

    // Add more manual entries to test incremental cumulative experience
    const updatedManualSteps = [
      { date: '2024-06-01', steps: 10000, source: 'manual' as const },
      { date: '2024-06-02', steps: 8000, source: 'manual' as const },
      { date: '2024-06-03', steps: 12000, source: 'manual' as const },
      { date: '2024-06-04', steps: 15000, source: 'manual' as const }, // New entry
    ];
    await setManualStepsByDay(updatedManualSteps);

    // Create a new hook instance to trigger new calculation
    const { result: updatedResult } = renderHook(() =>
      useStepCountAsExperience(lastCheckedDateTime)
    );

    await waitFor(() => {
      // Experience should be updated to include new entry
      expect(updatedResult.current.experience).toBe(45000); // 10000 + 8000 + 12000 + 15000
      // Cumulative experience should be updated with the difference
      expect(updatedResult.current.cumulativeExperience).toBe(45000); // Previous 30000 + new 15000
    });
  });

  it('should handle cumulative experience calculation with mixed HealthKit and manual entries', async () => {
    // Test cumulative experience calculation with both HealthKit and manual data
    
    // Clear any existing data
    await setExperience(0);
    await setCumulativeExperience(0);
    await setFirstExperienceDate('');
    
    // Set up HealthKit data
    const healthKitSteps = [
      { date: new Date('2024-06-01'), steps: 5000 },
      { date: new Date('2024-06-03'), steps: 7000 },
    ];
    await setStepsByDay(healthKitSteps);

    // Set up manual data (manual should take priority for same dates)
    const manualSteps = [
      { date: '2024-06-01', steps: 8000, source: 'manual' as const }, // Higher than HealthKit
      { date: '2024-06-02', steps: 6000, source: 'manual' as const }, // New manual entry
      { date: '2024-06-03', steps: 9000, source: 'manual' as const }, // Higher than HealthKit
    ];
    await setManualStepsByDay(manualSteps);

    const lastCheckedDateTime = new Date('2024-06-01');
    const { result } = renderHook(() =>
      useStepCountAsExperience(lastCheckedDateTime)
    );

    await waitFor(() => {
      // Total experience should be: 8000 (manual) + 6000 (manual) + 9000 (manual) = 23000
      expect(result.current.experience).toBe(23000);
      expect(result.current.cumulativeExperience).toBe(23000);
      expect(result.current.firstExperienceDate).toBe('2024-06-01T00:00:00.000Z');
    });

    // Verify that manual entries take priority over HealthKit entries
    const stepEntries = result.current.stepsByDay.filter(day => {
      const dayDate = typeof day.date === 'string' ? new Date(day.date) : day.date;
      const dateStr = dayDate.toISOString().split('T')[0];
      return dateStr === '2024-06-01' || dateStr === '2024-06-03';
    });

    expect(stepEntries).toHaveLength(2);
    expect(stepEntries.find(day => {
      const dayDate = typeof day.date === 'string' ? new Date(day.date) : day.date;
      return dayDate.toISOString().split('T')[0] === '2024-06-01';
    })?.steps).toBe(8000); // Manual entry, not HealthKit (5000)
    expect(stepEntries.find(day => {
      const dayDate = typeof day.date === 'string' ? new Date(day.date) : day.date;
      return dayDate.toISOString().split('T')[0] === '2024-06-03';
    })?.steps).toBe(9000); // Manual entry, not HealthKit (7000)
  });

  it('should maintain cumulative experience consistency between manual and HealthKit entries', async () => {
    // Test that cumulative experience is calculated consistently regardless of data source
    
    // Clear any existing data
    await setExperience(0);
    await setCumulativeExperience(0);
    await setFirstExperienceDate('');
    
    // Scenario 1: Only HealthKit data
    const healthKitSteps = [
      { date: new Date('2024-06-01'), steps: 10000 },
      { date: new Date('2024-06-02'), steps: 8000 },
    ];
    await setStepsByDay(healthKitSteps);
    
    const lastCheckedDateTime = new Date('2024-06-01');
    const { result: healthKitResult } = renderHook(() =>
      useStepCountAsExperience(lastCheckedDateTime)
    );

    await waitFor(() => {
      expect(healthKitResult.current.experience).toBe(18000);
      expect(healthKitResult.current.cumulativeExperience).toBe(18000);
    });

    // Clear and test with manual data
    await setExperience(0);
    await setCumulativeExperience(0);
    await setFirstExperienceDate('');
    await clearStepsByDay();
    
    const manualSteps = [
      { date: '2024-06-01', steps: 10000, source: 'manual' as const },
      { date: '2024-06-02', steps: 8000, source: 'manual' as const },
    ];
    await setManualStepsByDay(manualSteps);

    const { result: manualResult } = renderHook(() =>
      useStepCountAsExperience(lastCheckedDateTime)
    );

    await waitFor(() => {
      // Should have identical cumulative experience calculation
      expect(manualResult.current.experience).toBe(18000);
      expect(manualResult.current.cumulativeExperience).toBe(18000);
    });
  });

  // SUBTASK 4.6: Test experience/currency parity between HealthKit and manual entries
  describe('Experience/Currency Parity Tests (Subtask 4.6)', () => {
    beforeEach(async () => {
      // Clear all storage before each test
      await setExperience(0);
      await setCumulativeExperience(0);
      await setCurrency(0);
      await setFirstExperienceDate('');
      clearManualStepsByDay();
      clearStepsByDay();
      setManualEntryMode(false);
      
      // Clear HealthKit mock data
      const HealthKit = require('@kingstinct/react-native-healthkit');
      HealthKit.__setStepSamples([]);
    });

    afterEach(async () => {
      // Clean up after each test
      await setExperience(0);
      await setCumulativeExperience(0);
      await setCurrency(0);
      await setFirstExperienceDate('');
      clearManualStepsByDay();
      clearStepsByDay();
      setManualEntryMode(false);
      
      // Clear HealthKit mock data
      const HealthKit = require('@kingstinct/react-native-healthkit');
      HealthKit.__setStepSamples([]);
    });

    it('should calculate identical experience for identical step counts regardless of source', async () => {
      // Test that same step counts produce same experience regardless of source
      
      const testSteps = [
        { date: '2024-06-01', steps: 5000 },
        { date: '2024-06-02', steps: 7500 },
        { date: '2024-06-03', steps: 10000 },
      ];

      // Test with HealthKit data
      const HealthKit = require('@kingstinct/react-native-healthkit');
      const healthKitSamples = testSteps.map(step => ({
        startDate: new Date(step.date),
        endDate: new Date(step.date),
        quantity: step.steps,
      }));
      HealthKit.__setStepSamples(healthKitSamples);

      const healthKitSteps = testSteps.map(step => ({
        date: new Date(step.date),
        steps: step.steps,
      }));
      await setStepsByDay(healthKitSteps);

      const lastCheckedDateTime = new Date('2024-06-01');
      const { result: healthKitResult } = renderHook(() =>
        useStepCountAsExperience(lastCheckedDateTime)
      );

      await waitFor(() => {
        expect(healthKitResult.current.experience).toBe(22500); // 5000 + 7500 + 10000
      });

      // Clear and test with manual data
      await setExperience(0);
      await setCumulativeExperience(0);
      await setCurrency(0);
      await setFirstExperienceDate('');
      await clearStepsByDay();
      HealthKit.__setStepSamples([]);

      const manualSteps = testSteps.map(step => ({
        date: step.date,
        steps: step.steps,
        source: 'manual' as const,
      }));
      await setManualStepsByDay(manualSteps);

      const { result: manualResult } = renderHook(() =>
        useStepCountAsExperience(lastCheckedDateTime)
      );

      await waitFor(() => {
        // Should have identical experience calculation
        expect(manualResult.current.experience).toBe(22500);
        expect(manualResult.current.experience).toBe(healthKitResult.current.experience);
      });
    });

    it('should convert experience to currency identically regardless of source', async () => {
      // Test that same experience produces same currency regardless of source
      
      const testSteps = [
        { date: '2024-06-01', steps: 10000 }, // 10000 XP = 1000 currency
        { date: '2024-06-02', steps: 5000 },  // 5000 XP = 500 currency
      ];

      // Test with HealthKit data
      const HealthKit = require('@kingstinct/react-native-healthkit');
      const healthKitSamples = testSteps.map(step => ({
        startDate: new Date(step.date),
        endDate: new Date(step.date),
        quantity: step.steps,
      }));
      HealthKit.__setStepSamples(healthKitSamples);

      const healthKitSteps = testSteps.map(step => ({
        date: new Date(step.date),
        steps: step.steps,
      }));
      await setStepsByDay(healthKitSteps);

      const lastCheckedDateTime = new Date('2024-06-01');
      const { result: healthKitResult } = renderHook(() =>
        useStepCountAsExperience(lastCheckedDateTime)
      );

      await waitFor(() => {
        expect(healthKitResult.current.experience).toBe(15000);
      });

      // Wait for currency to be updated
      await waitFor(async () => {
        const healthKitCurrency = await getCurrency();
        expect(healthKitCurrency).toBe(1500); // 15000 XP * 0.1 = 1500 currency
      });

      // Clear and test with manual data
      await setExperience(0);
      await setCumulativeExperience(0);
      await setCurrency(0);
      await setFirstExperienceDate('');
      await clearStepsByDay();
      HealthKit.__setStepSamples([]);

      const manualSteps = testSteps.map(step => ({
        date: step.date,
        steps: step.steps,
        source: 'manual' as const,
      }));
      await setManualStepsByDay(manualSteps);

      const { result: manualResult } = renderHook(() =>
        useStepCountAsExperience(lastCheckedDateTime)
      );

      await waitFor(() => {
        expect(manualResult.current.experience).toBe(15000);
      });

      // Wait for currency to be updated
      await waitFor(async () => {
        const manualCurrency = await getCurrency();
        expect(manualCurrency).toBe(1500); // Should be identical to HealthKit
        expect(manualCurrency).toBe(1500);
      });
    });

    it('should calculate cumulative experience identically regardless of source', async () => {
      // Test that cumulative experience is calculated identically regardless of source
      
      const testSteps = [
        { date: '2024-06-01', steps: 8000 },
        { date: '2024-06-02', steps: 12000 },
        { date: '2024-06-03', steps: 6000 },
      ];

      // Test with HealthKit data
      const HealthKit = require('@kingstinct/react-native-healthkit');
      const healthKitSamples = testSteps.map(step => ({
        startDate: new Date(step.date),
        endDate: new Date(step.date),
        quantity: step.steps,
      }));
      HealthKit.__setStepSamples(healthKitSamples);

      const healthKitSteps = testSteps.map(step => ({
        date: new Date(step.date),
        steps: step.steps,
      }));
      await setStepsByDay(healthKitSteps);

      const lastCheckedDateTime = new Date('2024-06-01');
      const { result: healthKitResult } = renderHook(() =>
        useStepCountAsExperience(lastCheckedDateTime)
      );

      await waitFor(() => {
        expect(healthKitResult.current.experience).toBe(26000);
        expect(healthKitResult.current.cumulativeExperience).toBe(26000);
        expect(healthKitResult.current.firstExperienceDate).toBe('2024-06-01T00:00:00.000Z');
      });

      // Clear and test with manual data
      await setExperience(0);
      await setCumulativeExperience(0);
      await setCurrency(0);
      await setFirstExperienceDate('');
      await clearStepsByDay();
      HealthKit.__setStepSamples([]);

      const manualSteps = testSteps.map(step => ({
        date: step.date,
        steps: step.steps,
        source: 'manual' as const,
      }));
      await setManualStepsByDay(manualSteps);

      const { result: manualResult } = renderHook(() =>
        useStepCountAsExperience(lastCheckedDateTime)
      );

      await waitFor(() => {
        // Should have identical cumulative experience calculation
        expect(manualResult.current.experience).toBe(26000);
        expect(manualResult.current.cumulativeExperience).toBe(26000);
        expect(manualResult.current.firstExperienceDate).toBe('2024-06-01T00:00:00.000Z');
        
        // Verify parity
        expect(manualResult.current.experience).toBe(healthKitResult.current.experience);
        expect(manualResult.current.cumulativeExperience).toBe(healthKitResult.current.cumulativeExperience);
        expect(manualResult.current.firstExperienceDate).toBe(healthKitResult.current.firstExperienceDate);
      });
    });

    it('should detect streaks identically regardless of source', async () => {
      // Test that streak detection works identically regardless of data source
      
      const dailyGoal = 7000;
      await setDailyStepsGoal(dailyGoal);

      const testSteps = [
        { date: '2024-06-01', steps: 8000 }, // Above goal
        { date: '2024-06-02', steps: 7500 }, // Above goal
        { date: '2024-06-03', steps: 6500 }, // Below goal
        { date: '2024-06-04', steps: 8500 }, // Above goal
        { date: '2024-06-05', steps: 9000 }, // Above goal
      ];

      // Test with HealthKit data
      const HealthKit = require('@kingstinct/react-native-healthkit');
      const healthKitSamples = testSteps.map(step => ({
        startDate: new Date(step.date),
        endDate: new Date(step.date),
        quantity: step.steps,
      }));
      HealthKit.__setStepSamples(healthKitSamples);

      const healthKitSteps = testSteps.map(step => ({
        date: new Date(step.date),
        steps: step.steps,
      }));
      await setStepsByDay(healthKitSteps);

      const lastCheckedDateTime = new Date('2024-06-01');
      const { result: healthKitResult } = renderHook(() =>
        useStreakTracking(lastCheckedDateTime)
      );

      await waitFor(() => {
        expect(healthKitResult.current.streaks).toBeDefined();
        expect(healthKitResult.current.streaks.length).toBeGreaterThan(0);
      });

      // Clear and test with manual data
      await setExperience(0);
      await setCumulativeExperience(0);
      await setCurrency(0);
      await setFirstExperienceDate('');
      await clearStepsByDay();
      HealthKit.__setStepSamples([]);

      const manualSteps = testSteps.map(step => ({
        date: step.date,
        steps: step.steps,
        source: 'manual' as const,
      }));
      await setManualStepsByDay(manualSteps);

      const { result: manualResult } = renderHook(() =>
        useStreakTracking(lastCheckedDateTime)
      );

      await waitFor(() => {
        expect(manualResult.current.streaks).toBeDefined();
        expect(manualResult.current.streaks.length).toBeGreaterThan(0);
        
        // Should have identical streak detection
        expect(manualResult.current.streaks.length).toBe(healthKitResult.current.streaks.length);
        
        // Verify streak details are identical
        for (let i = 0; i < manualResult.current.streaks.length; i++) {
          expect(manualResult.current.streaks[i].daysCount).toBe(healthKitResult.current.streaks[i].daysCount);
          expect(manualResult.current.streaks[i].averageSteps).toBe(healthKitResult.current.streaks[i].averageSteps);
        }
      });
    });

    it('should handle edge cases identically regardless of source', async () => {
      // Test edge cases like zero steps, very high steps, etc.
      
      const edgeCases = [
        { date: '2024-06-01', steps: 0 },      // Zero steps
        { date: '2024-06-02', steps: 1 },      // Minimal steps
        { date: '2024-06-03', steps: 99999 },  // Very high steps
        { date: '2024-06-04', steps: 10000 },  // Normal steps
      ];

      // Test with HealthKit data
      const HealthKit = require('@kingstinct/react-native-healthkit');
      const healthKitSamples = edgeCases.map(step => ({
        startDate: new Date(step.date),
        endDate: new Date(step.date),
        quantity: step.steps,
      }));
      HealthKit.__setStepSamples(healthKitSamples);

      const healthKitSteps = edgeCases.map(step => ({
        date: new Date(step.date),
        steps: step.steps,
      }));
      await setStepsByDay(healthKitSteps);

      const lastCheckedDateTime = new Date('2024-06-01');
      const { result: healthKitResult } = renderHook(() =>
        useStepCountAsExperience(lastCheckedDateTime)
      );

      await waitFor(() => {
        expect(healthKitResult.current.experience).toBe(110000); // 0 + 1 + 99999 + 10000
      });

      // Clear and test with manual data
      await setExperience(0);
      await setCumulativeExperience(0);
      await setCurrency(0);
      await setFirstExperienceDate('');
      await clearStepsByDay();
      HealthKit.__setStepSamples([]);

      const manualSteps = edgeCases.map(step => ({
        date: step.date,
        steps: step.steps,
        source: 'manual' as const,
      }));
      await setManualStepsByDay(manualSteps);

      const { result: manualResult } = renderHook(() =>
        useStepCountAsExperience(lastCheckedDateTime)
      );

      await waitFor(() => {
        // Should handle edge cases identically
        expect(manualResult.current.experience).toBe(110000);
        expect(manualResult.current.experience).toBe(healthKitResult.current.experience);
      });
    });

    it('should maintain parity when switching between HealthKit and manual modes', async () => {
      // Test that switching between modes maintains experience/currency parity
      
      const testSteps = [
        { date: '2024-06-01', steps: 6000 },
        { date: '2024-06-02', steps: 8000 },
      ];

      // Start with HealthKit mode
      await setManualEntryMode(false);
      const HealthKit = require('@kingstinct/react-native-healthkit');
      const healthKitSamples = testSteps.map(step => ({
        startDate: new Date(step.date),
        endDate: new Date(step.date),
        quantity: step.steps,
      }));
      HealthKit.__setStepSamples(healthKitSamples);

      const healthKitSteps = testSteps.map(step => ({
        date: new Date(step.date),
        steps: step.steps,
      }));
      await setStepsByDay(healthKitSteps);

      const lastCheckedDateTime = new Date('2024-06-01');
      const { result: healthKitResult } = renderHook(() =>
        useStepCountAsExperience(lastCheckedDateTime)
      );

      await waitFor(() => {
        expect(healthKitResult.current.experience).toBe(14000);
      });

      // Switch to manual mode with same data
      await setManualEntryMode(true);
      await clearStepsByDay();
      HealthKit.__setStepSamples([]);
      
      const manualSteps = testSteps.map(step => ({
        date: step.date,
        steps: step.steps,
        source: 'manual' as const,
      }));
      await setManualStepsByDay(manualSteps);

      const { result: manualResult } = renderHook(() =>
        useStepCountAsExperience(lastCheckedDateTime)
      );

      await waitFor(() => {
        // Should maintain parity when switching modes
        expect(manualResult.current.experience).toBe(14000);
        expect(manualResult.current.experience).toBe(healthKitResult.current.experience);
      });
    });

    it('should handle mixed data sources with parity', async () => {
      // Test that mixed HealthKit and manual data maintains parity
      
      const healthKitSteps = [
        { date: new Date('2024-06-01'), steps: 5000 },
        { date: new Date('2024-06-03'), steps: 7000 },
      ];
      await setStepsByDay(healthKitSteps);

      // Set HealthKit mock data
      const HealthKit = require('@kingstinct/react-native-healthkit');
      const healthKitSamples = healthKitSteps.map(step => ({
        startDate: step.date,
        endDate: step.date,
        quantity: step.steps,
      }));
      HealthKit.__setStepSamples(healthKitSamples);

      const manualSteps = [
        { date: '2024-06-02', steps: 6000, source: 'manual' as const },
        { date: '2024-06-04', steps: 8000, source: 'manual' as const },
      ];
      await setManualStepsByDay(manualSteps);

      const lastCheckedDateTime = new Date('2024-06-01');
      const { result } = renderHook(() =>
        useStepCountAsExperience(lastCheckedDateTime)
      );

      await waitFor(() => {
        // Total experience should be sum of all entries
        expect(result.current.experience).toBe(26000); // 5000 + 6000 + 7000 + 8000
        
        // Should have our specific entries present (among others from HealthKit mock)
        const dates = result.current.stepsByDay.map(d => d.date.toISOString().split('T')[0]);
        expect(dates).toContain('2024-06-01');
        expect(dates).toContain('2024-06-02');
        expect(dates).toContain('2024-06-03');
        expect(dates).toContain('2024-06-04');
        
        // Verify the specific entries have correct step counts
        const entry20240601 = result.current.stepsByDay.find(d => 
          d.date.toISOString().split('T')[0] === '2024-06-01'
        );
        const entry20240602 = result.current.stepsByDay.find(d => 
          d.date.toISOString().split('T')[0] === '2024-06-02'
        );
        const entry20240603 = result.current.stepsByDay.find(d => 
          d.date.toISOString().split('T')[0] === '2024-06-03'
        );
        const entry20240604 = result.current.stepsByDay.find(d => 
          d.date.toISOString().split('T')[0] === '2024-06-04'
        );
        
        expect(entry20240601?.steps).toBe(5000);
        expect(entry20240602?.steps).toBe(6000);
        expect(entry20240603?.steps).toBe(7000);
        expect(entry20240604?.steps).toBe(8000);
      });

      // Wait for currency to be updated
      await waitFor(async () => {
        const currency = await getCurrency();
        expect(currency).toBe(2600); // 26000 XP * 0.1 = 2600 currency
      });
    });
  });
}); 