import React from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui';

export default function GameGrid() {
  const rows = 5;
  const cols = 6;
  const totalTiles = rows * cols;

  // Create a 2D array for the grid
  const grid = Array.from({ length: rows }, (_, rowIndex) =>
    Array.from({ length: cols }, (_, colIndex) => ({
      id: `${rowIndex}-${colIndex}`,
      row: rowIndex,
      col: colIndex,
    }))
  );

  return (
    <View className="px-4">
      <Text className="mb-4 text-xl font-bold">Game Grid</Text>

      {/* Grid Information */}
      <View className="mb-4 space-y-1">
        <Text className="text-base">
          Grid: {cols}x{rows}
        </Text>
        <Text className="text-base">Total Tiles: {totalTiles}</Text>
      </View>

      {/* Game Grid */}
      <View testID="game-grid" className="w-full">
        {grid.map((row, rowIndex) => (
          <View key={rowIndex} className="w-full flex-row">
            {row.map((tile) => (
              <View
                key={tile.id}
                testID="grid-tile"
                className="mx-0.5 aspect-square flex-1 rounded border border-gray-400 bg-gray-300"
                style={{ minHeight: 40 }} // Ensure minimum tile size
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}
