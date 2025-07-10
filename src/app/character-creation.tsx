import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView } from 'react-native';

import {
  Button,
  FocusAwareStatusBar,
  SafeAreaView,
  Text,
  View,
} from '@/components/ui';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { setCharacter as saveCharacterToStorage } from '@/lib/storage';
import type { Character } from '@/types/character';
import { FITNESS_CLASSES, getStartingAttributes } from '@/types/character';

const FITNESS_CLASS_OPTIONS = Object.keys(FITNESS_CLASSES).map((className) => ({
  label: className,
  value: className,
}));

type ClassDetailsProps = {
  selectedClass: string;
};

const ClassAttributes: React.FC<{
  attributes: { might: number; speed: number; fortitude: number };
}> = ({ attributes }) => (
  <View className="mb-4">
    <Text className="mb-2 font-semibold text-gray-800 dark:text-gray-200">
      Starting Attributes:
    </Text>
    <View className="space-y-1">
      <Text className="text-gray-600 dark:text-gray-400">
        💪 Might: {attributes.might}
      </Text>
      <Text className="text-gray-600 dark:text-gray-400">
        ⚡ Speed: {attributes.speed}
      </Text>
      <Text className="text-gray-600 dark:text-gray-400">
        🛡️ Fortitude: {attributes.fortitude}
      </Text>
    </View>
  </View>
);

const ClassStrengths: React.FC<{ strengths: Record<string, string> }> = ({
  strengths,
}) => (
  <View className="mb-4">
    <Text className="mb-2 font-semibold text-green-700 dark:text-green-300">
      Strengths:
    </Text>
    {Object.entries(strengths).map(([key, value]) => (
      <Text key={key} className="text-sm text-green-600 dark:text-green-400">
        • {value}
      </Text>
    ))}
  </View>
);

const ClassWeaknesses: React.FC<{ weaknesses: Record<string, string> }> = ({
  weaknesses,
}) => (
  <View className="mb-4">
    <Text className="mb-2 font-semibold text-red-700 dark:text-red-300">
      Weaknesses:
    </Text>
    {Object.entries(weaknesses).map(([key, value]) => (
      <Text key={key} className="text-sm text-red-600 dark:text-red-400">
        • {value}
      </Text>
    ))}
  </View>
);

const ClassSpecialAbility: React.FC<{ specialAbility: string }> = ({
  specialAbility,
}) => (
  <View>
    <Text className="mb-2 font-semibold text-purple-700 dark:text-purple-300">
      Special Ability:
    </Text>
    <Text className="text-sm text-purple-600 dark:text-purple-400">
      {specialAbility}
    </Text>
  </View>
);

const ClassDetails: React.FC<ClassDetailsProps> = ({ selectedClass }) => {
  const selectedClassData =
    FITNESS_CLASSES[selectedClass as keyof typeof FITNESS_CLASSES];
  if (!selectedClassData) return null;
  return (
    <View className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
      <Text className="mb-2 text-xl font-bold text-gray-800 dark:text-gray-200">
        {selectedClass}
      </Text>
      <Text className="mb-4 text-gray-600 dark:text-gray-400">
        {selectedClassData.description}
      </Text>
      <ClassAttributes attributes={selectedClassData.attributes} />
      <ClassStrengths strengths={selectedClassData.strengths} />
      <ClassWeaknesses weaknesses={selectedClassData.weaknesses} />
      <ClassSpecialAbility specialAbility={selectedClassData.specialAbility} />
    </View>
  );
};

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

const ClassSelect: React.FC<{
  selectedClass: string;
  setSelectedClass: (className: string) => void;
}> = ({ selectedClass, setSelectedClass }) => (
  <View className="space-y-2">
    <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200">
      Choose Your Class
    </Text>
    <Select
      options={FITNESS_CLASS_OPTIONS}
      value={selectedClass}
      onSelect={(value) => setSelectedClass(value as string)}
      placeholder="Select your fitness class"
    />
  </View>
);

const CharacterForm: React.FC<CharacterFormProps> = ({
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

export default function CharacterCreation() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState('General Fitness');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateCharacter = async () => {
    if (!name.trim()) return;

    setIsCreating(true);

    try {
      const newCharacter: Character = {
        name: name.trim(),
        class: selectedClass,
        level: 1,
        experience: 0,
        classAttributes: getStartingAttributes(selectedClass),
        skills: [],
        equipment: [],
        abilities: [],
        notes: '',
      };

      await saveCharacterToStorage(newCharacter);
      console.log(
        '🎭 Created new character:',
        newCharacter.name,
        '-',
        newCharacter.class
      );
      router.replace('/(app)');
    } catch (error) {
      console.error('Error creating character:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <FocusAwareStatusBar />
      <ScrollView className="flex-1 p-4">
        <CharacterForm
          name={name}
          setName={setName}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
        />
      </ScrollView>

      <SafeAreaView className="p-4">
        <Button
          label={isCreating ? 'Creating Character...' : 'Create Character'}
          onPress={handleCreateCharacter}
          disabled={!name.trim() || isCreating}
        />
      </SafeAreaView>
    </View>
  );
}
