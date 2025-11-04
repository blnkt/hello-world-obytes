import { useFocusEffect } from '@react-navigation/native';
import { Stack } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { ProgressionNavigation } from '@/components/delvers-descent/progression/progression-navigation';
import { getProgressionManager } from '@/lib/delvers-descent/progression-manager';
import type { ProgressionData } from '@/types/delvers-descent';

const ProgressionStatsCard: React.FC<{ progression: ProgressionData }> = ({
  progression,
}) => (
  <View className="mb-6 rounded-lg bg-white p-4 shadow-sm">
    <Text className="mb-4 text-xl font-bold text-gray-800">
      Progression Statistics
    </Text>

    <View className="mb-3 space-y-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-base text-gray-600">All-Time Deepest Depth</Text>
        <Text className="text-lg font-bold text-blue-600">
          {progression.allTimeDeepestDepth}
        </Text>
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-base text-gray-600">Total Runs Completed</Text>
        <Text className="text-lg font-bold text-green-600">
          {progression.totalRunsCompleted}
        </Text>
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-base text-gray-600">Total Runs Busted</Text>
        <Text className="text-lg font-bold text-red-600">
          {progression.totalRunsBusted}
        </Text>
      </View>

      <View className="mt-3 border-t border-gray-200 pt-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-semibold text-gray-800">
            Total Runs Attempted
          </Text>
          <Text className="text-lg font-bold text-gray-800">
            {progression.totalRunsAttempted}
          </Text>
        </View>
      </View>
    </View>
  </View>
);

const InfoMessage: React.FC = () => (
  <View className="rounded-lg bg-blue-50 p-4">
    <Text className="text-sm text-gray-600">
      Individual run records are no longer archived. Progression data (depth
      reached, run counts) is preserved for your overall statistics.
    </Text>
  </View>
);

export default function RunHistoryScreen() {
  const [progression, setProgression] = useState<ProgressionData | null>(null);

  const refreshProgression = useCallback(() => {
    const progressionManager = getProgressionManager();
    setProgression(progressionManager.getProgressionData());
  }, []);

  // Refresh progression data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshProgression();
    }, [refreshProgression])
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Run History',
          headerShown: true,
        }}
      />
      <View className="flex-1 bg-gray-50">
        <ProgressionNavigation currentScreen="run-history" />
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        >
          {progression ? (
            <View className="space-y-4">
              <ProgressionStatsCard progression={progression} />
              <InfoMessage />
            </View>
          ) : (
            <View className="items-center justify-center p-8">
              <Text className="text-lg text-gray-600">Loading...</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}
