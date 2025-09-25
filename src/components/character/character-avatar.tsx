import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Text } from '@/components/ui';
import colors from '@/components/ui/colors';

import type { Character } from '../../types/character';

type CharacterAvatarProps = {
  character: Character;
  size?: number;
  isWalking?: boolean;
};

const getClassColor = (characterClass: string) => {
  switch (characterClass) {
    case 'Cardio Crusher':
      return colors.primary[500]; // Blue
    case 'Strength Seeker':
      return colors.danger[500]; // Red
    case 'Flexibility Fanatic':
      return colors.primary[500]; // Purple (using primary for now)
    case 'Weight Loss Warrior':
      return colors.success[500]; // Green
    case 'General Fitness':
    default:
      return colors.charcoal[500]; // Gray
  }
};

const CharacterSvg: React.FC<{
  primaryColor: string;
  secondaryColor: string;
  size: number;
}> = ({ primaryColor, secondaryColor, size }) => {
  // Add explicit displayName to help with debugging
  CharacterSvg.displayName = 'CharacterSvg';

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Background circle */}
      <Circle
        cx="50"
        cy="50"
        r="45"
        fill={secondaryColor}
        stroke={primaryColor}
        strokeWidth="2"
      />

      {/* Character body */}
      <Circle cx="50" cy="35" r="8" fill={primaryColor} />
      <Rect x="46" y="43" width="8" height="15" fill={primaryColor} rx="2" />

      {/* Arms */}
      <Path
        d="M 35 40 L 25 35"
        stroke={primaryColor}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <Path
        d="M 65 40 L 75 35"
        stroke={primaryColor}
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Legs */}
      <Path
        d="M 45 58 L 40 70"
        stroke={primaryColor}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <Path
        d="M 55 58 L 60 70"
        stroke={primaryColor}
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Level indicator */}
      <Circle cx="75" cy="25" r="12" fill={primaryColor} />
      <Circle cx="75" cy="25" r="10" fill={colors.white} />
      <Path d="M 75 20 L 78 25 L 75 30 L 72 25 Z" fill={primaryColor} />
    </Svg>
  );
};

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  character,
  size = 120,
  isWalking = true,
}) => {
  const primaryColor = getClassColor(character.class);
  const secondaryColor = colors.neutral[100];

  return (
    <View className="items-center justify-center">
      <View style={{ width: size, height: size }}>
        <CharacterSvg
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          size={size}
        />
      </View>

      {/* Character name */}
      <View className="mt-2 items-center">
        <View className="rounded-full bg-white px-3 py-1 shadow-sm dark:bg-gray-800">
          <Text className="text-sm font-medium text-gray-900 dark:text-white">
            {character.name || 'Adventurer'}
          </Text>
        </View>
        <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Level {character.level}
        </Text>
      </View>
    </View>
  );
};
