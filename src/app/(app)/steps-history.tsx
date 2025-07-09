import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useMMKVString } from 'react-native-mmkv';

import { MerchantIcon, MonsterIcon } from '../../components/ui/icons';
import { useStepCountAsExperience } from '../../lib/health';
import { useScenarioHistory } from '../../lib/hooks/use-scenario-history';

const StepHistoryItem: React.FC<{
  entry: { date: Date; steps: number };
}> = ({ entry }) => (
  <View className="mb-4 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
    <Text className="text-lg font-semibold text-gray-900 dark:text-white">
      {new Date(entry.date).toLocaleDateString()}
    </Text>
    <View className="mt-2 h-4 rounded-full bg-blue-100 dark:bg-blue-900">
      <View
        className="h-full rounded-full bg-blue-500"
        style={{
          width: `${Math.min((entry.steps / 10000) * 100, 100)}%`,
        }}
      />
    </View>
    <Text className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400">
      {entry.steps.toLocaleString()} steps
    </Text>
  </View>
);

const ScenarioHistoryItem: React.FC<{
  entry: any;
}> = ({ entry }) => (
  <View className="mb-4 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
    <View className="mb-2 flex-row items-center justify-between">
      <Text className="text-lg font-semibold text-gray-900 dark:text-white">
        {entry.title}
      </Text>
      <View
        className={`rounded-full px-2 py-1 ${
          entry.type === 'merchant'
            ? 'bg-green-100 dark:bg-green-900'
            : 'bg-red-100 dark:bg-red-900'
        }`}
      >
        <Text
          className={`text-xs font-medium ${
            entry.type === 'merchant'
              ? 'text-green-800 dark:text-green-200'
              : 'text-red-800 dark:text-red-200'
          }`}
        >
          {entry.type}
        </Text>
      </View>
    </View>

    <Text className="mb-2 text-sm text-gray-600 dark:text-gray-300">
      {entry.description}
    </Text>

    <Text className="mb-2 text-sm font-medium text-blue-600 dark:text-blue-400">
      Reward: {entry.reward}
    </Text>

    <View className="flex-row items-center justify-between">
      <Text className="text-xs text-gray-500 dark:text-gray-400">
        Milestone: {entry.milestone}
      </Text>
      <Text className="text-xs text-gray-500 dark:text-gray-400">
        {new Date(entry.visitedAt).toLocaleDateString()}
      </Text>
    </View>

    {entry.outcome && (
      <View className="mt-2 rounded bg-blue-50 p-2 dark:bg-blue-900/20">
        <Text className="text-xs text-blue-700 dark:text-blue-300">
          Outcome: {entry.outcome}
        </Text>
      </View>
    )}
  </View>
);

