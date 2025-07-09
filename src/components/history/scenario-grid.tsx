import React from 'react';
import { Text, View } from 'react-native';

import { MerchantIcon, MonsterIcon } from '../ui/icons';

const ScenarioGrid: React.FC<{
  history: any[];
}> = ({ history }) => (
  <View className="flex-row flex-wrap justify-between">
    {history.map((entry) => (
      <View
        key={entry.id}
        className="mb-3 w-[48%] rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800"
      >
        <View className="mb-2 items-center">
          {entry.type === 'merchant' ? (
            <MerchantIcon color="#10B981" width={32} height={32} />
          ) : (
            <MonsterIcon color="#EF4444" width={32} height={32} />
          )}
        </View>
        <Text className="text-center text-xs font-medium text-gray-900 dark:text-white">
          {entry.title}
        </Text>
        <Text className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
          {new Date(entry.visitedAt).toLocaleDateString()}
        </Text>
      </View>
    ))}
  </View>
);

export default ScenarioGrid;
