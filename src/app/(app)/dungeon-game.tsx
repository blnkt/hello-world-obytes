import { Stack } from 'expo-router';
import React from 'react';

import DungeonGame from '@/components/dungeon-game/dungeon-game';

export default function DungeonGameRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <DungeonGame />
    </>
  );
}
