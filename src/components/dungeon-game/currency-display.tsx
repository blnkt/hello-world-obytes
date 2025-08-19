import React from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui';

interface CurrencyDisplayProps {
  currency: number;
  availableTurns: number;
  turnCost: number;
}

// eslint-disable-next-line max-lines-per-function
export default function CurrencyDisplay({
  currency,
  availableTurns,
  turnCost,
}: CurrencyDisplayProps) {
  const getCurrencyStatusColor = () => {
    if (availableTurns < 1) {
      return 'text-red-600 dark:text-red-400';
    }
    if (availableTurns < 3) {
      return 'text-yellow-600 dark:text-yellow-400';
    }
    return 'text-green-600 dark:text-green-400';
  };

  const getTurnStatusColor = () => {
    if (availableTurns < 1) {
      return 'text-red-600 dark:text-red-400';
    }
    if (availableTurns < 3) {
      return 'text-yellow-600 dark:text-yellow-400';
    }
    return 'text-green-600 dark:text-green-400';
  };

  const getStatusIcon = () => {
    if (availableTurns < 1) {
      return '⚠️';
    }
    if (availableTurns < 3) {
      return '⚡';
    }
    return '💰';
  };

  return (
    <View
      className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800"
      accessible={true}
      accessibilityLabel={`Currency and Turns - ${availableTurns} turns available`}
      accessibilityRole="summary"
    >
      {/* Header with Status Icon */}
      <View className="mb-3 flex-row items-center justify-between">
        <Text
          className="text-lg font-bold text-gray-900 dark:text-white"
          accessibilityRole="header"
        >
          Currency & Turns
        </Text>
        <Text
          className="text-2xl"
          accessibilityLabel={`Status icon: ${getStatusIcon()}`}
        >
          {getStatusIcon()}
        </Text>
      </View>

      {/* Currency Information */}
      <View className="mb-3 space-y-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-gray-600 dark:text-gray-300">
            Current Balance:
          </Text>
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {currency} steps
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-gray-600 dark:text-gray-300">
            Turn Cost:
          </Text>
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {turnCost} steps
          </Text>
        </View>
      </View>

      {/* Available Turns */}
      <View className="mb-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-gray-600 dark:text-gray-300">
            Available Turns:
          </Text>
          <Text className={`text-xl font-bold ${getTurnStatusColor()}`}>
            {availableTurns}
          </Text>
        </View>
      </View>

      {/* Status Indicator */}
      {availableTurns < 1 && (
        <View
          className="rounded-lg bg-red-100 p-3 dark:bg-red-900/20"
          accessible={true}
          accessibilityLabel="Insufficient currency warning"
          accessibilityRole="alert"
        >
          <Text className="text-center text-sm font-medium text-red-800 dark:text-red-200">
            Insufficient currency to play
          </Text>
          <Text className="text-center text-xs text-red-600 dark:text-red-300">
            Need at least {turnCost} steps
          </Text>
        </View>
      )}

      {availableTurns >= 1 && availableTurns < 3 && (
        <View
          className="rounded-lg bg-yellow-100 p-3 dark:bg-yellow-900/20"
          accessible={true}
          accessibilityLabel="Low currency warning"
          accessibilityRole="alert"
        >
          <Text className="text-center text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Low currency warning
          </Text>
          <Text className="text-center text-xs text-yellow-600 dark:text-yellow-300">
            Only {availableTurns} turns remaining
          </Text>
        </View>
      )}

      {availableTurns >= 3 && (
        <View
          className="rounded-lg bg-green-100 p-3 dark:bg-green-900/20"
          accessible={true}
          accessibilityLabel="Ready to play status"
          accessibilityRole="text"
        >
          <Text className="text-center text-sm font-medium text-green-800 dark:text-green-200">
            Ready to play
          </Text>
          <Text className="text-center text-xs text-green-600 dark:text-green-300">
            {availableTurns} turns available
          </Text>
        </View>
      )}
    </View>
  );
}
