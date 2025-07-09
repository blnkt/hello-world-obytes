import React from 'react';
import { Text, View } from 'react-native';

import type { Character } from '../../types/character';

type AttributesSectionProps = {
  character: Character;
};

const AttributeBar: React.FC<{
  label: string;
  value: number;
  maxValue?: number;
}> = ({ label, value, maxValue = 20 }) => {
  const percentage = (value / maxValue) * 100;

  return (
    <View className="mb-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
          {label}
        </Text>
        <Text className="text-sm font-bold text-gray-900 dark:text-white">
          {value}
        </Text>
      </View>
      <View className="h-3 rounded-full bg-gray-200 dark:bg-gray-700">
        <View
          className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
          style={{ width: `${percentage}%` }}
        />
      </View>
    </View>
  );
};

export const AttributesSection: React.FC<AttributesSectionProps> = ({
  character,
}) => (
  <View className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
    <Text className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
      Class Attributes
    </Text>
    <Text className="mb-4 text-sm text-gray-600 dark:text-gray-400">
      Your character's attributes are determined by your chosen class
    </Text>

    <View className="space-y-2">
      <AttributeBar label="Might" value={character.classAttributes.might} />
      <AttributeBar label="Speed" value={character.classAttributes.speed} />
      <AttributeBar
        label="Fortitude"
        value={character.classAttributes.fortitude}
      />
    </View>

    <View className="mt-4 rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
      <Text className="text-xs text-blue-700 dark:text-blue-300">
        💡 These attributes reflect your class's strengths and weaknesses in
        fitness activities
      </Text>
    </View>
  </View>
);
