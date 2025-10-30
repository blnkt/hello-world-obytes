import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export interface NavigationControlsProps {
  onCashOut: () => void;
  energyRemaining: number;
  returnCost: number;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  onCashOut,
  energyRemaining,
  returnCost,
}) => {
  const canReturn = energyRemaining >= returnCost;
  const isDangerous = energyRemaining < returnCost * 1.5;

  return (
    <View className="gap-3 p-4">
      <TouchableOpacity
        onPress={onCashOut}
        className="rounded-lg bg-green-500 py-3"
        activeOpacity={0.8}
      >
        <Text className="text-center font-semibold text-white">
          💰 Cash Out
        </Text>
      </TouchableOpacity>

      {!canReturn && (
        <View className="rounded-lg bg-red-50 p-3 dark:bg-red-900">
          <Text className="text-center text-sm text-red-800 dark:text-red-200">
            ⚠️ Warning: Insufficient energy to return safely!
          </Text>
        </View>
      )}
    </View>
  );
};
