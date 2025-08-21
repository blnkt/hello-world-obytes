import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type {
  DungeonGameSaveData,
  GameState,
  GridTileState,
  TileType,
} from '@/types/dungeon-game';

import { useDungeonGamePersistence } from '../hooks/use-dungeon-game-persistence';

interface GameStateContextValue {
  // Game state
  level: number;
  gameState: GameState;
  revealedTiles: Set<string>;
  tileTypes: Record<string, string>;
  turnsUsed: number;
  currency: number;

  // Actions
  setLevel: (level: number) => void;
  setGameState: (state: GameState) => void;
  revealTile: (x: number, y: number, type: string) => boolean;
  setTurnsUsed: (turns: number) => void;
  setCurrency: (amount: number) => void;
  incrementTurn: () => void;

  // Game flow
  startNewGame: () => void;
  completeLevel: () => void;
  gameOver: () => void;

  // Persistence
  isLoading: boolean;
  lastError: string | null;
  lastSaveTime: number | null;

  // Resume functionality
  hasExistingSave: boolean;
  resumeGame: () => Promise<void>;
  clearSave: () => Promise<void>;
}

const GameStateContext = createContext<GameStateContextValue | null>(null);

export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within GameStateProvider');
  }
  return context;
};

interface GameStateProviderProps {
  children: React.ReactNode;
  initialCurrency?: number;
}

