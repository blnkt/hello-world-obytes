import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import { CashOutModal } from '@/components/delvers-descent/active-run/cash-out-modal';
import { InteractiveMap } from '@/components/delvers-descent/active-run/interactive-map';
import { NavigationControls } from '@/components/delvers-descent/active-run/navigation-controls';
import { RunStatusPanel } from '@/components/delvers-descent/active-run/run-status-panel';
import { EncounterScreen } from '@/components/delvers-descent/encounters/encounter-screen';
import { useMapGenerator } from '@/components/delvers-descent/hooks/use-map-generator';
import { RegionUnlockNotification } from '@/components/delvers-descent/region-unlock-notification';
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

// eslint-disable-next-line max-lines-per-function
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
    async (newDepth: number) => {
      const updated = await updateDepthImpl({
        prevState: runState,
        newDepth,
        maxDepth,
        generateDepthLevel,
        setNodes,
        setMaxDepth,
      });
      setRunState(updated);
    },
    [maxDepth, generateDepthLevel, runState]
  );

  const updateRegion = React.useCallback(
    (newRegionId: string) =>
      setRunState((prev) => {
        if (!prev) return prev;
        return { ...prev, currentRegionId: newRegionId };
      }),
    []
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
    updateRegion,
  };
};

// eslint-disable-next-line max-lines-per-function
const useEncounterHandlers = (params: {
  runState: RunState | null;
  nodes: DungeonNode[];
  onEnergyUpdate: (energyDelta: number) => void;
  onInventoryUpdate: (items: any[]) => void;
  onNodeVisited: (nodeId: string) => void;
  onDepthUpdate: (depth: number) => void;
  onTriggerCashOut?: () => void;
  onRegionUpdate?: (regionId: string) => void;
  onRegenerateMap?: (
    nodes: DungeonNode[],
    visitedNodes: string[],
    newRegionId: string
  ) => Promise<void>;
}) => {
  const {
    onEnergyUpdate,
    onInventoryUpdate,
    onNodeVisited,
    onDepthUpdate,
    onTriggerCashOut,
    onRegionUpdate,
    onRegenerateMap,
    runState,
    nodes,
  } = params;
  const [selectedNode, setSelectedNode] = useState<DungeonNode | null>(null);
  const [showEncounter, setShowEncounter] = useState(false);
  const [unlockedRegionId, setUnlockedRegionId] = useState<string | undefined>(
    undefined
  );

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
    async (params: {
      result: 'success' | 'failure';
      rewards?: any[];
      targetRegionId?: string;
      unlockedRegionId?: string;
    }) => {
      await handleEncounterCompleteImpl({
        selectedNode,
        setShowEncounter,
        onEnergyUpdate,
        onInventoryUpdate,
        onNodeVisited,
        onDepthUpdate,
        onTriggerCashOut,
        onRegionUpdate,
        onRegenerateMap,
        runState,
        nodes,
        result: params.result,
        rewards: params.rewards,
        targetRegionId: params.targetRegionId,
        _unlockedRegionId: params.unlockedRegionId,
      });
      // Store unlockedRegionId to display notification after returning to map
      if (params.unlockedRegionId) {
        setUnlockedRegionId(params.unlockedRegionId);
      }
    },
    [
      selectedNode,
      onEnergyUpdate,
      onInventoryUpdate,
      onNodeVisited,
      onDepthUpdate,
      onTriggerCashOut,
      onRegionUpdate,
      onRegenerateMap,
      runState,
      nodes,
    ]
  );

  const handleReturnToMap = useCallback(() => setShowEncounter(false), []);

  return {
    selectedNode,
    showEncounter,
    handleNodePress,
    handleReturnToMap,
    handleEncounterComplete,
    unlockedRegionId,
    setUnlockedRegionId,
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

async function updateDepthImpl({
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
  generateDepthLevel: (
    depth: number,
    regionKey?: string
  ) => Promise<DungeonNode[]>;
  setNodes: React.Dispatch<React.SetStateAction<DungeonNode[]>>;
  setMaxDepth: React.Dispatch<React.SetStateAction<number>>;
}): Promise<RunState | null> {
  if (!prevState) return prevState;
  const updatedDepth = Math.max(prevState.currentDepth, newDepth);
  if (updatedDepth >= maxDepth) {
    const regionKey = prevState.currentRegionId;
    const newNodes = await generateDepthLevel(maxDepth + 1, regionKey);
    setNodes((prevNodes) => [...prevNodes, ...newNodes]);
    setMaxDepth(maxDepth + 1);
  }
  return { ...prevState, currentDepth: updatedDepth };
}

async function regenerateUnvisitedNodesWithRegion(params: {
  nodes: DungeonNode[];
  visitedNodes: string[];
  newRegionId: string;
  generateDepthLevel: (
    depth: number,
    regionKey?: string
  ) => Promise<DungeonNode[]>;
}): Promise<DungeonNode[]> {
  const { nodes, visitedNodes, newRegionId, generateDepthLevel } = params;
  const visitedSet = new Set(visitedNodes);
  const visitedNodesList = nodes.filter((node) => visitedSet.has(node.id));
  const unvisitedNodes = nodes.filter((node) => !visitedSet.has(node.id));

  // Group unvisited nodes by depth to preserve structure
  const nodesByDepth = new Map<number, DungeonNode[]>();
  unvisitedNodes.forEach((node) => {
    const depth = node.depth;
    if (!nodesByDepth.has(depth)) {
      nodesByDepth.set(depth, []);
    }
    nodesByDepth.get(depth)!.push(node);
  });

  // Use region ID directly as region key
  // The map generator will fall back to default if the region key doesn't exist in balance config
  const regionKey = newRegionId;

  // Regenerate nodes for each depth, preserving IDs and connections
  const regeneratedNodes: DungeonNode[] = [];
  for (const [depth, oldNodesAtDepth] of nodesByDepth.entries()) {
    // Generate new nodes with new encounter types
    const newNodes = await generateDepthLevel(depth, regionKey);

    // Map old nodes to new nodes by position, preserving IDs and connections
    oldNodesAtDepth.forEach((oldNode, index) => {
      const newNode = newNodes[index] || newNodes[0]; // Fallback to first if index mismatch
      regeneratedNodes.push({
        ...oldNode, // Preserve ID, connections, and other properties
        type: newNode.type, // Update encounter type with new region's distribution
        energyCost: newNode.energyCost, // Update energy cost (may vary by encounter type)
        returnCost: newNode.returnCost, // Update return cost
      });
    });
  }

  // Combine visited nodes (unchanged) with regenerated unvisited nodes
  return [...visitedNodesList, ...regeneratedNodes];
}

// eslint-disable-next-line max-lines-per-function
async function handleEncounterCompleteImpl({
  selectedNode,
  setShowEncounter,
  onEnergyUpdate,
  onInventoryUpdate,
  onNodeVisited,
  onDepthUpdate,
  onTriggerCashOut,
  onRegionUpdate,
  onRegenerateMap,
  runState,
  nodes,
  result,
  rewards,
  targetRegionId,
  _unlockedRegionId,
}: {
  selectedNode: DungeonNode | null;
  setShowEncounter: (v: boolean) => void;
  onEnergyUpdate: (delta: number) => void;
  onInventoryUpdate: (items: any[]) => void;
  onNodeVisited: (id: string) => void;
  onDepthUpdate: (depth: number) => void;
  onTriggerCashOut?: () => void;
  onRegionUpdate?: (regionId: string) => void;
  onRegenerateMap?: (
    nodes: DungeonNode[],
    visitedNodes: string[],
    newRegionId: string
  ) => Promise<void>;
  runState: RunState | null;
  nodes: DungeonNode[];
  result: 'success' | 'failure';
  rewards?: any[];
  targetRegionId?: string;
  _unlockedRegionId?: string; // Used by caller to track unlocked region
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

    // Mark all nodes at this depth as visited to prevent backtracking or same-depth encounters
    const completedDepth = selectedNode.depth;
    const nodesAtDepth = nodes.filter((node) => node.depth === completedDepth);
    nodesAtDepth.forEach((node) => {
      if (node.id !== selectedNode.id) {
        onNodeVisited(node.id);
      }
    });

    onDepthUpdate(selectedNode.depth);
    setShowEncounter(false);
    // Trigger cash out with free return (return cost will be handled in cash out modal)
    onTriggerCashOut();
    return;
  }

  // If this is a region shortcut encounter and it succeeded, update the region
  if (
    selectedNode.type === 'region_shortcut' &&
    result === 'success' &&
    targetRegionId &&
    onRegionUpdate &&
    onRegenerateMap &&
    runState
  ) {
    // Process the encounter normally (deduct energy, mark visited, etc.)
    onEnergyUpdate(-selectedNode.energyCost);
    if (rewards) {
      onInventoryUpdate(rewards);
    }
    onNodeVisited(selectedNode.id);

    // Mark all nodes at this depth as visited to prevent backtracking or same-depth encounters
    const completedDepth = selectedNode.depth;
    const nodesAtDepth = nodes.filter((node) => node.depth === completedDepth);
    nodesAtDepth.forEach((node) => {
      if (node.id !== selectedNode.id) {
        onNodeVisited(node.id);
      }
    });

    onDepthUpdate(selectedNode.depth);
    // Update region in RunState
    onRegionUpdate(targetRegionId);
    // Regenerate unvisited nodes with new region's encounter distribution
    await onRegenerateMap(nodes, runState.visitedNodes, targetRegionId);
    setShowEncounter(false);
    return;
  }

  // Normal encounter completion
  onEnergyUpdate(-selectedNode.energyCost);
  if (result === 'success' && rewards) {
    onInventoryUpdate(rewards);
  }
  onNodeVisited(selectedNode.id);

  // Mark all nodes at this depth as visited to prevent backtracking or same-depth encounters
  const completedDepth = selectedNode.depth;
  const nodesAtDepth = nodes.filter((node) => node.depth === completedDepth);
  nodesAtDepth.forEach((node) => {
    if (node.id !== selectedNode.id) {
      onNodeVisited(node.id);
    }
  });

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
  generateFullMap: (depth: number) => Promise<DungeonNode[]>;
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
      const mapNodes = await generateFullMap(5);
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
  unlockedRegionId?: string;
  onCloseUnlockNotification: () => void;
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
  unlockedRegionId,
  onCloseUnlockNotification,
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

      <RegionUnlockNotification
        regionId={unlockedRegionId}
        visible={!!unlockedRegionId}
        onClose={onCloseUnlockNotification}
      />
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

  const handleCloseUnlockNotification = useCallback(() => {
    controllers.handlers.setUnlockedRegionId?.(undefined);
  }, [controllers.handlers]);

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
        runState={controllers.runState}
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
      unlockedRegionId={controllers.handlers.unlockedRegionId}
      onCloseUnlockNotification={handleCloseUnlockNotification}
    />
  );
}

