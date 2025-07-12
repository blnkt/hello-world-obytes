import { SplashScreen, Tabs } from 'expo-router';
import React, { useCallback, useEffect } from 'react';

import {
  Character as CharacterIcon,
  Home as HomeIcon,
  MerchantIcon,
  Settings as SettingsIcon,
} from '@/components/ui/icons';

// TODO: PHASE 4 - Add animations - Smooth transitions between screens and interactions
// TODO: PHASE 4 - Add character portraits - Visual representation of characters
// TODO: PHASE 4 - Implement particle effects - Visual effects for level-ups and achievements

const getTabScreens = () => [
  {
    name: 'character-sheet',
    options: {
      title: 'Character',
      headerShown: true,
      tabBarIcon: ({ color }: { color: string }) => (
        <CharacterIcon color={color} />
      ),
      tabBarButtonTestID: 'character-tab',
    },
  },
  {
    name: 'steps-history',
    options: {
      title: 'Scenarios',
      headerShown: true,
      tabBarIcon: ({ color }: { color: string }) => (
        <MerchantIcon color={color} />
      ),
      tabBarButtonTestID: 'scenarios-tab',
    },
  },
  {
    name: 'settings',
    options: {
      title: 'Settings',
      headerShown: true,
      tabBarIcon: ({ color }: { color: string }) => (
        <SettingsIcon color={color} />
      ),
      tabBarButtonTestID: 'settings-tab',
    },
  },
  {
    name: 'index',
    options: {
      title: 'Home',
      headerShown: true,
      tabBarIcon: ({ color }: { color: string }) => <HomeIcon color={color} />,
      tabBarButtonTestID: 'home-tab',
    },
  },
  {
    name: 'scenario',
    options: {
      href: null,
      title: 'Scenario',
      headerShown: true,
      tabBarIcon: ({ color }: { color: string }) => (
        <MerchantIcon color={color} />
      ),
      tabBarButtonTestID: 'scenario-tab',
    },
  },
  {
    name: 'style',
    options: {
      href: null,
    },
  },
];

export default function TabLayout() {
  const hideSplash = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    // Hide splash screen after a short delay
    setTimeout(() => {
      hideSplash();
    }, 1000);
  }, [hideSplash]);

  return (
    <Tabs>
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
