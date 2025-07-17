import React from 'react';

import { mmkvMockStorage } from './react-native-mmkv';

console.log('[Storage Mock] Manual mock loaded');

// Mock storage object
const mockStorage: Record<string, string> = {};

// Mock useMMKVString hook
export const useMMKVString = (key: string, storageInstance?: any) => {
  const [value, setValue] = React.useState<string | null>(() => {
    return mockStorage[key] || null;
  });

  const setValueWithStorage = React.useCallback(
    (newValue: string | null) => {
      if (newValue === null) {
        delete mockStorage[key];
      } else {
        mockStorage[key] = newValue;
      }
      setValue(newValue);
    },
    [key]
  );

  return [value, setValueWithStorage] as const;
};

export const storage = {
  getString: (key: string): string | null => {
    const value = mockStorage[key] || null;
    console.log(`[Storage Mock] getString(${key}) = ${value}`);
    return value;
  },
  set: (key: string, value: string): void => {
    console.log(`[Storage Mock] set(${key}, ${value})`);
    mockStorage[key] = value;
  },
  delete: (key: string): void => {
    console.log(`[Storage Mock] delete(${key})`);
    delete mockStorage[key];
  },
  clear: (): void => {
    console.log(
      `[Storage Mock] clear() - clearing ${Object.keys(mockStorage).length} keys`
    );
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  },
} as any; // Type as any to avoid TypeScript conflicts with MMKV interface

// Mock all the exported functions
export function getItem<T>(key: string): T | null {
  const value = storage.getString(key);
  return value ? JSON.parse(value) || null : null;
}

export async function setItem<T>(key: string, value: T) {
  storage.set(key, JSON.stringify(value));
}

export async function removeItem(key: string) {
  storage.delete(key);
}

// Mock all the specific storage functions
export function getScenarioHistory(): any[] {
  const value = storage.getString('SCENARIO_HISTORY');
  return value ? JSON.parse(value) || [] : [];
}

export async function addScenarioToHistory(historyEntry: any) {
  const currentHistory = getScenarioHistory();
  const updatedHistory = [historyEntry, ...currentHistory];
  await setItem('SCENARIO_HISTORY', updatedHistory);
}

export async function clearScenarioHistory() {
  await removeItem('SCENARIO_HISTORY');
}

export function getCharacter(): any {
  const value = storage.getString('CHARACTER_DATA');
  const result = value ? JSON.parse(value) || null : null;
  return result;
}

export async function setCharacter(character: any) {
  const jsonString = JSON.stringify(character);
  storage.set('CHARACTER_DATA', jsonString);
}

export async function clearCharacter() {
  await removeItem('CHARACTER_DATA');
}

export function resetFirstTime() {
  storage.delete('IS_FIRST_TIME');
}

export function setFirstTime(value: boolean) {
  storage.set('IS_FIRST_TIME', String(value));
}

export function getLastCheckedDate(): string | null {
  return storage.getString('lastCheckedDate') || null;
}

export async function setLastCheckedDate(date: string) {
  storage.set('lastCheckedDate', date);
}

export async function clearLastCheckedDate() {
  await removeItem('lastCheckedDate');
}

export const useLastCheckedDate = () => {
  const [lastCheckedDate, setLastCheckedDate] = React.useState<string | null>(
    getLastCheckedDate()
  );
  return [lastCheckedDate, setLastCheckedDate] as const;
};

export function getLastMilestone(): string | null {
  return storage.getString('lastMilestone') || null;
}

export async function setLastMilestone(milestone: string) {
  storage.set('lastMilestone', milestone);
}

export async function clearLastMilestone() {
  await removeItem('lastMilestone');
}

export const useLastMilestone = () => {
  const [lastMilestone, setLastMilestone] = React.useState<string | null>(
    getLastMilestone()
  );
  return [lastMilestone, setLastMilestone] as const;
};

export function getStepsByDay(): { date: Date; steps: number }[] {
  const value = storage.getString('stepsByDay');
  try {
    return value ? JSON.parse(value) || [] : [];
  } catch {
    return [];
  }
}

export async function setStepsByDay(
  stepsByDay: { date: Date; steps: number }[]
) {
  await setItem('stepsByDay', stepsByDay);
}

export async function clearStepsByDay() {
  await removeItem('stepsByDay');
}

export function getExperience(): number {
  const value = storage.getString('experience');
  return value ? Number(value) || 0 : 0;
}

export async function setExperience(experience: number) {
  storage.set('experience', String(experience));
}

export async function clearExperience() {
  await removeItem('experience');
}

