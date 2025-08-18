import HealthKit, {
  HKQuantityTypeIdentifier,
  HKStatisticsOptions,
  HKUnits,
} from '@kingstinct/react-native-healthkit';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  getCumulativeExperience,
  getCurrency,
  getDailyStepsGoal,
  getExperience,
  getFirstExperienceDate,
  getLastCheckedDate,
  getManualStepsByDay,
  getStepsByDay,
  setCumulativeExperience,
  setExperience,
  setFirstExperienceDate,
  setStepsByDay,
  spendCurrency,
  storage,
  type Streak,
  updateHealthCore,
  useCurrency,
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

// Manual Entry Mode Storage
const MANUAL_ENTRY_MODE_KEY = 'manualEntryMode';

// Shared experience state to avoid circular dependencies
let globalExperienceState: {
  experience: number;
  cumulativeExperience: number;
  firstExperienceDate: string | null;
  stepsByDay: { date: Date; steps: number }[];
} = {
  experience: 0,
  cumulativeExperience: 0,
  firstExperienceDate: null,
  stepsByDay: [],
};

// Function to update global state
const updateGlobalExperienceState = (
  newState: Partial<typeof globalExperienceState>
) => {
  globalExperienceState = { ...globalExperienceState, ...newState };
};

// Function to get global state
const getGlobalExperienceState = () => ({ ...globalExperienceState });

// Main consolidated experience hook
// eslint-disable-next-line max-lines-per-function
export const useExperienceData = () => {
  const [experience, setExperienceState] = useState<number>(0);
  const [cumulativeExperience, setCumulativeExperienceState] =
    useState<number>(0);
  const [firstExperienceDate, setFirstExperienceDateState] = useState<
    string | null
  >(null);
  const [stepsByDay, setStepsByDayState] = useState<
    { date: Date; steps: number }[]
  >([]);

  // Guard against multiple simultaneous executions
  const isUpdatingRef = React.useRef(false);

  // Function to manually refresh experience data
  const refreshExperience = useCallback(async () => {
    if (isUpdatingRef.current) {
      return;
    }

    isUpdatingRef.current = true;
    try {
      await getExperienceFromStepsHelper({
        lastCheckedDateTime: new Date(), // Use current time for refresh
        setExperienceState,
        setCumulativeExperienceState,
        setFirstExperienceDateState,
        setStepsByDayState,
      });
    } finally {
      isUpdatingRef.current = false;
    }
  }, []);

  // Initialize from storage on mount
  useEffect(() => {
    const initializeFromStorage = () => {
      const storedExperience = getExperience();
      const storedCumulativeExperience = getCumulativeExperience();
      const storedFirstExperienceDate = getFirstExperienceDate();
      const storedStepsByDay = getStepsByDay();

      setExperienceState(storedExperience);
      setCumulativeExperienceState(storedCumulativeExperience);
      setFirstExperienceDateState(storedFirstExperienceDate);
      setStepsByDayState(storedStepsByDay);

      // Update global state
      updateGlobalExperienceState({
        experience: storedExperience,
        cumulativeExperience: storedCumulativeExperience,
        firstExperienceDate: storedFirstExperienceDate,
        stepsByDay: storedStepsByDay,
      });
    };

    initializeFromStorage();
  }, []);

  // Update global state whenever local state changes
  useEffect(() => {
    updateGlobalExperienceState({
      experience,
      cumulativeExperience,
      firstExperienceDate,
      stepsByDay,
    });
  }, [experience, cumulativeExperience, firstExperienceDate, stepsByDay]);

  return {
    experience,
    cumulativeExperience,
    firstExperienceDate,
    stepsByDay,
    refreshExperience,
  };
};

export function getManualEntryMode(): boolean {
  const value = storage.getString(MANUAL_ENTRY_MODE_KEY);
  return value ? JSON.parse(value) || false : false;
}

export async function setManualEntryMode(enabled: boolean) {
  storage.set(MANUAL_ENTRY_MODE_KEY, JSON.stringify(enabled));
}

export async function clearManualEntryMode() {
  storage.delete(MANUAL_ENTRY_MODE_KEY);
}

// Manual Entry Mode Context
interface ManualModeContextType {
  isManualMode: boolean;
  setManualMode: (enabled: boolean) => Promise<void>;
  isLoading: boolean;
}

const ManualModeContext = createContext<ManualModeContextType | undefined>(
  undefined
);

