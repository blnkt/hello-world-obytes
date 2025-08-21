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
  setRevealedTiles: (
    tiles: Set<string> | ((prev: Set<string>) => Set<string>)
  ) => void;
  setTileTypes: (
    types:
      | Record<string, string>
      | ((prev: Record<string, string>) => Record<string, string>)
  ) => void;

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

  // State transition timing validation
  const [lastStateChange, setLastStateChange] = useState<number>(Date.now());
  const MIN_STATE_CHANGE_INTERVAL = 100; // 100ms minimum between state changes

  // Debounced save ref
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // State transition validation helper
  const validateStateTransition = useCallback(
    (fromState: GameState, toState: GameState): boolean => {
      const validTransitions: Record<GameState, GameState[]> = {
        Active: ['Win', 'Game Over'],
        Win: ['Active'], // Can transition back to Active when starting new level
        'Game Over': ['Active'], // Can transition back to Active when retrying
      };

      // Special case: startNewGame can transition from any state to Active
      if (toState === 'Active') {
        return true;
      }

      return validTransitions[fromState]?.includes(toState) ?? false;
    },
    []
  );

  // State consistency validation helper
  const validateGameStateConsistency = useCallback((): boolean => {
    // Validate that game state data is consistent
    if (gameState === 'Active') {
      // In active state, we should have valid game data
      if (level < 1) {
        console.error('Invalid level in Active state:', level);
        return false;
      }
      if (currency < 0) {
        console.error('Invalid currency in Active state:', currency);
        return false;
      }
      if (turnsUsed < 0) {
        console.error('Invalid turns used in Active state:', turnsUsed);
        return false;
      }
    }

    // Validate that revealed tiles and tile types are consistent
    for (const tileKey of revealedTiles) {
      if (!tileTypes[tileKey]) {
        console.error('Revealed tile without type:', tileKey);
        return false;
      }
    }

    // Validate that tile types only exist for revealed tiles
    for (const tileKey of Object.keys(tileTypes)) {
      if (!revealedTiles.has(tileKey)) {
        console.error('Tile type for unrevealed tile:', tileKey);
        return false;
      }
    }

    return true;
  }, [gameState, level, currency, turnsUsed, revealedTiles, tileTypes]);

  // Business logic validation helper
  const validateGameAction = useCallback(
    (action: string, context: any): boolean => {
      // Validate that actions make sense in current game state
      if (gameState === 'Win' || gameState === 'Game Over') {
        // Most actions are not allowed in terminal states
        if (action === 'revealTile') {
          console.warn(`Cannot ${action} in ${gameState} state`);
          return false;
        }
      }

      if (gameState === 'Active') {
        // Validate turn-based actions
        if (action === 'revealTile') {
          const availableTurns = Math.floor(currency / 100);
          if (availableTurns <= 0) {
            console.warn('Cannot reveal tile: no turns available');
            return false;
          }
        }
      }

      return true;
    },
    [gameState, currency]
  );

  // Transition timing validation helper
  const validateTransitionTiming = useCallback((): boolean => {
    const now = Date.now();
    const timeSinceLastChange = now - lastStateChange;

    if (timeSinceLastChange < MIN_STATE_CHANGE_INTERVAL) {
      console.warn(
        `State change too rapid: ${timeSinceLastChange}ms since last change`
      );
      return false;
    }

    return true;
  }, [lastStateChange]);

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
      // Business logic validation
      if (!validateGameAction('revealTile', { x, y, type })) {
        return false;
      }

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
    [incrementTurn, currency, setCurrency, validateGameAction]
  );

  const startNewGame = useCallback(() => {
    // Validate state transition (can start new game from any state)
    if (!validateStateTransition(gameState, 'Active')) {
      console.warn(`Cannot transition from ${gameState} to Active state`);
      return;
    }

    if (!validateTransitionTiming()) {
      console.warn('State transition timing validation failed');
      return;
    }

    // Update timing and perform state transition
    setLastStateChange(Date.now());

    // Reset all game state to initial values
    setLevel(1);
    setGameState('Active');
    setRevealedTiles(new Set());
    setTileTypes({});
    setTurnsUsed(0);
    setCurrency(1000); // Reset to initial currency
    setLastError(null);

    // Immediate save for new game
    debouncedSave();
  }, [
    debouncedSave,
    gameState,
    validateStateTransition,
    validateTransitionTiming,
  ]);

  const completeLevel = useCallback(() => {
    // Comprehensive validation before state transition
    if (!validateStateTransition(gameState, 'Win')) {
      console.warn(`Cannot transition from ${gameState} to Win state`);
      return;
    }

    if (!validateGameStateConsistency()) {
      console.error('Game state consistency validation failed');
      return;
    }

    if (!validateTransitionTiming()) {
      console.warn('State transition timing validation failed');
      return;
    }

    // Update timing and perform state transition
    setLastStateChange(Date.now());
    setGameState('Win');
    setLastError(null);

    // Immediate save for level completion
    debouncedSave();
  }, [
    debouncedSave,
    gameState,
    validateStateTransition,
    validateGameStateConsistency,
    validateTransitionTiming,
  ]);

  const gameOver = useCallback(() => {
    // Comprehensive validation before state transition
    if (!validateStateTransition(gameState, 'Game Over')) {
      console.warn(`Cannot transition from ${gameState} to Game Over state`);
      return;
    }

    if (!validateGameStateConsistency()) {
      console.error('Game state consistency validation failed');
      return;
    }

    if (!validateTransitionTiming()) {
      console.warn('State transition timing validation failed');
      return;
    }

    // Update timing and perform state transition
    setLastStateChange(Date.now());
    setGameState('Game Over');
    setLastError(null);

    // Immediate save for game over
    debouncedSave();
  }, [
    debouncedSave,
    gameState,
    validateStateTransition,
    validateGameStateConsistency,
    validateTransitionTiming,
  ]);

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
        // Use setGameState directly to avoid circular dependency
        setGameState('Game Over');
        setLastError(null);
        // Immediate save for game over
        debouncedSave();
      }
    }
  }, [currency, gameState, debouncedSave]);

  // Periodic state consistency validation
  useEffect(() => {
    const interval = setInterval(() => {
      if (!validateGameStateConsistency()) {
        console.error('Periodic state consistency check failed');
        // Don't auto-fix, just log the error for debugging
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [validateGameStateConsistency]);

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
      setRevealedTiles,
      setTileTypes,

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
      setRevealedTiles,
      setTileTypes,
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
