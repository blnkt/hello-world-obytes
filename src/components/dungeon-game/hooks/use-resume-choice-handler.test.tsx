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

describe('useResumeChoiceHandler', () => {
  const mockOnGameReady = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should initialize with loading state false and no error', () => {
      mockUseDungeonGamePersistence.mockReturnValue({
        loadGameState: jest.fn(),
        clearGameState: jest.fn(),
        isLoading: false,
        lastError: null,
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

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('resume game functionality', () => {
    it('should load game state and update game grid when resuming', async () => {
      const mockLoadGameState = jest.fn().mockResolvedValue({
        success: true,
        data: {
          level: 2,
          gameState: 'Active',
          turnsUsed: 15,
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
              y: 1,
              isRevealed: true,
              id: '1-1',
              type: 'treasure',
              hasBeenVisited: false,
            },
          ],
          achievements: {
            totalGamesPlayed: 5,
            gamesWon: 3,
            gamesLost: 2,
            highestLevelReached: 2,
            totalTurnsUsed: 15,
            totalTreasureFound: 1,
          },
          statistics: {
            winRate: 0.6,
            averageTurnsPerGame: 15,
            longestGameSession: 300,
            totalPlayTime: 1500,
          },
          itemEffects: [],
          version: '1.0',
          timestamp: Date.now(),
        },
      });

      mockUseDungeonGamePersistence.mockReturnValue({
        loadGameState: mockLoadGameState,
        clearGameState: jest.fn(),
        isLoading: false,
        lastError: null,
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

      expect(mockLoadGameState).toHaveBeenCalled();
      expect(mockOnGameReady).toHaveBeenCalled();
      expect(result.current.error).toBeNull();
    });

    it('should handle errors when loading game state fails', async () => {
      const mockLoadGameState = jest.fn().mockResolvedValue({
        success: false,
        error: 'Load failed',
      });

      mockUseDungeonGamePersistence.mockReturnValue({
        loadGameState: mockLoadGameState,
        clearGameState: jest.fn(),
        isLoading: false,
        lastError: null,
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

      expect(mockOnError).toHaveBeenCalledWith('Load failed');
      expect(result.current.error).toBe('Load failed');
    });
  });

  describe('new game functionality', () => {
    it('should clear existing save data and reset game when starting new game', async () => {
      const mockClearGameState = jest.fn().mockResolvedValue(true);

      mockUseDungeonGamePersistence.mockReturnValue({
        loadGameState: jest.fn(),
        clearGameState: mockClearGameState,
        isLoading: false,
        lastError: null,
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

      expect(mockClearGameState).toHaveBeenCalled();
      expect(mockOnGameReady).toHaveBeenCalled();
      expect(result.current.error).toBeNull();
    });

    it('should handle errors when clearing game state fails', async () => {
      const mockClearGameState = jest
        .fn()
        .mockRejectedValue(new Error('Clear failed'));

      mockUseDungeonGamePersistence.mockReturnValue({
        loadGameState: jest.fn(),
        clearGameState: mockClearGameState,
        isLoading: false,
        lastError: null,
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

      expect(mockOnError).toHaveBeenCalledWith('Clear failed');
      expect(result.current.error).toBe('Clear failed');
    });
  });

  describe('loading states', () => {
    it('should show loading state during resume operation', async () => {
      const mockLoadGameState = jest
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 100))
        );

      mockUseDungeonGamePersistence.mockReturnValue({
        loadGameState: mockLoadGameState,
        clearGameState: jest.fn(),
        isLoading: false,
        lastError: null,
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

      act(() => {
        result.current.handleResume();
      });

      expect(result.current.isLoading).toBe(true);

      // Wait for the async operation to complete
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should show loading state during new game operation', async () => {
      const mockClearGameState = jest
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 100))
        );

      mockUseDungeonGamePersistence.mockReturnValue({
        loadGameState: jest.fn(),
        clearGameState: mockClearGameState,
        isLoading: false,
        lastError: null,
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

      act(() => {
        result.current.handleNewGame();
      });

      expect(result.current.isLoading).toBe(true);

      // Wait for the async operation to complete
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should clear error when starting a new operation', async () => {
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
          version: '1.0',
          timestamp: Date.now(),
        },
      });

      mockUseDungeonGamePersistence.mockReturnValue({
        loadGameState: mockLoadGameState,
        clearGameState: jest.fn(),
        isLoading: false,
        lastError: null,
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

      // Set an error first
      result.current.error = 'Previous error';

      await act(async () => {
        await result.current.handleResume();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
