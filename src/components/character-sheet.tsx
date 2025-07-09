import React from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import type { Character } from '../types/character';
import {
  calculateBalancedXP,
  FITNESS_BACKGROUNDS,
  FITNESS_CLASSES,
  FITNESS_LEVELS,
  getCharacterLevel,
  getLevelProgress,
} from '../types/character';

export type CharacterSheetProps = {
  character: Character;
  onChange: (updated: Character) => void;
  onRefreshExperience?: () => void;
};

type BasicInfoSectionProps = {
  character: Character;
  updateField: (field: keyof Character, value: any) => void;
  onRefreshExperience?: () => void;
};

const NameField: React.FC<{
  character: Character;
  updateField: (field: keyof Character, value: any) => void;
}> = ({ character, updateField }) => (
  <View>
    <Text className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
      Name
    </Text>
    <TextInput
      value={character.name}
      onChangeText={(text) => updateField('name', text)}
      className="rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      placeholder="Enter character name"
      placeholderTextColor="#9CA3AF"
    />
  </View>
);

const FitnessBackgroundInfo: React.FC<{ fitnessBackground: string }> = ({
  fitnessBackground,
}) => {
  const bgData =
    FITNESS_BACKGROUNDS[fitnessBackground as keyof typeof FITNESS_BACKGROUNDS];
  if (!bgData) return null;

  return (
    <View className="mt-2 rounded-md bg-blue-50 p-3 dark:bg-blue-900">
      <Text className="text-sm font-medium text-blue-900 dark:text-blue-100">
        {bgData.description}
      </Text>
      <View className="mt-2">
        <Text className="text-xs font-medium text-green-700 dark:text-green-300">
          Strengths:
        </Text>
        {Object.entries(bgData.strengths).map(([key, value]) => (
          <Text
            key={key}
            className="text-xs text-green-600 dark:text-green-400"
          >
            • {value}
          </Text>
        ))}
      </View>
      <View className="mt-1">
        <Text className="text-xs font-medium text-red-700 dark:text-red-300">
          Weaknesses:
        </Text>
        {Object.entries(bgData.weaknesses).map(([key, value]) => (
          <Text key={key} className="text-xs text-red-600 dark:text-red-400">
            • {value}
          </Text>
        ))}
      </View>
    </View>
  );
};

const ClassInfo: React.FC<{ characterClass: string }> = ({
  characterClass,
}) => {
  const classData =
    FITNESS_CLASSES[characterClass as keyof typeof FITNESS_CLASSES];
  if (!classData) return null;

  return (
    <View className="mt-2 rounded-md bg-purple-50 p-3 dark:bg-purple-900">
      <Text className="text-sm font-medium text-purple-900 dark:text-purple-100">
        {classData.description}
      </Text>
      <View className="mt-2">
        <Text className="text-xs font-medium text-green-700 dark:text-green-300">
          Strengths:
        </Text>
        {Object.entries(classData.strengths).map(([key, value]) => (
          <Text
            key={key}
            className="text-xs text-green-600 dark:text-green-400"
          >
            • {value}
          </Text>
        ))}
      </View>
      <View className="mt-1">
        <Text className="text-xs font-medium text-red-700 dark:text-red-300">
          Weaknesses:
        </Text>
        {Object.entries(classData.weaknesses).map(([key, value]) => (
          <Text key={key} className="text-xs text-red-600 dark:text-red-400">
            • {value}
          </Text>
        ))}
      </View>
      <View className="mt-2">
        <Text className="text-xs font-medium text-blue-700 dark:text-blue-300">
          Special Ability:
        </Text>
        <Text className="text-xs text-blue-600 dark:text-blue-400">
          {classData.specialAbility}
        </Text>
      </View>
    </View>
  );
};

const FitnessBackgroundClassFields: React.FC<{
  character: Character;
  updateField: (field: keyof Character, value: any) => void;
}> = ({ character, updateField }) => (
  <View className="space-y-4">
    {/* Fitness Background Selection */}
    <View>
      <Text className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
        Fitness Background
      </Text>
      <View className="rounded-md border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700">
        <TextInput
          value={character.fitnessBackground}
          onChangeText={(text) => updateField('fitnessBackground', text)}
          className="px-3 py-2 text-gray-900 dark:text-white"
          placeholder="Select your fitness background"
          placeholderTextColor="#9CA3AF"
        />
      </View>
      <FitnessBackgroundInfo fitnessBackground={character.fitnessBackground} />
    </View>

    {/* Class Selection */}
    <View>
      <Text className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
        Class
      </Text>
      <View className="rounded-md border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700">
        <TextInput
          value={character.class}
          onChangeText={(text) => updateField('class', text)}
          className="px-3 py-2 text-gray-900 dark:text-white"
          placeholder="Select your training focus"
          placeholderTextColor="#9CA3AF"
        />
      </View>
      <ClassInfo characterClass={character.class} />
    </View>
  </View>
);

