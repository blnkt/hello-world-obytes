import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function ActiveRunRoute() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const runId = params.id as string;

  // TODO: Implement full active run screen
  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="p-4">
        <Text className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          Active Run
        </Text>
        <Text className="mb-2 text-gray-600 dark:text-gray-400">
          Run ID: {runId || 'No run selected'}
        </Text>
        <Text className="mb-4 text-gray-600 dark:text-gray-400">
          This is a placeholder. The interactive map will be implemented next.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="rounded-lg bg-blue-500 py-3"
        >
          <Text className="text-center font-semibold text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
