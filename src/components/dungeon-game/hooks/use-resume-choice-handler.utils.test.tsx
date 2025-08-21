import { act, renderHook } from '@testing-library/react-native';

import { useResumeChoiceHandler } from './use-resume-choice-handler';

// Mock the persistence hook
const mockUseDungeonGamePersistence = jest.fn();
jest.mock('./use-dungeon-game-persistence', () => ({
  useDungeonGamePersistence: () => mockUseDungeonGamePersistence(),
}));

// Mock the game grid state hook
const mockUseGameGridState = jest.fn();
jest.mock('./use-game-grid-state', () => ({
  useGameGridState: () => mockUseGameGridState(),
}));

describe('useResumeChoiceHandler - Utility Functions and Edge Cases', () => {
  const mockOnGameReady = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('grid state conversion utilities', () => {
    it('should correctly convert empty grid state to revealed tiles set', async () => {
      const mockLoadGameState = jest.fn().mockResolvedValue({
        success: true,
        data: {
          level: 1,
          gameState: 'Active',
          turnsUsed: 0,
          gridState: [], // Empty grid state
          achievements: {
            totalGamesPlayed: 0,
            gamesWon: 0,
            gamesLost: 0,
            highestLevelReached: 1,
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
          version: '1.0',
          timestamp: Date.now(),
        },
      });

      const mockSetRevealedTiles = jest.fn();

      mockUseDungeonGamePersistence.mockReturnValue({
        loadGameState: mockLoadGameState,
        clearGameState: jest.fn(),
      });

      mockUseGameGridState.mockReturnValue({
        setRevealedTiles: mockSetRevealedTiles,
        setTurnsUsed: jest.fn(),
      });

      const { result } = renderHook(() =>
        useResumeChoiceHandler({
          onGameReady: mockOnGameReady,
          onError: mockOnError,
        })
      );

      await act(async () => {
        await result.current.handleResume();
      });

      // Should set an empty Set for revealed tiles
      expect(mockSetRevealedTiles).toHaveBeenCalledWith(new Set());
    });

    it('should correctly convert partial grid state to revealed tiles set', async () => {
      const mockLoadGameState = jest.fn().mockResolvedValue({
        success: true,
        data: {
          level: 2,
          gameState: 'Active',
          turnsUsed: 5,
          gridState: [
            {
              x: 0,
              y: 0,
              isRevealed: true,
              id: '0-0',
              type: 'neutral',
              hasBeenVisited: false,
            },
            {
              x: 1,
              y: 0,
              isRevealed: false,
              id: '1-0',
              type: 'treasure',
              hasBeenVisited: false,
            },
            {
              x: 2,
              y: 1,
              isRevealed: true,
              id: '2-1',
              type: 'trap',
              hasBeenVisited: true,
            },
          ],
          achievements: {
            totalGamesPlayed: 1,
            gamesWon: 0,
            gamesLost: 0,
            highestLevelReached: 2,
            totalTurnsUsed: 5,
            totalTreasureFound: 0,
          },
          statistics: {
            winRate: 0,
            averageTurnsPerGame: 5,
            longestGameSession: 300,
            totalPlayTime: 300,
          },
          itemEffects: [],
          version: '1.0',
          timestamp: Date.now(),
        },
      });

      const mockSetRevealedTiles = jest.fn();

      mockUseDungeonGamePersistence.mockReturnValue({
        loadGameState: mockLoadGameState,
        clearGameState: jest.fn(),
      });

      mockUseGameGridState.mockReturnValue({
        setRevealedTiles: mockSetRevealedTiles,
        setTurnsUsed: jest.fn(),
      });

      const { result } = renderHook(() =>
        useResumeChoiceHandler({
          onGameReady: mockOnGameReady,
          onError: mockOnError,
        })
      );

      await act(async () => {
        await result.current.handleResume();
      });

      // Should only include revealed tiles (0-0 and 2-1)
      const expectedSet = new Set(['0-0', '2-1']);
      expect(mockSetRevealedTiles).toHaveBeenCalledWith(expectedSet);
    });
  });

  describe('error handling edge cases', () => {
    it('should handle null data in successful response', async () => {
      const mockLoadGameState = jest.fn().mockResolvedValue({
        success: true,
        data: null, // Null data even though success is true
      });

      mockUseDungeonGamePersistence.mockReturnValue({
        loadGameState: mockLoadGameState,
        clearGameState: jest.fn(),
      });

      mockUseGameGridState.mockReturnValue({
        setRevealedTiles: jest.fn(),
        setTurnsUsed: jest.fn(),
      });

      const { result } = renderHook(() =>
        useResumeChoiceHandler({
          onGameReady: mockOnGameReady,
          onError: mockOnError,
        })
      );

      await act(async () => {
        await result.current.handleResume();
      });

      expect(mockOnError).toHaveBeenCalledWith('No save data available');
      expect(result.current.error).toBe('No save data available');
    });

    it('should handle unexpected error objects in resume', async () => {
      const mockLoadGameState = jest.fn().mockRejectedValue('String error');

      mockUseDungeonGamePersistence.mockReturnValue({
        loadGameState: mockLoadGameState,
        clearGameState: jest.fn(),
      });

      mockUseGameGridState.mockReturnValue({
        setRevealedTiles: jest.fn(),
        setTurnsUsed: jest.fn(),
      });

      const { result } = renderHook(() =>
        useResumeChoiceHandler({
          onGameReady: mockOnGameReady,
          onError: mockOnError,
        })
      );

      await act(async () => {
        await result.current.handleResume();
      });

      expect(mockOnError).toHaveBeenCalledWith('Failed to load game state');
      expect(result.current.error).toBe('Failed to load game state');
    });

    it('should handle unexpected error objects in new game', async () => {
      const mockClearGameState = jest.fn().mockRejectedValue('String error');

      mockUseDungeonGamePersistence.mockReturnValue({
        loadGameState: jest.fn(),
        clearGameState: mockClearGameState,
      });

      mockUseGameGridState.mockReturnValue({
        setRevealedTiles: jest.fn(),
        setTurnsUsed: jest.fn(),
      });

      const { result } = renderHook(() =>
        useResumeChoiceHandler({
          onGameReady: mockOnGameReady,
          onError: mockOnError,
        })
      );

      await act(async () => {
        await result.current.handleNewGame();
      });

      expect(mockOnError).toHaveBeenCalledWith('Failed to clear game state');
      expect(result.current.error).toBe('Failed to clear game state');
    });
  });

  describe('concurrent operation handling', () => {
    it('should handle concurrent resume operations gracefully', async () => {
      let resolveFirst: () => void;
      let resolveSecond: () => void;

      const mockLoadGameState = jest
        .fn()
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolveFirst = () =>
                resolve({
                  success: true,
                  data: {
                    level: 1,
                    gameState: 'Active',
                    turnsUsed: 0,
                    gridState: [],
                    achievements: {
                      totalGamesPlayed: 0,
                      gamesWon: 0,
                      gamesLost: 0,
                      highestLevelReached: 1,
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
                    version: '1.0',
                    timestamp: Date.now(),
                  },
                });
            })
        )
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolveSecond = () =>
                resolve({ success: false, error: 'Second call' });
            })
        );

      mockUseDungeonGamePersistence.mockReturnValue({
        loadGameState: mockLoadGameState,
        clearGameState: jest.fn(),
      });

      mockUseGameGridState.mockReturnValue({
        setRevealedTiles: jest.fn(),
        setTurnsUsed: jest.fn(),
      });

      const { result } = renderHook(() =>
        useResumeChoiceHandler({
          onGameReady: mockOnGameReady,
          onError: mockOnError,
        })
      );

      // Start first operation
      const firstPromise = act(async () => {
        await result.current.handleResume();
      });

      expect(result.current.isLoading).toBe(true);

      // Start second operation while first is still pending
      const secondPromise = act(async () => {
        await result.current.handleResume();
      });

      // Resolve operations
      resolveFirst!();
      await firstPromise;

      resolveSecond!();
      await secondPromise;

      // Both operations should complete
      expect(mockOnGameReady).toHaveBeenCalledTimes(1);
      expect(mockOnError).toHaveBeenCalledTimes(1);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('state restoration with complex data', () => {
    it('should handle save data with item effects correctly', async () => {
      const mockLoadGameState = jest.fn().mockResolvedValue({
        success: true,
        data: {
          level: 5,
          gameState: 'Active',
          turnsUsed: 25,
          gridState: [
            {
              x: 3,
              y: 4,
              isRevealed: true,
              id: '3-4',
              type: 'bonus',
              hasBeenVisited: true,
            },
          ],
          achievements: {
            totalGamesPlayed: 10,
            gamesWon: 7,
            gamesLost: 3,
            highestLevelReached: 5,
            totalTurnsUsed: 250,
            totalTreasureFound: 15,
          },
          statistics: {
            winRate: 0.7,
            averageTurnsPerGame: 25,
            longestGameSession: 1200,
            totalPlayTime: 10000,
          },
          itemEffects: [
            {
              itemId: 'speed-boost',
              effectType: 'turnReduction',
              value: 0.5,
              remainingDuration: 3,
              isActive: true,
            },
          ],
          version: '1.0',
          timestamp: Date.now(),
        },
      });

      const mockSetRevealedTiles = jest.fn();
      const mockSetTurnsUsed = jest.fn();

      mockUseDungeonGamePersistence.mockReturnValue({
        loadGameState: mockLoadGameState,
        clearGameState: jest.fn(),
      });

      mockUseGameGridState.mockReturnValue({
        setRevealedTiles: mockSetRevealedTiles,
        setTurnsUsed: mockSetTurnsUsed,
      });

      const { result } = renderHook(() =>
        useResumeChoiceHandler({
          onGameReady: mockOnGameReady,
          onError: mockOnError,
        })
      );

      await act(async () => {
        await result.current.handleResume();
      });

      expect(mockSetTurnsUsed).toHaveBeenCalledWith(25);
      expect(mockSetRevealedTiles).toHaveBeenCalledWith(new Set(['3-4']));
      expect(mockOnGameReady).toHaveBeenCalled();
      expect(result.current.error).toBeNull();
    });

    it('should handle save data from different game version', async () => {
      const mockLoadGameState = jest.fn().mockResolvedValue({
        success: true,
        data: {
          level: 1,
          gameState: 'Active',
          turnsUsed: 0,
          gridState: [],
          achievements: {
            totalGamesPlayed: 0,
            gamesWon: 0,
            gamesLost: 0,
            highestLevelReached: 1,
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
          version: '0.9', // Older version
          timestamp: Date.now() - 86400000, // 1 day old
        },
      });

      mockUseDungeonGamePersistence.mockReturnValue({
        loadGameState: mockLoadGameState,
        clearGameState: jest.fn(),
      });

      mockUseGameGridState.mockReturnValue({
        setRevealedTiles: jest.fn(),
        setTurnsUsed: jest.fn(),
      });

      const { result } = renderHook(() =>
        useResumeChoiceHandler({
          onGameReady: mockOnGameReady,
          onError: mockOnError,
        })
      );

      await act(async () => {
        await result.current.handleResume();
      });

      // Should still work even with older version
      expect(mockOnGameReady).toHaveBeenCalled();
      expect(result.current.error).toBeNull();
    });
  });
});
