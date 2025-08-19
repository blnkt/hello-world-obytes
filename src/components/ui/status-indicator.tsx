import React from 'react';
import { View } from 'react-native';

import { Text } from './text';

interface StatusIndicatorProps {
  icon: string;
  label: string;
  description: string;
  color: string;
  dotColor: string;
  showDevBadge?: boolean;
}

export function StatusIndicator({
  icon,
  label,
  description,
  color,
  dotColor,
  showDevBadge = false,
}: StatusIndicatorProps) {
  return (
    <View
      className={`rounded-lg border-2 p-4 ${color} dark:border-neutral-600 dark:bg-neutral-800`}
    >
      <View className="flex-row items-center space-x-3">
        <Text className="text-2xl">{icon}</Text>
        <View className="flex-1">
          <View className="flex-row items-center space-x-2">
            <View className={`size-3 rounded-full ${dotColor}`} />
            <Text className="font-semibold">{label}</Text>
            {showDevBadge && (
              <View className="rounded-full bg-yellow-100 px-2 py-1 dark:bg-yellow-900">
                <Text className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                  DEV
                </Text>
              </View>
            )}
          </View>
          <Text className="text-sm opacity-80">{description}</Text>
        </View>
      </View>
    </View>
  );
}
