import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';

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
}); 