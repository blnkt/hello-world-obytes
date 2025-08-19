import React, { useState } from 'react';
import { View } from 'react-native';

import { Button, Text } from '@/components/ui';

export default function DungeonGame() {
  // Game state management
  const [level, setLevel] = useState(1);
  const [turns, setTurns] = useState(0);
  const [gameState, setGameState] = useState<'Active' | 'Win' | 'Game Over'>(
    'Active'
  );
  const [revealedTiles, setRevealedTiles] = useState(0);
  const totalTiles = 30; // 6x5 grid

  return (
    <View className="flex-1 p-4">
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

      <Button label="Home" onPress={() => {}} size="sm" />
    </View>
  );
}
