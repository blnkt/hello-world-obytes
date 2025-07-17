/* eslint-disable no-undef */
console.log('MOCK HealthKit loaded');

module.exports = {
  isHealthDataAvailable: jest.fn().mockResolvedValue(true),
  getRequestStatusForAuthorization: jest.fn().mockResolvedValue('granted'),
  requestAuthorization: jest.fn().mockResolvedValue(true),
  stepCount: jest.fn().mockResolvedValue(1000),
  getMostRecentQuantitySample: jest.fn().mockResolvedValue({
    quantity: 1000,
    startDate: new Date(),
    endDate: new Date(),
  }),
  getStatisticsForQuantity: jest.fn().mockResolvedValue({
    sumQuantity: { quantity: 1000 },
  }),
  queryStatisticsForQuantity: jest.fn().mockResolvedValue([]),
  HKQuantityTypeIdentifier: {
    stepCount: 'HKQuantityTypeIdentifierStepCount',
  },
  HKStatisticsOptions: {
    cumulativeSum: 'cumulativeSum',
  },
  HKUnits: {
    Count: 'count',
    count: 'count',
  },
  // Add any other methods you need for your tests below
};
module.exports.default = module.exports;
