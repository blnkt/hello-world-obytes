import React from 'react';
import { Text, View } from 'react-native';

type ScenarioHeaderProps = {
  milestoneNumber: number;
};

export const ScenarioHeader: React.FC<ScenarioHeaderProps> = ({
  milestoneNumber,
}) => (
  <View className="mb-8 items-center">
    <View className="mb-4 size-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
      <Text className="text-2xl font-bold text-white">⚔️</Text>
    </View>
    <Text className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
      Adventure Awaits!
    </Text>
    <Text className="text-center text-gray-600 dark:text-gray-300">
      You've reached {milestoneNumber.toLocaleString()} steps!{'\n'}
      Choose your encounter wisely...
    </Text>
  </View>
);
