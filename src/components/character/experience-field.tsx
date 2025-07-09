import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import type { Character } from '../../types/character';
import { calculateBalancedXP } from '../../types/character';
import { getValidClass } from './utils';

export const ExperienceField: React.FC<{
  character: Character;
  onRefreshExperience?: () => void;
}> = ({ character, onRefreshExperience }) => {
  const validClass = getValidClass(character.class);
  const baseSteps = character.experience;
  const balancedXP = calculateBalancedXP(baseSteps, validClass);
  const xpMultiplier =
    baseSteps > 0 ? (balancedXP / baseSteps).toFixed(2) : '1.00';

  return (
    <View className="space-y-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Experience (Steps)
        </Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          XP Multiplier: {xpMultiplier}x
        </Text>
      </View>
      <View className="flex-row items-center">
        <TextInput
          value={String(character.experience)}
          editable={false}
          className="flex-1 rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-center text-gray-500 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400"
          placeholder="Auto-updated from step count"
          placeholderTextColor="#9CA3AF"
        />
        {onRefreshExperience && (
          <TouchableOpacity
            onPress={onRefreshExperience}
            className="ml-2 rounded-md bg-blue-500 px-3 py-2"
          >
            <Text className="text-xs text-white">Refresh</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
