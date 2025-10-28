import React from 'react';
import { Text, View } from 'react-native';

export interface EnergyCostDisplayProps {
  currentEnergy: number;
  totalEnergy: number;
  actionCost?: number;
}

/**
 * EnergyCostDisplay - Visual energy cost visualization
 *
 * Displays current energy, total energy, and the cost of actions
 * with visual indicators and warnings for low energy states.
 */
export const EnergyCostDisplay: React.FC<EnergyCostDisplayProps> = ({
  currentEnergy,
  totalEnergy,
  actionCost,
}) => {
  const energyPercentage = (currentEnergy / totalEnergy) * 100;
  const isLowEnergy = energyPercentage < 20;
  const isCriticalEnergy = energyPercentage < 10;

  const getEnergyColor = () => {
    if (isCriticalEnergy) return 'bg-red-500';
    if (isLowEnergy) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getRemainingEnergy = () => {
    if (actionCost) {
      return currentEnergy - actionCost;
    }
    return currentEnergy;
  };

  return (
    <View testID="energy-cost-display" className="rounded-lg bg-white p-4">
      <View className="mb-4">
        <Text className="mb-2 text-sm font-semibold text-gray-700">
          Energy Status
        </Text>

        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-gray-800">
            {currentEnergy} / {totalEnergy}
          </Text>
          <View className={`rounded-full px-3 py-1 ${getEnergyColor()}`}>
            <Text className="text-xs font-semibold text-white">
              {Math.round(energyPercentage)}%
            </Text>
          </View>
        </View>

        <View className="h-3 overflow-hidden rounded-full bg-gray-200">
          <View
            className={`h-full transition-all ${getEnergyColor()}`}
            style={{ width: `${energyPercentage}%` }}
          />
        </View>
      </View>

      {actionCost !== undefined && (
        <View className="rounded-lg border-2 border-gray-200 p-3">
          <Text className="mb-2 text-sm font-semibold text-gray-700">
            Action Cost
          </Text>
          <Text className="text-2xl font-bold text-gray-800">
            -{actionCost}
          </Text>
          <Text className="mt-1 text-xs text-gray-600">
            Remaining: {getRemainingEnergy()} energy
          </Text>
        </View>
      )}
    </View>
  );
};
