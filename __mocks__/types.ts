/**
 * Centralized TypeScript interfaces for all mock implementations
 *
 * This file provides a single source of truth for all mock-related types
 * used across the test suite. It ensures consistency and type safety
 * across all mock implementations.
 */

// ============================================================================
// BASE MOCK INTERFACES
// ============================================================================

/**
 * Base interface for all mock implementations
 * Provides common functionality that all mocks should have
 */
export interface BaseMock {
  /** Reset all mock function calls and return values */
  reset: () => void;
  /** Clear all mock function calls */
  clear: () => void;
  /** Restore original implementations */
  restore: () => void;
}

/**
 * Base interface for mock options
 * Allows customization of mock behavior
 */
export interface BaseMockOptions {
  /** Whether to enable verbose logging */
  verbose?: boolean;
  /** Custom error message for error scenarios */
  errorMessage?: string;
}

// ============================================================================
// STORAGE INTERFACES
// ============================================================================

/**
 * Storage instance interface for MMKV-like storage
 */
export interface StorageInstance {
  getString: jest.MockedFunction<(key: string) => string | null>;
  set: jest.MockedFunction<(key: string, value: string) => void>;
  delete: jest.MockedFunction<(key: string) => void>;
  clear: jest.MockedFunction<() => void>;
  contains: jest.MockedFunction<(key: string) => boolean>;
}

/**
 * Character data structure
 */
export interface CharacterData {
  name: string;
  level: number;
  experience: number;
  class: string;
  stats?: {
    strength: number;
    agility: number;
    intelligence: number;
  };
}

/**
 * Manual step entry for tracking daily steps
 */
export interface ManualStepEntry {
  date: string;
  steps: number;
  source: 'manual';
}

/**
 * Health core data structure
 */
export interface HealthCore {
  experience: number;
  cumulativeExperience: number;
  firstExperienceDate: string | null;
  currency: number;
  lastCheckedDate: string | null;
  dailyStepsGoal: number;
  lastMilestone: string | null;
}

/**
 * Streak data structure
 */
export interface Streak {
  id: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  averageSteps: number;
}

// ============================================================================
// DUNGEON GAME INTERFACES
// ============================================================================

/**
 * Dungeon game save data structure
 */
export interface DungeonGameSaveData {
  version: string;
  timestamp: number;
  gameState: 'Active' | 'Win' | 'Lose' | 'Paused';
  level: number;
  gridState: {
    id: string;
    x: number;
    y: number;
    isRevealed: boolean;
    type: 'neutral' | 'treasure' | 'trap' | 'monster';
    hasBeenVisited: boolean;
  }[];
  turnsUsed: number;
  currency: number;
  achievements: {
    totalGamesPlayed: number;
    gamesWon: number;
    gamesLost: number;
    highestLevelReached: number;
    totalTurnsUsed: number;
    totalTreasureFound: number;
  };
  statistics: {
    winRate: number;
    averageTurnsPerGame: number;
    longestGameSession: number;
    totalPlayTime: number;
  };
  itemEffects: {
    id: string;
    type: string;
    duration: number;
    effect: any;
  }[];
}

/**
 * Persistence metadata
 */
export interface PersistenceMetadata {
  lastSaveTime: number;
  saveCount: number;
  dataSize: number;
  isValid: boolean;
}

/**
 * Save operation result
 */
export interface SaveOperationResult {
  success: boolean;
  metadata?: PersistenceMetadata;
  error?: string;
}

/**
 * Load operation result
 */
export interface LoadOperationResult {
  success: boolean;
  data?: DungeonGameSaveData;
  metadata?: PersistenceMetadata;
  error?: string;
}

// ============================================================================
// HEALTH HOOK INTERFACES
// ============================================================================

/**
 * Experience data return type
 */
