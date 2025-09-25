import React from 'react';
import { View } from 'react-native';

import { Button, Text } from '@/components/ui';

import type { Character } from '../../types/character';

type CharacterCustomizationProps = {
  character: Character;
  onCustomize?: () => void;
};

export const CharacterCustomization: React.FC<CharacterCustomizationProps> = ({
  character: _character,
  onCustomize,
}) => {
  return (
    <View className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
      <Text className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
        Customize Appearance
      </Text>
      <Text className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Personalize your character's look and style
      </Text>

      <View className="space-y-3">
        <Button
          label="Change Outfit"
          variant="outline"
          onPress={onCustomize}
          disabled={!onCustomize}
        />
        <Button
          label="Change Hair Style"
          variant="outline"
          onPress={onCustomize}
          disabled={!onCustomize}
        />
        <Button
          label="Change Accessories"
          variant="outline"
          onPress={onCustomize}
          disabled={!onCustomize}
        />
      </View>

      <View className="mt-4 rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
        <Text className="text-xs text-blue-700 dark:text-blue-300">
          🎨 Customization features coming soon! Unlock new outfits and
          accessories as you level up.
        </Text>
      </View>
    </View>
  );
};
