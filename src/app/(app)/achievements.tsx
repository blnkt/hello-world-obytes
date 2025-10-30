import { Stack } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { AchievementList } from '@/components/delvers-descent/achievements/achievement-list';
import { ProgressionNavigation } from '@/components/delvers-descent/progression/progression-navigation';
import { AchievementManager } from '@/lib/delvers-descent/achievement-manager';
import type { AchievementState } from '@/lib/delvers-descent/achievement-models';
import { ALL_ACHIEVEMENTS } from '@/lib/delvers-descent/achievement-types';

function AchievementsHeader({
  unlockedCount,
  totalCount,
  progress,
}: {
  unlockedCount: number;
  totalCount: number;
  progress: number;
}) {
  return (
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
  );
}

function toDefinitions(
  category: string,
  categoryAchievements: AchievementState[]
) {
  return categoryAchievements.map((state) => {
    const originalDef = ALL_ACHIEVEMENTS.find((a) => a.id === state.id);
    if (originalDef) {
      return { ...originalDef, unlocked: state.unlocked };
    }
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
}

function AchievementCategorySection({
  category,
  categoryAchievements,
}: {
  category: string;
  categoryAchievements: AchievementState[];
}) {
  const defs = toDefinitions(category, categoryAchievements);
  const categoryName = category
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  return (
    <View key={category} className="mb-6">
      <AchievementList achievements={defs} category={categoryName} />
    </View>
  );
}

export default function AchievementsScreen() {
  const {
    loading,
    achievementsByCategory,
    unlockedCount,
    totalCount,
    progress,
  } = useAchievementsData();

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
      <AchievementsContent
        unlockedCount={unlockedCount}
        totalCount={totalCount}
        progress={progress}
        achievementsByCategory={achievementsByCategory}
      />
    </>
  );
}

function useAchievementsData() {
  const [achievements, setAchievements] = useState<AchievementState[]>([]);
  const [loading, setLoading] = useState(true);

  const achievementManager = useMemo(
    () => new AchievementManager(ALL_ACHIEVEMENTS),
    []
  );

  useEffect(() => {
    const loadAchievementData = async () => {
      setLoading(true);
      try {
        await achievementManager.loadSavedState();
        const achievementStates = achievementManager.getAchievements();
        setAchievements(achievementStates);
      } catch (error) {
        console.error('Failed to load achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAchievementData();
  }, [achievementManager]);

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

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const progress = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  return {
    loading,
    achievementsByCategory,
    unlockedCount,
    totalCount,
    progress,
  };
}

function AchievementsContent({
  unlockedCount,
  totalCount,
  progress,
  achievementsByCategory,
}: {
  unlockedCount: number;
  totalCount: number;
  progress: number;
  achievementsByCategory: Record<string, AchievementState[]>;
}) {
  return (
    <View className="flex-1 bg-gray-50">
      <ProgressionNavigation currentScreen="achievements" />
      <AchievementsHeader
        unlockedCount={unlockedCount}
        totalCount={totalCount}
        progress={progress}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {Object.entries(achievementsByCategory).map(
          ([category, categoryAchievements]) => (
            <AchievementCategorySection
              key={category}
              category={category}
              categoryAchievements={categoryAchievements}
            />
          )
        )}
      </ScrollView>
    </View>
  );
}
