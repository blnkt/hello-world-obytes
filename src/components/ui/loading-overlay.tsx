import React from 'react';
import { View } from 'react-native';

import { Text } from './text';

interface LoadingOverlayProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function LoadingOverlay({
  visible,
  title = 'Loading...',
  subtitle = 'Please wait while the game processes your action',
  className = '',
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <View
      className={`absolute inset-0 z-50 flex-1 items-center justify-center bg-black/50 ${className}`}
    >
      <View className="rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <Text className="mb-2 text-center text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </Text>
        <Text className="text-center text-sm text-gray-600 dark:text-gray-300">
          {subtitle}
        </Text>
      </View>
    </View>
  );
}
