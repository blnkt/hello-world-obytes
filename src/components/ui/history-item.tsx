import React from 'react';
import { View } from 'react-native';

import { Text } from './text';

interface HistoryItemProps {
  title: string;
  subtitle: string;
  badge?: {
    text: string;
    color: string;
  };
  className?: string;
}

export function HistoryItem({
  title,
  subtitle,
  badge,
  className = '',
}: HistoryItemProps) {
  return (
    <View
      className={`flex-row items-center justify-between border-b border-neutral-100 py-2 last:border-b-0 dark:border-neutral-700 ${className}`}
    >
      <View className="flex-1">
        <Text className="text-sm font-medium">{title}</Text>
        <Text className="text-xs text-neutral-500 dark:text-neutral-400">
          {subtitle}
        </Text>
      </View>
      {badge && (
        <View className="flex-row items-center space-x-2">
          <View className={`size-2 rounded-full ${badge.color}`} />
          <Text className="text-xs text-neutral-500 dark:text-neutral-400">
            {badge.text}
          </Text>
        </View>
      )}
    </View>
  );
}
