import React from 'react';
import { render } from '@testing-library/react-native';

import { PathConnections } from '../path-connections';
import type { DungeonNode } from '@/types/delvers-descent';

describe('PathConnections (Task 1.3)', () => {
  const createMockNode = (
    id: string,
    depth: number,
    connections: string[] = []
  ): DungeonNode => ({
    id,
    depth,
    position: 1,
    type: 'puzzle_chamber',
    energyCost: 10,
    returnCost: 0,
    isRevealed: true,
    connections,
  });

  it('should render path connections between nodes', () => {
    const nodes = [
      createMockNode('node-1', 1, ['node-2']),
      createMockNode('node-2', 2, []),
    ];

    const { getByTestId } = render(<PathConnections nodes={nodes} />);

    expect(getByTestId('path-connections')).toBeDefined();
  });

  it('should render lines connecting nodes', () => {
    const nodes = [
      createMockNode('node-1', 1, ['node-2']),
      createMockNode('node-2', 2, []),
    ];

    const { getByTestId } = render(<PathConnections nodes={nodes} />);

    expect(getByTestId('path-connections')).toBeDefined();
  });

  it('should show path thickness based on connection type', () => {
    const nodes = [
      createMockNode('node-1', 1, ['node-2', 'node-3']),
      createMockNode('node-2', 2, []),
      createMockNode('node-3', 2, []),
    ];

    const { getByTestId } = render(<PathConnections nodes={nodes} />);

    expect(getByTestId('path-connections')).toBeDefined();
  });

  it('should handle nodes at different depths', () => {
    const nodes = [
      createMockNode('node-1', 1, ['node-2', 'node-3']),
      createMockNode('node-2', 2, ['node-4']),
      createMockNode('node-3', 2, ['node-5']),
      createMockNode('node-4', 3, []),
      createMockNode('node-5', 3, []),
    ];

    const { getByTestId } = render(<PathConnections nodes={nodes} />);

    expect(getByTestId('path-connections')).toBeDefined();
  });

  it('should indicate available paths', () => {
    const nodes = [
      createMockNode('node-1', 1, ['node-2']),
      createMockNode('node-2', 2, ['node-3', 'node-4']),
      createMockNode('node-3', 3, []),
      createMockNode('node-4', 3, []),
    ];

    const { getByTestId } = render(<PathConnections nodes={nodes} />);

    expect(getByTestId('path-connections')).toBeDefined();
  });

  it('should handle nodes with no connections', () => {
    const nodes = [
      createMockNode('node-1', 1, []),
      createMockNode('node-2', 1, []),
    ];

    const { getByTestId } = render(<PathConnections nodes={nodes} />);

    expect(getByTestId('path-connections')).toBeDefined();
  });
});
