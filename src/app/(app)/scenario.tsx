import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Animated, Text, View } from 'react-native';

import { ScenarioCard } from '../../components/scenario-card';
import { ScenarioHeader } from '../../components/scenario-header';
import { ScenarioOutcome } from '../../components/scenario-outcome';
import { generateRandomScenarios } from '../../lib/scenario';
import type { Scenario } from '../../types/scenario';

const useScenarioAnimations = () => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return { fadeAnim, slideAnim };
};

const ScenarioFooter: React.FC = () => (
  <View className="mt-8 items-center">
    <Text className="text-center text-sm text-gray-500 dark:text-gray-400">
      Your choice will affect your character's journey!
    </Text>
  </View>
);

export default function ScenarioScreen() {
  const router = useRouter();
  const { milestone } = useLocalSearchParams();
  const milestoneNumber = Number(milestone) || 5000;
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [showOutcome, setShowOutcome] = useState(false);
  const [selectedScenarioData, setSelectedScenarioData] =
    useState<Scenario | null>(null);
  const { fadeAnim, slideAnim } = useScenarioAnimations();

  const scenarios = useMemo(
    () => generateRandomScenarios(milestoneNumber),
    [milestoneNumber]
  );

  const handleScenarioSelect = (scenarioId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (scenario) {
      setSelectedScenario(scenarioId);
      setSelectedScenarioData(scenario);
      setShowOutcome(true);
    }
  };

  const handleOutcomeClose = () => {
    setShowOutcome(false);
    setSelectedScenario(null);
    setSelectedScenarioData(null);
    router.back();
  };

  return (
    <View className="flex-1 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-red-900">
      <Animated.View
        className="flex-1 items-center justify-center p-6"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <ScenarioHeader milestoneNumber={milestoneNumber} />

        <View className="w-full space-y-4">
          {scenarios.map((scenario, index) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              index={index}
              isSelected={selectedScenario === scenario.id}
              onSelect={handleScenarioSelect}
              slideAnim={slideAnim}
            />
          ))}
        </View>

        <ScenarioFooter />
      </Animated.View>

      {selectedScenarioData && (
        <ScenarioOutcome
          scenario={selectedScenarioData}
          onClose={handleOutcomeClose}
          visible={showOutcome}
        />
      )}
    </View>
  );
}
