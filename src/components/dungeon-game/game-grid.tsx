import React from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui';

import GridTile from './grid-tile';
import { useGameGridState } from './hooks/use-game-grid-state';
import {
  findUnrevealedAdjacentTile,
  generateLevelTiles,
} from './utils/game-utils';

// Game grid constants
const GRID_ROWS = 5;
const GRID_COLS = 6;
const GRID_TOTAL_TILES = GRID_ROWS * GRID_COLS;

// Helper function to handle bonus reveal tile effects
const handleBonusReveal = (params: {
  id: string;
  revealedTiles: Set<string>;
  rows: number;
  cols: number;
  levelTiles: ('treasure' | 'trap' | 'exit' | 'bonus' | 'neutral')[];
  setRevealedTiles: React.Dispatch<React.SetStateAction<Set<string>>>;
  setTileTypes: React.Dispatch<
    React.SetStateAction<
      Record<string, 'treasure' | 'trap' | 'exit' | 'bonus' | 'neutral'>
    >
  >;
  setTurnsUsed: React.Dispatch<React.SetStateAction<number>>;
  onExitFound?: () => void;
}) => {
  const {
    id,
    revealedTiles,
    rows,
    cols,
    levelTiles,
    setRevealedTiles,
    setTileTypes,
    setTurnsUsed,
    onExitFound,
  } = params;
  const adjacentTile = findUnrevealedAdjacentTile({
    tileId: id,
    revealedTiles,
    rows,
    cols,
  });
  if (adjacentTile) {
    // Reveal the adjacent tile
    setRevealedTiles((prev) => new Set([...prev, adjacentTile]));

    // Get tile type for the adjacent tile
    const adjacentTileIndex =
      parseInt(adjacentTile.split('-')[0]) * cols +
      parseInt(adjacentTile.split('-')[1]);
    const adjacentTileType = levelTiles[adjacentTileIndex];

    setTileTypes((prev) => ({ ...prev, [adjacentTile]: adjacentTileType }));

    // Handle tile effects for the auto-revealed tile (including win condition)
    handleTileEffects({
      tileType: adjacentTileType,
      id: adjacentTile,
      revealedTiles,
      rows,
      cols,
      levelTiles,
      setRevealedTiles,
      setTileTypes,
      setTurnsUsed,
      onExitFound,
    });
  }
};

// Helper function to handle tile effects
const handleTileEffects = (params: {
  tileType: 'treasure' | 'trap' | 'exit' | 'bonus' | 'neutral';
  id: string;
  revealedTiles: Set<string>;
  rows: number;
  cols: number;
  levelTiles: ('treasure' | 'trap' | 'exit' | 'bonus' | 'neutral')[];
  setRevealedTiles: React.Dispatch<React.SetStateAction<Set<string>>>;
  setTileTypes: React.Dispatch<
    React.SetStateAction<
      Record<string, 'treasure' | 'trap' | 'exit' | 'bonus' | 'neutral'>
    >
  >;
  setTurnsUsed: React.Dispatch<React.SetStateAction<number>>;
  onExitFound?: () => void;
}) => {
  const {
    tileType,
    id,
    revealedTiles,
    rows,
    cols,
    levelTiles,
    setRevealedTiles,
    setTileTypes,
    setTurnsUsed,
    onExitFound,
  } = params;

  // Additional turn penalty for trap tiles
  if (tileType === 'trap') {
    setTurnsUsed((prev) => prev + 1);
  }

  // Free turn bonus for treasure tiles
  if (tileType === 'treasure') {
    setTurnsUsed((prev) => prev - 1);
  }

  // Auto-reveal adjacent tile for bonus reveal tiles
  if (tileType === 'bonus') {
    handleBonusReveal({
      id,
      revealedTiles,
      rows,
      cols,
      levelTiles,
      setRevealedTiles,
      setTileTypes,
      setTurnsUsed,
      onExitFound,
    });
  }

  // Win condition when exit tile is revealed
  if (tileType === 'exit') {
    onExitFound?.();
  }
};

interface GameGridLayoutProps {
  cols: number;
  rows: number;
  totalTiles: number;
  revealedTiles: Set<string>;
  turnsUsed: number;
  grid: { id: string; row: number; col: number }[][];
  tileTypes: Record<string, 'treasure' | 'trap' | 'exit' | 'bonus' | 'neutral'>;
  onTilePress: (id: string, row: number, col: number) => void;
}

