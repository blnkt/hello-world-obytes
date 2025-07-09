import React, { useEffect, useState } from 'react';

import { Button, Text, View } from '@/components/ui';
import { getItem, setItem } from '@/lib/storage';

export default function Settings() {
  const [steps, setSteps] = useState(Number(getItem('stepCount')) || 0);

  const pressHandler = async () => {
    setSteps(steps + 10);
  };

  useEffect(() => {
    setItem('stepCount', steps);
  }, [steps]);

  return (
    <View className="flex-1 ">
      <Text>/n</Text>
      <Text>/n</Text>
      <Text>/n</Text>
      <Button
        fullWidth
        variant="outline"
        label="Update Step Count"
        onPress={pressHandler}
      />
      <Text>{steps}</Text>
    </View>
  );
}
