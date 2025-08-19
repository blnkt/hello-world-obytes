import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Button, Text } from '@/components/ui';

import GameGrid from './game-grid';

interface DungeonGameProps {
  navigation?: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
}

export default function DungeonGame({ navigation }: DungeonGameProps) {
  // Game state management
  const [level, setLevel] = useState(1);
  const [turns, setTurns] = useState(0);
  const [gameState, setGameState] = useState<'Active' | 'Win' | 'Game Over'>(
    'Active'
  );
  const [revealedTiles, setRevealedTiles] = useState(0);
  const totalTiles = 30; // 6x5 grid

  const handleHomePress = () => {
    if (navigation) {
      navigation.navigate('index');
    } else {
      router.replace('/');
    }
  };

  const handleWinGame = () => {
    setGameState('Win');
  };

  const handleGameOver = () => {
    setGameState('Game Over');
  };

  const handleResetGame = () => {
    setGameState('Active');
    setTurns(0);
    setRevealedTiles(0);
  };

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
        <GameGrid />
      </View>

      {/* Footer Section */}
      <View className="space-y-4 p-4">
        {/* Game State Test Buttons */}
        <View className="space-y-2">
          <Button label="Test Win" onPress={handleWinGame} size="sm" />
          <Button label="Test Game Over" onPress={handleGameOver} size="sm" />
          <Button label="Reset Game" onPress={handleResetGame} size="sm" />
        </View>

        <Button label="Home" onPress={handleHomePress} size="sm" />
      </View>
    </ScrollView>
  );
}
