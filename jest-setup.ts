import '@testing-library/react-native/extend-expect';

// react-hook form setup for testing
// @ts-ignore
global.window = {};
// @ts-ignore
global.window = global;

// Mock HealthKit to prevent NativeEventEmitter errors in tests
jest.mock('@kingstinct/react-native-healthkit', () => ({
  default: {
    HKQuantityTypeIdentifier: {
      stepCount: 'HKQuantityTypeIdentifierStepCount',
    },
    HKStatisticsOptions: {
      cumulativeSum: 'cumulativeSum',
    },
    HKUnits: {
      count: 'count',
    },
    requestAuthorization: jest.fn(),
    getStatistics: jest.fn(),
    getQuantitySamples: jest.fn(),
  },
  useHealthkitAuthorization: jest.fn(() => ({
    isAvailable: true,
    hasRequestedAuthorization: true,
  })),
}));
