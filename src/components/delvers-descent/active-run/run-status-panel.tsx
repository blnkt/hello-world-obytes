import React from 'react';
import { Text, View } from 'react-native';

export interface RunStatusPanelProps {
  energyRemaining: number;
  returnCost: number;
  currentDepth: number;
}

const SafetyMarginIndicator: React.FC<{
  energyRemaining: number;
  returnCost: number;
}> = ({ energyRemaining, returnCost }) => {
  const safetyMargin = energyRemaining - returnCost;
  const safetyPercentage =
    returnCost > 0 ? (safetyMargin / returnCost) * 100 : 0;

  let color = 'bg-gray-500';
  let status = 'Unknown';

  if (safetyMargin < 0) {
    color = 'bg-red-500';
    status = 'Danger - Cannot return!';
  } else if (safetyMargin < returnCost * 0.3) {
    color = 'bg-red-400';
    status = 'Danger';
  } else if (safetyMargin < returnCost * 0.6) {
    color = 'bg-yellow-500';
    status = 'Caution';
  } else {
    color = 'bg-green-500';
    status = 'Safe';
  }

  return (
    <View className="mb-2 flex-row items-center justify-between">
      <Text className="text-sm text-gray-600 dark:text-gray-400">
        Safety Margin
      </Text>
      <View className="flex-row items-center">
        <View className={`mr-2 size-3 rounded-full ${color}`} />
        <Text className="text-sm font-semibold text-gray-900 dark:text-white">
          {status}
        </Text>
      </View>
    </View>
  );
};

export const RunStatusPanel: React.FC<RunStatusPanelProps> = ({
  energyRemaining,
  returnCost,
  currentDepth,
}) => {
  const safetyMargin = energyRemaining - returnCost;

  return (
    <View className="mb-4 rounded-xl bg-white p-4 dark:bg-gray-800">
      <Text className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
        Run Status
      </Text>

      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-sm text-gray-600 dark:text-gray-400">
          Current Depth
        </Text>
        <Text className="text-sm font-semibold text-gray-900 dark:text-white">
          {currentDepth}
        </Text>
      </View>

      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-sm text-gray-600 dark:text-gray-400">
          Energy Remaining
        </Text>
        <Text className="text-sm font-semibold text-gray-900 dark:text-white">
          {energyRemaining}
        </Text>
      </View>

      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-sm text-gray-600 dark:text-gray-400">
          Return Cost
        </Text>
        <Text className="text-sm font-semibold text-orange-600">
          {returnCost}
        </Text>
      </View>

      <SafetyMarginIndicator
        energyRemaining={energyRemaining}
        returnCost={returnCost}
      />

      <View className="mt-2 flex-row items-center justify-between">
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          Remaining after return
        </Text>
        <Text
          className={`text-xs font-semibold ${safetyMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}
        >
          {safetyMargin >= 0 ? '+' : ''}
          {safetyMargin}
        </Text>
      </View>
    </View>
  );
};
