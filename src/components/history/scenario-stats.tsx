import React from 'react';
import { Text, View } from 'react-native';

import colors from '@/components/ui/colors';
import type { ScenarioHistory } from '@/types/scenario';

import { MerchantIcon, MonsterIcon } from '../ui/icons';

const ScenarioStats: React.FC<{
  history: ScenarioHistory[];
}> = ({ history }) => {
  const merchantCount = history.filter(
    (h: ScenarioHistory) => h.type === 'merchant'
  ).length;
  const monsterCount = history.filter(
    (h: ScenarioHistory) => h.type === 'monster'
  ).length;
  const totalCount = history.length;

  return (
    <View className="space-y-4">
      {/* Summary Cards */}
      <View className="flex-row space-x-3">
        <View className="flex-1 rounded-lg bg-blue-100 p-3 dark:bg-blue-900">
          <Text className="text-center text-2xl font-bold text-blue-600 dark:text-blue-300">
            {totalCount}
          </Text>
          <Text className="text-center text-xs text-blue-600 dark:text-blue-300">
            Total
          </Text>
        </View>
        <View className="flex-1 rounded-lg bg-green-100 p-3 dark:bg-green-900">
          <Text className="text-center text-2xl font-bold text-green-600 dark:text-green-300">
            {merchantCount}
          </Text>
          <Text className="text-center text-xs text-green-600 dark:text-green-300">
            Merchants
          </Text>
        </View>
        <View className="flex-1 rounded-lg bg-red-100 p-3 dark:bg-red-900">
          <Text className="text-center text-2xl font-bold text-red-600 dark:text-red-300">
            {monsterCount}
          </Text>
          <Text className="text-center text-xs text-red-600 dark:text-red-300">
            Monsters
          </Text>
        </View>
      </View>

      {/* Recent Activity */}
      <View className="rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800">
        <Text className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Recent Activity
        </Text>
        {history.slice(0, 3).map((entry) => (
          <View key={entry.id} className="mb-2 flex-row items-center">
            {entry.type === 'merchant' ? (
              <MerchantIcon
                color={colors.success[500]}
                width={16}
                height={16}
              />
            ) : (
              <MonsterIcon color={colors.danger[500]} width={16} height={16} />
            )}
            <Text className="ml-2 flex-1 text-xs text-gray-600 dark:text-gray-300">
              {entry.title}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(entry.visitedAt).toLocaleDateString()}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default ScenarioStats;
