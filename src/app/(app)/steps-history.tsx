import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import {
  ScenarioFilterButtons,
  ScenarioGrid,
  ScenarioHistoryItem,
  ScenarioStats,
  ScenarioTimeline,
  StepHistoryItem,
  TabButtons,
  VisualizationSelector,
} from '../../components/history';
import { useExperienceData } from '../../lib/health';
import { useScenarioHistory } from '../../lib/hooks/use-scenario-history';
import { useLastCheckedDate } from '../../lib/storage';

const StepsTab: React.FC<{ stepsByDay: { date: Date; steps: number }[] }> = ({
  stepsByDay,
}) => (
  <View>
    <Text className="mb-4 text-sm text-gray-600 dark:text-gray-400">
      Step History
    </Text>
    {stepsByDay.length === 0 ? (
      <View className="flex-1 items-center justify-center py-8">
        <Text className="text-center text-gray-500 dark:text-gray-400">
          No step data available.
        </Text>
      </View>
    ) : (
      stepsByDay.map((entry, idx) => (
        <StepHistoryItem key={String(entry.date) + idx} entry={entry} />
      ))
    )}
  </View>
);

const ScenariosContent: React.FC<{
  history: any[];
  activeFilter: string;
  activeView: string;
  getScenariosByType: (type: 'merchant' | 'monster') => any[];
}> = ({ history, activeFilter, activeView, getScenariosByType }) => {
  const filteredHistory =
    activeFilter === 'all'
      ? history
      : getScenariosByType(activeFilter as 'merchant' | 'monster');

  if (filteredHistory.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-8">
        <Text className="text-center text-gray-500 dark:text-gray-400">
          {activeFilter === 'all'
            ? 'No scenarios visited yet.'
            : `No ${activeFilter} scenarios visited yet.`}
        </Text>
      </View>
    );
  }

  return (
    <>
      {activeView === 'cards' && (
        <View>
          <Text className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            {filteredHistory.length} scenario
            {filteredHistory.length !== 1 ? 's' : ''} visited
          </Text>
          {filteredHistory.map((entry) => (
            <ScenarioHistoryItem key={entry.id} entry={entry} />
          ))}
        </View>
      )}
      {activeView === 'timeline' && (
        <ScenarioTimeline history={filteredHistory} />
      )}
      {activeView === 'grid' && <ScenarioGrid history={filteredHistory} />}
      {activeView === 'stats' && <ScenarioStats history={filteredHistory} />}
    </>
  );
};

export default function HistoryScreen() {
  const { history, isLoading, getScenariosByType } = useScenarioHistory();
  const [activeTab, setActiveTab] = useState('steps');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeView, setActiveView] = useState('cards'); // New state for visualization

  // Use reactive hook for last checked date
  const [lastCheckedDate] = useLastCheckedDate();

  // Step history data
  const lastCheckedDateTime = lastCheckedDate
    ? new Date(lastCheckedDate)
    : (() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
      })();
  const { stepsByDay } = useExperienceData();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Text className="text-lg text-gray-600 dark:text-gray-400">
          Loading history...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1 p-4">
        <Text className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
          History
        </Text>

        <TabButtons activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'steps' ? (
          <StepsTab stepsByDay={stepsByDay} />
        ) : (
          <View>
            <VisualizationSelector
              activeView={activeView}
              onViewChange={setActiveView}
            />
            <ScenarioFilterButtons
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
            <ScenariosContent
              history={history}
              activeFilter={activeFilter}
              activeView={activeView}
              getScenariosByType={getScenariosByType}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
