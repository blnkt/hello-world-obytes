import React from 'react';

import {
  Button,
  FormInput,
  FormSection,
  HistoryItem,
  InfoCard,
  StatusIndicator,
  StorageErrorBoundary,
  Text,
  ToggleCard,
  View,
} from '@/components/ui';
import {
  useDeveloperMode,
  useExperienceData,
  useManualEntryMode,
} from '@/lib/health';
import { clearManualStepsByDay, useManualStepsByDay } from '@/lib/storage';

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
    <ToggleCard
      title="Manual Entry Mode"
      description={
        isManualMode
          ? 'Currently using manual step entry'
          : 'Currently using HealthKit for step tracking'
      }
      buttonLabel={isManualMode ? 'Switch to HealthKit' : 'Switch to Manual'}
      onPress={handleToggle}
      isLoading={isLoading}
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
    <ToggleCard
      title="Developer Mode"
      description={
        isDeveloperMode
          ? 'HealthKit checks bypassed for testing'
          : 'Normal HealthKit availability checks'
      }
      buttonLabel={isDeveloperMode ? 'Disable' : 'Enable'}
      onPress={handleToggle}
      isLoading={isLoading}
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
    <StorageErrorBoundary>
      <InfoCard
        title="Manual Entries"
        description={`${manualStepsCount} manual step entries stored`}
      />

      <Button
        fullWidth
        variant="outline"
        label="Clear All Manual Entries"
        onPress={handleClearManualEntries}
        disabled={manualStepsCount === 0}
      />
    </StorageErrorBoundary>
  );
};

const ManualEntryHistoryItem = ({ entry }: { entry: any }) => {
  const formatDate = (dateString: string) => {
    try {
      // Create date in local timezone to avoid UTC conversion issues
      const [year, month, day] = dateString.split('-').map(Number);
      const localDate = new Date(year, month - 1, day); // month is 0-indexed

      return localDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatSteps = (steps: number) => {
    return steps.toLocaleString();
  };

  return (
    <HistoryItem
      title={formatDate(entry.date)}
      subtitle={`${formatSteps(entry.steps)} steps`}
      badge={{ text: 'Manual', color: 'bg-blue-500' }}
    />
  );
};

const ManualEntryHistoryEmpty = () => (
  <InfoCard
    title="Manual Entry History"
    description="No manual entries found"
  />
);

const DateInput = ({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (text: string) => void;
}) => (
  <FormInput
    label="Date"
    value={value}
    onChangeText={onChangeText}
    placeholder="YYYY-MM-DD"
    maxLength={10}
  />
);

const StepCountInput = ({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (text: string) => void;
}) => (
  <FormInput
    label="Step Count"
    value={value}
    onChangeText={onChangeText}
    placeholder="Enter step count"
    keyboardType="numeric"
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
    <FormSection title="Add Manual Step Entry">
      <DateInput value={selectedDate} onChangeText={setSelectedDate} />
      <StepCountInput value={stepCount} onChangeText={setStepCount} />

      {/* Error Display */}
      {error && (
        <Text className="text-sm text-red-600 dark:text-red-400">{error}</Text>
      )}

      {/* Submit Button */}
      <Button
        fullWidth
        label={isSubmitting ? 'Adding...' : 'Add Step Entry'}
        onPress={handleSubmit}
        disabled={isSubmitting || !stepCount.trim()}
        size="sm"
      />
    </FormSection>
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
    <StorageErrorBoundary>
      <InfoCard title="Manual Entry History" description="">
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
      </InfoCard>
    </StorageErrorBoundary>
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
