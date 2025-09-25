import React from 'react';
import { View } from 'react-native';

import { Button, Card, Input, StatusIndicator, Text } from '@/components/ui';
import {
  useDeveloperMode,
  useExperienceData,
  useManualEntryMode,
} from '@/lib/health';
import { clearManualStepsByDay, useManualStepsByDay } from '@/lib/storage';
import { formatDateDetailed, formatNumber } from '@/lib/utils';

import { useManualStepForm } from './use-manual-step-form';

if (typeof global.alert === 'undefined') {
  global.alert = () => {};
}

const EntryModeIndicator = () => {
  const { isManualMode } = useManualEntryMode();
  const { isDeveloperMode } = useDeveloperMode();

  const getModeInfo = () => {
    if (isManualMode) {
      return {
        icon: '✍️',
        label: 'Manual Entry',
        description: 'You are manually entering step data',
        color: 'bg-blue-100 border-blue-300 text-blue-800',
        dotColor: 'bg-blue-500',
      };
    } else {
      return {
        icon: '🦶',
        label: 'HealthKit',
        description: 'Using automatic HealthKit step tracking',
        color: 'bg-green-100 border-green-300 text-green-800',
        dotColor: 'bg-green-500',
      };
    }
  };

  const modeInfo = getModeInfo();

  return (
    <StatusIndicator
      icon={modeInfo.icon}
      label={modeInfo.label}
      description={modeInfo.description}
      color={modeInfo.color}
      dotColor={modeInfo.dotColor}
      showDevBadge={isDeveloperMode}
    />
  );
};

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
    <Card
      variant="toggle"
      title="Manual Entry Mode"
      description="Enable manual step entry when HealthKit is unavailable"
      buttonLabel={isManualMode ? 'Disable' : 'Enable'}
      onPress={handleToggle}
      disabled={isLoading}
      isLoading={isLoading}
      testID="manual-mode-toggle"
    />
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
    <Card
      variant="toggle"
      title="Developer Mode"
      description="Enable additional debugging and development features"
      buttonLabel={isDeveloperMode ? 'Disable' : 'Enable'}
      onPress={handleToggle}
      disabled={isLoading}
      isLoading={isLoading}
      testID="developer-mode-toggle"
    />
  );
};

const ManualEntriesInfo = ({ onRefresh }: { onRefresh: () => void }) => {
  const [manualSteps] = useManualStepsByDay();
  const manualStepsCount = manualSteps?.length || 0;

  const handleClearManualEntries = async () => {
    try {
      await clearManualStepsByDay();
      onRefresh();
      alert('Manual entries cleared!');
    } catch (error) {
      console.error('Error clearing manual entries:', error);
      alert('Error clearing manual entries');
      // Don't re-throw - error boundaries don't catch async errors
    }
  };

  return (
    <Card
      variant="info"
      title="Manual Entries"
      description={`${manualStepsCount} manual step entries stored`}
    >
      <Button
        fullWidth
        variant="outline"
        label="Clear All Manual Entries"
        onPress={handleClearManualEntries}
        disabled={manualStepsCount === 0}
      />
    </Card>
  );
};

const ManualEntryHistoryItem = ({ entry }: { entry: any }) => {
  // Using centralized formatDateDetailed utility

  // Using centralized formatNumber utility

  return (
    <Card
      variant="info"
      title={formatDateDetailed(entry.date)}
      description={`${formatNumber(entry.steps)} steps`}
    />
  );
};

const ManualEntryHistoryEmpty = () => (
  <Card
    variant="info"
    title="Manual Entry History"
    description="No manual entries found"
  />
);

const AddManualStepForm = ({ onStepAdded }: { onStepAdded: () => void }) => {
  const {
    stepCount,
    setStepCount,
    selectedDate,
    setSelectedDate,
    isSubmitting,
    error,
    handleSubmit,
  } = useManualStepForm(onStepAdded);

  return (
    <Card variant="form" title="Add Manual Step Entry">
      <View className="space-y-4">
        <Input
          simple={true}
          label="Date"
          value={selectedDate}
          onChangeText={setSelectedDate}
          placeholder="YYYY-MM-DD"
          testID="manual-entry-date"
        />

        <Input
          simple={true}
          label="Step Count"
          value={stepCount}
          onChangeText={setStepCount}
          placeholder="Enter step count"
          testID="manual-entry-steps"
        />

        {/* Error Display */}
        {error && (
          <Text className="text-sm text-red-600 dark:text-red-400">
            {error}
          </Text>
        )}

        {/* Submit Button */}
        <Button
          fullWidth
          label={isSubmitting ? 'Adding...' : 'Add Step Entry'}
          onPress={handleSubmit}
          disabled={isSubmitting || !stepCount.trim()}
          size="sm"
        />
      </View>
    </Card>
  );
};

const ManualEntryHistory = ({ manualSteps }: { manualSteps: any[] }) => {
  if (manualSteps.length === 0) {
    return <ManualEntryHistoryEmpty />;
  }

  // Sort by date (newest first) - using timezone-safe comparison
  const sortedSteps = [...manualSteps].sort((a, b) => {
    // Compare date strings directly to avoid timezone conversion issues
    return b.date.localeCompare(a.date);
  });

  return (
    <Card variant="info" title="Manual Entry History" description="">
      <View className="space-y-2">
        {sortedSteps.slice(0, 10).map((entry, index) => (
          <ManualEntryHistoryItem
            key={`${entry.date}-${index}`}
            entry={entry}
          />
        ))}
        {sortedSteps.length > 10 && (
          <Text className="pt-2 text-center text-xs text-neutral-500 dark:text-neutral-400">
            Showing 10 most recent entries
          </Text>
        )}
      </View>
    </Card>
  );
};

export default function ManualEntrySection() {
  const { isManualMode: _isManualMode, setManualMode: _setManualMode } =
    useManualEntryMode();
  const { isDeveloperMode: _isDeveloperMode, setDevMode: _setDevMode } =
    useDeveloperMode();
  const { refreshExperience } = useExperienceData();
  const [manualSteps] = useManualStepsByDay();

  const handleStepAdded = React.useCallback(async () => {
    // Refresh experience data - this will trigger re-renders in components that use it
    await refreshExperience();
  }, [refreshExperience]);

  return (
    <View className="space-y-4">
      <Text className="text-lg font-semibold">Manual Entry Settings</Text>

      <View className="space-y-3">
        <EntryModeIndicator />
        <ManualEntryModeToggle />
        <DeveloperModeToggle />
        <AddManualStepForm onStepAdded={handleStepAdded} />
        <ManualEntriesInfo onRefresh={() => {}} />
        <ManualEntryHistory manualSteps={manualSteps} />
      </View>
    </View>
  );
}
