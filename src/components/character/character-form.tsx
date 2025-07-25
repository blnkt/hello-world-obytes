import React from 'react';

import { Text, View } from '@/components/ui';

import { FitnessClassFields } from './fitness-background-class-fields';
import { NameField } from './name-field';

type CharacterFormProps = {
  name: string;
  setName: (name: string) => void;
  selectedClass: string;
  setSelectedClass: (className: string) => void;
};

export const CharacterForm: React.FC<CharacterFormProps> = ({
  name,
  setName,
  selectedClass,
  setSelectedClass,
}) => {
  return (
    <View className="space-y-6">
      {/* Header */}
      <View className="items-center py-6">
        <Text className="text-center text-3xl font-bold text-purple-700 dark:text-purple-200">
          Create Your Character
        </Text>
        <Text className="mt-2 text-center text-gray-600 dark:text-gray-400">
          Choose your name and fitness class to begin your adventure
        </Text>
      </View>

      {/* Name Input - using enhanced NameField */}
      <NameField
        value={name}
        onChangeText={setName}
        placeholder="Enter your character's name"
        label="Character Name"
      />

      {/* Class Selection - using enhanced FitnessClassFields */}
      <FitnessClassFields
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        label="Choose Your Class"
        placeholder="Select your fitness class"
        showClassInfo={true}
        classInfoVariant="detailed"
        showAttributes={true}
      />
    </View>
  );
};
