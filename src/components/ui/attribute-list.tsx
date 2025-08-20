import React from 'react';
import { View } from 'react-native';

import { Text } from './text';

interface Attribute {
  name: string;
  value: number;
  icon: string;
}

interface AttributeListProps {
  title: string;
  attributes: Attribute[];
  className?: string;
}

export function AttributeList({
  title,
  attributes,
  className = '',
}: AttributeListProps) {
  return (
    <View className={`mb-4 ${className}`}>
      <Text className="mb-2 font-semibold text-gray-800 dark:text-gray-200">
        {title}:
      </Text>
      <View className="space-y-1">
        {attributes.map((attribute) => (
          <Text
            key={attribute.name}
            className="text-gray-600 dark:text-gray-400"
          >
            {attribute.icon} {attribute.name}: {attribute.value}
          </Text>
        ))}
      </View>
    </View>
  );
}
