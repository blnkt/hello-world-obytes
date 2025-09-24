// Storage Instance Interface
export interface StorageInstance {
  getString: jest.MockedFunction<(key: string) => string | null>;
  set: jest.MockedFunction<(key: string, value: string) => void>;
  delete: jest.MockedFunction<(key: string) => void>;
  clear: jest.MockedFunction<() => void>;
  contains: jest.MockedFunction<(key: string) => boolean>;
}

// Character Data Interface
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

// Manual Step Entry Interface
export interface ManualStepEntry {
  date: string;
  steps: number;
  source: 'manual';
}

// Storage Functions Mock Interface
export interface StorageFunctionsMock {
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

export interface StorageFunctionsMockOptions {
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

let currentMock: StorageFunctionsMock | null = null;

function createDefaultMockFunctions() {
  const mockStorage = createDefaultMockStorage();
  const mockUseMMKVString = jest.fn().mockReturnValue([null, jest.fn()]);
  const mockUseMMKVBoolean = jest.fn().mockReturnValue([false, jest.fn()]);
  const mockGetItem = jest.fn().mockReturnValue(null);
  const mockSetItem = jest.fn().mockResolvedValue(undefined);
  const mockRemoveItem = jest.fn().mockResolvedValue(undefined);
  const mockGetExperience = jest.fn().mockReturnValue(1000);
  const mockSetExperience = jest.fn().mockResolvedValue(undefined);
  const mockGetCurrency = jest.fn().mockReturnValue(100);
  const mockSetCurrency = jest.fn().mockResolvedValue(undefined);
  const mockGetManualStepsByDay = jest.fn().mockReturnValue([]);
  const mockSetManualStepsByDay = jest.fn().mockResolvedValue(undefined);
  const mockGetCharacter = jest
    .fn()
    .mockReturnValue(createDefaultMockCharacter());
  const mockSetCharacter = jest.fn().mockResolvedValue(undefined);

  return {
    mockStorage,
    mockUseMMKVString,
    mockUseMMKVBoolean,
    mockGetItem,
    mockSetItem,
    mockRemoveItem,
    mockGetExperience,
    mockSetExperience,
    mockGetCurrency,
    mockSetCurrency,
    mockGetManualStepsByDay,
    mockSetManualStepsByDay,
    mockGetCharacter,
    mockSetCharacter,
  };
}

function createBaseMockMethods(
  mockFunctions: ReturnType<typeof createDefaultMockFunctions>,
  options: StorageFunctionsMockOptions
) {
  return {
    storage: options.storage || mockFunctions.mockStorage,
    useMMKVString: options.useMMKVString || mockFunctions.mockUseMMKVString,
    useMMKVBoolean: options.useMMKVBoolean || mockFunctions.mockUseMMKVBoolean,
    getItem: options.getItem || mockFunctions.mockGetItem,
    setItem: options.setItem || mockFunctions.mockSetItem,
    removeItem: options.removeItem || mockFunctions.mockRemoveItem,
    getExperience: options.getExperience || mockFunctions.mockGetExperience,
    setExperience: options.setExperience || mockFunctions.mockSetExperience,
    getCurrency: options.getCurrency || mockFunctions.mockGetCurrency,
    setCurrency: options.setCurrency || mockFunctions.mockSetCurrency,
    getManualStepsByDay:
      options.getManualStepsByDay || mockFunctions.mockGetManualStepsByDay,
    setManualStepsByDay:
      options.setManualStepsByDay || mockFunctions.mockSetManualStepsByDay,
    getCharacter: options.getCharacter || mockFunctions.mockGetCharacter,
    setCharacter: options.setCharacter || mockFunctions.mockSetCharacter,
  };
}

function createFactoryMethods() {
  return {
    createMockStorage: (overrides = {}) => createDefaultMockStorage(overrides),
    createMockCharacter: (overrides = {}) =>
      createDefaultMockCharacter(overrides),
    createMockManualStepEntry: (overrides = {}) =>
      createDefaultMockManualStepEntry(overrides),
  };
}

function createScenarioMethods(mock: StorageFunctionsMock) {
  return {
    setupSuccessScenario: () => {
      mock.getExperience.mockReturnValue(1500);
      mock.getCurrency.mockReturnValue(250);
      mock.getCharacter.mockReturnValue(mock.createMockCharacter({ level: 5 }));
      mock.getManualStepsByDay.mockReturnValue([
        mock.createMockManualStepEntry({ steps: 8000 }),
      ]);
    },
    setupErrorScenario: (errorMessage = 'Storage error') => {
      mock.storage.getString.mockImplementation(() => {
        throw new Error(errorMessage);
      });
      mock.storage.set.mockImplementation(() => {
        throw new Error(errorMessage);
      });
      mock.storage.delete.mockImplementation(() => {
        throw new Error(errorMessage);
      });
    },
    setupEmptyDataScenario: () => {
      mock.getExperience.mockReturnValue(0);
      mock.getCurrency.mockReturnValue(0);
      mock.getCharacter.mockReturnValue(null);
      mock.getManualStepsByDay.mockReturnValue([]);
    },
    setupPopulatedDataScenario: () => {
      mock.getExperience.mockReturnValue(5000);
      mock.getCurrency.mockReturnValue(1000);
      mock.getCharacter.mockReturnValue(
        mock.createMockCharacter({
          level: 15,
          experience: 5000,
          name: 'Hero',
          class: 'Mage',
        })
      );
      mock.getManualStepsByDay.mockReturnValue([
        mock.createMockManualStepEntry({ steps: 12000 }),
        mock.createMockManualStepEntry({ steps: 15000 }),
      ]);
    },
  };
}

export function createStorageFunctionsMock(
  options: StorageFunctionsMockOptions = {}
): StorageFunctionsMock {
  const mockFunctions = createDefaultMockFunctions();
  const baseMethods = createBaseMockMethods(mockFunctions, options);
  const factoryMethods = createFactoryMethods();

  const mock: StorageFunctionsMock = {
    ...baseMethods,
    ...factoryMethods,
    ...createScenarioMethods({} as StorageFunctionsMock), // Temporary empty object for initial creation
  };

  // Update scenario methods with actual mock reference
  Object.assign(mock, createScenarioMethods(mock));

  currentMock = mock;
  return mock;
}

export function resetStorageFunctionsMock(): void {
  if (currentMock) {
    Object.values(currentMock).forEach((mockFn) => {
      if (jest.isMockFunction(mockFn)) {
        mockFn.mockClear();
      }
    });
  }
}

export function setupStorageFunctionsMock(): void {
  // This function is used to setup jest.mock() calls in test files
  // The actual mocking is done by jest.mock() in the test files themselves
}

// Factory functions for creating mock data
function createDefaultMockStorage(
  overrides: Partial<StorageInstance> = {}
): jest.Mocked<StorageInstance> {
  return {
    getString: jest.fn().mockReturnValue(null),
    set: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
    contains: jest.fn().mockReturnValue(false),
    ...overrides,
  };
}

function createDefaultMockCharacter(
  overrides: Partial<CharacterData> = {}
): CharacterData {
  return {
    name: 'Test Character',
    level: 1,
    experience: 0,
    class: 'Warrior',
    stats: {
      strength: 10,
      agility: 8,
      intelligence: 6,
    },
    ...overrides,
  };
}

function createDefaultMockManualStepEntry(
  overrides: Partial<ManualStepEntry> = {}
): ManualStepEntry {
  return {
    date: new Date().toISOString().split('T')[0],
    steps: 10000,
    source: 'manual',
    ...overrides,
  };
}
