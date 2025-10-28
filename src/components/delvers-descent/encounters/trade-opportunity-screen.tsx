import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { FailureConsequenceManager } from '@/lib/delvers-descent/failure-consequence-manager';
import { RewardCalculator } from '@/lib/delvers-descent/reward-calculator';
import { TradeOpportunityEncounter } from '@/lib/delvers-descent/trade-opportunity-encounter';
import type { DelvingRun, DungeonNode } from '@/types/delvers-descent';

interface TradeOpportunityScreenProps {
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

const SuccessScreen: React.FC<{
  rewards: any[];
  onReturn: () => void;
}> = ({ rewards, onReturn }) => (
  <ScrollView
    testID="encounter-success"
    className="flex min-h-screen items-center justify-center bg-gray-50"
  >
    <View className="mx-auto max-w-md p-6">
      <Text className="mb-4 text-center text-6xl">🎉</Text>
      <Text className="mb-4 text-center text-2xl font-bold text-gray-800">
        Trade Complete!
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
        onPress={onReturn}
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
        Loading trade opportunity...
      </Text>
    </View>
  </View>
);

const TradeOptionCard: React.FC<{
  option: any;
  selected: boolean;
  onPress: (id: string) => void;
}> = ({ option, selected, onPress }) => (
  <Pressable
    testID={`trade-option-${option.id}`}
    onPress={() => onPress(option.id)}
    className={`w-full rounded-lg border p-4 ${
      selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
    }`}
  >
    <View className="mb-2 flex-row items-start justify-between">
      <Text className="font-medium text-gray-800">Option {option.id}</Text>
      <View className={`rounded-full px-2 py-1 ${getRiskColor('medium')}`}>
        <Text className="text-xs font-medium">medium risk</Text>
      </View>
    </View>
    <Text className="mb-2 text-sm text-gray-600">{option.description}</Text>
    <View>
      <Text className="text-sm text-green-600">
        Reward: {option.outcome.rewards[0]?.value || 0}
      </Text>
      {option.outcome.consequences.length > 0 && (
        <Text className="text-sm text-red-600">
          Risk: {option.outcome.consequences[0].description}
        </Text>
      )}
    </View>
  </Pressable>
);

const TradePostsSection: React.FC<{ posts: any[] }> = ({ posts }) => (
  <View className="rounded-lg bg-white p-6 shadow-lg">
    <Text className="mb-4 text-xl font-semibold text-gray-800">
      Trade Posts
    </Text>
    <View testID="trade-posts" className="gap-3">
      {posts.map((post) => (
        <View key={post.id} className="rounded-lg border border-gray-200 p-3">
          <Text className="font-medium text-gray-800">{post.name}</Text>
          <Text className="text-sm text-gray-600">
            Trade post offering various goods
          </Text>
          <View className="mt-2">
            <Text className="text-sm text-green-600">
              Buy Price: {post.prices.buy || 0}
            </Text>
            <Text className="text-sm text-red-600">
              Sell Price: {post.prices.sell || 0}
            </Text>
          </View>
        </View>
      ))}
    </View>
  </View>
);

const ArbitrageSection: React.FC<{ opportunities: any[] }> = ({
  opportunities,
}) => (
  <View className="rounded-lg bg-white p-6 shadow-lg">
    <Text className="mb-4 text-xl font-semibold text-gray-800">
      Arbitrage Opportunities
    </Text>
    <View testID="arbitrage-opportunities" className="gap-3">
      {opportunities.map((opportunity, index) => (
        <View
          key={index}
          className="rounded-lg border border-yellow-200 bg-yellow-50 p-3"
        >
          <Text className="font-medium text-gray-800">
            Trade {opportunity.item}
          </Text>
          <Text className="text-sm text-gray-600">
            Buy from {opportunity.buyFrom}, sell to {opportunity.sellTo}
          </Text>
          <Text className="text-sm text-gray-600">
            Profit: {opportunity.profit}
          </Text>
        </View>
      ))}
    </View>
  </View>
);

const TradeResultSection: React.FC<{ result: any }> = ({ result }) => (
  <View
    testID="trade-result"
    className="mb-6 rounded-lg bg-white p-6 shadow-lg"
  >
    <Text className="mb-4 text-xl font-semibold text-gray-800">
      Trade Result
    </Text>
    <View
      className={`rounded-lg p-4 ${result.success ? 'bg-green-100' : 'bg-red-100'}`}
    >
      <Text
        className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}
      >
        {result.success ? 'Trade Successful!' : 'Trade Failed'}
      </Text>
      {result.rewards && result.rewards.length > 0 && (
        <Text className="mt-2 text-sm">
          Rewards: {result.rewards.map((r: any) => r.name).join(', ')}
        </Text>
      )}
    </View>
  </View>
);

const TradeContent: React.FC<{
  encounter: TradeOpportunityEncounter;
  selectedOption: string | null;
  tradeResult: any;
  onReturn: () => void;
  onSelectOption: (optionId: string) => void;
}> = ({ encounter, selectedOption, tradeResult, onReturn, onSelectOption }) => {
  const tradeOptions = encounter.getTradeOptions();
  const tradePosts = encounter.getAllTradePosts();
  const arbitrageOpportunities = encounter.getArbitrageOpportunities();

  return (
    <ScrollView
      testID="trade-opportunity-screen"
      className="min-h-screen bg-gray-50 p-6"
    >
      <View className="mx-auto max-w-6xl">
        <View className="mb-8">
          <Text className="mb-2 text-center text-3xl font-bold text-gray-800">
            Trade Opportunity
          </Text>
          <Text className="text-center text-gray-600">
            Make strategic trading decisions to maximize your profits!
          </Text>
        </View>

        <View className="mb-6 gap-6 lg:flex-row">
          <View className="rounded-lg bg-white p-6 shadow-lg">
            <Text className="mb-4 text-xl font-semibold text-gray-800">
              Trade Options
            </Text>
            <View testID="trade-options" className="gap-4">
              {tradeOptions.map((option) => (
                <TradeOptionCard
                  key={option.id}
                  option={option}
                  selected={selectedOption === option.id}
                  onPress={onSelectOption}
                />
              ))}
            </View>
          </View>

          <View className="gap-6">
            <TradePostsSection posts={tradePosts} />
            <ArbitrageSection opportunities={arbitrageOpportunities} />
          </View>
        </View>

        {tradeResult && <TradeResultSection result={tradeResult} />}

        <View>
          <Pressable
            onPress={onReturn}
            className="rounded-lg bg-gray-500 px-6 py-3"
          >
            <Text className="text-center text-white">Return to Map</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

export const TradeOpportunityScreen: React.FC<TradeOpportunityScreenProps> = ({
  run: _run,
  node,
  onReturnToMap,
  onEncounterComplete,
}) => {
  const [encounter, setEncounter] = useState<TradeOpportunityEncounter | null>(
    null
  );
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

    if (result.success && encounter.isEncounterComplete()) {
      setEncounterComplete(true);
      const encounterRewards = encounter.generateRewards();
      const processedRewards = rewardCalculator.processEncounterRewards(
        encounterRewards,
        'trade_opportunity',
        node.depth
      );
      setRewards(processedRewards);
      onEncounterComplete('success', processedRewards);
    } else if (!result.success) {
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
    return <SuccessScreen rewards={rewards} onReturn={onReturnToMap} />;
  }

  if (!encounter) {
    return <LoadingScreen />;
  }

  return (
    <TradeContent
      encounter={encounter}
      selectedOption={selectedOption}
      tradeResult={tradeResult}
      onReturn={onReturnToMap}
      onSelectOption={handleTradeDecision}
    />
  );
};
