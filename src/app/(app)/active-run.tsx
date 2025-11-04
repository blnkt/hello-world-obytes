import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import { CashOutModal } from '@/components/delvers-descent/active-run/cash-out-modal';
import { InteractiveMap } from '@/components/delvers-descent/active-run/interactive-map';
import { NavigationControls } from '@/components/delvers-descent/active-run/navigation-controls';
import { RunStatusPanel } from '@/components/delvers-descent/active-run/run-status-panel';
import { EncounterScreen } from '@/components/delvers-descent/encounters/encounter-screen';
import { useMapGenerator } from '@/components/delvers-descent/hooks/use-map-generator';
import { AchievementManager } from '@/lib/delvers-descent/achievement-manager';
import { saveAchievements } from '@/lib/delvers-descent/achievement-persistence';
import { ALL_ACHIEVEMENTS } from '@/lib/delvers-descent/achievement-types';
import { CollectionManager } from '@/lib/delvers-descent/collection-manager';
import { ALL_COLLECTION_SETS } from '@/lib/delvers-descent/collection-sets';
import { EnergyCalculator } from '@/lib/delvers-descent/energy-calculator';
import { getProgressionManager } from '@/lib/delvers-descent/progression-manager';
import { getRunQueueManager } from '@/lib/delvers-descent/run-queue';
import { useExperienceData } from '@/lib/health';
import { useCharacter } from '@/lib/storage';
import type {
  DelvingRun,
  DungeonNode,
  RunState,
} from '@/types/delvers-descent';

const LoadingView: React.FC = () => (
  <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
    <ActivityIndicator size="large" color="#3B82F6" />
    <Text className="mt-4 text-gray-600 dark:text-gray-400">
      Loading run...
    </Text>
  </View>
);

const ErrorView: React.FC<{ error: string; router: any }> = ({
  error,
  router,
}) => (
  <View className="flex-1 items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
    <Text className="mb-2 text-center text-lg font-bold text-red-600">
      {error || 'Run not found'}
    </Text>
    <TouchableOpacity
      onPress={() => router.back()}
      className="mt-4 rounded-lg bg-blue-500 px-6 py-3"
    >
      <Text className="font-semibold text-white">Go Back</Text>
    </TouchableOpacity>
  </View>
);

