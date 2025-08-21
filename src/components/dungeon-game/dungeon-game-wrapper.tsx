import React from 'react';

import { GameStateProvider } from './providers/game-state-provider';
import DungeonGame from './dungeon-game';

export const DungeonGameWrapper: React.FC = () => {
  return (
    <GameStateProvider>
      <DungeonGame />
    </GameStateProvider>
  );
};
