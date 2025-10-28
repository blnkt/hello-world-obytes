import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import { InteractiveMap } from '@/components/delvers-descent/active-run/interactive-map';
import { RunStatusPanel } from '@/components/delvers-descent/active-run/run-status-panel';
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

  return { run, nodes, runState, isLoading, error };
};

export default function ActiveRunRoute() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const runId = params.id as string;
  const { run, nodes, runState, isLoading, error } = useActiveRunData(runId);

  const handleNodePress = (node: DungeonNode) => {
    if (!runState || !run) return;

    if (runState.energyRemaining < node.energyCost) {
      alert('Not enough energy to reach this node!');
      return;
    }

    console.log('Node pressed:', node);
    alert(`Encounter: ${node.type}`);
  };

  if (isLoading) {
    return <LoadingView />;
  }

  if (error || !run) {
    return <ErrorView error={error || 'Run not found'} router={router} />;
  }

  const currentDepth = runState?.currentDepth || 0;
  const energyRemaining = runState?.energyRemaining || 0;
  const returnCost = 100; // TODO: Calculate from current depth

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="p-4">
        <Text className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          Delver's Descent
        </Text>
        <RunDetailsCard run={run} />

        <RunStatusPanel
          energyRemaining={energyRemaining}
          returnCost={returnCost}
          currentDepth={currentDepth}
        />
      </View>

      {nodes.length > 0 && runState && (
        <InteractiveMap
          nodes={nodes}
          runState={runState}
          onNodePress={handleNodePress}
        />
      )}

      <View className="p-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="rounded-lg bg-blue-500 py-3"
        >
          <Text className="text-center font-semibold text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
