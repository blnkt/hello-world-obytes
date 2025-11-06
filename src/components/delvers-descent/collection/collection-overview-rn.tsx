import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/ui';
import {
  ALL_AVATAR_COLLECTION_SETS,
  getAvatarSetsByPartType,
} from '@/lib/delvers-descent/avatar-collection-sets';
import { type CollectionManager } from '@/lib/delvers-descent/collection-manager';
import { ALL_COLLECTION_SETS } from '@/lib/delvers-descent/collection-sets';
import type { AvatarCollectionSet } from '@/types/avatar';
import type {
  CollectionProgress,
  CollectionSet,
  CollectionStatistics,
} from '@/types/delvers-descent';

export interface CollectionOverviewRNProps {
  collectionManager: CollectionManager;
  onSetSelect?: (setId: string) => void;
}

const SetCard: React.FC<{
  set: CollectionSet;
  progress: number;
  isCompleted: boolean;
  onSelect?: () => void;
}> = ({ set, progress, isCompleted, onSelect }) => (
  <Pressable
    onPress={onSelect}
    testID={`set-card-${set.id}`}
    className={`mb-3 rounded-lg border-2 p-4 ${
      isCompleted ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'
    }`}
  >
    <View className="flex-row items-center justify-between">
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-800">{set.name}</Text>
        <Text className="mt-1 text-sm text-gray-600">{set.description}</Text>
        <View className="mt-2 flex-row items-center">
          <Text className="text-xs text-gray-500">
            Progress: {progress}/{set.items.length}
          </Text>
          {isCompleted && (
            <Text className="ml-2 text-xs font-semibold text-green-600">
              ✓ Complete
            </Text>
          )}
        </View>
      </View>
      <View className="ml-4 items-end">
        <Text
          className={`text-sm font-semibold ${
            isCompleted ? 'text-green-600' : 'text-gray-500'
          }`}
        >
          {Math.round((progress / set.items.length) * 100)}%
        </Text>
        <View
          className={`mt-1 h-2 w-16 overflow-hidden rounded-full ${
            isCompleted ? 'bg-green-500' : 'bg-gray-200'
          }`}
        >
          <View
            className={`h-full ${isCompleted ? 'bg-green-600' : 'bg-blue-500'}`}
            style={{
              width: `${Math.min(100, (progress / set.items.length) * 100)}%`,
            }}
          />
        </View>
      </View>
    </View>
  </Pressable>
);

const StatsSection: React.FC<{
  statistics: CollectionStatistics;
}> = ({ statistics }) => (
  <View className="mb-6 rounded-lg bg-gray-50 p-6">
    <Text className="mb-4 text-xl font-semibold text-gray-800">
      Collection Statistics
    </Text>
    <View className="flex-row flex-wrap">
      <View className="w-1/2 items-center p-2">
        <Text className="text-2xl font-bold text-blue-600">
          {statistics.totalItemsCollected}
        </Text>
        <Text className="text-sm text-gray-600">Items Collected</Text>
      </View>
      <View className="w-1/2 items-center p-2">
        <Text className="text-2xl font-bold text-green-600">
          {statistics.setsCompleted}
        </Text>
        <Text className="text-sm text-gray-600">Sets Completed</Text>
      </View>
      <View className="w-1/2 items-center p-2">
        <Text className="text-2xl font-bold text-purple-600">
          {Math.round(statistics.collectionCompletionRate * 100)}%
        </Text>
        <Text className="text-sm text-gray-600">Completion Rate</Text>
      </View>
      <View className="w-1/2 items-center p-2">
        <Text className="text-2xl font-bold text-orange-600">
          {statistics.totalRunsCompleted}
        </Text>
        <Text className="text-sm text-gray-600">Runs Completed</Text>
      </View>
    </View>
  </View>
);

const CategorySection: React.FC<{
  title: string;
  sets: CollectionSet[];
  progress: CollectionProgress;
  onSetSelect?: (setId: string) => void;
}> = ({ title, sets, progress, onSetSelect }) => {
  const categoryKey = title.toLowerCase().replace(' ', '_') as
    | 'trade_goods'
    | 'discoveries'
    | 'legendaries';
  const categoryStats = progress.byCategory[categoryKey];

  return (
    <View className="mb-8">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-gray-800">{title}</Text>
        <Text className="text-sm text-gray-600">
          {categoryStats.collected} / {categoryStats.total} collected
        </Text>
      </View>
      {sets.map((set) => {
        const setProgress = progress.partialSets.find(
          (p) => p.setId === set.id
        );
        const collected =
          setProgress?.collected ??
          (progress.completedSets.includes(set.id) ? set.items.length : 0);
        const isCompleted = progress.completedSets.includes(set.id);

        return (
          <SetCard
            key={set.id}
            set={set}
            progress={collected}
            isCompleted={isCompleted}
            onSelect={() => onSetSelect?.(set.id)}
          />
        );
      })}
    </View>
  );
};

