import React, { createContext, useContext, useState } from 'react';

interface GameState {
  level: number;
  turns: number;
  gameState: 'Active' | 'Win' | 'Game Over';
  revealedTiles: number;
  totalTiles: number;
  currency: number;
  availableTurns: number;
  turnCost: number;
  isLoading: boolean;
}

interface GameStateContextType {
  gameState: GameState;
  updateGameState: (updates: Partial<GameState>) => void;
  resetGame: () => void;
  setLoading: (loading: boolean) => void;
  incrementTurns: () => void;
  updateRevealedTiles: (count: number) => void;
  updateCurrency: (amount: number) => void;
  setGameState: (state: GameState['gameState']) => void;
}

const GameStateContext = createContext<GameStateContextType | undefined>(
  undefined
);

interface GameStateProviderProps {
  children: React.ReactNode;
  initialLevel?: number;
  initialCurrency?: number;
  initialTurnCost?: number;
}

// eslint-disable-next-line max-lines-per-function
export function GameStateProvider({
  children,
  initialLevel = 1,
  initialCurrency = 1000,
  initialTurnCost = 100,
}: GameStateProviderProps) {
  const [gameState, setGameState] = useState<GameState>({
    level: initialLevel,
    turns: 0,
    gameState: 'Active',
    revealedTiles: 0,
    totalTiles: 30,
    currency: initialCurrency,
    availableTurns: Math.floor(initialCurrency / initialTurnCost),
    turnCost: initialTurnCost,
    isLoading: false,
  });

  const updateGameState = (updates: Partial<GameState>) => {
    setGameState((prev) => {
      const newState = { ...prev, ...updates };

      // Recalculate available turns when currency or turn cost changes
      if (updates.currency !== undefined || updates.turnCost !== undefined) {
        newState.availableTurns = Math.floor(
          newState.currency / newState.turnCost
        );
      }

      return newState;
    });
  };

  const resetGame = () => {
    setGameState((prev) => ({
      ...prev,
      turns: 0,
      gameState: 'Active',
      revealedTiles: 0,
      isLoading: false,
    }));
  };

  const setLoading = (loading: boolean) => {
    updateGameState({ isLoading: loading });
  };

  const incrementTurns = () => {
    updateGameState({ turns: gameState.turns + 1 });
  };

  const updateRevealedTiles = (count: number) => {
    updateGameState({ revealedTiles: count });
  };

  const updateCurrency = (amount: number) => {
    updateGameState({ currency: amount });
  };

  const setGameStateStatus = (state: GameState['gameState']) => {
    updateGameState({ gameState: state });
  };

  const value: GameStateContextType = {
    gameState,
    updateGameState,
    resetGame,
    setLoading,
    incrementTurns,
    updateRevealedTiles,
    updateCurrency,
    setGameState: setGameStateStatus,
  };

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameState() {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
}
