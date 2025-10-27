import React, { useState, useEffect } from 'react';
import { DiscoverySiteEncounter } from '@/lib/delvers-descent/discovery-site-encounter';
import { RewardCalculator } from '@/lib/delvers-descent/reward-calculator';
import { FailureConsequenceManager } from '@/lib/delvers-descent/failure-consequence-manager';
import type { DelvingRun, DungeonNode } from '@/types/delvers-descent';

interface DiscoverySiteScreenProps {
  run: DelvingRun;
  node: DungeonNode;
  onReturnToMap: () => void;
  onEncounterComplete: (result: 'success' | 'failure', rewards?: any[]) => void;
}

export const DiscoverySiteScreen: React.FC<DiscoverySiteScreenProps> = ({
  run: _run,
  node,
  onReturnToMap,
  onEncounterComplete,
}) => {
  const [encounter, setEncounter] = useState<DiscoverySiteEncounter | null>(null);
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
      // Handle exploration failure
          const _consequences = failureManager.processFailureConsequences(
            'objective_failed',
            node.depth,
            node.id
          );
      setEncounterComplete(true);
      onEncounterComplete('failure');
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPathTypeColor = (type: string) => {
    switch (type) {
      case 'safe': return 'border-green-300 bg-green-50';
      case 'risky': return 'border-yellow-300 bg-yellow-50';
      case 'dangerous': return 'border-red-300 bg-red-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  if (encounterComplete) {
    return (
      <div data-testid="encounter-success" className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Exploration Complete!</h2>
          
          {rewards.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Rewards:</h3>
              <div className="space-y-2">
                {rewards.map((reward, index) => (
                  <div key={index} className="bg-yellow-100 p-3 rounded-lg">
                    <p className="font-medium">{reward.name}</p>
                    <p className="text-sm text-gray-600">Value: {reward.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <button
            onClick={onReturnToMap}
            data-testid="return-to-map"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Return to Map
          </button>
        </div>
      </div>
    );
  }

  if (!encounter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading discovery site...</p>
        </div>
      </div>
    );
  }

  const explorationPaths = encounter.getExplorationPaths();
  const loreDiscoveries = encounter.getLoreDiscoveries();
  const mapIntelligence = encounter.getMapIntelligence();
  const regionalHistory = encounter.getRegionalHistory();

  return (
    <div data-testid="discovery-site-screen" className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Discovery Site</h1>
          <p className="text-gray-600">Explore ancient sites and discover hidden knowledge!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Exploration Paths */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Exploration Paths</h2>
            <div data-testid="exploration-paths" className="space-y-4">
              {explorationPaths.map((path) => (
                <div
                  key={path.id}
                  data-testid={`exploration-path-${path.id}`}
                  className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${getPathTypeColor(path.type)}`}
                  onClick={() => handleExplorationDecision(path.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-800">Path {path.id}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(path.outcome.riskLevel)}`}>
                      {path.outcome.riskLevel} risk
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{path.description}</p>
                  <div className="text-sm">
                    <p className="text-green-600">Reward: {path.outcome.rewards[0]?.value || 0}</p>
                    {path.outcome.consequences.length > 0 && (
                      <p className="text-red-600">Risk: {path.outcome.consequences[0].description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Assessment & Information */}
          <div className="space-y-6">
            {/* Risk Assessment */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Risk Assessment</h2>
              <div data-testid="path-risk-assessment" className="space-y-3">
                {explorationPaths.map((path) => {
                  const riskAssessment = encounter.getPathRiskAssessment(path.id);
                  return (
                    <div key={path.id} className="border border-gray-200 rounded-lg p-3">
                      <h3 className="font-medium text-gray-800">Path {path.id}</h3>
                      <p className="text-sm text-gray-600">Risk Level: {riskAssessment.riskLevel}</p>
                      <p className="text-sm text-gray-600">Reward Potential: {riskAssessment.rewardPotential}</p>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">Factors:</p>
                        <ul className="text-xs text-gray-500 list-disc list-inside">
                          {riskAssessment.factors.map((factor, index) => (
                            <li key={index}>{factor}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Regional History */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Regional History</h2>
              <div className="space-y-3">
                {regionalHistory.map((history, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <h3 className="font-medium text-gray-800">{history.region}</h3>
                    <p className="text-sm text-gray-600">{history.description}</p>
                    <p className="text-xs text-gray-500">Era: {history.era} | Significance: {history.significance}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Lore Discoveries */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Lore Discoveries</h2>
          <div data-testid="lore-discoveries" className="space-y-3">
            {loreDiscoveries.map((lore, index) => (
              <div key={index} className="border border-purple-200 rounded-lg p-3 bg-purple-50">
                <h3 className="font-medium text-gray-800">{lore.title}</h3>
                <p className="text-sm text-gray-600">{lore.content}</p>
                <p className="text-xs text-gray-500">Region: {lore.region} | Era: {lore.era}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Map Intelligence */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Map Intelligence</h2>
          <div data-testid="map-intelligence" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mapIntelligence.map((intel, index) => (
              <div key={index} className="border border-blue-200 rounded-lg p-3 bg-blue-50">
                <h3 className="font-medium text-gray-800">{intel.type}</h3>
                <p className="text-sm text-gray-600">{intel.description}</p>
                <p className="text-xs text-gray-500">Depth: {intel.depth} | Value: {intel.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Exploration Result */}
        {explorationResult && (
          <div data-testid="exploration-result" className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Exploration Result</h2>
            <div className={`p-4 rounded-lg ${explorationResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <p className="font-medium">{explorationResult.success ? 'Exploration Successful!' : 'Exploration Failed'}</p>
              {explorationResult.rewards && explorationResult.rewards.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm">Rewards: {explorationResult.rewards.map((r: any) => r.name).join(', ')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-center space-x-4">
          <button
            onClick={onReturnToMap}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Return to Map
          </button>
        </div>
      </div>
    </div>
  );
};
