import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { useDelvingRuns } from '@/components/delvers-descent/hooks/use-delving-runs';
import { useDelvingRunsIntegration } from '@/lib/health';
import type { DelvingRun } from '@/types/delvers-descent';

import { RunCard } from './run-card';

// Minimum energy required to engage in encounters (deepest node at depth 1)
const MINIMUM_ENERGY_REQUIRED = 3;

const LoadingView: React.FC = () => (
  <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
    <ActivityIndicator size="large" color="#3B82F6" />
    <Text className="mt-4 text-gray-600 dark:text-gray-400">
      Loading runs...
    </Text>
  </View>
);

const ErrorView: React.FC<{ error: string }> = ({ error }) => (
  <View className="flex-1 items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
    <Text className="mb-2 text-center text-lg font-bold text-red-600">
      Error Loading Runs
    </Text>
    <Text className="text-center text-gray-600 dark:text-gray-400">
      {error}
    </Text>
  </View>
);

const EmptyStateView: React.FC = () => (
  <View className="items-center rounded-xl bg-white p-6 dark:bg-gray-800">
    <Text className="mb-2 text-2xl">🗺️</Text>
    <Text className="mb-2 text-center text-lg font-bold text-gray-900 dark:text-white">
      No Runs Available
    </Text>
    <Text className="text-center text-gray-600 dark:text-gray-400">
      Get moving to unlock your first dungeon run! Daily steps will generate new
      runs.
    </Text>
  </View>
);

const RenderRunCards: React.FC<{
  runs: DelvingRun[];
  onStartRun: (runId: string) => void;
  onRunPress: (runId: string) => void;
}> = ({ runs, onStartRun, onRunPress }) => (
  <>
    {runs.map((run) => (
      <RunCard
        key={run.id}
        run={run}
        onStartRun={onStartRun}
        onPress={onRunPress}
      />
    ))}
  </>
);

const RunSection: React.FC<{
  title: string;
  runs: DelvingRun[];
  onStartRun: (runId: string) => void;
  onRunPress: (runId: string) => void;
}> = ({ title, runs, onStartRun, onRunPress }) => {
  if (runs.length === 0) {
    return null;
  }

  return (
    <View className="mb-6">
      <Text className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
        {title}
      </Text>
      <RenderRunCards
        runs={runs}
        onStartRun={onStartRun}
        onRunPress={onRunPress}
      />
    </View>
  );
};

const RunQueueContent: React.FC<{
  onStartRun: (runId: string) => void;
  onRunPress: (runId: string) => void;
  queuedRuns: DelvingRun[];
  activeRuns: DelvingRun[];
  completedRuns: DelvingRun[];
  bustedRuns: DelvingRun[];
}> = ({
  onStartRun,
  onRunPress,
  queuedRuns,
  activeRuns,
  completedRuns,
  bustedRuns,
}) => {
  const hasAnyRuns =
    queuedRuns.length > 0 ||
    activeRuns.length > 0 ||
    completedRuns.length > 0 ||
    bustedRuns.length > 0;

  if (!hasAnyRuns) {
    return <EmptyStateView />;
  }

  return (
    <>
      <RunSection
        title="Ready to Start"
        runs={queuedRuns}
        onStartRun={onStartRun}
        onRunPress={onRunPress}
      />
      <RunSection
        title="Active"
        runs={activeRuns}
        onStartRun={onStartRun}
        onRunPress={onRunPress}
      />
      <RunSection
        title="Completed"
        runs={completedRuns}
        onStartRun={onStartRun}
        onRunPress={onRunPress}
      />
      <RunSection
        title="Failed"
        runs={bustedRuns}
        onStartRun={onStartRun}
        onRunPress={onRunPress}
      />
    </>
  );
};

export const RunQueueScreen: React.FC = () => {
  const router = useRouter();
  const {
    isLoading,
    error,
    getQueuedRuns,
    getActiveRuns,
    getCompletedRuns,
    getBustedRuns,
    refreshData,
    updateRunStatus,
  } = useDelvingRuns();

  // Auto-sync with HealthKit to generate runs from step data
  const { isLoading: isSyncing } = useDelvingRunsIntegration();

  // Refresh when sync completes
  useEffect(() => {
    if (!isSyncing) {
      refreshData();
    }
  }, [isSyncing, refreshData]);

  return (
    <RunQueueMainContent
      isLoading={isLoading || isSyncing}
      error={error}
      router={router}
      updateRunStatus={updateRunStatus}
      refreshData={refreshData}
      getQueuedRuns={getQueuedRuns}
      getActiveRuns={getActiveRuns}
      getCompletedRuns={getCompletedRuns}
      getBustedRuns={getBustedRuns}
    />
  );
};

const RunQueueMainContent: React.FC<{
  isLoading: boolean;
  error: string | null;
  router: any;
  updateRunStatus: (
    runId: string,
    status: DelvingRun['status']
  ) => Promise<void>;
  refreshData: () => Promise<void>;
  getQueuedRuns: () => DelvingRun[];
  getActiveRuns: () => DelvingRun[];
  getCompletedRuns: () => DelvingRun[];
  getBustedRuns: () => DelvingRun[];
}> = ({
  isLoading,
  error,
  router,
  updateRunStatus,
  refreshData,
  getQueuedRuns,
  getActiveRuns,
  getCompletedRuns,
  getBustedRuns,
}) => {
  const handleStartRun = async (runId: string) => {
    try {
      await updateRunStatus(runId, 'active');
      await refreshData();
      router.push(`/active-run?id=${runId}`);
    } catch (error) {
      console.error('Failed to start run:', error);
    }
  };

  const handleRunPress = (runId: string) => {
    router.push(`/active-run?id=${runId}`);
  };

  if (isLoading) {
    return <LoadingView />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  const queuedRuns = getQueuedRuns().filter(
    (run) => run.totalEnergy >= MINIMUM_ENERGY_REQUIRED
  );
  const activeRuns = getActiveRuns();
  const completedRuns = getCompletedRuns();
  const bustedRuns = getBustedRuns();

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="p-4">
        <Text className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
          Delver's Descent
        </Text>
        <RunQueueContent
          onStartRun={handleStartRun}
          onRunPress={handleRunPress}
          queuedRuns={queuedRuns}
          activeRuns={activeRuns}
          completedRuns={completedRuns}
          bustedRuns={bustedRuns}
        />
      </View>
    </ScrollView>
  );
};
