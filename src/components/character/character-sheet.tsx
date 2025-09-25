import React, { useCallback } from 'react';
import { ScrollView, View } from 'react-native';

import type { Character } from '../../types/character';
import { CharacterAvatar } from './character-avatar';
import { LevelExpFields } from './level-exp-fields';
import { NameField } from './name-field';

export type CharacterSheetProps = {
  character: Character;
  onChange: (updated: Character | ((prev: Character) => Character)) => void;
  // onRefreshExperience?: () => void;
};

export const CharacterSheet: React.FC<CharacterSheetProps> = ({
  character,
  onChange,
  // onRefreshExperience,
}) => {
  const updateField = useCallback(
    (field: keyof Character, value: string | number | boolean) => {
      onChange((prevCharacter) => ({
        ...prevCharacter,
        [field]: value,
      }));
    },
    [onChange]
  );

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="space-y-6 p-4">
        {/* Character Avatar */}
        <View className="items-center py-4">
          <CharacterAvatar character={character} size={140} isWalking={true} />
        </View>

        <NameField character={character} updateField={updateField} />
        <LevelExpFields character={character} />
      </View>
    </ScrollView>
  );
};
