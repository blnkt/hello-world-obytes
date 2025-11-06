import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import {
  type AdvancedEncounterOutcome,
  type LuckShrineEncounter,
  type LuckShrineState,
} from '@/lib/delvers-descent/luck-shrine-encounter';
import type { RunState } from '@/types/delvers-descent';

export interface LuckShrineScreenProps {
  /** The luck shrine encounter state */
  encounter: LuckShrineEncounter;
  /** Current run state to check for existing luck boost */
  runState?: RunState | null;
  /** Callback when encounter completes */
  onComplete: (outcome: AdvancedEncounterOutcome) => void;
  /** Callback to return to map */
  onReturn: () => void;
}

const LuckShrineHeader: React.FC = () => (
  <View className="mb-6">
    <View className="mx-auto mb-4 size-20 items-center justify-center rounded-full bg-purple-500">
      <Text className="text-5xl text-white">✨</Text>
    </View>
    <Text className="text-center text-3xl font-bold text-gray-800">
      Luck Shrine
    </Text>
    <Text className="mt-2 text-center text-gray-600">
      An ancient shrine that can bless your next encounters with increased
      reward multipliers.
    </Text>
  </View>
);

const MultiplierDisplay: React.FC<{
  currentMultiplier: number;
  boostedMultiplier: number;
  duration: number;
}> = ({ currentMultiplier, boostedMultiplier, duration }) => (
  <View className="mb-6 rounded-lg bg-purple-50 p-6">
    <Text className="mb-4 text-lg font-semibold text-purple-800">
      Luck Boost Effect
    </Text>
    <View className="gap-4">
      <View className="flex-row items-center justify-between rounded bg-white p-4">
        <Text className="text-gray-700">Current Multiplier:</Text>
        <Text className="text-xl font-bold text-gray-800">
          {currentMultiplier.toFixed(1)}x
        </Text>
      </View>
      <View className="flex-row items-center justify-between rounded bg-purple-100 p-4">
        <Text className="font-semibold text-purple-800">
          Boosted Multiplier:
        </Text>
        <Text className="text-2xl font-bold text-purple-600">
          {boostedMultiplier.toFixed(1)}x
        </Text>
      </View>
      <View className="rounded bg-white p-4">
        <Text className="mb-2 text-gray-700">Boost Duration:</Text>
        <Text className="text-lg font-bold text-purple-600">
          {duration} encounter{duration !== 1 ? 's' : ''}
        </Text>
        <Text className="mt-1 text-sm text-gray-600">
          The luck boost will apply to your next {duration} encounter
          {duration !== 1 ? 's' : ''} after activation.
        </Text>
      </View>
    </View>
  </View>
);

const LuckShrineActions: React.FC<{
  onActivate: () => void;
  onReturn: () => void;
}> = ({ onActivate, onReturn }) => (
  <View className="gap-4">
    <Pressable
      testID="activate-shrine-button"
      onPress={onActivate}
      className="w-full rounded-lg bg-purple-600 px-6 py-3"
    >
      <Text className="text-center text-lg font-semibold text-white">
        Activate Shrine
      </Text>
      <Text className="mt-1 text-center text-sm text-purple-100">
        Activate the luck boost blessing
      </Text>
    </Pressable>
    <Pressable
      testID="return-button"
      onPress={onReturn}
      className="w-full rounded-lg border-2 border-gray-300 bg-white px-6 py-2"
    >
      <Text className="text-center text-gray-700">Return to Map</Text>
    </Pressable>
  </View>
);

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
        <Pressable
          onPress={() => onComplete(outcome)}
          className="w-full rounded-lg bg-purple-600 px-4 py-3"
        >
          <Text className="text-center text-white">Continue</Text>
        </Pressable>
      </View>
    </View>
  </ScrollView>
);

export const LuckShrineScreen: React.FC<LuckShrineScreenProps> = ({
  encounter,
  runState,
  onComplete,
  onReturn,
}) => {
  const [state, setState] = useState<LuckShrineState>(encounter.getState());
  const [outcome, setOutcome] = useState<AdvancedEncounterOutcome | null>(null);
  const [isActivating, setIsActivating] = useState(false);

  // Calculate current multiplier (base 1.0, plus any existing luck boost)
  const currentMultiplier = runState?.luckBoostActive
    ? 1.0 + runState.luckBoostActive.multiplierBonus
    : 1.0;

  // Calculate boosted multiplier (current + new bonus)
  const boostedMultiplier = currentMultiplier + state.config.multiplierBonus;

  const handleActivate = async () => {
    if (isActivating || state.isResolved) {
      return;
    }

    setIsActivating(true);
    try {
      const result = await encounter.activate();
      setOutcome(result);
      setState(encounter.getState());
    } catch (error) {
      console.error('Failed to activate luck shrine:', error);
    } finally {
      setIsActivating(false);
    }
  };

  if (outcome) {
    return <OutcomeDisplay outcome={outcome} onComplete={onComplete} />;
  }

  return (
    <ScrollView
      testID="luck-shrine-screen"
      className="min-h-screen bg-purple-50 p-6"
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
    >
      <View className="mx-auto max-w-2xl">
        <LuckShrineHeader />
        <MultiplierDisplay
          currentMultiplier={currentMultiplier}
          boostedMultiplier={boostedMultiplier}
          duration={state.config.duration}
        />
        <LuckShrineActions onActivate={handleActivate} onReturn={onReturn} />
      </View>
    </ScrollView>
  );
};
