import React from 'react';
import { Alert } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import { Button, FocusAwareStatusBar, Text, View } from '@/components/ui';
import { getTodayStepCount, useAuth, useHealthKit } from '@/lib';
import { getItem, setItem } from '@/lib/storage';

export default function Login() {
  const signIn = useAuth.use.signIn();
  const { isAvailable, hasRequestedAuthorization } = useHealthKit();

  const pressHandler = async () => {
    if (isAvailable && hasRequestedAuthorization) {
      const quantity = await getTodayStepCount();
      setItem('stepCount', quantity);
      signIn({ access: 'healthkit', refresh: 'healthkit' });
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
              label="Grant this App access to Health data"
              onPress={pressHandler}
            />
            <Text>{getItem('stepCount')}</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}
