import React from 'react';
import { View } from 'react-native';

import { Text } from './text';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({
  title,
  children,
  className = '',
}: FormSectionProps) {
  return (
    <View
      className={`rounded-md border border-neutral-200 p-3 dark:border-neutral-700 ${className}`}
    >
      <Text className="mb-3 font-medium">{title}</Text>
      <View className="space-y-3">{children}</View>
    </View>
  );
}
