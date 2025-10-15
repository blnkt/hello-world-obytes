import React from 'react';
import { Image, View } from 'react-native';

import { Text } from '@/components/ui';

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
  return (
    <View className="flex-1 items-center justify-center">
      <View className="aspect-[1/0.9] w-full max-w-sm items-center justify-center">
        {/* Character body parts stacked vertically */}
        <View className="aspect-[1/0.9] w-full">
          {/* Head */}
          <Image
            source={require('../../../assets/head.png')}
            className="h-1/3 w-full"
            resizeMode="contain"
          />

          {/* Torso */}
          <Image
            source={require('../../../assets/torso.png')}
            className="h-1/3 w-full"
            resizeMode="contain"
          />

          {/* Legs */}
          <Image
            source={require('../../../assets/legs.png')}
            className="h-1/3 w-full"
            resizeMode="contain"
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
