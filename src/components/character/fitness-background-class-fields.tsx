import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';

import { Select } from '@/components/ui/select';

import type { Character } from '../../types/character';
import { FITNESS_CLASSES, getStartingAttributes } from '../../types/character';
import { ClassInfo } from './class-info';
import { getValidClass } from './utils';

export const FitnessClassFields: React.FC<{
  character: Character;
  updateField: (field: keyof Character, value: any) => void;
  onChange?: (updated: Character | ((prev: Character) => Character)) => void;
}> = ({ character, updateField, onChange }) => {
  const prevClassRef = useRef(character.class);

  useEffect(() => {
    if (prevClassRef.current !== character.class) {
      prevClassRef.current = character.class;
    }
  }, [character.class]);

  const handleClassChange = (newClass: string | number) => {
    const classString = String(newClass);

    if (onChange) {
      // Use onChange for atomic updates
      const newAttributes = getStartingAttributes(classString);
      onChange((prevCharacter) => ({
        ...prevCharacter,
        class: classString,
        classAttributes: newAttributes,
      }));
    } else {
      // Fallback to updateField for backward compatibility
      updateField('class', classString);
      const newAttributes = getStartingAttributes(classString);
      updateField('classAttributes', newAttributes);
    }
  };

  const options = Object.keys(FITNESS_CLASSES).map((key) => ({
    label: key,
    value: key,
  }));

  return (
    <View className="space-y-4">
      {/* Class Selection */}
      <View>
        <Select
          label="Class"
          value={character.class}
          onSelect={handleClassChange}
          options={options}
          placeholder="Select your training focus"
          testID="class-select"
        />
        <ClassInfo characterClass={getValidClass(character.class)} />
      </View>
    </View>
  );
};
