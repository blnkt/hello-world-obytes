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
