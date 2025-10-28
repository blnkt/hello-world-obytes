import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import {
  type AdvancedEncounterOutcome,
  type HazardEncounter,
  type HazardState,
  type SolutionPath,
} from '@/lib/delvers-descent/hazard-encounter';

export interface HazardScreenProps {
  /** The hazard encounter state */
  encounter: HazardEncounter;
  /** Callback when encounter completes */
  onComplete: (outcome: AdvancedEncounterOutcome) => void;
  /** Callback to return to map */
  onReturn: () => void;
}

const getObstacleName = (type: string): string => {
  const names: Record<string, string> = {
    collapsed_passage: 'Collapsed Passage',
    treacherous_bridge: 'Treacherous Bridge',
    ancient_guardian: 'Ancient Guardian',
    energy_drain: 'Energy Drain',
    maze_of_mirrors: 'Maze of Mirrors',
  };
  return names[type] || 'Unknown Hazard';
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

const HazardHeader: React.FC<{ obstacleType: string; difficulty: number }> = ({
  obstacleType,
  difficulty,
}) => (
  <View className="mb-6">
    <Text className="text-center text-3xl font-bold text-gray-800">
      {getObstacleName(obstacleType)}
    </Text>
    <Text className="mt-2 text-center text-gray-600">
      A dangerous obstacle blocks your path. Choose your solution carefully.
    </Text>
    <View className="mt-3">
      <View className="rounded-full bg-orange-100 px-3 py-1">
        <Text className="text-center text-xs font-semibold text-orange-800">
          Difficulty: {difficulty}/10
        </Text>
      </View>
    </View>
  </View>
);

const HazardPaths: React.FC<{
  paths: HazardState['availablePaths'];
  selectedPath?: SolutionPath;
  onSelect: (pathId: string) => void;
}> = ({ paths, selectedPath, onSelect }) => (
  <View className="gap-4">
    {paths.map((path) => (
      <Pressable
        key={path.id}
        testID={`path-${path.id}`}
        onPress={() => onSelect(path.id)}
        disabled={selectedPath?.id === path.id}
        className={`w-full rounded-lg border-2 p-4 ${
          selectedPath?.id === path.id
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-white'
        }`}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="font-semibold text-gray-800">{path.name}</Text>
            <Text className="text-sm text-gray-600">{path.description}</Text>
            {path.specialEffect && (
              <Text className="mt-1 text-xs text-blue-600">
                {path.specialEffect}
              </Text>
            )}
          </View>
          <View>
            <Text className="text-right text-sm text-red-600">
              Energy: {path.energyCost}
            </Text>
            <Text className="text-right text-sm text-gray-500">
              Success: {Math.round(path.successRate * 100)}%
            </Text>
          </View>
        </View>
      </Pressable>
    ))}
  </View>
);

const HazardActions: React.FC<{
  hasSelectedPath: boolean;
  onResolve: () => void;
  onReturn: () => void;
}> = ({ hasSelectedPath, onResolve, onReturn }) => (
  <>
    {hasSelectedPath && (
      <View className="mt-6">
        <Pressable
          testID="resolve-button"
          onPress={onResolve}
          className="w-full rounded-lg bg-green-600 px-6 py-3"
        >
          <Text className="text-center text-lg font-semibold text-white">
            Attempt Solution
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

export const HazardScreen: React.FC<HazardScreenProps> = ({
  encounter,
  onComplete,
  onReturn,
}) => {
  const [state, setState] = useState<HazardState>(encounter.getState());
  const [outcome, setOutcome] = useState<AdvancedEncounterOutcome | null>(null);

  const handleSelectPath = (pathId: string) => {
    encounter.selectPath(pathId);
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
      testID="hazard-screen"
      className="min-h-screen bg-gray-50 p-6"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="mx-auto max-w-2xl">
        <HazardHeader
          obstacleType={state.config.obstacleType}
          difficulty={state.config.difficulty}
        />
        <HazardPaths
          paths={state.availablePaths}
          selectedPath={state.selectedPath}
          onSelect={handleSelectPath}
        />
        <HazardActions
          hasSelectedPath={!!state.selectedPath}
          onResolve={handleResolve}
          onReturn={onReturn}
        />
      </View>
    </ScrollView>
  );
};
