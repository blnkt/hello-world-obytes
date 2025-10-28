/**
 * Reward Animation Display
 * UI component for displaying reward collection animations
 */

import { Text, View } from 'react-native';

import type { RewardAnimationData } from '@/lib/delvers-descent/reward-collection-feedback';

interface RewardAnimationDisplayProps {
  animation: RewardAnimationData;
  delay?: number;
}

export function RewardAnimationDisplay({
  animation,
  delay = 0,
}: RewardAnimationDisplayProps) {
  return (
    <View className="animate-bounce rounded-lg bg-gray-100 p-4">
      <Text className="text-center text-2xl">{animation.icon}</Text>
      <Text
        className="text-center text-lg font-semibold"
        style={{ color: animation.color }}
      >
        Reward Collected!
      </Text>
    </View>
  );
}
