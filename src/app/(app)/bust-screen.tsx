import { useLocalSearchParams, useRouter } from 'expo-router';
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
  const params = useLocalSearchParams();
  
  // Parse consequence from route params
  let consequence: BustConsequence;
  try {
    consequence = params.consequence 
      ? JSON.parse(params.consequence as string)
      : {
          itemsLost: 0,
          energyLost: 0,
          xpPreserved: true,
          xpAmount: 0,
          message: 'You pushed too deep and could not afford to return.',
        };
  } catch {
    consequence = {
      itemsLost: 0,
      energyLost: 0,
      xpPreserved: true,
      xpAmount: 0,
      message: 'You pushed too deep and could not afford to return.',
    };
  }

  const handleAcknowledge = async () => {
    try {
      const { getRunQueueManager } = await import('@/lib/delvers-descent/run-queue');
      const { getRunStateManager } = await import('@/lib/delvers-descent/run-state-manager');
      const { AchievementManager } = await import('@/lib/delvers-descent/achievement-manager');
      const { ALL_ACHIEVEMENTS } = await import('@/lib/delvers-descent/achievement-types');
      
      const runQueueManager = getRunQueueManager();
      const runStateManager = getRunStateManager();
      const achievementManager = new AchievementManager(ALL_ACHIEVEMENTS);
      
      // Load saved achievement state before processing new events
      await achievementManager.loadSavedState();

      // Try to bust the run (if there's an active state)
      try {
        const bustResult = await runStateManager.bustRun();
        
        // Process depth achievement even on bust
        achievementManager.processEvent({
          type: 'depth_reached',
          data: {
            depth: bustResult.deepestDepth,
            cashOut: false,
          },
          timestamp: new Date(),
        });

        // Save achievements
        const { saveAchievements } = await import('@/lib/delvers-descent/achievement-persistence');
        await saveAchievements(achievementManager);
      } catch (error) {
        // If there's no active run state, that's okay - we still need to update the run queue
        console.log('No active run state to bust:', error);
      }

      // Get the run ID from params if available
      // Note: We need to get the active run ID from somewhere - for now, mark the most recent active run as busted
      const activeRuns = runQueueManager.getRunsByStatus('active');
      if (activeRuns.length > 0) {
        // Mark the first active run as busted (should only be one)
        runQueueManager.updateRunStatus(activeRuns[0].id, 'busted');
      }

      router.push('/(app)/run-queue');
    } catch (error) {
      console.error('Failed to process bust:', error);
      router.push('/(app)/run-queue');
    }
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

