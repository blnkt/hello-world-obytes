import React from 'react';

import DungeonGame from './dungeon-game';
import { GameStateProvider } from './providers/game-state-provider';

const DungeonGameWrapper: React.FC = () => {
  return (
    <GameStateProvider initialCurrency={1000}>
      <DungeonGame />
    </GameStateProvider>
  );
};

DungeonGameWrapper.displayName = 'DungeonGameWrapper';

export default DungeonGameWrapper;
