import React from 'react';
import { useMMKVString } from 'react-native-mmkv';

import { Text, View } from '@/components/ui';

import { useScenarioTrigger } from '../../lib/use-scenario-trigger';

export default function Home() {
  const [steps] = useMMKVString('stepCount');
  const stepCount = Number(steps) || 0;
  useScenarioTrigger(stepCount);

  return (
    <View className="flex-1 ">
      <Text>{steps}</Text>
    </View>
  );
}
