import React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';

interface GridTileProps {
  id: string;
  row: number;
  col: number;
  isRevealed?: boolean;
  tileType?: 'treasure' | 'trap' | 'exit' | 'bonus' | 'neutral';
  onPress?: (id: string, row: number, col: number) => void;
  disabled?: boolean;
}

export default function GridTile({
  id,
  row,
  col,
  isRevealed = false,
  tileType = 'neutral',
  onPress,
  disabled = false,
}: GridTileProps) {
  const handlePress = () => {
    if (onPress && !disabled) {
      onPress(id, row, col);
    }
  };

  const getTileContent = () => {
    if (!isRevealed) return null;

    switch (tileType) {
      case 'treasure':
        return '💎';
      case 'trap':
        return '⚠️';
      case 'exit':
        return '🚪';
      case 'bonus':
        return '⭐';
      case 'neutral':
      default:
        return '·';
    }
  };

  const getTileDescription = () => {
    if (!isRevealed) return 'Hidden tile';
    
    switch (tileType) {
      case 'treasure':
        return 'Treasure tile - Gain a free turn';
      case 'trap':
        return 'Trap tile - Lose an additional turn';
      case 'exit':
        return 'Exit tile - Complete the level';
      case 'bonus':
        return 'Bonus tile - Reveal adjacent tiles';
      case 'neutral':
      default:
        return 'Neutral tile - No special effect';
    }
  };

  const getTileStyle = () => {
    if (disabled) {
      return 'bg-gray-300 border-gray-400 opacity-50'; // Disabled state
    }
    
    if (!isRevealed) {
      return 'bg-gray-400 border-gray-500 hover:bg-gray-300'; // Darker gray for face-down
    }

    // Different styles for revealed tiles based on type
    switch (tileType) {
      case 'treasure':
        return 'bg-yellow-100 border-yellow-400 shadow-lg hover:bg-yellow-200'; // Golden for treasure
      case 'trap':
        return 'bg-red-100 border-red-400 shadow-lg hover:bg-red-200'; // Red for trap
      case 'exit':
        return 'bg-green-100 border-green-400 shadow-lg hover:bg-green-200'; // Green for exit
      case 'bonus':
        return 'bg-blue-100 border-blue-400 shadow-lg hover:bg-blue-200'; // Blue for bonus
      case 'neutral':
      default:
        return 'bg-gray-100 border-gray-300 hover:bg-gray-200'; // Light gray for neutral
    }
  };

  const getTileAnimation = () => {
    if (!isRevealed) return '';
    
    // Add animation classes for revealed tiles
    switch (tileType) {
      case 'treasure':
        return 'animate-pulse'; // Pulsing effect for treasure
      case 'trap':
        return 'animate-bounce'; // Bouncing effect for trap
      case 'exit':
        return 'animate-pulse'; // Pulsing effect for exit
      case 'bonus':
        return 'animate-spin'; // Spinning effect for bonus
      default:
        return '';
    }
  };

  return (
    <Pressable
      testID="grid-tile"
      onPress={handlePress}
      disabled={disabled}
      accessible={true}
      accessibilityLabel={`Tile at row ${row + 1}, column ${col + 1}`}
      accessibilityHint={getTileDescription()}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      className={`mx-0.5 aspect-square flex-1 rounded border ${getTileStyle()} ${getTileAnimation()}`}
      style={{ minHeight: 40 }}
    >
      <View className="flex-1 items-center justify-center">
        {isRevealed && (
          <Text className="text-lg font-bold">{getTileContent()}</Text>
        )}
      </View>
    </Pressable>
  );
}
