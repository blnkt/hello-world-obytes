import { getManualStepsByDay, setManualStepsByDay, clearManualStepsByDay, setManualStepEntry, getManualStepEntry, hasManualEntryForDate, clearStepsByDay, setStepsByDay, migrateManualStepEntries, validateManualStepEntry } from '../storage';

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

  it('should combine step values when adding to an existing date', async () => {
    await clearManualStepsByDay();
    await setManualStepsByDay([
      { date: '2024-06-03', steps: 2222, source: 'manual' as const },
    ]);
    await setManualStepEntry({ date: '2024-06-03', steps: 3333, source: 'manual' });
    const result = getManualStepsByDay();
    expect(result).toEqual([
      { date: '2024-06-03', steps: 5555, source: 'manual' }, // 2222 + 3333 = 5555
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

describe('getManualStepEntry', () => {
  it('should retrieve a manual step entry for a specific date', async () => {
    await clearManualStepsByDay();
    await setManualStepsByDay([
      { date: '2024-06-01', steps: 1000, source: 'manual' as const },
      { date: '2024-06-02', steps: 2000, source: 'manual' as const },
    ]);
    const result = getManualStepEntry('2024-06-01');
    expect(result).toEqual({ date: '2024-06-01', steps: 1000, source: 'manual' });
  });

  it('should return null if no manual step entry exists for the given date', async () => {
    await clearManualStepsByDay();
    await setManualStepsByDay([
      { date: '2024-06-01', steps: 1000, source: 'manual' as const },
    ]);
    const result = getManualStepEntry('2024-06-02');
    expect(result).toBeNull();
  });

  it('should return null if no manual step entries exist', async () => {
    await clearManualStepsByDay();
    const result = getManualStepEntry('2024-06-01');
    expect(result).toBeNull();
  });
});

describe('Manual Entry Tracking', () => {
  it('should track when a manual entry has been made for a specific date', async () => {
    await clearManualStepsByDay();
    await setManualStepEntry({ date: '2024-06-01', steps: 1000, source: 'manual' });
    expect(hasManualEntryForDate('2024-06-01')).toBe(true);
  });

  it('should return false for dates without manual entries', async () => {
    await clearManualStepsByDay();
    expect(hasManualEntryForDate('2024-06-01')).toBe(false);
  });

  it('should return false for dates that have been cleared', async () => {
    await clearManualStepsByDay();
    await setManualStepEntry({ date: '2024-06-01', steps: 1000, source: 'manual' });
    await clearManualStepsByDay();
    expect(hasManualEntryForDate('2024-06-01')).toBe(false);
  });

  it('should track multiple manual entries for different dates', async () => {
    await clearManualStepsByDay();
    await setManualStepEntry({ date: '2024-06-01', steps: 1000, source: 'manual' });
    await setManualStepEntry({ date: '2024-06-02', steps: 2000, source: 'manual' });
    expect(hasManualEntryForDate('2024-06-01')).toBe(true);
    expect(hasManualEntryForDate('2024-06-02')).toBe(true);
    expect(hasManualEntryForDate('2024-06-03')).toBe(false);
  });
});

describe('Manual Step Entry Migration', () => {
  it('should migrate existing step data to manual entry format', async () => {
    await clearManualStepsByDay();
    await clearStepsByDay();
    // Simulate old step data format
    const oldStepData = [
      { date: new Date('2024-06-01'), steps: 1000 },
      { date: new Date('2024-06-02'), steps: 2000 },
    ];
    await setStepsByDay(oldStepData);
    
    await migrateManualStepEntries();
    
    const migratedData = getManualStepsByDay();
    expect(migratedData).toEqual([
      { date: '2024-06-01', steps: 1000, source: 'manual' },
      { date: '2024-06-02', steps: 2000, source: 'manual' },
    ]);
  });

  it('should not migrate if no existing step data exists', async () => {
    await clearManualStepsByDay();
    await clearStepsByDay();
    
    await migrateManualStepEntries();
    
    const migratedData = getManualStepsByDay();
    expect(migratedData).toEqual([]);
  });

  it('should preserve existing manual entries during migration', async () => {
    await clearManualStepsByDay();
    await clearStepsByDay();
    
    // Add existing manual entries
    await setManualStepEntry({ date: '2024-06-01', steps: 1500, source: 'manual' });
    
    // Add old step data
    const oldStepData = [
      { date: new Date('2024-06-02'), steps: 2000 },
    ];
    await setStepsByDay(oldStepData);
    
    await migrateManualStepEntries();
    
    const migratedData = getManualStepsByDay();
    expect(migratedData).toEqual([
      { date: '2024-06-01', steps: 1500, source: 'manual' },
      { date: '2024-06-02', steps: 2000, source: 'manual' },
    ]);
  });
}); 

describe('Manual Step Entry Data Validation', () => {
  it('should validate correct manual step entry structure', () => {
    const validEntry = { date: '2024-06-01', steps: 1000, source: 'manual' as const };
    expect(validateManualStepEntry(validEntry)).toBe(true);
  });

  it('should reject manual step entry with missing date', () => {
    const invalidEntry = { steps: 1000, source: 'manual' as const } as any;
    expect(validateManualStepEntry(invalidEntry)).toBe(false);
  });

  it('should reject manual step entry with missing steps', () => {
    const invalidEntry = { date: '2024-06-01', source: 'manual' as const } as any;
    expect(validateManualStepEntry(invalidEntry)).toBe(false);
  });

  it('should reject manual step entry with missing source', () => {
    const invalidEntry = { date: '2024-06-01', steps: 1000 } as any;
    expect(validateManualStepEntry(invalidEntry)).toBe(false);
  });

  it('should reject manual step entry with wrong source value', () => {
    const invalidEntry = { date: '2024-06-01', steps: 1000, source: 'healthkit' as any };
    expect(validateManualStepEntry(invalidEntry)).toBe(false);
  });

  it('should reject manual step entry with non-numeric steps', () => {
    const invalidEntry = { date: '2024-06-01', steps: 'abc', source: 'manual' as const } as any;
    expect(validateManualStepEntry(invalidEntry)).toBe(false);
  });

  it('should reject manual step entry with negative steps', () => {
    const invalidEntry = { date: '2024-06-01', steps: -100, source: 'manual' as const };
    expect(validateManualStepEntry(invalidEntry)).toBe(false);
  });

  it('should reject manual step entry with invalid date format', () => {
    const invalidEntry = { date: 'invalid-date', steps: 1000, source: 'manual' as const };
    expect(validateManualStepEntry(invalidEntry)).toBe(false);
  });

  it('should validate manual step entry with zero steps', () => {
    const validEntry = { date: '2024-06-01', steps: 0, source: 'manual' as const };
    expect(validateManualStepEntry(validEntry)).toBe(true);
  });

  it('should reject manual step entry with steps above 100,000', () => {
    const invalidEntry = { date: '2024-06-01', steps: 100001, source: 'manual' as const };
    expect(validateManualStepEntry(invalidEntry)).toBe(false);
  });

  it('should throw when setManualStepEntry is called with steps above 100,000', async () => {
    await clearManualStepsByDay();
    const invalidEntry = { date: '2024-06-01', steps: 100001, source: 'manual' as const };
    await expect(setManualStepEntry(invalidEntry)).rejects.toThrow('Invalid manual step entry');
  });

  it('should throw when setManualStepsByDay is called with an entry above 100,000 steps', async () => {
    await clearManualStepsByDay();
    const entries = [
      { date: '2024-06-01', steps: 1000, source: 'manual' as const },
      { date: '2024-06-02', steps: 100001, source: 'manual' as const },
    ];
    await expect(setManualStepsByDay(entries)).rejects.toThrow('Invalid manual step entry structure');
  });
}); 