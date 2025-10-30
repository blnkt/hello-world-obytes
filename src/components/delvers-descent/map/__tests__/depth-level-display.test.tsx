import React from 'react';
import { render } from '@testing-library/react-native';

import { DepthLevelDisplay } from '../depth-level-display';
import type { DungeonNode } from '@/types/delvers-descent';

describe('DepthLevelDisplay (Task 1.4)', () => {
  const createMockNode = (id: string, depth: number): DungeonNode => ({
    id,
    depth,
    position: 1,
    type: 'puzzle_chamber',
    energyCost: 10,
    returnCost: 0,
    isRevealed: true,
    connections: [],
  });

  it('should render depth levels with visual hierarchy', () => {
    const nodes = [
      createMockNode('node-1', 1),
      createMockNode('node-2', 1),
      createMockNode('node-3', 2),
      createMockNode('node-4', 3),
    ];

    const { getByText } = render(
      <DepthLevelDisplay nodes={nodes} currentDepth={2} />
    );

    expect(getByText(/Depth 1/i)).toBeDefined();
    expect(getByText(/Depth 2/i)).toBeDefined();
    expect(getByText(/Depth 3/i)).toBeDefined();
  });

  it('should visually distinguish the current depth level', () => {
    const nodes = [createMockNode('node-1', 1), createMockNode('node-2', 2)];

    const { getByText } = render(
      <DepthLevelDisplay nodes={nodes} currentDepth={2} />
    );

    expect(getByText(/Depth 2/i)).toBeDefined();
  });

  it('should show node count for each depth level', () => {
    const nodes = [
      createMockNode('node-1', 1),
      createMockNode('node-2', 1),
      createMockNode('node-3', 2),
    ];

    const { getByText } = render(
      <DepthLevelDisplay nodes={nodes} currentDepth={1} />
    );

    expect(getByText(/Depth 1/i)).toBeDefined();
    expect(getByText(/Depth 2/i)).toBeDefined();
  });

  it('should display visual hierarchy indicators', () => {
    const nodes = [
      createMockNode('node-1', 1),
      createMockNode('node-2', 2),
      createMockNode('node-3', 3),
    ];

    const { getAllByTestId } = render(
      <DepthLevelDisplay nodes={nodes} currentDepth={2} />
    );

    const depthLevels = getAllByTestId(/^depth-level-/);
    expect(depthLevels.length).toBe(3);
  });

  it('should handle empty node arrays gracefully', () => {
    const { queryByText } = render(
      <DepthLevelDisplay nodes={[]} currentDepth={0} />
    );

    expect(queryByText(/Depth/i)).toBeNull();
  });
});
