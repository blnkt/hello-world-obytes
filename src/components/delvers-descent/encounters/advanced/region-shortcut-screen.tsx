import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import {
  type RegionShortcutEncounter,
  type RegionShortcutOutcome,
  type RegionShortcutState,
} from '@/lib/delvers-descent/region-shortcut-encounter';

export interface RegionShortcutScreenProps {
  /** The region shortcut encounter state */
  encounter: RegionShortcutEncounter;
  /** Callback when encounter completes - includes targetRegionId */
  onComplete: (outcome: RegionShortcutOutcome) => void;
  /** Callback to return to map */
  onReturn: () => void;
}

const RegionShortcutHeader: React.FC<{
  config: RegionShortcutState['config'];
}> = ({ config }) => (
  <View className="mb-6">
    <View className="mx-auto mb-4 size-20 items-center justify-center rounded-full bg-purple-500">
      <Text className="text-5xl text-white">🌀</Text>
    </View>
    <Text className="text-center text-3xl font-bold text-gray-800">
      Region Shortcut
    </Text>
    <Text className="mt-2 text-center text-gray-600">{config.description}</Text>
  </View>
);

const RegionShortcutDestination: React.FC<{
  targetRegion: RegionShortcutState['config']['targetRegion'];
}> = ({ targetRegion }) => (
  <View className="mb-6 rounded-lg bg-purple-50 p-6">
    <Text className="mb-4 text-lg font-semibold text-purple-800">
      Destination
    </Text>
    <View className="rounded bg-white p-4">
      <Text className="mb-2 text-xl font-bold text-purple-600">
        {targetRegion.name}
      </Text>
      <Text className="mb-3 text-gray-700">{targetRegion.description}</Text>
      <View className="mt-3 border-t border-gray-200 pt-3">
        <Text className="mb-1 text-sm font-semibold text-gray-600">
          Starting Bonuses:
        </Text>
        <Text className="text-sm text-gray-700">
          +{targetRegion.startingBonus.energyBonus} Energy, +
          {targetRegion.startingBonus.itemsBonus} Items
        </Text>
      </View>
    </View>
  </View>
);

const RegionShortcutActions: React.FC<{
  onUseShortcut: () => void;
  onReturn: () => void;
}> = ({ onUseShortcut, onReturn }) => (
  <View className="gap-4">
    <Pressable
      testID="use-shortcut-button"
      onPress={onUseShortcut}
      className="w-full rounded-lg bg-purple-600 px-6 py-3"
    >
      <Text className="text-center text-lg font-semibold text-white">
        Use Shortcut
      </Text>
      <Text className="mt-1 text-center text-sm text-purple-100">
        Travel to the new region
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

export const RegionShortcutScreen: React.FC<RegionShortcutScreenProps> = ({
  encounter,
  onComplete,
  onReturn,
}) => {
  const state = encounter.getState();

  const handleUseShortcut = () => {
    const result = encounter.complete();
    onComplete(result);
  };

  return (
    <ScrollView className="min-h-screen bg-gray-50 p-6">
      <View className="mx-auto max-w-2xl">
        <RegionShortcutHeader config={state.config} />
        <RegionShortcutDestination targetRegion={state.config.targetRegion} />
        <RegionShortcutActions
          onUseShortcut={handleUseShortcut}
          onReturn={onReturn}
        />
      </View>
    </ScrollView>
  );
};
