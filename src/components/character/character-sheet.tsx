import React from 'react';
import { ScrollView, View } from 'react-native';

import type { Character } from '../../types/character';
import { AttributesSection } from './attributes-section';
import { FitnessClassFields } from './fitness-background-class-fields';
import { LevelExpFields } from './level-exp-fields';
import { NameField } from './name-field';

export type CharacterSheetProps = {
  character: Character;
  onChange: (updated: Character) => void;
  // onRefreshExperience?: () => void;
};

export const CharacterSheet: React.FC<CharacterSheetProps> = ({
  character,
  onChange,
  // onRefreshExperience,
}) => {
  const updateField = (field: keyof Character, value: any) => {
    onChange({ ...character, [field]: value });
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="space-y-6 p-4">
        <NameField character={character} updateField={updateField} />
        <FitnessClassFields character={character} updateField={updateField} />
        <LevelExpFields character={character} />
        <AttributesSection character={character} />
      </View>
    </ScrollView>
  );
};
