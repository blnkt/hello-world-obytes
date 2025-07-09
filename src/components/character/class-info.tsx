import React from 'react';
import { Text, View } from 'react-native';

import { FITNESS_CLASSES } from '../../types/character';

export const ClassInfo: React.FC<{ characterClass: string }> = ({
  characterClass,
}) => {
  const classData =
    FITNESS_CLASSES[characterClass as keyof typeof FITNESS_CLASSES];
  if (!classData) return null;

  return (
    <View className="mt-2 rounded-md bg-purple-50 p-3 dark:bg-purple-900">
      <Text className="text-sm font-medium text-purple-900 dark:text-purple-100">
        {classData.description}
      </Text>
      <View className="mt-2">
        <Text className="text-xs font-medium text-green-700 dark:text-green-300">
          Strengths:
        </Text>
        {Object.entries(classData.strengths).map(([key, value]) => (
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
        {Object.entries(classData.weaknesses).map(([key, value]) => (
          <Text key={key} className="text-xs text-red-600 dark:text-red-400">
            • {value}
          </Text>
        ))}
      </View>
      <View className="mt-2">
        <Text className="text-xs font-medium text-blue-700 dark:text-blue-300">
          Special Ability:
        </Text>
        <Text className="text-xs text-blue-600 dark:text-blue-400">
          {classData.specialAbility}
        </Text>
      </View>
    </View>
  );
};
