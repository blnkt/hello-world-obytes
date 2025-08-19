import React from 'react';
import { View } from 'react-native';

import { Button, Text } from '@/components/ui';

export default function DungeonGame() {
  return (
    <View className="flex-1 p-4">
      <Text className="mb-4 text-2xl font-bold">Dungeon Game</Text>
      <Text className="mb-4 text-lg">Level 1</Text>
      <Button label="Home" onPress={() => {}} size="sm" />
    </View>
  );
}
