import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { MerchantIcon, MonsterIcon } from '../ui/icons';

const TimelineItem: React.FC<{ entry: any; index: number; total: number }> = ({
  entry,
  index,
  total,
}) => (
  <View className="mr-6 w-screen shrink-0 px-4">
    {/* Timeline line with icon */}
    <View className="mb-4 items-center">
      {entry.type === 'merchant' ? (
        <MerchantIcon color="#10B981" width={24} height={24} />
      ) : (
        <MonsterIcon color="#EF4444" width={24} height={24} />
      )}
      {index < total - 1 && (
        <View className="absolute top-6 h-0.5 w-screen bg-gray-300 dark:bg-gray-600" />
      )}
    </View>

    {/* Content */}
    <View className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-base font-semibold text-gray-900 dark:text-white">
          {entry.title}
        </Text>
        <View
          className={`rounded-full px-3 py-1 ${
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

      <Text className="mb-3 text-sm text-gray-600 dark:text-gray-300">
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
        <View className="mt-3 rounded bg-blue-50 p-2 dark:bg-blue-900/20">
          <Text className="text-xs text-blue-700 dark:text-blue-300">
            Outcome: {entry.outcome}
          </Text>
        </View>
      )}
    </View>
  </View>
);

const ScenarioTimeline: React.FC<{
  history: any[];
}> = ({ history }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ paddingHorizontal: 16 }}
    className="flex-1"
  >
    {history.map((entry, index) => (
      <TimelineItem
        key={entry.id}
        entry={entry}
        index={index}
        total={history.length}
      />
    ))}
  </ScrollView>
);

export default ScenarioTimeline;
