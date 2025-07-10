import React from 'react';

import { Text, View } from '@/components/ui';
import { Select } from '@/components/ui/select';
import { FITNESS_CLASSES } from '@/types/character';

const FITNESS_CLASS_OPTIONS = Object.keys(FITNESS_CLASSES).map((className) => ({
  label: className,
  value: className,
}));

type ClassSelectProps = {
  selectedClass: string;
  setSelectedClass: (className: string) => void;
};

export const ClassSelect: React.FC<ClassSelectProps> = ({
  selectedClass,
  setSelectedClass,
}) => (
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
