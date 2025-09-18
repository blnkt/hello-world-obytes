import React from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';

import colors from '@/components/ui/colors';

import type { Scenario } from '../types/scenario';
import { MerchantIcon, MonsterIcon } from './ui/icons';

type ScenarioCardProps = {
  scenario: Scenario;
  index: number;
  isSelected: boolean;
  onSelect: (scenarioId: string) => void;
  slideAnim: Animated.Value;
};

const getScenarioIcon = (type: string) => {
  switch (type) {
    case 'merchant':
      return (
        <MerchantIcon color={colors.primary[500]} style={{ marginRight: 12 }} />
      );
    case 'monster':
      return (
        <MonsterIcon color={colors.danger[600]} style={{ marginRight: 12 }} />
      );
    default:
      return null;
  }
};

const getScenarioColor = (type: string) => {
  switch (type) {
    case 'merchant':
      return {
        bg: 'bg-purple-50 dark:bg-purple-900',
        border: 'border-purple-200 dark:border-purple-700',
        text: 'text-purple-900 dark:text-purple-100',
        reward: 'text-purple-700 dark:text-purple-300',
      };
    case 'monster':
      return {
        bg: 'bg-red-50 dark:bg-red-900',
        border: 'border-red-200 dark:border-red-700',
        text: 'text-red-900 dark:text-red-100',
        reward: 'text-red-700 dark:text-red-300',
      };
    default:
      return {
        bg: 'bg-gray-50 dark:bg-gray-800',
        border: 'border-gray-200 dark:border-gray-700',
        text: 'text-gray-900 dark:text-white',
        reward: 'text-green-700 dark:text-green-300',
      };
  }
};

export const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  index,
  isSelected,
  onSelect,
  slideAnim,
}) => {
  const colors = getScenarioColor(scenario.type);

  return (
    <Animated.View
      style={{
        transform: [
          { scale: isSelected ? 1.05 : 1 },
          {
            translateX: slideAnim.interpolate({
              inputRange: [0, 50],
              outputRange: [0, (index + 1) * 20],
            }),
          },
        ],
      }}
    >
      <TouchableOpacity
        className={`w-full rounded-2xl border-2 p-6 ${colors.bg} ${colors.border} ${
          isSelected ? 'shadow-lg shadow-purple-500/50' : 'shadow-md'
        }`}
        onPress={() => onSelect(scenario.id)}
        activeOpacity={0.8}
      >
        <View className="mb-3 flex-row items-center">
          {getScenarioIcon(scenario.type)}
          <View className="flex-1">
            <Text className={`text-xl font-bold ${colors.text}`}>
              {scenario.title}
            </Text>
          </View>
          <View className="size-8 items-center justify-center rounded-full bg-white/20">
            <Text className="text-sm font-bold text-white">{index + 1}</Text>
          </View>
        </View>

        <Text className={`mb-3 text-base ${colors.text} opacity-80`}>
          {scenario.description}
        </Text>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Text className={`text-sm font-semibold ${colors.reward}`}>
              🎁 {scenario.reward}
            </Text>
          </View>
          <View className="size-6 items-center justify-center rounded-full bg-white/30">
            <Text className="text-xs font-bold text-white">→</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};
