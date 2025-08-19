import React from 'react';

import { GameProgress } from '@/components/ui';

interface StatusBarProps {
  level: number;
  turns: number;
  gameState: 'Active' | 'Win' | 'Game Over';
  revealedTiles: number;
  totalTiles: number;
}

export default function StatusBar({
  level,
  turns,
  gameState,
  revealedTiles,
  totalTiles,
}: StatusBarProps) {
  return (
    <GameProgress
      level={level}
      turns={turns}
      gameState={gameState}
      revealedTiles={revealedTiles}
      totalTiles={totalTiles}
    />
  );
}
