import type {
  DungeonGameSaveData,
  LoadOperationResult,
  PersistenceMetadata,
  SaveOperationResult,
} from '../src/types/dungeon-game';

export interface DungeonGamePersistenceMock {
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

export interface DungeonGamePersistenceMockOptions {
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

let currentMock: DungeonGamePersistenceMock | null = null;

function createDefaultMockFunctions() {
  const mockSaveData = jest.fn().mockResolvedValue({
    success: true,
    metadata: createDefaultMockMetadata(),
  });

  const mockLoadData = jest.fn().mockResolvedValue({
    success: true,
    data: createDefaultMockSaveData(),
    metadata: createDefaultMockMetadata(),
  });

  const mockHasData = jest.fn().mockReturnValue(true);
  const mockClearData = jest.fn().mockResolvedValue(true);
  const mockGetInfo = jest.fn().mockReturnValue(createDefaultMockMetadata());

  return {
    mockSaveData,
    mockLoadData,
    mockHasData,
    mockClearData,
    mockGetInfo,
  };
}

export function createDungeonGamePersistenceMock(
  options: DungeonGamePersistenceMockOptions = {}
): DungeonGamePersistenceMock {
  const {
    mockSaveData,
    mockLoadData,
    mockHasData,
    mockClearData,
    mockGetInfo,
  } = createDefaultMockFunctions();

  const mock: DungeonGamePersistenceMock = {
    saveDungeonGameState: options.saveDungeonGameState || mockSaveData,
    loadDungeonGameState: options.loadDungeonGameState || mockLoadData,
    hasDungeonGameSaveData: options.hasDungeonGameSaveData || mockHasData,
    clearDungeonGameSaveData: options.clearDungeonGameSaveData || mockClearData,
    getDungeonGameSaveDataInfo:
      options.getDungeonGameSaveDataInfo || mockGetInfo,
    createMockSaveData: (overrides = {}) =>
      createDefaultMockSaveData(overrides),
    createMockPersistenceMetadata: (overrides = {}) =>
      createDefaultMockMetadata(overrides),
    setupSuccessScenario: () => {
      mock.saveDungeonGameState.mockResolvedValue({
        success: true,
        metadata: mock.createMockPersistenceMetadata(),
      });
      mock.loadDungeonGameState.mockResolvedValue({
        success: true,
        data: mock.createMockSaveData(),
        metadata: mock.createMockPersistenceMetadata(),
      });
      mock.hasDungeonGameSaveData.mockReturnValue(true);
      mock.clearDungeonGameSaveData.mockResolvedValue(true);
      mock.getDungeonGameSaveDataInfo.mockReturnValue(
        mock.createMockPersistenceMetadata()
      );
    },
    setupErrorScenario: (errorMessage = 'Mock error') => {
      mock.saveDungeonGameState.mockResolvedValue({
        success: false,
        error: errorMessage,
      });
      mock.loadDungeonGameState.mockResolvedValue({
        success: false,
        error: errorMessage,
      });
      mock.hasDungeonGameSaveData.mockReturnValue(false);
      mock.clearDungeonGameSaveData.mockResolvedValue(false);
      mock.getDungeonGameSaveDataInfo.mockReturnValue(null);
    },
    setupNoDataScenario: () => {
      mock.saveDungeonGameState.mockResolvedValue({
        success: true,
        metadata: mock.createMockPersistenceMetadata(),
      });
      mock.loadDungeonGameState.mockResolvedValue({
        success: false,
        error: 'No save data found',
      });
      mock.hasDungeonGameSaveData.mockReturnValue(false);
      mock.clearDungeonGameSaveData.mockResolvedValue(true);
      mock.getDungeonGameSaveDataInfo.mockReturnValue(null);
    },
  };

  currentMock = mock;
  return mock;
}

export function resetDungeonGamePersistenceMock(): void {
  if (currentMock) {
    currentMock.saveDungeonGameState.mockClear();
    currentMock.loadDungeonGameState.mockClear();
    currentMock.hasDungeonGameSaveData.mockClear();
    currentMock.clearDungeonGameSaveData.mockClear();
    currentMock.getDungeonGameSaveDataInfo.mockClear();
  }
}

export function setupDungeonGamePersistenceMock(): void {
  // This function is used to setup jest.mock() calls in test files
  // The actual mocking is done by jest.mock() in the test files themselves
}

function createDefaultMockSaveData(
  overrides: Partial<DungeonGameSaveData> = {}
): DungeonGameSaveData {
  return {
    version: '1.0.0',
    timestamp: Date.now(),
    gameState: 'Active',
    level: 1,
    gridState: [
      {
        id: 'tile-1',
        x: 0,
        y: 0,
        isRevealed: false,
        type: 'neutral',
        hasBeenVisited: false,
      },
    ],
    turnsUsed: 0,
    currency: 1000,
    achievements: {
      totalGamesPlayed: 0,
      gamesWon: 0,
      gamesLost: 0,
      highestLevelReached: 0,
      totalTurnsUsed: 0,
      totalTreasureFound: 0,
    },
    statistics: {
      winRate: 0,
      averageTurnsPerGame: 0,
      longestGameSession: 0,
      totalPlayTime: 0,
    },
    itemEffects: [],
    ...overrides,
  };
}

function createDefaultMockMetadata(
  overrides: Partial<PersistenceMetadata> = {}
): PersistenceMetadata {
  return {
    lastSaveTime: Date.now(),
    saveCount: 1,
    dataSize: 1024,
    isValid: true,
    ...overrides,
  };
}
