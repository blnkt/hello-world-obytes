import React, { useState } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui';

import GridTile from './grid-tile';

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
        <Text className="text-base">
          Revealed: {revealedTiles.size}/{totalTiles}
        </Text>
        <Text className="text-base">Turns: {turnsUsed}</Text>
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

export default function GameGrid() {
  const rows = 5;
  const cols = 6;
  const totalTiles = rows * cols;

  // Game state for tile reveals and turns
  const [revealedTiles, setRevealedTiles] = useState<Set<string>>(new Set());
  const [tileTypes, setTileTypes] = useState<
    Record<string, 'treasure' | 'trap' | 'exit' | 'bonus' | 'neutral'>
  >({});
  const [turnsUsed, setTurnsUsed] = useState(0);

  const grid = Array.from({ length: rows }, (_, rowIndex) =>
    Array.from({ length: cols }, (_, colIndex) => ({
      id: `${rowIndex}-${colIndex}`,
      row: rowIndex,
      col: colIndex,
    }))
  );

  // Generate level tiles once when component mounts
  const levelTiles = React.useMemo(() => generateLevelTiles(), []);

  const handleTilePress = (id: string, _row: number, _col: number) => {
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
    }
  };

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