const LoadingView: React.FC = () => (
  <View className="flex-1 items-center justify-center bg-gray-50 p-6">
    <Text className="text-gray-600">Loading collections...</Text>
  </View>
);

const getSetsByCategory = (category: string): CollectionSet[] =>
  ALL_COLLECTION_SETS.filter((s) => s.category === category && !isAvatarSet(s));

const isAvatarSet = (set: CollectionSet): boolean => {
  return (set as AvatarCollectionSet).avatarPartId !== undefined;
};

const renderAvatarSubsection = ({
  title,
  sets,
  progress,
  onSetSelect,
}: {
  title: string;
  sets: AvatarCollectionSet[];
  progress: CollectionProgress;
  onSetSelect?: (setId: string) => void;
}) => {
  if (sets.length === 0) return null;

  return (
    <View className="mb-6">
      <Text className="mb-3 text-lg font-semibold text-gray-700">{title}</Text>
      {sets.map((set) => {
        const setProgress = progress.partialSets.find(
          (p) => p.setId === set.id
        );
        const collected =
          setProgress?.collected ??
          (progress.completedSets.includes(set.id) ? set.items.length : 0);
        const isCompleted = progress.completedSets.includes(set.id);

        return (
          <View key={set.id}>
            <SetCard
              set={set}
              progress={collected}
              isCompleted={isCompleted}
              onSelect={() => onSetSelect?.(set.id)}
            />
            {isCompleted && set.avatarPartId && (
              <View className="mb-3 ml-4">
                <Text className="text-xs font-semibold text-purple-600">
                  ✓ Avatar Part Unlocked: {set.avatarPartId}
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

const AvatarSetsSection: React.FC<{
  progress: CollectionProgress;
  onSetSelect?: (setId: string) => void;
}> = ({ progress, onSetSelect }) => {
  const headSets = getAvatarSetsByPartType('head');
  const torsoSets = getAvatarSetsByPartType('torso');
  const legsSets = getAvatarSetsByPartType('legs');

  return (
    <View className="mb-8">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-gray-800">Avatar Unlocks</Text>
        <View className="flex-row items-center">
          <Text className="mr-4 text-sm text-gray-600">
            {
              progress.completedSets.filter((id) =>
                ALL_AVATAR_COLLECTION_SETS.some((set) => set.id === id)
              ).length
            }{' '}
            / {ALL_AVATAR_COLLECTION_SETS.length} unlocked
          </Text>
          <Link href="/(app)/avatar-customization" asChild>
            <Button label="Customize Avatar" variant="outline" />
          </Link>
        </View>
      </View>
      {renderAvatarSubsection({
        title: 'Heads',
        sets: headSets,
        progress,
        onSetSelect,
      })}
      {renderAvatarSubsection({
        title: 'Torsos',
        sets: torsoSets,
        progress,
        onSetSelect,
      })}
      {renderAvatarSubsection({
        title: 'Legs',
        sets: legsSets,
        progress,
        onSetSelect,
      })}
    </View>
  );
};

const CollectionContent: React.FC<{
  statistics: CollectionStatistics;
  progress: CollectionProgress;
  onSetSelect?: (setId: string) => void;
}> = ({ statistics, progress, onSetSelect }) => {
  const tradeGoodsSets = getSetsByCategory('trade_goods');
  const discoverySets = getSetsByCategory('discoveries');
  const legendarySets = getSetsByCategory('legendaries');

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
    >
      <View className="mb-8">
        <Text className="text-4xl font-bold text-gray-800">My Collection</Text>
        <Text className="mt-2 text-gray-600">
          Track your progress across all collection sets and unlock bonuses
        </Text>
      </View>

      <StatsSection statistics={statistics} />

      <CategorySection
        title="Trade Goods"
        sets={tradeGoodsSets}
        progress={progress}
        onSetSelect={onSetSelect}
      />

      <CategorySection
        title="Discoveries"
        sets={discoverySets}
        progress={progress}
        onSetSelect={onSetSelect}
      />

      <CategorySection
        title="Legendaries"
        sets={legendarySets}
        progress={progress}
        onSetSelect={onSetSelect}
      />

      <AvatarSetsSection progress={progress} onSetSelect={onSetSelect} />
    </ScrollView>
  );
};

export const CollectionOverviewRN: React.FC<CollectionOverviewRNProps> = ({
  collectionManager,
  onSetSelect,
}) => {
  const [progress, setProgress] = useState<CollectionProgress | null>(null);
  const [statistics, setStatistics] = useState<CollectionStatistics | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const prog = await collectionManager.getCollectionProgress();
        const stats = await collectionManager.getCollectionStatistics();
        setProgress(prog);
        setStatistics(stats);
      } catch (error) {
        console.error('Failed to load collection data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [collectionManager]);

  if (loading || !progress || !statistics) {
    return <LoadingView />;
  }

  return (
    <View testID="collection-overview" className="flex-1 bg-gray-50">
      <CollectionContent
        statistics={statistics}
        progress={progress}
        onSetSelect={onSetSelect}
      />
    </View>
  );
};
