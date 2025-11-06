import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import {
  type AdvancedEncounterOutcome,
  type FateWeaverEncounter,
  type FateWeaverState,
} from '@/lib/delvers-descent/fate-weaver-encounter';
import type { EncounterType } from '@/types/delvers-descent';

export interface FateWeaverScreenProps {
  /** The fate weaver encounter state */
  encounter: FateWeaverEncounter;
  /** Callback when encounter completes */
  onComplete: (outcome: AdvancedEncounterOutcome) => void;
  /** Callback to return to map */
  onReturn: () => void;
}

const FateWeaverHeader: React.FC = () => (
  <View className="mb-6">
    <View className="mx-auto mb-4 size-20 items-center justify-center rounded-full bg-indigo-500">
      <Text className="text-5xl text-white">🔮</Text>
    </View>
    <Text className="text-center text-3xl font-bold text-gray-800">
      Fate Weaver
    </Text>
    <Text className="mt-2 text-center text-gray-600">
      A mystical entity that can alter the probabilities of future encounters.
    </Text>
  </View>
);

const SelectedTypesDisplay: React.FC<{
  selectedTypes: EncounterType[];
}> = ({ selectedTypes }) => (
  <View className="mb-6 rounded-lg bg-indigo-50 p-6">
    <Text className="mb-4 text-lg font-semibold text-indigo-800">
      Selected Encounter Types
    </Text>
    <View className="gap-2">
      {selectedTypes.map((type) => (
        <View key={type} className="rounded bg-white p-3">
          <Text className="font-semibold text-gray-800">
            {type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
          </Text>
        </View>
      ))}
    </View>
    <Text className="mt-4 text-sm text-gray-600">
      You can modify the probabilities for these 3 encounter types by ±10%
    </Text>
  </View>
);

const ProbabilityDistributionDisplay: React.FC<{
  distribution: Record<EncounterType, number>;
  probabilityChanges: Partial<Record<EncounterType, number>>;
  selectedTypes: EncounterType[];
  title: string;
}> = ({ distribution, probabilityChanges, selectedTypes, title }) => {
  const sortedEntries = Object.entries(distribution).sort(
    ([, a], [, b]) => b - a
  );

  return (
    <View className="mb-6 rounded-lg bg-gray-50 p-6">
      <Text className="mb-4 text-lg font-semibold text-gray-800">{title}</Text>
      <ScrollView className="max-h-64">
        <View className="gap-2">
          {sortedEntries.map(([type, prob]) => {
            const encounterType = type as EncounterType;
            const change = probabilityChanges[encounterType] || 0;
            const newProb = prob + change;
            const isSelected = selectedTypes.includes(encounterType);

            return (
              <View
                key={type}
                className={`flex-row items-center justify-between rounded p-3 ${
                  isSelected ? 'bg-indigo-100' : 'bg-white'
                }`}
              >
                <Text
                  className={`flex-1 ${
                    isSelected
                      ? 'font-semibold text-indigo-800'
                      : 'text-gray-700'
                  }`}
                >
                  {type
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </Text>
                <View className="flex-row items-center gap-2">
                  {change !== 0 && (
                    <Text
                      className={`text-sm font-semibold ${
                        change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {change > 0 ? '+' : ''}
                      {(change * 100).toFixed(1)}%
                    </Text>
                  )}
                  <Text className="text-gray-800">
                    {(newProb * 100).toFixed(1)}%
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const ProbabilityControls: React.FC<{
  selectedTypes: EncounterType[];
  probabilityChanges: Partial<Record<EncounterType, number>>;
  onModify: (type: EncounterType, direction: 'increase' | 'decrease') => void;
}> = ({ selectedTypes, probabilityChanges, onModify }) => (
  <View className="mb-6 rounded-lg bg-indigo-50 p-6">
    <Text className="mb-4 text-lg font-semibold text-indigo-800">
      Modify Probabilities
    </Text>
    <View className="gap-3">
      {selectedTypes.map((type) => {
        const currentChange = probabilityChanges[type] || 0;
        const canIncrease = currentChange < 0.3; // Max +30% (3 clicks)
        const canDecrease = currentChange > -0.3; // Min -30% (3 clicks)

        return (
          <View key={type} className="rounded bg-white p-4">
            <Text className="mb-3 font-semibold text-gray-800">
              {type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </Text>
            <View className="flex-row items-center gap-3">
              <Pressable
                testID={`decrease-${type}-button`}
                onPress={() => onModify(type, 'decrease')}
                disabled={!canDecrease}
                className={`flex-1 rounded px-4 py-2 ${
                  canDecrease ? 'bg-red-600' : 'bg-gray-400 opacity-50'
                }`}
              >
                <Text className="text-center text-white">-10%</Text>
              </Pressable>
              <View className="min-w-[80px] items-center">
                <Text className="text-lg font-bold text-gray-800">
                  {currentChange > 0 ? '+' : ''}
                  {(currentChange * 100).toFixed(0)}%
                </Text>
              </View>
              <Pressable
                testID={`increase-${type}-button`}
                onPress={() => onModify(type, 'increase')}
                disabled={!canIncrease}
                className={`flex-1 rounded px-4 py-2 ${
                  canIncrease ? 'bg-green-600' : 'bg-gray-400 opacity-50'
                }`}
              >
                <Text className="text-center text-white">+10%</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </View>
  </View>
);

const FateWeaverActions: React.FC<{
  onExecute: () => void;
  onReturn: () => void;
  isResolved: boolean;
}> = ({ onExecute, onReturn, isResolved }) => (
  <View className="gap-4">
    <Pressable
      testID="weave-fate-button"
      onPress={onExecute}
      disabled={isResolved}
      className={`w-full rounded-lg px-6 py-3 ${
        isResolved ? 'bg-gray-400 opacity-50' : 'bg-indigo-600'
      }`}
    >
      <Text className="text-center text-lg font-semibold text-white">
        Weave Fate
      </Text>
      <Text className="mt-1 text-center text-sm text-indigo-100">
        Apply probability changes
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
          {outcome.type === 'success' ? 'Fate Woven!' : 'Failure!'}
        </Text>
        <Text className="mb-6 text-gray-700">{outcome.message}</Text>
        <Pressable
          onPress={() => onComplete(outcome)}
          className="w-full rounded-lg bg-indigo-600 px-4 py-3"
        >
          <Text className="text-center text-white">Continue</Text>
        </Pressable>
      </View>
    </View>
  </ScrollView>
);

const useFateWeaverState = (encounter: FateWeaverEncounter) => {
  const [state, setState] = useState<FateWeaverState>(encounter.getState());
  const [outcome, setOutcome] = useState<AdvancedEncounterOutcome | null>(null);

  const handleModify = (
    type: EncounterType,
    direction: 'increase' | 'decrease'
  ) => {
    encounter.modifyProbability(type, direction);
    setState(encounter.getState());
  };

  const handleExecute = async () => {
    if (state.isResolved) return;

    const result = await encounter.execute();
    setOutcome(result);
    setState(encounter.getState());
  };

  const newDistribution = encounter.calculateNewDistribution();

  return {
    state,
    setState,
    outcome,
    setOutcome,
    handleModify,
    handleExecute,
    newDistribution,
  };
};

export const FateWeaverScreen: React.FC<FateWeaverScreenProps> = ({
  encounter,
  onComplete,
  onReturn,
}) => {
  const { state, outcome, handleModify, handleExecute, newDistribution } =
    useFateWeaverState(encounter);

  if (outcome) {
    return <OutcomeDisplay outcome={outcome} onComplete={onComplete} />;
  }

  return (
    <ScrollView
      testID="fate-weaver-screen"
      className="min-h-screen bg-indigo-50 p-6"
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
    >
      <View className="mx-auto max-w-2xl">
        <FateWeaverHeader />
        <SelectedTypesDisplay selectedTypes={state.config.selectedTypes} />
        <ProbabilityDistributionDisplay
          distribution={state.originalDistribution}
          probabilityChanges={state.probabilityChanges}
          selectedTypes={state.config.selectedTypes}
          title="Current Probability Distribution"
        />
        <ProbabilityControls
          selectedTypes={state.config.selectedTypes}
          probabilityChanges={state.probabilityChanges}
          onModify={handleModify}
        />
        <ProbabilityDistributionDisplay
          distribution={newDistribution}
          probabilityChanges={state.probabilityChanges}
          selectedTypes={state.config.selectedTypes}
          title="Preview: Modified Distribution"
        />
        <FateWeaverActions
          onExecute={handleExecute}
          onReturn={onReturn}
          isResolved={state.isResolved}
        />
      </View>
    </ScrollView>
  );
};
