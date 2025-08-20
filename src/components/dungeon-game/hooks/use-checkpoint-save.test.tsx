import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useCheckpointSave } from './use-checkpoint-save';
import { useDungeonGamePersistence } from './use-dungeon-game-persistence';

// Mock the persistence hook
jest.mock('./use-dungeon-game-persistence');

const mockUseDungeonGamePersistence =
  useDungeonGamePersistence as jest.MockedFunction<
    typeof useDungeonGamePersistence
  >;

describe('useCheckpointSave', () => {
  const mockSaveGameState = jest.fn();
  const mockGameState = {
    level: 1,
    gameState: 'Active' as const,
    revealedTiles: 5,
    turnsUsed: 3,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseDungeonGamePersistence.mockReturnValue({
      saveGameState: mockSaveGameState,
      isLoading: false,
      lastError: null,
      saveData: null,
      saveDataInfo: null,
      hasExistingSaveData: false,
      loadGameState: jest.fn(),
      clearGameState: jest.fn(),
      refreshSaveDataInfo: jest.fn(),
      canResume: false,
      lastSaveTime: null,
      gameLevel: null,
      gameState: null,
    });
  });

  describe('initialization', () => {
    it('should initialize with default config', () => {
      const { result } = renderHook(() => useCheckpointSave());

      expect(result.current.isEnabled).toBe(true);
      expect(result.current.saveNewGame).toBeDefined();
      expect(result.current.saveLevelCompletion).toBeDefined();
      expect(result.current.saveGameOver).toBeDefined();
      expect(result.current.saveLevelProgression).toBeDefined();
    });

    it('should initialize with custom config', () => {
      const { result } = renderHook(() =>
        useCheckpointSave({ enabled: false })
      );

      expect(result.current.isEnabled).toBe(false);
    });
  });

  describe('saveNewGame', () => {
    it('should save new game when enabled', async () => {
      const { result } = renderHook(() => useCheckpointSave({ enabled: true }));

      await act(async () => {
        await result.current.saveNewGame(mockGameState);
      });

      expect(mockSaveGameState).toHaveBeenCalledTimes(1);
      expect(mockSaveGameState).toHaveBeenCalledWith({
        gameState: 'Active',
        level: 1,
        gridState: [],
        turnsUsed: 3,
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
      });
    });

    it('should not save when disabled', async () => {
      const { result } = renderHook(() =>
        useCheckpointSave({ enabled: false })
      );

      await act(async () => {
        await result.current.saveNewGame(mockGameState);
      });

      expect(mockSaveGameState).not.toHaveBeenCalled();
    });

    it('should handle save failures gracefully', async () => {
      mockSaveGameState.mockRejectedValueOnce(new Error('Save failed'));

      const { result } = renderHook(() => useCheckpointSave({ enabled: true }));

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await act(async () => {
        await result.current.saveNewGame(mockGameState);
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Checkpoint save failed for New game started:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('saveLevelCompletion', () => {
    it('should save level completion when enabled', async () => {
      const { result } = renderHook(() => useCheckpointSave({ enabled: true }));

      const winGameState = { ...mockGameState, gameState: 'Win' as const };

      await act(async () => {
        await result.current.saveLevelCompletion(winGameState);
      });

      expect(mockSaveGameState).toHaveBeenCalledTimes(1);
      expect(mockSaveGameState).toHaveBeenCalledWith({
        gameState: 'Win',
        level: 1,
        gridState: [],
        turnsUsed: 3,
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
      });
    });

    it('should not save when disabled', async () => {
      const { result } = renderHook(() =>
        useCheckpointSave({ enabled: false })
      );

      await act(async () => {
        await result.current.saveLevelCompletion(mockGameState);
      });

      expect(mockSaveGameState).not.toHaveBeenCalled();
    });

    it('should handle save failures gracefully', async () => {
      mockSaveGameState.mockRejectedValueOnce(new Error('Save failed'));

      const { result } = renderHook(() => useCheckpointSave({ enabled: true }));

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await act(async () => {
        await result.current.saveLevelCompletion(mockGameState);
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Checkpoint save failed for Level completed:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('saveGameOver', () => {
    it('should save game over when enabled', async () => {
      const { result } = renderHook(() => useCheckpointSave({ enabled: true }));

      const gameOverState = {
        ...mockGameState,
        gameState: 'Game Over' as const,
      };

      await act(async () => {
        await result.current.saveGameOver(gameOverState);
      });

      expect(mockSaveGameState).toHaveBeenCalledTimes(1);
      expect(mockSaveGameState).toHaveBeenCalledWith({
        gameState: 'Game Over',
        level: 1,
        gridState: [],
        turnsUsed: 3,
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
      });
    });

    it('should not save when disabled', async () => {
      const { result } = renderHook(() =>
        useCheckpointSave({ enabled: false })
      );

      await act(async () => {
        await result.current.saveGameOver(mockGameState);
      });

      expect(mockSaveGameState).not.toHaveBeenCalled();
    });

    it('should handle save failures gracefully', async () => {
      mockSaveGameState.mockRejectedValueOnce(new Error('Save failed'));

      const { result } = renderHook(() => useCheckpointSave({ enabled: true }));

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await act(async () => {
        await result.current.saveGameOver(mockGameState);
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Checkpoint save failed for Game over:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('saveLevelProgression', () => {
    it('should save level progression when enabled', async () => {
      const { result } = renderHook(() => useCheckpointSave({ enabled: true }));

      const nextLevelState = { ...mockGameState, level: 2 };

      await act(async () => {
        await result.current.saveLevelProgression(nextLevelState);
      });

      expect(mockSaveGameState).toHaveBeenCalledTimes(1);
      expect(mockSaveGameState).toHaveBeenCalledWith({
        gameState: 'Active',
        level: 2,
        gridState: [],
        turnsUsed: 3,
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
      });
    });

    it('should not save when disabled', async () => {
      const { result } = renderHook(() =>
        useCheckpointSave({ enabled: false })
      );

      await act(async () => {
        await result.current.saveLevelProgression(mockGameState);
      });

      expect(mockSaveGameState).not.toHaveBeenCalled();
    });

    it('should handle save failures gracefully', async () => {
      mockSaveGameState.mockRejectedValueOnce(new Error('Save failed'));

      const { result } = renderHook(() => useCheckpointSave({ enabled: true }));

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await act(async () => {
        await result.current.saveLevelProgression(mockGameState);
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Checkpoint save failed for Level progression:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('save data structure', () => {
    it('should create correct save data structure for all checkpoint types', async () => {
      const { result } = renderHook(() => useCheckpointSave({ enabled: true }));

      const testGameState = {
        level: 3,
        gameState: 'Active' as const,
        revealedTiles: 10,
        turnsUsed: 7,
      };

      // Test all checkpoint types
      await act(async () => {
        await result.current.saveNewGame(testGameState);
        await result.current.saveLevelCompletion({
          ...testGameState,
          gameState: 'Win',
        });
        await result.current.saveGameOver({
          ...testGameState,
          gameState: 'Game Over',
        });
        await result.current.saveLevelProgression({
          ...testGameState,
          level: 4,
        });
      });

      // Should have been called 4 times
      expect(mockSaveGameState).toHaveBeenCalledTimes(4);

      // All calls should have the same basic structure
      const expectedStructure = {
        level: expect.any(Number),
        gameState: expect.stringMatching(/Active|Win|Game Over/),
        gridState: [],
        turnsUsed: expect.any(Number),
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
      };

      mockSaveGameState.mock.calls.forEach((call) => {
        expect(call[0]).toMatchObject(expectedStructure);
      });
    });
  });
});
