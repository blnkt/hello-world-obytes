import { SplashScreen, Tabs } from 'expo-router';
import React, { useCallback, useEffect } from 'react';

import {
  Character as CharacterIcon,
  Home as HomeIcon,
  MerchantIcon,
  Settings as SettingsIcon,
} from '@/components/ui/icons';
import { HealthModeProvider } from '@/lib/health';

// TODO: PHASE 4 - Add animations - Smooth transitions between screens and interactions
// TODO: PHASE 4 - Add character portraits - Visual representation of characters
// TODO: PHASE 4 - Implement particle effects - Visual effects for level-ups and achievements

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

const getStepsHistoryTabScreen = () => ({
  name: 'steps-history',
  options: {
    href: null,
    title: 'Scenarios',
    headerShown: true,
    tabBarIcon: ({ color }: { color: string }) => (
      <MerchantIcon color={color} />
    ),
    tabBarButtonTestID: 'scenarios-tab',
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

const getDungeonGameTabScreen = () => ({
  name: 'dungeon-game',
  options: {
    href: null,
    title: 'Dungeon',
    headerShown: true,
    tabBarIcon: ({ color }: { color: string }) => (
      <MerchantIcon color={color} />
    ),
    tabBarButtonTestID: 'dungeon-tab',
  },
});

const getShopTabScreen = () => ({
  name: 'shop',
  options: {
    href: null,
    title: 'Shop',
    headerShown: true,
    tabBarIcon: ({ color }: { color: string }) => (
      <MerchantIcon color={color} />
    ),
    tabBarButtonTestID: 'shop-tab',
  },
});

const getHiddenScreens = () => [
  {
    name: 'scenario',
    options: {
      href: null,
      title: 'Scenario',
      headerShown: true,
    },
  },
  {
    name: 'achievements',
    options: {
      href: null,
      title: 'Achievements',
      headerShown: true,
    },
  },
  {
    name: 'active-run',
    options: {
      href: null,
      title: 'Active Run',
      headerShown: true,
    },
  },
  {
    name: 'bust-screen',
    options: {
      href: null,
      title: 'Bust Screen',
      headerShown: true,
    },
  },
  {
    name: 'collections',
    options: {
      href: null,
      title: 'Collections',
      headerShown: true,
    },
  },
  {
    name: 'run-history',
    options: {
      href: null,
      title: 'Run History',
      headerShown: true,
    },
  },
  {
    name: 'run-queue',
    options: {
      href: null,
      title: 'Run Queue',
      headerShown: true,
    },
  },
];

const getTabScreens = () => [
  getCharacterTabScreen(),
  getStepsHistoryTabScreen(),
  getSettingsTabScreen(),
  getHomeTabScreen(),
  // Note: scenario, dungeon-game, shop already have href: null in their individual configs
  getDungeonGameTabScreen(),
  getShopTabScreen(),
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
    <HealthModeProvider>
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
        {/* Hidden screens - accessible via navigation but not in tab bar */}
        {getHiddenScreens().map((screen) => (
          <Tabs.Screen
            key={screen.name}
            name={screen.name}
            options={screen.options}
          />
        ))}
      </Tabs>
    </HealthModeProvider>
  );
}
