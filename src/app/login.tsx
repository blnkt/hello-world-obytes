import React, { useState } from 'react';
import { Alert } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import { Button, FocusAwareStatusBar, Text, View } from '@/components/ui';
import { getTodayStepCount, useHealthKit } from '@/lib';

export default function Login() {
  const [stepCount, setStepCount] = useState<number | null>(null);
  const { isAvailable, hasRequestedAuthorization } = useHealthKit();

  const pressHandler = async () => {
    if (isAvailable && hasRequestedAuthorization) {
      const quantity = await getTodayStepCount();
      setStepCount(quantity);
      console.log(quantity);
    } else {
      Alert.alert(
        'Where Steps?',
        'There was a problem retrieving your steps. To fix, please enable access to Health.'
      );
    }
  };

  return (
    <>
      <FocusAwareStatusBar />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={10}
      >
        <View className="flex-1 justify-center p-4">
          <View className="items-center justify-center">
            <Button
              fullWidth
              variant="outline"
              label="Grant this App access to Health"
              onPress={pressHandler}
            />
            <Text>{stepCount}</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}
