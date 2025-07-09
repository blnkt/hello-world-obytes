import React from 'react';
import { Text } from 'react-native';

import type { Character } from '../../types/character';
import { ExperienceField } from './experience-field';
import { LevelDisplay } from './level-display';

export const LevelExpFields: React.FC<{
  character: Character;
  onRefreshExperience?: () => void;
}> = ({ character, onRefreshExperience }) => (
  <>
    <LevelDisplay character={character} />
    <ExperienceField
      character={character}
      onRefreshExperience={onRefreshExperience}
    />
    <Text className="text-center text-xs text-gray-500 dark:text-gray-400">
      Experience automatically updates from your daily step count
    </Text>
  </>
);
