import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { type AchievementDefinition } from '@/lib/delvers-descent/achievement-types';
import { type AchievementReward } from '@/lib/delvers-descent/achievement-types';

interface AchievementCardProps {
  achievement: AchievementDefinition;
  onPress?: (achievement: AchievementDefinition) => void;
}

const RARITY_COLORS = {
  common: 'bg-gray-100',
  uncommon: 'bg-green-100',
  rare: 'bg-blue-100',
  epic: 'bg-purple-100',
  legendary: 'bg-yellow-100',
};

const RARITY_BORDER_COLORS = {
  common: 'border-gray-300',
  uncommon: 'border-green-300',
  rare: 'border-blue-300',
  epic: 'border-purple-300',
  legendary: 'border-yellow-300',
};

function AchievementHeader({
  title,
  rarity,
  isUnlocked,
}: {
  title: string;
  rarity: string;
  isUnlocked: boolean;
}) {
  return (
    <View className="mb-2 flex-row items-center justify-between">
      <Text
        className={`text-lg font-bold ${
          isUnlocked ? 'text-gray-900' : 'text-gray-400'
        }`}
      >
        {title}
      </Text>
      <Text
        className={`text-xs uppercase ${
          isUnlocked ? 'text-gray-600' : 'text-gray-400'
        }`}
      >
        {rarity}
      </Text>
    </View>
  );
}

function AchievementProgress({ progress }: { progress: AchievementProgress }) {
  return (
    <View className="mt-2">
      <View className="mb-1 flex-row items-center justify-between">
        <Text className="text-xs text-gray-600">Progress</Text>
        <Text className="text-xs text-gray-600">
          {progress.current} / {progress.target}
        </Text>
      </View>
      <View className="h-2 overflow-hidden rounded-full bg-gray-200">
        <View
          className="h-full bg-blue-500"
          style={{ width: `${progress.percentage}%` }}
        />
      </View>
    </View>
  );
}

function AchievementRewards({ rewards }: { rewards: AchievementReward[] }) {
  return (
    <View className="mt-3 border-t border-gray-300 pt-3">
      <Text className="mb-2 text-xs font-semibold text-gray-700">Rewards:</Text>
      {rewards.map((reward, idx) => (
        <Text key={idx} className="text-xs text-gray-600">
          • {reward.description}
        </Text>
      ))}
    </View>
  );
}

interface AchievementProgress {
  current: number;
  target: number;
  percentage: number;
}

export function AchievementCard({
  achievement,
  onPress,
}: AchievementCardProps) {
  const isUnlocked = achievement.unlocked;
  const progress = achievement.progress;

  const containerStyle = isUnlocked
    ? `${RARITY_COLORS[achievement.rarity]} ${RARITY_BORDER_COLORS[achievement.rarity]}`
    : 'bg-gray-50 border-gray-200';

  const content = (
    <View className={`rounded-lg border-2 p-4 ${containerStyle}`}>
      <AchievementHeader
        title={achievement.title}
        rarity={achievement.rarity}
        isUnlocked={isUnlocked}
      />
      <Text
        className={`mb-3 text-sm ${isUnlocked ? 'text-gray-700' : 'text-gray-400'}`}
      >
        {achievement.description}
      </Text>
      {progress && !isUnlocked && <AchievementProgress progress={progress} />}
      {isUnlocked && achievement.rewards && (
        <AchievementRewards rewards={achievement.rewards} />
      )}
      {isUnlocked && (
        <View className="absolute right-2 top-2">
          <Text className="text-2xl">✓</Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={() => onPress(achievement)}>{content}</Pressable>
    );
  }

  return content;
}
