// Import  global CSS file
import '../../global.css';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import { StyleSheet } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { APIProvider } from '@/api';
import { hydrateAuth, loadSelectedTheme, useAuth, useHealthKit } from '@/lib';
import { useIsFirstTime } from '@/lib/hooks/use-is-first-time';
import { useThemeConfig } from '@/lib/use-theme-config';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(app)',
};

hydrateAuth();
loadSelectedTheme();
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

function getAppContent({
  status,
  isFirstTime,
  isAvailable,
  hasRequestedAuthorization,
}: {
  status: string;
  isFirstTime: boolean;
  isAvailable: boolean | null;
  hasRequestedAuthorization: boolean | null;
}) {
  // Show onboarding if it's the first time
  if (isFirstTime) {
    return (
      <Stack>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack>
    );
  }

  // If not first time, show main app
  return (
    <Stack>
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const status = useAuth.use.status();
  const [isFirstTime] = useIsFirstTime();
  // const signIn = useAuth.use.signIn();
  const { isAvailable, hasRequestedAuthorization } = useHealthKit();

  // Debug logging
  // Remove useEffect for signIn

  // Wait for all to be ready
  if (
    isAvailable === null ||
    hasRequestedAuthorization === null ||
    status === 'idle'
  ) {
    return null; // keep splash visible
  }

  return (
    <Providers>
      {getAppContent({
        status,
        isFirstTime,
        isAvailable,
        hasRequestedAuthorization,
      })}
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
