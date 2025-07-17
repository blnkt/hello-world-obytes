/* eslint-disable no-undef */
console.log('MOCK HealthKit loaded');

module.exports = {
  isHealthDataAvailable: jest.fn().mockResolvedValue(true),
  getRequestStatusForAuthorization: jest.fn().mockResolvedValue('granted'),
  requestAuthorization: jest.fn().mockResolvedValue(true),
  stepCount: jest.fn().mockResolvedValue(1000),
  HKQuantityTypeIdentifier: {
    stepCount: 'HKQuantityTypeIdentifierStepCount',
  },
  HKStatisticsOptions: {
    cumulativeSum: 'cumulativeSum',
  },
  HKUnits: {
    count: 'count',
  },
  // Add any other methods you need for your tests below
};
module.exports.default = module.exports;
