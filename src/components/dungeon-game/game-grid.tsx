import React from 'react';
import { View } from 'react-native';

import GridTile from './grid-tile';
import { useGameState } from './providers/game-state-provider';
import {
  findUnrevealedAdjacentTile,
  generateLevelTiles,
} from './utils/game-utils';

// Game grid constants
const GRID_ROWS = 5;
const GRID_COLS = 6;

interface GameGridLayoutProps {
  revealedTiles: Set<string>;
  turnsUsed: number;
  grid: { id: string; row: number; col: number }[][];
  tileTypes: Record<string, 'treasure' | 'trap' | 'exit' | 'bonus' | 'neutral'>;
  onTilePress: (id: string, row: number, col: number) => void;
}

function GameGridLayout({
  revealedTiles,
  grid,
  tileTypes,
  onTilePress,
}: GameGridLayoutProps) {
  return (
    <View className="px-4 pb-2">
      {/* Game Grid with light brown frame */}
      <View className="rounded-lg bg-[#E0D9CE] p-4">
        <View testID="game-grid" className="w-full">
          {grid.map((row, rowIndex) => (
            <View key={rowIndex} className="w-full flex-row">
              {row.map((tile) => (
                <GridTile
                  key={tile.id}
                  id={tile.id}
                  row={tile.row}
                  col={tile.col}
                  isRevealed={revealedTiles.has(tile.id)}
                  tileType={tileTypes[tile.id]}
                  onPress={onTilePress}
                />
              ))}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// Helper function to create grid structure
const createGridStructure = (rows: number, cols: number) => {
  const grid = [];
  for (let row = 0; row < rows; row++) {
    const rowTiles = [];
    for (let col = 0; col < cols; col++) {
      rowTiles.push({
        id: `${row}-${col}`,
        row,
        col,
      });
    }
    grid.push(rowTiles);
  }
  return grid;
};

interface GameGridProps {
  level: number;
  disabled?: boolean;
}

// eslint-disable-next-line max-lines-per-function
export default function GameGrid({ level, disabled = false }: GameGridProps) {
  // Generate level tiles once when component mounts
  const levelTiles = React.useMemo(() => generateLevelTiles(level), [level]);

  // Use the new game state provider
  const {
    revealedTiles,
    tileTypes,
    turnsUsed,
    revealTile,
    completeLevel,
    gameOver,
    currency,
    setCurrency,
  } = useGameState();

  const grid = React.useMemo(
    () => createGridStructure(GRID_ROWS, GRID_COLS),
    []
  );

  const handleTilePress = React.useCallback(
    (id: string, row: number, col: number) => {
      if (disabled || revealedTiles.has(id)) {
        return;
      }

      // Calculate tile index in the level tiles array
      const tileIndex = row * GRID_COLS + col;
      const tileType = levelTiles[tileIndex];

      // Use the provider's revealTile action and check if it succeeded
      const revealSuccess = revealTile(row, col, tileType);

      // Only proceed if tile reveal was successful (player had enough turns)
      if (!revealSuccess) {
        return; // Not enough turns, don't proceed with effects
      }

      // Handle tile-specific effects
      if (tileType === 'exit') {
        // Exit tile - complete level
        console.log('🎯 Exit tile revealed! Level complete!');
        completeLevel();
      } else if (tileType === 'trap') {
        // Trap tile - lose 1 additional turn (deduct 100 more currency)
        console.log('💀 Trap tile revealed! Lost 1 additional turn!');
        setCurrency(Math.max(0, currency - 100));
        // Don't call gameOver() immediately - let the turn system handle it
      } else if (tileType === 'treasure') {
        // Treasure tile - gain 1 free turn (add 100 currency)
        console.log('💎 Treasure tile revealed! Gained 1 free turn!');
        setCurrency(currency + 100);
      } else if (tileType === 'bonus') {
        // Bonus tile - reveal adjacent tile and give free turn
        console.log(
          '⭐ Bonus tile revealed! Revealing adjacent tile and gaining free turn!'
        );
        const adjacentTile = findUnrevealedAdjacentTile({
          tileId: id,
          revealedTiles,
          rows: GRID_ROWS,
          cols: GRID_COLS,
        });
        if (adjacentTile) {
          const [adjRow, adjCol] = adjacentTile.split('-').map(Number);
          const adjTileIndex = adjRow * GRID_COLS + adjCol;
          const adjTileType = levelTiles[adjTileIndex];
          // Reveal adjacent tile without costing a turn using the provider's method
          // This avoids calling state setters directly which can cause navigation context issues
          revealTile(adjRow, adjCol, adjTileType);
          // Give free turn for bonus tile (add 100 currency)
          setCurrency(currency + 100);
          console.log(`🎁 Adjacent tile revealed: ${adjTileType}`);
        }
      }
    },
    [
      disabled,
      revealedTiles,
      levelTiles,
      revealTile,
      setCurrency,
      currency,
      completeLevel,
      gameOver,
    ]
  );

  // Convert tileTypes to the expected type for GameGridLayout
  const typedTileTypes = React.useMemo(() => {
    const result: Record<
      string,
      'treasure' | 'trap' | 'exit' | 'bonus' | 'neutral'
    > = {};
    Object.entries(tileTypes).forEach(([key, value]) => {
      if (
        value === 'treasure' ||
        value === 'trap' ||
        value === 'exit' ||
        value === 'bonus' ||
        value === 'neutral'
      ) {
        result[key] = value;
      }
    });
    return result;
  }, [tileTypes]);

  return (
    <GameGridLayout
      revealedTiles={revealedTiles}
      turnsUsed={turnsUsed}
      grid={grid}
      tileTypes={typedTileTypes}
      onTilePress={handleTilePress}
    />
  );
}
