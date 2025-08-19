/* eslint-disable no-undef */
console.log('MOCK HealthKit loaded');

// Internal store for test-injected step samples
let _stepSamples = [];

// Global variable to sync with storage mock data
global.__healthKitMockData = [];

function __setStepSamples(samples) {
  _stepSamples = samples;
  global.__healthKitMockData = samples.map((s) => ({
    date: s.startDate,
    steps: s.quantity,
  }));
}

// Sync with global mock data
function __syncWithGlobalData() {
  try {
    if (global.__healthKitMockData && global.__healthKitMockData.length > 0) {
      // Convert global data to HealthKit sample format
      _stepSamples = global.__healthKitMockData.map((entry) => ({
        startDate:
          typeof entry.date === 'string' ? new Date(entry.date) : entry.date,
        endDate:
          typeof entry.date === 'string' ? new Date(entry.date) : entry.date,
        quantity: entry.steps,
        unit: 'count',
      }));
    }
  } catch (error) {
    // If global data is not available, keep existing samples
    console.log('Could not sync with global mock data:', error.message);
  }
}

function getStatisticsForQuantity({ startDate, endDate }) {
  // Sync with global data before querying
  __syncWithGlobalData();

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

function queryStatisticsForQuantity(...args) {
  // Sync with global data before querying
  __syncWithGlobalData();

  // Support both (type, options, startDate, endDate, unit) and ({ startDate })
  let startDate;
  if (
    args.length === 1 &&
    args[0] &&
    typeof args[0] === 'object' &&
    args[0].startDate
  ) {
    startDate = args[0].startDate;
  } else if (args.length >= 3) {
    startDate = args[2];
  }
  if (!startDate) return Promise.resolve({ sumQuantity: { quantity: 0 } });
  const startDay = new Date(startDate);
  const dayString = startDay.toISOString().split('T')[0];
  const sum = _stepSamples.reduce((acc, s) => {
    const sampleDay = new Date(s.startDate).toISOString().split('T')[0];
    if (sampleDay === dayString) {
      return acc + (s.quantity || 0);
    }
    return acc;
  }, 0);
  return Promise.resolve({ sumQuantity: { quantity: sum } });
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
  queryStatisticsForQuantity,
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
  __syncWithGlobalData,
};
module.exports.default = module.exports;
