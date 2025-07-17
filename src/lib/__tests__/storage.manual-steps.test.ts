import { getManualStepsByDay, setManualStepsByDay, clearManualStepsByDay, setManualStepEntry } from '../storage';

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

describe('setManualStepEntry', () => {
  it('should add a new manual step entry for a new date', async () => {
    await clearManualStepsByDay();
    await setManualStepEntry({ date: '2024-06-03', steps: 2222, source: 'manual' });
    const result = getManualStepsByDay();
    expect(result).toEqual([
      { date: '2024-06-03', steps: 2222, source: 'manual' },
    ]);
  });

  it('should update an existing manual step entry for the same date', async () => {
    await clearManualStepsByDay();
    await setManualStepsByDay([
      { date: '2024-06-03', steps: 2222, source: 'manual' as const },
    ]);
    await setManualStepEntry({ date: '2024-06-03', steps: 3333, source: 'manual' });
    const result = getManualStepsByDay();
    expect(result).toEqual([
      { date: '2024-06-03', steps: 3333, source: 'manual' },
    ]);
  });

  it('should merge a new manual step entry with existing entries for other dates', async () => {
    await clearManualStepsByDay();
    await setManualStepsByDay([
      { date: '2024-06-01', steps: 1000, source: 'manual' as const },
    ]);
    await setManualStepEntry({ date: '2024-06-02', steps: 2000, source: 'manual' });
    const result = getManualStepsByDay();
    expect(result).toEqual([
      { date: '2024-06-01', steps: 1000, source: 'manual' },
      { date: '2024-06-02', steps: 2000, source: 'manual' },
    ]);
  });
}); 