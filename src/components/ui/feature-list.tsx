import React from 'react';
import { View } from 'react-native';

import { Text } from './text';

interface FeatureListProps {
  title: string;
  features: Record<string, string> | string[];
  variant?: 'compact' | 'detailed';
  colorScheme?: 'green' | 'red' | 'purple' | 'blue' | 'gray';
  className?: string;
}

export function FeatureList({
  title,
  features,
  variant = 'detailed',
  colorScheme = 'gray',
  className = '',
}: FeatureListProps) {
  const getColorClasses = () => {
    switch (colorScheme) {
      case 'green':
        return {
          title: 'text-green-700 dark:text-green-300',
          item: 'text-green-600 dark:text-green-400',
        };
      case 'red':
        return {
          title: 'text-red-700 dark:text-red-300',
          item: 'text-red-600 dark:text-red-400',
        };
      case 'purple':
        return {
          title: 'text-purple-700 dark:text-purple-300',
          item: 'text-purple-600 dark:text-purple-400',
        };
      case 'blue':
        return {
          title: 'text-blue-700 dark:text-blue-300',
          item: 'text-blue-600 dark:text-blue-400',
        };
      default:
        return {
          title: 'text-gray-700 dark:text-gray-300',
          item: 'text-gray-600 dark:text-gray-400',
        };
    }
  };

  const colors = getColorClasses();
  const isArray = Array.isArray(features);
  const featureEntries = isArray
    ? features.map((feature, index) => [index.toString(), feature])
    : Object.entries(features);

  return (
    <View className={`mb-4 ${className}`}>
      <Text
        className={`mb-2 font-semibold ${colors.title} ${
          variant === 'compact' ? 'text-xs' : ''
        }`}
      >
        {title}:
      </Text>
      {featureEntries.map(([key, value]) => (
        <Text
          key={key}
          className={`${colors.item} ${
            variant === 'compact' ? 'text-xs' : 'text-sm'
          }`}
        >
          • {value}
        </Text>
      ))}
    </View>
  );
}
