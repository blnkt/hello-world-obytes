import '@testing-library/react-native/extend-expect';

// react-hook form setup for testing
// @ts-ignore
global.window = {};
// @ts-ignore
global.window = global;

// Mock HealthKit to prevent NativeEventEmitter errors in tests
// jest.mock('@kingstinct/react-native-healthkit', () => ({
//   default: {
//     HKQuantityTypeIdentifier: {
//       stepCount: 'HKQuantityTypeIdentifierStepCount',
//     },
//     HKStatisticsOptions: {
//       cumulativeSum: 'cumulativeSum',
//     },
//     HKUnits: {
//       count: 'count',
//     },
//     // Add the methods needed for tests
//     isHealthDataAvailable: jest.fn().mockResolvedValue(true),
//     getRequestStatusForAuthorization: jest.fn().mockResolvedValue('granted'),
//     requestAuthorization: jest.fn().mockResolvedValue(true),
//     getStatistics: jest.fn(),
//     getQuantitySamples: jest.fn(),
//   },
//   useHealthkitAuthorization: jest.fn(() => ({
//     isAvailable: true,
//     hasRequestedAuthorization: true,
//   })),
// }));

// Ensure storage/MMKV mocks are reset between tests to avoid state bleed
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const {
    clearMMKVStore,
    mmkvMockStorage,
  } = require('./__mocks__/react-native-mmkv');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const storageMock = require('./__mocks__/storage.tsx');

  afterEach(() => {
    try {
      if (typeof clearMMKVStore === 'function') {
        clearMMKVStore();
      }
      if (mmkvMockStorage && typeof mmkvMockStorage === 'object') {
        Object.keys(mmkvMockStorage).forEach(
          (k: string) => delete mmkvMockStorage[k]
        );
      }
      if (
        storageMock &&
        storageMock.storage &&
        typeof storageMock.storage.clear === 'function'
      ) {
        storageMock.storage.clear();
      }
    } catch (_e) {
      // noop: test teardown should never throw
    }
  });
} catch {
  // If mocks are unavailable, skip teardown; individual tests will manage their state
}
