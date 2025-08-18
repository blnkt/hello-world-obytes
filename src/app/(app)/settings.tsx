import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';

import ManualEntrySection from '@/components/settings/manual-entry-section';
import { Button, Text, View } from '@/components/ui';
import { useIsFirstTime } from '@/lib/hooks/use-is-first-time';
import {
  clearAllStorage,
  getItem,
  resetFirstTime,
  setItem,
} from '@/lib/storage';

const DebugInfo = ({
  isFirstTime,
  forceUpdate,
}: {
  isFirstTime: boolean;
  forceUpdate: number;
}) => (
  <View className="space-y-2">
    <Text className="text-sm text-gray-600">
      Debug Info: isFirstTime = {String(isFirstTime)}
    </Text>
    <Text className="text-sm text-gray-600">
      Force Update Counter: {forceUpdate}
    </Text>
  </View>
);

const createResetHandler =
  (
    isFirstTime: boolean,
    setIsFirstTime: (value: boolean) => void,
    setForceUpdate: (fn: (prev: number) => number) => void
  ) =>
  () => {
    resetFirstTime();
    setIsFirstTime(true);
    setForceUpdate((prev) => prev + 1);
    alert('First time flag reset! Restart the app to see onboarding.');
  };

const createClearHandler =
  (
    isFirstTime: boolean,
    setIsFirstTime: (value: boolean) => void,
    setForceUpdate: (fn: (prev: number) => number) => void
  ) =>
  () => {
    clearAllStorage();
    setIsFirstTime(true);
    setForceUpdate((prev) => prev + 1);
    alert('All storage cleared! Restart the app to see onboarding.');
  };

export default function Settings() {
  const [steps, setSteps] = useState(Number(getItem('stepCount')) || 0);
  const [isFirstTime, setIsFirstTime] = useIsFirstTime();
  const [forceUpdate, setForceUpdate] = useState(0);

  const pressHandler = async () => {
    setSteps(steps + 10);
  };

  const resetFirstTimeHandler = createResetHandler(
    isFirstTime,
    setIsFirstTime,
    setForceUpdate
  );
  const clearAllStorageHandler = createClearHandler(
    isFirstTime,
    setIsFirstTime,
    setForceUpdate
  );

  useEffect(() => {
    setItem('stepCount', steps);
  }, [steps]);

  return (
    <View className="flex-1">
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        <Text className="mb-4 text-2xl font-bold">Settings</Text>

        <View className="space-y-6">
          <DebugInfo isFirstTime={isFirstTime} forceUpdate={forceUpdate} />

          <ManualEntrySection />

          <View className="space-y-4">
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
      </ScrollView>
    </View>
  );
}
