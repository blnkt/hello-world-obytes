// Import  global CSS file
import '../../global.css';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { APIProvider } from '@/api';
import { loadSelectedTheme, useHealthKit } from '@/lib';
import { useIsFirstTime } from '@/lib/hooks/use-is-first-time';
import { getCharacter } from '@/lib/storage';
import { useThemeConfig } from '@/lib/use-theme-config';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(app)',
};

loadSelectedTheme();
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

function getAppContent({
  isFirstTime,
  _isAvailable,
  _hasRequestedAuthorization,
}: {
  isFirstTime: boolean;
  _isAvailable: boolean | null;
  _hasRequestedAuthorization: boolean | null;
}) {
  // Show onboarding if it's the first time
  if (isFirstTime) {
    return (
      <Stack
        screenOptions={{
          animation: 'fade',
          animationDuration: 300,
        }}
      >
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack>
    );
  }

  // Check if character exists
  const character = getCharacter();
  const hasCharacter =
    character && character.name && character.name.trim() !== '';

  // If not first time but no character, show character creation
  if (!hasCharacter) {
    return (
      <Stack
        screenOptions={{
          animation: 'slide_from_right',
          animationDuration: 300,
        }}
      >
        <Stack.Screen
          name="character-creation"
          options={{ 
            headerShown: false,
            animation: 'fade',
          }}
        />
        <Stack.Screen 
          name="(app)" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="onboarding" 
          options={{ 
            headerShown: false,
            animation: 'fade',
          }} 
        />
      </Stack>
    );
  }

  // If not first time and has character, show main app
  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_right',
        animationDuration: 300,
      }}
    >
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
      {/* Register progression and gameplay routes here for animated transitions */}
      <Stack.Screen
        name="(app)/collections"
        options={{ headerShown: true, animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="(app)/achievements"
        options={{ headerShown: true, animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="(app)/run-history"
        options={{ headerShown: true, animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="(app)/run-queue"
        options={{ headerShown: true, animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="(app)/active-run"
        options={{ headerShown: true, animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="(app)/bust-screen"
        options={{ headerShown: true, animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="(app)/scenario"
        options={{ headerShown: true, animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="character-creation"
        options={{ 
          headerShown: false,
          animation: 'fade',
        }}
      />
      <Stack.Screen 
        name="onboarding" 
        options={{ 
          headerShown: false,
          animation: 'fade',
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [isFirstTime] = useIsFirstTime();
  const { isAvailable, hasRequestedAuthorization } = useHealthKit();

  // Wait for HealthKit to be ready
  if (isAvailable === null || hasRequestedAuthorization === null) {
    return null; // keep splash visible
  }

  return (
    <Providers>
      {getAppContent({
        isFirstTime,
        _isAvailable: isAvailable,
        _hasRequestedAuthorization: hasRequestedAuthorization,
      })}
      {/* Development mode indicator for E2E testing */}
      {__DEV__ && (
        <View
          testID="dev-mode-indicator"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            backgroundColor: 'red',
            padding: 4,
            zIndex: 9999,
          }}
        >
          <Text style={{ color: 'white', fontSize: 10 }}>DEV MODE</Text>
        </View>
      )}
    </Providers>
  );
}

function Providers({ children }: { children: React.ReactNode }) {
  const theme = useThemeConfig();
  return (
    <GestureHandlerRootView
      style={styles.container}
      className={theme.dark ? `dark` : undefined}
    >
      <KeyboardProvider>
        <ThemeProvider value={theme}>
          <APIProvider>
            <BottomSheetModalProvider>
              {children}
              <FlashMessage position="top" />
            </BottomSheetModalProvider>
          </APIProvider>
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
