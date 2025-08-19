import React from 'react';
import { View } from 'react-native';

import { Text } from './text';

interface ClassCardProps {
  title: string;
  description: string;
  variant?: 'compact' | 'detailed';
  children?: React.ReactNode;
  className?: string;
}

export function ClassCard({
  title,
  description,
  variant = 'detailed',
  children,
  className = '',
}: ClassCardProps) {
  const containerClass =
    variant === 'compact'
      ? 'mt-2 rounded-md bg-purple-50 p-3 dark:bg-purple-900'
      : 'rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800';

  return (
    <View className={`${containerClass} ${className}`}>
      <Text
        className={`font-bold text-gray-800 dark:text-gray-200 ${
          variant === 'compact' ? 'text-sm' : 'mb-2 text-xl'
        }`}
      >
        {title}
      </Text>
      <Text
        className={`text-gray-600 dark:text-gray-400 ${
          variant === 'compact' ? 'text-sm' : 'mb-4 text-base'
        }`}
      >
        {description}
      </Text>
      {children}
    </View>
  );
}
