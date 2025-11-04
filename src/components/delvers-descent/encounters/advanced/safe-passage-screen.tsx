import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import {
  type AdvancedEncounterOutcome,
  type SafePassageEncounter,
  type SafePassageState,
} from '@/lib/delvers-descent/safe-passage-encounter';

export interface SafePassageScreenProps {
  /** The safe passage encounter state */
  encounter: SafePassageEncounter;
  /** Callback when encounter completes - immediately triggers cash out */
  onComplete: (outcome: AdvancedEncounterOutcome) => void;
  /** Callback to return to map */
  onReturn: () => void;
}

const SafePassageHeader: React.FC<{ config: SafePassageState['config'] }> = ({
  config,
}) => (
  <View className="mb-6">
    <View className="mx-auto mb-4 size-20 items-center justify-center rounded-full bg-blue-500">
      <Text className="text-5xl text-white">🚪</Text>
    </View>
    <Text className="text-center text-3xl font-bold text-gray-800">
      Safe Passage
    </Text>
    <Text className="mt-2 text-center text-gray-600">{config.description}</Text>
  </View>
);

const SafePassageBenefits: React.FC = () => (
  <View className="mb-6 rounded-lg bg-blue-50 p-6">
    <Text className="mb-4 text-lg font-semibold text-blue-800">
      Special Benefit
    </Text>
    <View className="rounded bg-white p-4">
      <Text className="mb-2 text-lg font-bold text-blue-600">
        ✨ Free Return to Surface
      </Text>
      <Text className="text-gray-700">
        This passage offers a safe route back to the surface. You can return
        without spending any energy, making it a valuable escape route if you're
        running low on energy or want to secure your current progress.
      </Text>
    </View>
  </View>
);

const SafePassageActions: React.FC<{
  onUsePassage: () => void;
  onReturn: () => void;
}> = ({ onUsePassage, onReturn }) => (
  <View className="gap-4">
    <Pressable
      testID="use-passage-button"
      onPress={onUsePassage}
      className="w-full rounded-lg bg-blue-600 px-6 py-3"
    >
      <Text className="text-center text-lg font-semibold text-white">
        Use Safe Passage
      </Text>
      <Text className="mt-1 text-center text-sm text-blue-100">
        Return to surface at no cost
      </Text>
    </Pressable>
    <Pressable
      testID="return-button"
      onPress={onReturn}
      className="w-full rounded-lg bg-gray-400 px-6 py-3"
    >
      <Text className="text-center text-white">Return to Map</Text>
    </Pressable>
  </View>
);

export const SafePassageScreen: React.FC<SafePassageScreenProps> = ({
  encounter,
  onComplete,
  onReturn,
}) => {
  const state = encounter.getState();

  const handleUsePassage = () => {
    const result = encounter.complete();
    // Immediately trigger cash out - skip outcome display
    onComplete(result);
  };

  return (
    <ScrollView className="min-h-screen bg-gray-50 p-6">
      <View className="mx-auto max-w-2xl">
        <SafePassageHeader config={state.config} />
        <SafePassageBenefits />
        <SafePassageActions
          onUsePassage={handleUsePassage}
          onReturn={onReturn}
        />
      </View>
    </ScrollView>
  );
};
