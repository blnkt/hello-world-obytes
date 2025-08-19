import React from 'react';
import { View } from 'react-native';

import { Text } from './text';

interface InfoCardProps {
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
}

export function InfoCard({
  title,
  description,
  children,
  className = '',
}: InfoCardProps) {
  return (
    <View
      className={`rounded-md border border-neutral-200 p-3 dark:border-neutral-700 ${className}`}
    >
      <Text className="font-medium">{title}</Text>
      <Text className="text-sm text-neutral-600 dark:text-neutral-400">
        {description}
      </Text>
      {children}
    </View>
  );
}
