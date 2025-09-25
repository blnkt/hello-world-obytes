import { useMMKVBoolean } from 'react-native-mmkv';

import { storage } from '../storage';

const IS_FIRST_TIME = 'IS_FIRST_TIME';

export const useIsFirstTime = (): [boolean, (value: boolean) => void] => {
  const [isFirstTime, setIsFirstTime] = useMMKVBoolean(IS_FIRST_TIME, storage);

  // If the value is undefined, it means the key doesn't exist in storage
  // This should be treated as first time (true)
  if (isFirstTime === undefined) {
    return [true, setIsFirstTime] as const;
  }

  return [isFirstTime, setIsFirstTime] as const;
};
