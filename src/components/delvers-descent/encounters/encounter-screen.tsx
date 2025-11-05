import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { CollectionManager } from '@/lib/delvers-descent/collection-manager';
import { ALL_COLLECTION_SETS } from '@/lib/delvers-descent/collection-sets';
import { HazardEncounter } from '@/lib/delvers-descent/hazard-encounter';
import { RegionManager } from '@/lib/delvers-descent/region-manager';
import { RegionShortcutEncounter } from '@/lib/delvers-descent/region-shortcut-encounter';
import { RestSiteEncounter } from '@/lib/delvers-descent/rest-site-encounter';
import { RiskEventEncounter } from '@/lib/delvers-descent/risk-event-encounter';
import { SafePassageEncounter } from '@/lib/delvers-descent/safe-passage-encounter';
import type {
  DelvingRun,
  DungeonNode,
  RunState,
} from '@/types/delvers-descent';

import { useEncounterResolver } from '../hooks/use-encounter-resolver';
import { HazardScreen } from './advanced/hazard-screen';
import { RegionShortcutScreen } from './advanced/region-shortcut-screen';
import { RestSiteScreen } from './advanced/rest-site-screen';
import { RiskEventScreen } from './advanced/risk-event-screen';
import { SafePassageScreen } from './advanced/safe-passage-screen';
import { DiscoverySiteScreen } from './discovery-site-screen';
import { PuzzleChamberScreen } from './puzzle-chamber-screen';

