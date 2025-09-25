import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import colors from '@/components/ui/colors';

import type { Character } from '../../types/character';
import { calculateBalancedXP } from '../../types/character';

export const ExperienceField: React.FC<{
  character: Character;
  onRefreshExperience?: () => void;
}> = ({ character, onRefreshExperience }) => {
  const baseSteps = character.experience;
  const _balancedXP = calculateBalancedXP(baseSteps);

  return (
    <View className="space-y-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Experience (Steps)
        </Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          Flat XP Rate
        </Text>
      </View>
      <View className="flex-row items-center">
        <TextInput
          value={String(character.experience)}
          editable={false}
          className="flex-1 rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-center text-gray-500 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400"
          placeholder="Auto-updated from step count"
          placeholderTextColor={colors.charcoal[400]}
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
