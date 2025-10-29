import { Stack } from 'expo-router';
import React, { useMemo, useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { AchievementList } from '@/components/delvers-descent/achievements/achievement-list';
import { ProgressionNavigation } from '@/components/delvers-descent/progression/progression-navigation';
import { AchievementManager } from '@/lib/delvers-descent/achievement-manager';
import { ALL_ACHIEVEMENTS } from '@/lib/delvers-descent/achievement-types';
import type { AchievementState } from '@/lib/delvers-descent/achievement-models';
import type { AchievementDefinition } from '@/lib/delvers-descent/achievement-types';

export default function AchievementsScreen() {
  const [achievements, setAchievements] = useState<AchievementState[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize AchievementManager
  const achievementManager = useMemo(
    () => new AchievementManager(ALL_ACHIEVEMENTS),
    []
  );

  useEffect(() => {
    const loadAchievements = async () => {
      setLoading(true);
      try {
        const achievementStates = achievementManager.getAchievements();
        setAchievements(achievementStates);
      } catch (error) {
        console.error('Failed to load achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAchievements();
  }, [achievementManager]);

  // Organize achievements by category
  const achievementsByCategory = useMemo(() => {
    const categories: Record<string, AchievementState[]> = {};
    
    achievements.forEach((achievement) => {
      const category = achievement.category || 'other';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(achievement);
    });

    return categories;
  }, [achievements]);

  // Calculate overall progress
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const progress = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Achievements',
            headerShown: true,
          }}
        />
        <View className="flex-1 items-center justify-center bg-gray-50">
          <Text className="text-gray-600">Loading achievements...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Achievements',
          headerShown: true,
        }}
      />
      <View className="flex-1 bg-gray-50">
        <ProgressionNavigation currentScreen="achievements" />
        {/* Overall Progress Header */}
        <View className="border-b border-gray-200 bg-white p-4">
          <Text className="mb-2 text-2xl font-bold text-gray-900">
            Achievements
          </Text>
          <View className="flex-row items-center justify-between">
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

        {/* Achievement Lists by Category */}
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {Object.entries(achievementsByCategory).map(([category, categoryAchievements]) => {
            // Convert AchievementState[] to AchievementDefinition[] for AchievementList
            // Get the original definitions from ALL_ACHIEVEMENTS and update unlocked status
            const achievementDefinitions = categoryAchievements.map((state) => {
              const originalDef = ALL_ACHIEVEMENTS.find((a) => a.id === state.id);
              if (originalDef) {
                return {
                  ...originalDef,
                  unlocked: state.unlocked,
                };
              }
              // Fallback if definition not found
              return {
                id: state.id,
                category: state.category || category,
                title: state.title,
                description: state.description,
                rarity: state.rarity,
                requirements: state.requirements,
                unlocked: state.unlocked,
              };
            });

            const categoryName = category
              .split('_')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');

            return (
              <View key={category} className="mb-6">
                <AchievementList
                  achievements={achievementDefinitions}
                  category={categoryName}
                />
              </View>
            );
          })}
        </ScrollView>
      </View>
    </>
  );
}

