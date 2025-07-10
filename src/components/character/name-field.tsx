import React from 'react';
import { Text, TextInput, View } from 'react-native';

import type { Character } from '../../types/character';

type NameFieldProps = {
  // For character sheet (editing mode)
  character?: Character;
  updateField?: (field: keyof Character, value: any) => void;
  // For character creation (controlled mode)
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  label?: string;
};

export const NameField: React.FC<NameFieldProps> = ({
  character,
  updateField,
  value,
  onChangeText,
  placeholder = 'Enter character name',
  label = 'Name',
}) => {
  // Determine if we're in editing mode (character sheet) or creation mode
  const isEditingMode = character && updateField;
  const displayValue = isEditingMode ? character.name : value;
  const handleChangeText = isEditingMode
    ? (text: string) => updateField('name', text)
    : onChangeText;

  return (
    <View>
      <Text className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </Text>
      <TextInput
        value={displayValue}
        onChangeText={handleChangeText}
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );
};
