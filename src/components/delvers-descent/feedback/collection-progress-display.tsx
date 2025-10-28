/**
 * Collection Progress Display
 * UI component for displaying collection progress
 */

import { Text, View } from 'react-native';

import type { ProgressSummary } from '@/lib/delvers-descent/collection-progress-feedback';

interface CollectionProgressDisplayProps {
  summary: ProgressSummary;
}

export function CollectionProgressDisplay({
  summary,
}: CollectionProgressDisplayProps) {
  return (
    <View className="rounded-lg bg-blue-50 p-4">
      <Text className="text-lg font-semibold text-blue-900">
        Collection Progress
      </Text>
      <Text className="mt-2 text-blue-700">{summary.message}</Text>
      <View className="mt-4">
        <View className="h-2 overflow-hidden rounded-full bg-blue-200">
          <View
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${summary.completionPercentage}%` }}
          />
        </View>
      </View>
    </View>
  );
}
