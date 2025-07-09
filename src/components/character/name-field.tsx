import React from 'react';
import { Text, TextInput, View } from 'react-native';

import type { Character } from '../../types/character';

export const NameField: React.FC<{
  character: Character;
  updateField: (field: keyof Character, value: any) => void;
}> = ({ character, updateField }) => (
  <View>
    <Text className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
      Name
    </Text>
    <TextInput
      value={character.name}
      onChangeText={(text) => updateField('name', text)}
      className="rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      placeholder="Enter character name"
      placeholderTextColor="#9CA3AF"
    />
  </View>
);
