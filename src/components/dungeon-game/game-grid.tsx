import React, { useState } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui';

import GridTile from './grid-tile';

interface GameGridLayoutProps {
  cols: number;
  rows: number;
  totalTiles: number;
  revealedTiles: Set<string>;
  grid: { id: string; row: number; col: number }[][];
  tileTypes: Record<
    string,
    'monster' | 'treasure' | 'trap' | 'exit' | 'bonus' | 'neutral'
  >;
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
        <Text className="text-base">
          Revealed: {revealedTiles.size}/{totalTiles}
        </Text>
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

  // Game state for tile reveals
  const [revealedTiles, setRevealedTiles] = useState<Set<string>>(new Set());
  const [tileTypes, setTileTypes] = useState<
    Record<
      string,
      'monster' | 'treasure' | 'trap' | 'exit' | 'bonus' | 'neutral'
    >
  >({});

  // Create a 2D array for the grid
  const createGrid = () => {
    return Array.from({ length: rows }, (_, rowIndex) =>
      Array.from({ length: cols }, (_, colIndex) => ({
        id: `${rowIndex}-${colIndex}`,
        row: rowIndex,
        col: colIndex,
      }))
    );
  };

  const grid = createGrid();

  const getRandomTileType = () => {
    const types: (
      | 'monster'
      | 'treasure'
      | 'trap'
      | 'exit'
      | 'bonus'
      | 'neutral'
    )[] = ['monster', 'treasure', 'trap', 'exit', 'bonus', 'neutral'];
    return types[Math.floor(Math.random() * types.length)];
  };

  const handleTilePress = (id: string, _row: number, _col: number) => {
    if (!revealedTiles.has(id)) {
      // Reveal the tile
      setRevealedTiles((prev) => new Set([...prev, id]));
      // Assign a random tile type
      setTileTypes((prev) => ({ ...prev, [id]: getRandomTileType() }));
    }
  };

  return (
    <GameGridLayout
      cols={cols}
      rows={rows}
      totalTiles={totalTiles}
      revealedTiles={revealedTiles}
      grid={grid}
      tileTypes={tileTypes}
      onTilePress={handleTilePress}
    />
  );
}
