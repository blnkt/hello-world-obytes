import React from 'react';
import { View } from 'react-native';

import { Select } from '@/components/ui/select';

import type { Character } from '../../types/character';
import { FITNESS_CLASSES, getStartingAttributes } from '../../types/character';
import { ClassInfo } from './class-info';
import { getValidClass } from './utils';

export const FitnessClassFields: React.FC<{
  character: Character;
  updateField: (field: keyof Character, value: any) => void;
}> = ({ character, updateField }) => {
  const handleClassChange = (newClass: string | number) => {
    const classString = String(newClass);
    updateField('class', classString);
    // Update class attributes when class changes
    const newAttributes = getStartingAttributes(classString);
    updateField('classAttributes', newAttributes);
  };

  return (
    <View className="space-y-4">
      {/* Class Selection */}
      <View>
        <Select
          label="Class"
          value={character.class}
          onSelect={handleClassChange}
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