const LevelDisplay: React.FC<{ character: Character }> = ({ character }) => {
  const calculatedLevel = getCharacterLevel(character.experience);
  const levelProgress = getLevelProgress(character.experience);
  const currentLevelData =
    FITNESS_LEVELS[calculatedLevel as keyof typeof FITNESS_LEVELS];
  const nextLevelData =
    levelProgress.next <= 8
      ? FITNESS_LEVELS[levelProgress.next as keyof typeof FITNESS_LEVELS]
      : null;

  return (
    <View className="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-4 dark:from-blue-900 dark:to-purple-900">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-lg font-bold text-gray-900 dark:text-white">
          Level {calculatedLevel}
        </Text>
        <Text className={`text-sm font-medium ${currentLevelData.color}`}>
          {currentLevelData.name}
        </Text>
      </View>

      {/* Progress Bar */}
      <View className="mb-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
        <View
          className="h-2 rounded-full bg-gradient-to-r from-green-400 to-blue-500"
          style={{ width: `${levelProgress.percentage}%` }}
        />
      </View>

      {/* Progress Text */}
      <Text className="text-xs text-gray-600 dark:text-gray-400">
        {levelProgress.percentage.toFixed(1)}% to Level {levelProgress.next}
        {nextLevelData && ` (${nextLevelData.name})`}
      </Text>
    </View>
  );
};

const ExperienceField: React.FC<{
  character: Character;
  onRefreshExperience?: () => void;
}> = ({ character, onRefreshExperience }) => {
  const baseSteps = character.experience;
  const balancedXP = calculateBalancedXP(
    baseSteps,
    character.fitnessBackground,
    character.class
  );
  const xpMultiplier =
    baseSteps > 0 ? (balancedXP / baseSteps).toFixed(2) : '1.00';

  return (
    <View className="space-y-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Experience (Steps)
        </Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          XP Multiplier: {xpMultiplier}x
        </Text>
      </View>
      <View className="flex-row items-center">
        <TextInput
          value={String(character.experience)}
          editable={false}
          className="flex-1 rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-center text-gray-500 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400"
          placeholder="Auto-updated from step count"
          placeholderTextColor="#9CA3AF"
        />
        {onRefreshExperience && (
          <TouchableOpacity
            onPress={onRefreshExperience}
            className="ml-2 rounded-md bg-blue-500 px-3 py-2"
          >
            <Text className="text-xs text-white">Refresh</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const LevelExpFields: React.FC<{
  character: Character;
  onRefreshExperience?: () => void;
}> = ({ character, onRefreshExperience }) => (
  <View className="space-y-4">
    <LevelDisplay character={character} />
    <ExperienceField
      character={character}
      onRefreshExperience={onRefreshExperience}
    />
    <Text className="text-center text-xs text-gray-500 dark:text-gray-400">
      Experience automatically updates from your daily step count
    </Text>
  </View>
);

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  character,
  updateField,
  onRefreshExperience,
}) => (
  <View className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
    <Text className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
      Character Info
    </Text>
    <View className="space-y-4">
      <NameField character={character} updateField={updateField} />
      <FitnessBackgroundClassFields
        character={character}
        updateField={updateField}
      />
      <LevelExpFields
        character={character}
        onRefreshExperience={onRefreshExperience}
      />
    </View>
  </View>
);

type AttributesSectionProps = {
  character: Character;
  updateAttribute: (attr: keyof Character['attributes'], value: number) => void;
};

const AttributesSection: React.FC<AttributesSectionProps> = ({
  character,
  updateAttribute,
}) => (
  <View className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
    <Text className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
      Attributes
    </Text>
    <View className="space-y-3">
      {Object.entries(character.attributes).map(([attr, value]) => (
        <View key={attr} className="flex-row items-center">
          <Text className="w-24 text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
            {attr}
          </Text>
          <TextInput
            value={String(value)}
            keyboardType="numeric"
            onChangeText={(text) =>
              updateAttribute(
                attr as keyof Character['attributes'],
                Number(text) || 0
              )
            }
            className="ml-3 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-center text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </View>
      ))}
    </View>
  </View>
);

export const CharacterSheet: React.FC<CharacterSheetProps> = ({
  character,
  onChange,
  onRefreshExperience,
}) => {
  const updateField = (field: keyof Character, value: any) => {
    onChange({ ...character, [field]: value });
  };

  const updateAttribute = (
    attr: keyof Character['attributes'],
    value: number
  ) => {
    onChange({
      ...character,
      attributes: { ...character.attributes, [attr]: value },
    });
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="space-y-6 p-4">
        <BasicInfoSection
          character={character}
          updateField={updateField}
          onRefreshExperience={onRefreshExperience}
        />
        <AttributesSection
          character={character}
          updateAttribute={updateAttribute}
        />
      </View>
    </ScrollView>
  );
};
