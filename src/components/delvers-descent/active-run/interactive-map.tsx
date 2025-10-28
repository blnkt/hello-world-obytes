import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import type { DungeonNode, RunState } from '@/types/delvers-descent';

export interface InteractiveMapProps {
  nodes: DungeonNode[];
  runState: RunState | null;
  onNodePress: (node: DungeonNode) => void;
}

const getNodeEmoji = (type: string) => {
  const emojiMap: Record<string, string> = {
    puzzle_chamber: '🧩',
    trade_opportunity: '🤝',
    discovery_site: '🔍',
    risk_event: '⚠️',
    hazard: '⚡',
    rest_site: '💤',
  };
  return emojiMap[type] || '📍';
};

const DepthLevel: React.FC<{
  depth: number;
  nodes: DungeonNode[];
  currentDepth: number;
  visitedNodes: Set<string>;
  onNodePress: (node: DungeonNode) => void;
}> = ({ depth, nodes, currentDepth, visitedNodes, onNodePress }) => {
  const isNodeAvailable = (node: DungeonNode) => {
    return node.depth <= currentDepth + 1 || node.isRevealed;
  };

  const isNodeVisited = (nodeId: string) => {
    return visitedNodes.has(nodeId);
  };

  return (
    <View className="mb-6">
      <Text className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
        Depth {depth}
        {depth === currentDepth && (
          <Text className="ml-2 text-blue-600">(Current)</Text>
        )}
      </Text>
      <View className="flex-row flex-wrap gap-3">
        {nodes.map((node) => {
          const isVisited = isNodeVisited(node.id);
          const isAvailable = isNodeAvailable(node);
          const canInteract = isAvailable && !isVisited;

          return (
            <TouchableOpacity
              key={node.id}
              onPress={() => canInteract && onNodePress(node)}
              disabled={!canInteract}
              className={`size-20 items-center justify-center rounded-lg border-2 ${
                isVisited
                  ? 'border-gray-400 bg-gray-100'
                  : canInteract
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 bg-gray-200'
              }`}
              testID={`node-${node.id}`}
            >
              <Text className="text-2xl">{getNodeEmoji(node.type)}</Text>
              {canInteract && (
                <Text className="mt-1 text-xs text-blue-600">Tap</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  nodes,
  runState,
  onNodePress,
}) => {
  const currentDepth = runState?.currentDepth || 0;
  const visitedNodes = new Set(runState?.visitedNodes || []);

  const nodesByDepth = nodes.reduce(
    (acc, node) => {
      if (!acc[node.depth]) {
        acc[node.depth] = [];
      }
      acc[node.depth].push(node);
      return acc;
    },
    {} as Record<number, DungeonNode[]>
  );

  const depths = Object.keys(nodesByDepth)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <ScrollView className="flex-1">
      <View className="p-4">
        {depths.map((depth) => (
          <DepthLevel
            key={depth}
            depth={depth}
            nodes={nodesByDepth[depth]}
            currentDepth={currentDepth}
            visitedNodes={visitedNodes}
            onNodePress={onNodePress}
          />
        ))}
      </View>
    </ScrollView>
  );
};
