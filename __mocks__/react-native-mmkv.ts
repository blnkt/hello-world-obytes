// Manual mock for react-native-mmkv
// Note: 'jest' is expected to be in the global scope when running tests with Jest.

interface MMKVInstance {
  getString: (key: string) => string | null;
  setString: (key: string, value: string) => void;
  set: (key: string, value: string) => void;
  delete: (key: string) => void;
  clearAll: () => void;
}

interface MMKVConstructor {
  new (): MMKVInstance;
  (): MMKVInstance;
}

// Global store that can be cleared between tests
let store: Record<string, string> = {};

// eslint-disable-next-line no-undef
export const MMKV: MMKVConstructor = jest.fn(() => ({
  getString: (key: string): string | null => {
    const value = store[key] || null;
    return value;
  },
  setString: (key: string, value: string): void => {
    store[key] = value;
  },
  set: (key: string, value: string): void => {
    store[key] = value;
  },
  delete: (key: string): void => {
    delete store[key];
  },
  clearAll: (): void => {
    store = {};
  },
})) as MMKVConstructor;

// Add a flushPromises utility for tests
export const flushPromises = () =>
  new Promise((resolve) => setImmediate(resolve));

// Add a clearStore utility for tests
export const clearMMKVStore = () => {
  store = {};
};

// Add a getStore utility for debugging
export const getMMKVStore = () => ({ ...store });
