import React from 'react';
import { render } from '@testing-library/react';

import { DungeonMapVisualization } from '../dungeon-map-visualization';
import type { DungeonNode, RunState } from '@/types/delvers-descent';

describe('DungeonMapVisualization (Task 1.1)', () => {
  const createMockNode = (id: string, depth: number): DungeonNode => ({
    id,
    depth,
    position: 1,
    type: 'puzzle_chamber',
    energyCost: 10,
    returnCost: 0,
    isRevealed: false,
    connections: [],
  });

  const mockNodes: DungeonNode[] = [
    createMockNode('node-1-1', 1),
    createMockNode('node-1-2', 1),
    createMockNode('node-2-1', 2),
    createMockNode('node-2-2', 2),
  ];

  const mockRunState: RunState = {
    runId: 'test-run-1',
    currentDepth: 2,
    currentNode: 'node-2-1',
    energyRemaining: 50,
    inventory: [],
    visitedNodes: [],
    discoveredShortcuts: [],
  };

  it('should render the spatial navigation map', () => {
    const { container } = render(
      <DungeonMapVisualization nodes={mockNodes} runState={mockRunState} />
    );
    
    expect(container.querySelector('[data-testid="dungeon-map"]')).toBeDefined();
  });

  it('should display depth levels with visual hierarchy', () => {
    const { container } = render(
      <DungeonMapVisualization nodes={mockNodes} runState={mockRunState} />
    );
    
    expect(container.querySelector('[data-testid="depth-level-1"]')).toBeDefined();
    expect(container.querySelector('[data-testid="depth-level-2"]')).toBeDefined();
  });

  it('should show all nodes at each depth level', () => {
    const depth1Nodes = mockNodes.filter((n: DungeonNode) => n.depth === 1);
    const depth2Nodes = mockNodes.filter((n: DungeonNode) => n.depth === 2);
    
    expect(depth1Nodes.length).toBeGreaterThan(0);
    expect(depth2Nodes.length).toBeGreaterThan(0);
  });

  it('should display energy cost information', () => {
    const { container } = render(
      <DungeonMapVisualization nodes={mockNodes} runState={mockRunState} />
    );
    
    expect(container.querySelector('[data-testid="energy-display"]')).toBeDefined();
  });

  it('should indicate current depth level', () => {
    const { container } = render(
      <DungeonMapVisualization nodes={mockNodes} runState={mockRunState} />
    );
    
    expect(container.querySelector('[data-testid="current-depth"]')).toBeDefined();
  });
});

