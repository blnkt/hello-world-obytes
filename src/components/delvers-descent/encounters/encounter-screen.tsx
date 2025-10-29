import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { HazardEncounter } from '@/lib/delvers-descent/hazard-encounter';
import { RestSiteEncounter } from '@/lib/delvers-descent/rest-site-encounter';
import { RiskEventEncounter } from '@/lib/delvers-descent/risk-event-encounter';
import type { DelvingRun, DungeonNode } from '@/types/delvers-descent';

import { useEncounterResolver } from '../hooks/use-encounter-resolver';
import { HazardScreen } from './advanced/hazard-screen';
import { RestSiteScreen } from './advanced/rest-site-screen';
import { RiskEventScreen } from './advanced/risk-event-screen';
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

const useAdvancedEncounter = (node: DungeonNode) => {
  const [advancedEncounter, setAdvancedEncounter] = useState<any>(null);

  useEffect(() => {
    if (node.type === 'hazard') {
      const config = HazardEncounter.createHazardConfig(
        'collapsed_passage',
        5,
        node.depth
      );
      const hazardEncounter = new HazardEncounter(node.id, config);
      setAdvancedEncounter(hazardEncounter);
    } else if (node.type === 'risk_event') {
      const config = RiskEventEncounter.createRiskLevelConfig(
        'medium',
        node.depth
      );
      const riskEncounter = new RiskEventEncounter(node.id, config);
      setAdvancedEncounter(riskEncounter);
    } else if (node.type === 'rest_site') {
      const config = RestSiteEncounter.createRestSiteConfig(
        'ancient_shrine',
        5,
        node.depth
      );
      const restEncounter = new RestSiteEncounter(node.id, config);
      setAdvancedEncounter(restEncounter);
    }
  }, [node.type, node.depth, node.id]);

  return advancedEncounter;
};

const handleAdvancedEncounterComplete = (
  outcome: any,
  onEncounterComplete: (result: 'success' | 'failure', rewards?: any[]) => void
) => {
  const result = outcome.type === 'success' ? 'success' : 'failure';
  const rewards = outcome.reward ? [outcome.reward] : undefined;
  onEncounterComplete(result, rewards);
};

const renderStandardEncounter = (params: {
  node: DungeonNode;
  run: DelvingRun;
  onReturnToMap: () => void;
  onEncounterComplete: (result: 'success' | 'failure', rewards?: any[]) => void;
}) => {
  const { node, run, onReturnToMap, onEncounterComplete } = params;
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

  return null;
};

const renderAdvancedEncounter = (params: {
  node: DungeonNode;
  advancedEncounter: any;
  onReturnToMap: () => void;
  onEncounterComplete: (result: 'success' | 'failure', rewards?: any[]) => void;
}) => {
  const { node, advancedEncounter, onReturnToMap, onEncounterComplete } =
    params;
  const completeHandler = (outcome: any) => {
    handleAdvancedEncounterComplete(outcome, onEncounterComplete);
  };

  if (node.type === 'hazard' && advancedEncounter) {
    return (
      <HazardScreen
        encounter={advancedEncounter}
        onComplete={completeHandler}
        onReturn={onReturnToMap}
      />
    );
  }

  if (node.type === 'risk_event' && advancedEncounter) {
    return (
      <RiskEventScreen
        encounter={advancedEncounter}
        onComplete={completeHandler}
        onReturn={onReturnToMap}
      />
    );
  }

  if (node.type === 'rest_site' && advancedEncounter) {
    return (
      <RestSiteScreen
        encounter={advancedEncounter}
        onComplete={completeHandler}
        onReturn={onReturnToMap}
      />
    );
  }

  return null;
};

const EncounterContent: React.FC<{
  run: DelvingRun;
  node: DungeonNode;
  onReturnToMap: () => void;
  onEncounterComplete: (result: 'success' | 'failure', rewards?: any[]) => void;
}> = ({ run, node, onReturnToMap, onEncounterComplete }) => {
  const advancedEncounter = useAdvancedEncounter(node);

  const standardContent = renderStandardEncounter({
    node,
    run,
    onReturnToMap,
    onEncounterComplete,
  });
  if (standardContent) return standardContent;

  const advancedContent = renderAdvancedEncounter({
    node,
    advancedEncounter,
    onReturnToMap,
    onEncounterComplete,
  });
  if (advancedContent) return advancedContent;

  return (
    <UnsupportedEncounterScreen nodeType={node.type} onReturn={onReturnToMap} />
  );
};

const renderAdvancedEncounterScreen = (params: {
  run: DelvingRun;
  node: DungeonNode;
  onReturnToMap: () => void;
  onEncounterComplete: (result: 'success' | 'failure', rewards?: any[]) => void;
}) => {
  const { run, node, onReturnToMap, onEncounterComplete } = params;
  return (
    <ScrollView
      testID="encounter-screen"
      className="min-h-screen bg-gray-50"
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
    >
      <View className="min-h-screen bg-gray-50">
        <EncounterContent
          run={run}
          node={node}
          onReturnToMap={onReturnToMap}
          onEncounterComplete={onEncounterComplete}
        />
      </View>
    </ScrollView>
  );
};

const renderStandardEncounterScreen = (params: {
  run: DelvingRun;
  node: DungeonNode;
  onReturnToMap: () => void;
  onEncounterComplete: (result: 'success' | 'failure', rewards?: any[]) => void;
  encounterResolver: any;
  startEncounter: () => Promise<void>;
  completeEncounter: (result: 'success' | 'failure', rewards?: any[]) => Promise<void>;
}) => {
  const { run, node, onReturnToMap, onEncounterComplete, encounterResolver, startEncounter, completeEncounter } = params;

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
    completeEncounter,
  } = useEncounterResolver(run, node);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error && error.includes('Unsupported encounter type:')) {
    return renderAdvancedEncounterScreen({ run, node, onReturnToMap, onEncounterComplete });
  }

  if (error) {
    return <ErrorScreen error={error} onReturn={onReturnToMap} />;
  }

  const advancedTypes = ['hazard', 'risk_event', 'rest_site'];
  if (advancedTypes.includes(node.type)) {
    return renderAdvancedEncounterScreen({ run, node, onReturnToMap, onEncounterComplete });
  }

  return renderStandardEncounterScreen({
    run,
    node,
    onReturnToMap,
    onEncounterComplete,
    encounterResolver,
    startEncounter,
    completeEncounter,
  });
};
