import React from 'react';
import { View } from 'react-native';

import { Select } from '@/components/ui/select';

import type { Character } from '../../types/character';
import { FITNESS_BACKGROUNDS, FITNESS_CLASSES } from '../../types/character';
import { ClassInfo } from './class-info';
import { FitnessBackgroundInfo } from './fitness-background-info';
import { getValidClass, getValidFitnessBackground } from './utils';

export const FitnessBackgroundClassFields: React.FC<{
  character: Character;
  updateField: (field: keyof Character, value: any) => void;
}> = ({ character, updateField }) => {
  return (
    <View className="space-y-4">
      {/* Fitness Background Selection */}
      <View>
        <Select
          label="Fitness Background"
          value={character.fitnessBackground}
          onSelect={(value) => updateField('fitnessBackground', value)}
          options={Object.keys(FITNESS_BACKGROUNDS).map((key) => ({
            label: key,
            value: key,
          }))}
          placeholder="Select your fitness background"
        />
        <FitnessBackgroundInfo
          fitnessBackground={getValidFitnessBackground(
            character.fitnessBackground
          )}
        />
      </View>

      {/* Class Selection */}
      <View>
        <Select
          label="Class"
          value={character.class}
          onSelect={(value) => updateField('class', value)}
          options={Object.keys(FITNESS_CLASSES).map((key) => ({
            label: key,
            value: key,
          }))}
          placeholder="Select your training focus"
        />
        <ClassInfo characterClass={getValidClass(character.class)} />
      </View>
    </View>
  );
};
