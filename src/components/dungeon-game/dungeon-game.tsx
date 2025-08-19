import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Button, Text } from '@/components/ui';

import GameGrid from './game-grid';

interface DungeonGameLayoutProps {
  level: number;
  turns: number;
  gameState: 'Active' | 'Win' | 'Game Over';
  revealedTiles: number;
  totalTiles: number;
  onTurnsUpdate: (turns: number) => void;
  onRevealedTilesUpdate: (count: number) => void;
  onWinGame: () => void;
  onGameOver: () => void;
  onResetGame: () => void;
  onHomePress: () => void;
  onExitFound: () => void;
  onGameOverFromTurns: () => void;
}

function DungeonGameLayout({
  level,
  turns,
  gameState,
  revealedTiles,
  totalTiles,
  onTurnsUpdate,
  onRevealedTilesUpdate,
  onWinGame,
  onGameOver,
  onResetGame,
  onHomePress,
  onExitFound,
  onGameOverFromTurns,
}: DungeonGameLayoutProps) {
  return (
    <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
      {/* Header Section */}
      <View className="p-4">
        <Text className="mb-4 text-2xl font-bold">Dungeon Game</Text>
        <Text className="mb-4 text-lg">Level {level}</Text>

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
        <GameGrid
          onTurnsUpdate={onTurnsUpdate}
          onRevealedTilesUpdate={onRevealedTilesUpdate}
          onExitFound={onExitFound}
          onGameOver={onGameOverFromTurns}
        />
      </View>

      {/* Footer Section */}
      <View className="space-y-4 p-4">
        {/* Game State Test Buttons */}
        <View className="space-y-2">
          <Button label="Test Win" onPress={onWinGame} size="sm" />
          <Button label="Test Game Over" onPress={onGameOver} size="sm" />
          <Button label="Reset Game" onPress={onResetGame} size="sm" />
        </View>

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
  // Game state management
  const [level, _setLevel] = useState(1);
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

  return (
    <DungeonGameLayout
      level={level}
      turns={turns}
      gameState={gameState}
      revealedTiles={revealedTiles}
      totalTiles={totalTiles}
      onTurnsUpdate={handleTurnsUpdate}
      onRevealedTilesUpdate={handleRevealedTilesUpdate}
      onWinGame={handleWinGame}
      onGameOver={handleGameOver}
      onResetGame={handleResetGame}
      onHomePress={handleHomePress}
      onExitFound={handleExitFound}
      onGameOverFromTurns={handleGameOverFromTurns}
    />
  );
}