interface EncounterScreenProps {
  run: DelvingRun;
  node: DungeonNode;
  runState?: RunState | null;
  onReturnToMap: () => void;
  onEncounterComplete: (params: {
    result: 'success' | 'failure';
    rewards?: any[];
    targetRegionId?: string;
    unlockedRegionId?: string;
  }) => void;
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
  error: _error,
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
      <Text className="mb-4 text-center text-gray-600">{_error}</Text>
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

const createBasicEncounter = (
  node: DungeonNode,
  type: 'hazard' | 'risk_event' | 'rest_site' | 'safe_passage'
) => {
  if (type === 'hazard') {
    const config = HazardEncounter.createHazardConfig(
      'collapsed_passage',
      5,
      node.depth
    );
    return new HazardEncounter(node.id, config);
  }
  if (type === 'risk_event') {
    const config = RiskEventEncounter.createRiskLevelConfig(
      'medium',
      node.depth
    );
    return new RiskEventEncounter(node.id, config);
  }
  if (type === 'rest_site') {
    const config = RestSiteEncounter.createRestSiteConfig(
      'ancient_shrine',
      5,
      node.depth
    );
    return new RestSiteEncounter(node.id, config);
  }
  const passageTypes = SafePassageEncounter.getPassageTypes();
  const randomType =
    passageTypes[Math.floor(Math.random() * passageTypes.length)];
  const config = SafePassageEncounter.createSafePassageConfig(
    randomType,
    5,
    node.depth
  );
  return new SafePassageEncounter(node.id, config);
};

const createRegionShortcutEncounter = async (
  node: DungeonNode,
  currentRegionId?: string
) => {
  const collectionManager = new CollectionManager(ALL_COLLECTION_SETS);
  const regionManager = new RegionManager(collectionManager);
  const shortcutTypes = RegionShortcutEncounter.getShortcutTypes();
  const randomType =
    shortcutTypes[Math.floor(Math.random() * shortcutTypes.length)];
  const config = await RegionShortcutEncounter.createRegionShortcutConfig({
    regionManager,
    currentRegionId,
    shortcutType: randomType,
    quality: 5,
    depth: node.depth,
  });
  return new RegionShortcutEncounter(node.id, config);
};

const useAdvancedEncounter = (node: DungeonNode, currentRegionId?: string) => {
  const [advancedEncounter, setAdvancedEncounter] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (
      node.type === 'hazard' ||
      node.type === 'risk_event' ||
      node.type === 'rest_site' ||
      node.type === 'safe_passage'
    ) {
      const encounter = createBasicEncounter(node, node.type);
      setAdvancedEncounter(encounter);
    } else if (node.type === 'region_shortcut') {
      setIsLoading(true);
      createRegionShortcutEncounter(node, currentRegionId)
        .then((encounter) => {
          setAdvancedEncounter(encounter);
        })
        .catch((_error) => {
          console.error('Failed to create region shortcut:', _error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [node, currentRegionId]);

  return { advancedEncounter, isLoading };
};

const handleAdvancedEncounterComplete = (
  outcome: any,
  onEncounterComplete: (params: {
    result: 'success' | 'failure';
    rewards?: any[];
    targetRegionId?: string;
  }) => void
) => {
  const result = outcome.type === 'success' ? 'success' : 'failure';
  const rewards = outcome.reward ? [outcome.reward] : undefined;
  const targetRegionId = outcome.targetRegionId;
  onEncounterComplete({ result, rewards, targetRegionId });
};

const renderStandardEncounter = (params: {
  node: DungeonNode;
  run: DelvingRun;
  onReturnToMap: () => void;
  onEncounterComplete: (params: {
    result: 'success' | 'failure';
    rewards?: any[];
    targetRegionId?: string;
    unlockedRegionId?: string;
  }) => void;
}) => {
  const { node, run, onReturnToMap, onEncounterComplete } = params;
  if (node.type === 'puzzle_chamber') {
    const wrappedOnEncounterComplete = (params: {
      result: 'success' | 'failure';
      rewards?: any[];
    }) => {
      onEncounterComplete({
        result: params.result,
        rewards: params.rewards,
      });
    };
    return (
      <PuzzleChamberScreen
        run={run}
        node={node}
        onReturnToMap={onReturnToMap}
        onEncounterComplete={wrappedOnEncounterComplete}
      />
    );
  }

  if (node.type === 'discovery_site') {
    const wrappedOnEncounterComplete = (params: {
      result: 'success' | 'failure';
      rewards?: any[];
      unlockedRegionId?: string;
    }) => {
      onEncounterComplete({
        result: params.result,
        rewards: params.rewards,
        unlockedRegionId: params.unlockedRegionId,
      });
    };
    return (
      <DiscoverySiteScreen
        run={run}
        node={node}
        onReturnToMap={onReturnToMap}
        onEncounterComplete={wrappedOnEncounterComplete}
      />
    );
  }

  return null;
};

const renderAdvancedEncounter = (params: {
  node: DungeonNode;
  advancedEncounter: any;
  onReturnToMap: () => void;
  onEncounterComplete: (params: {
    result: 'success' | 'failure';
    rewards?: any[];
    targetRegionId?: string;
  }) => void;
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

  if (node.type === 'safe_passage' && advancedEncounter) {
    return (
      <SafePassageScreen
        encounter={advancedEncounter}
        onComplete={completeHandler}
        onReturn={onReturnToMap}
      />
    );
  }

  if (node.type === 'region_shortcut' && advancedEncounter) {
    return (
      <RegionShortcutScreen
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
  runState?: RunState | null;
  onReturnToMap: () => void;
  onEncounterComplete: (params: {
    result: 'success' | 'failure';
    rewards?: any[];
    targetRegionId?: string;
    unlockedRegionId?: string;
  }) => void;
}> = ({ run, node, runState, onReturnToMap, onEncounterComplete }) => {
  const { advancedEncounter, isLoading } = useAdvancedEncounter(
    node,
    runState?.currentRegionId
  );

  if (isLoading) {
    return <LoadingScreen />;
  }

  const standardContent = renderStandardEncounter({
    node,
    run,
    onReturnToMap,
    onEncounterComplete: (params) => {
      onEncounterComplete({
        result: params.result,
        rewards: params.rewards,
        targetRegionId: params.targetRegionId,
        unlockedRegionId: params.unlockedRegionId,
      });
    },
  });
  if (standardContent) return standardContent;

  const advancedContent = renderAdvancedEncounter({
    node,
    advancedEncounter,
    onReturnToMap,
    onEncounterComplete: (params) => {
      onEncounterComplete({
        result: params.result,
        rewards: params.rewards,
        targetRegionId: params.targetRegionId,
      });
    },
  });
  if (advancedContent) return advancedContent;

  return (
    <UnsupportedEncounterScreen nodeType={node.type} onReturn={onReturnToMap} />
  );
};

const renderAdvancedEncounterScreen = (params: {
  run: DelvingRun;
  node: DungeonNode;
  runState?: RunState | null;
  onReturnToMap: () => void;
  onEncounterComplete: (params: {
    result: 'success' | 'failure';
    rewards?: any[];
    targetRegionId?: string;
    unlockedRegionId?: string;
  }) => void;
}) => {
  const { run, node, runState, onReturnToMap, onEncounterComplete } = params;
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
          runState={runState}
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
  onEncounterComplete: (params: {
    result: 'success' | 'failure';
    rewards?: any[];
    targetRegionId?: string;
    unlockedRegionId?: string;
  }) => void;
  encounterResolver: any;
  startEncounter: () => Promise<void>;
  completeEncounter: (
    result: 'success' | 'failure',
    rewards?: any[]
  ) => Promise<void>;
}) => {
  const {
    run,
    node,
    onReturnToMap,
    onEncounterComplete,
    encounterResolver,
    startEncounter,
    completeEncounter,
  } = params;

  const handleStartEncounter = async () => {
    if (encounterResolver) {
      await startEncounter();
    }
  };

  const handleEncounterComplete = async (params: {
    result: 'success' | 'failure';
    rewards?: any[];
    targetRegionId?: string;
    unlockedRegionId?: string;
  }) => {
    if (encounterResolver) {
      await completeEncounter(params.result, params.rewards);
      onEncounterComplete(params);
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
  runState,
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
    return renderAdvancedEncounterScreen({
      run,
      node,
      runState,
      onReturnToMap,
      onEncounterComplete,
    });
  }

  if (error) {
    return <ErrorScreen error={error} onReturn={onReturnToMap} />;
  }

  const advancedTypes = [
    'hazard',
    'risk_event',
    'rest_site',
    'safe_passage',
    'region_shortcut',
  ];
  if (advancedTypes.includes(node.type)) {
    return renderAdvancedEncounterScreen({
      run,
      node,
      runState,
      onReturnToMap,
      onEncounterComplete,
    });
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
