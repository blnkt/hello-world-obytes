import React from 'react';
import { useMMKVString } from 'react-native-mmkv';

import { Button, Text, View } from '@/components/ui';

export default function Shop() {
  const cost = 100;
  const [steps, setSteps] = useMMKVString('stepCount');

  const pressHandler = async () => {
    setSteps(steps);
  };

  return (
    <View className="flex-1 ">
      <Text>Shop</Text>
      <Text>{}</Text>
      <Button
        fullWidth
        variant="outline"
        label="Continue the crawl"
        onPress={pressHandler}
      />
    </View>
  );
}
