import { act, renderHook } from '@testing-library/react-native';

import { useResumeChoiceLogic } from './use-resume-choice-logic';

// Mock the persistence hook
const mockUseDungeonGamePersistence = jest.fn();
jest.mock('./use-dungeon-game-persistence', () => ({
  useDungeonGamePersistence: () => mockUseDungeonGamePersistence(),
}));

describe('useResumeChoiceLogic - Edge Cases and Integration', () => {
  const mockOnResume = jest.fn();
  const mockOnNewGame = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('callback stability and dependency management', () => {
    it('should maintain stable callbacks when persistence state changes', () => {
      mockUseDungeonGamePersistence.mockReturnValue({
        hasExistingSaveData: false,
        saveDataInfo: null,
        isLoading: false,
        lastError: null,
      });

      const { result, rerender } = renderHook(() =>
        useResumeChoiceLogic({
          onResume: mockOnResume,
          onNewGame: mockOnNewGame,
        })
      );

      const initialHandleResume = result.current.handleResume;
      const initialHandleNewGame = result.current.handleNewGame;
      const initialHandleClose = result.current.handleCloseModal;

      // Update persistence state
      mockUseDungeonGamePersistence.mockReturnValue({
        hasExistingSaveData: true,
        saveDataInfo: {
          lastSaveTime: Date.now(),
          saveCount: 1,
          dataSize: 1024,
          isValid: true,
        },
        isLoading: false,
        lastError: null,
      });

      rerender({});

      // Callbacks should remain stable
      expect(result.current.handleResume).toBe(initialHandleResume);
      expect(result.current.handleNewGame).toBe(initialHandleNewGame);
      expect(result.current.handleCloseModal).toBe(initialHandleClose);
    });

    it('should update callbacks when onResume/onNewGame props change', () => {
      mockUseDungeonGamePersistence.mockReturnValue({
        hasExistingSaveData: false,
        saveDataInfo: null,
        isLoading: false,
        lastError: null,
      });

      const { result, rerender } = renderHook(
        ({ onResume, onNewGame }) =>
          useResumeChoiceLogic({
            onResume,
            onNewGame,
          }),
        {
          initialProps: {
            onResume: mockOnResume,
            onNewGame: mockOnNewGame,
          },
        }
      );

      const initialHandleResume = result.current.handleResume;
      const initialHandleNewGame = result.current.handleNewGame;

      const newOnResume = jest.fn();
      const newOnNewGame = jest.fn();

      rerender({
        onResume: newOnResume,
        onNewGame: newOnNewGame,
      });

      // Callbacks should update
      expect(result.current.handleResume).not.toBe(initialHandleResume);
      expect(result.current.handleNewGame).not.toBe(initialHandleNewGame);
    });
  });

  describe('modal visibility state transitions', () => {
    it('should handle rapid state changes without modal flickering', () => {
      mockUseDungeonGamePersistence.mockReturnValue({
        hasExistingSaveData: false,
        saveDataInfo: null,
        isLoading: true,
        lastError: null,
      });

      const { result, rerender } = renderHook(() =>
        useResumeChoiceLogic({
          onResume: mockOnResume,
          onNewGame: mockOnNewGame,
        })
      );

      expect(result.current.isModalVisible).toBe(false);

      // Simulate rapid state changes (loading -> has data -> valid)
      mockUseDungeonGamePersistence.mockReturnValue({
        hasExistingSaveData: true,
        saveDataInfo: null,
        isLoading: true,
        lastError: null,
      });

      rerender({});
      expect(result.current.isModalVisible).toBe(false);

      mockUseDungeonGamePersistence.mockReturnValue({
        hasExistingSaveData: true,
        saveDataInfo: {
          lastSaveTime: Date.now(),
          saveCount: 1,
          dataSize: 1024,
          isValid: false,
        },
        isLoading: false,
        lastError: null,
      });

      rerender({});
      expect(result.current.isModalVisible).toBe(false);

      mockUseDungeonGamePersistence.mockReturnValue({
        hasExistingSaveData: true,
        saveDataInfo: {
          lastSaveTime: Date.now(),
          saveCount: 1,
          dataSize: 1024,
          isValid: true,
        },
        isLoading: false,
        lastError: null,
      });

      rerender({});
      expect(result.current.isModalVisible).toBe(true);
    });

    it('should properly reset modal after it was manually closed', () => {
      mockUseDungeonGamePersistence.mockReturnValue({
        hasExistingSaveData: true,
        saveDataInfo: {
          lastSaveTime: Date.now(),
          saveCount: 1,
          dataSize: 1024,
          isValid: true,
        },
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

      // Manually close modal
      act(() => {
        result.current.handleCloseModal();
      });

      expect(result.current.isModalVisible).toBe(false);

      // Should not automatically reopen even if conditions are met
      expect(result.current.shouldShowResumeChoice).toBe(true);
      expect(result.current.isModalVisible).toBe(false);
    });
  });

  describe('boundary conditions for save data', () => {
    it('should handle save data with zero saveCount', () => {
      mockUseDungeonGamePersistence.mockReturnValue({
        hasExistingSaveData: true,
        saveDataInfo: {
          lastSaveTime: Date.now(),
          saveCount: 0,
          dataSize: 1024,
          isValid: true,
        },
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

    it('should handle save data with zero dataSize', () => {
      mockUseDungeonGamePersistence.mockReturnValue({
        hasExistingSaveData: true,
        saveDataInfo: {
          lastSaveTime: Date.now(),
          saveCount: 1,
          dataSize: 0,
          isValid: true,
        },
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

    it('should handle very old save data timestamps', () => {
      const veryOldTimestamp = Date.now() - 365 * 24 * 60 * 60 * 1000; // 1 year ago

      mockUseDungeonGamePersistence.mockReturnValue({
        hasExistingSaveData: true,
        saveDataInfo: {
          lastSaveTime: veryOldTimestamp,
          saveCount: 1,
          dataSize: 1024,
          isValid: true,
        },
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

    it('should handle future timestamps gracefully', () => {
      const futureTimestamp = Date.now() + 24 * 60 * 60 * 1000; // 1 day in future

      mockUseDungeonGamePersistence.mockReturnValue({
        hasExistingSaveData: true,
        saveDataInfo: {
          lastSaveTime: futureTimestamp,
          saveCount: 1,
          dataSize: 1024,
          isValid: true,
        },
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
  });

  describe('error state recovery', () => {
    it('should recover when error is cleared', () => {
      mockUseDungeonGamePersistence.mockReturnValue({
        hasExistingSaveData: true,
        saveDataInfo: {
          lastSaveTime: Date.now(),
          saveCount: 1,
          dataSize: 1024,
          isValid: true,
        },
        isLoading: false,
        lastError: 'Storage error',
      });

      const { result, rerender } = renderHook(() =>
        useResumeChoiceLogic({
          onResume: mockOnResume,
          onNewGame: mockOnNewGame,
        })
      );

      expect(result.current.isModalVisible).toBe(false);

      // Clear the error
      mockUseDungeonGamePersistence.mockReturnValue({
        hasExistingSaveData: true,
        saveDataInfo: {
          lastSaveTime: Date.now(),
          saveCount: 1,
          dataSize: 1024,
          isValid: true,
        },
        isLoading: false,
        lastError: null,
      });

      rerender({});

      expect(result.current.isModalVisible).toBe(true);
    });

    it('should handle different error types', () => {
      const errorTypes = [
        'Storage error',
        'Network timeout',
        'Permission denied',
      ];

      errorTypes.forEach((errorType) => {
        mockUseDungeonGamePersistence.mockReturnValue({
          hasExistingSaveData: true,
          saveDataInfo: {
            lastSaveTime: Date.now(),
            saveCount: 1,
            dataSize: 1024,
            isValid: true,
          },
          isLoading: false,
          lastError: errorType,
        });

        const { result } = renderHook(() =>
          useResumeChoiceLogic({
            onResume: mockOnResume,
            onNewGame: mockOnNewGame,
          })
        );

        expect(result.current.isModalVisible).toBe(false);
      });

      // Test empty string as a special case since it should be falsy
      mockUseDungeonGamePersistence.mockReturnValue({
        hasExistingSaveData: true,
        saveDataInfo: {
          lastSaveTime: Date.now(),
          saveCount: 1,
          dataSize: 1024,
          isValid: true,
        },
        isLoading: false,
        lastError: '',
      });

      const { result } = renderHook(() =>
        useResumeChoiceLogic({
          onResume: mockOnResume,
          onNewGame: mockOnNewGame,
        })
      );

      // Empty string should be treated as no error, so modal should show
      expect(result.current.isModalVisible).toBe(true);
    });
  });

  describe('complex state combinations', () => {
    it('should handle isValid undefined correctly', () => {
      mockUseDungeonGamePersistence.mockReturnValue({
        hasExistingSaveData: true,
        saveDataInfo: {
          lastSaveTime: Date.now(),
          saveCount: 1,
          dataSize: 1024,
          isValid: undefined as any, // Simulate missing or undefined isValid
        },
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
      expect(result.current.isModalVisible).toBe(false);
    });

    it('should handle null saveDataInfo with hasExistingSaveData true', () => {
      mockUseDungeonGamePersistence.mockReturnValue({
        hasExistingSaveData: true,
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

      expect(result.current.shouldShowResumeChoice).toBe(false);
      expect(result.current.isModalVisible).toBe(false);
    });
  });

  describe('user action behaviors', () => {
    it('should call onResume and close modal in correct order', () => {
      const callOrder: string[] = [];

      const trackingOnResume = jest.fn(() => {
        callOrder.push('onResume');
      });

      mockUseDungeonGamePersistence.mockReturnValue({
        hasExistingSaveData: true,
        saveDataInfo: {
          lastSaveTime: Date.now(),
          saveCount: 1,
          dataSize: 1024,
          isValid: true,
        },
        isLoading: false,
        lastError: null,
      });

      const { result } = renderHook(() =>
        useResumeChoiceLogic({
          onResume: trackingOnResume,
          onNewGame: mockOnNewGame,
        })
      );

      expect(result.current.isModalVisible).toBe(true);

      act(() => {
        result.current.handleResume();
        callOrder.push('modalClosed');
      });

      expect(callOrder).toEqual(['onResume', 'modalClosed']);
      expect(result.current.isModalVisible).toBe(false);
      expect(trackingOnResume).toHaveBeenCalledTimes(1);
    });

    it('should call onNewGame and close modal in correct order', () => {
      const callOrder: string[] = [];

      const trackingOnNewGame = jest.fn(() => {
        callOrder.push('onNewGame');
      });

      mockUseDungeonGamePersistence.mockReturnValue({
        hasExistingSaveData: true,
        saveDataInfo: {
          lastSaveTime: Date.now(),
          saveCount: 1,
          dataSize: 1024,
          isValid: true,
        },
        isLoading: false,
        lastError: null,
      });

      const { result } = renderHook(() =>
        useResumeChoiceLogic({
          onResume: mockOnResume,
          onNewGame: trackingOnNewGame,
        })
      );

      expect(result.current.isModalVisible).toBe(true);

      act(() => {
        result.current.handleNewGame();
        callOrder.push('modalClosed');
      });

      expect(callOrder).toEqual(['onNewGame', 'modalClosed']);
      expect(result.current.isModalVisible).toBe(false);
      expect(trackingOnNewGame).toHaveBeenCalledTimes(1);
    });
  });
});
