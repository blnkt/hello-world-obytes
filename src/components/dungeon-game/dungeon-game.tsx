import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Button, Text } from '@/components/ui';
import { useCurrencySystem } from '@/lib/health';

import GameGrid from './game-grid';

interface DungeonGameLayoutProps {
  level: number;
  turns: number;
  gameState: 'Active' | 'Win' | 'Game Over';
  revealedTiles: number;
  totalTiles: number;
  currency: number;
  availableTurns: number;
  turnCost: number;
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

function DungeonGameLayout({
  level,
  turns,
  gameState,
  revealedTiles,
  totalTiles,
  currency,
  availableTurns,
  turnCost,
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
      {/* Header Section */}
      <View className="p-4">
        <Text className="mb-4 text-2xl font-bold">Dungeon Game</Text>
        <Text className="mb-4 text-lg">Level {level}</Text>

        {/* Currency and Turn Information */}
        <View className="mb-4 space-y-2">
          <Text className="text-base">Currency: {currency}</Text>
          <Text className="text-base">Available Turns: {availableTurns}</Text>
          <Text className="text-base">Turn Cost: {turnCost} steps</Text>
        </View>

        {/* Insufficient Currency Warning */}
        {availableTurns < 1 && (
          <View className="mb-4 rounded-lg bg-red-100 p-3 dark:bg-red-900/20">
            <Text className="text-base font-semibold text-red-800 dark:text-red-200">
              Insufficient Currency
            </Text>
            <Text className="text-sm text-red-600 dark:text-red-300">
              Minimum 100 steps required to play
            </Text>
          </View>
        )}

        {/* Game State Display */}
        <View className="mb-4 space-y-2">
          <Text className="text-base">Turns: {turns}</Text>
          <Text className="text-base">Game State: {gameState}</Text>
          <Text className="text-base">
            Revealed: {revealedTiles}/{totalTiles}
          </Text>
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
        {/* Game State Test Buttons */}
        <View className="space-y-2">
          <Button label="Test Win" onPress={onWinGame} size="sm" />
          <Button label="Test Game Over" onPress={onGameOver} size="sm" />
          <Button label="Reset Game" onPress={onResetGame} size="sm" />
        </View>

        {/* Next Level Button - Only show when game state is Win */}
        {gameState === 'Win' && (
          <Button label="Next Level" onPress={onNextLevel} size="sm" />
        )}

        <Button label="Home" onPress={onHomePress} size="sm" />
      </View>
    </ScrollView>
  );
}

interface DungeonGameProps {
  navigation?: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
}

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
    setLevel((prevLevel) => prevLevel + 1);
    setGameState('Active');
    setTurns(0);
    setRevealedTiles(0);
  }, []);

  const handleSpendCurrency = React.useCallback(async (amount: number) => {
    return await spend(amount);
  }, [spend]);

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
