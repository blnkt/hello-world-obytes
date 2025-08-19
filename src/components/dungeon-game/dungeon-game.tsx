import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Button, LoadingOverlay, Text } from '@/components/ui';
import { useCurrencySystem } from '@/lib/health';

import CurrencyDisplay from './currency-display';
import GameGrid from './game-grid';
import { GameOverModal, WinModal } from './game-modals';
import StatusBar from './status-bar';

interface DungeonGameLayoutProps {
  level: number;
  turns: number;
  gameState: 'Active' | 'Win' | 'Game Over';
  revealedTiles: number;
  totalTiles: number;
  currency: number;
  availableTurns: number;
  turnCost: number;
  isLoading: boolean;
  onTurnsUpdate: (turns: number) => void;
  onRevealedTilesUpdate: (count: number) => void;
  onWinGame: () => void;
  onGameOver: () => void;
  onResetGame: () => void;
  onHomePress: () => void;
  onExitFound: () => void;
  onGameOverFromTurns: () => void;
  onNextLevel: () => void;
  onSpendCurrency: (amount: number) => Promise<boolean>;
}

// eslint-disable-next-line max-lines-per-function
function DungeonGameLayout({
  level,
  turns,
  gameState,
  revealedTiles,
  totalTiles,
  currency,
  availableTurns,
  turnCost,
  isLoading,
  onTurnsUpdate,
  onRevealedTilesUpdate,
  onWinGame,
  onGameOver,
  onResetGame,
  onHomePress,
  onExitFound,
  onGameOverFromTurns,
  onNextLevel,
  onSpendCurrency,
}: DungeonGameLayoutProps) {
  return (
    <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
      <LoadingOverlay visible={isLoading} />

      {/* Header Section */}
      <View className="p-4">
        <Text className="mb-4 text-2xl font-bold">Dungeon Game</Text>

        {/* Status Bar */}
        <View className="mb-4">
          <StatusBar
            level={level}
            turns={turns}
            gameState={gameState}
            revealedTiles={revealedTiles}
            totalTiles={totalTiles}
          />
        </View>

        {/* Currency Display */}
        <View className="mb-4">
          <CurrencyDisplay
            currency={currency}
            availableTurns={availableTurns}
            turnCost={turnCost}
          />
        </View>
      </View>

      {/* Game Grid - Full Width */}
      <View className="mb-4">
        {availableTurns < 1 ? (
          <View className="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
            <Text className="text-center text-base text-gray-600 dark:text-gray-300">
              Cannot play with insufficient currency
            </Text>
          </View>
        ) : (
          <GameGrid
            level={level}
            disabled={false}
            onTurnsUpdate={onTurnsUpdate}
            onRevealedTilesUpdate={onRevealedTilesUpdate}
            onExitFound={onExitFound}
            onGameOver={onGameOverFromTurns}
            onSpendCurrency={onSpendCurrency}
          />
        )}
      </View>

      {/* Footer Section */}
      <View className="space-y-4 p-4">
        {/* Game Control Buttons */}
        <View className="space-y-2">
          <Button label="Reset Game" onPress={onResetGame} size="sm" />
          <Button label="Home" onPress={onHomePress} size="sm" />
        </View>

        {/* Development Test Buttons - Remove in production */}
        {__DEV__ && (
          <View className="mt-4 space-y-2 rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
            <Text className="text-center text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Development Mode
            </Text>
            <View className="flex-row space-x-2">
              <Button
                label="Test Win"
                onPress={onWinGame}
                size="sm"
                variant="outline"
              />
              <Button
                label="Test Game Over"
                onPress={onGameOver}
                size="sm"
                variant="outline"
              />
            </View>
          </View>
        )}
      </View>

      {/* Game Modals */}
      <WinModal
        visible={gameState === 'Win'}
        level={level}
        onNextLevel={onNextLevel}
        onMainMenu={onHomePress}
      />

      <GameOverModal
        visible={gameState === 'Game Over'}
        level={level}
        turnsUsed={turns}
        onMainMenu={onHomePress}
        onRetry={onResetGame}
      />
    </ScrollView>
  );
}

interface DungeonGameProps {
  navigation?: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
}

// eslint-disable-next-line max-lines-per-function
export default function DungeonGame({ navigation }: DungeonGameProps) {
  // Currency system integration
  const { currency, spend } = useCurrencySystem();

  // Calculate available turns based on currency
  const availableTurns = Math.floor(currency / 100);
  const turnCost = 100;

  // Game state management
  const [level, setLevel] = useState(1);
  const [turns, setTurns] = useState(0);
  const [gameState, setGameState] = useState<'Active' | 'Win' | 'Game Over'>(
    'Active'
  );
  const [revealedTiles, setRevealedTiles] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const totalTiles = 30; // 6x5 grid

  // Callbacks to update parent state from GameGrid
  const handleTurnsUpdate = React.useCallback((newTurns: number) => {
    setTurns(newTurns);
  }, []);

  const handleRevealedTilesUpdate = React.useCallback(
    (newRevealedTiles: number) => {
      setRevealedTiles(newRevealedTiles);
    },
    []
  );

  const handleHomePress = React.useCallback(() => {
    if (navigation) {
      navigation.navigate('index');
    } else {
      router.replace('/');
    }
  }, [navigation]);

  const handleWinGame = React.useCallback(() => {
    setGameState('Win');
  }, []);

  const handleGameOver = React.useCallback(() => {
    setGameState('Game Over');
  }, []);

  const handleResetGame = React.useCallback(() => {
    setGameState('Active');
    setTurns(0);
    setRevealedTiles(0);
  }, []);

  const handleExitFound = React.useCallback(() => {
    setGameState('Win');
  }, []);

  const handleGameOverFromTurns = React.useCallback(() => {
    setGameState('Game Over');
  }, []);

  const handleNextLevel = React.useCallback(() => {
    setIsLoading(true);
    // Immediate state change for testing, can add delay later for production
    setLevel((prevLevel) => prevLevel + 1);
    setGameState('Active');
    setTurns(0);
    setRevealedTiles(0);
    setIsLoading(false);
  }, []);

  const handleSpendCurrency = React.useCallback(
    async (amount: number) => {
      setIsLoading(true);
      try {
        const result = await spend(amount);
        return result;
      } finally {
        setIsLoading(false);
      }
    },
    [spend]
  );

  return (
    <DungeonGameLayout
      level={level}
      turns={turns}
      gameState={gameState}
      revealedTiles={revealedTiles}
      totalTiles={totalTiles}
      currency={currency}
      availableTurns={availableTurns}
      turnCost={turnCost}
      isLoading={isLoading}
      onTurnsUpdate={handleTurnsUpdate}
      onRevealedTilesUpdate={handleRevealedTilesUpdate}
      onWinGame={handleWinGame}
      onGameOver={handleGameOver}
      onResetGame={handleResetGame}
      onHomePress={handleHomePress}
      onExitFound={handleExitFound}
      onGameOverFromTurns={handleGameOverFromTurns}
      onNextLevel={handleNextLevel}
      onSpendCurrency={handleSpendCurrency}
    />
  );
}
