import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useAutoSave } from './use-auto-save';

// Mock the persistence hook
const mockSaveGameState = jest.fn();

jest.mock('./use-dungeon-game-persistence', () => ({
  useDungeonGamePersistence: () => ({
    saveGameState: mockSaveGameState,
    isLoading: false,
    lastError: null,
    saveData: null,
    saveDataInfo: null,
    hasExistingSaveData: () => false,
    loadGameState: jest.fn(),
    clearGameState: jest.fn(),
    refreshSaveDataInfo: jest.fn(),
    canResume: false,
    lastSaveTime: null,
    gameLevel: null,
    gameState: null,
  }),
}));

describe('useAutoSave', () => {
  const mockGameState = {
    level: 1,
    gameState: 'Active' as const,
    revealedTiles: 5,
    turnsUsed: 3,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initialization', () => {
    it('should initialize with default config', () => {
      const { result } = renderHook(() => useAutoSave());

      expect(result.current.isEnabled).toBe(true);
      expect(result.current.triggerAutoSave).toBeDefined();
    });

    it('should initialize with custom config', () => {
      const { result } = renderHook(() =>
        useAutoSave({ enabled: false, debounceMs: 1000 })
      );

      expect(result.current.isEnabled).toBe(false);
    });
  });

  describe('triggerAutoSave', () => {
    it('should not save when disabled', async () => {
      const { result } = renderHook(() =>
        useAutoSave({ enabled: false, debounceMs: 500 })
      );

      act(() => {
        result.current.triggerAutoSave(mockGameState);
      });

      jest.runAllTimers();

      expect(mockSaveGameState).not.toHaveBeenCalled();
    });

    it('should save immediately on first call', async () => {
      const { result } = renderHook(() =>
        useAutoSave({ enabled: true, debounceMs: 500 })
      );

      act(() => {
        result.current.triggerAutoSave(mockGameState);
      });

      jest.runAllTimers();

      await waitFor(() => {
        expect(mockSaveGameState).toHaveBeenCalledTimes(1);
      });
    });

    it('should debounce multiple calls', async () => {
      const { result } = renderHook(() =>
        useAutoSave({ enabled: true, debounceMs: 500 })
      );

      // First call
      act(() => {
        result.current.triggerAutoSave(mockGameState);
      });

      // Second call before debounce expires
      act(() => {
        result.current.triggerAutoSave({ ...mockGameState, turnsUsed: 4 });
      });

      // Advance time but not enough to trigger save
      jest.advanceTimersByTime(300);

      expect(mockSaveGameState).not.toHaveBeenCalled();

      // Run all timers to trigger save
      jest.runAllTimers();

      await waitFor(() => {
        expect(mockSaveGameState).toHaveBeenCalledTimes(1);
      });
    });

    it('should save when state changes significantly', async () => {
      const { result } = renderHook(() =>
        useAutoSave({ enabled: true, debounceMs: 500 })
      );

      // First save
      act(() => {
        result.current.triggerAutoSave(mockGameState);
      });

      jest.runAllTimers();

      await waitFor(() => {
        expect(mockSaveGameState).toHaveBeenCalledTimes(1);
      });

      // Change level (significant change)
      const newGameState = { ...mockGameState, level: 2 };
      act(() => {
        result.current.triggerAutoSave(newGameState);
      });

      jest.runAllTimers();

      await waitFor(() => {
        expect(mockSaveGameState).toHaveBeenCalledTimes(2);
      });
    });

    it('should not save when state has not changed significantly', async () => {
      const { result } = renderHook(() =>
        useAutoSave({ enabled: true, debounceMs: 500 })
      );

      // First save
      act(() => {
        result.current.triggerAutoSave(mockGameState);
      });

      jest.runAllTimers();

      await waitFor(() => {
        expect(mockSaveGameState).toHaveBeenCalledTimes(1);
      });

      // Same state, should not save again
      act(() => {
        result.current.triggerAutoSave(mockGameState);
      });

      jest.runAllTimers();

      // Should still only have been called once
      expect(mockSaveGameState).toHaveBeenCalledTimes(1);
    });

    it('should handle save failures gracefully', async () => {
      mockSaveGameState.mockRejectedValueOnce(new Error('Save failed'));

      const { result } = renderHook(() =>
        useAutoSave({ enabled: true, debounceMs: 500 })
      );

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      act(() => {
        result.current.triggerAutoSave(mockGameState);
      });

      jest.runAllTimers();

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Auto-save failed:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('cleanup', () => {
    it('should clear timeout on unmount', () => {
      const { result, unmount } = renderHook(() =>
        useAutoSave({ enabled: true, debounceMs: 500 })
      );

      act(() => {
        result.current.triggerAutoSave(mockGameState);
      });

      // Unmount before timeout expires
      unmount();

      // Advance time - should not trigger save
      jest.runAllTimers();

      expect(mockSaveGameState).not.toHaveBeenCalled();
    });
  });

  describe('state change detection', () => {
    it('should detect level changes', async () => {
      const { result } = renderHook(() =>
        useAutoSave({ enabled: true, debounceMs: 500 })
      );

      // First save
      act(() => {
        result.current.triggerAutoSave(mockGameState);
      });

      jest.runAllTimers();

      await waitFor(() => {
        expect(mockSaveGameState).toHaveBeenCalledTimes(1);
      });

      // Change level
      const newGameState = { ...mockGameState, level: 2 };
      act(() => {
        result.current.triggerAutoSave(newGameState);
      });

      jest.runAllTimers();

      await waitFor(() => {
        expect(mockSaveGameState).toHaveBeenCalledTimes(2);
      });
    });

    it('should detect game state changes', async () => {
      const { result } = renderHook(() =>
        useAutoSave({ enabled: true, debounceMs: 500 })
      );

      // First save
      act(() => {
        result.current.triggerAutoSave(mockGameState);
      });

      jest.runAllTimers();

      await waitFor(() => {
        expect(mockSaveGameState).toHaveBeenCalledTimes(1);
      });

      // Change game state
      const newGameState = { ...mockGameState, gameState: 'Win' as const };
      act(() => {
        result.current.triggerAutoSave(newGameState);
      });

      jest.runAllTimers();

      await waitFor(() => {
        expect(mockSaveGameState).toHaveBeenCalledTimes(2);
      });
    });

    it('should detect revealed tiles changes', async () => {
      const { result } = renderHook(() =>
        useAutoSave({ enabled: true, debounceMs: 500 })
      );

      // First save
      act(() => {
        result.current.triggerAutoSave(mockGameState);
      });

      jest.runAllTimers();

      await waitFor(() => {
        expect(mockSaveGameState).toHaveBeenCalledTimes(1);
      });

      // Change revealed tiles
      const newGameState = { ...mockGameState, revealedTiles: 6 };
      act(() => {
        result.current.triggerAutoSave(newGameState);
      });

      jest.runAllTimers();

      await waitFor(() => {
        expect(mockSaveGameState).toHaveBeenCalledTimes(2);
      });
    });

    it('should detect turns used changes', async () => {
      const { result } = renderHook(() =>
        useAutoSave({ enabled: true, debounceMs: 500 })
      );

      // First save
      act(() => {
        result.current.triggerAutoSave(mockGameState);
      });

      jest.runAllTimers();

      await waitFor(() => {
        expect(mockSaveGameState).toHaveBeenCalledTimes(1);
      });

      // Change turns used
      const newGameState = { ...mockGameState, turnsUsed: 4 };
      act(() => {
        result.current.triggerAutoSave(newGameState);
      });

      jest.runAllTimers();

      await waitFor(() => {
        expect(mockSaveGameState).toHaveBeenCalledTimes(2);
      });
    });
  });
});
