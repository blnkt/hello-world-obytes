import HealthKit, {
  HKQuantityTypeIdentifier,
  HKStatisticsOptions,
  HKUnits,
} from '@kingstinct/react-native-healthkit';
import React, { useEffect, useState } from 'react';

import {
  addStreak,
  getCumulativeExperience,
  getCurrency,
  getDailyStepsGoal,
  getExperience,
  getFirstExperienceDate,
  getStepsByDay,
  setCumulativeExperience,
  setExperience,
  setFirstExperienceDate,
  setStepsByDay,
  spendCurrency,
  type Streak,
  updateHealthCore,
  useCurrency,
  useLastCheckedDate,
  useStreaks,
} from '../storage';

// TODO: PHASE 1 - Fix unused merge functions - Implement mergeStepsByDayMMKV in the main hook (mergeExperienceMMKV implemented)

// Available hooks for cumulative experience:
// - useCumulativeExperienceSimple() - Simple hook that auto-uses last checked date
// - useCumulativeExperience(lastCheckedDateTime) - Hook with custom date parameter
// TODO: PHASE 1 - Add data validation - Validate step data before saving to prevent corrupted data
// TODO: PHASE 1 - Implement data recovery - Add fallback mechanisms when HealthKit data is unavailable
// TODO: PHASE 1 - Optimize data storage - Improve MMKV usage and data structure
// TODO: PHASE 1 - Add offline support - Cache step data locally when HealthKit is not available
// TODO: PHASE 3 - Optimize data fetching - Reduce API calls by implementing smarter caching

const useHealthKitAvailability = () => {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAvailability = async () => {
      const available = await HealthKit.isHealthDataAvailable();
      setIsAvailable(available);
    };
    checkAvailability();
  }, []);

  return isAvailable;
};

export const useHealthKit = () => {
  const isAvailable = useHealthKitAvailability();
  const [hasRequestedAuthorization, setHasRequestedAuthorization] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    if (isAvailable) {
      HealthKit.requestAuthorization([HKQuantityTypeIdentifier.stepCount]).then(
        () => {
          setHasRequestedAuthorization(true);
        }
      );
    }
  }, [isAvailable]);

  return {
    isAvailable,
    hasRequestedAuthorization,
  };
};

export const getTodayStepCount = async () => {
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
  const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));
  // const yesterday = new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000);
  // const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  try {
    const result = await HealthKit.queryStatisticsForQuantity(
      HKQuantityTypeIdentifier.stepCount,
      [HKStatisticsOptions.cumulativeSum],
      todayStart,
      todayEnd,
      HKUnits.Count
    );
    return result.sumQuantity?.quantity ?? 0;
  } catch (error) {
    console.error('Error getting step count:', error);
    return null;
  }
};

export const getCumulativeStepCount = async () => {
  try {
    const MostRecentQuantitySample =
      await HealthKit.getMostRecentQuantitySample(
        HKQuantityTypeIdentifier.stepCount,
        HKUnits.Count
      );
    return MostRecentQuantitySample;
  } catch (error) {
    console.error('Error getting step count:', error);
    return null;
  }
};

export const useStepCount = () => {
  const [stepCount, setStepCount] = useState<object | null>(null);

  useEffect(() => {
    const getStepCount = async () => {
      try {
        const MostRecentQuantitySample =
          await HealthKit.getMostRecentQuantitySample(
            HKQuantityTypeIdentifier.stepCount,
            HKUnits.Count
          );
        setStepCount(MostRecentQuantitySample);
      } catch (error) {
        console.error('Error getting step count:', error);
        setStepCount(null);
      }
    };

    getStepCount();
  }, []);

  return stepCount;
};

const getStepsGroupedByDay = async (
  startDate: Date,
  endDate: Date = new Date()
) => {
  const results: { date: Date; steps: number }[] = [];
  let current = new Date(startDate);
  current.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  while (current <= end) {
    const dayStart = new Date(current);
    const dayEnd = new Date(current);
    dayEnd.setHours(23, 59, 59, 999);

    try {
      const result = await HealthKit.queryStatisticsForQuantity(
        HKQuantityTypeIdentifier.stepCount,
        [HKStatisticsOptions.cumulativeSum],
        dayStart,
        dayEnd,
        HKUnits.Count
      );
      results.push({
        date: new Date(dayStart),
        steps: result.sumQuantity?.quantity ?? 0,
      });
    } catch (error) {
      console.log(error);
      results.push({ date: new Date(dayStart), steps: 0 });
    }

    current.setDate(current.getDate() + 1);
  }

  return results;
};