const CharacterInfo: React.FC = () => {
  const [character] = useCharacter();
  const { experience } = useExperienceData();

  if (!character || !character.name) {
    return null;
  }

  return (
    <View className="mb-4 flex-row items-center rounded-xl bg-blue-50 p-3 dark:bg-blue-900/20">
      <View className="mr-3 size-12 items-center justify-center rounded-full bg-blue-500">
        <Text className="text-lg font-bold text-white">
          {character.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-gray-900 dark:text-white">
          {character.name}
        </Text>
        <View className="flex-row items-center">
          <Text className="text-xs text-gray-600 dark:text-gray-400">
            Level {character.level}
          </Text>
          <Text className="ml-2 text-xs text-gray-600 dark:text-gray-400">
            • {experience.toLocaleString()} XP
          </Text>
        </View>
      </View>
    </View>
  );
};

const RunDetailsCard: React.FC<{ run: DelvingRun }> = ({ run }) => (
  <View className="mb-6 rounded-xl bg-white p-4 dark:bg-gray-800">
    <Text className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
      Active Run
    </Text>
    <Text className="mb-1 text-sm text-gray-600 dark:text-gray-400">
      Energy: {run.totalEnergy}
    </Text>
    <Text className="mb-1 text-sm text-gray-600 dark:text-gray-400">
      Steps: {run.steps.toLocaleString()}
    </Text>
    <Text className="text-sm text-gray-600 dark:text-gray-400">
      Date: {new Date(run.date).toLocaleDateString()}
    </Text>
  </View>
);

const useActiveRunData = (runId: string) => {
  const [run, setRun] = useState<DelvingRun | null>(null);
  const [nodes, setNodes] = useState<DungeonNode[]>([]);
  const [runState, setRunState] = useState<RunState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [maxDepth, setMaxDepth] = useState(5);
  const { generateFullMap, generateDepthLevel } = useMapGenerator();

  useEffect(() => {
    if (runId) {
      loadRunImpl({
        runId,
        generateFullMap,
        setRun,
        setNodes,
        setRunState,
        setError,
        setIsLoading,
      });
    }
  }, [runId, generateFullMap]);

  const updateEnergy = React.useCallback(
    (newEnergy: number | ((current: number) => number)) =>
      setRunState((prev) => updateEnergyImpl(prev, newEnergy)),
    []
  );
  const addToInventory = React.useCallback(
    (item: any) => setRunState((prev) => addToInventoryImpl(prev, item)),
    []
  );
  const markNodeVisited = React.useCallback(
    (nodeId: string) =>
      setRunState((prev) => markNodeVisitedImpl(prev, nodeId)),
    []
  );
  const updateDepth = React.useCallback(
    (newDepth: number) =>
      setRunState((prev) =>
        updateDepthImpl({
          prevState: prev,
          newDepth,
          maxDepth,
          generateDepthLevel,
          setNodes,
          setMaxDepth,
        })
      ),
    [maxDepth, generateDepthLevel]
  );

  return {
    run,
    nodes,
    runState,
    isLoading,
    error,
    updateEnergy,
    addToInventory,
    markNodeVisited,
    updateDepth,
  };
};

// eslint-disable-next-line max-lines-per-function
const useEncounterHandlers = (params: {
  runState: RunState | null;
  onEnergyUpdate: (energyDelta: number) => void;
  onInventoryUpdate: (items: any[]) => void;
  onNodeVisited: (nodeId: string) => void;
  onDepthUpdate: (depth: number) => void;
  onTriggerCashOut?: () => void;
}) => {
  const {
    onEnergyUpdate,
    onInventoryUpdate,
    onNodeVisited,
    onDepthUpdate,
    onTriggerCashOut,
  } = params;
  const [selectedNode, setSelectedNode] = useState<DungeonNode | null>(null);
  const [showEncounter, setShowEncounter] = useState(false);

  const handleNodePress = useCallback(
    (
      node: DungeonNode,
      currentRunState: RunState | null,
      onBust?: () => void
    ) => {
      if (!currentRunState) return false;
      if (currentRunState.energyRemaining < node.energyCost) {
        if (onBust) onBust();
        else alert('Not enough energy to reach this node!');
        return false;
      }
      setSelectedNode(node);
      setShowEncounter(true);
      return true;
    },
    [setSelectedNode, setShowEncounter]
  );

  const handleEncounterComplete = useCallback(
    (result: 'success' | 'failure', rewards?: any[]) =>
      handleEncounterCompleteImpl({
        selectedNode,
        setShowEncounter,
        onEnergyUpdate,
        onInventoryUpdate,
        onNodeVisited,
        onDepthUpdate,
        onTriggerCashOut,
        result,
        rewards,
      }),
    [
      selectedNode,
      onEnergyUpdate,
      onInventoryUpdate,
      onNodeVisited,
      onDepthUpdate,
      onTriggerCashOut,
    ]
  );

  const handleReturnToMap = useCallback(() => setShowEncounter(false), []);

  return {
    selectedNode,
    showEncounter,
    handleNodePress,
    handleReturnToMap,
    handleEncounterComplete,
  };
};

function updateEnergyImpl(
  prevState: RunState | null,
  newEnergy: number | ((current: number) => number)
): RunState | null {
  if (!prevState) return prevState;
  const energyValue =
    typeof newEnergy === 'function'
      ? (newEnergy as (c: number) => number)(prevState.energyRemaining)
      : newEnergy;
  return { ...prevState, energyRemaining: energyValue };
}

function addToInventoryImpl(
  prevState: RunState | null,
  item: any
): RunState | null {
  if (!prevState) return prevState;
  return { ...prevState, inventory: [...prevState.inventory, item] };
}

function markNodeVisitedImpl(
  prevState: RunState | null,
  nodeId: string
): RunState | null {
  if (!prevState || prevState.visitedNodes.includes(nodeId)) return prevState;
  return {
    ...prevState,
    visitedNodes: [...prevState.visitedNodes, nodeId],
    currentNode: nodeId,
  };
}

function updateDepthImpl({
  prevState,
  newDepth,
  maxDepth,
  generateDepthLevel,
  setNodes,
  setMaxDepth,
}: {
  prevState: RunState | null;
  newDepth: number;
  maxDepth: number;
  generateDepthLevel: (depth: number) => DungeonNode[];
  setNodes: React.Dispatch<React.SetStateAction<DungeonNode[]>>;
  setMaxDepth: React.Dispatch<React.SetStateAction<number>>;
}): RunState | null {
  if (!prevState) return prevState;
  const updatedDepth = Math.max(prevState.currentDepth, newDepth);
  if (updatedDepth >= maxDepth) {
    const newNodes = generateDepthLevel(maxDepth + 1);
    setNodes((prevNodes) => [...prevNodes, ...newNodes]);
    setMaxDepth(maxDepth + 1);
  }
  return { ...prevState, currentDepth: updatedDepth };
}

function handleEncounterCompleteImpl({
  selectedNode,
  setShowEncounter,
  onEnergyUpdate,
  onInventoryUpdate,
  onNodeVisited,
  onDepthUpdate,
  onTriggerCashOut,
  result,
  rewards,
}: {
  selectedNode: DungeonNode | null;
  setShowEncounter: (v: boolean) => void;
  onEnergyUpdate: (delta: number) => void;
  onInventoryUpdate: (items: any[]) => void;
  onNodeVisited: (id: string) => void;
  onDepthUpdate: (depth: number) => void;
  onTriggerCashOut?: () => void;
  result: 'success' | 'failure';
  rewards?: any[];
}) {
  if (!selectedNode) {
    setShowEncounter(false);
    return;
  }

  // If this is a safe passage encounter and it succeeded, trigger cash out immediately
  if (
    selectedNode.type === 'safe_passage' &&
    result === 'success' &&
    onTriggerCashOut
  ) {
    // Process the encounter normally (deduct energy, mark visited, etc.)
    onEnergyUpdate(-selectedNode.energyCost);
    if (rewards) {
      onInventoryUpdate(rewards);
    }
    onNodeVisited(selectedNode.id);
    onDepthUpdate(selectedNode.depth);
    setShowEncounter(false);
    // Trigger cash out with free return (return cost will be handled in cash out modal)
    onTriggerCashOut();
    return;
  }

  // Normal encounter completion
  onEnergyUpdate(-selectedNode.energyCost);
  if (result === 'success' && rewards) {
    onInventoryUpdate(rewards);
  }
  onNodeVisited(selectedNode.id);
  onDepthUpdate(selectedNode.depth);
  setShowEncounter(false);
}

// Risk flow removed - no longer needed

function useCashOutFlow({
  run,
  runState,
  router,
  setShowCashOutModal,
}: {
  run: DelvingRun | null;
  runState: RunState | null;
  router: any;
  setShowCashOutModal: (v: boolean) => void;
}) {
  const handleCashOutConfirm = useCallback(async () => {
    if (!runState || !run) return;
    setShowCashOutModal(false);
    try {
      const runQueueManager = getRunQueueManager();
      const collectionManager = new CollectionManager(ALL_COLLECTION_SETS);
      const achievementManager = new AchievementManager(ALL_ACHIEVEMENTS);
      const progressionManager = getProgressionManager();
      await achievementManager.loadSavedState();
      const completionResult = {
        finalInventory: runState.inventory,
        totalEnergyUsed: run.totalEnergy - runState.energyRemaining,
        deepestDepth: runState.currentDepth,
        shortcutsDiscovered: runState.discoveredShortcuts,
      };
      for (const item of completionResult.finalInventory) {
        if (
          item.setId &&
          (item.type === 'trade_good' ||
            item.type === 'discovery' ||
            item.type === 'legendary')
        ) {
          await collectionManager.addCollectedItem({
            itemId: item.id,
            setId: item.setId,
            collectedDate: Date.now(),
            runId: run.id,
            source: 'encounter',
          });
        }
      }
      achievementManager.processEvent({
        type: 'depth_reached',
        data: { depth: completionResult.deepestDepth, cashOut: true },
        timestamp: new Date(),
      });
      const progress = await collectionManager.getCollectionProgress();
      for (const setId of progress.completedSets) {
        achievementManager.processEvent({
          type: 'collection_completed',
          data: { collectionSetId: setId },
          timestamp: new Date(),
        });
      }
      await saveAchievements(achievementManager);
      // Persist progression data before removing run
      await progressionManager.processRunCompletion(
        completionResult.deepestDepth
      );
      runQueueManager.updateRunStatus(run.id, 'completed');
      router.push('/(app)/run-queue');
    } catch (error) {
      console.error('Failed to complete cash out:', error);
      alert('Failed to complete cash out. Please try again.');
    }
  }, [run, runState, router, setShowCashOutModal]);

  return { handleCashOutConfirm } as const;
}

async function loadRunImpl({
  runId,
  generateFullMap,
  setRun,
  setNodes,
  setRunState,
  setError,
  setIsLoading,
}: {
  runId: string;
  generateFullMap: (depth: number) => DungeonNode[];
  setRun: React.Dispatch<React.SetStateAction<DelvingRun | null>>;
  setNodes: React.Dispatch<React.SetStateAction<DungeonNode[]>>;
  setRunState: React.Dispatch<React.SetStateAction<RunState | null>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  try {
    const manager = getRunQueueManager();
    const foundRun = manager.getRunById(runId);
    if (foundRun) {
      setRun(foundRun);
      const mapNodes = generateFullMap(5);
      setNodes(mapNodes);
      setRunState({
        runId: foundRun.id,
        currentDepth: 0,
        currentNode: '',
        energyRemaining: foundRun.totalEnergy,
        inventory: [],
        visitedNodes: [],
        discoveredShortcuts: [],
      });
    } else {
      setError('Run not found');
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to load run');
  } finally {
    setIsLoading(false);
  }
}

const MapView: React.FC<{
  run: DelvingRun;
  nodes: DungeonNode[];
  runState: RunState | null;
  onNodePress: (node: DungeonNode) => void;
  showCashOutModal: boolean;
  isFreeReturn: boolean;
  onShowCashOut: () => void;
  onHideCashOut: () => void;
  onCashOutConfirm: () => void;
  // risk flow removed
}> = ({
  run,
  nodes,
  runState,
  onNodePress,
  showCashOutModal,
  isFreeReturn,
  onShowCashOut,
  onHideCashOut,
  onCashOutConfirm,
}) => {
  // Calculate return cost - 0 if free return, otherwise use normal calculation
  const energyCalculator = new EnergyCalculator();
  const returnCost = isFreeReturn
    ? 0
    : runState
      ? energyCalculator.calculateReturnCost(
          runState.currentDepth,
          runState.discoveredShortcuts
        )
      : 0;
  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="p-4">
        <Text className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          Delver's Descent
        </Text>
        <CharacterInfo />
        <RunDetailsCard run={run} />
        <RunStatusPanel
          energyRemaining={runState?.energyRemaining || 0}
          returnCost={returnCost}
          currentDepth={runState?.currentDepth || 0}
        />
      </View>
      {nodes.length > 0 && runState && (
        <InteractiveMap
          nodes={nodes}
          runState={runState}
          onNodePress={onNodePress}
        />
      )}
      <NavigationControls
        onCashOut={onShowCashOut}
        energyRemaining={runState?.energyRemaining || 0}
        returnCost={returnCost}
      />
      {runState && (
        <CashOutModal
          visible={showCashOutModal}
          runState={runState}
          returnCost={returnCost}
          onConfirm={onCashOutConfirm}
          onCancel={onHideCashOut}
        />
      )}
    </View>
  );
};

export default function ActiveRunRoute() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const runId = params.id as string;
  return <ActiveRunScreen router={router} runId={runId} />;
}

function ActiveRunScreen({ router, runId }: { router: any; runId: string }) {
  const controllers = useActiveRunControllers({ router, runId });
  if (controllers.isLoading) return <LoadingView />;
  if (controllers.error || !controllers.run)
    return (
      <ErrorView error={controllers.error || 'Run not found'} router={router} />
    );
  if (
    controllers.handlers.showEncounter &&
    controllers.handlers.selectedNode &&
    controllers.run
  ) {
    return (
      <EncounterView
        run={controllers.run}
        node={controllers.handlers.selectedNode}
        onReturnToMap={controllers.handlers.handleReturnToMap}
        onEncounterComplete={controllers.handlers.handleEncounterComplete}
      />
    );
  }
  return (
    <MapView
      run={controllers.run}
      nodes={controllers.nodes}
      runState={controllers.runState}
      onNodePress={controllers.handleNodePress}
      showCashOutModal={controllers.showCashOutModal}
      isFreeReturn={controllers.isFreeReturn}
      onShowCashOut={controllers.showCashOut}
      onHideCashOut={controllers.hideCashOut}
      onCashOutConfirm={controllers.handleCashOutConfirm}
    />
  );
}

function useActiveRunControllers({
  router,
  runId,
}: {
  router: any;
  runId: string;
}) {
  const [showCashOutModal, setShowCashOutModal] = useState(false);
  const [isFreeReturn, setIsFreeReturn] = useState(false);
  const data = useActiveRunData(runId);
  const handleEnergyUpdate = useEnergyUpdateHandler({
    updateEnergy: data.updateEnergy,
    runState: data.runState,
    run: data.run,
    router,
  });
  const handleInventoryUpdate = buildInventoryUpdater(data.addToInventory);
  const { handlers, handleNodePress } = useHandlersWiring({
    runState: data.runState,
    handleEnergyUpdate,
    handleInventoryUpdate,
    markNodeVisited: data.markNodeVisited,
    updateDepth: data.updateDepth,
    run: data.run,
    router,
    onTriggerCashOut: () => {
      setIsFreeReturn(true);
      setShowCashOutModal(true);
    },
  });
  const { handleCashOutConfirm } = useCashOutFlow({
    run: data.run,
    runState: data.runState,
    router,
    setShowCashOutModal: (v: boolean) => {
      setShowCashOutModal(v);
      if (!v) {
        setIsFreeReturn(false); // Reset when modal closes
      }
    },
  });
  // Removed risk flow and "Continue Deeper" UX
  return {
    run: data.run,
    nodes: data.nodes,
    runState: data.runState,
    isLoading: data.isLoading,
    error: data.error,
    handlers,
    handleNodePress,
    handleCashOutConfirm,
    // risk flow removed
    showCashOutModal,
    isFreeReturn,
    showCashOut: () => {
      setIsFreeReturn(false);
      setShowCashOutModal(true);
    },
    hideCashOut: () => {
      setIsFreeReturn(false);
      setShowCashOutModal(false);
    },
  } as const;
}

function buildInventoryUpdater(addToInventory: (item: any) => void) {
  return (items: any[]) => {
    items.forEach((item) =>
      addToInventory({
        id: item.id || `item-${Date.now()}`,
        name: item.name || 'Unknown Item',
        type: item.type || 'misc',
        value: item.value || 0,
        description: item.description || '',
        ...(item.setId && { setId: item.setId }),
      })
    );
  };
}

function useHandlersWiring({
  runState,
  handleEnergyUpdate,
  handleInventoryUpdate,
  markNodeVisited,
  updateDepth,
  run,
  router,
  onTriggerCashOut,
}: {
  runState: RunState | null;
  handleEnergyUpdate: (delta: number) => void;
  handleInventoryUpdate: (items: any[]) => void;
  markNodeVisited: (id: string) => void;
  updateDepth: (d: number) => void;
  run: DelvingRun | null;
  router: any;
  onTriggerCashOut?: () => void;
}) {
  const handlers = useEncounterHandlers({
    runState,
    onEnergyUpdate: handleEnergyUpdate,
    onInventoryUpdate: handleInventoryUpdate,
    onNodeVisited: markNodeVisited,
    onDepthUpdate: updateDepth,
    onTriggerCashOut,
  });
  const handleNodePress = useNodePressHandler({
    handlers,
    runState,
    run,
    router,
  });
  return { handlers, handleNodePress } as const;
}

function useEnergyUpdateHandler({
  updateEnergy,
  runState,
  run,
  router,
}: {
  updateEnergy: (updater: (current: number) => number) => void;
  runState: RunState | null;
  run: DelvingRun | null;
  router: any;
}) {
  return useCallback(
    (energyDelta: number) => {
      updateEnergy((currentEnergy: number) => {
        const newEnergy = currentEnergy + energyDelta;
        if (newEnergy <= 0 && runState && run) {
          const itemsLost = runState.inventory.length;
          const energyLost = currentEnergy;
          router.push({
            pathname: '/(app)/bust-screen',
            params: {
              consequence: JSON.stringify({
                itemsLost,
                energyLost,
                xpPreserved: true,
                xpAmount: run.steps,
                message:
                  'You ran out of energy and could not afford to return safely.',
              }),
            },
          });
        }
        return newEnergy;
      });
    },
    [updateEnergy, runState, run, router]
  );
}

function useNodePressHandler({
  handlers,
  runState,
  run,
  router,
}: {
  handlers: ReturnType<typeof useEncounterHandlers>;
  runState: RunState | null;
  run: DelvingRun | null;
  router: any;
}) {
  return useCallback(
    (node: DungeonNode) => {
      handlers.handleNodePress(node, runState, () => {
        if (runState && run) {
          const itemsLost = runState.inventory.length;
          const energyLost = runState.energyRemaining;
          router.push({
            pathname: '/(app)/bust-screen',
            params: {
              consequence: JSON.stringify({
                itemsLost,
                energyLost,
                xpPreserved: true,
                xpAmount: run.steps,
                message:
                  'You ran out of energy and could not afford to continue.',
              }),
            },
          });
        }
      });
    },
    [handlers, runState, run, router]
  );
}

function EncounterView({
  run,
  node,
  onReturnToMap,
  onEncounterComplete,
}: {
  run: DelvingRun;
  node: DungeonNode;
  onReturnToMap: () => void;
  onEncounterComplete: (result: 'success' | 'failure', rewards?: any[]) => void;
}) {
  return (
    <EncounterScreen
      run={run}
      node={node}
      onReturnToMap={onReturnToMap}
      onEncounterComplete={onEncounterComplete}
    />
  );
}
