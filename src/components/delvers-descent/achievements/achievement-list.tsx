import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { type AchievementDefinition } from '@/lib/delvers-descent/achievement-types';

import { AchievementCard } from './achievement-card';

interface AchievementListProps {
  achievements: AchievementDefinition[];
  category?: string;
}

export function AchievementList({
  achievements,
  category,
}: AchievementListProps) {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const progress = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  return (
    <View className="flex-1">
      <View className="border-b border-gray-200 bg-gray-100 p-4">
        <Text className="text-xl font-bold text-gray-900">
          {category || 'Achievements'}
        </Text>
        <View className="mt-2 flex-row items-center justify-between">
          <Text className="text-sm text-gray-600">
            {unlockedCount} of {totalCount} unlocked
          </Text>
          <Text className="text-sm font-semibold text-blue-600">
            {Math.round(progress)}%
          </Text>
        </View>
        <View className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
          <View
            className="h-full bg-blue-500"
            style={{ width: `${progress}%` }}
          />
        </View>
      </View>

      <ScrollView className="flex-1">
        <View className="space-y-3 p-4">
          {achievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