// Unused type - kept for potential future use
// type _StepEntry = { date: string | Date; steps: number };

// TODO: PHASE 1 - Add comprehensive tests - Unit and integration tests for all features
// TODO: PHASE 4 - Refactor duplicate code - Consolidate similar functionality

/**
 * Merges new experience data with existing cumulative experience
 *
 * This function tracks cumulative experience from the first time the user
 * granted HealthKit permissions and started earning experience. It:
 *
 * 1. Records the first experience date if not already set
 * 2. Calculates the difference in experience since last check
 * 3. Adds only the new experience to avoid double counting
 * 4. Updates both current and cumulative experience in storage
 *
 * @param newExperience - The current total experience from steps
 * @param lastCheckedDateTime - The date when experience was last checked
 * @returns Object containing cumulative experience and first experience date
 */
function mergeExperienceMMKV(
  newExperience: number,
  lastCheckedDateTime: Date
): { cumulativeExperience: number; firstExperienceDate: string | null } {
  // Get current cumulative experience
  const currentCumulative = getCumulativeExperience();

  // Get or set first experience date
  let firstExperienceDate = getFirstExperienceDate();
  if (!firstExperienceDate) {
    firstExperienceDate = lastCheckedDateTime.toISOString();
    setFirstExperienceDate(firstExperienceDate);
  }

  // Calculate new cumulative experience
  // Only add the difference since last check to avoid double counting
  const experienceDifference = newExperience - getExperience();
  const newCumulativeExperience =
    currentCumulative + Math.max(0, experienceDifference);

  // Update cumulative experience in storage
  setCumulativeExperience(newCumulativeExperience);

  return {
    cumulativeExperience: newCumulativeExperience,
    firstExperienceDate,
  };
}

// TODO: PHASE 1 - Implement mergeStepsByDayMMKV function for better step data management

/**
 * Hook for tracking step count as experience points
 *
 * This hook converts step count data from HealthKit into experience points
 * and tracks both current session experience and cumulative experience
 * from the first time the user started using the app. It also automatically
 * converts new experience to currency to avoid data loss.
 *
 * @param lastCheckedDateTime - The date when experience was last checked
 * @returns Object containing:
 *   - experience: Current session experience points
 *   - cumulativeExperience: Total experience from first use to now
 *   - firstExperienceDate: ISO string of when experience tracking started
 *   - stepsByDay: Array of daily step counts
 */
