import { Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { RunQueueScreen } from '@/components/delvers-descent/run-queue/run-queue-screen';

export default function RunQueueRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Run Queue',
          headerShown: true,
        }}
      />
      <View className="flex-1">
        <RunQueueScreen />
      </View>
    </>
  );
}
