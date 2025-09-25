import React from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui';

interface SaveStatusIndicatorProps {
  isSaving: boolean;
  lastError: string | null;
  lastSaveTime: number | null;
}

export const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({
  isSaving,
  lastError,
  lastSaveTime,
}) => {
  if (isSaving) {
    return (
      <View className="absolute bottom-4 right-4 rounded-lg bg-blue-500 px-3 py-2 shadow-lg">
        <Text className="text-xs font-medium text-white">💾 Saving...</Text>
      </View>
    );
  }

  if (lastError) {
    return (
      <View className="absolute bottom-4 right-4 rounded-lg bg-red-500 px-3 py-2 shadow-lg">
        <Text className="text-xs font-medium text-white">❌ Save failed</Text>
        <Text className="text-xs text-white/80">{lastError}</Text>
      </View>
    );
  }

  if (lastSaveTime) {
    const timeSinceSave = Date.now() - lastSaveTime;
    const secondsAgo = Math.floor(timeSinceSave / 1000);

    if (secondsAgo < 5) {
      return (
        <View className="absolute bottom-4 right-4 rounded-lg bg-green-500 px-3 py-2 shadow-lg">
          <Text className="text-xs font-medium text-white">✅ Saved</Text>
        </View>
      );
    }
  }

  return null;
};
