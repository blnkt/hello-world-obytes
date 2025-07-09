import { useCallback, useEffect, useState } from 'react';

import type { ScenarioHistory } from '../../types/scenario';
import { addScenarioToHistory, getScenarioHistory } from '../storage';

const createHistoryEntry = (
  scenario: any,
  milestone: number,
  outcome?: string
): ScenarioHistory => ({
  id: `${scenario.id}_${Date.now()}`,
  scenarioId: scenario.id,
  type: scenario.type,
  title: scenario.title,
  description: scenario.description,
  reward: scenario.reward,
  visitedAt: new Date().toISOString(),
  milestone,
  outcome,
});

export const useScenarioHistory = () => {
  const [history, setHistory] = useState<ScenarioHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load history from storage on mount
  useEffect(() => {
    const loadHistory = () => {
      try {
        const storedHistory = getScenarioHistory();
        setHistory(storedHistory);
      } catch (error) {
        console.error('Error loading scenario history:', error);
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  // Add a scenario to history
  const addToHistory = useCallback(
    async (scenario: any, milestone: number, outcome?: string) => {
      const historyEntry = createHistoryEntry(scenario, milestone, outcome);

      try {
        await addScenarioToHistory(historyEntry);
        setHistory((prev) => [historyEntry, ...prev]);
      } catch (error) {
        console.error('Error adding scenario to history:', error);
      }
    },
    []
  );

  // Get scenarios by type
  const getScenariosByType = useCallback(
    (type: 'merchant' | 'monster') => {
      return history.filter((entry) => entry.type === type);
    },
    [history]
  );

  // Get scenarios by milestone
  const getScenariosByMilestone = useCallback(
    (milestone: number) => {
      return history.filter((entry) => entry.milestone === milestone);
    },
    [history]
  );

  // Get recent scenarios (last N entries)
  const getRecentScenarios = useCallback(
    (count: number = 10) => {
      return history.slice(0, count);
    },
    [history]
  );

  return {
    history,
    isLoading,
    addToHistory,
    getScenariosByType,
    getScenariosByMilestone,
    getRecentScenarios,
  };
};