// Helper function to create save data
const createSaveDataHelper = (params: {
  gameState: GameState;
  level: number;
  revealedTiles: Set<string>;
  tileTypes: Record<string, string>;
  turnsUsed: number;
  currency: number;
}): Omit<DungeonGameSaveData, 'version' | 'timestamp'> => {
  const { gameState, level, revealedTiles, tileTypes, turnsUsed, currency } =
    params;
  return {
    gameState,
    level,
    gridState: Array.from(revealedTiles).map((tileKey) => {
      const [x, y] = tileKey.split('-').map(Number);
      return {
        id: tileKey,
        x,
        y,
        isRevealed: true,
        type: (tileTypes[tileKey] as TileType) || 'neutral',
        hasBeenVisited: false,
      };
    }),
    turnsUsed,
    currency,
    achievements: {
      totalGamesPlayed: 0,
      gamesWon: 0,
      gamesLost: 0,
      highestLevelReached: level,
      totalTurnsUsed: turnsUsed,
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
};

// Helper function to restore game state
const restoreGameStateHelper = (params: {
  result: any;
  setLevel: (level: number) => void;
  setGameState: (state: GameState) => void;
  setTurnsUsed: (turns: number) => void;
  setCurrency: (currency: number) => void;
  setRevealedTiles: (tiles: Set<string>) => void;
  setTileTypes: (types: Record<string, string>) => void;
  setLastSaveTime: (time: number) => void;
}) => {
  const {
    result,
    setLevel,
    setGameState,
    setTurnsUsed,
    setCurrency,
    setRevealedTiles,
    setTileTypes,
    setLastSaveTime,
  } = params;
  const {
    gridState,
    turnsUsed: savedTurns,
    currency: savedCurrency,
    level: savedLevel,
    gameState: savedGameState,
  } = result.data;

  // Restore game state
  setLevel(savedLevel);
  setGameState(savedGameState);
  setTurnsUsed(savedTurns);
  setCurrency(savedCurrency || 1000); // Default to 1000 if not saved

  // Convert grid state back to our format
  const newRevealedTiles = new Set<string>();
  const newTileTypes: Record<string, string> = {};

  gridState.forEach((tile: GridTileState) => {
    if (tile.isRevealed) {
      newRevealedTiles.add(tile.id);
      newTileTypes[tile.id] = tile.type;
    }
  });

  setRevealedTiles(newRevealedTiles);
  setTileTypes(newTileTypes);

  setLastSaveTime(result.data.timestamp);
};

// eslint-disable-next-line max-lines-per-function
export const GameStateProvider: React.FC<GameStateProviderProps> = ({
  children,
  initialCurrency = 1000,
}) => {
  // Core game state
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState<GameState>('Active');
  const [revealedTiles, setRevealedTiles] = useState<Set<string>>(new Set());
  const [tileTypes, setTileTypes] = useState<Record<string, string>>({});
  const [turnsUsed, setTurnsUsed] = useState(0);
  const [currency, setCurrency] = useState(initialCurrency);

  // Persistence
  const { saveGameState, loadGameState, clearGameState, hasExistingSaveData } =
    useDungeonGamePersistence();

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);

  // Debounced save ref
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Convert current state to save data
  const createSaveData = useCallback((): Omit<
    DungeonGameSaveData,
    'version' | 'timestamp'
  > => {
    return createSaveDataHelper({
      gameState,
      level,
      revealedTiles,
      tileTypes,
      turnsUsed,
      currency,
    });
  }, [gameState, level, revealedTiles, tileTypes, turnsUsed, currency]);

  // Debounced save function
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const saveData = createSaveData();
        const result = await saveGameState(saveData);

        if (result.success) {
          setLastError(null);
          setLastSaveTime(Date.now());
        } else {
          setLastError(result.error || 'Save failed');
        }
      } catch (error) {
        setLastError(error instanceof Error ? error.message : 'Unknown error');
      }
    }, 1000); // 1 second debounce
  }, [createSaveData, saveGameState]);

  // Auto-save when state changes
  useEffect(() => {
    if (gameState === 'Active' && (revealedTiles.size > 0 || turnsUsed > 0)) {
      debouncedSave();
    }
  }, [revealedTiles.size, turnsUsed, gameState, debouncedSave]);

  // Cleanup save timeout
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Game actions
  const incrementTurn = useCallback(() => {
    setTurnsUsed((prev) => prev + 1);
  }, []);

  const revealTile = useCallback(
    (x: number, y: number, type: string) => {
      // Calculate available turns based on currency (100 currency per turn)
      const availableTurns = Math.floor(currency / 100);

      // Validate that player has enough turns to reveal a tile
      if (availableTurns <= 0) {
        // No turns available, don't allow tile reveal
        return false;
      }

      const tileKey = `${x}-${y}`;
      setRevealedTiles((prev) => new Set([...prev, tileKey]));
      setTileTypes((prev) => ({ ...prev, [tileKey]: type }));

      // Increment turn count and deduct currency cost (100 per turn)
      incrementTurn();
      setCurrency((prev) => prev - 100);

      return true; // Tile reveal successful
    },
    [incrementTurn, currency, setCurrency]
  );

  const startNewGame = useCallback(() => {
    setLevel(1);
    setGameState('Active');
    setRevealedTiles(new Set());
    setTileTypes({});
    setTurnsUsed(0);
    setLastError(null);

    // Immediate save for new game
    debouncedSave();
  }, [debouncedSave]);

  const completeLevel = useCallback(() => {
    // Prevent multiple win calls
    if (gameState === 'Win') {
      return;
    }

    setGameState('Win');
    setLastError(null);

    // Immediate save for level completion
    debouncedSave();
  }, [debouncedSave, gameState]);

  const gameOver = useCallback(() => {
    // Prevent multiple game over calls
    if (gameState === 'Game Over') {
      return;
    }

    setGameState('Game Over');
    setLastError(null);

    // Immediate save for game over
    debouncedSave();
  }, [debouncedSave, gameState]);

  // Resume functionality
  const resumeGame = useCallback(async () => {
    try {
      setIsLoading(true);
      setLastError(null);

      const result = await loadGameState();
      if (result.success && result.data) {
        restoreGameStateHelper({
          result,
          setLevel,
          setGameState,
          setTurnsUsed,
          setCurrency,
          setRevealedTiles,
          setTileTypes,
          setLastSaveTime,
        });
      }
    } catch (error) {
      setLastError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [loadGameState]);

  const clearSave = useCallback(async () => {
    try {
      await clearGameState();
      setLastSaveTime(null);
      setLastError(null);
    } catch (error) {
      setLastError(error instanceof Error ? error.message : 'Unknown error');
    }
  }, [clearGameState]);

  // Check for existing save on mount
  useEffect(() => {
    const checkExistingSave = async () => {
      try {
        const hasSave = hasExistingSaveData();
        if (hasSave) {
          // Load save info without restoring state
          const result = await loadGameState();
          if (result.success && result.data) {
            setLastSaveTime(result.data.timestamp);
          }
        }
      } catch (error) {
        console.warn('Failed to check existing save:', error);
      }
    };

    checkExistingSave();
  }, [hasExistingSaveData, loadGameState]);

  // Monitor available turns and trigger game over when out of turns
  useEffect(() => {
    if (gameState === 'Active') {
      const availableTurns = Math.floor(currency / 100);
      if (availableTurns <= 0) {
        // No turns available, trigger game over
        gameOver();
      }
    }
  }, [currency, gameState, gameOver]);

  // Context value
  const contextValue = useMemo<GameStateContextValue>(
    () => ({
      // State
      level,
      gameState,
      revealedTiles,
      tileTypes,
      turnsUsed,
      currency,

      // Actions
      setLevel,
      setGameState,
      revealTile,
      setTurnsUsed,
      setCurrency,
      incrementTurn,

      // Game flow
      startNewGame,
      completeLevel,
      gameOver,

      // Persistence
      isLoading,
      lastError,
      lastSaveTime,

      // Resume functionality
      hasExistingSave: hasExistingSaveData(),
      resumeGame,
      clearSave,
    }),
    [
      level,
      gameState,
      revealedTiles,
      tileTypes,
      turnsUsed,
      currency,
      setLevel,
      setGameState,
      revealTile,
      setTurnsUsed,
      setCurrency,
      incrementTurn,
      startNewGame,
      completeLevel,
      gameOver,
      isLoading,
      lastError,
      lastSaveTime,
      hasExistingSaveData,
      resumeGame,
      clearSave,
    ]
  );

  return (
    <GameStateContext.Provider value={contextValue}>
      {children}
    </GameStateContext.Provider>
  );
};

GameStateProvider.displayName = 'GameStateProvider';
