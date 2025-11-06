import { Link } from 'expo-router';
import React, { useCallback } from 'react';
import { Dimensions, View } from 'react-native';

import { Button } from '@/components/ui';

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

  const { height: screenHeight } = Dimensions.get('window');
  const maxAvatarHeight = screenHeight * 0.5; // 50% of screen height

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Character Avatar - Fills remaining space */}
      <View
        className="flex-1 items-center justify-center px-4"
        style={{ maxHeight: maxAvatarHeight }}
      >
        <CharacterAvatar character={character} />
        {/* Navigation to avatar customization */}
        <Link href="/(app)/avatar-customization" asChild>
          <Button label="Customize Avatar" variant="outline" className="mt-4" />
        </Link>
      </View>

      {/* Character Details - Takes natural space */}
      <View className="p-4">
        <NameField character={character} updateField={updateField} />
        <LevelExpFields character={character} />
      </View>
    </View>
  );
};
