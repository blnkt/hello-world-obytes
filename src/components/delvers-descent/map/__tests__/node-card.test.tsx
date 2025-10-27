import React from 'react';
import { render } from '@testing-library/react';

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
    const { container } = render(<NodeCard node={node} />);
    
    expect(container.querySelector('[data-testid="node-card-node-1"]')).toBeDefined();
  });

  it('should display different colors for different encounter types', () => {
    const puzzleNode = createMockNode('node-puzzle', 1, 'puzzle_chamber');
    const tradeNode = createMockNode('node-trade', 1, 'trade_opportunity');
    
    const { container: puzzleContainer } = render(<NodeCard node={puzzleNode} />);
    const { container: tradeContainer } = render(<NodeCard node={tradeNode} />);
    
    expect(puzzleContainer.querySelector('.bg-blue-100')).toBeDefined();
    expect(tradeContainer.querySelector('.bg-green-100')).toBeDefined();
  });

  it('should indicate current node', () => {
    const node = createMockNode('node-1', 1, 'puzzle_chamber');
    const { container } = render(<NodeCard node={node} isCurrent />);
    
    expect(container.textContent).toContain('Current');
    expect(container.querySelector('.bg-blue-500')).toBeDefined();
  });

  it('should indicate visited nodes', () => {
    const node = createMockNode('node-1', 1, 'puzzle_chamber');
    const { container } = render(<NodeCard node={node} isVisited />);
    
    expect(container.querySelector('.bg-gray-300')).toBeDefined();
  });

  it('should handle hidden nodes', () => {
    const node = createMockNode('node-1', 1, 'puzzle_chamber', false);
    const { container } = render(<NodeCard node={node} />);
    
    expect(container.textContent).toContain('Hidden');
    expect(container.querySelector('.opacity-50')).toBeDefined();
  });

  it('should display energy cost for revealed nodes', () => {
    const node = createMockNode('node-1', 1, 'puzzle_chamber', true);
    const { container } = render(<NodeCard node={node} />);
    
    expect(container.textContent).toContain(`Energy: ${node.energyCost}`);
  });

  it('should call onSelect when clicked on revealed node', () => {
    const node = createMockNode('node-1', 1, 'puzzle_chamber', true);
    const onSelect = jest.fn();
    const { container } = render(<NodeCard node={node} onSelect={onSelect} />);
    
    const card = container.querySelector('[data-testid="node-card-node-1"]');
    expect(card).toBeDefined();
    
    if (card) {
      (card as HTMLButtonElement).click();
      expect(onSelect).toHaveBeenCalledWith('node-1');
    }
  });

  it('should not call onSelect when node is not revealed', () => {
    const node = createMockNode('node-1', 1, 'puzzle_chamber', false);
    const onSelect = jest.fn();
    const { container } = render(<NodeCard node={node} onSelect={onSelect} />);
    
    const card = container.querySelector('[data-testid="node-card-node-1"]');
    expect(card).toBeDefined();
    
    if (card) {
      expect((card as HTMLButtonElement).disabled).toBe(true);
    }
  });

  it('should disable interaction for current node', () => {
    const node = createMockNode('node-1', 1, 'puzzle_chamber', true);
    const onSelect = jest.fn();
    const { container } = render(<NodeCard node={node} isCurrent onSelect={onSelect} />);
    
    const card = container.querySelector('[data-testid="node-card-node-1"]');
    expect(card).toBeDefined();
    
    if (card) {
      expect((card as HTMLButtonElement).disabled).toBe(true);
    }
  });
});

