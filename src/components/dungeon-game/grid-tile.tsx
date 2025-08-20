import React from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

// SVG Icon Components
const SkullIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="white">
    <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
    <Circle cx="9" cy="10" r="1.5" />
    <Circle cx="15" cy="10" r="1.5" />
    <Path d="M12 16c-1.1 0-2-.9-2-2h4c0 1.1-.9 2-2 2z" />
  </Svg>
);

const StarIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="white">
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Svg>
);

const TargetIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="white">
    <Path d="M18 4v16H6V4zm0-2H6c-1.1 0-2 .9-2 2v18h16V4c0-1.1-.9-2-2-2m-2.5 8.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5S17 12.83 17 12s-.67-1.5-1.5-1.5"></Path>
  </Svg>
);

const TreasureIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="white">
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Svg>
);

const getTileContent = (
  tileType: 'treasure' | 'trap' | 'exit' | 'bonus' | 'neutral',
  isRevealed: boolean
) => {
  if (!isRevealed) return null;

  switch (tileType) {
    case 'treasure':
      return <TreasureIcon />;
    case 'trap':
      return <SkullIcon />;
    case 'exit':
      return <TargetIcon />;
    case 'bonus':
      return <StarIcon />;
    case 'neutral':
    default:
      return null;
  }
};

const getTileDescription = (
  tileType: 'treasure' | 'trap' | 'exit' | 'bonus' | 'neutral',
  isRevealed: boolean
) => {
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

const getTileStyle = (
  tileType: 'treasure' | 'trap' | 'exit' | 'bonus' | 'neutral',
  isRevealed: boolean,
  disabled: boolean
) => {
  if (disabled) {
    return 'bg-gray-300 border-gray-400 opacity-50'; // Disabled state
  }

  if (!isRevealed) {
    return 'bg-[#7A6F66] border-[#6B5F57]'; // Medium brown for unrevealed tiles (mockup color)
  }

  // Different styles for revealed tiles based on type (matching mockup colors)
  switch (tileType) {
    case 'treasure':
      return 'bg-[#F7D17B] border-[#E6C269]'; // Yellow/gold for treasure (mockup color)
    case 'trap':
      return 'bg-[#D96B5E] border-[#C55A4D]'; // Reddish-orange for trap (mockup color)
    case 'exit':
      return 'bg-[#8C7099] border-[#7D618A]'; // Muted purple for exit (mockup color)
    case 'bonus':
      return 'bg-[#5EC0C0] border-[#4DAFAF]'; // Teal/cyan for bonus (mockup color)
    case 'neutral':
    default:
      return 'bg-[#E0D9CE] border-[#D1CABF]'; // Light beige for neutral (mockup color)
  }
};

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

  // Create a specific testID that includes tile type when revealed for better testing
  const getTestId = () => {
    if (isRevealed) {
      return `grid-tile-${tileType}`;
    }
    return 'grid-tile';
  };

  return (
    <Pressable
      testID={getTestId()}
      onPress={handlePress}
      disabled={disabled}
      accessible={true}
      accessibilityLabel={`Tile at row ${row + 1}, column ${col + 1}`}
      accessibilityHint={getTileDescription(tileType, isRevealed)}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      className={`m-0.5 aspect-square flex-1 rounded-md border ${getTileStyle(tileType, isRevealed, disabled)}`}
      style={{ minHeight: 35 }}
    >
      <View className="flex-1 items-center justify-center">
        {isRevealed && getTileContent(tileType, isRevealed)}
      </View>
    </Pressable>
  );
}
