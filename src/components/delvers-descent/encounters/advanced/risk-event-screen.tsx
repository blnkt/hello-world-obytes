import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import {
  type AdvancedEncounterOutcome,
  type RiskEventChoice,
  type RiskEventEncounter,
  type RiskEventState,
} from '@/lib/delvers-descent/risk-event-encounter';

export interface RiskEventScreenProps {
  /** The risk event encounter state */
  encounter: RiskEventEncounter;
  /** Callback when encounter completes */
  onComplete: (outcome: AdvancedEncounterOutcome) => void;
  /** Callback to return to map */
  onReturn: () => void;
}

const RiskLevelBadge: React.FC<{ level: string }> = ({ level }) => {
  const colors: Record<string, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    extreme: 'bg-red-100 text-red-800',
  };
  return (
    <View
      className={`rounded-full px-3 py-1 ${colors[level] || 'bg-gray-100 text-gray-800'}`}
    >
      <Text className="text-xs font-semibold">{level.toUpperCase()} RISK</Text>
    </View>
  );
};

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

const RiskEventHeader: React.FC<{ riskLevel: string }> = ({ riskLevel }) => (
  <View className="mb-6">
    <View className="items-center justify-center">
      <RiskLevelBadge level={riskLevel} />
    </View>
    <Text className="mt-4 text-center text-3xl font-bold text-gray-800">
      Risk Event
    </Text>
    <Text className="mt-2 text-center text-gray-600">
      High stakes, high rewards. Choose your risk level.
    </Text>
  </View>
);

const RiskEventChoices: React.FC<{
  choices: RiskEventState['availableChoices'];
  selectedChoice?: RiskEventChoice;
  onSelect: (choiceId: string) => void;
}> = ({ choices, selectedChoice, onSelect }) => (
  <View className="gap-4">
    {choices.map((choice) => (
      <Pressable
        key={choice.id}
        testID={`choice-${choice.id}`}
        onPress={() => onSelect(choice.id)}
        disabled={selectedChoice?.id === choice.id}
        className={`w-full rounded-lg border-2 p-4 ${
          selectedChoice?.id === choice.id
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-white'
        }`}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-semibold text-gray-800">
              Choice {choice.id}
            </Text>
            <Text className="text-sm text-gray-600">{choice.description}</Text>
          </View>
          <View>
            <Text className="text-right text-sm text-gray-500">
              Success Modifier: {(choice.successRateModifier * 100).toFixed(0)}%
            </Text>
            <Text className="text-right text-sm font-semibold text-blue-600">
              Multiplier: {choice.rewardModifier}x
            </Text>
          </View>
        </View>
      </Pressable>
    ))}
  </View>
);

const RiskEventActions: React.FC<{
  hasSelectedChoice: boolean;
  onResolve: () => void;
  onReturn: () => void;
}> = ({ hasSelectedChoice, onResolve, onReturn }) => (
  <>
    {hasSelectedChoice && (
      <View className="mt-6">
        <Pressable
          testID="resolve-button"
          onPress={onResolve}
          className="w-full rounded-lg bg-green-600 px-6 py-3"
        >
          <Text className="text-center text-lg font-semibold text-white">
            Take the Risk!
          </Text>
        </Pressable>
      </View>
    )}
    <View className="mt-6">
      <Pressable
        onPress={onReturn}
        className="rounded-lg border-2 border-gray-300 bg-white px-6 py-2"
      >
        <Text className="text-center text-gray-700">Return to Map</Text>
      </Pressable>
    </View>
  </>
);

export const RiskEventScreen: React.FC<RiskEventScreenProps> = ({
  encounter,
  onComplete,
  onReturn,
}) => {
  const [state, setState] = useState<RiskEventState>(encounter.getState());
  const [outcome, setOutcome] = useState<AdvancedEncounterOutcome | null>(null);

  const handleSelectChoice = (choiceId: string) => {
    encounter.selectChoice(choiceId);
    setState(encounter.getState());
  };

  const handleResolve = () => {
    const result = encounter.resolve();
    setOutcome(result);
    setState(encounter.getState());
  };

  if (outcome) {
    return <OutcomeDisplay outcome={outcome} onComplete={onComplete} />;
  }

  return (
    <ScrollView
      testID="risk-event-screen"
      className="min-h-screen bg-gray-50 p-6"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="mx-auto max-w-2xl">
        <RiskEventHeader riskLevel={state.config.riskLevel} />
        <RiskEventChoices
          choices={state.availableChoices}
          selectedChoice={state.selectedChoice}
          onSelect={handleSelectChoice}
        />
        <RiskEventActions
          hasSelectedChoice={!!state.selectedChoice}
          onResolve={handleResolve}
          onReturn={onReturn}
        />
      </View>
    </ScrollView>
  );
};
