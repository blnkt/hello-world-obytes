import React from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui';

interface StatusBarProps {
  level: number;
  turns: number;
  gameState: 'Active' | 'Win' | 'Game Over';
  revealedTiles: number;
  totalTiles: number;
}

export default function StatusBar({
  level,
  turns,
  gameState,
  revealedTiles,
  totalTiles,
}: StatusBarProps) {
  const getGameStateColor = () => {
    switch (gameState) {
      case 'Win':
        return 'text-green-600 dark:text-green-400';
      case 'Game Over':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  const getGameStateIcon = () => {
    switch (gameState) {
      case 'Win':
        return '🎉';
      case 'Game Over':
        return '💀';
      default:
        return '⚔️';
    }
  };

  return (
    <View className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
      {/* Level and Game State Row */}
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center space-x-2">
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            Level {level}
          </Text>
          <View className="rounded-full bg-blue-100 px-2 py-1 dark:bg-blue-900/20">
            <Text className="text-xs font-medium text-blue-800 dark:text-blue-200">
              {gameState}
            </Text>
          </View>
        </View>
        <Text className="text-2xl">{getGameStateIcon()}</Text>
      </View>

      {/* Game Progress Row */}
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center space-x-2">
          <Text className="text-sm text-gray-600 dark:text-gray-300">
            Turns Used:
          </Text>
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {turns}
          </Text>
        </View>
        <View className="flex-row items-center space-x-2">
          <Text className="text-sm text-gray-600 dark:text-gray-300">
            Progress:
          </Text>
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {revealedTiles}/{totalTiles}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <View
          testID="progress-bar"
          className="h-full bg-blue-500 transition-all duration-300 ease-in-out dark:bg-blue-400"
          style={{ width: `${(revealedTiles / totalTiles) * 100}%` }}
        />
      </View>
    </View>
  );
}
