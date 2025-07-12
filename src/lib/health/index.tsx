import HealthKit, {
  HKQuantityTypeIdentifier,
  HKStatisticsOptions,
  HKUnits,
} from '@kingstinct/react-native-healthkit';
import { useEffect, useState } from 'react';

import {
  getCumulativeExperience,
  getExperience,
  getFirstExperienceDate,
  getStepsByDay,
  setCumulativeExperience,
  setExperience,
  setFirstExperienceDate,
  setStepsByDay,
  useLastCheckedDate,
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

type _StepEntry = { date: string | Date; steps: number };

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
 * from the first time the user started using the app.
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

        // Use mergeExperienceMMKV to update cumulative experience
        const {
          cumulativeExperience: newCumulativeExperience,
          firstExperienceDate: newFirstExperienceDate,
        } = mergeExperienceMMKV(totalSteps, lastCheckedDateTime);

        setExperienceState(totalSteps);
        setCumulativeExperienceState(newCumulativeExperience);
        setFirstExperienceDateState(newFirstExperienceDate);
        setStepsByDayState(results);

        // Save to storage
        await setExperience(totalSteps);
        await setStepsByDay(results);
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
