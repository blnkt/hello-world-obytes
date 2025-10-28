import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import type { DungeonNode } from '@/types/delvers-descent';

export interface DepthLevelDisplayProps {
  nodes: DungeonNode[];
  currentDepth: number;
}

/**
 * DepthLevelDisplay - Visual depth hierarchy display
 *
 * Displays depth levels with clear visual hierarchy, visual indicators,
 * and node counts for each depth level.
 */
export const DepthLevelDisplay: React.FC<DepthLevelDisplayProps> = ({
  nodes,
  currentDepth,
}) => {
  const depths = Array.from(new Set(nodes.map((n) => n.depth))).sort();

  if (depths.length === 0) {
    return null;
  }

  return (
    <ScrollView className="gap-4">
      {depths.map((depth) => {
        const nodesAtDepth = nodes.filter((n) => n.depth === depth);
        const isCurrentDepth = depth === currentDepth;

        return (
          <View
            key={depth}
            testID={`depth-level-${depth}`}
            className={`rounded-lg border-2 p-4 ${
              isCurrentDepth
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-white'
            }`}
          >
            <View className="mb-2 flex-row items-center justify-between">
              <Text
                className={`text-lg font-bold ${
                  isCurrentDepth ? 'text-blue-600' : 'text-gray-700'
                }`}
              >
                Depth {depth}
              </Text>
              {isCurrentDepth && (
                <View className="rounded-full bg-blue-500 px-3 py-1">
                  <Text className="text-xs font-semibold text-white">
                    Current
                  </Text>
                </View>
              )}
            </View>

            <Text className="text-sm text-gray-600">
              {nodesAtDepth.length} node{nodesAtDepth.length !== 1 ? 's' : ''}
            </Text>

            <View className="mt-2">
              {nodesAtDepth.map((node) => (
                <View
                  key={node.id}
                  className="mb-1 rounded border border-gray-200 p-2"
                >
                  <Text className="text-sm capitalize text-gray-700">
                    {node.type}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};
