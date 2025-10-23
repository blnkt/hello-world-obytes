import React, { useState, useEffect } from 'react';
import { TradeOpportunityEncounter } from '@/lib/delvers-descent/trade-opportunity-encounter';
import { RewardCalculator } from '@/lib/delvers-descent/reward-calculator';
import { FailureConsequenceManager } from '@/lib/delvers-descent/failure-consequence-manager';
import type { DelvingRun, DungeonNode } from '@/types/delvers-descent';

interface TradeOpportunityScreenProps {
  run: DelvingRun;
  node: DungeonNode;
  onReturnToMap: () => void;
  onEncounterComplete: (result: 'success' | 'failure', rewards?: any[]) => void;
}

export const TradeOpportunityScreen: React.FC<TradeOpportunityScreenProps> = ({
  run: _run,
  node,
  onReturnToMap,
  onEncounterComplete,
}) => {
  const [encounter, setEncounter] = useState<TradeOpportunityEncounter | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [tradeResult, setTradeResult] = useState<any>(null);
  const [encounterComplete, setEncounterComplete] = useState(false);
  const [rewards, setRewards] = useState<any[]>([]);
  const [rewardCalculator] = useState(() => new RewardCalculator());
  const [failureManager] = useState(() => new FailureConsequenceManager());

  useEffect(() => {
    const tradeEncounter = new TradeOpportunityEncounter(node.depth);
    setEncounter(tradeEncounter);
  }, [node.depth]);

  const handleTradeDecision = async (optionId: string) => {
    if (!encounter || encounterComplete) return;

    const result = encounter.processTradeDecision(optionId);
    setSelectedOption(optionId);
    setTradeResult(result);

    if (result.success) {
      // Check if encounter is complete (after 2 trades)
      if (encounter.isEncounterComplete()) {
        setEncounterComplete(true);
        const encounterRewards = encounter.generateRewards();
        const processedRewards = rewardCalculator.processEncounterRewards(
          encounterRewards,
          'trade_opportunity',
          node.depth
        );
        setRewards(processedRewards);
        onEncounterComplete('success', processedRewards);
      }
    } else {
      // Handle trade failure
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

  if (encounterComplete) {
    return (
      <div data-testid="encounter-success" className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Trade Complete!</h2>
          
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
          <p className="mt-4 text-lg text-gray-600">Loading trade opportunity...</p>
        </div>
      </div>
    );
  }

  const tradeOptions = encounter.getTradeOptions();
  const tradePosts = encounter.getAllTradePosts();
  const arbitrageOpportunities = encounter.getArbitrageOpportunities();

  return (
    <div data-testid="trade-opportunity-screen" className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Trade Opportunity</h1>
          <p className="text-gray-600">Make strategic trading decisions to maximize your profits!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Trade Options */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Trade Options</h2>
            <div data-testid="trade-options" className="space-y-4">
              {tradeOptions.map((option, index) => (
                <div
                  key={option.id}
                  data-testid={`trade-option-${option.id}`}
                  className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    selectedOption === option.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleTradeDecision(option.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-800">Option {option.id}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor('medium')}`}>
                          medium risk
                        </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                  <div className="text-sm">
                    <p className="text-green-600">Reward: {option.outcome.rewards[0]?.value || 0}</p>
                    {option.outcome.consequences.length > 0 && (
                      <p className="text-red-600">Risk: {option.outcome.consequences[0].description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trade Posts & Arbitrage */}
          <div className="space-y-6">
            {/* Trade Posts */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Trade Posts</h2>
              <div data-testid="trade-posts" className="space-y-3">
                {tradePosts.map((post, _index) => (
                      <div key={post.id} className="border border-gray-200 rounded-lg p-3">
                        <h3 className="font-medium text-gray-800">{post.name}</h3>
                        <p className="text-sm text-gray-600">Trade post offering various goods</p>
                        <div className="mt-2 text-sm">
                          <p className="text-green-600">Buy Price: {post.prices.buy || 0}</p>
                          <p className="text-red-600">Sell Price: {post.prices.sell || 0}</p>
                        </div>
                      </div>
                ))}
              </div>
            </div>

            {/* Arbitrage Opportunities */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Arbitrage Opportunities</h2>
              <div data-testid="arbitrage-opportunities" className="space-y-3">
                {arbitrageOpportunities.map((opportunity, _index) => (
                      <div key={_index} className="border border-yellow-200 rounded-lg p-3 bg-yellow-50">
                        <h3 className="font-medium text-gray-800">Trade {opportunity.item}</h3>
                        <p className="text-sm text-gray-600">Buy from {opportunity.buyFrom}, sell to {opportunity.sellTo}</p>
                        <p className="text-sm text-gray-600">Profit: {opportunity.profit}</p>
                      </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Trade Result */}
        {tradeResult && (
          <div data-testid="trade-result" className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Trade Result</h2>
            <div className={`p-4 rounded-lg ${tradeResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <p className="font-medium">{tradeResult.success ? 'Trade Successful!' : 'Trade Failed'}</p>
              {tradeResult.rewards && tradeResult.rewards.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm">Rewards: {tradeResult.rewards.map((reward: any) => reward.name).join(', ')}</p>
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
