import { getManualStepsByDay, setManualStepsByDay, clearManualStepsByDay } from '../storage';

// MMKV is a singleton, so clear between tests
beforeEach(() => {
  // @ts-ignore
  global.MMKVStorage?.clearAll?.();
  // fallback for direct MMKV usage
  try {
    require('react-native-mmkv').MMKV.clearAll();
  } catch {}
});

describe('Manual Step Entry Storage', () => {
  it('should store and retrieve manual step entries by day', async () => {
    const manualSteps = [
      { date: '2024-06-01', steps: 1234, source: 'manual' as const },
      { date: '2024-06-02', steps: 5678, source: 'manual' as const },
    ];
    await setManualStepsByDay(manualSteps);
    const result = getManualStepsByDay();
    expect(result).toEqual(manualSteps);
  });

  it('should clear manual step entries', async () => {
    const manualSteps = [
      { date: '2024-06-01', steps: 1234, source: 'manual' as const },
    ];
    await setManualStepsByDay(manualSteps);
    await clearManualStepsByDay();
    const result = getManualStepsByDay();
    expect(result).toEqual([]);
  });
}); 