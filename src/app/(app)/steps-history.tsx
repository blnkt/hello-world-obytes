import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useMMKVString } from 'react-native-mmkv';

import { useStepCountAsExperience } from '../../lib/health';

const StepHistoryList: React.FC<{
  stepsByDay: { date: Date; steps: number }[];
}> = ({ stepsByDay }) => (
  <>
    {stepsByDay.length === 0 ? (
      <Text style={{ color: '#6b7280' }}>No step data available.</Text>
    ) : (
      stepsByDay.map((entry, idx) => (
        <View
          key={String(entry.date) + idx}
          style={{
            marginBottom: 12,
            padding: 12,
            borderRadius: 8,
            backgroundColor: '#fff',
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          }}
        >
          <Text style={{ fontSize: 16, color: '#374151' }}>
            {new Date(entry.date).toLocaleDateString()}
          </Text>
          <View
            style={{
              height: 16,
              backgroundColor: '#e0e7ff',
              borderRadius: 4,
              marginTop: 6,
            }}
          >
            <View
              style={{
                width: `${Math.min(entry.steps / 200, 100)}%`,
                height: '100%',
                backgroundColor: '#6366f1',
                borderRadius: 4,
              }}
            />
          </View>
          <Text style={{ fontSize: 14, color: '#6366f1', marginTop: 4 }}>
            {entry.steps.toLocaleString()} steps
          </Text>
        </View>
      ))
    )}
  </>
);

const StepsHistoryScreen: React.FC = () => {
  const [lastCheckedDate] = useMMKVString('lastCheckedDate');
  const lastCheckedDateTime = lastCheckedDate
    ? new Date(lastCheckedDate)
    : (() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
      })();
  const { stepsByDay } = useStepCountAsExperience(lastCheckedDateTime);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f9fafb' }}
      contentContainerStyle={{ padding: 16 }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: 'bold',
          marginBottom: 16,
          color: '#4f46e5',
        }}
      >
        Step History
      </Text>
      <StepHistoryList stepsByDay={stepsByDay} />
    </ScrollView>
  );
};

export default StepsHistoryScreen;
