import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';

import { Select } from '@/components/ui/select';

import type { Character } from '../../types/character';
import { FITNESS_CLASSES, getStartingAttributes } from '../../types/character';
import { ClassInfo } from './class-info';
import { getValidClass } from './utils';

type FitnessClassFieldsProps = {
  // For character sheet (editing mode)
  character?: Character;
  updateField?: (
    field: keyof Character,
    value: string | number | boolean
  ) => void;
  onChange?: (updated: Character | ((prev: Character) => Character)) => void;
  // For character creation (controlled mode)
  selectedClass?: string;
  setSelectedClass?: (className: string) => void;
  // Common props
  label?: string;
  placeholder?: string;
  showClassInfo?: boolean;
  classInfoVariant?: 'compact' | 'detailed';
  showAttributes?: boolean;
};

type ClassChangeParams = {
  newClass: string | number;
  isEditingMode: boolean;
  onChange?: (updated: Character | ((prev: Character) => Character)) => void;
  updateField?: (
    field: keyof Character,
    value: string | number | boolean
  ) => void;
  setSelectedClass?: (className: string) => void;
};

const handleClassChangeLogic = ({
  newClass,
  isEditingMode,
  onChange,
  updateField,
  setSelectedClass,
}: ClassChangeParams) => {
  const classString = String(newClass);

  if (isEditingMode && onChange) {
    // Use onChange for atomic updates in editing mode
    const newAttributes = getStartingAttributes(classString);
    onChange((prevCharacter) => ({
      ...prevCharacter,
      class: classString,
      classAttributes: newAttributes,
    }));
  } else if (isEditingMode && updateField) {
    // Fallback to updateField for backward compatibility
    updateField('class', classString);
    // Note: classAttributes is an object, so we can't use updateField for it
    // This fallback only updates the class string, not the attributes
  } else if (setSelectedClass) {
    // Creation mode
    setSelectedClass(classString);
  }
};

export const FitnessClassFields: React.FC<FitnessClassFieldsProps> = ({
  character,
  updateField,
  onChange,
  selectedClass,
  setSelectedClass,
  label = 'Class',
  placeholder = 'Select your training focus',
  showClassInfo = true,
  classInfoVariant = 'compact',
  showAttributes = false,
}) => {
  const prevClassRef = useRef(character?.class || selectedClass);

  // Determine if we're in editing mode (character sheet) or creation mode
  const isEditingMode = Boolean(character && (updateField || onChange));
  const currentClass = isEditingMode ? character!.class : selectedClass;

  useEffect(() => {
    if (prevClassRef.current !== currentClass) {
      prevClassRef.current = currentClass;
    }
  }, [currentClass]);

  const handleClassChangeInternal = (newClass: string | number) => {
    handleClassChangeLogic({
      newClass,
      isEditingMode,
      onChange,
      updateField,
      setSelectedClass,
    });
  };

  const options = Object.keys(FITNESS_CLASSES).map((key: string) => ({
    label: key,
    value: key,
  }));

  return (
    <View className="space-y-4">
      {/* Class Selection */}
      <View>
        <Select
          label={label}
          value={currentClass}
          onSelect={handleClassChangeInternal}
          options={options}
          placeholder={placeholder}
          testID="class-select"
        />
        {showClassInfo && currentClass && (
          <ClassInfo
            characterClass={getValidClass(currentClass)}
            variant={classInfoVariant}
            showAttributes={showAttributes}
          />
        )}
      </View>
    </View>
  );
};