export const ManualModeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load from storage on mount
  useEffect(() => {
    const loadManualEntryMode = async () => {
      try {
        const mode = getManualEntryMode();
        setIsManualMode(mode);
        console.log(
          '[ManualModeProvider] Loaded manual mode from storage:',
          mode
        );
      } catch (error) {
        console.error('Error loading manual entry mode:', error);
        setIsManualMode(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadManualEntryMode();
  }, []);

  // Set manual mode (updates both context and storage)
  const setManualMode = async (enabled: boolean) => {
    try {
      await setManualEntryMode(enabled);
      setIsManualMode(enabled);
      console.log('[ManualModeProvider] Set manual mode:', enabled);
    } catch (error) {
      console.error('Error setting manual entry mode:', error);
    }
  };

  return (
    <ManualModeContext.Provider
      value={{ isManualMode, setManualMode, isLoading }}
    >
      {children}
    </ManualModeContext.Provider>
  );
};

// Manual Entry Mode Hook
export const useManualEntryMode = () => {
  const context = useContext(ManualModeContext);
  if (!context) {
    throw new Error(
      'useManualEntryMode must be used within ManualModeProvider'
    );
  }
  return context;
};

// Developer Mode Storage
const DEVELOPER_MODE_KEY = 'developerMode';

export function getDeveloperMode(): boolean {
  const value = storage.getString(DEVELOPER_MODE_KEY);
  return value ? JSON.parse(value) || false : false;
}

export async function setDeveloperMode(enabled: boolean) {
  storage.set(DEVELOPER_MODE_KEY, JSON.stringify(enabled));
}

export async function clearDeveloperMode() {
  storage.delete(DEVELOPER_MODE_KEY);
}

// Developer Mode Context
interface DeveloperModeContextType {
  isDeveloperMode: boolean;
  setDevMode: (enabled: boolean) => Promise<void>;
  isLoading: boolean;
}

const DeveloperModeContext = createContext<
  DeveloperModeContextType | undefined
>(undefined);

export const DeveloperModeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isDeveloperMode, setIsDeveloperMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load from storage on mount
  useEffect(() => {
    const loadDeveloperMode = async () => {
      try {
        const mode = getDeveloperMode();
        setIsDeveloperMode(mode);
      } catch (error) {
        console.error('Error loading developer mode:', error);
        setIsDeveloperMode(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadDeveloperMode();
  }, []);

  // Set developer mode (updates both context and storage)
  const setDevMode = async (enabled: boolean) => {
    try {
      await setDeveloperMode(enabled);
      setIsDeveloperMode(enabled);
    } catch (error) {
      console.error('Error setting developer mode:', error);
    }
  };

  return (
    <DeveloperModeContext.Provider
      value={{ isDeveloperMode, setDevMode, isLoading }}
    >
      {children}
    </DeveloperModeContext.Provider>
  );
};

// Combined provider for both manual and developer modes
export const HealthModeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <ManualModeProvider>
      <DeveloperModeProvider>{children}</DeveloperModeProvider>
    </ManualModeProvider>
  );
};

export const useDeveloperMode = () => {
  const context = useContext(DeveloperModeContext);
  if (!context) {
    throw new Error(
      'useDeveloperMode must be used within DeveloperModeProvider'
    );
  }
  return context;
};

// Enhanced HealthKit availability status types
export type HealthKitAvailabilityStatus =
  | 'available'
  | 'not_available'
  | 'permission_denied'
  | 'not_supported'
  | 'loading'
  | 'error';

export type HealthKitAvailabilityResult = {
  status: HealthKitAvailabilityStatus;
  error?: string;
  canRequestPermission: boolean;
};

const useHealthKitAvailability = (): HealthKitAvailabilityResult => {
  const [status, setStatus] = useState<HealthKitAvailabilityStatus>('loading');
  const [error, setError] = useState<string | undefined>(undefined);
  const [canRequestPermission, setCanRequestPermission] =
    useState<boolean>(false);

  useEffect(() => {
    const checkAvailability = async () => {
      try {
        setStatus('loading');
        setError(undefined);

        // Check if HealthKit is available on the device
        const isAvailable = await HealthKit.isHealthDataAvailable();

        if (!isAvailable) {
          setStatus('not_supported');
          setCanRequestPermission(false);
          return;
        }

        // HealthKit is available, now check authorization status
        try {
          await HealthKit.getRequestStatusForAuthorization([
            HKQuantityTypeIdentifier.stepCount,
          ]);

          // For now, assume we can request permission if HealthKit is available
          // The actual permission request will be handled by the useHealthKit hook
          setCanRequestPermission(true);
          setStatus('available');
        } catch (authError) {
          console.error('Error checking authorization status:', authError);
          // If we can't check authorization status, it might be due to permission issues
          setStatus('permission_denied');
          setError(
            'HealthKit permissions have been denied. Please enable in Settings.'
          );
          setCanRequestPermission(false);
        }
      } catch (error) {
        console.error('Error checking HealthKit availability:', error);
        setStatus('error');
        setError('Failed to check HealthKit availability');
        setCanRequestPermission(false);
      }
    };

    checkAvailability();
  }, []);

  return {
    status,
    error,
    canRequestPermission,
  };
};

export const useHealthKit = () => {
  const availability = useHealthKitAvailability();
  const [hasRequestedAuthorization, setHasRequestedAuthorization] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    if (
      availability.status === 'available' &&
      availability.canRequestPermission
    ) {
      HealthKit.requestAuthorization([HKQuantityTypeIdentifier.stepCount])
        .then(() => {
          setHasRequestedAuthorization(true);
        })
        .catch((error) => {
          console.error('Error requesting HealthKit authorization:', error);
          setHasRequestedAuthorization(false);
        });
    }
  }, [availability.status, availability.canRequestPermission]);

  return {
    isAvailable: availability.status === 'available',
    hasRequestedAuthorization,
    availabilityStatus: availability.status,
    availabilityError: availability.error,
  };
};

