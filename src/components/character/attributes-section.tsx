import React from 'react';
import { Text, TextInput, View } from 'react-native';

import type { Character } from '../../types/character';

type AttributesSectionProps = {
  character: Character;
  updateAttribute: (attr: keyof Character['attributes'], value: number) => void;
};

export const AttributesSection: React.FC<AttributesSectionProps> = ({
  character,
  updateAttribute,
}) => (
  <View className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
    <Text className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
      Attributes
    </Text>
    <View className="space-y-3">
      {Object.entries(character.attributes).map(([attr, value]) => (
        <View key={attr} className="flex-row items-center">
          <Text className="w-24 text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
            {attr}
          </Text>
          <TextInput
            value={String(value)}
            keyboardType="numeric"
            onChangeText={(text) =>
              updateAttribute(
                attr as keyof Character['attributes'],
                Number(text) || 0
              )
            }
            className="ml-3 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-center text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </View>
      ))}
    </View>
  </View>
);
