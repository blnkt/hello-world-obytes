import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { DEFAULT_BALANCE_CONFIG } from '@/lib/delvers-descent/balance-config';
import { CollectionManager } from '@/lib/delvers-descent/collection-manager';
import { ALL_COLLECTION_SETS } from '@/lib/delvers-descent/collection-sets';
import { EnergyNexusEncounter } from '@/lib/delvers-descent/energy-nexus-encounter';
import { FateWeaverEncounter } from '@/lib/delvers-descent/fate-weaver-encounter';
import { HazardEncounter } from '@/lib/delvers-descent/hazard-encounter';
import { LuckShrineEncounter } from '@/lib/delvers-descent/luck-shrine-encounter';
import { RegionManager } from '@/lib/delvers-descent/region-manager';
import { RegionShortcutEncounter } from '@/lib/delvers-descent/region-shortcut-encounter';
import { RestSiteEncounter } from '@/lib/delvers-descent/rest-site-encounter';
import { RiskEventEncounter } from '@/lib/delvers-descent/risk-event-encounter';
import { SafePassageEncounter } from '@/lib/delvers-descent/safe-passage-encounter';
import { ScoundrelEncounter } from '@/lib/delvers-descent/scoundrel-encounter';
import type {
  DelvingRun,
  DungeonNode,
  RunState,
} from '@/types/delvers-descent';

