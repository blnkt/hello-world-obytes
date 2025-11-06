import React from 'react';
import { Image, View } from 'react-native';

import { Text } from '@/components/ui';
import { getAvatarImageSource } from '@/lib/avatar-assets';

import type { Character } from '../../types/character';

type CharacterAvatarProps = {
  character: Character;
  size?: number;
  showName?: boolean;
};

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
  const headSource = getAvatarImageSource(equippedParts.headId, 'head');
  const torsoSource = getAvatarImageSource(equippedParts.torsoId, 'torso');
  const legsSource = getAvatarImageSource(equippedParts.legsId, 'legs');

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
