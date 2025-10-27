import React from 'react';

import type { DungeonNode } from '@/types/delvers-descent';

export interface NodeCardProps {
  node: DungeonNode;
  isCurrent?: boolean;
  isVisited?: boolean;
  onSelect?: (nodeId: string) => void;
}

/**
 * NodeCard - Individual node visualization card with encounter type indicators
 *
 * Displays a clear, attractive card for each node showing encounter type,
 * energy cost, and visual state indicators.
 */
export const NodeCard: React.FC<NodeCardProps> = ({
  node,
  isCurrent = false,
  isVisited = false,
  onSelect,
}) => {
  const getTypeColor = () => {
    switch (node.type) {
      case 'puzzle_chamber':
        return 'bg-blue-100 border-blue-400';
      case 'trade_opportunity':
        return 'bg-green-100 border-green-400';
      case 'discovery_site':
        return 'bg-purple-100 border-purple-400';
      case 'risk_event':
        return 'bg-orange-100 border-orange-400';
      case 'hazard':
        return 'bg-red-100 border-red-400';
      case 'rest_site':
        return 'bg-yellow-100 border-yellow-400';
      default:
        return 'bg-gray-100 border-gray-400';
    }
  };

  const handleClick = () => {
    if (onSelect && node.isRevealed) {
      onSelect(node.id);
    }
  };

  return (
    <button
      data-testid={`node-card-${node.id}`}
      onClick={handleClick}
      disabled={!node.isRevealed || isCurrent}
      className={`rounded-lg border-2 p-3 text-left transition-all ${
        isCurrent
          ? 'bg-blue-500 text-white'
          : isVisited
            ? 'bg-gray-300 opacity-60'
            : getTypeColor()
      } ${!node.isRevealed ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold capitalize">{node.type}</div>
          <div className="text-xs">
            {node.isRevealed ? `Depth ${node.depth}` : 'Hidden'}
          </div>
        </div>
        {node.isRevealed && (
          <div className="text-right text-xs">
            <div>Energy: {node.energyCost}</div>
            {isCurrent && <div className="mt-1 font-bold">Current</div>}
          </div>
        )}
      </div>
    </button>
  );
};
