import { SplashScreen, Tabs } from 'expo-router';
import React, { useCallback, useEffect } from 'react';

import {
  Character as CharacterIcon,
  Home as HomeIcon,
  MerchantIcon,
  Settings as SettingsIcon,
} from '@/components/ui/icons';

const getCharacterTabScreen = () => ({
  name: 'character-sheet',
  options: {
    title: 'Character',
    headerShown: true,
    tabBarIcon: ({ color }: { color: string }) => (
      <CharacterIcon color={color} />
    ),
    tabBarButtonTestID: 'character-tab',
  },
});

const getSettingsTabScreen = () => ({
  name: 'settings',
  options: {
    title: 'Settings',
    headerShown: true,
    tabBarIcon: ({ color }: { color: string }) => (
      <SettingsIcon color={color} />
    ),
    tabBarButtonTestID: 'settings-tab',
  },
});

const getHomeTabScreen = () => ({
  name: 'index',
  options: {
    title: 'Home',
    headerShown: true,
    tabBarIcon: ({ color }: { color: string }) => <HomeIcon color={color} />,
    tabBarButtonTestID: 'home-tab',
  },
});

const getTabScreens = () => [
  getCharacterTabScreen(),
  getSettingsTabScreen(),
  getHomeTabScreen(),
];

export default function TabsLayout() {
  const hideSplash = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      hideSplash();
    }, 1000);
  }, [hideSplash]);

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
        },
        headerStyle: {
          elevation: 0,
        },
      }}
    >
      {getTabScreens().map((screen) => (
        <Tabs.Screen
          key={screen.name}
          name={screen.name}
          options={screen.options}
        />
      ))}
    </Tabs>
  );
}