export function getCumulativeExperience(): number {
  const value = storage.getString('cumulativeExperience');
  return value ? Number(value) || 0 : 0;
}

export async function setCumulativeExperience(experience: number) {
  storage.set('cumulativeExperience', String(experience));
}

export async function clearCumulativeExperience() {
  await removeItem('cumulativeExperience');
}

export function getFirstExperienceDate(): string | null {
  return storage.getString('firstExperienceDate') || null;
}

export async function setFirstExperienceDate(date: string) {
  storage.set('firstExperienceDate', date);
}

export async function clearFirstExperienceDate() {
  await removeItem('firstExperienceDate');
}

export function getDailyStepsGoal(): number {
  const value = storage.getString('dailyStepsGoal');
  return value ? Number(value) || 10000 : 10000;
}

export async function setDailyStepsGoal(goal: number) {
  storage.set('dailyStepsGoal', String(goal));
}

export async function clearDailyStepsGoal() {
  await removeItem('dailyStepsGoal');
}

export const useDailyStepsGoal = () => {
  const [dailyStepsGoal, setDailyStepsGoal] =
    React.useState<number>(getDailyStepsGoal());
  return [dailyStepsGoal, setDailyStepsGoal] as const;
};

export type Streak = {
  id: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  averageSteps: number;
};

export function getStreaks(): Streak[] {
  const value = mmkvMockStorage['STREAKS'] || null;
  return value ? JSON.parse(value) || [] : [];
}

export async function setStreaks(streaks: Streak[]) {
  mmkvMockStorage['STREAKS'] = JSON.stringify(streaks);
}

export async function addStreak(streak: Streak) {
  console.log('[Storage Mock] addStreak called with:', streak);
  const current = getStreaks();
  console.log('[Storage Mock] current streaks:', current);
  await setStreaks([...current, streak]);
  console.log('[Storage Mock] updated streaks:', getStreaks());
}

export async function clearStreaks() {
  delete mmkvMockStorage['STREAKS'];
}

export const useStreaks = () => {
  const getLatestStreaks = () => {
    const value = mmkvMockStorage['STREAKS'] || null;
    return value ? JSON.parse(value) || [] : [];
  };
  const setStreaks = (newStreaks: Streak[]) => {
    mmkvMockStorage['STREAKS'] = JSON.stringify(newStreaks);
  };
  return [getLatestStreaks(), setStreaks] as const;
};

export function getCurrencySync(): number {
  const value = storage.getString('currency');
  const result = value ? Number(value) || 0 : 0;
  console.log('[Storage Mock] getCurrencySync() =', result);
  return result;
}

export function getCurrency(): number {
  return getCurrencySync();
}

export async function setCurrency(currency: number) {
  console.log('[Storage Mock] setCurrency called with:', currency);
  await new Promise((resolve) => setTimeout(resolve, 10));
  storage.set('currency', String(currency));
}

export async function addCurrency(amount: number) {
  const currentCurrency = await getCurrency();
  await setCurrency(currentCurrency + amount);
}

export async function spendCurrency(amount: number): Promise<boolean> {
  const currentCurrency = await getCurrency();
  if (currentCurrency >= amount) {
    await setCurrency(currentCurrency - amount);
    return true;
  }
  return false;
}

export async function clearCurrency() {
  await removeItem('currency');
}

export const useCurrency = () => {
  const [currency, setCurrency] = React.useState<number>(getCurrencySync());
  return [currency, setCurrency] as const;
};

export function getPurchasedItems(): string[] {
  const value = storage.getString('purchasedItems');
  return value ? JSON.parse(value) || [] : [];
}

export async function setPurchasedItems(items: string[]) {
  await setItem('purchasedItems', items);
}

export async function addPurchasedItem(itemId: string) {
  const currentItems = getPurchasedItems();
  if (!currentItems.includes(itemId)) {
    const updatedItems = [...currentItems, itemId];
    await setPurchasedItems(updatedItems);
  }
}

export async function clearPurchasedItems() {
  await removeItem('purchasedItems');
}

export const usePurchasedItems = () => {
  const [purchasedItems, setPurchasedItems] =
    React.useState<string[]>(getPurchasedItems());
  return [purchasedItems, setPurchasedItems] as const;
};

export type HealthCore = {
  experience: number;
  cumulativeExperience: number;
  firstExperienceDate: string | null;
  currency: number;
  lastCheckedDate: string | null;
  dailyStepsGoal: number;
  lastMilestone: string | null;
};

