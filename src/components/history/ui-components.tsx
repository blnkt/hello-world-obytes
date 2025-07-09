import React from 'react';
import { Text, View } from 'react-native';

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

export { ScenarioFilterButtons, TabButtons, VisualizationSelector };
