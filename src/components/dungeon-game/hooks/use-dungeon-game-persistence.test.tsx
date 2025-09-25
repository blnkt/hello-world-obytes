import { act, renderHook, waitFor } from '@testing-library/react-native';

import { createDungeonGamePersistenceMock } from '../../../../__mocks__/dungeon-game-persistence';
import { mmkvMockStorage } from '../../../../__mocks__/react-native-mmkv';
import {
  clearDungeonGameSaveData,
  getDungeonGameSaveDataInfo,
  hasDungeonGameSaveData,
  loadDungeonGameState,
  saveDungeonGameState,
} from '../../../lib/storage/dungeon-game-persistence';
import { useDungeonGamePersistence } from './use-dungeon-game-persistence';

// Mock the persistence functions - use factory inside jest.mock
jest.mock('../../../lib/storage/dungeon-game-persistence', () => {
  const mockPersistence =
    require('../../../../__mocks__/dungeon-game-persistence').createDungeonGamePersistenceMock();
  return {
    saveDungeonGameState: mockPersistence.saveDungeonGameState,
    loadDungeonGameState: mockPersistence.loadDungeonGameState,
    hasDungeonGameSaveData: mockPersistence.hasDungeonGameSaveData,
    clearDungeonGameSaveData: mockPersistence.clearDungeonGameSaveData,
    getDungeonGameSaveDataInfo: mockPersistence.getDungeonGameSaveDataInfo,
  };
});

// Mock the storage module
jest.mock('../../../lib/storage', () =>
  require('../../../../__mocks__/storage.tsx')
);

