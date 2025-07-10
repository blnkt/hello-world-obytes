import React from 'react';

import { Text, View } from '@/components/ui';
import { FITNESS_CLASSES } from '@/types/character';

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

export const ClassDetails: React.FC<ClassDetailsProps> = ({
  selectedClass,
}) => {
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
