import React from 'react';
import { View } from 'react-native';

import { Text } from './text';

interface GameProgressProps {
  level: number;
  turns: number;
  gameState: 'Active' | 'Win' | 'Game Over';
  revealedTiles: number;
  totalTiles: number;
  className?: string;
}

// eslint-disable-next-line max-lines-per-function
export function GameProgress({
  level,
  turns,
  gameState,
  revealedTiles,
  totalTiles,
  className = '',
}: GameProgressProps) {
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

  const getGameStateColor = () => {
    switch (gameState) {
      case 'Win':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'Game Over':
        return 'bg-red-100 border-red-300 text-red-800';
      default:
        return 'bg-blue-100 border-blue-300 text-blue-800';
    }
  };

  const progressPercentage = (revealedTiles / totalTiles) * 100;

  return (
    <View
      className={`rounded-lg border-2 p-4 ${getGameStateColor()} dark:border-neutral-600 dark:bg-neutral-800 ${className}`}
      accessible={true}
      accessibilityLabel={`Game Status - Level ${level}, ${gameState} state`}
      accessibilityRole="summary"
    >
      {/* Header with Level and Game State */}
      <View className="mb-3 flex-row items-center justify-between">
        <View>
          <Text
            className="text-lg font-bold text-gray-800 dark:text-gray-200"
            accessibilityRole="header"
          >
            Level {level}
          </Text>
          <View
            className={`mt-1 rounded-full px-2 py-1 ${getGameStateColor()}`}
            accessible={true}
            accessibilityLabel={`Game state: ${gameState}`}
          >
            <Text className="text-sm font-medium">{gameState}</Text>
          </View>
        </View>
        <Text
          className="text-3xl"
          accessibilityLabel={`Game state icon: ${getGameStateIcon()}`}
        >
          {getGameStateIcon()}
        </Text>
      </View>

      {/* Game Progress */}
      <View
        className="mb-3 space-y-2"
        accessible={true}
        accessibilityLabel={`Game Progress - ${turns} turns used, ${revealedTiles} out of ${totalTiles} tiles revealed`}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            Turns Used:
          </Text>
          <Text
            className="text-lg font-semibold text-gray-800 dark:text-gray-200"
            accessibilityLabel={`${turns} turns used`}
          >
            {turns}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            Progress:
          </Text>
          <Text
            className="text-lg font-semibold text-gray-800 dark:text-gray-200"
            accessibilityLabel={`${revealedTiles} out of ${totalTiles} tiles revealed`}
          >
            {revealedTiles}/{totalTiles}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View
        className="h-3 rounded-full bg-gray-200 dark:bg-gray-700"
        accessible={true}
        accessibilityLabel={`Progress bar showing ${Math.round(progressPercentage)}% completion`}
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: totalTiles,
          now: revealedTiles,
        }}
      >
        <View
          className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
          style={{ width: `${progressPercentage}%` }}
          testID="progress-bar"
        />
      </View>
    </View>
  );
}
