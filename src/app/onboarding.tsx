import { useRouter } from 'expo-router';
import React from 'react';
import { Alert } from 'react-native';

import { Cover } from '@/components/cover';
import {
  Button,
  FocusAwareStatusBar,
  SafeAreaView,
  Text,
  View,
} from '@/components/ui';
import { useHealthKit } from '@/lib/health';
import { useIsFirstTime } from '@/lib/hooks';

interface OnboardingActions {
  setIsFirstTime: (value: boolean) => void;
  router: any;
}

const handlePermissionRequest = async (
  isAvailable: boolean | null,
  hasRequestedAuthorization: boolean | null,
  actions: OnboardingActions
) => {
  const { setIsFirstTime, router } = actions;
  if (isAvailable && !hasRequestedAuthorization) {
    try {
      setTimeout(() => {
        if (hasRequestedAuthorization) {
          setIsFirstTime(false);
          router.replace('/(app)');
        } else {
          Alert.alert(
            'Permission Required',
            'To track your fitness progress, we need access to your Health data. Please grant permission to continue.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Grant Permission',
                onPress: () =>
                  handlePermissionRequest(
                    isAvailable,
                    hasRequestedAuthorization,
                    actions
                  ),
              },
            ]
          );
        }
      }, 1000);
    } catch (error) {
      console.error('Error requesting permission:', error);
      Alert.alert(
        'Permission Error',
        'There was an issue requesting Health permissions. Please try again.'
      );
    }
  } else if (hasRequestedAuthorization) {
    setIsFirstTime(false);
    router.replace('/(app)');
  } else {
    Alert.alert(
      'Health Not Available',
      'Health data is not available on this device. You can still use the app for character creation and tracking manually.'
    );
    setIsFirstTime(false);
    router.replace('/(app)');
  }
};

export default function Onboarding() {
  const [, setIsFirstTime] = useIsFirstTime();
  const router = useRouter();
  const { isAvailable, hasRequestedAuthorization } = useHealthKit();

  const handleGetStarted = () => {
    handlePermissionRequest(isAvailable, hasRequestedAuthorization, {
      setIsFirstTime,
      router,
    });
  };

  return (
    <View className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-red-900">
      <FocusAwareStatusBar />
      <View className="w-full flex-1">
        <Cover />
      </View>
      <View className="w-full justify-end px-4">
        <Text className="my-3 text-center text-5xl font-bold text-purple-700 dark:text-purple-200">
          DungeonWalk: Fitness RPG
        </Text>
        <Text className="mb-4 text-center text-lg italic text-gray-700 dark:text-gray-300">
          Level up your life, one step at a time!
        </Text>

        <Text className="my-2 text-left text-lg">
          🎲 Create your fitness character and choose your background/class
        </Text>
        <Text className="my-2 text-left text-lg">
          🏆 Earn XP and level up by walking in real life
        </Text>
        <Text className="my-2 text-left text-lg">
          ⚔️ Encounter random RPG scenarios as you hit step milestones
        </Text>
        <Text className="my-2 text-left text-lg">
          📈 Track your progress and attributes on your character sheet
        </Text>
        <Text className="my-2 text-left text-lg">
          🎉 Unlock new abilities and rewards as you move
        </Text>
        <Text className="mb-2 mt-6 text-center text-xl font-semibold text-green-700 dark:text-green-300">
          Start your fitness adventure now!
        </Text>

        <Text className="mb-4 text-center text-sm text-gray-600 dark:text-gray-400">
          We'll need access to your Health data to track your steps and progress
        </Text>
      </View>
      <SafeAreaView className="mt-6 w-full px-4">
        <Button label="Let's Get Started" onPress={handleGetStarted} />
      </SafeAreaView>
    </View>
  );
}