// eslint-disable-next-line max-lines-per-function
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
  const { generateDepthLevel } = useMapGenerator();
  const [nodes, setNodes] = useState<DungeonNode[]>(data.nodes);

  // Sync nodes when data.nodes changes
  React.useEffect(() => {
    setNodes(data.nodes);
  }, [data.nodes]);

  const handleEnergyUpdate = useEnergyUpdateHandler({
    updateEnergy: data.updateEnergy,
    runState: data.runState,
    run: data.run,
    router,
  });
  const handleInventoryUpdate = buildInventoryUpdater(data.addToInventory);
  const regenerateMap = React.useCallback(
    async (
      currentNodes: DungeonNode[],
      visitedNodes: string[],
      newRegionId: string
    ) => {
      const regenerated = await regenerateUnvisitedNodesWithRegion({
        nodes: currentNodes,
        visitedNodes,
        newRegionId,
        generateDepthLevel,
      });
      setNodes(regenerated);
    },
    [generateDepthLevel]
  );

  const { handlers, handleNodePress } = useHandlersWiring({
    runState: data.runState,
    nodes: nodes,
    handleEnergyUpdate,
    handleInventoryUpdate,
    markNodeVisited: data.markNodeVisited,
    updateDepth: data.updateDepth,
    updateRegion: data.updateRegion,
    regenerateMap,
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
    nodes: nodes,
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

function useHandlersWiring(params: {
  runState: RunState | null;
  handleEnergyUpdate: (delta: number) => void;
  handleInventoryUpdate: (items: any[]) => void;
  markNodeVisited: (id: string) => void;
  updateDepth: (d: number) => void;
  updateRegion: (regionId: string) => void;
  regenerateMap: (
    nodes: DungeonNode[],
    visitedNodes: string[],
    newRegionId: string
  ) => Promise<void>;
  nodes: DungeonNode[];
  run: DelvingRun | null;
  router: any;
  onTriggerCashOut?: () => void;
}) {
  const {
    runState,
    handleEnergyUpdate,
    handleInventoryUpdate,
    markNodeVisited,
    updateDepth,
    updateRegion,
    regenerateMap,
    nodes,
    run,
    router,
    onTriggerCashOut,
  } = params;
  const handlers = useEncounterHandlers({
    runState,
    nodes,
    onEnergyUpdate: handleEnergyUpdate,
    onInventoryUpdate: handleInventoryUpdate,
    onNodeVisited: markNodeVisited,
    onDepthUpdate: updateDepth,
    onTriggerCashOut,
    onRegionUpdate: updateRegion,
    onRegenerateMap: regenerateMap,
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
  runState,
  onReturnToMap,
  onEncounterComplete,
}: {
  run: DelvingRun;
  node: DungeonNode;
  runState: RunState | null;
  onReturnToMap: () => void;
  onEncounterComplete: (params: {
    result: 'success' | 'failure';
    rewards?: any[];
    targetRegionId?: string;
    unlockedRegionId?: string;
  }) => void;
}) {
  const wrappedOnEncounterComplete = (encounterParams: {
    result: 'success' | 'failure';
    rewards?: any[];
    targetRegionId?: string;
    unlockedRegionId?: string;
  }) => {
    onEncounterComplete(encounterParams);
  };

  return (
    <EncounterScreen
      run={run}
      node={node}
      runState={runState}
      onReturnToMap={onReturnToMap}
      onEncounterComplete={wrappedOnEncounterComplete}
    />
  );
}
