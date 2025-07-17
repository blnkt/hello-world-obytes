/* eslint-disable no-undef */
console.log('MOCK HealthKit loaded');

// Internal store for test-injected step samples
let _stepSamples = [];

function __setStepSamples(samples) {
  _stepSamples = samples;
}

function getStatisticsForQuantity({ startDate, endDate }) {
  // Return only samples within the requested range
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  return Promise.resolve(
    _stepSamples.filter((s) => {
      const d = new Date(s.startDate).getTime();
      return d >= start && d <= end;
    })
  );
}

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
  getStatisticsForQuantity,
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
  __setStepSamples,
};
module.exports.default = module.exports;
