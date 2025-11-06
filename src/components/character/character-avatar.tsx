import React from 'react';
import { Image, View } from 'react-native';

import { Text } from '@/components/ui';

import type { AvatarPartType } from '../../types/avatar';
import type { Character } from '../../types/character';

type CharacterAvatarProps = {
  character: Character;
  size?: number;
  showName?: boolean;
};

// Default avatar images
const DEFAULT_HEAD = require('../../../assets/head.png');
const DEFAULT_TORSO = require('../../../assets/torso.png');
const DEFAULT_LEGS = require('../../../assets/legs.png');

// Avatar part image mapping
// Maps part IDs to their image sources
// For now, all custom parts fall back to defaults until placeholder assets are created
const AVATAR_IMAGE_MAP: Record<string, any> = {
  default_head: DEFAULT_HEAD,
  default_torso: DEFAULT_TORSO,
  default_legs: DEFAULT_LEGS,
  // Will be populated with placeholder assets in task 7.0
  // For now, all custom parts map to defaults
  head_warrior_helmet: DEFAULT_HEAD,
  head_mage_hat: DEFAULT_HEAD,
  head_rogue_hood: DEFAULT_HEAD,
  head_crown: DEFAULT_HEAD,
  torso_warrior_armor: DEFAULT_TORSO,
  torso_mage_robe: DEFAULT_TORSO,
  torso_ranger_cloak: DEFAULT_TORSO,
  torso_royal_garment: DEFAULT_TORSO,
  legs_warrior_boots: DEFAULT_LEGS,
  legs_mage_sandals: DEFAULT_LEGS,
  legs_ranger_leggings: DEFAULT_LEGS,
  legs_noble_pants: DEFAULT_LEGS,
};

/**
 * Get the image source for an avatar part ID
 * Falls back to default images if part ID is not found or invalid
 */
function getAvatarImagePath(
  partId: string | undefined,
  partType: AvatarPartType
): any {
  // If no part ID provided, use default
  if (!partId) {
    return getDefaultImage(partType);
  }

  // Check if part ID exists in mapping
  if (AVATAR_IMAGE_MAP[partId]) {
    return AVATAR_IMAGE_MAP[partId];
  }

  // Fallback to default for invalid part IDs
  return getDefaultImage(partType);
}

/**
 * Get default image for a part type
 */
function getDefaultImage(partType: AvatarPartType): any {
  switch (partType) {
    case 'head':
      return DEFAULT_HEAD;
    case 'torso':
      return DEFAULT_TORSO;
    case 'legs':
      return DEFAULT_LEGS;
    default:
      return DEFAULT_HEAD;
  }
}

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  character,
  showName = false,
}) => {
  // Get equipped avatar parts from character, or use defaults
  const equippedParts = character.equippedAvatarParts || {
    headId: 'default_head',
    torsoId: 'default_torso',
    legsId: 'default_legs',
  };

  // Get image sources for each part
  const headSource = getAvatarImagePath(equippedParts.headId, 'head');
  const torsoSource = getAvatarImagePath(equippedParts.torsoId, 'torso');
  const legsSource = getAvatarImagePath(equippedParts.legsId, 'legs');

  return (
    <View className="flex-1 items-center justify-center">
      <View className="aspect-[1/0.9] w-full max-w-sm items-center justify-center">
        {/* Character body parts stacked vertically */}
        <View className="aspect-[1/0.9] w-full">
          {/* Head */}
          <Image
            source={headSource}
            className="h-1/3 w-full"
            resizeMode="contain"
            testID="avatar-head"
          />

          {/* Torso */}
          <Image
            source={torsoSource}
            className="h-1/3 w-full"
            resizeMode="contain"
            testID="avatar-torso"
          />

          {/* Legs */}
          <Image
            source={legsSource}
            className="h-1/3 w-full"
            resizeMode="contain"
            testID="avatar-legs"
          />
        </View>
      </View>

      {/* Character name */}
      {showName && (
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
      )}
    </View>
  );
};
