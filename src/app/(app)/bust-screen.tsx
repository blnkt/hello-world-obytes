import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

export interface BustConsequence {
  itemsLost: number;
  energyLost: number;
  xpPreserved: boolean;
  xpAmount: number;
  message: string;
}

export interface BustScreenProps {
  /** Consequence details from bust */
  consequence: BustConsequence;
  /** Callback when user acknowledges the bust */
  onAcknowledge: () => void;
}

const BustInfoSection: React.FC<{
  title: string;
  value: number | string;
  isLoss?: boolean;
}> = ({ title, value, isLoss = false }) => (
  <View className="mb-2 flex-row justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
    <Text className="text-gray-700 dark:text-gray-300">{title}</Text>
    <Text
      className={`font-semibold ${isLoss ? 'text-red-600' : 'text-green-600'}`}
    >
      {isLoss && '-'}
      {value}
    </Text>
  </View>
);

export default function BustScreen() {
  const router = useRouter();
  const params = router.params as any;

  // Default consequence if none provided
  const consequence: BustConsequence = params?.consequence || {
    itemsLost: 0,
    energyLost: 0,
    xpPreserved: true,
    xpAmount: 0,
    message: 'You pushed too deep and could not afford to return.',
  };

  const handleAcknowledge = () => {
    // Mark run as busted and update status
    // TODO: Implement actual bust handling logic
    router.push('/(app)/run-queue');
  };

  return (
    <ScrollView className="flex-1 bg-red-50 dark:bg-red-900/20">
      <View className="p-6">
        <View className="mx-auto max-w-2xl">
          {/* Header */}
          <View className="mb-6 items-center">
            <View className="mb-4 size-20 items-center justify-center rounded-full bg-red-500">
              <Text className="text-5xl">⚠️</Text>
            </View>
            <Text className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
              You Busted!
            </Text>
            <Text className="text-center text-gray-600 dark:text-gray-400">
              You pushed too deep and could not afford to return.
            </Text>
          </View>

          {/* Consequence Details */}
          <View className="mb-6 rounded-xl bg-white p-6 dark:bg-gray-800">
            <Text className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              What Happened
            </Text>

            <View className="mb-4 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
              <Text className="font-medium text-red-800 dark:text-red-300">
                {consequence.message}
              </Text>
            </View>

            <View className="mb-4 border-b border-gray-200 pb-4 dark:border-gray-700">
              <Text className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300">
                Losses
              </Text>
              <BustInfoSection
                title="Items Lost"
                value={consequence.itemsLost}
                isLoss
              />
              <BustInfoSection
                title="Energy Lost"
                value={consequence.energyLost}
                isLoss
              />
            </View>

            {consequence.xpPreserved && (
              <View className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                <Text className="mb-2 text-lg font-semibold text-green-700 dark:text-green-300">
                  Progress Preserved
                </Text>
                <BustInfoSection
                  title="XP Gained (Preserved)"
                  value={consequence.xpAmount}
                  isLoss={false}
                />
                <Text className="mt-2 text-sm text-green-700 dark:text-green-300">
                  All XP from your steps is preserved. You still progress towards
                  next level!
                </Text>
              </View>
            )}
          </View>

          {/* Continue Button */}
          <Pressable
            onPress={handleAcknowledge}
            className="rounded-lg bg-blue-600 px-8 py-4"
            testID="acknowledge-bust"
          >
            <Text className="text-center text-lg font-semibold text-white">
              Return to Run Queue
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

