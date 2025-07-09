import HealthKit, {
  HKQuantityTypeIdentifier,
  HKStatisticsOptions,
  HKUnits,
} from '@kingstinct/react-native-healthkit';
import { useEffect, useState } from 'react';
import { useMMKVString } from 'react-native-mmkv';

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

type ExperienceEntry = { date: string; experience: number };
type StepEntry = { date: string | Date; steps: number };

function mergeExperienceMMKV(
  results: StepEntry[],
  experienceMMKV: string | undefined
): ExperienceEntry[] {
  let previousExp: ExperienceEntry[] = [];
  try {
    previousExp = experienceMMKV ? JSON.parse(experienceMMKV) : [];
  } catch {
    previousExp = [];
  }
  const expMap = new Map<string, ExperienceEntry>(
    previousExp.map((item: ExperienceEntry) => [item.date, item])
  );
  results.forEach((item: StepEntry) => {
    const dayKey = new Date(item.date).toISOString().split('T')[0];
    expMap.set(dayKey, { date: dayKey, experience: item.steps });
  });
  return Array.from(expMap.values()).sort(
    (a: ExperienceEntry, b: ExperienceEntry) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

function mergeStepsByDayMMKV(
  results: StepEntry[],
  stepsByDayMMKV: string | undefined
): StepEntry[] {
  let previous: StepEntry[] = [];
  try {
    previous = stepsByDayMMKV ? JSON.parse(stepsByDayMMKV) : [];
  } catch {
    previous = [];
  }
  const prevMap = new Map<string, StepEntry>(
    previous.map((item: StepEntry) => [
      new Date(item.date).toISOString().split('T')[0],
      item,
    ])
  );
  results.forEach((item: StepEntry) => {
    const dayKey = new Date(item.date).toISOString().split('T')[0];
    prevMap.set(dayKey, { ...item, date: dayKey });
  });
  return Array.from(prevMap.values()).sort(
    (a: StepEntry, b: StepEntry) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

// New hook for character sheet experience points
export const useStepCountAsExperience = (lastCheckedDateTime: Date) => {
  const [experience, setExperience] = useState<number>(0);
  const [stepsByDay, setStepsByDay] = useState<{ date: Date; steps: number }[]>(
    []
  );
  const [experienceMMKV, setExperienceMMKV] = useMMKVString('experience');
  const [stepsByDayMMKV, setStepsByDayMMKV] = useMMKVString('stepsByDay');

  // Initialize from MMKV on mount
  useEffect(() => {
    if (experienceMMKV !== undefined) {
      setExperience(Number(experienceMMKV) || 0);
    }
    if (stepsByDayMMKV !== undefined) {
      try {
        const parsed = JSON.parse(stepsByDayMMKV);
        setStepsByDay(Array.isArray(parsed) ? parsed : []);
      } catch {
        setStepsByDay([]);
      }
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const getExperienceFromSteps = async () => {
      try {
        const now = new Date();
        const results = await getStepsGroupedByDay(lastCheckedDateTime, now);
        const totalSteps = results.reduce(
          (sum, day) => sum + (day.steps || 0),
          0
        );
        setExperience(totalSteps);
        setStepsByDay(results);
        // Use helpers to merge and store
        const mergedExp = mergeExperienceMMKV(results, experienceMMKV);
        setExperienceMMKV(JSON.stringify(mergedExp));
        const merged = mergeStepsByDayMMKV(results, stepsByDayMMKV);
        setStepsByDayMMKV(JSON.stringify(merged));
      } catch (error) {
        console.error('Error getting step count for experience:', error);
        setExperience(0);
        setStepsByDay([]);
        setExperienceMMKV('0');
        setStepsByDayMMKV('[]');
      }
    };

    getExperienceFromSteps();

    const interval = setInterval(getExperienceFromSteps, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [lastCheckedDateTime, setExperienceMMKV, setStepsByDayMMKV]);

  return { experience, stepsByDay };
};
