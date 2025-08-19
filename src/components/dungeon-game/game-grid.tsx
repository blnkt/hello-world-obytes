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

  const generateLevelTiles = (_level: number) => {
    const totalTiles = rows * cols;
    const tileDistribution = {
      exit: 1, // Always exactly 1 exit
      monster: Math.floor(totalTiles * 0.3), // 30% monsters
      trap: Math.floor(totalTiles * 0.2), // 20% traps
      treasure: Math.floor(totalTiles * 0.15), // 15% treasure
      bonus: Math.floor(totalTiles * 0.1), // 10% bonus
      neutral:
        totalTiles -
        1 -
        Math.floor(totalTiles * 0.3) -
        Math.floor(totalTiles * 0.2) -
        Math.floor(totalTiles * 0.15) -
        Math.floor(totalTiles * 0.1), // Remaining neutral
    };

    // Create array of all tile types
    const tileTypesArray: (
      | 'monster'
      | 'treasure'
      | 'trap'
      | 'exit'
      | 'bonus'
      | 'neutral'
    )[] = [];

    // Add guaranteed exit
    tileTypesArray.push('exit');

    // Add other tile types based on distribution
    for (let i = 0; i < tileDistribution.monster; i++)
      tileTypesArray.push('monster');
    for (let i = 0; i < tileDistribution.trap; i++) tileTypesArray.push('trap');
    for (let i = 0; i < tileDistribution.treasure; i++)
      tileTypesArray.push('treasure');
    for (let i = 0; i < tileDistribution.bonus; i++)
      tileTypesArray.push('bonus');
    for (let i = 0; i < tileDistribution.neutral; i++)
      tileTypesArray.push('neutral');

    // Shuffle the array (Fisher-Yates shuffle)
    for (let i = tileTypesArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tileTypesArray[i], tileTypesArray[j]] = [
        tileTypesArray[j],
        tileTypesArray[i],
      ];
    }

    return tileTypesArray;
  };

  const handleTilePress = (id: string, _row: number, _col: number) => {
    if (!revealedTiles.has(id)) {
      // Reveal the tile
      setRevealedTiles((prev) => new Set([...prev, id]));

      // Use level generation algorithm for tile type
      const levelTiles = generateLevelTiles(1); // Level 1 for now
      const tileIndex =
        parseInt(id.split('-')[0]) * cols + parseInt(id.split('-')[1]);
      const tileType = levelTiles[tileIndex];

      setTileTypes((prev) => ({ ...prev, [id]: tileType }));
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
