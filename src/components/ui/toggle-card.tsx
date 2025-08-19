import React from 'react';
import { View } from 'react-native';

import { Button } from './button';
import { Text } from './text';

interface ToggleCardProps {
  title: string;
  description: string;
  buttonLabel: string;
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function ToggleCard({
  title,
  description,
  buttonLabel,
  onPress,
  disabled = false,
  isLoading = false,
}: ToggleCardProps) {
  return (
    <View className="flex-row items-center justify-between rounded-md border border-neutral-200 p-3 dark:border-neutral-700">
      <View className="flex-1">
        <Text className="font-medium">{title}</Text>
        <Text className="text-sm text-neutral-600 dark:text-neutral-400">
          {description}
        </Text>
      </View>
      <Button
        variant="outline"
        label={buttonLabel}
        onPress={onPress}
        disabled={disabled || isLoading}
        size="sm"
      />
    </View>
  );
}
