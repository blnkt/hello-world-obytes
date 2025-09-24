import type { Streak } from '../src/lib/storage';

// Health Hooks Return Types
export interface ExperienceDataReturn {
  experience: number;
  cumulativeExperience: number;
  refreshExperience: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export interface ManualEntryModeReturn {
  isManualEntryMode: boolean;
  setManualEntryMode: (enabled: boolean) => Promise<void>;
  toggleManualEntryMode: () => Promise<void>;
}

export interface DeveloperModeReturn {
  isDeveloperMode: boolean;
  setDevMode: (enabled: boolean) => Promise<void>;
  toggleDevMode: () => Promise<void>;
}

export interface HealthKitReturn {
  isAvailable: boolean;
  hasRequestedAuthorization: boolean | null;
  availabilityStatus: string;
  availabilityError: string | null | undefined;
  requestAuthorization: () => Promise<boolean>;
}

export interface HealthKitFallbackReturn {
  shouldUseManualEntry: boolean;
  suggestion: 'none' | 'suggest_manual' | 'force_manual' | 'retry_healthkit';
  reason: string;
  canRetryHealthKit: boolean;
  isLoading: boolean;
  error: string | null | undefined;
}

export interface StepCountReturn {
  stepCount: number | null;
  isLoading: boolean;
  error: string | null;
}

export interface StreakTrackingReturn {
  streaks: Streak[];
  currentStreak: Streak | null;
  longestStreak: number;
}

export interface CumulativeExperienceReturn {
  cumulativeExperience: number;
  firstExperienceDate: string | null;
}

export interface CurrencySystemReturn {
  currency: number;
  availableCurrency: number;
  totalCurrencyEarned: number;
  convertCurrentExperience: () => Promise<number>;
  spend: (amount: number) => Promise<boolean>;
  conversionRate: number;
}

export interface HealthHooksMock {
  useExperienceData: jest.MockedFunction<() => ExperienceDataReturn>;
  useManualEntryMode: jest.MockedFunction<() => ManualEntryModeReturn>;
  useDeveloperMode: jest.MockedFunction<() => DeveloperModeReturn>;
  useHealthKit: jest.MockedFunction<() => HealthKitReturn>;
  useHealthKitFallback: jest.MockedFunction<() => HealthKitFallbackReturn>;
  useStepCount: jest.MockedFunction<() => StepCountReturn>;
  useStreakTracking: jest.MockedFunction<() => StreakTrackingReturn>;
  useCumulativeExperience: jest.MockedFunction<
    () => CumulativeExperienceReturn
  >;
  useCumulativeExperienceSimple: jest.MockedFunction<
    () => CumulativeExperienceReturn
  >;
  useCurrencySystem: jest.MockedFunction<() => CurrencySystemReturn>;
  createMockExperienceData: (
    overrides?: Partial<ExperienceDataReturn>
  ) => ExperienceDataReturn;
  createMockManualEntryModeData: (
    overrides?: Partial<ManualEntryModeReturn>
  ) => ManualEntryModeReturn;
  createMockDeveloperModeData: (
    overrides?: Partial<DeveloperModeReturn>
  ) => DeveloperModeReturn;
  createMockHealthKitData: (
    overrides?: Partial<HealthKitReturn>
  ) => HealthKitReturn;
  createMockHealthKitFallbackData: (
    overrides?: Partial<HealthKitFallbackReturn>
  ) => HealthKitFallbackReturn;
  createMockStepCountData: (
    overrides?: Partial<StepCountReturn>
  ) => StepCountReturn;
  createMockStreakTrackingData: (
    overrides?: Partial<StreakTrackingReturn>
  ) => StreakTrackingReturn;
  createMockCumulativeExperienceData: (
    overrides?: Partial<CumulativeExperienceReturn>
  ) => CumulativeExperienceReturn;
  createMockCurrencySystemData: (
    overrides?: Partial<CurrencySystemReturn>
  ) => CurrencySystemReturn;
  setupSuccessScenario: () => void;
  setupErrorScenario: (errorMessage?: string) => void;
  setupManualModeScenario: () => void;
  setupDeveloperModeScenario: () => void;
}

export interface HealthHooksMockOptions {
  useExperienceData?: jest.MockedFunction<() => ExperienceDataReturn>;
  useManualEntryMode?: jest.MockedFunction<() => ManualEntryModeReturn>;
  useDeveloperMode?: jest.MockedFunction<() => DeveloperModeReturn>;
  useHealthKit?: jest.MockedFunction<() => HealthKitReturn>;
  useHealthKitFallback?: jest.MockedFunction<() => HealthKitFallbackReturn>;
  useStepCount?: jest.MockedFunction<() => StepCountReturn>;
  useStreakTracking?: jest.MockedFunction<() => StreakTrackingReturn>;
  useCumulativeExperience?: jest.MockedFunction<
    () => CumulativeExperienceReturn
  >;
  useCumulativeExperienceSimple?: jest.MockedFunction<
    () => CumulativeExperienceReturn
  >;
  useCurrencySystem?: jest.MockedFunction<() => CurrencySystemReturn>;
}

let currentMock: HealthHooksMock | null = null;

function createDefaultMockFunctions() {
  const mockExperienceData = jest
    .fn()
    .mockReturnValue(createDefaultMockExperienceData());
  const mockManualEntryMode = jest
    .fn()
    .mockReturnValue(createDefaultMockManualEntryModeData());
  const mockDeveloperMode = jest
    .fn()
    .mockReturnValue(createDefaultMockDeveloperModeData());
  const mockHealthKit = jest
    .fn()
    .mockReturnValue(createDefaultMockHealthKitData());
  const mockHealthKitFallback = jest
    .fn()
    .mockReturnValue(createDefaultMockHealthKitFallbackData());
  const mockStepCount = jest
    .fn()
    .mockReturnValue(createDefaultMockStepCountData());
  const mockStreakTracking = jest
    .fn()
    .mockReturnValue(createDefaultMockStreakTrackingData());
  const mockCumulativeExperience = jest
    .fn()
    .mockReturnValue(createDefaultMockCumulativeExperienceData());
  const mockCumulativeExperienceSimple = jest
    .fn()
    .mockReturnValue(createDefaultMockCumulativeExperienceData());
  const mockCurrencySystem = jest
    .fn()
    .mockReturnValue(createDefaultMockCurrencySystemData());

  return {
    mockExperienceData,
    mockManualEntryMode,
    mockDeveloperMode,
    mockHealthKit,
    mockHealthKitFallback,
    mockStepCount,
    mockStreakTracking,
    mockCumulativeExperience,
    mockCumulativeExperienceSimple,
    mockCurrencySystem,
  };
}

function createBaseMockMethods(
  mockFunctions: ReturnType<typeof createDefaultMockFunctions>,
  options: HealthHooksMockOptions
) {
  return {
    useExperienceData:
      options.useExperienceData || mockFunctions.mockExperienceData,
    useManualEntryMode:
      options.useManualEntryMode || mockFunctions.mockManualEntryMode,
    useDeveloperMode:
      options.useDeveloperMode || mockFunctions.mockDeveloperMode,
    useHealthKit: options.useHealthKit || mockFunctions.mockHealthKit,
    useHealthKitFallback:
      options.useHealthKitFallback || mockFunctions.mockHealthKitFallback,
    useStepCount: options.useStepCount || mockFunctions.mockStepCount,
    useStreakTracking:
      options.useStreakTracking || mockFunctions.mockStreakTracking,
    useCumulativeExperience:
      options.useCumulativeExperience || mockFunctions.mockCumulativeExperience,
    useCumulativeExperienceSimple:
      options.useCumulativeExperienceSimple ||
      mockFunctions.mockCumulativeExperienceSimple,
    useCurrencySystem:
      options.useCurrencySystem || mockFunctions.mockCurrencySystem,
  };
}

function createFactoryMethods() {
  return {
    createMockExperienceData: (overrides = {}) =>
      createDefaultMockExperienceData(overrides),
    createMockManualEntryModeData: (overrides = {}) =>
      createDefaultMockManualEntryModeData(overrides),
    createMockDeveloperModeData: (overrides = {}) =>
      createDefaultMockDeveloperModeData(overrides),
    createMockHealthKitData: (overrides = {}) =>
      createDefaultMockHealthKitData(overrides),
    createMockHealthKitFallbackData: (overrides = {}) =>
      createDefaultMockHealthKitFallbackData(overrides),
    createMockStepCountData: (overrides = {}) =>
      createDefaultMockStepCountData(overrides),
    createMockStreakTrackingData: (overrides = {}) =>
      createDefaultMockStreakTrackingData(overrides),
    createMockCumulativeExperienceData: (overrides = {}) =>
      createDefaultMockCumulativeExperienceData(overrides),
    createMockCurrencySystemData: (overrides = {}) =>
      createDefaultMockCurrencySystemData(overrides),
  };
}

function createScenarioMethods(mock: HealthHooksMock) {
  return {
    setupSuccessScenario: () => {
      mock.useExperienceData.mockReturnValue(
        mock.createMockExperienceData({ isLoading: false, error: null })
      );
      mock.useManualEntryMode.mockReturnValue(
        mock.createMockManualEntryModeData({ isManualEntryMode: false })
      );
      mock.useDeveloperMode.mockReturnValue(
        mock.createMockDeveloperModeData({ isDeveloperMode: false })
      );
      mock.useHealthKit.mockReturnValue(
        mock.createMockHealthKitData({ isAvailable: true })
      );
      mock.useHealthKitFallback.mockReturnValue(
        mock.createMockHealthKitFallbackData({ shouldUseManualEntry: false })
      );
      mock.useStepCount.mockReturnValue(
        mock.createMockStepCountData({ stepCount: 1000 })
      );
    },
    setupErrorScenario: (errorMessage = 'HealthKit error') => {
      mock.useExperienceData.mockReturnValue(
        mock.createMockExperienceData({ error: errorMessage })
      );
      mock.useHealthKit.mockReturnValue(
        mock.createMockHealthKitData({
          isAvailable: false,
          availabilityError: errorMessage,
        })
      );
      mock.useHealthKitFallback.mockReturnValue(
        mock.createMockHealthKitFallbackData({ error: errorMessage })
      );
      mock.useStepCount.mockReturnValue(
        mock.createMockStepCountData({ error: errorMessage })
      );
    },
    setupManualModeScenario: () => {
      mock.useManualEntryMode.mockReturnValue(
        mock.createMockManualEntryModeData({ isManualEntryMode: true })
      );
      mock.useHealthKitFallback.mockReturnValue(
        mock.createMockHealthKitFallbackData({ shouldUseManualEntry: true })
      );
    },
    setupDeveloperModeScenario: () => {
      mock.useDeveloperMode.mockReturnValue(
        mock.createMockDeveloperModeData({ isDeveloperMode: true })
      );
      mock.useHealthKitFallback.mockReturnValue(
        mock.createMockHealthKitFallbackData({ shouldUseManualEntry: true })
      );
    },
  };
}

export function createHealthHooksMock(
  options: HealthHooksMockOptions = {}
): HealthHooksMock {
  const mockFunctions = createDefaultMockFunctions();
  const baseMethods = createBaseMockMethods(mockFunctions, options);
  const factoryMethods = createFactoryMethods();

  const mock: HealthHooksMock = {
    ...baseMethods,
    ...factoryMethods,
    ...createScenarioMethods({} as HealthHooksMock), // Temporary empty object for initial creation
  };

  // Update scenario methods with actual mock reference
  Object.assign(mock, createScenarioMethods(mock));

  currentMock = mock;
  return mock;
}

export function resetHealthHooksMock(): void {
  if (currentMock) {
    Object.values(currentMock).forEach((mockFn) => {
      if (jest.isMockFunction(mockFn)) {
        mockFn.mockClear();
      }
    });
  }
}

export function setupHealthHooksMock(): void {
  // This function is used to setup jest.mock() calls in test files
  // The actual mocking is done by jest.mock() in the test files themselves
}

// Factory functions for creating mock data
function createDefaultMockExperienceData(
  overrides: Partial<ExperienceDataReturn> = {}
): ExperienceDataReturn {
  return {
    experience: 1000,
    cumulativeExperience: 5000,
    refreshExperience: jest.fn().mockResolvedValue(undefined),
    isLoading: false,
    error: null,
    ...overrides,
  };
}

function createDefaultMockManualEntryModeData(
  overrides: Partial<ManualEntryModeReturn> = {}
): ManualEntryModeReturn {
  return {
    isManualEntryMode: false,
    setManualEntryMode: jest.fn().mockResolvedValue(undefined),
    toggleManualEntryMode: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function createDefaultMockDeveloperModeData(
  overrides: Partial<DeveloperModeReturn> = {}
): DeveloperModeReturn {
  return {
    isDeveloperMode: false,
    setDevMode: jest.fn().mockResolvedValue(undefined),
    toggleDevMode: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function createDefaultMockHealthKitData(
  overrides: Partial<HealthKitReturn> = {}
): HealthKitReturn {
  return {
    isAvailable: true,
    hasRequestedAuthorization: true,
    availabilityStatus: 'available',
    availabilityError: null,
    requestAuthorization: jest.fn().mockResolvedValue(true),
    ...overrides,
  };
}

function createDefaultMockHealthKitFallbackData(
  overrides: Partial<HealthKitFallbackReturn> = {}
): HealthKitFallbackReturn {
  return {
    shouldUseManualEntry: false,
    suggestion: 'none',
    reason: 'HealthKit is available',
    canRetryHealthKit: false,
    isLoading: false,
    error: null,
    ...overrides,
  };
}

function createDefaultMockStepCountData(
  overrides: Partial<StepCountReturn> = {}
): StepCountReturn {
  return {
    stepCount: 1000,
    isLoading: false,
    error: null,
    ...overrides,
  };
}

function createDefaultMockStreakTrackingData(
  overrides: Partial<StreakTrackingReturn> = {}
): StreakTrackingReturn {
  return {
    streaks: [],
    currentStreak: null,
    longestStreak: 0,
    ...overrides,
  };
}

function createDefaultMockCumulativeExperienceData(
  overrides: Partial<CumulativeExperienceReturn> = {}
): CumulativeExperienceReturn {
  return {
    cumulativeExperience: 5000,
    firstExperienceDate: new Date().toISOString(),
    ...overrides,
  };
}

function createDefaultMockCurrencySystemData(
  overrides: Partial<CurrencySystemReturn> = {}
): CurrencySystemReturn {
  return {
    currency: 100,
    availableCurrency: 100,
    totalCurrencyEarned: 500,
    convertCurrentExperience: jest.fn().mockResolvedValue(50),
    spend: jest.fn().mockResolvedValue(true),
    conversionRate: 0.1,
    ...overrides,
  };
}
