import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { useDelvingRuns } from '@/components/delvers-descent/hooks/use-delving-runs';
import { AchievementManager } from '@/lib/delvers-descent/achievement-manager';
import { ALL_ACHIEVEMENTS } from '@/lib/delvers-descent/achievement-types';
import { BonusManager } from '@/lib/delvers-descent/bonus-manager';
import { CollectionManager } from '@/lib/delvers-descent/collection-manager';
import { ALL_COLLECTION_SETS } from '@/lib/delvers-descent/collection-sets';

interface DelversDescentCardProps {
  onPress?: () => void;
  disabled?: boolean;
}

const StatItem: React.FC<{ label: string; value: string | number }> = ({
  label,
  value,
}) => (
  <View className="flex-1 items-center">
    <Text className="text-2xl font-bold text-white">{value}</Text>
    <Text className="mt-1 text-xs text-white/80">{label}</Text>
  </View>
);

export const DelversDescentCard: React.FC<DelversDescentCardProps> = ({
  onPress,
  disabled = false,
}) => {
  const { stats, loading } = useDescentStats();

  const handlePress = () => {
    if (onPress) onPress();
  };

  if (loading) return <CardLoading />;

  if (disabled || !onPress) {
    return <CardContent stats={stats} disabled />;
  }

  return <CardContent stats={stats} onPress={handlePress} />;
};

function useDescentStats() {
  const { getRunStatistics, getQueuedRuns } = useDelvingRuns();
  const [stats, setStats] = useState({
    queuedRuns: 0,
    completedRuns: 0,
    totalItems: 0,
    setsCompleted: 0,
    unlockedAchievements: 0,
    activeBonuses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const runStats = getRunStatistics();
        const queuedRuns = getQueuedRuns();
        const collectionManager = new CollectionManager(ALL_COLLECTION_SETS);
        const bonusManager = new BonusManager(collectionManager);
        const achievementManager = new AchievementManager(ALL_ACHIEVEMENTS);
        await achievementManager.loadSavedState();
        const collectionProgress =
          await collectionManager.getCollectionProgress();
        const collectionStats =
          await collectionManager.getCollectionStatistics();
        const bonusSummary = await bonusManager.getBonusSummary();
        const achievements = achievementManager.getAchievements();
        setStats({
          queuedRuns: queuedRuns.length,
          completedRuns: runStats.completedRuns,
          totalItems: collectionStats.totalItemsCollected,
          setsCompleted: collectionProgress.completedSets.length,
          unlockedAchievements: achievements.filter((a) => a.unlocked).length,
          activeBonuses: bonusSummary.activeBonuses.length,
        });
      } catch (error) {
        console.error("Failed to load Delver's Descent stats:", error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [getRunStatistics, getQueuedRuns]);

  return { stats, loading } as const;
}

function CardLoading() {
  return (
    <View className="mb-6 rounded-xl bg-red-600 p-6">
      <View className="items-center">
        <Text className="text-lg font-bold text-white">Loading...</Text>
      </View>
    </View>
  );
}

function CardHeader() {
  return (
    <View className="mb-4 flex-row items-center justify-between">
      <View>
        <Text className="text-2xl font-bold text-white">Delver's Descent</Text>
        <Text className="mt-1 text-sm text-white/90">
          Dungeon Exploration Game
        </Text>
      </View>
      <Text className="text-4xl">🗡️</Text>
    </View>
  );
}

function PrimaryStats({
  stats,
}: {
  stats: {
    queuedRuns: number;
    completedRuns: number;
    totalItems: number;
  };
}) {
  return (
    <View className="mt-4 flex-row justify-between border-t border-white/20 pt-4">
      <StatItem label="Queued" value={stats.queuedRuns} />
      <View className="mx-2 h-12 w-px bg-white/20" />
      <StatItem label="Completed" value={stats.completedRuns} />
      <View className="mx-2 h-12 w-px bg-white/20" />
      <StatItem label="Items" value={stats.totalItems} />
    </View>
  );
}

function SecondaryStats({
  stats,
}: {
  stats: {
    setsCompleted: number;
    unlockedAchievements: number;
    activeBonuses: number;
  };
}) {
  return (
    <View className="mt-4 flex-row justify-between border-t border-white/20 pt-4">
      <StatItem label="Sets" value={stats.setsCompleted} />
      <View className="mx-2 h-12 w-px bg-white/20" />
      <StatItem label="Achievements" value={stats.unlockedAchievements} />
      <View className="mx-2 h-12 w-px bg-white/20" />
      <StatItem label="Bonuses" value={stats.activeBonuses} />
    </View>
  );
}

function CardFooter() {
  return (
    <View className="mt-4 flex-row items-center justify-center rounded-lg bg-white/10 px-4 py-2">
      <Text className="text-sm font-semibold text-white">
        Tap to view runs →
      </Text>
    </View>
  );
}

function CardContent({
  stats,
  onPress,
  disabled,
}: {
  stats: {
    queuedRuns: number;
    completedRuns: number;
    totalItems: number;
    setsCompleted: number;
    unlockedAchievements: number;
    activeBonuses: number;
  };
  onPress?: () => void;
  disabled?: boolean;
}) {
  const Container: React.ElementType =
    onPress && !disabled ? TouchableOpacity : View;
  const containerProps =
    onPress && !disabled ? { onPress, activeOpacity: 0.8 } : {};
  const extraOpacityClass = disabled ? ' opacity-75' : '';
  return (
    <Container
      testID="delvers-descent-card"
      className={`mb-6 rounded-xl bg-red-600 p-6 shadow-lg${extraOpacityClass}`}
      {...containerProps}
    >
      <CardHeader />
      <PrimaryStats stats={stats} />
      <SecondaryStats stats={stats} />
      <CardFooter />
    </Container>
  );
}
