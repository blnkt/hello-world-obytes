import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import type { DungeonNode, RunState } from '@/types/delvers-descent';

export interface DungeonMapVisualizationProps {
  nodes: DungeonNode[];
  runState: RunState;
}

/**
 * DungeonMapVisualization - Visual map display with depth-based spatial navigation
 *
 * Displays a polished visual map showing nodes organized by depth levels with
 * clear visual hierarchy and spatial relationships.
 */
export const DungeonMapVisualization: React.FC<
  DungeonMapVisualizationProps
> = ({ nodes, runState }) => {
  const depths = Array.from(
    new Set(nodes.map((n: DungeonNode) => n.depth))
  ).sort();

  return (
    <ScrollView testID="dungeon-map" className="bg-gray-50 p-4">
      <View testID="energy-display" className="mb-4">
        <Text className="text-center text-lg font-semibold text-gray-800">
          Energy: {runState.energyRemaining}
        </Text>
      </View>

      <View className="gap-8">
        {depths.map((depth) => (
          <View
            key={depth}
            testID={`depth-level-${depth}`}
            className="rounded-lg bg-white p-4"
          >
            <Text className="mb-2 font-semibold text-gray-700">
              Depth {depth}
              {depth === runState.currentDepth && (
                <Text testID="current-depth" className="ml-2 text-blue-600">
                  (Current)
                </Text>
              )}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {nodes
                .filter((node: DungeonNode) => node.depth === depth)
                .map((node: DungeonNode) => (
                  <View
                    key={node.id}
                    className="rounded border border-gray-300 p-2"
                  >
                    <Text className="text-sm text-gray-600">{node.type}</Text>
                  </View>
                ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};
