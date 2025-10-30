import { Stack } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { useDelvingRuns } from '@/components/delvers-descent/hooks/use-delving-runs';
import { ProgressionNavigation } from '@/components/delvers-descent/progression/progression-navigation';
import { getRunStateManager } from '@/lib/delvers-descent/run-state-manager';
import type { DelvingRun } from '@/types/delvers-descent';

interface RunHistoryData {
  run: DelvingRun;
  depth?: number;
  itemsCollected?: number;
  totalValue?: number;
  failureReason?: string;
}

export default function RunHistoryScreen() {
  const { getCompletedRuns, getBustedRuns } = useDelvingRuns();
  const _runStateManager = getRunStateManager();

  const completedRuns = useMemo(() => getCompletedRuns(), [getCompletedRuns]);
  const bustedRuns = useMemo(() => getBustedRuns(), [getBustedRuns]);

  // Combine and sort runs by date (newest first)
  const allRuns = useMemo(() => {
    const runs: RunHistoryData[] = [
      ...completedRuns.map((run) => ({
        run,
        depth: 0, // TODO: Retrieve from run state if stored
        itemsCollected: 0,
        totalValue: 0,
      })),
      ...bustedRuns.map((run) => ({
        run,
        depth: 0, // TODO: Retrieve from run state if stored
        failureReason: 'Energy depleted',
      })),
    ];

    return runs.sort(
      (a, b) => new Date(b.run.date).getTime() - new Date(a.run.date).getTime()
    );
  }, [completedRuns, bustedRuns]);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Run History',
          headerShown: true,
        }}
      />
      <View className="flex-1 bg-gray-50">
        <ProgressionNavigation currentScreen="run-history" />
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        >
          {allRuns.length === 0 ? (
            <View className="items-center justify-center p-8">
              <Text className="text-lg text-gray-600">
                No run history yet. Complete or bust a run to see it here.
              </Text>
            </View>
          ) : (
            <>
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-xl font-bold text-gray-800">
                  Total Runs: {allRuns.length}
                </Text>
                <Text className="text-sm text-gray-600">
                  {completedRuns.length} completed, {bustedRuns.length} busted
                </Text>
              </View>

              {allRuns.map((runData) => (
                <RunHistoryCard key={runData.run.id} runData={runData} />
              ))}
            </>
          )}
        </ScrollView>
      </View>
    </>
  );
}

const RunStatusBadges: React.FC<{
  isCompleted: boolean;
  isBusted: boolean;
}> = ({ isCompleted, isBusted }) => (
  <>
    {isCompleted && (
      <Text className="ml-2 rounded-full bg-green-500 px-2 py-1 text-xs font-semibold text-white">
        ✓ Completed
      </Text>
    )}
    {isBusted && (
      <Text className="ml-2 rounded-full bg-red-500 px-2 py-1 text-xs font-semibold text-white">
        ⚠ Busted
      </Text>
    )}
  </>
);

const RunDetails: React.FC<{
  run: DelvingRun;
  depth?: number;
  itemsCollected?: number;
  totalValue?: number;
  isCompleted: boolean;
  isBusted: boolean;
  failureReason?: string;
}> = ({
  run,
  depth,
  itemsCollected,
  totalValue,
  isCompleted,
  isBusted,
  failureReason,
}) => (
  <>
    <View className="flex-row items-center">
      <Text className="text-lg font-semibold text-gray-800">
        {new Date(run.date).toLocaleDateString()}
      </Text>
      <RunStatusBadges isCompleted={isCompleted} isBusted={isBusted} />
    </View>

    <View className="mt-2">
      <Text className="text-sm text-gray-600">
        Steps: {run.steps.toLocaleString()} | Energy: {run.totalEnergy}
      </Text>
      {depth !== undefined && (
        <Text className="text-sm text-gray-600">Deepest Depth: {depth}</Text>
      )}
    </View>

    {isCompleted && (
      <View className="mt-2">
        {itemsCollected !== undefined && (
          <Text className="text-sm font-semibold text-green-700">
            Items Collected: {itemsCollected}
          </Text>
        )}
        {totalValue !== undefined && totalValue > 0 && (
          <Text className="text-sm font-semibold text-green-700">
            Total Value: {totalValue.toLocaleString()}
          </Text>
        )}
      </View>
    )}

    {isBusted && failureReason && (
      <View className="mt-2">
        <Text className="text-sm font-semibold text-red-700">
          Failure: {failureReason}
        </Text>
      </View>
    )}
  </>
);

const RunHistoryCard: React.FC<{ runData: RunHistoryData }> = ({ runData }) => {
  const { run, depth, itemsCollected, totalValue, failureReason } = runData;
  const isCompleted = run.status === 'completed';
  const isBusted = run.status === 'busted';

  return (
    <Pressable
      className={`mb-4 rounded-lg border-2 p-4 ${
        isCompleted
          ? 'border-green-300 bg-green-50'
          : isBusted
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 bg-white'
      }`}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <RunDetails
            run={run}
            depth={depth}
            itemsCollected={itemsCollected}
            totalValue={totalValue}
            isCompleted={isCompleted}
            isBusted={isBusted}
            failureReason={failureReason}
          />
        </View>
      </View>
    </Pressable>
  );
};
