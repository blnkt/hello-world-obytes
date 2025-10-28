import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import type { DelvingRun, DungeonNode } from '@/types/delvers-descent';

import { useEncounterResolver } from '../hooks/use-encounter-resolver';
import { DiscoverySiteScreen } from './discovery-site-screen';
import { PuzzleChamberScreen } from './puzzle-chamber-screen';
import { TradeOpportunityScreen } from './trade-opportunity-screen';

interface EncounterScreenProps {
  run: DelvingRun;
  node: DungeonNode;
  onReturnToMap: () => void;
  onEncounterComplete: (result: 'success' | 'failure', rewards?: any[]) => void;
}

const LoadingScreen: React.FC = () => (
  <View
    testID="encounter-loading"
    className="flex min-h-screen items-center justify-center"
  >
    <View>
      <View className="mx-auto size-32 animate-spin rounded-full border-b-2 border-blue-500" />
      <Text className="mt-4 text-center text-lg text-gray-600">
        Loading encounter...
      </Text>
    </View>
  </View>
);

const ErrorScreen: React.FC<{ error: string; onReturn: () => void }> = ({
  error,
  onReturn,
}) => (
  <View
    testID="encounter-error"
    className="flex min-h-screen items-center justify-center"
  >
    <View>
      <Text className="mb-4 text-center text-6xl text-red-500">⚠️</Text>
      <Text className="mb-2 text-center text-2xl font-bold text-gray-800">
        Encounter Error
      </Text>
      <Text className="mb-4 text-center text-gray-600">{error}</Text>
      <Pressable
        onPress={onReturn}
        className="rounded-lg bg-blue-500 px-6 py-3"
      >
        <Text className="text-center text-white">Return to Map</Text>
      </Pressable>
    </View>
  </View>
);

const UnsupportedEncounterScreen: React.FC<{
  nodeType: string;
  onReturn: () => void;
}> = ({ nodeType, onReturn }) => (
  <View
    testID="encounter-error"
    className="flex min-h-screen items-center justify-center"
  >
    <View>
      <Text className="mb-4 text-center text-6xl text-yellow-500">❓</Text>
      <Text className="mb-2 text-center text-2xl font-bold text-gray-800">
        Unsupported Encounter
      </Text>
      <Text className="mb-4 text-center text-gray-600">
        This encounter type ({nodeType}) is not yet supported.
      </Text>
      <Pressable
        onPress={onReturn}
        className="rounded-lg bg-blue-500 px-6 py-3"
      >
        <Text className="text-center text-white">Return to Map</Text>
      </Pressable>
    </View>
  </View>
);

const ReadyToBeginScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <View className="flex min-h-screen items-center justify-center">
    <View>
      <Text className="mb-4 text-center text-2xl font-bold text-gray-800">
        Ready to Begin
      </Text>
      <Text className="mb-6 text-center text-gray-600">
        Start your encounter to begin!
      </Text>
      <Pressable
        testID="start-encounter"
        onPress={onStart}
        className="rounded-lg bg-blue-500 px-6 py-3"
      >
        <Text className="text-center text-white">Start Encounter</Text>
      </Pressable>
    </View>
  </View>
);

const EncounterContent: React.FC<{
  run: DelvingRun;
  node: DungeonNode;
  onReturnToMap: () => void;
  onEncounterComplete: (result: 'success' | 'failure', rewards?: any[]) => void;
}> = ({ run, node, onReturnToMap, onEncounterComplete }) => {
  if (node.type === 'puzzle_chamber') {
    return (
      <PuzzleChamberScreen
        run={run}
        node={node}
        onReturnToMap={onReturnToMap}
        onEncounterComplete={onEncounterComplete}
      />
    );
  }

  if (node.type === 'trade_opportunity') {
    return (
      <TradeOpportunityScreen
        run={run}
        node={node}
        onReturnToMap={onReturnToMap}
        onEncounterComplete={onEncounterComplete}
      />
    );
  }

  if (node.type === 'discovery_site') {
    return (
      <DiscoverySiteScreen
        run={run}
        node={node}
        onReturnToMap={onReturnToMap}
        onEncounterComplete={onEncounterComplete}
      />
    );
  }

  return (
    <UnsupportedEncounterScreen nodeType={node.type} onReturn={onReturnToMap} />
  );
};

export const EncounterScreen: React.FC<EncounterScreenProps> = ({
  run,
  node,
  onReturnToMap,
  onEncounterComplete,
}) => {
  const {
    encounterResolver,
    isLoading,
    error,
    startEncounter,
    updateEncounterProgress: _updateEncounterProgress,
    completeEncounter,
    getEncounterState: _getEncounterState,
    clearEncounterState: _clearEncounterState,
  } = useEncounterResolver(run, node);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} onReturn={onReturnToMap} />;
  }

  const handleStartEncounter = async () => {
    if (encounterResolver) {
      await startEncounter();
    }
  };

  const handleEncounterComplete = async (
    result: 'success' | 'failure',
    rewards?: any[]
  ) => {
    if (encounterResolver) {
      await completeEncounter(result, rewards);
      onEncounterComplete(result, rewards);
    }
  };

  return (
    <ScrollView
      testID="encounter-screen"
      className="min-h-screen bg-gray-50"
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
    >
      {encounterResolver && !encounterResolver.getEncounterState() ? (
        <ReadyToBeginScreen onStart={handleStartEncounter} />
      ) : (
        <View className="min-h-screen bg-gray-50">
          <EncounterContent
            run={run}
            node={node}
            onReturnToMap={onReturnToMap}
            onEncounterComplete={handleEncounterComplete}
          />
        </View>
      )}
    </ScrollView>
  );
};