import { useEncounterResolver } from '../hooks/use-encounter-resolver';
import { EnergyNexusScreen } from './advanced/energy-nexus-screen';
import { FateWeaverScreen } from './advanced/fate-weaver-screen';
import { HazardScreen } from './advanced/hazard-screen';
import { LuckShrineScreen } from './advanced/luck-shrine-screen';
import { RegionShortcutScreen } from './advanced/region-shortcut-screen';
import { RestSiteScreen } from './advanced/rest-site-screen';
import { RiskEventScreen } from './advanced/risk-event-screen';
import { SafePassageScreen } from './advanced/safe-passage-screen';
import { DiscoverySiteScreen } from './discovery-site-screen';
import { PuzzleChamberScreen } from './puzzle-chamber-screen';
import { ScoundrelScreen } from './scoundrel-screen';

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
    } else if (node.type === 'scoundrel') {
      const config = ScoundrelEncounter.createScoundrelConfig(node.depth);
      setAdvancedEncounter(new ScoundrelEncounter(node.id, config));
    } else if (node.type === 'luck_shrine') {
      setAdvancedEncounter(new LuckShrineEncounter(node.id, node.depth));
    } else if (node.type === 'energy_nexus') {
      setAdvancedEncounter(new EnergyNexusEncounter(node.id, node.depth));
    } else if (node.type === 'fate_weaver') {
      // Get current region's encounter distribution
      const regionDist = currentRegionId
        ? DEFAULT_BALANCE_CONFIG.region.encounterDistributions[currentRegionId]
        : undefined;
      const dist =
        regionDist ||
        DEFAULT_BALANCE_CONFIG.region.encounterDistributions.default ||
        DEFAULT_BALANCE_CONFIG.encounter.encounterDistribution;

      setAdvancedEncounter(new FateWeaverEncounter(node.id, node.depth, dist));
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
    itemsToSteal?: string[];
    additionalEnergyLoss?: number;
  }) => void
) => {
  const result = outcome.type === 'success' ? 'success' : 'failure';
  const rewards = outcome.reward ? [outcome.reward] : undefined;
  const targetRegionId = outcome.targetRegionId;
  // Extract scoundrel-specific failure consequences
  const itemsToSteal =
    outcome.consequence && (outcome.consequence as any).itemsToSteal
      ? (outcome.consequence as any).itemsToSteal
      : undefined;
  const additionalEnergyLoss =
    outcome.consequence && outcome.consequence.energyLoss
      ? outcome.consequence.energyLoss
      : undefined;
  onEncounterComplete({
    result,
    rewards,
    targetRegionId,
    itemsToSteal,
    additionalEnergyLoss,
  });
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

// eslint-disable-next-line max-params
const getBasicScreen = (params: {
  node: DungeonNode;
  advancedEncounter: any;
  screenProps: { onComplete: (outcome: any) => void; onReturn: () => void };
}) => {
  if (params.node.type === 'hazard' && params.advancedEncounter) {
    return (
      <HazardScreen
        encounter={params.advancedEncounter}
        {...params.screenProps}
      />
    );
  }
  if (params.node.type === 'risk_event' && params.advancedEncounter) {
    return (
      <RiskEventScreen
        encounter={params.advancedEncounter}
        {...params.screenProps}
      />
    );
  }
  if (params.node.type === 'rest_site' && params.advancedEncounter) {
    return (
      <RestSiteScreen
        encounter={params.advancedEncounter}
        {...params.screenProps}
      />
    );
  }
  if (params.node.type === 'safe_passage' && params.advancedEncounter) {
    return (
      <SafePassageScreen
        encounter={params.advancedEncounter}
        {...params.screenProps}
      />
    );
  }
  if (params.node.type === 'region_shortcut' && params.advancedEncounter) {
    return (
      <RegionShortcutScreen
        encounter={params.advancedEncounter}
        {...params.screenProps}
      />
    );
  }
  return null;
};

const renderLuckShrineScreen = (params: {
  node: DungeonNode;
  advancedEncounter: any;
  runState?: RunState | null;
  handlers: { complete: (outcome: any) => void; return: () => void };
}) => {
  if (params.node.type === 'luck_shrine' && params.advancedEncounter) {
    return (
      <LuckShrineScreen
        encounter={params.advancedEncounter}
        runState={params.runState}
        onComplete={params.handlers.complete}
        onReturn={params.handlers.return}
      />
    );
  }

  return null;
};

const renderEnergyNexusScreen = (params: {
  node: DungeonNode;
  advancedEncounter: any;
  runState?: RunState | null;
  handlers: { complete: (outcome: any) => void; return: () => void };
}) => {
  if (params.node.type === 'energy_nexus' && params.advancedEncounter) {
    return (
      <EnergyNexusScreen
        encounter={params.advancedEncounter}
        runState={params.runState}
        onComplete={params.handlers.complete}
        onReturn={params.handlers.return}
      />
    );
  }

  return null;
};

const renderFateWeaverScreen = (params: {
  node: DungeonNode;
  advancedEncounter: any;
  runState?: RunState | null;
  handlers: { complete: (outcome: any) => void; return: () => void };
}) => {
  if (params.node.type === 'fate_weaver' && params.advancedEncounter) {
    return (
      <FateWeaverScreen
        encounter={params.advancedEncounter}
        onComplete={params.handlers.complete}
        onReturn={params.handlers.return}
      />
    );
  }

  return null;
};

const renderBasicEncounterScreens = (params: {
  node: DungeonNode;
  advancedEncounter: any;
  handlers: { complete: (outcome: any) => void; return: () => void };
}) => {
  const screenProps = {
    onComplete: params.handlers.complete,
    onReturn: params.handlers.return,
  };
  return getBasicScreen({
    node: params.node,
    advancedEncounter: params.advancedEncounter,
    screenProps,
  });
};

const renderScoundrelScreen = (params: {
  node: DungeonNode;
  advancedEncounter: any;
  runState?: RunState | null;
  completeHandler: (outcome: any) => void;
  onReturnToMap: () => void;
}) => {
  if (params.node.type === 'scoundrel' && params.advancedEncounter) {
    return (
      <ScoundrelScreen
        encounter={params.advancedEncounter}
        runInventory={params.runState?.inventory}
        onComplete={params.completeHandler}
        onReturn={params.onReturnToMap}
      />
    );
  }

  return null;
};

const renderEncounterByType = (params: {
  node: DungeonNode;
  advancedEncounter: any;
  runState?: RunState | null;
  handlers: { complete: (outcome: any) => void; return: () => void };
}) => {
  const basicScreen = renderBasicEncounterScreens(params);
  if (basicScreen) return basicScreen;

  const luckShrineScreen = renderLuckShrineScreen(params);
  if (luckShrineScreen) return luckShrineScreen;

  const energyNexusScreen = renderEnergyNexusScreen(params);
  if (energyNexusScreen) return energyNexusScreen;

  const fateWeaverScreen = renderFateWeaverScreen(params);
  if (fateWeaverScreen) return fateWeaverScreen;

  return renderScoundrelScreen({
    ...params,
    completeHandler: params.handlers.complete,
    onReturnToMap: params.handlers.return,
  });
};

const renderAdvancedEncounter = (params: {
  node: DungeonNode;
  advancedEncounter: any;
  runState?: RunState | null;
  onReturnToMap: () => void;
  onEncounterComplete: (params: {
    result: 'success' | 'failure';
    rewards?: any[];
    targetRegionId?: string;
  }) => void;
}) => {
  const completeHandler = (outcome: any) => {
    handleAdvancedEncounterComplete(outcome, params.onEncounterComplete);
  };

  return renderEncounterByType({
    node: params.node,
    advancedEncounter: params.advancedEncounter,
    runState: params.runState,
    handlers: {
      complete: completeHandler,
      return: params.onReturnToMap,
    },
  });
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
    runState,
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

const buildStartHandler = (params: {
  encounterResolver: any;
  startEncounter: () => Promise<void>;
}) => {
  return async () => {
    if (params.encounterResolver) {
      await params.startEncounter();
    }
  };
};

const buildCompleteHandler = (params: {
  encounterResolver: any;
  completeEncounter: (
    result: 'success' | 'failure',
    rewards?: any[]
  ) => Promise<void>;
  onEncounterComplete: (params: {
    result: 'success' | 'failure';
    rewards?: any[];
    targetRegionId?: string;
    unlockedRegionId?: string;
  }) => void;
}) => {
  return async (completeParams: {
    result: 'success' | 'failure';
    rewards?: any[];
    targetRegionId?: string;
    unlockedRegionId?: string;
  }) => {
    if (params.encounterResolver) {
      await params.completeEncounter(
        completeParams.result,
        completeParams.rewards
      );
      params.onEncounterComplete(completeParams);
    }
  };
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
  const handleStartEncounter = buildStartHandler(params);
  const handleEncounterComplete = buildCompleteHandler(params);

  return (
    <ScrollView
      testID="encounter-screen"
      className="min-h-screen bg-gray-50"
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
    >
      {params.encounterResolver &&
      !params.encounterResolver.getEncounterState() ? (
        <ReadyToBeginScreen onStart={handleStartEncounter} />
      ) : (
        <View className="min-h-screen bg-gray-50">
          <EncounterContent
            run={params.run}
            node={params.node}
            onReturnToMap={params.onReturnToMap}
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
    'scoundrel',
    'luck_shrine',
    'energy_nexus',
    'fate_weaver',
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
