import React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';

interface GridTileProps {
  id: string;
  row: number;
  col: number;
  isRevealed?: boolean;
  tileType?: 'monster' | 'treasure' | 'trap' | 'exit' | 'bonus' | 'neutral';
  onPress?: (id: string, row: number, col: number) => void;
}

export default function GridTile({
  id,
  row,
  col,
  isRevealed = false,
  tileType = 'neutral',
  onPress,
}: GridTileProps) {
  const handlePress = () => {
    if (onPress) {
      onPress(id, row, col);
    }
  };

  const getTileContent = () => {
    if (!isRevealed) return null;

    switch (tileType) {
      case 'monster':
        return '💀';
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

  const getTileStyle = () => {
    if (isRevealed) {
      return 'bg-gray-100'; // Light gray for face-up
    }
    return 'bg-gray-400'; // Darker gray for face-down
  };

  return (
    <Pressable
      testID="grid-tile"
      onPress={handlePress}
      className={`mx-0.5 aspect-square flex-1 rounded border border-gray-400 ${getTileStyle()}`}
      style={{ minHeight: 40 }}
    >
      <View className="flex-1 items-center justify-center">
        {isRevealed && <Text className="text-lg">{getTileContent()}</Text>}
      </View>
    </Pressable>
  );
}
