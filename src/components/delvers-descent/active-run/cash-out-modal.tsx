import React from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import type { CollectedItem, RunState } from '@/types/delvers-descent';

export interface CashOutModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Current run state */
  runState: RunState;
  /** Function to calculate return cost */
  returnCost: number;
  /** Callback when user confirms cash out */
  onConfirm: () => void;
  /** Callback when user cancels */
  onCancel: () => void;
}

const RewardSummary: React.FC<{
  inventory: CollectedItem[];
}> = ({ inventory }) => {
  if (inventory.length === 0) {
    return (
      <View className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
        <Text className="text-center text-gray-600 dark:text-gray-400">
          No items to cash out
        </Text>
      </View>
    );
  }

  const totalValue = inventory.reduce((sum, item) => sum + item.value, 0);

  return (
    <View>
      <Text className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
        Items to Cash Out ({inventory.length})
      </Text>
      <ScrollView className="max-h-48" testID="cash-out-items-list">
        {inventory.map((item, index) => (
          <View
            key={item.id || index}
            className="mb-2 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
          >
            <Text className="font-semibold text-gray-900 dark:text-white">
              {item.name}
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Value: {item.value}
            </Text>
          </View>
        ))}
      </ScrollView>
      <View className="mt-3 flex-row justify-between border-t border-gray-200 p-2 pt-3 dark:border-gray-700">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white">
          Total Value:
        </Text>
        <Text className="text-lg font-bold text-green-600">{totalValue}</Text>
      </View>
    </View>
  );
};

const SafetySummary: React.FC<{
  energyRemaining: number;
  returnCost: number;
}> = ({ energyRemaining, returnCost }) => {
  const willReturn = energyRemaining >= returnCost;
  const energyAfterReturn = Math.max(0, energyRemaining - returnCost);

  return (
    <View className="mt-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900">
      <Text className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
        Return Summary
      </Text>
      <View className="flex-row justify-between">
        <Text className="text-gray-600 dark:text-gray-400">
          Energy Remaining:
        </Text>
        <Text className="font-semibold text-gray-900 dark:text-white">
          {energyRemaining}
        </Text>
      </View>
      <View className="flex-row justify-between">
        <Text className="text-gray-600 dark:text-gray-400">Return Cost:</Text>
        <Text className="font-semibold text-orange-600">{returnCost}</Text>
      </View>
      <View className="mt-2 flex-row justify-between border-t border-gray-300 pt-2 dark:border-gray-600">
        <Text className="text-gray-900 dark:text-white">
          Energy After Return:
        </Text>
        <Text
          className={`font-bold ${willReturn ? 'text-green-600' : 'text-red-600'}`}
        >
          {energyAfterReturn}
        </Text>
      </View>
    </View>
  );
};

export const CashOutModal: React.FC<CashOutModalProps> = ({
  visible,
  runState,
  returnCost,
  onConfirm,
  onCancel,
}) => {
  const canReturn = runState.energyRemaining >= returnCost;
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View className="flex-1 items-center justify-center bg-black/50 p-4">
        <View className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800">
          <ModalBody
            canReturn={canReturn}
            inventory={runState.inventory}
            energyRemaining={runState.energyRemaining}
            returnCost={returnCost}
          />
          <ModalFooter onCancel={onCancel} onConfirm={onConfirm} />
        </View>
      </View>
    </Modal>
  );
};

function ModalBody({
  canReturn,
  inventory,
  energyRemaining,
  returnCost,
}: {
  canReturn: boolean;
  inventory: CollectedItem[];
  energyRemaining: number;
  returnCost: number;
}) {
  return (
    <ScrollView
      className="max-h-96"
      contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: 20 }}
    >
      <Text className="mb-4 text-center text-3xl">💰</Text>
      <Text className="mb-2 text-center text-2xl font-bold text-gray-900 dark:text-white">
        Cash Out?
      </Text>
      <Text className="mb-6 text-center text-gray-600 dark:text-gray-400">
        Bank your rewards and return to the surface safely.
      </Text>
      <RewardSummary inventory={inventory} />
      <SafetySummary
        energyRemaining={energyRemaining}
        returnCost={returnCost}
      />
      {!canReturn && (
        <View className="mt-4 rounded-lg bg-red-50 p-3 dark:bg-red-900">
          <Text className="text-center text-sm font-semibold text-red-800 dark:text-red-200">
            ⚠️ Warning: Cannot return safely! You may lose progress.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function ModalFooter({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <View className="flex-row gap-3 border-t border-gray-200 p-4 dark:border-gray-700">
      <Pressable
        onPress={onCancel}
        className="flex-1 rounded-lg border-2 border-gray-300 bg-white py-3 dark:border-gray-600 dark:bg-gray-700"
        testID="cancel-cash-out"
      >
        <Text className="text-center font-semibold text-gray-700 dark:text-gray-200">
          Cancel
        </Text>
      </Pressable>
      <Pressable
        onPress={onConfirm}
        className="flex-1 rounded-lg bg-green-500 py-3"
        testID="confirm-cash-out"
      >
        <Text className="text-center font-semibold text-white">Cash Out</Text>
      </Pressable>
    </View>
  );
}
