import React from 'react';
import { View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import type { DungeonNode } from '@/types/delvers-descent';

export interface PathConnectionsProps {
  nodes: DungeonNode[];
}

/**
 * PathConnections - Visual paths connecting nodes in the dungeon map
 *
 * Renders SVG lines connecting nodes to show available paths and exploration routes
 * with visual differentiation for depth levels and path types.
 */
export const PathConnections: React.FC<PathConnectionsProps> = ({ nodes }) => {
  const lines: { from: DungeonNode; to: DungeonNode }[] = [];

  // Calculate connections between nodes
  nodes.forEach((fromNode) => {
    fromNode.connections.forEach((connectedId) => {
      const toNode = nodes.find((n) => n.id === connectedId);
      if (toNode) {
        lines.push({ from: fromNode, to: toNode });
      }
    });
  });

  // Calculate positions for nodes (simplified 2D layout)
  const nodePositions = new Map<string, { x: number; y: number }>();

  nodes.forEach((node) => {
    const x = node.position * 100 + 50;
    const y = node.depth * 100 + 50;
    nodePositions.set(node.id, { x, y });
  });

  return (
    <View testID="path-connections" className="absolute inset-0">
      <Svg height="100%" width="100%">
        {lines.map((line, index) => {
          const fromPos = nodePositions.get(line.from.id);
          const toPos = nodePositions.get(line.to.id);

          if (!fromPos || !toPos) return null;

          const strokeWidth = line.from.depth < line.to.depth ? 2 : 1.5;

          return (
            <Line
              key={`path-${line.from.id}-${line.to.id}-${index}`}
              x1={fromPos.x}
              y1={fromPos.y}
              x2={toPos.x}
              y2={toPos.y}
              stroke="#888"
              strokeWidth={strokeWidth}
              opacity={0.5}
            />
          );
        })}
      </Svg>
    </View>
  );
};
