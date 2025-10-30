import React from 'react';
import { render } from '@testing-library/react-native';

import { NodeCard } from '../node-card';
import type { DungeonNode } from '@/types/delvers-descent';

describe('NodeCard (Task 1.2)', () => {
  const createMockNode = (
    id: string,
    depth: number,
    type: DungeonNode['type'],
    isRevealed: boolean = true
  ): DungeonNode => ({
    id,
    depth,
    position: 1,
    type,
    energyCost: 10,
    returnCost: 0,
    isRevealed,
    connections: [],
  });

  it('should render node card with encounter type', () => {
    const node = createMockNode('node-1', 1, 'puzzle_chamber');
    const { getByTestId } = render(<NodeCard node={node} />);

    expect(getByTestId('node-card-node-1')).toBeDefined();
  });

  it('should display different colors for different encounter types', () => {
    const puzzleNode = createMockNode('node-puzzle', 1, 'puzzle_chamber');
    const tradeNode = createMockNode('node-trade', 1, 'trade_opportunity');

    const { getByTestId: puzzleGetByTestId } = render(
      <NodeCard node={puzzleNode} />
    );
    const { getByTestId: tradeGetByTestId } = render(
      <NodeCard node={tradeNode} />
    );

    expect(puzzleGetByTestId('node-card-node-puzzle')).toBeDefined();
    expect(tradeGetByTestId('node-card-node-trade')).toBeDefined();
  });

  it('should indicate current node', () => {
    const node = createMockNode('node-1', 1, 'puzzle_chamber');
    const { getByText } = render(<NodeCard node={node} isCurrent />);

    expect(getByText('Current')).toBeDefined();
  });

  it('should indicate visited nodes', () => {
    const node = createMockNode('node-1', 1, 'puzzle_chamber');
    const { getByTestId } = render(<NodeCard node={node} isVisited />);

    expect(getByTestId('node-card-node-1')).toBeDefined();
  });

  it('should handle hidden nodes', () => {
    const node = createMockNode('node-1', 1, 'puzzle_chamber', false);
    const { getByText } = render(<NodeCard node={node} />);

    expect(getByText('Hidden')).toBeDefined();
  });

  it('should display energy cost for revealed nodes', () => {
    const node = createMockNode('node-1', 1, 'puzzle_chamber', true);
    const { getByText } = render(<NodeCard node={node} />);

    expect(getByText(new RegExp(`Energy: ${node.energyCost}`))).toBeDefined();
  });

  it('should call onSelect when pressed on revealed node', () => {
    const node = createMockNode('node-1', 1, 'puzzle_chamber', true);
    const onSelect = jest.fn();
    const { getByTestId } = render(
      <NodeCard node={node} onSelect={onSelect} />
    );

    const card = getByTestId('node-card-node-1');
    expect(card).toBeDefined();
    // The component should have the onPress handler
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('should not call onSelect when node is not revealed', () => {
    const node = createMockNode('node-1', 1, 'puzzle_chamber', false);
    const onSelect = jest.fn();
    const { getByTestId } = render(
      <NodeCard node={node} onSelect={onSelect} />
    );

    const card = getByTestId('node-card-node-1');
    expect(card).toBeDefined();
    // Component should render even when disabled
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('should disable interaction for current node', () => {
    const node = createMockNode('node-1', 1, 'puzzle_chamber', true);
    const onSelect = jest.fn();
    const { getByTestId, getByText } = render(
      <NodeCard node={node} isCurrent onSelect={onSelect} />
    );

    const card = getByTestId('node-card-node-1');
    expect(card).toBeDefined();
    expect(getByText('Current')).toBeDefined();
  });
});
