import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import type {
  CollectionProgress,
  CollectionStatistics,
} from '@/types/delvers-descent';

export interface CollectionProgressDisplayProps {
  progress: CollectionProgress;
  statistics?: CollectionStatistics;
}

const formatCompletionRate = (rate: number): string => {
  return `${Math.round(rate * 100)}%`;
};

const StatCard: React.FC<{
  label: string;
  value: string;
  bgColor?: string;
  textColor?: string;
}> = ({
  label,
  value,
  bgColor = 'bg-gray-50',
  textColor = 'text-gray-800',
}) => (
  <View
    className={`mb-3 flex-row items-center justify-between rounded-lg p-3 ${bgColor}`}
  >
    <Text className="text-sm font-semibold text-gray-700">{label}</Text>
    <Text className={`text-lg font-bold ${textColor}`}>{value}</Text>
  </View>
);

const CategoryCard: React.FC<{
  category: string;
  progress: { total: number; collected: number };
}> = ({ category, progress }) => {
  const completionRate =
    progress.total > 0 ? progress.collected / progress.total : 0;

  return (
    <View className="mb-3 rounded-lg border-2 border-gray-200 p-3">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="font-semibold capitalize text-gray-700">
          {category.replace('_', ' ')}
        </Text>
        <Text className="text-sm font-semibold text-gray-600">
          {formatCompletionRate(completionRate)}
        </Text>
      </View>

      <View className="mb-2">
        <View className="h-2 overflow-hidden rounded-full bg-gray-200">
          <View
            className="h-full bg-blue-500"
            style={{ width: `${completionRate * 100}%` }}
          />
        </View>
      </View>

      <Text className="text-xs text-gray-600">
        {progress.collected} / {progress.total} items
      </Text>
    </View>
  );
};

/**
 * CollectionProgressDisplay - Visual collection progress tracking
 *
 * Displays overall collection progress, category breakdowns, completion rates,
 * and XP earned from collections.
 */
export const CollectionProgressDisplay: React.FC<
  CollectionProgressDisplayProps
> = ({ progress, statistics }) => {
  const completionRate =
    progress.totalSets > 0
      ? progress.completedSets.length / progress.totalSets
      : 0;

  const getCategoryProgress = (category: string) => {
    const categoryProgress =
      progress.byCategory[category as keyof typeof progress.byCategory];
    if (!categoryProgress)
      return { total: 0, collected: 0, sets: 0, completedSets: 0 };
    return categoryProgress;
  };

  return (
    <ScrollView testID="collection-progress-display" className="gap-4">
      <View className="rounded-lg bg-white p-4">
        <Text className="mb-3 text-xl font-bold text-gray-800">
          Collection Progress
        </Text>

        <StatCard
          label="Sets Completed"
          value={`${progress.completedSets.length} / ${progress.totalSets}`}
          bgColor="bg-blue-50"
          textColor="text-blue-600"
        />

        <StatCard
          label="Items Collected"
          value={`${statistics?.totalItemsCollected || 0} / ${progress.totalItems}`}
          bgColor="bg-green-50"
          textColor="text-green-600"
        />

        <StatCard
          label="Overall Completion"
          value={formatCompletionRate(
            statistics?.collectionCompletionRate || completionRate
          )}
          bgColor="bg-purple-50"
          textColor="text-purple-600"
        />

        <View className="rounded-lg bg-yellow-50 p-3">
          <Text className="text-sm font-semibold text-gray-700">
            Total XP Earned
          </Text>
          <Text className="text-2xl font-bold text-yellow-600">
            {progress.totalXP}
          </Text>
        </View>
      </View>

      <View className="rounded-lg bg-white p-4">
        <Text className="mb-3 text-lg font-bold text-gray-800">
          Category Breakdown
        </Text>

        {Object.keys(progress.byCategory).map((category) => (
          <CategoryCard
            key={category}
            category={category}
            progress={getCategoryProgress(category)}
          />
        ))}
      </View>
    </ScrollView>
  );
};