export function getHealthCore(): Partial<HealthCore> {
  return {
    experience: getExperience(),
    cumulativeExperience: getCumulativeExperience(),
    firstExperienceDate: getFirstExperienceDate(),
    currency: getCurrencySync(),
    lastCheckedDate: getLastCheckedDate(),
    dailyStepsGoal: getDailyStepsGoal(),
    lastMilestone: getLastMilestone(),
  };
}

export async function setHealthCore(data: Partial<HealthCore>) {
  console.log('[Storage Mock] setHealthCore called with:', data);
  if (data.experience !== undefined) await setExperience(data.experience);
  if (data.cumulativeExperience !== undefined)
    await setCumulativeExperience(data.cumulativeExperience);
  if (data.firstExperienceDate !== undefined) {
    if (data.firstExperienceDate !== null) {
      await setFirstExperienceDate(data.firstExperienceDate);
    } else {
      await clearFirstExperienceDate();
    }
  }
  if (data.currency !== undefined) {
    console.log('[Storage Mock] Setting currency to:', data.currency);
    await setCurrency(data.currency);
  }
  if (data.lastCheckedDate !== undefined) {
    if (data.lastCheckedDate !== null) {
      await setLastCheckedDate(data.lastCheckedDate);
    } else {
      await clearLastCheckedDate();
    }
  }
  if (data.dailyStepsGoal !== undefined)
    await setDailyStepsGoal(data.dailyStepsGoal);
  if (data.lastMilestone !== undefined) {
    if (data.lastMilestone !== null) {
      await setLastMilestone(data.lastMilestone);
    } else {
      await clearLastMilestone();
    }
  }
}

export async function updateHealthCore(updates: Partial<HealthCore>) {
  console.log('[Storage Mock] updateHealthCore called with:', updates);
  await setHealthCore(updates);
}

export async function migrateToHealthCore() {
  // Mock implementation
}

export function clearAllStorage() {
  storage.clear();
}

// Mock the functions that the health module defines locally
export function getManualEntryMode(): boolean {
  const value = storage.getString('manualEntryMode');
  return value ? JSON.parse(value) || false : false;
}

export async function setManualEntryMode(enabled: boolean) {
  storage.set('manualEntryMode', JSON.stringify(enabled));
}

export async function clearManualEntryMode() {
  storage.delete('manualEntryMode');
}

export function getDeveloperMode(): boolean {
  const value = storage.getString('developerMode');
  return value ? JSON.parse(value) || false : false;
}

export async function setDeveloperMode(enabled: boolean) {
  storage.set('developerMode', JSON.stringify(enabled));
}

export async function clearDeveloperMode() {
  storage.delete('developerMode');
}

// Manual Step Entry Functions
export type ManualStepEntry = { date: string; steps: number; source: 'manual' };

export function getManualStepsByDay(): ManualStepEntry[] {
  const value = storage.getString('manualStepsByDay');
  try {
    return value ? JSON.parse(value) || [] : [];
  } catch {
    return [];
  }
}

export async function setManualStepsByDay(stepsByDay: ManualStepEntry[]) {
  await setItem('manualStepsByDay', stepsByDay);
}

export async function clearManualStepsByDay() {
  await removeItem('manualStepsByDay');
}

export async function setManualStepEntry(entry: ManualStepEntry) {
  const current = getManualStepsByDay();
  const filtered = current.filter((e) => e.date !== entry.date);
  const updated = [...filtered, entry].sort((a, b) =>
    a.date.localeCompare(b.date)
  );
  await setManualStepsByDay(updated);
}

export function getManualStepEntry(date: string): ManualStepEntry | null {
  const entries = getManualStepsByDay();
  return entries.find((entry) => entry.date === date) || null;
}

export function hasManualEntryForDate(date: string): boolean {
  const entries = getManualStepsByDay();
  return entries.some((entry) => entry.date === date);
}

export async function migrateManualStepEntries() {
  const existingSteps = getStepsByDay();
  if (existingSteps.length === 0) {
    return;
  }

  const manualEntries: ManualStepEntry[] = existingSteps.map((step) => ({
    date: step.date.toISOString().split('T')[0],
    steps: step.steps,
    source: 'manual' as const,
  }));

  await setManualStepsByDay(manualEntries);
}

export function validateManualStepEntry(entry: any): entry is ManualStepEntry {
  // Check if entry is an object
  if (!entry || typeof entry !== 'object') {
    return false;
  }

  // Check required fields
  if (!entry.date || typeof entry.date !== 'string') {
    return false;
  }

  if (typeof entry.steps !== 'number') {
    return false;
  }

  if (entry.source !== 'manual') {
    return false;
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(entry.date)) {
    return false;
  }

  // Validate steps (non-negative number)
  if (entry.steps < 0) {
    return false;
  }

  return true;
}
