import { act, renderHook } from '@testing-library/react-native';

import { useResumeChoiceLogic } from './use-resume-choice-logic';

// Mock the persistence hook
const mockUseDungeonGamePersistence = jest.fn();
jest.mock('./use-dungeon-game-persistence', () => ({
  useDungeonGamePersistence: () => mockUseDungeonGamePersistence(),
}));

describe('useResumeChoiceLogic', () => {
  const mockOnResume = jest.fn();
  const mockOnNewGame = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should initialize with modal hidden and no save data', () => {
      mockUseDungeonGamePersistence.mockReturnValue({
        hasExistingSaveData: false,
        saveDataInfo: null,
        isLoading: false,
        lastError: null,
      });

      const { result } = renderHook(() =>
        useResumeChoiceLogic({
          onResume: mockOnResume,
          onNewGame: mockOnNewGame,
        })
      );

      expect(result.current.isModalVisible).toBe(false);
      expect(result.current.saveDataInfo).toBeNull();
      expect(result.current.shouldShowResumeChoice).toBe(false);
    });
  });

  describe('save data detection', () => {
    it('should show modal when save data exists and is valid', () => {
      const mockSaveDataInfo = {
        lastSaveTime: Date.now(),
        saveCount: 1,
        dataSize: 1024,
        isValid: true,
      };

      mockUseDungeonGamePersistence.mockReturnValue({
        hasExistingSaveData: true,
        saveDataInfo: mockSaveDataInfo,
        isLoading: false,
        lastError: null,
      });

      const { result } = renderHook(() =>
        useResumeChoiceLogic({
          onResume: mockOnResume,
          onNewGame: mockOnNewGame,
        })
      );

      expect(result.current.shouldShowResumeChoice).toBe(true);
      expect(result.current.saveDataInfo).toEqual(mockSaveDataInfo);
    });

    it('should not show modal when save data is invalid', () => {
      const mockSaveDataInfo = {
        lastSaveTime: Date.now(),
        saveCount: 1,
        dataSize: 1024,
        isValid: false,
      };

      mockUseDungeonGamePersistence.mockReturnValue({
        hasExistingSaveData: true,
        saveDataInfo: mockSaveDataInfo,
        isLoading: false,
        lastError: null,
      });

      const { result } = renderHook(() =>
        useResumeChoiceLogic({
          onResume: mockOnResume,
          onNewGame: mockOnNewGame,
        })
      );

      expect(result.current.shouldShowResumeChoice).toBe(false);
      expect(result.current.saveDataInfo).toEqual(mockSaveDataInfo);
    });

    it('should not show modal when loading', () => {
      mockUseDungeonGamePersistence.mockReturnValue({
        hasExistingSaveData: true,
        saveDataInfo: null,
        isLoading: true,
        lastError: null,
      });

      const { result } = renderHook(() =>
        useResumeChoiceLogic({
          onResume: mockOnResume,
          onNewGame: mockOnNewGame,
        })
      );

      expect(result.current.shouldShowResumeChoice).toBe(false);
      expect(result.current.isModalVisible).toBe(false);
    });
  });

  describe('modal visibility control', () => {
    it('should show modal when shouldShowResumeChoice is true', () => {
      const mockSaveDataInfo = {
        lastSaveTime: Date.now(),
        saveCount: 1,
        dataSize: 1024,
        isValid: true,
      };

      mockUseDungeonGamePersistence.mockReturnValue({
        hasExistingSaveData: true,
        saveDataInfo: mockSaveDataInfo,
        isLoading: false,
        lastError: null,
      });

      const { result } = renderHook(() =>
        useResumeChoiceLogic({
          onResume: mockOnResume,
          onNewGame: mockOnNewGame,
        })
      );

      expect(result.current.shouldShowResumeChoice).toBe(true);
      expect(result.current.isModalVisible).toBe(true);
    });

    it('should hide modal after resume choice is made', () => {
      const mockSaveDataInfo = {
        lastSaveTime: Date.now(),
        saveCount: 1,
        dataSize: 1024,
        isValid: true,
      };

      mockUseDungeonGamePersistence.mockReturnValue({
        hasExistingSaveData: true,
        saveDataInfo: mockSaveDataInfo,
        isLoading: false,
        lastError: null,
      });

      const { result } = renderHook(() =>
        useResumeChoiceLogic({
          onResume: mockOnResume,
          onNewGame: mockOnNewGame,
        })
      );

      expect(result.current.isModalVisible).toBe(true);

      act(() => {
        result.current.handleResume();
      });

      expect(mockOnResume).toHaveBeenCalled();
      expect(result.current.isModalVisible).toBe(false);
    });

    it('should hide modal after new game choice is made', () => {
      const mockSaveDataInfo = {
        lastSaveTime: Date.now(),
        saveCount: 1,
        dataSize: 1024,
        isValid: true,
      };

      mockUseDungeonGamePersistence.mockReturnValue({
        hasExistingSaveData: true,
        saveDataInfo: mockSaveDataInfo,
        isLoading: false,
        lastError: null,
      });

      const { result } = renderHook(() =>
        useResumeChoiceLogic({
          onResume: mockOnResume,
          onNewGame: mockOnNewGame,
        })
      );

      expect(result.current.isModalVisible).toBe(true);

      act(() => {
        result.current.handleNewGame();
      });

      expect(mockOnNewGame).toHaveBeenCalled();
      expect(result.current.isModalVisible).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should not show modal when there is an error', () => {
      mockUseDungeonGamePersistence.mockReturnValue({
        hasExistingSaveData: true,
        saveDataInfo: null,
        isLoading: false,
        lastError: 'Storage error',
      });

      const { result } = renderHook(() =>
        useResumeChoiceLogic({
          onResume: mockOnResume,
          onNewGame: mockOnNewGame,
        })
      );

      expect(result.current.isModalVisible).toBe(false);
    });
  });
});
