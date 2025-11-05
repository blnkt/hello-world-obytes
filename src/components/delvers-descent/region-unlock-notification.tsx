import React, { useEffect } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { getRegionById } from '@/lib/delvers-descent/regions';
import type { Region } from '@/types/delvers-descent';

interface RegionUnlockNotificationProps {
  regionId: string | null | undefined;
  visible: boolean;
  onClose: () => void;
}

const formatBonusText = (bonus: Region['startingBonus']): string => {
  const parts: string[] = [];
  if (bonus.energyBonus > 0) {
    parts.push(`+${bonus.energyBonus} starting energy`);
  }
  if (bonus.itemsBonus > 0) {
    parts.push(`+${bonus.itemsBonus} starting items`);
  }
  return parts.length > 0 ? parts.join(', ') : 'No starting bonuses';
};

const getThemeEmoji = (theme: string): string => {
  const themeEmojis: Record<string, string> = {
    ancient_forest: '🌲',
    desert: '🏜️',
    mountain: '⛰️',
    coastal: '🌊',
    dragon: '🐉',
  };
  return themeEmojis[theme] || '🗺️';
};

export const RegionUnlockNotification: React.FC<
  RegionUnlockNotificationProps
> = ({ regionId, visible, onClose }) => {
  const region = regionId ? getRegionById(regionId) : null;

  // Auto-close after 5 seconds
  useEffect(() => {
    if (visible && region) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [visible, region, onClose]);

  if (!region || !visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      testID="region-unlock-notification"
    >
      <NotificationContent region={region} onClose={onClose} />
    </Modal>
  );
};

const NotificationContent: React.FC<{
  region: {
    theme: string;
    name: string;
    description: string;
    startingBonus: { energyBonus: number; itemsBonus: number };
  };
  onClose: () => void;
}> = ({ region, onClose }) => (
  <View className="flex-1 items-center justify-center bg-black/50">
    <View className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
      <View className="mb-4 items-center">
        <Text className="mb-2 text-6xl">{getThemeEmoji(region.theme)}</Text>
        <Text className="mb-2 text-center text-3xl font-bold text-gray-800">
          Region Unlocked!
        </Text>
        <Text className="text-center text-xl font-semibold text-blue-600">
          {region.name}
        </Text>
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-center text-gray-600">
          {region.description}
        </Text>
      </View>

      <View className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <Text className="mb-2 text-center font-semibold text-gray-700">
          Starting Bonuses
        </Text>
        <Text className="text-center text-gray-600">
          {formatBonusText(region.startingBonus)}
        </Text>
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
          Theme: {region.theme.replace('_', ' ')}
        </Text>
      </View>

      <Pressable
        onPress={onClose}
        className="rounded-lg bg-blue-500 px-6 py-3"
        testID="close-notification"
      >
        <Text className="text-center text-lg font-semibold text-white">
          Continue
        </Text>
      </Pressable>
    </View>
  </View>
);
