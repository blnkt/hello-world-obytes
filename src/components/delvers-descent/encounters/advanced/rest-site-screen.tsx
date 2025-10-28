import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import {
  type AdvancedEncounterOutcome,
  type RestSiteEncounter,
  type RestSiteState,
} from '@/lib/delvers-descent/rest-site-encounter';

export interface RestSiteScreenProps {
  /** The rest site encounter state */
  encounter: RestSiteEncounter;
  /** Callback when encounter completes */
  onComplete: (outcome: AdvancedEncounterOutcome) => void;
  /** Callback to return to map */
  onReturn: () => void;
}

const OutcomeDisplay: React.FC<{
  outcome: AdvancedEncounterOutcome;
  onComplete: (outcome: AdvancedEncounterOutcome) => void;
}> = ({ outcome, onComplete }) => (
  <ScrollView className="min-h-screen bg-gray-50 p-6">
    <View className="mx-auto max-w-2xl">
      <View className="rounded-lg bg-white p-6 shadow-lg">
        <Text className="mb-4 text-2xl font-bold text-gray-800">
          {outcome.type === 'success' ? 'Success!' : 'Failure!'}
        </Text>
        <Text className="mb-6 text-gray-700">{outcome.message}</Text>
        {outcome.reward && (
          <View className="mb-6 rounded bg-green-50 p-4">
            <Text className="mb-2 font-semibold text-green-800">Rewards</Text>
            <Text className="text-green-700">
              Energy: +{outcome.reward.energy}
            </Text>
            <Text className="text-green-700">XP: +{outcome.reward.xp}</Text>
          </View>
        )}
        <Pressable
          onPress={() => onComplete(outcome)}
          className="w-full rounded-lg bg-blue-600 px-4 py-3"
        >
          <Text className="text-center text-white">Continue</Text>
        </Pressable>
      </View>
    </View>
  </ScrollView>
);

const RestSiteHeader: React.FC = () => (
  <View className="mb-6">
    <View className="mx-auto mb-4 size-20 items-center justify-center rounded-full bg-green-500">
      <Text className="text-5xl text-white">🛌</Text>
    </View>
    <Text className="text-center text-3xl font-bold text-gray-800">
      Rest Site
    </Text>
    <Text className="mt-2 text-center text-gray-600">
      A safe haven where you can recover energy and gain strategic intel.
    </Text>
  </View>
);

const RestSiteBenefits: React.FC<{
  energyReserve: RestSiteState['config']['energyReserve'];
  strategicIntel: RestSiteState['config']['strategicIntel'];
}> = ({ energyReserve, strategicIntel }) => (
  <View className="mb-6 rounded-lg bg-green-50 p-6">
    <Text className="mb-4 text-lg font-semibold text-green-800">
      Available Benefits
    </Text>
    <View className="gap-3">
      <View className="flex-row items-center justify-between rounded bg-white p-3">
        <Text className="text-gray-700">Energy Reserve:</Text>
        <Text className="font-bold text-green-600">
          {energyReserve.currentCapacity}/{energyReserve.maxCapacity}
        </Text>
      </View>
      <View className="flex-row items-center justify-between rounded bg-white p-3">
        <Text className="text-gray-700">Strategic Intel:</Text>
        <Text className="font-bold text-blue-600">
          Map: +{strategicIntel.mapReveals} | Shortcuts: +
          {strategicIntel.shortcutHints} | Warnings: +
          {strategicIntel.hazardWarnings}
        </Text>
      </View>
    </View>
  </View>
);

const RestSiteActions: React.FC<{
  onRest: () => void;
  onReturn: () => void;
}> = ({ onRest, onReturn }) => (
  <View className="gap-4">
    <Pressable
      testID="rest-button"
      onPress={onRest}
      className="w-full rounded-lg bg-green-600 px-6 py-3"
    >
      <Text className="text-center text-lg font-semibold text-white">
        Rest and Recover
      </Text>
    </Pressable>
    <Pressable
      onPress={onReturn}
      className="w-full rounded-lg border-2 border-gray-300 bg-white px-6 py-2"
    >
      <Text className="text-center text-gray-700">Skip Rest</Text>
    </Pressable>
  </View>
);

export const RestSiteScreen: React.FC<RestSiteScreenProps> = ({
  encounter,
  onComplete,
  onReturn,
}) => {
  const [state, setState] = useState<RestSiteState>(encounter.getState());
  const [outcome, setOutcome] = useState<AdvancedEncounterOutcome | null>(null);

  const handleRest = () => {
    const result = encounter.resolve();
    setOutcome(result);
    setState(encounter.getState());
  };

  if (outcome) {
    return <OutcomeDisplay outcome={outcome} onComplete={onComplete} />;
  }

  return (
    <ScrollView
      testID="rest-site-screen"
      className="min-h-screen bg-green-50 p-6"
    >
      <View className="mx-auto max-w-2xl">
        <RestSiteHeader />
        <RestSiteBenefits
          energyReserve={state.config.energyReserve}
          strategicIntel={state.config.strategicIntel}
        />
        <RestSiteActions onRest={handleRest} onReturn={onReturn} />
      </View>
    </ScrollView>
  );
};
