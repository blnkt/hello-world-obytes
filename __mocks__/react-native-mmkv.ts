// Manual mock for react-native-mmkv
// Note: 'jest' is expected to be in the global scope when running tests with Jest.

interface MMKVInstance {
  getString: (key: string) => string | null;
  set: (key: string, value: string) => void;
  delete: (key: string) => void;
  clear: () => void;
}

interface MMKVConstructor {
  new (): MMKVInstance;
  (): MMKVInstance;
}

const store: Record<string, string> = {};

// eslint-disable-next-line no-undef
export const MMKV: MMKVConstructor = jest.fn(() => ({
  getString: (key: string): string | null => {
    const value = store[key] || null;
    console.log(`[MMKV Mock] getString(${key}) = ${value}`);
    return value;
  },
  set: (key: string, value: string): void => {
    console.log(`[MMKV Mock] set(${key}, ${value})`);
    store[key] = value;
  },
  delete: (key: string): void => {
    console.log(`[MMKV Mock] delete(${key})`);
    delete store[key];
  },
  clear: (): void => {
    console.log(
      `[MMKV Mock] clear() - clearing ${Object.keys(store).length} keys`
    );
    Object.keys(store).forEach((k) => delete store[k]);
  },
})) as MMKVConstructor;

// Add a flushPromises utility for tests
export const flushPromises = () =>
  new Promise((resolve) => setImmediate(resolve));
