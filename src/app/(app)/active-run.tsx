import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import { CashOutModal } from '@/components/delvers-descent/active-run/cash-out-modal';
import { InteractiveMap } from '@/components/delvers-descent/active-run/interactive-map';
import { NavigationControls } from '@/components/delvers-descent/active-run/navigation-controls';
import { RiskWarningModal } from '@/components/delvers-descent/active-run/risk-warning-modal';
import { RunStatusPanel } from '@/components/delvers-descent/active-run/run-status-panel';
import { EncounterScreen } from '@/components/delvers-descent/encounters/encounter-screen';
import { useMapGenerator } from '@/components/delvers-descent/hooks/use-map-generator';
import { AchievementManager } from '@/lib/delvers-descent/achievement-manager';
import { ALL_ACHIEVEMENTS } from '@/lib/delvers-descent/achievement-types';
import { CollectionManager } from '@/lib/delvers-descent/collection-manager';
import { ALL_COLLECTION_SETS } from '@/lib/delvers-descent/collection-sets';
import { getRunQueueManager } from '@/lib/delvers-descent/run-queue';
import { getRunStateManager } from '@/lib/delvers-descent/run-state-manager';
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
  const [maxDepth, setMaxDepth] = useState(5);
  const { generateFullMap, generateDepthLevel } = useMapGenerator();

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
      
      // Update depth to the new depth
      const updatedDepth = Math.max(prevState.currentDepth, newDepth);
      
      console.log('updateDepth called:', { 
        currentDepth: prevState.currentDepth, 
        newDepth, 
        updatedDepth,
        maxDepth,
        willGenerate: updatedDepth >= maxDepth
      });
      
      // If we're going deeper than current max depth, generate new level
      if (updatedDepth >= maxDepth) {
        console.log('Generating new level:', maxDepth + 1);
        const newNodes = generateDepthLevel(maxDepth + 1);
        setNodes((prevNodes) => {
          console.log('Adding nodes:', newNodes.length, 'Total nodes:', prevNodes.length + newNodes.length);
          return [...prevNodes, ...newNodes];
        });
        setMaxDepth(maxDepth + 1);
      }
      
      return {
        ...prevState,
        currentDepth: updatedDepth,
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
  const { onEnergyUpdate, onInventoryUpdate, onNodeVisited, onDepthUpdate } = params;
  const [selectedNode, setSelectedNode] = useState<DungeonNode | null>(null);
  const [showEncounter, setShowEncounter] = useState(false);

  const handleNodePress = useCallback(
    (node: DungeonNode, currentRunState: RunState | null, onBust?: () => void) => {
      if (!currentRunState) return false;
      if (currentRunState.energyRemaining < node.energyCost) {
        // Check if we can't afford this node - might be bust
        if (onBust) {
          onBust();
        } else {
          alert('Not enough energy to reach this node!');
        }
        return false;
      }
      setSelectedNode(node);
      setShowEncounter(true);
      return true;
    },
    []
  );

  const handleEncounterComplete = useCallback(
    (
      result: 'success' | 'failure',
      rewards?: any[]
    ) => {
      if (!selectedNode) {
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
      // This allows access to next level nodes
      onDepthUpdate(selectedNode.depth);

      setShowEncounter(false);
    },
    [selectedNode, onEnergyUpdate, onInventoryUpdate, onNodeVisited, onDepthUpdate]
  );

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
  showCashOutModal: boolean;
  onShowCashOut: () => void;
  onHideCashOut: () => void;
  onCashOutConfirm: () => void;
  showRiskWarning: boolean;
  riskWarning: { type: 'safe' | 'caution' | 'danger' | 'critical'; message: string; severity: number } | null;
  onShowRiskWarning: () => void;
  onHideRiskWarning: () => void;
  onConfirmRisk: () => void;
}> = ({
  run,
  nodes,
  runState,
  onNodePress,
  router,
  showCashOutModal,
  onShowCashOut,
  onHideCashOut,
  onCashOutConfirm,
  showRiskWarning,
  riskWarning,
  onShowRiskWarning,
  onHideRiskWarning,
  onConfirmRisk,
}) => {
  return (
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
      onCashOut={onShowCashOut}
      onContinue={onShowRiskWarning}
      energyRemaining={runState?.energyRemaining || 0}
      returnCost={100}
    />
    {runState && (
      <>
        <CashOutModal
          visible={showCashOutModal}
          runState={runState}
          returnCost={100}
          onConfirm={onCashOutConfirm}
          onCancel={onHideCashOut}
        />
        {riskWarning && (
          <RiskWarningModal
            visible={showRiskWarning}
            warning={riskWarning}
            onConfirm={onConfirmRisk}
            onCancel={onHideRiskWarning}
          />
        )}
      </>
    )}
    </View>
  );
};

export default function ActiveRunRoute() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const runId = params.id as string;
  const [showCashOutModal, setShowCashOutModal] = useState(false);
  const [showRiskWarning, setShowRiskWarning] = useState(false);
  const [riskWarning, setRiskWarning] = useState<{ type: 'safe' | 'caution' | 'danger' | 'critical'; message: string; severity: number } | null>(null);
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
      updateEnergy((currentEnergy: number) => {
        const newEnergy = currentEnergy + energyDelta;
        
        // Check if energy has been exhausted
        if (newEnergy <= 0 && runState && run) {
          // Trigger bust
          const itemsLost = runState.inventory.length;
          const energyLost = currentEnergy; // All energy was lost
          
          // Navigate to bust screen
          router.push({
            pathname: '/(app)/bust-screen',
            params: {
              consequence: JSON.stringify({
                itemsLost,
                energyLost,
                xpPreserved: true,
                xpAmount: run.steps, // Preserve XP from steps
                message: 'You ran out of energy and could not afford to return safely.',
              }),
            },
          });
        }
        
        return newEnergy;
      });
    },
    [updateEnergy, runState, run, router]
  );

  const handleInventoryUpdate = (items: any[]) => {
    items.forEach((item) => {
      addToInventory({
        id: item.id || `item-${Date.now()}`,
        name: item.name || 'Unknown Item',
        type: item.type || 'misc',
        value: item.value || 0,
        description: item.description || '',
        // Preserve setId if it exists (required for collections)
        ...(item.setId && { setId: item.setId }),
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
    handlers.handleNodePress(node, runState, () => {
      // Trigger bust if can't afford node
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
              message: 'You ran out of energy and could not afford to continue.',
            }),
          },
        });
      }
    });
  };

  const handleCashOutConfirm = async () => {
    if (!runState || !run) return;

    setShowCashOutModal(false);

    try {
      const runQueueManager = getRunQueueManager();
      const collectionManager = new CollectionManager(ALL_COLLECTION_SETS);
      const achievementManager = new AchievementManager(ALL_ACHIEVEMENTS);

      // Use the local runState directly (it's not stored in RunStateManager singleton)
      const completionResult = {
        finalInventory: runState.inventory,
        totalEnergyUsed: run.totalEnergy - runState.energyRemaining,
        deepestDepth: runState.currentDepth,
        shortcutsDiscovered: runState.discoveredShortcuts,
      };

      // Add collected items to CollectionManager
      // Map CollectedItem to CollectedItemTracking and add to collection
      for (const item of completionResult.finalInventory) {
        // Only add items that belong to a collection set
        if (item.setId && (item.type === 'trade_good' || item.type === 'discovery' || item.type === 'legendary')) {
          await collectionManager.addCollectedItem({
            itemId: item.id,
            setId: item.setId,
            collectedDate: Date.now(),
            runId: run.id,
            source: 'encounter',
          });
        }
      }

      // Process achievement events
      // Depth achievement (for milestones)
      achievementManager.processEvent({
        type: 'depth_reached',
        data: {
          depth: completionResult.deepestDepth,
          cashOut: true,
        },
        timestamp: new Date(),
      });

      // Collection achievement (for each completed set)
      const progress = await collectionManager.getCollectionProgress();
      for (const setId of progress.completedSets) {
        achievementManager.processEvent({
          type: 'collection_completed',
          data: {
            collectionSetId: setId,
          },
          timestamp: new Date(),
        });
      }

      // Save achievements
      const { saveAchievements } = await import('@/lib/delvers-descent/achievement-persistence');
      await saveAchievements(achievementManager);

      // Update run status to completed
      // Store completion metadata (depth, items count, total value) in run metadata
      const totalValue = completionResult.finalInventory.reduce(
        (sum, item) => sum + item.value,
        0
      );
      runQueueManager.updateRunStatus(run.id, 'completed');

      // Store completion data for history (we'll need to extend DelvingRun or store separately)
      // For now, the completion data is stored in CollectionManager, so run history can show items collected
      
      // Navigate back to run queue
      router.push('/(app)/run-queue');
    } catch (error) {
      console.error('Failed to complete cash out:', error);
      alert('Failed to complete cash out. Please try again.');
    }
  };

  const handleContinue = () => {
    if (!runState) return;

    const safetyMargin = runState.energyRemaining - 100; // returnCost

    // Determine risk level and show appropriate warning
    let warningType: 'safe' | 'caution' | 'danger' | 'critical';
    let message: string;
    let severity: number;

    if (safetyMargin < 0) {
      warningType = 'critical';
      message = 'You cannot return safely! Going deeper risks losing all progress.';
      severity = 10;
    } else if (safetyMargin < 50) {
      warningType = 'danger';
      message = 'Dangerous energy levels! You may not be able to return if you continue.';
      severity = 8;
    } else if (safetyMargin < 150) {
      warningType = 'caution';
      message = 'Low energy remaining. Consider cashing out to secure your rewards.';
      severity = 5;
    } else {
      // Don't show warning for safe energy levels
      return;
    }

    setRiskWarning({ type: warningType, message, severity });
    setShowRiskWarning(true);
  };

  const handleConfirmRisk = () => {
    setShowRiskWarning(false);
    setRiskWarning(null);
    // Unlock the next level for exploration
    updateDepth((runState?.currentDepth || 0) + 1);
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
      showCashOutModal={showCashOutModal}
      onShowCashOut={() => setShowCashOutModal(true)}
      onHideCashOut={() => setShowCashOutModal(false)}
      onCashOutConfirm={handleCashOutConfirm}
      showRiskWarning={showRiskWarning}
      riskWarning={riskWarning}
      onShowRiskWarning={handleContinue}
      onHideRiskWarning={() => {
        setShowRiskWarning(false);
        setRiskWarning(null);
      }}
      onConfirmRisk={handleConfirmRisk}
    />
  );
}
