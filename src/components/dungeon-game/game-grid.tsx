import React, { useState } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui';

import GridTile from './grid-tile';

// Custom hook for game grid state management
const useGameGridState = (
  onTurnsUpdate?: (turns: number) => void,
  onRevealedTilesUpdate?: (count: number) => void
) => {
  const [revealedTiles, setRevealedTiles] = useState<Set<string>>(new Set());
  const [tileTypes, setTileTypes] = useState<
    Record<string, 'treasure' | 'trap' | 'exit' | 'bonus' | 'neutral'>
  >({});
  const [turnsUsed, setTurnsUsed] = useState(0);

  // Update parent component when state changes
  const updateParentState = React.useCallback(() => {
    onTurnsUpdate?.(turnsUsed);
    onRevealedTilesUpdate?.(revealedTiles.size);
  }, [turnsUsed, revealedTiles.size, onTurnsUpdate, onRevealedTilesUpdate]);

  React.useEffect(() => {
    updateParentState();
  }, [updateParentState]);

  return {
    revealedTiles,
    setRevealedTiles,
    tileTypes,
    setTileTypes,
    turnsUsed,
    setTurnsUsed,
  };
};

// Helper function to generate level tiles
const generateLevelTiles = () => {
  const tileDistribution = {
    exit: 1,
    trap: 4,
    treasure: 4,
    bonus: 4,
    neutral: 17,
  };
  const tileTypesArray: ('treasure' | 'trap' | 'exit' | 'bonus' | 'neutral')[] =
    [];

  Object.entries(tileDistribution).forEach(([type, count]) => {
    for (let i = 0; i < count; i++) tileTypesArray.push(type as any);
  });

  for (let i = tileTypesArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tileTypesArray[i], tileTypesArray[j]] = [
      tileTypesArray[j],
      tileTypesArray[i],
    ];
  }

  return tileTypesArray;
};

// Helper function to find an unrevealed adjacent tile
const findUnrevealedAdjacentTile = (params: {
  tileId: string;
  revealedTiles: Set<string>;
  rows: number;
  cols: number;
}): string | null => {
  const { tileId, revealedTiles, rows, cols } = params;
  const [row, col] = tileId.split('-').map(Number);
  const adjacentTiles: string[] = [];

  // Check all four directions: up, right, down, left
  if (row > 0) adjacentTiles.push(`${row - 1}-${col}`); // up
  if (col < cols - 1) adjacentTiles.push(`${row}-${col + 1}`); // right
  if (row < rows - 1) adjacentTiles.push(`${row + 1}-${col}`); // down
  if (col > 0) adjacentTiles.push(`${row}-${col - 1}`); // left

  // Filter to only unrevealed tiles
  const unrevealedAdjacent = adjacentTiles.filter(
    (id) => !revealedTiles.has(id)
  );

  // Return a random unrevealed adjacent tile, or null if none available
  return unrevealedAdjacent.length > 0
    ? unrevealedAdjacent[Math.floor(Math.random() * unrevealedAdjacent.length)]
    : null;
};

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

    // Apply effects for the auto-revealed tile
    if (adjacentTileType === 'trap') {
      setTurnsUsed((prev) => prev + 1);
    } else if (adjacentTileType === 'treasure') {
      setTurnsUsed((prev) => prev - 1);
    }
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
    });
  }

  // Win condition when exit tile is revealed
  if (tileType === 'exit') {
    onExitFound?.();
  }
};

// Helper function to handle tile press
const createTilePressHandler = (params: {
  revealedTiles: Set<string>;
  cols: number;
  levelTiles: ('treasure' | 'trap' | 'exit' | 'bonus' | 'neutral')[];
  setRevealedTiles: React.Dispatch<React.SetStateAction<Set<string>>>;
  setTileTypes: React.Dispatch<
    React.SetStateAction<
      Record<string, 'treasure' | 'trap' | 'exit' | 'bonus' | 'neutral'>
    >
  >;
  setTurnsUsed: React.Dispatch<React.SetStateAction<number>>;
  rows: number;
  onExitFound?: () => void;
}) => {
  const {
    revealedTiles,
    cols,
    levelTiles,
    setRevealedTiles,
    setTileTypes,
    setTurnsUsed,
    rows,
    onExitFound,
  } = params;

  return (id: string, _row: number, _col: number) => {
    if (!revealedTiles.has(id)) {
      // Reveal the tile
      setRevealedTiles((prev) => new Set([...prev, id]));

      // Get tile type from pre-generated level
      const tileIndex =
        parseInt(id.split('-')[0]) * cols + parseInt(id.split('-')[1]);
      const tileType = levelTiles[tileIndex];

      setTileTypes((prev) => ({ ...prev, [id]: tileType }));

      // Deduct a turn for revealing the tile
      setTurnsUsed((prev) => prev + 1);

      // Handle tile-specific effects
      handleTileEffects({
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
      });
    }
  };
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
  turnsUsed,
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

interface GameGridProps {
  onTurnsUpdate?: (turns: number) => void;
  onRevealedTilesUpdate?: (count: number) => void;
  onExitFound?: () => void;
}

export default function GameGrid({
  onTurnsUpdate,
  onRevealedTilesUpdate,
  onExitFound,
}: GameGridProps) {
  const rows = 5;
  const cols = 6;
  const totalTiles = rows * cols;

  // Use custom hook for state management
  const {
    revealedTiles,
    setRevealedTiles,
    tileTypes,
    setTileTypes,
    turnsUsed,
    setTurnsUsed,
  } = useGameGridState(onTurnsUpdate, onRevealedTilesUpdate);

  const grid = Array.from({ length: rows }, (_, rowIndex) =>
    Array.from({ length: cols }, (_, colIndex) => ({
      id: `${rowIndex}-${colIndex}`,
      row: rowIndex,
      col: colIndex,
    }))
  );

  // Generate level tiles once when component mounts
  const levelTiles = React.useMemo(() => generateLevelTiles(), []);

  const handleTilePress = React.useCallback(
    createTilePressHandler({
      revealedTiles,
      cols,
      levelTiles,
      setRevealedTiles,
      setTileTypes,
      setTurnsUsed,
      rows,
      onExitFound,
    }),
    [
      revealedTiles,
      cols,
      levelTiles,
      setRevealedTiles,
      setTileTypes,
      setTurnsUsed,
      rows,
      onExitFound,
    ]
  );

  return (
    <GameGridLayout
      cols={cols}
      rows={rows}
      totalTiles={totalTiles}
      revealedTiles={revealedTiles}
      turnsUsed={turnsUsed}
      grid={grid}
      tileTypes={tileTypes}
      onTilePress={handleTilePress}
    />
  );
}
