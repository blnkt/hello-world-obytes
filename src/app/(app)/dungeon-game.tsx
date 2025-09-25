import { Stack } from 'expo-router';
import React from 'react';

import DungeonGameWrapper from '@/components/dungeon-game/dungeon-game-wrapper';

export default function DungeonGameRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <DungeonGameWrapper />
    </>
  );
}
