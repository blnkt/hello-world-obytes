import React from 'react';

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
    <div data-testid="dungeon-map" className="bg-gray-50 p-4">
      <div data-testid="energy-display" className="mb-4 text-center">
        <h3 className="text-lg font-semibold text-gray-800">
          Energy: {runState.energyRemaining}
        </h3>
      </div>

      <div className="flex flex-col gap-8">
        {depths.map((depth) => (
          <div
            key={depth}
            data-testid={`depth-level-${depth}`}
            className="rounded-lg bg-white p-4 shadow"
          >
            <h4 className="mb-2 font-semibold text-gray-700">
              Depth {depth}
              {depth === runState.currentDepth && (
                <span
                  data-testid="current-depth"
                  className="ml-2 text-blue-600"
                >
                  (Current)
                </span>
              )}
            </h4>
            <div className="grid-cols-auto grid gap-2">
              {nodes
                .filter((node: DungeonNode) => node.depth === depth)
                .map((node: DungeonNode) => (
                  <div
                    key={node.id}
                    className="rounded border border-gray-300 p-2"
                  >
                    <span className="text-sm text-gray-600">{node.type}</span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