// Fallback Logic Types
export type FallbackSuggestion =
  | 'none'
  | 'suggest_manual'
  | 'force_manual'
  | 'retry_healthkit';

export type FallbackLogicResult = {
  shouldUseManualEntry: boolean;
  suggestion: FallbackSuggestion;
  reason: string;
  canRetryHealthKit: boolean;
  isLoading: boolean;
  error?: string;
};

// Helper function to determine fallback logic
const determineFallbackLogic = (params: {
  availabilityStatus: HealthKitAvailabilityStatus;
  isManualMode: boolean;
  setSuggestion: (suggestion: FallbackSuggestion) => void;
  setReason: (reason: string) => void;
  setCanRetryHealthKit: (canRetry: boolean) => void;
}) => {
  const {
    availabilityStatus,
    isManualMode,
    setSuggestion,
    setReason,
    setCanRetryHealthKit,
  } = params;

  if (isManualMode) {
    setSuggestion('none');
    setReason('User has chosen manual entry mode');
    setCanRetryHealthKit(true);
    return;
  }

  if (availabilityStatus === 'available') {
    setSuggestion('none');
    setReason('HealthKit is available and working');
    setCanRetryHealthKit(false);
    return;
  }

  if (availabilityStatus === 'not_supported') {
    setSuggestion('force_manual');
    setReason('HealthKit is not supported on this device');
    setCanRetryHealthKit(false);
    return;
  }

  if (availabilityStatus === 'permission_denied') {
    setSuggestion('suggest_manual');
    setReason(
      'HealthKit permissions have been denied. You can still track your steps manually.'
    );
    setCanRetryHealthKit(true);
    return;
  }

  if (availabilityStatus === 'loading') {
    setSuggestion('none');
    setReason('Checking HealthKit availability...');
    setCanRetryHealthKit(false);
    return;
  }

  if (availabilityStatus === 'error') {
    setSuggestion('suggest_manual');
    setReason(
      'HealthKit is experiencing issues. You can track your steps manually.'
    );
    setCanRetryHealthKit(true);
    return;
  }

  setSuggestion('suggest_manual');
  setReason('HealthKit is not available. You can track your steps manually.');
  setCanRetryHealthKit(true);
};

// Auto-switch logic for manual mode
const useAutoSwitchToManual = (params: {
  availability: HealthKitAvailabilityResult;
  isManualMode: boolean;
  setManualMode: (enabled: boolean) => Promise<void>;
  isDeveloperMode: boolean;
}) => {
  const { availability, isManualMode, setManualMode, isDeveloperMode } = params;
  useEffect(() => {
    const autoSwitchToManual = async () => {
      // Auto-switch to manual mode if HealthKit is not supported or developer mode is enabled
      if (
        (availability.status === 'not_supported' && !isManualMode) ||
        isDeveloperMode
      ) {
        try {
          await setManualMode(true);
        } catch (error) {
          console.error('Error auto-switching to manual mode:', error);
        }
      }
    };
    autoSwitchToManual();
  }, [availability.status, isManualMode, setManualMode, isDeveloperMode]);
};