describe('useDungeonGamePersistence', () => {
  // Create a new instance for testing
  const mockDungeonGamePersistence = createDungeonGamePersistenceMock();

  // Use centralized mock factory method
  const mockSaveData = mockDungeonGamePersistence.createMockSaveData({
    level: 1,
    turnsUsed: 0,
    currency: 1000,
  });

  // Use centralized mock factory method
  const mockSaveDataInfo =
    mockDungeonGamePersistence.createMockPersistenceMetadata({
      lastSaveTime: mockSaveData.timestamp,
      dataSize: 1024,
      saveCount: 1,
      isValid: true,
    });

  beforeEach(() => {
    jest.clearAllMocks();

    // Clear the mock MMKV storage used by useMMKVString
    Object.keys(mmkvMockStorage).forEach((key) => delete mmkvMockStorage[key]);

    // Default mock implementation - manually set for now
    (hasDungeonGameSaveData as jest.Mock).mockReturnValue(false);
    (getDungeonGameSaveDataInfo as jest.Mock).mockReturnValue(null);
  });

  describe('initial state', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useDungeonGamePersistence());

      expect(result.current.saveData).toBeNull();
      expect(result.current.saveDataInfo).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.lastError).toBeNull();
      expect(result.current.hasExistingSaveData()).toBe(false);
      expect(result.current.canResume).toBe(false);
      expect(result.current.lastSaveTime).toBeNull();
      expect(result.current.gameLevel).toBeNull();
      expect(result.current.gameState).toBeNull();
    });
  });

  describe('save data parsing', () => {
    it('should parse valid save data string', () => {
      // Set up the mock storage with valid data
      mmkvMockStorage['DUNGEON_GAME_SAVE'] = JSON.stringify(mockSaveData);

      const { result } = renderHook(() => useDungeonGamePersistence());

      expect(result.current.saveData).toEqual(mockSaveData);
      expect(result.current.lastError).toBeNull();
      expect(result.current.canResume).toBe(true);
      expect(result.current.lastSaveTime).toBe(mockSaveData.timestamp);
      expect(result.current.gameLevel).toBe(mockSaveData.level);
      expect(result.current.gameState).toBe(mockSaveData.gameState);
    });

    it('should handle invalid JSON in save data string', () => {
      // Set up the mock storage with invalid data
      mmkvMockStorage['DUNGEON_GAME_SAVE'] = 'invalid json';

      const { result } = renderHook(() => useDungeonGamePersistence());

      expect(result.current.saveData).toBeNull();
      // In the refactored architecture, JSON parsing errors don't set lastError
      // because that's managed by the async operations hook
      expect(result.current.lastError).toBeNull();
      expect(result.current.canResume).toBe(false);
    });

    it('should handle null save data string', () => {
      // No need to set up storage - it should be empty by default
      const { result } = renderHook(() => useDungeonGamePersistence());

      expect(result.current.saveData).toBeNull();
      expect(result.current.lastError).toBeNull();
      expect(result.current.canResume).toBe(false);
    });
  });

  describe('save data info updates', () => {
    it('should update save data info when save data changes', () => {
      // Set up the mock storage with valid data
      mmkvMockStorage['DUNGEON_GAME_SAVE'] = JSON.stringify(mockSaveData);
      (getDungeonGameSaveDataInfo as jest.Mock).mockReturnValue(
        mockSaveDataInfo
      );

      const { result } = renderHook(() => useDungeonGamePersistence());

      expect(result.current.saveDataInfo).toEqual(mockSaveDataInfo);
    });
  });

  describe('saveGameState', () => {
    it('should successfully save game state', async () => {
      (saveDungeonGameState as jest.Mock).mockResolvedValue({
        success: true,
        metadata: mockSaveDataInfo,
      });

      const { result } = renderHook(() => useDungeonGamePersistence());

      const gameData = {
        gameState: 'Active' as const,
        level: 1,
        gridState: [],
        turnsUsed: 0,
        currency: 1000,
        achievements: mockSaveData.achievements,
        statistics: mockSaveData.statistics,
        itemEffects: [],
        version: '1.0.0',
        timestamp: Date.now(),
      };

      let saveResult;
      await act(async () => {
        saveResult = await result.current.saveGameState(gameData);
      });

      expect(saveResult!.success).toBe(true);
      expect(result.current.lastError).toBeNull();
      expect(saveDungeonGameState).toHaveBeenCalledWith(gameData);
    });

    it('should handle save failure', async () => {
      (saveDungeonGameState as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Save failed',
      });

      const { result } = renderHook(() => useDungeonGamePersistence());

      const gameData = {
        gameState: 'Active' as const,
        level: 1,
        gridState: [],
        turnsUsed: 0,
        currency: 1000,
        achievements: mockSaveData.achievements,
        statistics: mockSaveData.statistics,
        itemEffects: [],
        version: '1.0.0',
        timestamp: Date.now(),
      };

      let saveResult;
      await act(async () => {
        saveResult = await result.current.saveGameState(gameData);
      });

      expect(saveResult!.success).toBe(false);
      expect(result.current.lastError).toBe('Save failed');
    });

    it('should handle save failure with no error message', async () => {
      (saveDungeonGameState as jest.Mock).mockResolvedValue({
        success: false,
        error: null,
      });

      const { result } = renderHook(() => useDungeonGamePersistence());

      const gameData = {
        gameState: 'Active' as const,
        level: 1,
        gridState: [],
        turnsUsed: 0,
        currency: 1000,
        achievements: mockSaveData.achievements,
        statistics: mockSaveData.statistics,
        itemEffects: [],
        version: '1.0.0',
        timestamp: Date.now(),
      };

      let saveResult;
      await act(async () => {
        saveResult = await result.current.saveGameState(gameData);
      });

      expect(saveResult!.success).toBe(false);
      expect(result.current.lastError).toBe('Save failed');
    });

    it('should handle save errors', async () => {
      (saveDungeonGameState as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      const { result } = renderHook(() => useDungeonGamePersistence());

      const gameData = {
        gameState: 'Active' as const,
        level: 1,
        gridState: [],
        turnsUsed: 0,
        currency: 1000,
        achievements: mockSaveData.achievements,
        statistics: mockSaveData.statistics,
        itemEffects: [],
        version: '1.0.0',
        timestamp: Date.now(),
      };

      let saveResult;
      await act(async () => {
        saveResult = await result.current.saveGameState(gameData);
      });

      expect(saveResult!.success).toBe(false);
      expect(result.current.lastError).toBe('Storage error');
    });

    it('should handle save errors with non-Error objects', async () => {
      (saveDungeonGameState as jest.Mock).mockRejectedValue('String error');

      const { result } = renderHook(() => useDungeonGamePersistence());

      const gameData = {
        gameState: 'Active' as const,
        level: 1,
        gridState: [],
        turnsUsed: 0,
        currency: 1000,
        achievements: mockSaveData.achievements,
        statistics: mockSaveData.statistics,
        itemEffects: [],
        version: '1.0.0',
        timestamp: Date.now(),
      };

      let saveResult;
      await act(async () => {
        saveResult = await result.current.saveGameState(gameData);
      });

      expect(saveResult!.success).toBe(false);
      expect(result.current.lastError).toBe('Unknown error');
    });
  });

  describe('loadGameState', () => {
    it('should successfully load game state', async () => {
      (loadDungeonGameState as jest.Mock).mockResolvedValue({
        success: true,
        data: mockSaveData,
        metadata: mockSaveDataInfo,
      });

      const { result } = renderHook(() => useDungeonGamePersistence());

      let loadResult;
      await act(async () => {
        loadResult = await result.current.loadGameState();
      });

      expect(loadResult!.success).toBe(true);
      expect(result.current.lastError).toBeNull();
      expect(loadDungeonGameState).toHaveBeenCalled();
    });

    it('should handle load failure', async () => {
      (loadDungeonGameState as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Load failed',
      });

      const { result } = renderHook(() => useDungeonGamePersistence());

      let loadResult;
      await act(async () => {
        loadResult = await result.current.loadGameState();
      });

      expect(loadResult!.success).toBe(false);
      expect(result.current.lastError).toBe('Load failed');
    });

    it('should handle load failure with no error message', async () => {
      (loadDungeonGameState as jest.Mock).mockResolvedValue({
        success: false,
        error: null,
      });

      const { result } = renderHook(() => useDungeonGamePersistence());

      let loadResult;
      await act(async () => {
        loadResult = await result.current.loadGameState();
      });

      expect(loadResult!.success).toBe(false);
      expect(result.current.lastError).toBe('Load failed');
    });

    it('should handle load errors', async () => {
      (loadDungeonGameState as jest.Mock).mockRejectedValue(
        new Error('Load error')
      );

      const { result } = renderHook(() => useDungeonGamePersistence());

      let loadResult;
      await act(async () => {
        loadResult = await result.current.loadGameState();
      });

      expect(loadResult!.success).toBe(false);
      expect(result.current.lastError).toBe('Load error');
    });

    it('should handle load errors with non-Error objects', async () => {
      (loadDungeonGameState as jest.Mock).mockRejectedValue(
        'String load error'
      );

      const { result } = renderHook(() => useDungeonGamePersistence());

      let loadResult;
      await act(async () => {
        loadResult = await result.current.loadGameState();
      });

      expect(loadResult!.success).toBe(false);
      expect(result.current.lastError).toBe('Unknown error');
    });
  });

  describe('clearGameState', () => {
    it('should successfully clear game state', async () => {
      // Set up the mock storage with valid data
      mmkvMockStorage['DUNGEON_GAME_SAVE'] = JSON.stringify(mockSaveData);
      (clearDungeonGameSaveData as jest.Mock).mockResolvedValue(true);

      const { result } = renderHook(() => useDungeonGamePersistence());

      let clearResult;
      await act(async () => {
        clearResult = await result.current.clearGameState();
      });

      expect(clearResult).toBe(true);
      expect(result.current.lastError).toBeNull();
      expect(clearDungeonGameSaveData).toHaveBeenCalled();
    });

    it('should handle clear failure', async () => {
      // Set up the mock storage with valid data
      mmkvMockStorage['DUNGEON_GAME_SAVE'] = JSON.stringify(mockSaveData);
      (clearDungeonGameSaveData as jest.Mock).mockResolvedValue(false);

      const { result } = renderHook(() => useDungeonGamePersistence());

      let clearResult;
      await act(async () => {
        clearResult = await result.current.clearGameState();
      });

      expect(clearResult).toBe(false);
      expect(result.current.lastError).toBe('Failed to clear save data');
    });

    it('should handle clear errors', async () => {
      // Set up the mock storage with valid data
      mmkvMockStorage['DUNGEON_GAME_SAVE'] = JSON.stringify(mockSaveData);
      (clearDungeonGameSaveData as jest.Mock).mockRejectedValue(
        new Error('Clear error')
      );

      const { result } = renderHook(() => useDungeonGamePersistence());

      let clearResult;
      await act(async () => {
        clearResult = await result.current.clearGameState();
      });

      expect(clearResult).toBe(false);
      expect(result.current.lastError).toBe('Clear error');
    });

    it('should handle clear errors with non-Error objects', async () => {
      // Set up the mock storage with valid data
      mmkvMockStorage['DUNGEON_GAME_SAVE'] = JSON.stringify(mockSaveData);
      (clearDungeonGameSaveData as jest.Mock).mockRejectedValue(
        'String clear error'
      );

      const { result } = renderHook(() => useDungeonGamePersistence());

      let clearResult;
      await act(async () => {
        clearResult = await result.current.clearGameState();
      });

      expect(clearResult).toBe(false);
      expect(result.current.lastError).toBe('Unknown error');
    });
  });

  describe('hasExistingSaveData', () => {
    it('should return true when save data exists', () => {
      (hasDungeonGameSaveData as jest.Mock).mockReturnValue(true);

      const { result } = renderHook(() => useDungeonGamePersistence());

      expect(result.current.hasExistingSaveData()).toBe(true);
    });

    it('should return false when no save data exists', () => {
      (hasDungeonGameSaveData as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() => useDungeonGamePersistence());

      expect(result.current.hasExistingSaveData()).toBe(false);
    });
  });

  describe('refreshSaveDataInfo', () => {
    it('should refresh save data info', () => {
      // Set up the mock storage with valid data
      mmkvMockStorage['DUNGEON_GAME_SAVE'] = JSON.stringify(mockSaveData);
      (getDungeonGameSaveDataInfo as jest.Mock).mockReturnValue(
        mockSaveDataInfo
      );

      const { result } = renderHook(() => useDungeonGamePersistence());

      act(() => {
        result.current.refreshSaveDataInfo();
      });

      expect(getDungeonGameSaveDataInfo).toHaveBeenCalled();
    });
  });

  describe('loading states', () => {
    it('should set loading state during save operation', async () => {
      // Create a promise that we can control
      let resolveSave: (value: any) => void;
      const savePromise = new Promise((resolve: (value: any) => void) => {
        resolveSave = resolve;
      });

      (saveDungeonGameState as jest.Mock).mockReturnValue(savePromise);

      const { result } = renderHook(() => useDungeonGamePersistence());

      const gameData = {
        gameState: 'Active' as const,
        level: 1,
        gridState: [],
        turnsUsed: 0,
        currency: 1000,
        achievements: mockSaveData.achievements,
        statistics: mockSaveData.statistics,
        itemEffects: [],
        version: '1.0.0',
        timestamp: Date.now(),
      };

      // Start save operation
      act(() => {
        result.current.saveGameState(gameData);
      });

      // Check loading state
      expect(result.current.isLoading).toBe(true);

      // Resolve the promise
      resolveSave!({ success: true });

      // Wait for loading to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('computed properties', () => {
    it('should compute canResume correctly for active game', () => {
      // Set up the mock storage with active game data
      mmkvMockStorage['DUNGEON_GAME_SAVE'] = JSON.stringify(mockSaveData);

      const { result } = renderHook(() => useDungeonGamePersistence());

      expect(result.current.canResume).toBe(true);
    });

    it('should compute canResume correctly for completed game', () => {
      const completedSaveData = { ...mockSaveData, gameState: 'Win' as const };
      // Set up the mock storage with completed game data
      mmkvMockStorage['DUNGEON_GAME_SAVE'] = JSON.stringify(completedSaveData);

      const { result } = renderHook(() => useDungeonGamePersistence());

      expect(result.current.canResume).toBe(false);
    });

    it('should compute canResume correctly for no save data', () => {
      // No need to set up storage - it should be empty by default
      const { result } = renderHook(() => useDungeonGamePersistence());

      expect(result.current.canResume).toBe(false);
    });
  });
});