// eslint-disable-next-line max-lines-per-function
export const useStepCountAsExperience = (lastCheckedDateTime: Date) => {
  const [experience, setExperienceState] = useState<number>(0);
  const [cumulativeExperience, setCumulativeExperienceState] =
    useState<number>(0);
  const [firstExperienceDate, setFirstExperienceDateState] = useState<
    string | null
  >(null);
  const [stepsByDay, setStepsByDayState] = useState<
    { date: Date; steps: number }[]
  >([]);

  // Initialize from storage on mount
  useEffect(() => {
    const initializeFromStorage = () => {
      const storedExperience = getExperience();
      const storedCumulativeExperience = getCumulativeExperience();
      const storedFirstExperienceDate = getFirstExperienceDate();

      setExperienceState(storedExperience);
      setCumulativeExperienceState(storedCumulativeExperience);
      setFirstExperienceDateState(storedFirstExperienceDate);

      const storedStepsByDay = getStepsByDay();
      setStepsByDayState(storedStepsByDay);
    };

    initializeFromStorage();
  }, []);

  useEffect(() => {
    const handleError = async () => {
      console.error('Error getting step count for experience');
      setExperienceState(0);
      setCumulativeExperienceState(0);
      setFirstExperienceDateState(null);
      setStepsByDayState([]);
      await setExperience(0);
      await setStepsByDay([]);
    };

    const getExperienceFromSteps = async () => {
      try {
        const now = new Date();
        const results = await getStepsGroupedByDay(lastCheckedDateTime, now);
        const totalSteps = results.reduce(
          (sum, day) => sum + (day.steps || 0),
          0
        );

        // Get previous experience to calculate the difference
        const previousExperience = getExperience();

        // Use mergeExperienceMMKV to update cumulative experience
        const {
          cumulativeExperience: newCumulativeExperience,
          firstExperienceDate: newFirstExperienceDate,
        } = mergeExperienceMMKV(totalSteps, lastCheckedDateTime);

        setExperienceState(totalSteps);
        setCumulativeExperienceState(newCumulativeExperience);
        setFirstExperienceDateState(newFirstExperienceDate);
        setStepsByDayState(results);

        // Batch update all related health data
        const experienceDifference = totalSteps - previousExperience;
        const currencyToAdd =
          experienceDifference > 0
            ? convertExperienceToCurrency(experienceDifference)
            : 0;

        const currentCurrency = getCurrency();
        const batchUpdate = {
          experience: totalSteps,
          cumulativeExperience: newCumulativeExperience,
          firstExperienceDate: newFirstExperienceDate,
          stepsByDay: results,
          currency: currentCurrency + currencyToAdd,
          lastCheckedDate: lastCheckedDateTime.toISOString(),
        };

        await updateHealthCore(batchUpdate);

        if (experienceDifference > 0) {
          console.log(
            `Auto-converted ${experienceDifference} XP to ${currencyToAdd} currency`
          );
        }
      } catch (error) {
        console.error('Error getting step count for experience:', error);
        await handleError();
      }
    };

    getExperienceFromSteps();

    const interval = setInterval(getExperienceFromSteps, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [lastCheckedDateTime]);

  return {
    experience,
    cumulativeExperience,
    firstExperienceDate,
    stepsByDay,
  };
};

/**
 * Creates a streak object from streak data
 */
const createStreak = (
  currentStreakStart: Date,
  currentStreakDays: { date: Date; steps: number }[]
): Streak => {
  const averageSteps =
    currentStreakDays.reduce((sum, d) => sum + d.steps, 0) /
    currentStreakDays.length;

  return {
    id: `${currentStreakStart.toISOString()}-${new Date(currentStreakDays[currentStreakDays.length - 1].date).toISOString()}`,
    startDate: currentStreakStart.toISOString(),
    endDate: new Date(
      currentStreakDays[currentStreakDays.length - 1].date
    ).toISOString(),
    daysCount: currentStreakDays.length,
    averageSteps: Math.round(averageSteps),
  };
};

/**
 * Detects and tracks streaks based on daily step goals
 *
 * A streak is defined as 2 or more consecutive days where
 * the user met their daily step goal.
 *
 * @param stepsByDay - Array of daily step data
 * @param dailyGoal - The daily step goal to check against
 * @returns Array of detected streaks
 */
export const detectStreaks = (
  stepsByDay: { date: Date; steps: number }[],
  dailyGoal: number
): Streak[] => {
  const streaks: Streak[] = [];
  let currentStreakStart: Date | null = null;
  let currentStreakDays: { date: Date; steps: number }[] = [];

  // Sort steps by date to ensure chronological order
  const sortedSteps = [...stepsByDay].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (const day of sortedSteps) {
    const metGoal = day.steps >= dailyGoal;

    if (metGoal) {
      if (currentStreakStart === null) {
        // Start a new streak
        currentStreakStart = new Date(day.date);
        currentStreakDays = [day];
      } else {
        // Continue current streak
        currentStreakDays.push(day);
      }
    } else {
      // Goal not met, check if we had a streak to save
      if (currentStreakStart !== null && currentStreakDays.length >= 2) {
        streaks.push(createStreak(currentStreakStart, currentStreakDays));
      }

      // Reset streak tracking
      currentStreakStart = null;
      currentStreakDays = [];
    }
  }

  // Check if we have an ongoing streak at the end
  if (currentStreakStart !== null && currentStreakDays.length >= 2) {
    streaks.push(createStreak(currentStreakStart, currentStreakDays));
  }

  return streaks;
};

/**
 * Hook to track and manage streaks
 *
 * @param lastCheckedDateTime - The date when experience was last checked
 * @returns Object containing current streaks and streak detection function
 */
// eslint-disable-next-line max-lines-per-function
export const useStreakTracking = (lastCheckedDateTime: Date) => {
  const { stepsByDay } = useStepCountAsExperience(lastCheckedDateTime);
  const dailyGoal = getDailyStepsGoal();
  const [streaks] = useStreaks();

  // Detect new streaks whenever stepsByDay changes
  React.useEffect(() => {
    if (stepsByDay.length > 0) {
      const detectedStreaks = detectStreaks(stepsByDay, dailyGoal);

      // Find new streaks that aren't already stored
      const existingStreakIds = new Set(streaks.map((s: Streak) => s.id));
      const newStreaks = detectedStreaks.filter(
        (streak) => !existingStreakIds.has(streak.id)
      );

      // Add new streaks to storage
      newStreaks.forEach((streak) => {
        addStreak(streak);
      });
    }
  }, [stepsByDay, dailyGoal, streaks]);

  return {
    streaks,
    currentStreak: streaks.length > 0 ? streaks[streaks.length - 1] : null,
    longestStreak:
      streaks.length > 0
        ? Math.max(...streaks.map((s: Streak) => s.daysCount))
        : 0,
  };
};

/**
 * Hook for accessing cumulative experience data
 *
 * This hook provides easy access to cumulative experience tracking
 * from the first time the user started using the app.
 *
 * @param lastCheckedDateTime - The date when experience was last checked
 * @returns Object containing cumulative experience and first experience date
 */
export const useCumulativeExperience = (lastCheckedDateTime: Date) => {
  const { cumulativeExperience, firstExperienceDate } =
    useStepCountAsExperience(lastCheckedDateTime);

  return {
    cumulativeExperience,
    firstExperienceDate,
  };
};

/**
 * Simple hook for accessing cumulative experience data
 *
 * This hook automatically uses the last checked date from storage
 * and provides easy access to cumulative experience tracking.
 *
 * @returns Object containing cumulative experience and first experience date
 */
export const useCumulativeExperienceSimple = () => {
  const [lastCheckedDate] = useLastCheckedDate();

  // Default to start of today if not set
  const lastCheckedDateTime = lastCheckedDate
    ? new Date(lastCheckedDate)
    : (() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
      })();

  const { cumulativeExperience, firstExperienceDate } =
    useStepCountAsExperience(lastCheckedDateTime);

  return {
    cumulativeExperience,
    firstExperienceDate,
  };
};

/**
 * Currency conversion rates and settings
 */
const CURRENCY_CONVERSION_RATES = {
  XP_TO_CURRENCY: 0.1, // 10 XP = 1 Currency
  MILESTONE_BONUS: 50, // Bonus currency for reaching milestones
  STREAK_BONUS: 25, // Bonus currency for completing streaks
};

/**
 * Converts experience points to currency
 * @param experience - Experience points to convert
 * @returns Currency amount
 */
export const convertExperienceToCurrency = (experience: number): number => {
  return Math.floor(experience * CURRENCY_CONVERSION_RATES.XP_TO_CURRENCY);
};

/**
 * Hook for managing the currency system
 *
 * Since experience is now automatically converted to currency,
 * availableCurrency will always be 0 as all new experience
 * is immediately converted and stored.
 *
 * @param lastCheckedDateTime - The date when experience was last checked
 * @returns Object containing currency data and conversion functions
 */
export const useCurrencySystem = (lastCheckedDateTime: Date) => {
  const { cumulativeExperience } =
    useStepCountAsExperience(lastCheckedDateTime);
  const [currency] = useCurrency();

  // Since experience is auto-converted, available currency is always 0
  const availableCurrency = 0;
  const totalCurrencyEarned = convertExperienceToCurrency(cumulativeExperience);

  // Function to convert current experience to currency (now just returns 0)
  const convertCurrentExperience = async () => {
    // Experience is automatically converted, so this function is deprecated
    console.log('Experience is now automatically converted to currency');
    return 0;
  };

  // Function to spend currency
  const spend = async (amount: number): Promise<boolean> => {
    return await spendCurrency(amount);
  };

  return {
    currency,
    availableCurrency,
    totalCurrencyEarned,
    convertCurrentExperience,
    spend,
    conversionRate: CURRENCY_CONVERSION_RATES.XP_TO_CURRENCY,
  };
};
