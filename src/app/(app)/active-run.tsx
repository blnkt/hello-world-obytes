import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import { InteractiveMap } from '@/components/delvers-descent/active-run/interactive-map';
import { NavigationControls } from '@/components/delvers-descent/active-run/navigation-controls';
import { RunStatusPanel } from '@/components/delvers-descent/active-run/run-status-panel';
import { EncounterScreen } from '@/components/delvers-descent/encounters/encounter-screen';
import { useMapGenerator } from '@/components/delvers-descent/hooks/use-map-generator';
import { getRunQueueManager } from '@/lib/delvers-descent/run-queue';
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
  const { generateFullMap } = useMapGenerator();

  useEffect(() => {
    const loadRun = async () => {
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
    };

    if (runId) {
      loadRun();
    }
  }, [runId, generateFullMap]);

  const updateEnergy = (newEnergy: number | ((current: number) => number)) => {
    setRunState((prevState) => {
      if (!prevState) return prevState;
      const energyValue =
        typeof newEnergy === 'function' ? newEnergy(prevState.energyRemaining) : newEnergy;
      return {
        ...prevState,
        energyRemaining: energyValue,
      };
    });
  };

  const addToInventory = (item: any) => {
    setRunState((prevState) => {
      if (!prevState) return prevState;
      return {
        ...prevState,
        inventory: [...prevState.inventory, item],
      };
    });
  };

  const markNodeVisited = (nodeId: string) => {
    setRunState((prevState) => {
      if (!prevState || prevState.visitedNodes.includes(nodeId)) return prevState;
      return {
        ...prevState,
        visitedNodes: [...prevState.visitedNodes, nodeId],
        currentNode: nodeId,
      };
    });
  };

  const updateDepth = (newDepth: number) => {
    setRunState((prevState) => {
      if (!prevState) return prevState;
      return {
        ...prevState,
        currentDepth: newDepth,
      };
    });
  };

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

const useEncounterHandlers = (params: {
  runState: RunState | null;
  onEnergyUpdate: (energyDelta: number) => void;
  onInventoryUpdate: (items: any[]) => void;
  onNodeVisited: (nodeId: string) => void;
  onDepthUpdate: (depth: number) => void;
}) => {
  const { runState, onEnergyUpdate, onInventoryUpdate, onNodeVisited, onDepthUpdate } = params;
  const [selectedNode, setSelectedNode] = useState<DungeonNode | null>(null);
  const [showEncounter, setShowEncounter] = useState(false);

  const handleNodePress = (
    node: DungeonNode,
    currentRunState: RunState | null
  ) => {
    if (!currentRunState) return false;
    if (currentRunState.energyRemaining < node.energyCost) {
      alert('Not enough energy to reach this node!');
      return false;
    }
    setSelectedNode(node);
    setShowEncounter(true);
    return true;
  };

  const handleEncounterComplete = (
    result: 'success' | 'failure',
    rewards?: any[]
  ) => {
    if (!selectedNode || !runState) {
      setShowEncounter(false);
      return;
    }

    // Consume energy for visiting the node
    onEnergyUpdate(-selectedNode.energyCost);

    // Add rewards to inventory if successful
    if (result === 'success' && rewards) {
      onInventoryUpdate(rewards);
    }

    // Mark node as visited
    onNodeVisited(selectedNode.id);

    // Update depth if we went deeper
    if (selectedNode.depth > runState.currentDepth) {
      onDepthUpdate(selectedNode.depth);
    }

    console.log('Encounter completed:', {
      result,
      node: selectedNode,
      rewards,
      energyUsed: selectedNode.energyCost,
    });

    setShowEncounter(false);
  };

  return {
    selectedNode,
    showEncounter,
    handleNodePress,
    handleReturnToMap: () => setShowEncounter(false),
    handleEncounterComplete,
  };
};

const MapView: React.FC<{
  run: DelvingRun;
  nodes: DungeonNode[];
  runState: RunState | null;
  onNodePress: (node: DungeonNode) => void;
  router: any;
}> = ({ run, nodes, runState, onNodePress, router }) => (
  <View className="flex-1 bg-gray-50 dark:bg-gray-900">
    <View className="p-4">
      <Text className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
        Delver's Descent
      </Text>
      <RunDetailsCard run={run} />
      <RunStatusPanel
        energyRemaining={runState?.energyRemaining || 0}
        returnCost={100}
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
      onCashOut={() => {
        alert('Cash out functionality coming soon!');
        router.back();
      }}
      onContinue={() => {
        alert('Continue functionality - progress through dungeon deeper');
      }}
      energyRemaining={runState?.energyRemaining || 0}
      returnCost={100}
    />
  </View>
);

export default function ActiveRunRoute() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const runId = params.id as string;
  const {
    run,
    nodes,
    runState,
    isLoading,
    error,
    updateEnergy,
    addToInventory,
    markNodeVisited,
    updateDepth,
  } = useActiveRunData(runId);

  const handleEnergyUpdate = useCallback(
    (energyDelta: number) => {
      updateEnergy((currentEnergy: number) => currentEnergy + energyDelta);
    },
    [updateEnergy]
  );

  const handleInventoryUpdate = (items: any[]) => {
    items.forEach((item) => {
      addToInventory({
        id: item.id || `item-${Date.now()}`,
        name: item.name || 'Unknown Item',
        type: item.type || 'misc',
        value: item.value || 0,
        description: item.description || '',
      });
    });
  };

  const handlers = useEncounterHandlers({
    runState,
    onEnergyUpdate: handleEnergyUpdate,
    onInventoryUpdate: handleInventoryUpdate,
    onNodeVisited: markNodeVisited,
    onDepthUpdate: updateDepth,
  });

  const handleNodePress = (node: DungeonNode) => {
    handlers.handleNodePress(node, runState);
  };

  if (isLoading) return <LoadingView />;
  if (error || !run)
    return <ErrorView error={error || 'Run not found'} router={router} />;

  if (handlers.showEncounter && handlers.selectedNode && run) {
    return (
      <EncounterScreen
        run={run}
        node={handlers.selectedNode}
        onReturnToMap={handlers.handleReturnToMap}
        onEncounterComplete={handlers.handleEncounterComplete}
      />
    );
  }

  return (
    <MapView
      run={run}
      nodes={nodes}
      runState={runState}
      onNodePress={handleNodePress}
      router={router}
    />
  );
}
