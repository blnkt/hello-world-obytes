import React from 'react';

import { Text, View } from '@/components/ui';
import { Input } from '@/components/ui/input';

import { ClassDetails } from './class-details';
import { ClassSelect } from './class-select';

type CharacterFormProps = {
  name: string;
  setName: (name: string) => void;
  selectedClass: string;
  setSelectedClass: (className: string) => void;
};

const NameInput: React.FC<{
  name: string;
  setName: (name: string) => void;
}> = ({ name, setName }) => (
  <View className="space-y-2">
    <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200">
      Character Name
    </Text>
    <Input
      placeholder="Enter your character's name"
      value={name}
      onChangeText={setName}
      maxLength={20}
    />
  </View>
);

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
      <NameInput name={name} setName={setName} />
      <ClassSelect
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
      />
      <ClassDetails selectedClass={selectedClass} />
    </View>
  );
};
