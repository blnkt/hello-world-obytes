import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface ProgressionNavigationProps {
  currentScreen: 'collections' | 'achievements' | 'run-history';
}

export const ProgressionNavigation: React.FC<ProgressionNavigationProps> = ({
  currentScreen,
}) => {
  const router = useRouter();

  const screens = [
    { id: 'collections', label: 'Collections', path: '/(app)/collections' },
    {
      id: 'achievements',
      label: 'Achievements',
      path: '/(app)/achievements',
    },
    {
      id: 'run-history',
      label: 'Run History',
      path: '/(app)/run-history',
    },
  ] as const;

  return (
    <View className="border-b border-gray-200 bg-white p-4">
      <Text className="mb-3 text-sm font-semibold text-gray-700">
        Progression
      </Text>
      <View className="flex-row gap-2">
        {screens.map((screen) => {
          const isActive = screen.id === currentScreen;
          return (
            <Pressable
              key={screen.id}
              onPress={() => {
                if (!isActive) {
                  router.push(screen.path as any);
                }
              }}
              className={`rounded-lg border px-4 py-2 ${
                isActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-white'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  isActive ? 'text-blue-700' : 'text-gray-600'
                }`}
              >
                {screen.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
