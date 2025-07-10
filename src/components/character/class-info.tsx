import React from 'react';
import { Text, View } from 'react-native';

import { FITNESS_CLASSES } from '../../types/character';

type ClassInfoProps = {
  characterClass: string;
  variant?: 'compact' | 'detailed';
  showAttributes?: boolean;
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

const ClassStrengths: React.FC<{
  strengths: Record<string, string>;
  variant?: 'compact' | 'detailed';
}> = ({ strengths, variant = 'detailed' }) => (
  <View className="mb-4">
    <Text
      className={`mb-2 font-semibold text-green-700 dark:text-green-300 ${variant === 'compact' ? 'text-xs' : ''}`}
    >
      Strengths:
    </Text>
    {Object.entries(strengths).map(([key, value]) => (
      <Text
        key={key}
        className={`text-green-600 dark:text-green-400 ${variant === 'compact' ? 'text-xs' : 'text-sm'}`}
      >
        • {value}
      </Text>
    ))}
  </View>
);

const ClassWeaknesses: React.FC<{
  weaknesses: Record<string, string>;
  variant?: 'compact' | 'detailed';
}> = ({ weaknesses, variant = 'detailed' }) => (
  <View className="mb-4">
    <Text
      className={`mb-2 font-semibold text-red-700 dark:text-red-300 ${variant === 'compact' ? 'text-xs' : ''}`}
    >
      Weaknesses:
    </Text>
    {Object.entries(weaknesses).map(([key, value]) => (
      <Text
        key={key}
        className={`text-red-600 dark:text-red-400 ${variant === 'compact' ? 'text-xs' : 'text-sm'}`}
      >
        • {value}
      </Text>
    ))}
  </View>
);

const ClassSpecialAbility: React.FC<{
  specialAbility: string;
  variant?: 'compact' | 'detailed';
}> = ({ specialAbility, variant = 'detailed' }) => (
  <View>
    <Text
      className={`mb-2 font-semibold text-purple-700 dark:text-purple-300 ${variant === 'compact' ? 'text-xs' : ''}`}
    >
      Special Ability:
    </Text>
    <Text
      className={`text-purple-600 dark:text-purple-400 ${variant === 'compact' ? 'text-xs' : 'text-sm'}`}
    >
      {specialAbility}
    </Text>
  </View>
);

export const ClassInfo: React.FC<ClassInfoProps> = ({
  characterClass,
  variant = 'detailed',
  showAttributes = false,
}) => {
  const classData =
    FITNESS_CLASSES[characterClass as keyof typeof FITNESS_CLASSES];
  if (!classData) return null;

  const containerClass =
    variant === 'compact'
      ? 'mt-2 rounded-md bg-purple-50 p-3 dark:bg-purple-900'
      : 'rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800';

  return (
    <View className={containerClass}>
      <Text
        className={`font-bold text-gray-800 dark:text-gray-200 ${variant === 'compact' ? 'text-sm' : 'mb-2 text-xl'}`}
      >
        {characterClass}
      </Text>
      <Text
        className={`text-gray-600 dark:text-gray-400 ${variant === 'compact' ? 'text-sm' : 'mb-4 text-base'}`}
      >
        {classData.description}
      </Text>

      {showAttributes && <ClassAttributes attributes={classData.attributes} />}
      <ClassStrengths strengths={classData.strengths} variant={variant} />
      <ClassWeaknesses weaknesses={classData.weaknesses} variant={variant} />
      <ClassSpecialAbility
        specialAbility={classData.specialAbility}
        variant={variant}
      />
    </View>
  );
};
