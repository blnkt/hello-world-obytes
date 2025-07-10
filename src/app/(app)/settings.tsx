import React, { useEffect, useState } from 'react';

import { Button, Text, View } from '@/components/ui';
import { useIsFirstTime } from '@/lib/hooks/use-is-first-time';
import {
  clearAllStorage,
  getItem,
  resetFirstTime,
  setItem,
} from '@/lib/storage';

export default function Settings() {
  const [steps, setSteps] = useState(Number(getItem('stepCount')) || 0);
  const [isFirstTime] = useIsFirstTime();

  const pressHandler = async () => {
    setSteps(steps + 10);
  };

  const resetFirstTimeHandler = () => {
    console.log('🔄 Resetting first time flag...');
    resetFirstTime();
    console.log('✅ First time flag reset');
    alert('First time flag reset! Restart the app to see onboarding.');
  };

  const clearAllStorageHandler = () => {
    console.log('🗑️ Clearing all storage...');
    clearAllStorage();
    console.log('✅ All storage cleared');
    alert('All storage cleared! Restart the app to see onboarding.');
  };

  useEffect(() => {
    setItem('stepCount', steps);
  }, [steps]);

  return (
    <View className="flex-1 p-4">
      <Text className="mb-4 text-2xl font-bold">Settings</Text>

      <View className="space-y-4">
        <Text className="text-sm text-gray-600">
          Debug Info: isFirstTime = {String(isFirstTime)}
        </Text>

        <Button
          fullWidth
          variant="outline"
          label="Update Step Count"
          onPress={pressHandler}
        />
        <Text>Current Steps: {steps}</Text>

        <Button
          fullWidth
          variant="outline"
          label="Reset First Time Flag"
          onPress={resetFirstTimeHandler}
        />

        <Button
          fullWidth
          variant="outline"
          label="Clear All Storage"
          onPress={clearAllStorageHandler}
        />
      </View>
    </View>
  );
}
