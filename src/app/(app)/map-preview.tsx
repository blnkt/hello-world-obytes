import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { DungeonMapVisualization } from '@/components/delvers-descent/map/dungeon-map-visualization';
import { NodeCard } from '@/components/delvers-descent/map/node-card';
import type { DungeonNode, RunState } from '@/types/delvers-descent';

const mockNodesData: DungeonNode[] = [
  {
    id: 'node-1-1',
    depth: 1,
    position: 0,
    type: 'puzzle_chamber',
    energyCost: 10,
    returnCost: 0,
    isRevealed: true,
    connections: ['node-2-1', 'node-2-2'],
  },
  {
    id: 'node-1-2',
    depth: 1,
    position: 1,
    type: 'trade_opportunity',
    energyCost: 8,
    returnCost: 0,
    isRevealed: true,
    connections: ['node-2-3'],
  },
  {
    id: 'node-2-1',
    depth: 2,
    position: 0,
    type: 'discovery_site',
    energyCost: 15,
    returnCost: 20,
    isRevealed: true,
    connections: ['node-3-1'],
  },
  {
    id: 'node-2-2',
    depth: 2,
    position: 1,
    type: 'rest_site',
    energyCost: 5,
    returnCost: 18,
    isRevealed: true,
    connections: ['node-3-2'],
  },
  {
    id: 'node-2-3',
    depth: 2,
    position: 2,
    type: 'hazard',
    energyCost: 20,
    returnCost: 25,
    isRevealed: true,
    connections: [],
  },
  {
    id: 'node-3-1',
    depth: 3,
    position: 0,
    type: 'risk_event',
    energyCost: 25,
    returnCost: 45,
    isRevealed: false,
    connections: [],
  },
  {
    id: 'node-3-2',
    depth: 3,
    position: 1,
    type: 'puzzle_chamber',
    energyCost: 22,
    returnCost: 42,
    isRevealed: false,
    connections: [],
  },
];

const mockRunStateData: RunState = {
  runId: 'preview-run',
  currentDepth: 2,
  currentNode: 'node-2-1',
  energyRemaining: 50,
  inventory: [],
  visitedNodes: ['node-1-1', 'node-2-1'],
  discoveredShortcuts: [],
};

export default function MapPreviewScreen() {
  const [mockNodes] = useState<DungeonNode[]>(mockNodesData);
  const [mockRunState] = useState<RunState>(mockRunStateData);

  return (
    <View className="flex-1 bg-gray-100 p-6">
      <View className="mb-6">
        <Text className="text-3xl font-bold text-gray-800">
          Map Preview - Phase 5 Visual Design
        </Text>
        <Text className="mt-2 text-gray-600">
          Preview of the dungeon map visualization components
        </Text>
      </View>

      <View className="mb-8 rounded-lg bg-white p-6">
        <Text className="mb-4 text-xl font-semibold">
          Dungeon Map Visualization
        </Text>
        <DungeonMapVisualization nodes={mockNodes} runState={mockRunState} />
      </View>

      <View className="mb-8 rounded-lg bg-white p-6">
        <Text className="mb-4 text-xl font-semibold">Node Cards Sample</Text>
        <View className="flex-row flex-wrap gap-4">
          <NodeCard
            node={mockNodes[0]}
            isCurrent={false}
            isVisited={true}
            onSelect={(id) => console.log('Selected:', id)}
          />
          <NodeCard node={mockNodes[2]} isCurrent={true} isVisited={true} />
          <NodeCard node={mockNodes[5]} isCurrent={false} isVisited={false} />
        </View>
      </View>
    </View>
  );
}