// Comprehensive Fallback Logic Hook
// eslint-disable-next-line max-lines-per-function
export const useHealthKitFallback = (): FallbackLogicResult => {
  const availability = useHealthKitAvailability();
  const {
    isManualMode,
    setManualMode,
    isLoading: manualModeLoading,
  } = useManualEntryMode();
  const { isDeveloperMode, isLoading: developerModeLoading } =
    useDeveloperMode();
  const [suggestion, setSuggestion] = useState<FallbackSuggestion>('none');
  const [reason, setReason] = useState<string>('');
  const [canRetryHealthKit, setCanRetryHealthKit] = useState<boolean>(false);

  useEffect(() => {
    if (isDeveloperMode) {
      setSuggestion('force_manual');
      setReason('Developer mode is enabled. HealthKit checks are bypassed.');
      setCanRetryHealthKit(false);
      return;
    }
    determineFallbackLogic({
      availabilityStatus: availability.status,
      isManualMode,
      setSuggestion,
      setReason,
      setCanRetryHealthKit,
    });
  }, [availability.status, isManualMode, availability.error, isDeveloperMode]);

  useEffect(() => {
    if (suggestion === 'force_manual') {
      setReason('Developer mode is enabled. HealthKit checks are bypassed.');
    } else if (availability.status === 'not_supported') {
      setReason('HealthKit is not supported on this device');
    } else if (availability.status === 'permission_denied') {
      setReason(
        'HealthKit permissions have been denied. You can still track your steps manually.'
      );
    } else if (availability.status === 'loading') {
      setReason('Checking HealthKit availability...');
    } else if (availability.status === 'error') {
      setReason(
        'HealthKit is experiencing issues. You can track your steps manually.'
      );
    } else {
      setReason(
        'HealthKit is not available. You can track your steps manually.'
      );
    }
  }, [suggestion, availability.status]);

  // Auto-switch to manual mode for certain scenarios
  useAutoSwitchToManual({
    availability,
    isManualMode,
    setManualMode,
    isDeveloperMode,
  });

  const shouldUseManualEntry =
    isManualMode || suggestion === 'force_manual' || isDeveloperMode;

  return {
    shouldUseManualEntry,
    suggestion,
    reason,
    canRetryHealthKit,
    isLoading:
      availability.status === 'loading' ||
      manualModeLoading ||
      developerModeLoading,
    error: availability.error,
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

// Helper function to check if data is fresh
const isDataFresh = (lastCheckedDate: string | null): boolean => {
  if (!lastCheckedDate) return false;
  return new Date(lastCheckedDate) > new Date(Date.now() - 60 * 60 * 1000);
};

// Helper function to detect and log data conflicts
const logDataConflict = (
  date: string,
  localSteps: number,
  healthKitSteps: number
): void => {
  const difference = Math.abs(localSteps - healthKitSteps);
  const threshold = Math.max(100, localSteps * 0.1); // 10% or 100 steps
  if (difference > threshold) {
    console.log(
      `Data conflict detected for ${date}: Local=${localSteps}, HealthKit=${healthKitSteps}, using HealthKit data`
    );
  }
};

// Helper function to query HealthKit for a specific day
const queryHealthKitForDay = async (
  dayStart: Date,
  dayEnd: Date
): Promise<number> => {
  try {
    const result = await HealthKit.queryStatisticsForQuantity(
      HKQuantityTypeIdentifier.stepCount,
      [HKStatisticsOptions.cumulativeSum],
      dayStart,
      dayEnd,
      HKUnits.Count
    );
    return result.sumQuantity?.quantity ?? 0;
  } catch (error) {
    console.log(error);
    return 0;
  }
};

async function getStepsForDaySum({
  dayStart,
  dayEnd,
  storedHealthKitData,
  manualSteps,
  dataIsFresh,
}: {
  dayStart: Date;
  dayEnd: Date;
  storedHealthKitData: { date: Date; steps: number }[];
  manualSteps: { date: string; steps: number; source: 'manual' }[];
  dataIsFresh: boolean;
}): Promise<{ date: Date; steps: number }> {
  const dateStr = dayStart.toISOString().split('T')[0];

  // HealthKit steps for this date
  let healthKitSteps = 0;
  const storedEntry = storedHealthKitData.find((entry) => {
    const entryDate =
      typeof entry.date === 'string' ? new Date(entry.date) : entry.date;
    return entryDate.toISOString().split('T')[0] === dateStr;
  });
  if (storedEntry && dataIsFresh) {
    healthKitSteps = storedEntry.steps;
  } else {
    healthKitSteps = await queryHealthKitForDay(dayStart, dayEnd);
    // Optionally update storage if stale
    if (storedEntry && !dataIsFresh) {
      logDataConflict(dateStr, storedEntry.steps, healthKitSteps);
      storedEntry.steps = healthKitSteps;
      const updatedArray = storedHealthKitData.map((entry) => {
        const entryDate =
          typeof entry.date === 'string' ? new Date(entry.date) : entry.date;
        if (entryDate.toISOString().split('T')[0] === dateStr) {
          return { ...entry, steps: healthKitSteps };
        }
        return entry;
      });
      if (typeof setStepsByDay === 'function') {
        await setStepsByDay(updatedArray);
      }
    }
  }
  // Manual steps for this date
  const manualEntry = manualSteps.find((entry) => entry.date === dateStr);
  const manualStepsValue = manualEntry ? manualEntry.steps : 0;

  // Sum both sources
  return {
    date: new Date(dateStr),
    steps: healthKitSteps + manualStepsValue,
  };
}

const getStepsGroupedByDay = async (
  startDate: Date,
  endDate: Date = new Date()
) => {
  const results: { date: Date; steps: number }[] = [];
  let current = new Date(startDate);
  current.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  // Get stored HealthKit data
  const storedHealthKitData = getStepsByDay();

  // Check if data is fresh (less than 1 hour old)
  const lastCheckedDate = getLastCheckedDate();
  const dataIsFresh = isDataFresh(lastCheckedDate);

  while (current <= end) {
    const dayStart = new Date(current);
    const dayEnd = new Date(current);
    dayEnd.setHours(23, 59, 59, 999);

    // Only get HealthKit data, not combined data
    const dateStr = dayStart.toISOString().split('T')[0];
    let healthKitSteps = 0;
    const storedEntry = storedHealthKitData.find((entry) => {
      const entryDate =
        typeof entry.date === 'string' ? new Date(entry.date) : entry.date;
      return entryDate.toISOString().split('T')[0] === dateStr;
    });
    if (storedEntry && dataIsFresh) {
      healthKitSteps = storedEntry.steps;
    } else {
      healthKitSteps = await queryHealthKitForDay(dayStart, dayEnd);
      // Optionally update storage if stale
      if (storedEntry && !dataIsFresh) {
        logDataConflict(dateStr, storedEntry.steps, healthKitSteps);
        storedEntry.steps = healthKitSteps;
        const updatedArray = storedHealthKitData.map((entry) => {
          const entryDate =
            typeof entry.date === 'string' ? new Date(entry.date) : entry.date;
          if (entryDate.toISOString().split('T')[0] === dateStr) {
            return { ...entry, steps: healthKitSteps };
          }
          return entry;
        });
        if (typeof setStepsByDay === 'function') {
          await setStepsByDay(updatedArray);
        }
      }
    }

    results.push({
      date: new Date(dateStr),
      steps: healthKitSteps,
    });

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
 * Merges HealthKit and manual step data, prioritizing manual entries
 */
const mergeStepData = (
  healthKitResults: { date: Date; steps: number }[],
  manualSteps: { date: string; steps: number; source: 'manual' }[]
): { date: Date; steps: number }[] => {
  // Map dates to steps for both sources
  const stepMap = new Map<string, number>();

  // Add HealthKit steps
  healthKitResults.forEach((entry) => {
    const dateStr =
      entry.date instanceof Date
        ? entry.date.toISOString().split('T')[0]
        : new Date(entry.date).toISOString().split('T')[0];
    stepMap.set(dateStr, (stepMap.get(dateStr) || 0) + entry.steps);
  });

  // Add manual steps (sum with HealthKit if exists)
  manualSteps.forEach((entry) => {
    const dateStr = entry.date;
    stepMap.set(dateStr, (stepMap.get(dateStr) || 0) + entry.steps);
  });

  // Convert back to array of { date, steps }
  const mergedResults = Array.from(stepMap.entries()).map(
    ([dateStr, steps]) => ({
      date: new Date(dateStr),
      steps,
    })
  );

  // Sort by date
  mergedResults.sort((a, b) => a.date.getTime() - b.date.getTime());

  return mergedResults;
};

/**
 * Updates health data with new experience and step information
 */
const updateHealthData = async (params: {
  totalSteps: number;
  previousExperience: number;
  newCumulativeExperience: number;
  newFirstExperienceDate: string | null;
  mergedResults: { date: Date; steps: number }[];
  lastCheckedDateTime: Date;
}) => {
  const {
    totalSteps,
    previousExperience,
    newCumulativeExperience,
    newFirstExperienceDate,
    mergedResults,
    lastCheckedDateTime,
  } = params;

  // Prevent duplicate updates by checking if experience actually changed
  if (totalSteps === previousExperience) {
    return;
  }

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
    stepsByDay: mergedResults,
    currency: currentCurrency + currencyToAdd,
    lastCheckedDate: lastCheckedDateTime.toISOString(),
  };

  await updateHealthCore(batchUpdate);

  if (experienceDifference > 0) {
    console.log(
      `Auto-converted ${experienceDifference} XP to ${currencyToAdd} currency`
    );
  }
};

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
// Helper function to get experience from steps
const getExperienceFromStepsHelper = async (params: {
  lastCheckedDateTime: Date;
  setExperienceState: (value: number) => void;
  setCumulativeExperienceState: (value: number) => void;
  setFirstExperienceDateState: (value: string | null) => void;
  setStepsByDayState: (value: { date: Date; steps: number }[]) => void;
}) => {
  const {
    lastCheckedDateTime,
    setExperienceState,
    setCumulativeExperienceState,
    setFirstExperienceDateState,
    setStepsByDayState,
  } = params;
  try {
    const now = new Date();
    const healthKitResults = await getStepsGroupedByDay(
      lastCheckedDateTime,
      now
    );

    // Get manual step entries and merge with HealthKit data
    const manualSteps = getManualStepsByDay();
    const mergedResults = mergeStepData(healthKitResults, manualSteps);

    const totalSteps = mergedResults.reduce(
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
    setStepsByDayState(mergedResults);

    // Update health data
    await updateHealthData({
      totalSteps,
      previousExperience,
      newCumulativeExperience,
      newFirstExperienceDate,
      mergedResults,
      lastCheckedDateTime,
    });
  } catch (error) {
    console.error('Error getting step count for experience:', error);
    // Handle error by resetting state
    setExperienceState(0);
    setCumulativeExperienceState(0);
    setFirstExperienceDateState(null);
    setStepsByDayState([]);
    await setExperience(0);
    await setStepsByDay([]);
  }
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
 * This hook uses global experience state to avoid circular dependencies
 * @returns Object containing current streaks and streak detection function
 */
// eslint-disable-next-line max-lines-per-function
export const useStreakTracking = () => {
  const [streaks, setStreaks] = React.useState<Streak[]>([]);
  const dailyGoal = getDailyStepsGoal();

  // Use global state instead of calling useStepCountAsExperience
  const { stepsByDay } = getGlobalExperienceState();

  React.useEffect(() => {
    if (stepsByDay.length > 0) {
      const detectedStreaks = detectStreaks(stepsByDay, dailyGoal);
      setStreaks(detectedStreaks);
      // Optionally, also update storage if needed
      // setStreaksInStorage(detectedStreaks);
    }
  }, [stepsByDay, dailyGoal]);

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
 * Uses global state to avoid circular dependencies.
 *
 * @returns Object containing cumulative experience and first experience date
 */
export const useCumulativeExperience = () => {
  const { cumulativeExperience, firstExperienceDate } =
    getGlobalExperienceState();

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
 * Uses global state to avoid circular dependencies.
 *
 * @returns Object containing cumulative experience and first experience date
 */
export const useCumulativeExperienceSimple = () => {
  const { cumulativeExperience, firstExperienceDate } =
    getGlobalExperienceState();

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
 * Uses global state to avoid circular dependencies.
 *
 * @returns Object containing currency data and conversion functions
 */
export const useCurrencySystem = () => {
  const { cumulativeExperience } = getGlobalExperienceState();
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