export interface ExperienceDataReturn {
  experience: number;
  cumulativeExperience: number;
  refreshExperience: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Manual entry mode return type
 */
export interface ManualEntryModeReturn {
  isManualEntryMode: boolean;
  setManualEntryMode: (enabled: boolean) => Promise<void>;
  toggleManualEntryMode: () => Promise<void>;
}

/**
 * Developer mode return type
 */
export interface DeveloperModeReturn {
  isDeveloperMode: boolean;
  setDevMode: (enabled: boolean) => Promise<void>;
  toggleDevMode: () => Promise<void>;
}

/**
 * HealthKit return type
 */
export interface HealthKitReturn {
  isAvailable: boolean;
  hasRequestedAuthorization: boolean | null;
  availabilityStatus: string;
  availabilityError: string | null | undefined;
  requestAuthorization: () => Promise<boolean>;
}

/**
 * HealthKit fallback return type
 */
export interface HealthKitFallbackReturn {
  shouldUseManualEntry: boolean;
  suggestion: 'none' | 'suggest_manual' | 'force_manual' | 'retry_healthkit';
  reason: string;
  canRetryHealthKit: boolean;
  isLoading: boolean;
  error: string | null | undefined;
}

/**
 * Step count return type
 */
export interface StepCountReturn {
  stepCount: number | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Streak tracking return type
 */
export interface StreakTrackingReturn {
  streaks: Streak[];
  currentStreak: Streak | null;
  longestStreak: number;
}

/**
 * Cumulative experience return type
 */
export interface CumulativeExperienceReturn {
  cumulativeExperience: number;
  firstExperienceDate: string | null;
}

/**
 * Currency system return type
 */
export interface CurrencySystemReturn {
  currency: number;
  availableCurrency: number;
  totalCurrencyEarned: number;
  convertCurrentExperience: () => Promise<number>;
  spend: (amount: number) => Promise<boolean>;
  conversionRate: number;
}

// ============================================================================
// MOCK IMPLEMENTATION INTERFACES
// ============================================================================

/**
 * Dungeon game persistence mock interface
 */
export interface DungeonGamePersistenceMock extends BaseMock {
  saveDungeonGameState: jest.MockedFunction<
    (
      saveData: Omit<DungeonGameSaveData, 'version' | 'timestamp'>
    ) => Promise<SaveOperationResult>
  >;
  loadDungeonGameState: jest.MockedFunction<() => Promise<LoadOperationResult>>;
  hasDungeonGameSaveData: jest.MockedFunction<() => boolean>;
  clearDungeonGameSaveData: jest.MockedFunction<() => Promise<boolean>>;
  getDungeonGameSaveDataInfo: jest.MockedFunction<
    () => PersistenceMetadata | null
  >;
  createMockSaveData: (
    overrides?: Partial<DungeonGameSaveData>
  ) => DungeonGameSaveData;
  createMockPersistenceMetadata: (
    overrides?: Partial<PersistenceMetadata>
  ) => PersistenceMetadata;
  setupSuccessScenario: () => void;
  setupErrorScenario: (errorMessage?: string) => void;
  setupNoDataScenario: () => void;
}

/**
 * Health hooks mock interface
 */
export interface HealthHooksMock extends BaseMock {
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

/**
 * Storage functions mock interface
 */
export interface StorageFunctionsMock extends BaseMock {
  storage: jest.Mocked<StorageInstance>;
  useMMKVString: jest.MockedFunction<
    (
      key: string,
      storageInstance?: any
    ) => [string | null, (value: string | null) => void]
  >;
  useMMKVBoolean: jest.MockedFunction<
    (
      key: string,
      storageInstance?: any
    ) => [boolean | undefined, (value: boolean) => void]
  >;
  getItem: jest.MockedFunction<(key: string) => any>;
  setItem: jest.MockedFunction<(key: string, value: any) => Promise<void>>;
  removeItem: jest.MockedFunction<(key: string) => Promise<void>>;
  getExperience: jest.MockedFunction<() => number>;
  setExperience: jest.MockedFunction<(experience: number) => Promise<void>>;
  getCurrency: jest.MockedFunction<() => number>;
  setCurrency: jest.MockedFunction<(currency: number) => Promise<void>>;
  getManualStepsByDay: jest.MockedFunction<() => ManualStepEntry[]>;
  setManualStepsByDay: jest.MockedFunction<
    (steps: ManualStepEntry[]) => Promise<void>
  >;
  getCharacter: jest.MockedFunction<() => CharacterData | null>;
  setCharacter: jest.MockedFunction<
    (character: CharacterData) => Promise<void>
  >;
  createMockStorage: (
    overrides?: Partial<StorageInstance>
  ) => jest.Mocked<StorageInstance>;
  createMockCharacter: (overrides?: Partial<CharacterData>) => CharacterData;
  createMockManualStepEntry: (
    overrides?: Partial<ManualStepEntry>
  ) => ManualStepEntry;
  setupSuccessScenario: () => void;
  setupErrorScenario: (errorMessage?: string) => void;
  setupEmptyDataScenario: () => void;
  setupPopulatedDataScenario: () => void;
}

// ============================================================================
// MOCK OPTIONS INTERFACES
// ============================================================================

/**
 * Dungeon game persistence mock options
 */
export interface DungeonGamePersistenceMockOptions extends BaseMockOptions {
  saveDungeonGameState?: jest.MockedFunction<
    (
      saveData: Omit<DungeonGameSaveData, 'version' | 'timestamp'>
    ) => Promise<SaveOperationResult>
  >;
  loadDungeonGameState?: jest.MockedFunction<
    () => Promise<LoadOperationResult>
  >;
  hasDungeonGameSaveData?: jest.MockedFunction<() => boolean>;
  clearDungeonGameSaveData?: jest.MockedFunction<() => Promise<boolean>>;
  getDungeonGameSaveDataInfo?: jest.MockedFunction<
    () => PersistenceMetadata | null
  >;
}

/**
 * Health hooks mock options
 */
export interface HealthHooksMockOptions extends BaseMockOptions {
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

/**
 * Storage functions mock options
 */
export interface StorageFunctionsMockOptions extends BaseMockOptions {
  storage?: jest.Mocked<StorageInstance>;
  useMMKVString?: jest.MockedFunction<
    (
      key: string,
      storageInstance?: any
    ) => [string | null, (value: string | null) => void]
  >;
  useMMKVBoolean?: jest.MockedFunction<
    (
      key: string,
      storageInstance?: any
    ) => [boolean | undefined, (value: boolean) => void]
  >;
  getItem?: jest.MockedFunction<(key: string) => any>;
  setItem?: jest.MockedFunction<(key: string, value: any) => Promise<void>>;
  removeItem?: jest.MockedFunction<(key: string) => Promise<void>>;
  getExperience?: jest.MockedFunction<() => number>;
  setExperience?: jest.MockedFunction<(experience: number) => Promise<void>>;
  getCurrency?: jest.MockedFunction<() => number>;
  setCurrency?: jest.MockedFunction<(currency: number) => Promise<void>>;
  getManualStepsByDay?: jest.MockedFunction<() => ManualStepEntry[]>;
  setManualStepsByDay?: jest.MockedFunction<
    (steps: ManualStepEntry[]) => Promise<void>
  >;
  getCharacter?: jest.MockedFunction<() => CharacterData | null>;
  setCharacter?: jest.MockedFunction<
    (character: CharacterData) => Promise<void>
  >;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Union type of all mock interfaces
 */
export type AnyMock =
  | DungeonGamePersistenceMock
  | HealthHooksMock
  | StorageFunctionsMock;

/**
 * Union type of all mock options
 */
export type AnyMockOptions =
  | DungeonGamePersistenceMockOptions
  | HealthHooksMockOptions
  | StorageFunctionsMockOptions;

/**
 * Mock scenario types
 */
export type MockScenario =
  | 'success'
  | 'error'
  | 'empty'
  | 'populated'
  | 'manual'
  | 'developer'
  | 'no-data';

/**
 * Mock factory function type
 */
export type MockFactory<T extends AnyMock, O extends AnyMockOptions> = (
  options?: O
) => T;

/**
 * Mock reset function type
 */
export type MockResetFunction = () => void;

/**
 * Mock setup function type
 */
export type MockSetupFunction = () => void;
