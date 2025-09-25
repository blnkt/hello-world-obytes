import React from 'react';
import { Text, View } from 'react-native';

import type { ScenarioHistory } from '@/types/scenario';

const ScenarioHistoryItem: React.FC<{
  entry: ScenarioHistory;
}> = ({ entry }) => (
  <View className="mb-4 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
    <View className="mb-2 flex-row items-center justify-between">
      <Text className="text-lg font-semibold text-gray-900 dark:text-white">
        {entry.title}
      </Text>
      <View
        className={`rounded-full px-2 py-1 ${
          entry.type === 'merchant'
            ? 'bg-green-100 dark:bg-green-900'
            : 'bg-red-100 dark:bg-red-900'
        }`}
      >
        <Text
          className={`text-xs font-medium ${
            entry.type === 'merchant'
              ? 'text-green-800 dark:text-green-200'
              : 'text-red-800 dark:text-red-200'
          }`}
        >
          {entry.type}
        </Text>
      </View>
    </View>

    <Text className="mb-2 text-sm text-gray-600 dark:text-gray-300">
      {entry.description}
    </Text>

    <Text className="mb-2 text-sm font-medium text-blue-600 dark:text-blue-400">
      Reward: {entry.reward}
    </Text>

    <View className="flex-row items-center justify-between">
      <Text className="text-xs text-gray-500 dark:text-gray-400">
        Milestone: {entry.milestone}
      </Text>
      <Text className="text-xs text-gray-500 dark:text-gray-400">
        {new Date(entry.visitedAt).toLocaleDateString()}
      </Text>
    </View>

    {entry.outcome && (
      <View className="mt-2 rounded bg-blue-50 p-2 dark:bg-blue-900/20">
        <Text className="text-xs text-blue-700 dark:text-blue-300">
          Outcome: {entry.outcome}
        </Text>
      </View>
    )}
  </View>
);

export default ScenarioHistoryItem;
