import React from 'react';
import { Pressable, Text, View } from 'react-native';

import type { DungeonNode } from '@/types/delvers-descent';

export interface NodeCardProps {
  node: DungeonNode;
  isCurrent?: boolean;
  isVisited?: boolean;
  onSelect?: (nodeId: string) => void;
}

/**
 * NodeCard - Individual node visualization card with encounter type indicators
 *
 * Displays a clear, attractive card for each node showing encounter type,
 * energy cost, and visual state indicators.
 */
export const NodeCard: React.FC<NodeCardProps> = ({
  node,
  isCurrent = false,
  isVisited = false,
  onSelect,
}) => {
  const getTypeColor = () => {
    switch (node.type) {
      case 'puzzle_chamber':
        return 'bg-blue-100 border-blue-400';
      case 'trade_opportunity':
        return 'bg-green-100 border-green-400';
      case 'discovery_site':
        return 'bg-purple-100 border-purple-400';
      case 'risk_event':
        return 'bg-orange-100 border-orange-400';
      case 'hazard':
        return 'bg-red-100 border-red-400';
      case 'rest_site':
        return 'bg-yellow-100 border-yellow-400';
      default:
        return 'bg-gray-100 border-gray-400';
    }
  };

  const handlePress = () => {
    if (onSelect && node.isRevealed && !isCurrent) {
      onSelect(node.id);
    }
  };

  return (
    <Pressable
      testID={`node-card-${node.id}`}
      onPress={handlePress}
      disabled={!node.isRevealed || isCurrent}
      className={`w-32 rounded-lg border-2 p-3 ${
        isCurrent
          ? 'bg-blue-500'
          : isVisited
            ? 'bg-gray-300 opacity-60'
            : getTypeColor()
      } ${!node.isRevealed ? 'opacity-50' : ''}`}
    >
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="font-semibold capitalize text-gray-800">
            {node.type}
          </Text>
          <Text className="text-xs text-gray-600">
            {node.isRevealed ? `Depth ${node.depth}` : 'Hidden'}
          </Text>
        </View>
        {node.isRevealed && (
          <View className="items-end">
            <Text className="text-xs text-gray-700">
              Energy: {node.energyCost}
            </Text>
            {isCurrent && <Text className="mt-1 font-bold">Current</Text>}
          </View>
        )}
      </View>
    </Pressable>
  );
};
