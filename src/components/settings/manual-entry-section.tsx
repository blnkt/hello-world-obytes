import React from 'react';

import { Button, Text, View } from '@/components/ui';
import { useDeveloperMode, useManualEntryMode } from '@/lib/health';
import { clearManualStepsByDay, getManualStepsByDay } from '@/lib/storage';

const ManualEntryModeToggle = () => {
  const { isManualMode, setManualMode, isLoading } = useManualEntryMode();

  const handleToggle = async () => {
    try {
      await setManualMode(!isManualMode);
    } catch (error) {
      console.error('Error toggling manual mode:', error);
    }
  };

  return (
    <View className="flex-row items-center justify-between rounded-md border border-neutral-200 p-3 dark:border-neutral-700">
      <View className="flex-1">
        <Text className="font-medium">Manual Entry Mode</Text>
        <Text className="text-sm text-neutral-600 dark:text-neutral-400">
          {isManualMode
            ? 'Currently using manual step entry'
            : 'Currently using HealthKit for step tracking'}
        </Text>
      </View>
      <Button
        variant="outline"
        label={isManualMode ? 'Switch to HealthKit' : 'Switch to Manual'}
        onPress={handleToggle}
        disabled={isLoading}
        size="sm"
      />
    </View>
  );
};

const DeveloperModeToggle = () => {
  const { isDeveloperMode, setDevMode, isLoading } = useDeveloperMode();

  const handleToggle = async () => {
    try {
      await setDevMode(!isDeveloperMode);
    } catch (error) {
      console.error('Error toggling developer mode:', error);
    }
  };

  return (
    <View className="flex-row items-center justify-between rounded-md border border-neutral-200 p-3 dark:border-neutral-700">
      <View className="flex-1">
        <Text className="font-medium">Developer Mode</Text>
        <Text className="text-sm text-neutral-600 dark:text-neutral-400">
          {isDeveloperMode
            ? 'HealthKit checks bypassed for testing'
            : 'Normal HealthKit availability checks'}
        </Text>
      </View>
      <Button
        variant="outline"
        label={isDeveloperMode ? 'Disable' : 'Enable'}
        onPress={handleToggle}
        disabled={isLoading}
        size="sm"
      />
    </View>
  );
};

const ManualEntriesInfo = () => {
  const [manualStepsCount, setManualStepsCount] = React.useState<number>(0);

  React.useEffect(() => {
    const loadManualStepsCount = async () => {
      try {
        const manualSteps = getManualStepsByDay();
        setManualStepsCount(manualSteps?.length || 0);
      } catch (error) {
        console.error('Error loading manual steps count:', error);
        setManualStepsCount(0);
      }
    };

    loadManualStepsCount();
  }, []);

  const handleClearManualEntries = async () => {
    try {
      await clearManualStepsByDay();
      setManualStepsCount(0);
      alert('Manual entries cleared!');
    } catch (error) {
      console.error('Error clearing manual entries:', error);
      alert('Error clearing manual entries');
    }
  };

  return (
    <>
      <View className="rounded-md border border-neutral-200 p-3 dark:border-neutral-700">
        <Text className="font-medium">Manual Entries</Text>
        <Text className="text-sm text-neutral-600 dark:text-neutral-400">
          {manualStepsCount} manual step entries stored
        </Text>
      </View>

      <Button
        fullWidth
        variant="outline"
        label="Clear All Manual Entries"
        onPress={handleClearManualEntries}
        disabled={manualStepsCount === 0}
      />
    </>
  );
};

export const ManualEntrySection = () => {
  return (
    <View className="space-y-4">
      <Text className="text-lg font-semibold">Manual Entry Settings</Text>

      <View className="space-y-3">
        <ManualEntryModeToggle />
        <DeveloperModeToggle />
        <ManualEntriesInfo />
      </View>
    </View>
  );
};
