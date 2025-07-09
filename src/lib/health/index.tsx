import HealthKit, {
  HKQuantityTypeIdentifier,
  HKStatisticsOptions,
  HKUnits,
} from '@kingstinct/react-native-healthkit';
import { useEffect, useState } from 'react';

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

// New hook for character sheet experience points
export const useStepCountAsExperience = () => {
  const [experience, setExperience] = useState<number>(0);

  useEffect(() => {
    const getExperienceFromSteps = async () => {
      try {
        const stepCount = await getTodayStepCount();
        // Convert steps to experience points (1 step = 1 XP)
        setExperience(stepCount || 0);
      } catch (error) {
        console.error('Error getting step count for experience:', error);
        setExperience(0);
      }
    };

    getExperienceFromSteps();
    
    // Refresh every 5 minutes to keep experience updated
    const interval = setInterval(getExperienceFromSteps, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return experience;
};