const TabButtons: React.FC<{
  activeTab: string;
  onTabChange: (tab: string) => void;
}> = ({ activeTab, onTabChange }) => (
  <View className="mb-4 flex-row space-x-2">
    {['steps', 'scenarios'].map((tab) => (
      <View
        key={tab}
        className={`rounded-full px-4 py-2 ${
          activeTab === tab ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <Text
          className={`text-sm font-medium ${
            activeTab === tab
              ? 'text-white'
              : 'text-gray-700 dark:text-gray-300'
          }`}
          onPress={() => onTabChange(tab)}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </Text>
      </View>
    ))}
  </View>
);

const ScenarioFilterButtons: React.FC<{
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}> = ({ activeFilter, onFilterChange }) => (
  <View className="mb-4 flex-row space-x-2">
    {['all', 'merchant', 'monster'].map((filter) => (
      <View
        key={filter}
        className={`rounded-full px-3 py-1 ${
          activeFilter === filter
            ? 'bg-green-500'
            : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <Text
          className={`text-xs font-medium ${
            activeFilter === filter
              ? 'text-white'
              : 'text-gray-700 dark:text-gray-300'
          }`}
          onPress={() => onFilterChange(filter)}
        >
          {filter.charAt(0).toUpperCase() + filter.slice(1)}
        </Text>
      </View>
    ))}
  </View>
);

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

// Alternative Scenario Visualizations
const ScenarioTimeline: React.FC<{
  history: any[];
}> = ({ history }) => (
  <View className="space-y-4">
    {history.map((entry, index) => (
      <View key={entry.id} className="flex-row">
        {/* Timeline line with icon */}
        <View className="mr-4 items-center">
          {entry.type === 'merchant' ? (
            <MerchantIcon color="#10B981" width={20} height={20} />
          ) : (
            <MonsterIcon color="#EF4444" width={20} height={20} />
          )}
          {index < history.length - 1 && (
            <View className="h-16 w-0.5 bg-gray-300 dark:bg-gray-600" />
          )}
        </View>

        {/* Content */}
        <View className="flex-1 rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-medium text-gray-900 dark:text-white">
              {entry.title}
            </Text>
            <View
              className={`rounded-full px-2 py-1 ${
                entry.type === 'merchant'
                  ? 'bg-green-100 dark:bg-green-900'
                  : 'bg-red-100 dark:bg-red-900'
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  entry.type === 'merchant'
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-red-800 dark:text-red-200'
                }`}
              >
                {entry.type}
              </Text>
            </View>
          </View>
          <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {new Date(entry.visitedAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    ))}
  </View>
);

const ScenarioGrid: React.FC<{
  history: any[];
}> = ({ history }) => (
  <View className="flex-row flex-wrap justify-between">
    {history.map((entry) => (
      <View
        key={entry.id}
        className="mb-3 w-[48%] rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800"
      >
        <View className="mb-2 items-center">
          {entry.type === 'merchant' ? (
            <MerchantIcon color="#10B981" width={32} height={32} />
          ) : (
            <MonsterIcon color="#EF4444" width={32} height={32} />
          )}
        </View>
        <Text className="text-center text-xs font-medium text-gray-900 dark:text-white">
          {entry.title}
        </Text>
        <Text className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
          {new Date(entry.visitedAt).toLocaleDateString()}
        </Text>
      </View>
    ))}
  </View>
);

const ScenarioStats: React.FC<{
  history: any[];
}> = ({ history }) => {
  const merchantCount = history.filter((h) => h.type === 'merchant').length;
  const monsterCount = history.filter((h) => h.type === 'monster').length;
  const totalCount = history.length;

  return (
    <View className="space-y-4">
      {/* Summary Cards */}
      <View className="flex-row space-x-3">
        <View className="flex-1 rounded-lg bg-blue-100 p-3 dark:bg-blue-900">
          <Text className="text-center text-2xl font-bold text-blue-600 dark:text-blue-300">
            {totalCount}
          </Text>
          <Text className="text-center text-xs text-blue-600 dark:text-blue-300">
            Total
          </Text>
        </View>
        <View className="flex-1 rounded-lg bg-green-100 p-3 dark:bg-green-900">
          <Text className="text-center text-2xl font-bold text-green-600 dark:text-green-300">
            {merchantCount}
          </Text>
          <Text className="text-center text-xs text-green-600 dark:text-green-300">
            Merchants
          </Text>
        </View>
        <View className="flex-1 rounded-lg bg-red-100 p-3 dark:bg-red-900">
          <Text className="text-center text-2xl font-bold text-red-600 dark:text-red-300">
            {monsterCount}
          </Text>
          <Text className="text-center text-xs text-red-600 dark:text-red-300">
            Monsters
          </Text>
        </View>
      </View>

      {/* Recent Activity */}
      <View className="rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800">
        <Text className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Recent Activity
        </Text>
        {history.slice(0, 3).map((entry) => (
          <View key={entry.id} className="mb-2 flex-row items-center">
            {entry.type === 'merchant' ? (
              <MerchantIcon color="#10B981" width={16} height={16} />
            ) : (
              <MonsterIcon color="#EF4444" width={16} height={16} />
            )}
            <Text className="ml-2 flex-1 text-xs text-gray-600 dark:text-gray-300">
              {entry.title}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(entry.visitedAt).toLocaleDateString()}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const VisualizationSelector: React.FC<{
  activeView: string;
  onViewChange: (view: string) => void;
}> = ({ activeView, onViewChange }) => (
  <View className="mb-4 flex-row space-x-2">
    {[
      { key: 'cards', label: 'Cards' },
      { key: 'timeline', label: 'Timeline' },
      { key: 'grid', label: 'Grid' },
      { key: 'stats', label: 'Stats' },
    ].map((view) => (
      <View
        key={view.key}
        className={`rounded-full px-3 py-1 ${
          activeView === view.key
            ? 'bg-purple-500'
            : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <Text
          className={`text-xs font-medium ${
            activeView === view.key
              ? 'text-white'
              : 'text-gray-700 dark:text-gray-300'
          }`}
          onPress={() => onViewChange(view.key)}
        >
          {view.label}
        </Text>
      </View>
    ))}
  </View>
);

export default function HistoryScreen() {
  const { history, isLoading, getScenariosByType } = useScenarioHistory();
  const [activeTab, setActiveTab] = useState('steps');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeView, setActiveView] = useState('cards'); // New state for visualization

  // Step history data
  const [lastCheckedDate] = useMMKVString('lastCheckedDate');
  const lastCheckedDateTime = lastCheckedDate
    ? new Date(lastCheckedDate)
    : (() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
      })();
  const { stepsByDay } = useStepCountAsExperience(lastCheckedDateTime);

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
