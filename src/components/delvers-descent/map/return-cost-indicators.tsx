import React from 'react';
import { Text, View } from 'react-native';

export interface ReturnCostIndicatorsProps {
  currentEnergy: number;
  returnCost: number;
  depth: number;
}

/**
 * ReturnCostIndicators - Visual return cost and safety margin display
 *
 * Displays the return cost to surface, safety margin (remaining energy),
 * warnings for low/critical safety margins, and recommended actions.
 */
export const ReturnCostIndicators: React.FC<ReturnCostIndicatorsProps> = ({
  currentEnergy,
  returnCost,
  depth,
}) => {
  const safetyMargin = currentEnergy - returnCost;
  const isSafe = safetyMargin > 20;
  const isLow = safetyMargin >= 0 && safetyMargin <= 20;
  const isCritical = safetyMargin < 0;

  const getSafetyColor = () => {
    if (isCritical) return 'bg-red-500';
    if (isLow) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getRecommendedAction = () => {
    if (isCritical) return '⚠️ Critical: Return immediately!';
    if (isLow) return '⚠️ Low safety: Consider returning soon';
    return '✓ Safe to continue exploring';
  };

  return (
    <View testID="return-cost-indicators" className="rounded-lg bg-white p-4">
      <Text className="mb-3 text-lg font-bold text-gray-800">
        Return Journey
      </Text>

      <View className="mb-3 flex-row items-center justify-between rounded-lg bg-gray-50 p-3">
        <Text className="text-sm font-semibold text-gray-700">
          Current Depth
        </Text>
        <Text className="text-lg font-bold text-gray-800">Depth {depth}</Text>
      </View>

      <View className="mb-3 flex-row items-center justify-between rounded-lg bg-blue-50 p-3">
        <Text className="text-sm font-semibold text-gray-700">Return Cost</Text>
        <Text className="text-lg font-bold text-blue-600">{returnCost}</Text>
      </View>

      <View className="mb-3 flex-row items-center justify-between rounded-lg bg-gray-50 p-3">
        <Text className="text-sm font-semibold text-gray-700">
          Current Energy
        </Text>
        <Text className="text-lg font-bold text-gray-800">{currentEnergy}</Text>
      </View>

      <View
        className={`mb-3 flex-row items-center justify-between rounded-lg p-3 ${getSafetyColor()}`}
      >
        <Text className="text-sm font-semibold text-white">Safety Margin</Text>
        <Text className="text-lg font-bold text-white">{safetyMargin}</Text>
      </View>

      <View className="rounded-lg border-2 border-gray-200 p-3">
        <Text className="text-center text-sm font-semibold text-gray-800">
          {getRecommendedAction()}
        </Text>
      </View>
    </View>
  );
};
