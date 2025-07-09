import React, { useEffect, useState } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';

import type { Scenario } from '../types/scenario';

type ScenarioOutcomeProps = {
  scenario: Scenario;
  onClose: () => void;
  visible: boolean;
};

const getOutcomeColor = (type: string) => {
  switch (type) {
    case 'merchant':
      return 'bg-purple-500';
    case 'monster':
      return 'bg-red-500';
    default:
      return 'bg-blue-500';
  }
};

const OutcomeContent: React.FC<{ scenario: Scenario }> = ({ scenario }) => (
  <View className="mb-4 items-center">
    <Text className="mb-2 text-3xl">🎉</Text>
    <Text className="mb-2 text-xl font-bold text-white">
      Scenario Complete!
    </Text>
    <Text className="text-center text-white opacity-90">{scenario.title}</Text>
  </View>
);

const OutcomeReward: React.FC<{ reward: string }> = ({ reward }) => (
  <View className="mb-4 rounded-lg bg-white/20 p-4">
    <Text className="text-center font-medium text-white">{reward}</Text>
  </View>
);

const OutcomeButton: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <TouchableOpacity
    className="rounded-lg bg-white/20 px-6 py-3"
    onPress={onClose}
  >
    <Text className="text-center font-semibold text-white">
      Continue Journey
    </Text>
  </TouchableOpacity>
);

export const ScenarioOutcome: React.FC<ScenarioOutcomeProps> = ({
  scenario,
  onClose,
  visible,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim]);

  if (!visible) return null;

  return (
    <Animated.View
      className="absolute inset-0 items-center justify-center bg-black/50"
      style={{ opacity: fadeAnim }}
    >
      <Animated.View
        className={`mx-6 rounded-2xl p-6 ${getOutcomeColor(scenario.type)}`}
        style={{
          transform: [{ scale: scaleAnim }],
        }}
      >
        <OutcomeContent scenario={scenario} />
        <OutcomeReward reward={scenario.reward} />
        <OutcomeButton onClose={onClose} />
      </Animated.View>
    </Animated.View>
  );
};
