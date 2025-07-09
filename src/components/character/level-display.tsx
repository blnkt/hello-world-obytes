import React from 'react';
import { Text, View } from 'react-native';

import type { Character } from '../../types/character';
import {
  FITNESS_LEVELS,
  getCharacterLevel,
  getLevelProgress,
} from '../../types/character';

export const LevelDisplay: React.FC<{ character: Character }> = ({
  character,
}) => {
  const calculatedLevel = getCharacterLevel(character.experience);
  const levelProgress = getLevelProgress(character.experience);
  const currentLevelData =
    FITNESS_LEVELS[calculatedLevel as keyof typeof FITNESS_LEVELS];
  const nextLevelData =
    levelProgress.next <= 8
      ? FITNESS_LEVELS[levelProgress.next as keyof typeof FITNESS_LEVELS]
      : null;

  return (
    <View className="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-4 dark:from-blue-900 dark:to-purple-900">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-lg font-bold text-gray-900 dark:text-white">
          Level {calculatedLevel}
        </Text>
        <Text className={`text-sm font-medium ${currentLevelData.color}`}>
          {currentLevelData.name}
        </Text>
      </View>

      {/* Progress Bar */}
      <View className="mb-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
        <View
          className="h-2 rounded-full bg-gradient-to-r from-green-400 to-blue-500"
          style={{ width: `${levelProgress.percentage}%` }}
        />
      </View>

      {/* Progress Text */}
      <Text className="text-xs text-gray-600 dark:text-gray-400">
        {levelProgress.percentage.toFixed(1)}% to Level {levelProgress.next}
        {nextLevelData && ` (${nextLevelData.name})`}
      </Text>
    </View>
  );
};
