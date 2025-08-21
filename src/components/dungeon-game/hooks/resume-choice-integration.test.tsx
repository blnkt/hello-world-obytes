import { act, renderHook } from '@testing-library/react-native';

import { useResumeChoiceHandler } from './use-resume-choice-handler';
import { useResumeChoiceLogic } from './use-resume-choice-logic';

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

describe('Resume Choice Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('logic and handler integration', () => {
    it('should handle complete resume flow from detection to restoration', async () => {
      const mockLoadGameState = jest.fn().mockResolvedValue({
        success: true,
        data: {
          level: 3,
          gameState: 'Active',
          turnsUsed: 12,
          gridState: [
            {
              x: 1,
              y: 1,
              isRevealed: true,
              id: '1-1',
              type: 'treasure',
              hasBeenVisited: false,
            },
          ],
          achievements: {
            totalGamesPlayed: 2,
            gamesWon: 1,
            gamesLost: 1,
            highestLevelReached: 3,
            totalTurnsUsed: 25,
            totalTreasureFound: 2,
          },
          statistics: {
            winRate: 0.5,
            averageTurnsPerGame: 12.5,
            longestGameSession: 600,
            totalPlayTime: 1200,
          },
          itemEffects: [],
          version: '1.0',
          timestamp: Date.now(),
        },
      });

      const mockSetRevealedTiles = jest.fn();
      const mockSetTurnsUsed = jest.fn();

      mockUseDungeonGamePersistence.mockReturnValue({
        hasExistingSaveData: true,
        saveDataInfo: {
          lastSaveTime: Date.now(),
          saveCount: 3,
          dataSize: 2048,
          isValid: true,
        },
        isLoading: false,
        lastError: null,
        loadGameState: mockLoadGameState,
        clearGameState: jest.fn(),
      });

      mockUseGameGridState.mockReturnValue({
        setRevealedTiles: mockSetRevealedTiles,
        setTurnsUsed: mockSetTurnsUsed,
      });

      const mockOnGameReady = jest.fn();
      const mockOnError = jest.fn();

      // Set up logic hook
      const { result: logicResult } = renderHook(() =>
        useResumeChoiceLogic({
          onResume: () => {
            handlerResult.current.handleResume();
          },
          onNewGame: () => {
            handlerResult.current.handleNewGame();
          },
        })
      );

      // Set up handler hook
      const { result: handlerResult } = renderHook(() =>
        useResumeChoiceHandler({
          onGameReady: mockOnGameReady,
          onError: mockOnError,
        })
      );

      // Verify modal should show
      expect(logicResult.current.shouldShowResumeChoice).toBe(true);
      expect(logicResult.current.isModalVisible).toBe(true);
      expect(logicResult.current.saveDataInfo).toEqual({
        lastSaveTime: expect.any(Number),
        saveCount: 3,
        dataSize: 2048,
        isValid: true,
      });

      // Simulate user choosing to resume
      await act(async () => {
        logicResult.current.handleResume();
      });

      // Verify modal is hidden after choice
      expect(logicResult.current.isModalVisible).toBe(false);

      // Verify game state was restored
      expect(mockLoadGameState).toHaveBeenCalled();
      expect(mockSetRevealedTiles).toHaveBeenCalledWith(new Set(['1-1']));
      expect(mockSetTurnsUsed).toHaveBeenCalledWith(12);
      expect(mockOnGameReady).toHaveBeenCalled();
      expect(mockOnError).not.toHaveBeenCalled();
    });

    it('should handle complete new game flow from detection to cleanup', async () => {
      const mockClearGameState = jest.fn().mockResolvedValue(true);

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
        loadGameState: jest.fn(),
        clearGameState: mockClearGameState,
      });

      mockUseGameGridState.mockReturnValue({
        setRevealedTiles: jest.fn(),
        setTurnsUsed: jest.fn(),
      });

      const mockOnGameReady = jest.fn();
      const mockOnError = jest.fn();

      // Set up logic hook
      const { result: logicResult } = renderHook(() =>
        useResumeChoiceLogic({
          onResume: () => {
            handlerResult.current.handleResume();
          },
          onNewGame: () => {
            handlerResult.current.handleNewGame();
          },
        })
      );

      // Set up handler hook
      const { result: handlerResult } = renderHook(() =>
        useResumeChoiceHandler({
          onGameReady: mockOnGameReady,
          onError: mockOnError,
        })
      );

      // Verify modal should show
      expect(logicResult.current.shouldShowResumeChoice).toBe(true);
      expect(logicResult.current.isModalVisible).toBe(true);

      // Simulate user choosing new game
      await act(async () => {
        logicResult.current.handleNewGame();
      });

      // Verify modal is hidden after choice
      expect(logicResult.current.isModalVisible).toBe(false);

      // Verify save data was cleared and game is ready
      expect(mockClearGameState).toHaveBeenCalled();
      expect(mockOnGameReady).toHaveBeenCalled();
      expect(mockOnError).not.toHaveBeenCalled();
    });

    it('should handle error propagation from handler to logic', async () => {
      const mockLoadGameState = jest.fn().mockResolvedValue({
        success: false,
        error: 'Corrupted save data',
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
        loadGameState: mockLoadGameState,
        clearGameState: jest.fn(),
      });

      mockUseGameGridState.mockReturnValue({
        setRevealedTiles: jest.fn(),
        setTurnsUsed: jest.fn(),
      });

      const mockOnGameReady = jest.fn();
      const mockOnError = jest.fn();

      // Set up logic hook
      const { result: logicResult } = renderHook(() =>
        useResumeChoiceLogic({
          onResume: () => {
            handlerResult.current.handleResume();
          },
          onNewGame: () => {
            handlerResult.current.handleNewGame();
          },
        })
      );

      // Set up handler hook
      const { result: handlerResult } = renderHook(() =>
        useResumeChoiceHandler({
          onGameReady: mockOnGameReady,
          onError: mockOnError,
        })
      );

      // Verify modal shows initially
      expect(logicResult.current.isModalVisible).toBe(true);

      // Simulate user choosing to resume with corrupted data
      await act(async () => {
        logicResult.current.handleResume();
      });

      // Verify error was handled
      expect(mockOnError).toHaveBeenCalledWith('Corrupted save data');
      expect(handlerResult.current.error).toBe('Corrupted save data');

      // Modal should still be hidden (user made a choice)
      expect(logicResult.current.isModalVisible).toBe(false);
    });
  });

  describe('loading state coordination', () => {
    it('should show loading states during resume operation', async () => {
      let resolveLoadGameState: () => void;
      const mockLoadGameState = jest.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveLoadGameState = () =>
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
      );

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
        loadGameState: mockLoadGameState,
        clearGameState: jest.fn(),
      });

      mockUseGameGridState.mockReturnValue({
        setRevealedTiles: jest.fn(),
        setTurnsUsed: jest.fn(),
      });

      const mockOnGameReady = jest.fn();
      const mockOnError = jest.fn();

      // Set up handler hook
      const { result: handlerResult } = renderHook(() =>
        useResumeChoiceHandler({
          onGameReady: mockOnGameReady,
          onError: mockOnError,
        })
      );

      expect(handlerResult.current.isLoading).toBe(false);

      // Start resume operation
      act(() => {
        handlerResult.current.handleResume();
      });

      expect(handlerResult.current.isLoading).toBe(true);

      // Resolve the operation
      resolveLoadGameState!();
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      expect(handlerResult.current.isLoading).toBe(false);
      expect(mockOnGameReady).toHaveBeenCalled();
    });
  });

  describe('persistence state changes during interaction', () => {
    it('should handle persistence state changing while modal is open', () => {
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

      const { result, rerender } = renderHook(() =>
        useResumeChoiceLogic({
          onResume: jest.fn(),
          onNewGame: jest.fn(),
        })
      );

      // Modal should show initially
      expect(result.current.isModalVisible).toBe(true);

      // Simulate persistence data becoming invalid while modal is open
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

      // Modal should remain open (user hasn't made a choice yet)
      // but shouldShowResumeChoice should be false
      expect(result.current.shouldShowResumeChoice).toBe(false);
      expect(result.current.isModalVisible).toBe(true);
    });

    it('should handle persistence entering loading state while modal is open', () => {
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

      const { result, rerender } = renderHook(() =>
        useResumeChoiceLogic({
          onResume: jest.fn(),
          onNewGame: jest.fn(),
        })
      );

      expect(result.current.isModalVisible).toBe(true);

      // Simulate persistence entering loading state
      mockUseDungeonGamePersistence.mockReturnValue({
        hasExistingSaveData: true,
        saveDataInfo: {
          lastSaveTime: Date.now(),
          saveCount: 1,
          dataSize: 1024,
          isValid: true,
        },
        isLoading: true,
        lastError: null,
      });

      rerender({});

      // Modal should remain open but shouldShowResumeChoice should be false
      expect(result.current.shouldShowResumeChoice).toBe(false);
      expect(result.current.isModalVisible).toBe(true);
    });
  });
});