function GameGridLayout({
  cols,
  rows,
  totalTiles,
  revealedTiles,
  grid,
  tileTypes,
  onTilePress,
}: GameGridLayoutProps) {
  return (
    <View className="px-4 pb-2">
      <Text className="mb-4 text-xl font-bold">Game Grid</Text>

      {/* Grid Information */}
      <View className="mb-4 space-y-1">
        <Text className="text-base">
          Grid: {cols}x{rows}
        </Text>
        <Text className="text-base">Total Tiles: {totalTiles}</Text>
      </View>

      {/* Game Grid */}
      <View testID="game-grid" className="w-full pb-4">
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
  );
}

// Helper function to create grid structure
const createGridStructure = (rows: number, cols: number) => {
  return Array.from({ length: rows }, (_, rowIndex) =>
    Array.from({ length: cols }, (_, colIndex) => ({
      id: `${rowIndex}-${colIndex}`,
      row: rowIndex,
      col: colIndex,
    }))
  );
};

const getTileIndex = (id: string) => {
  return parseInt(id.split('-')[0]) * GRID_COLS + parseInt(id.split('-')[1]);
};

const handleTilePressCallback = (
  id: string,
  _row: number,
  _col: number,
  params: {
    disabled: boolean;
    revealedTiles: Set<string>;
    levelTiles: ('treasure' | 'trap' | 'exit' | 'bonus' | 'neutral')[];
    setRevealedTiles: React.Dispatch<React.SetStateAction<Set<string>>>;
    setTileTypes: React.Dispatch<
      React.SetStateAction<
        Record<string, 'treasure' | 'trap' | 'exit' | 'bonus' | 'neutral'>
      >
    >;
    setTurnsUsed: React.Dispatch<React.SetStateAction<number>>;
    onSpendCurrency?: (amount: number) => Promise<boolean>;
    onExitFound?: () => void;
  }
  // eslint-disable-next-line max-params
) => {
  const {
    disabled,
    revealedTiles,
    levelTiles,
    setRevealedTiles,
    setTileTypes,
    setTurnsUsed,
    onSpendCurrency,
    onExitFound,
  } = params;
  if (disabled) return; // Don't allow tile interaction if disabled
  if (!revealedTiles.has(id)) {
    // Reveal the tile
    setRevealedTiles((prev) => new Set([...prev, id]));

    // Get tile type from pre-generated level
    const tileIndex = getTileIndex(id);
    const tileType = levelTiles[tileIndex];

    setTileTypes((prev) => ({ ...prev, [id]: tileType }));

    // Deduct a turn for revealing the tile
    setTurnsUsed((prev) => prev + 1);

    // Spend currency for the turn
    onSpendCurrency?.(100);

    // Handle tile-specific effects
    handleTileEffects({
      tileType,
      id,
      revealedTiles,
      rows: GRID_ROWS,
      cols: GRID_COLS,
      levelTiles,
      setRevealedTiles,
      setTileTypes,
      setTurnsUsed,
      onExitFound,
    });
  }
};

interface GameGridProps {
  level: number;
  disabled?: boolean;
  onTurnsUpdate?: (turns: number) => void;
  onRevealedTilesUpdate?: (count: number) => void;
  onExitFound?: () => void;
  onGameOver?: () => void;
  onSpendCurrency?: (amount: number) => Promise<boolean>;
}

export default function GameGrid({
  level,
  disabled = false,
  onTurnsUpdate,
  onRevealedTilesUpdate,
  onExitFound,
  onGameOver,
  onSpendCurrency,
}: GameGridProps) {
  // Generate level tiles once when component mounts
  const levelTiles = React.useMemo(() => generateLevelTiles(level), [level]);

  // Use custom hook for state management
  const {
    revealedTiles,
    setRevealedTiles,
    tileTypes,
    setTileTypes,
    turnsUsed,
    setTurnsUsed,
  } = useGameGridState({
    onTurnsUpdate,
    onRevealedTilesUpdate,
    onGameOver,
    levelTiles,
  });

  const grid = React.useMemo(
    () => createGridStructure(GRID_ROWS, GRID_COLS),
    []
  );

  const handleTilePress = React.useCallback(
    (id: string, _row: number, _col: number) =>
      handleTilePressCallback(id, _row, _col, {
        disabled,
        revealedTiles,
        levelTiles,
        setRevealedTiles,
        setTileTypes,
        setTurnsUsed,
        onSpendCurrency,
        onExitFound,
      }),
    [
      disabled,
      revealedTiles,
      levelTiles,
      setRevealedTiles,
      setTileTypes,
      setTurnsUsed,
      onSpendCurrency,
      onExitFound,
    ]
  );

  return (
    <GameGridLayout
      cols={GRID_COLS}
      rows={GRID_ROWS}
      totalTiles={GRID_TOTAL_TILES}
      revealedTiles={revealedTiles}
      turnsUsed={turnsUsed}
      grid={grid}
      tileTypes={tileTypes}
      onTilePress={handleTilePress}
    />
  );
}
