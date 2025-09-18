import React from 'react';
import { View } from 'react-native';

import colors from '@/components/ui/colors';

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
  insufficientCurrency,
}: GameGridLayoutProps & { insufficientCurrency: boolean }) {
  return (
    <View className="px-4 pb-2">
      {/* Game Grid with light brown frame */}
      <View className={`bg-[${colors.neutral[200]}] rounded-lg p-4`}>
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
                  insufficientCurrency={insufficientCurrency}
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
    revealAdjacentTile,
    completeLevel,
    currency,
    addCurrency,
    deductCurrency,
    canRevealTile,
  } = useGameState();

  const grid = React.useMemo(
    () => createGridStructure(GRID_ROWS, GRID_COLS),
    []
  );

  // Helper function to handle tile effects
  const handleTileEffects = React.useCallback(
    (tileType: string, id: string) => {
      if (tileType === 'exit') {
        completeLevel();
      } else if (tileType === 'trap') {
        if (currency >= 100) {
          deductCurrency(100);
        } else {
          console.warn('Cannot apply trap penalty: insufficient currency');
        }
      } else if (tileType === 'treasure') {
        addCurrency(100);
      } else if (tileType === 'bonus') {
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

          const adjacentRevealSuccess = revealAdjacentTile(
            adjRow,
            adjCol,
            adjTileType
          );
          if (adjacentRevealSuccess) {
            addCurrency(100);
          }
        }
      }
    },
    [
      currency,
      addCurrency,
      deductCurrency,
      revealAdjacentTile,
      completeLevel,
      revealedTiles,
      levelTiles,
    ]
  );

  const handleTilePress = React.useCallback(
    (id: string, row: number, col: number) => {
      if (disabled || revealedTiles.has(id)) {
        return;
      }

      const tileIndex = row * GRID_COLS + col;
      const tileType = levelTiles[tileIndex];

      // Enhanced currency validation
      const availableTurns = Math.floor(currency / 100);
      if (availableTurns <= 0 || currency < 100) {
        console.warn('Cannot reveal tile: insufficient currency');
        return;
      }

      const revealSuccess = revealTile(row, col, tileType);
      if (!revealSuccess) {
        console.warn('Tile reveal failed - likely due to currency validation');
        return;
      }

      handleTileEffects(tileType, id);
    },
    [
      disabled,
      revealedTiles,
      levelTiles,
      currency,
      revealTile,
      handleTileEffects,
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
      insufficientCurrency={!canRevealTile()}
    />
  );
}
