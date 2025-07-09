import React from 'react';
import { Text, View } from 'react-native';

const StepHistoryItem: React.FC<{
  entry: { date: Date; steps: number };
}> = ({ entry }) => (
  <View className="mb-4 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
    <Text className="text-lg font-semibold text-gray-900 dark:text-white">
      {new Date(entry.date).toLocaleDateString()}
    </Text>
    <View className="mt-2 h-4 rounded-full bg-blue-100 dark:bg-blue-900">
      <View
        className="h-full rounded-full bg-blue-500"
        style={{
          width: `${Math.min((entry.steps / 10000) * 100, 100)}%`,
        }}
      />
    </View>
    <Text className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400">
      {entry.steps.toLocaleString()} steps
    </Text>
  </View>
);

export default StepHistoryItem;
