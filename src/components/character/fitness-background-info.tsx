import React from 'react';
import { Text, View } from 'react-native';

import { FITNESS_BACKGROUNDS } from '../../types/character';

export const FitnessBackgroundInfo: React.FC<{ fitnessBackground: string }> = ({
  fitnessBackground,
}) => {
  const bgData =
    FITNESS_BACKGROUNDS[fitnessBackground as keyof typeof FITNESS_BACKGROUNDS];
  if (!bgData) return null;

  return (
    <View className="mt-2 rounded-md bg-blue-50 p-3 dark:bg-blue-900">
      <Text className="text-sm font-medium text-blue-900 dark:text-blue-100">
        {bgData.description}
      </Text>
      <View className="mt-2">
        <Text className="text-xs font-medium text-green-700 dark:text-green-300">
          Strengths:
        </Text>
        {Object.entries(bgData.strengths).map(([key, value]) => (
          <Text
            key={key}
            className="text-xs text-green-600 dark:text-green-400"
          >
            • {value}
          </Text>
        ))}
      </View>
      <View className="mt-1">
        <Text className="text-xs font-medium text-red-700 dark:text-red-300">
          Weaknesses:
        </Text>
        {Object.entries(bgData.weaknesses).map(([key, value]) => (
          <Text key={key} className="text-xs text-red-600 dark:text-red-400">
            • {value}
          </Text>
        ))}
      </View>
    </View>
  );
};
