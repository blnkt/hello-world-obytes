import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { DiscoverySiteEncounter } from '@/lib/delvers-descent/discovery-site-encounter';
import { FailureConsequenceManager } from '@/lib/delvers-descent/failure-consequence-manager';
import { RewardCalculator } from '@/lib/delvers-descent/reward-calculator';
import type { DelvingRun, DungeonNode } from '@/types/delvers-descent';

interface DiscoverySiteScreenProps {
  run: DelvingRun;
  node: DungeonNode;
  onReturnToMap: () => void;
  onEncounterComplete: (result: 'success' | 'failure', rewards?: any[]) => void;
}

const getRiskColor = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'low':
      return 'text-green-600 bg-green-100';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100';
    case 'high':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const getPathTypeColor = (type: string): string => {
  switch (type) {
    case 'safe':
      return 'border-green-300 bg-green-50';
    case 'risky':
      return 'border-yellow-300 bg-yellow-50';
    case 'dangerous':
      return 'border-red-300 bg-red-50';
    default:
      return 'border-gray-300 bg-gray-50';
  }
};

const SuccessScreen: React.FC<{
  rewards: any[];
  onReturnToMap: () => void;
}> = ({ rewards, onReturnToMap }) => (
  <ScrollView
    testID="encounter-success"
    className="flex min-h-screen items-center justify-center bg-gray-50"
  >
    <View className="mx-auto max-w-md p-6">
      <Text className="mb-4 text-center text-6xl">🎉</Text>
      <Text className="mb-4 text-center text-2xl font-bold text-gray-800">
        Exploration Complete!
      </Text>

      {rewards.length > 0 && (
        <View className="mb-6">
          <Text className="mb-2 text-center text-lg font-semibold text-gray-700">
            Rewards:
          </Text>
          <View className="gap-2">
            {rewards.map((reward, index) => (
              <View key={index} className="rounded-lg bg-yellow-100 p-3">
                <Text className="font-medium">{reward.name}</Text>
                <Text className="text-sm text-gray-600">
                  Value: {reward.value}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <Pressable
        onPress={onReturnToMap}
        testID="return-to-map"
        className="rounded-lg bg-blue-500 px-6 py-3"
      >
        <Text className="text-center text-white">Return to Map</Text>
      </Pressable>
    </View>
  </ScrollView>
);

const LoadingScreen: React.FC = () => (
  <View className="flex min-h-screen items-center justify-center bg-gray-50">
    <View>
      <View className="mx-auto size-32 animate-spin rounded-full border-b-2 border-blue-500" />
      <Text className="mt-4 text-center text-lg text-gray-600">
        Loading discovery site...
      </Text>
    </View>
  </View>
);

const PathCard: React.FC<{
  path: any;
  onSelect: (id: string) => void;
}> = ({ path, onSelect }) => (
  <Pressable
    key={path.id}
    testID={`exploration-path-${path.id}`}
    onPress={() => onSelect(path.id)}
    className={`w-full rounded-lg border p-4 ${getPathTypeColor(path.type)}`}
  >
    <View className="mb-2 flex-row items-start justify-between">
      <Text className="font-medium text-gray-800">Path {path.id}</Text>
      <View
        className={`rounded-full px-2 py-1 ${getRiskColor(path.outcome.riskLevel)}`}
      >
        <Text className="text-xs font-medium">
          {path.outcome.riskLevel} risk
        </Text>
      </View>
    </View>
    <Text className="mb-2 text-sm text-gray-600">{path.description}</Text>
    <View>
      <Text className="text-sm text-green-600">
        Reward: {path.outcome.rewards[0]?.value || 0}
      </Text>
      {path.outcome.consequences.length > 0 && (
        <Text className="text-sm text-red-600">
          Risk: {path.outcome.consequences[0].description}
        </Text>
      )}
    </View>
  </Pressable>
);

const RiskAssessmentCard: React.FC<{
  pathId: string;
  encounter: DiscoverySiteEncounter;
}> = ({ pathId, encounter }) => {
  const riskAssessment = encounter.getPathRiskAssessment(pathId);
  return (
    <View key={pathId} className="gap-3 rounded-lg border border-gray-200 p-3">
      <Text className="font-medium text-gray-800">Path {pathId}</Text>
      <Text className="text-sm text-gray-600">
        Risk Level: {riskAssessment.riskLevel}
      </Text>
      <Text className="text-sm text-gray-600">
        Reward Potential: {riskAssessment.rewardPotential}
      </Text>
      <View className="mt-2">
        <Text className="text-xs text-gray-500">Factors:</Text>
        {riskAssessment.factors.map((factor, index) => (
          <Text key={index} className="text-xs text-gray-500">
            • {factor}
          </Text>
        ))}
      </View>
    </View>
  );
};

const ExplorationPathsSection: React.FC<{
  paths: any[];
  onSelect: (id: string) => void;
}> = ({ paths, onSelect }) => (
  <View className="rounded-lg bg-white p-6 shadow-lg">
    <Text className="mb-4 text-xl font-semibold text-gray-800">
      Exploration Paths
    </Text>
    <View testID="exploration-paths" className="gap-4">
      {paths.map((path) => (
        <PathCard key={path.id} path={path} onSelect={onSelect} />
      ))}
    </View>
  </View>
);

const RiskAndHistorySection: React.FC<{
  paths: any[];
  encounter: DiscoverySiteEncounter;
  history: any[];
}> = ({ paths, encounter, history }) => (
  <View className="gap-6">
    <View className="rounded-lg bg-white p-6 shadow-lg">
      <Text className="mb-4 text-xl font-semibold text-gray-800">
        Risk Assessment
      </Text>
      <View testID="path-risk-assessment" className="gap-3">
        {paths.map((path) => (
          <RiskAssessmentCard
            key={path.id}
            pathId={path.id}
            encounter={encounter}
          />
        ))}
      </View>
    </View>

    <View className="rounded-lg bg-white p-6 shadow-lg">
      <Text className="mb-4 text-xl font-semibold text-gray-800">
        Regional History
      </Text>
      <View className="gap-3">
        {history.map((h, index) => (
          <View key={index} className="rounded-lg border border-gray-200 p-3">
            <Text className="font-medium text-gray-800">{h.region}</Text>
            <Text className="text-sm text-gray-600">{h.description}</Text>
            <Text className="text-xs text-gray-500">
              Era: {h.era} | Significance: {h.significance}
            </Text>
          </View>
        ))}
      </View>
    </View>
  </View>
);

const LoreSection: React.FC<{ lores: any[] }> = ({ lores }) => (
  <View className="mb-6 rounded-lg bg-white p-6 shadow-lg">
    <Text className="mb-4 text-xl font-semibold text-gray-800">
      Lore Discoveries
    </Text>
    <View testID="lore-discoveries" className="gap-3">
      {lores.map((lore, index) => (
        <View
          key={index}
          className="rounded-lg border border-purple-200 bg-purple-50 p-3"
        >
          <Text className="font-medium text-gray-800">{lore.title}</Text>
          <Text className="text-sm text-gray-600">{lore.content}</Text>
          <Text className="text-xs text-gray-500">
            Region: {lore.region} | Era: {lore.era}
          </Text>
        </View>
      ))}
    </View>
  </View>
);

const MapIntelligenceSection: React.FC<{ intels: any[] }> = ({ intels }) => (
  <View className="mb-6 rounded-lg bg-white p-6 shadow-lg">
    <Text className="mb-4 text-xl font-semibold text-gray-800">
      Map Intelligence
    </Text>
    <View testID="map-intelligence" className="grid grid-cols-1 gap-4">
      {intels.map((intel, index) => (
        <View
          key={index}
          className="rounded-lg border border-blue-200 bg-blue-50 p-3"
        >
          <Text className="font-medium text-gray-800">{intel.type}</Text>
          <Text className="text-sm text-gray-600">{intel.description}</Text>
          <Text className="text-xs text-gray-500">
            Depth: {intel.depth} | Value: {intel.value}
          </Text>
        </View>
      ))}
    </View>
  </View>
);

const ExplorationResultSection: React.FC<{ result: any }> = ({ result }) => (
  <View
    testID="exploration-result"
    className="mb-6 rounded-lg bg-white p-6 shadow-lg"
  >
    <Text className="mb-4 text-xl font-semibold text-gray-800">
      Exploration Result
    </Text>
    <View
      className={`rounded-lg p-4 ${result.success ? 'bg-green-100' : 'bg-red-100'}`}
    >
      <Text
        className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}
      >
        {result.success ? 'Exploration Successful!' : 'Exploration Failed'}
      </Text>
      {result.rewards && result.rewards.length > 0 && (
        <Text className="mt-2 text-sm">
          Rewards: {result.rewards.map((r: any) => r.name).join(', ')}
        </Text>
      )}
    </View>
  </View>
);

const DiscoveryContent: React.FC<{
  encounter: DiscoverySiteEncounter;
  explorationResult: any;
  onReturnToMap: () => void;
  onSelectPath: (pathId: string) => void;
}> = ({ encounter, explorationResult, onReturnToMap, onSelectPath }) => {
  const explorationPaths = encounter.getExplorationPaths();
  const loreDiscoveries = encounter.getLoreDiscoveries();
  const mapIntelligence = encounter.getMapIntelligence();
  const regionalHistory = encounter.getRegionalHistory();

  return (
    <ScrollView
      testID="discovery-site-screen"
      className="min-h-screen bg-gray-50 p-6"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="mx-auto max-w-6xl">
        <View className="mb-8">
          <Text className="mb-2 text-center text-3xl font-bold text-gray-800">
            Discovery Site
          </Text>
          <Text className="text-center text-gray-600">
            Explore ancient sites and discover hidden knowledge!
          </Text>
        </View>

        <View className="mb-6 gap-6 lg:flex-row">
          <ExplorationPathsSection
            paths={explorationPaths}
            onSelect={onSelectPath}
          />
          <RiskAndHistorySection
            paths={explorationPaths}
            encounter={encounter}
            history={regionalHistory}
          />
        </View>

        <LoreSection lores={loreDiscoveries} />
        <MapIntelligenceSection intels={mapIntelligence} />

        {explorationResult && (
          <ExplorationResultSection result={explorationResult} />
        )}

        <View>
          <Pressable
            onPress={onReturnToMap}
            className="rounded-lg bg-gray-500 px-6 py-3"
          >
            <Text className="text-center text-white">Return to Map</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

export const DiscoverySiteScreen: React.FC<DiscoverySiteScreenProps> = ({
  run: _run,
  node,
  onReturnToMap,
  onEncounterComplete,
}) => {
  const [encounter, setEncounter] = useState<DiscoverySiteEncounter | null>(
    null
  );
  const [_selectedPath, setSelectedPath] = useState<string | null>(null);
  const [explorationResult, setExplorationResult] = useState<any>(null);
  const [encounterComplete, setEncounterComplete] = useState(false);
  const [rewards, setRewards] = useState<any[]>([]);
  const [rewardCalculator] = useState(() => new RewardCalculator());
  const [failureManager] = useState(() => new FailureConsequenceManager());

  useEffect(() => {
    const discoveryEncounter = new DiscoverySiteEncounter(node.depth);
    setEncounter(discoveryEncounter);
  }, [node.depth]);

  const handleExplorationDecision = async (pathId: string) => {
    if (!encounter || encounterComplete) return;

    const result = encounter.processExplorationDecision(pathId);
    setSelectedPath(pathId);
    setExplorationResult(result);

    if (result.success) {
      setEncounterComplete(true);
      const encounterRewards = encounter.generateRewards();
      const processedRewards = rewardCalculator.processEncounterRewards(
        encounterRewards,
        'discovery_site',
        node.depth
      );
      setRewards(processedRewards);
      onEncounterComplete('success', processedRewards);
    } else {
      const _consequences = failureManager.processFailureConsequences(
        'objective_failed',
        node.depth,
        node.id
      );
      setEncounterComplete(true);
      onEncounterComplete('failure');
    }
  };

  if (encounterComplete) {
    return <SuccessScreen rewards={rewards} onReturnToMap={onReturnToMap} />;
  }

  if (!encounter) {
    return <LoadingScreen />;
  }

  return (
    <DiscoveryContent
      encounter={encounter}
      explorationResult={explorationResult}
      onReturnToMap={onReturnToMap}
      onSelectPath={handleExplorationDecision}
    />
  );
};
