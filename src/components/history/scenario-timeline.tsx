import { FlashList } from '@shopify/flash-list';
import React from 'react';
import { Dimensions, Text, View } from 'react-native';

import {
  MerchantIllustration,
  MonsterIllustration,
} from './scenario-illustrations';

const ITEM_WIDTH = Dimensions.get('window').width;

const TimelineItem: React.FC<{ entry: any; index: number; total: number }> = ({
  entry,
  index,
  total,
}) => (
  <View style={{ width: ITEM_WIDTH }} className="mr-6 w-screen shrink-0 px-4">
    {/* Timeline line with illustration */}
    <View className="mb-4 items-center">
      {entry.type === 'merchant' ? (
        <MerchantIllustration width={ITEM_WIDTH - 32} height={120} />
      ) : (
        <MonsterIllustration width={ITEM_WIDTH - 32} height={120} />
      )}
      {index < total - 1 && (
        <View className="absolute top-16 h-0.5 w-screen bg-gray-300 dark:bg-gray-600" />
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
  <FlashList
    data={history}
    keyExtractor={(item) => item.id}
    renderItem={({ item, index }) => (
      <TimelineItem entry={item} index={index} total={history.length} />
    )}
    horizontal
    pagingEnabled
    snapToInterval={ITEM_WIDTH}
    decelerationRate="fast"
    showsHorizontalScrollIndicator={false}
    estimatedItemSize={ITEM_WIDTH}
  />
);

export default ScenarioTimeline;
