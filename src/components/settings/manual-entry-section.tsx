import React from 'react';
import { TextInput } from 'react-native';

import { Button, StorageErrorBoundary, Text, View } from '@/components/ui';
import {
  useDeveloperMode,
  useExperienceData,
  useManualEntryMode,
} from '@/lib/health';
import {
  clearManualStepsByDay,
  getManualStepsByDay,
  setManualStepEntry,
  useManualStepsByDay,
} from '@/lib/storage';

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
    <View
      className={`rounded-lg border-2 p-4 ${modeInfo.color} dark:border-neutral-600 dark:bg-neutral-800`}
    >
      <View className="flex-row items-center space-x-3">
        <Text className="text-2xl">{modeInfo.icon}</Text>
        <View className="flex-1">
          <View className="flex-row items-center space-x-2">
            <View className={`size-3 rounded-full ${modeInfo.dotColor}`} />
            <Text className="font-semibold">{modeInfo.label}</Text>
            {isDeveloperMode && (
              <View className="rounded-full bg-yellow-100 px-2 py-1 dark:bg-yellow-900">
                <Text className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                  DEV
                </Text>
              </View>
            )}
          </View>
          <Text className="text-sm opacity-80">{modeInfo.description}</Text>
        </View>
      </View>
    </View>
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
    </StorageErrorBoundary>
  );
};

const ManualEntryHistoryItem = ({ entry }: { entry: any }) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
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
    <View className="flex-row items-center justify-between border-b border-neutral-100 py-2 last:border-b-0 dark:border-neutral-700">
      <View className="flex-1">
        <Text className="text-sm font-medium">{formatDate(entry.date)}</Text>
        <Text className="text-xs text-neutral-500 dark:text-neutral-400">
          {formatSteps(entry.steps)} steps
        </Text>
      </View>
      <View className="flex-row items-center space-x-2">
        <View className="size-2 rounded-full bg-blue-500" />
        <Text className="text-xs text-neutral-500 dark:text-neutral-400">
          Manual
        </Text>
      </View>
    </View>
  );
};

const ManualEntryHistoryLoading = () => (
  <View className="rounded-md border border-neutral-200 p-3 dark:border-neutral-700">
    <Text className="font-medium">Manual Entry History</Text>
    <Text className="text-sm text-neutral-600 dark:text-neutral-400">
      Loading...
    </Text>
  </View>
);

const ManualEntryHistoryEmpty = () => (
  <View className="rounded-md border border-neutral-200 p-3 dark:border-neutral-700">
    <Text className="font-medium">Manual Entry History</Text>
    <Text className="text-sm text-neutral-600 dark:text-neutral-400">
      No manual entries found
    </Text>
  </View>
);

const DateInput = ({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (text: string) => void;
}) => (
  <View>
    <Text className="mb-1 text-sm font-medium">Date</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder="YYYY-MM-DD"
      className="rounded-md border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
      maxLength={10}
    />
  </View>
);

const StepCountInput = ({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (text: string) => void;
}) => (
  <View>
    <Text className="mb-1 text-sm font-medium">Step Count</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder="Enter step count"
      keyboardType="numeric"
      className="rounded-md border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
    />
  </View>
);

// eslint-disable-next-line max-lines-per-function
const useManualStepForm = (onStepAdded: () => void) => {
  const [stepCount, setStepCount] = React.useState('');
  const [selectedDate, setSelectedDate] = React.useState(() => {
    // Get today's date in local timezone without timezone conversion issues
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // YYYY-MM-DD format
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  const validateInput = () => {
    if (!stepCount.trim()) {
      setError('Please enter a step count');
      return false;
    }
    const steps = parseInt(stepCount, 10);
    if (isNaN(steps) || steps < 1) {
      setError('Please enter a valid step count');
      return false;
    }
    if (steps > 100000) {
      setError('Step count cannot exceed 100,000');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateInput()) return;

    try {
      setIsSubmitting(true);
      setError(undefined);

      const steps = parseInt(stepCount, 10);

      // Comprehensive debugging
      console.log('=== MANUAL STEP ENTRY DEBUG START ===');
      console.log('1. Form input - selectedDate:', selectedDate);
      console.log('2. Form input - stepCount:', stepCount);
      console.log('3. Form input - parsed steps:', steps);
      console.log('4. Entry to be stored:', {
        date: selectedDate,
        steps,
        source: 'manual',
      });

      // Check what's currently in storage before adding
      const beforeEntries = await getManualStepsByDay();
      console.log('5. Storage BEFORE submission:', beforeEntries);

      await setManualStepEntry({
        date: selectedDate,
        steps,
        source: 'manual',
      });

      // Check what's in storage after adding
      const afterEntries = await getManualStepsByDay();
      console.log('6. Storage AFTER submission:', afterEntries);

      // Check if the entry was added correctly
      const addedEntry = afterEntries.find(
        (entry) => entry.date === selectedDate
      );
      console.log('7. Added entry found:', addedEntry);

      // Check if there are any entries with different dates
      const differentDates = afterEntries.filter(
        (entry) => entry.date !== selectedDate
      );
      console.log('8. Other entries with different dates:', differentDates);

      console.log('=== MANUAL STEP ENTRY DEBUG END ===');

      // Reset form with timezone-safe date
      setStepCount('');
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      setSelectedDate(`${year}-${month}-${day}`);

      // Notify parent to refresh
      onStepAdded();

      alert(
        `Successfully added ${steps.toLocaleString()} steps for ${selectedDate}!`
      );
    } catch (error) {
      console.error('Error adding manual step entry:', error);
      setError('Failed to add step entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    stepCount,
    setStepCount,
    selectedDate,
    setSelectedDate,
    isSubmitting,
    error,
    handleSubmit,
  };
};

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
    <View className="rounded-md border border-neutral-200 p-3 dark:border-neutral-700">
      <Text className="mb-3 font-medium">Add Manual Step Entry</Text>

      <View className="space-y-3">
        <DateInput value={selectedDate} onChangeText={setSelectedDate} />
        <StepCountInput value={stepCount} onChangeText={setStepCount} />

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
    </View>
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
      <View className="rounded-md border border-neutral-200 p-3 dark:border-neutral-700">
        <Text className="mb-2 font-medium">Manual Entry History</Text>
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
      </View>
    </StorageErrorBoundary>
  );
};

export default function ManualEntrySection() {
  const { isManualMode, setManualMode } = useManualEntryMode();
  const { isDeveloperMode, setDevMode } = useDeveloperMode();
  const { refreshExperience } = useExperienceData();
  const [manualSteps] = useManualStepsByDay();

  const handleStepAdded = React.useCallback(async () => {
    // Debug: Check manual steps before refresh
    console.log('=== REFRESH DEBUG START ===');
    const beforeRefresh = await getManualStepsByDay();
    console.log('1. Manual steps BEFORE refreshExperience:', beforeRefresh);

    // Refresh experience data - this will trigger re-renders in components that use it
    await refreshExperience();

    // Debug: Check manual steps after refresh
    const afterRefresh = await getManualStepsByDay();
    console.log('2. Manual steps AFTER refreshExperience:', afterRefresh);

    // Check if anything changed
    if (JSON.stringify(beforeRefresh) !== JSON.stringify(afterRefresh)) {
      console.log('3. WARNING: Manual steps changed during refresh!');
      console.log('4. Before:', beforeRefresh);
      console.log('5. After:', afterRefresh);
    } else {
      console.log('3. Manual steps unchanged during refresh');
    }
    console.log('=== REFRESH DEBUG END ===');
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
