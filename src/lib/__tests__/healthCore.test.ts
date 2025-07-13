import {
  getHealthCore,
  setHealthCore,
  updateHealthCore,
  migrateToHealthCore,
  type HealthCore,
} from '../storage';

// MMKV is a singleton, so clear between tests
beforeEach(() => {
  // @ts-ignore
  global.MMKVStorage?.clearAll?.();
  // fallback for direct MMKV usage
  try {
    require('react-native-mmkv').MMKV.clearAll();
  } catch {}
});

describe('HealthCore batch storage', () => {
  it('should set and get HealthCore data', async () => {
    const core: HealthCore = {
      experience: 1234,
      cumulativeExperience: 5678,
      firstExperienceDate: '2024-01-01T00:00:00.000Z',
      currency: 99,
      lastCheckedDate: '2024-01-02T00:00:00.000Z',
      dailyStepsGoal: 8000,
      lastMilestone: '10000',
    };
    await setHealthCore(core);
    const result = getHealthCore();
    expect(result).toMatchObject(core);
  });

  it('should update HealthCore data', async () => {
    await setHealthCore({ experience: 100 });
    await updateHealthCore({ experience: 200, currency: 50 });
    const result = getHealthCore();
    expect(result.experience).toBe(200);
    expect(result.currency).toBe(50);
  });

  it('should not overwrite unspecified fields on update', async () => {
    await setHealthCore({ experience: 100, currency: 10 });
    await updateHealthCore({ experience: 300 });
    const result = getHealthCore();
    expect(result.experience).toBe(300);
    expect(result.currency).toBe(10);
  });

  it('should migrate old keys to HealthCore', async () => {
    // Simulate old keys
    await setHealthCore({}); // clear
    // @ts-ignore
    require('../storage').setExperience(42);
    // @ts-ignore
    require('../storage').setCumulativeExperience(99);
    // @ts-ignore
    require('../storage').setFirstExperienceDate('2023-12-31T00:00:00.000Z');
    // @ts-ignore
    require('../storage').setCurrency(7);
    // @ts-ignore
    require('../storage').setLastCheckedDate('2024-01-03T00:00:00.000Z');
    // @ts-ignore
    require('../storage').setDailyStepsGoal(12345);
    // @ts-ignore
    require('../storage').setLastMilestone('20000');
    await migrateToHealthCore();
    const result = getHealthCore();
    expect(result.experience).toBe(42);
    expect(result.cumulativeExperience).toBe(99);
    expect(result.firstExperienceDate).toBe('2023-12-31T00:00:00.000Z');
    expect(result.currency).toBe(7);
    expect(result.lastCheckedDate).toBe('2024-01-03T00:00:00.000Z');
    expect(result.dailyStepsGoal).toBe(12345);
    expect(result.lastMilestone).toBe('20000');
  });
}); 