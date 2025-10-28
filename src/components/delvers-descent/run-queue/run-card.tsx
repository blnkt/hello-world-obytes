import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import type { DelvingRun } from '@/types/delvers-descent';

export interface RunCardProps {
  run: DelvingRun;
  onStartRun?: (runId: string) => void;
  onPress?: (runId: string) => void;
}

const getStatusColor = (status: DelvingRun['status']) => {
  switch (status) {
    case 'queued':
      return 'bg-gray-500';
    case 'active':
      return 'bg-blue-500';
    case 'completed':
      return 'bg-green-500';
    case 'busted':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const getStatusLabel = (status: DelvingRun['status']) => {
  switch (status) {
    case 'queued':
      return 'Ready to Start';
    case 'active':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    case 'busted':
      return 'Failed';
    default:
      return 'Unknown';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const RunCardHeader: React.FC<{ run: DelvingRun }> = ({ run }) => (
  <View className="mb-3 flex-row items-center justify-between">
    <View className="flex-1">
      <Text className="text-lg font-bold text-gray-900 dark:text-white">
        Delving Run
      </Text>
      <Text className="text-sm text-gray-600 dark:text-gray-400">
        {formatDate(run.date)}
      </Text>
    </View>
    <View className={`rounded-full px-3 py-1 ${getStatusColor(run.status)}`}>
      <Text className="text-xs font-semibold text-white">
        {getStatusLabel(run.status)}
      </Text>
    </View>
  </View>
);

const RunCardDetails: React.FC<{ run: DelvingRun }> = ({ run }) => (
  <View className="mb-3 space-y-2">
    <View className="flex-row items-center justify-between">
      <Text className="text-sm text-gray-600 dark:text-gray-400">Steps</Text>
      <Text className="font-semibold text-gray-900 dark:text-white">
        {run.steps.toLocaleString()}
      </Text>
    </View>
    <View className="flex-row items-center justify-between">
      <Text className="text-sm text-gray-600 dark:text-gray-400">Energy</Text>
      <View className="flex-row items-center">
        <Text className="font-semibold text-gray-900 dark:text-white">
          {run.totalEnergy.toLocaleString()}
        </Text>
        {run.hasStreakBonus && (
          <View className="ml-2 rounded-full bg-yellow-100 px-2 py-0.5 dark:bg-yellow-900">
            <Text className="text-xs font-semibold text-yellow-800 dark:text-yellow-200">
              +{run.bonusEnergy.toLocaleString()} streak
            </Text>
          </View>
        )}
      </View>
    </View>
  </View>
);

export const RunCard: React.FC<RunCardProps> = ({
  run,
  onStartRun,
  onPress,
}) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress(run.id);
    }
  };

  const handleStart = (e: any) => {
    e?.stopPropagation();
    if (onStartRun) {
      onStartRun(run.id);
    } else {
      router.push(`/active-run?id=${run.id}`);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
      disabled={!onPress}
    >
      <RunCardHeader run={run} />
      <RunCardDetails run={run} />

      {run.status === 'queued' && (
        <TouchableOpacity
          onPress={handleStart}
          className="mt-2 rounded-lg bg-blue-500 py-3"
          activeOpacity={0.8}
        >
          <Text className="text-center font-semibold text-white">
            Start Run
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};
