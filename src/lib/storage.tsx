import * as React from 'react';
import { MMKV } from 'react-native-mmkv';
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';

export const storage = new MMKV();

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

// Scenario History Storage
const SCENARIO_HISTORY_KEY = 'SCENARIO_HISTORY';

export function getScenarioHistory(): any[] {
  const value = storage.getString(SCENARIO_HISTORY_KEY);
  return value ? JSON.parse(value) || [] : [];
}

export async function addScenarioToHistory(historyEntry: any) {
  const currentHistory = getScenarioHistory();
  const updatedHistory = [historyEntry, ...currentHistory];
  await setItem(SCENARIO_HISTORY_KEY, updatedHistory);
}

export async function clearScenarioHistory() {
  await removeItem(SCENARIO_HISTORY_KEY);
}

// Character Storage
const CHARACTER_STORAGE_KEY = 'CHARACTER_DATA';

export function getCharacter(): any {
  const value = storage.getString(CHARACTER_STORAGE_KEY);
  const result = value ? JSON.parse(value) || null : null;
  return result;
}

export async function setCharacter(character: any) {
  const jsonString = JSON.stringify(character);
  storage.set(CHARACTER_STORAGE_KEY, jsonString);
}

export async function clearCharacter() {
  await removeItem(CHARACTER_STORAGE_KEY);
}

// React Hook for Character
export const useCharacter = () => {
  const [characterString, setCharacterString] = useMMKVString(
    CHARACTER_STORAGE_KEY,
    storage
  );

  const character = characterString ? JSON.parse(characterString) : null;

  const setCharacter = React.useCallback(
    (newCharacter: any) => {
      setCharacterString(JSON.stringify(newCharacter));
    },
    [setCharacterString]
  );

  return [character, setCharacter] as const;
};

// Manual Entry Mode Storage
const MANUAL_ENTRY_MODE_KEY = 'manualEntryMode';

export function getManualEntryMode(): boolean {
  const value = storage.getString(MANUAL_ENTRY_MODE_KEY);
  return value ? JSON.parse(value) : false;
}

export async function setManualEntryMode(enabled: boolean) {
  storage.set(MANUAL_ENTRY_MODE_KEY, JSON.stringify(enabled));
}

export async function clearManualEntryMode() {
  storage.delete(MANUAL_ENTRY_MODE_KEY);
}

// React Hook for Manual Entry Mode
export const useManualEntryMode = () => {
  const [isManualMode, setIsManualMode] = useMMKVBoolean(
    MANUAL_ENTRY_MODE_KEY,
    storage
  );

  // If the value is undefined, it means the key doesn't exist in storage
  // This should be treated as false (HealthKit mode)
  const mode = isManualMode === undefined ? false : isManualMode;

  return [mode, setIsManualMode] as const;
};

// Developer Mode Storage
const DEVELOPER_MODE_KEY = 'developerMode';

export function getDeveloperMode(): boolean {
  const value = storage.getString(DEVELOPER_MODE_KEY);
  return value ? JSON.parse(value) : false;
}

export async function setDeveloperMode(enabled: boolean) {
  storage.set(DEVELOPER_MODE_KEY, JSON.stringify(enabled));
}

export async function clearDeveloperMode() {
  storage.delete(DEVELOPER_MODE_KEY);
}

// React Hook for Developer Mode
export const useDeveloperMode = () => {
  const [isDeveloperMode, setIsDeveloperMode] = useMMKVBoolean(
    DEVELOPER_MODE_KEY,
    storage
  );

  // If the value is undefined, it means the key doesn't exist in storage
  // This should be treated as false (normal mode)
  const mode = isDeveloperMode === undefined ? false : isDeveloperMode;

  return [mode, setIsDeveloperMode] as const;
};

// Manual Steps By Day Storage
const MANUAL_STEPS_BY_DAY_KEY = 'MANUAL_STEPS_BY_DAY';

export type ManualStepEntry = { date: string; steps: number; source: 'manual' };

export function getManualStepsByDay(): ManualStepEntry[] {
  const value = storage.getString(MANUAL_STEPS_BY_DAY_KEY);
  try {
    return value ? JSON.parse(value) || [] : [];
  } catch {
    return [];
  }
}

export async function setManualStepsByDay(stepsByDay: ManualStepEntry[]) {
  // Validate all entries before storing
  for (const entry of stepsByDay) {
    if (!validateManualStepEntry(entry)) {
      throw new Error(
        `Invalid manual step entry structure: ${JSON.stringify(entry)}`
      );
    }
  }
  await setItem(MANUAL_STEPS_BY_DAY_KEY, stepsByDay);
}

export async function clearManualStepsByDay() {
  await removeItem(MANUAL_STEPS_BY_DAY_KEY);
}

export async function setManualStepEntry(entry: ManualStepEntry) {
  if (!validateManualStepEntry(entry)) {
    throw new Error('Invalid manual step entry');
  }

  // Comprehensive debugging
  console.log('=== STORAGE DEBUG START ===');
  console.log('1. setManualStepEntry called with:', entry);
  console.log('2. Entry date type:', typeof entry.date);
  console.log('3. Entry date value:', entry.date);
  console.log('4. Entry steps:', entry.steps);

  // Get current manual steps from storage
  const existing = getManualStepsByDay();
  console.log('5. Existing entries before modification:', existing);

  const idx = existing.findIndex((e) => e.date === entry.date);
  console.log('6. Found existing entry at index:', idx);

  if (idx !== -1) {
    // Combine steps for the same date
    const oldSteps = existing[idx].steps;
    existing[idx].steps += entry.steps;
    console.log(
      '7. Updated existing entry - old steps:',
      oldSteps,
      'new total:',
      existing[idx].steps
    );
  } else {
    existing.push(entry);
    console.log('7. Added new entry to array');
  }

  console.log('8. Final array to be stored:', existing);
  console.log('9. JSON string to be stored:', JSON.stringify(existing));
  console.log('=== STORAGE DEBUG END ===');

  // Update storage directly to ensure the reactive hook gets the update
  storage.set(MANUAL_STEPS_BY_DAY_KEY, JSON.stringify(existing));
}

export function getManualStepEntry(date: string): ManualStepEntry | null {
  const entries = getManualStepsByDay();
  return entries.find((entry) => entry.date === date) || null;
}

export function hasManualEntryForDate(date: string): boolean {
  const entry = getManualStepEntry(date);
  return entry !== null;
}

// React Hook for Manual Steps By Day
export const useManualStepsByDay = () => {
  const [manualStepsString, setManualStepsString] = useMMKVString(
    MANUAL_STEPS_BY_DAY_KEY,
    storage
  );

  const manualSteps = React.useMemo(() => {
    console.log('=== HOOK DEBUG ===');
    console.log('1. Raw manualStepsString:', manualStepsString);

    if (!manualStepsString) {
      console.log('2. No string, returning empty array');
      return [];
    }

    try {
      const parsed = JSON.parse(manualStepsString);
      console.log('3. Parsed result:', parsed);
      console.log('4. Is array?', Array.isArray(parsed));

      const result = Array.isArray(parsed) ? parsed : [];
      console.log('5. Final result:', result);
      console.log('=== END HOOK DEBUG ===');
      return result;
    } catch (error) {
      console.error('Error parsing manual steps:', error);
      return [];
    }
  }, [manualStepsString]);

  const setManualSteps = React.useCallback(
    (newSteps: ManualStepEntry[]) => {
      setManualStepsString(JSON.stringify(newSteps));
    },
    [setManualStepsString]
  );

  return [manualSteps, setManualSteps] as const;
};

// First Time Storage
const IS_FIRST_TIME_KEY = 'IS_FIRST_TIME';

export function resetFirstTime() {
  storage.delete(IS_FIRST_TIME_KEY);
}

export function setFirstTime(value: boolean) {
  storage.set(IS_FIRST_TIME_KEY, value);
}

// Last Checked Date Storage
const LAST_CHECKED_DATE_KEY = 'lastCheckedDate';

export function getLastCheckedDate(): string | null {
  return storage.getString(LAST_CHECKED_DATE_KEY) || null;
}

export async function setLastCheckedDate(date: string) {
  storage.set(LAST_CHECKED_DATE_KEY, date);
}

export async function clearLastCheckedDate() {
  await removeItem(LAST_CHECKED_DATE_KEY);
}

// React Hook for Last Checked Date
export const useLastCheckedDate = () => {
  const [lastCheckedDate, setLastCheckedDate] = useMMKVString(
    LAST_CHECKED_DATE_KEY,
    storage
  );
  return [lastCheckedDate, setLastCheckedDate] as const;
};

// Last Milestone Storage
const LAST_MILESTONE_KEY = 'lastMilestone';

export function getLastMilestone(): string | null {
  return storage.getString(LAST_MILESTONE_KEY) || null;
}

export async function setLastMilestone(milestone: string) {
  storage.set(LAST_MILESTONE_KEY, milestone);
}

export async function clearLastMilestone() {
  await removeItem(LAST_MILESTONE_KEY);
}

// React Hook for Last Milestone
export const useLastMilestone = () => {
  const [lastMilestone, setLastMilestone] = useMMKVString(
    LAST_MILESTONE_KEY,
    storage
  );
  return [lastMilestone, setLastMilestone] as const;
};

// Steps By Day Storage
const STEPS_BY_DAY_KEY = 'stepsByDay';

export function getStepsByDay(): { date: Date; steps: number }[] {
  const value = storage.getString(STEPS_BY_DAY_KEY);
  try {
    return value ? JSON.parse(value) || [] : [];
  } catch {
    return [];
  }
}

export async function setStepsByDay(
  stepsByDay: { date: Date; steps: number }[]
) {
  await setItem(STEPS_BY_DAY_KEY, stepsByDay);
}

export async function clearStepsByDay() {
  await removeItem(STEPS_BY_DAY_KEY);
}

// Experience Storage
const EXPERIENCE_KEY = 'experience';

export function getExperience(): number {
  const value = storage.getString(EXPERIENCE_KEY);
  return value ? Number(value) || 0 : 0;
}

export async function setExperience(experience: number) {
  storage.set(EXPERIENCE_KEY, String(experience));
}

export async function clearExperience() {
  await removeItem(EXPERIENCE_KEY);
}

// Cumulative Experience Storage
const CUMULATIVE_EXPERIENCE_KEY = 'cumulativeExperience';

export function getCumulativeExperience(): number {
  const value = storage.getString(CUMULATIVE_EXPERIENCE_KEY);
  return value ? Number(value) || 0 : 0;
}

export async function setCumulativeExperience(experience: number) {
  storage.set(CUMULATIVE_EXPERIENCE_KEY, String(experience));
}

export async function clearCumulativeExperience() {
  await removeItem(CUMULATIVE_EXPERIENCE_KEY);
}

// First Experience Date Storage
const FIRST_EXPERIENCE_DATE_KEY = 'firstExperienceDate';

export function getFirstExperienceDate(): string | null {
  return storage.getString(FIRST_EXPERIENCE_DATE_KEY) || null;
}

export async function setFirstExperienceDate(date: string) {
  storage.set(FIRST_EXPERIENCE_DATE_KEY, date);
}

export async function clearFirstExperienceDate() {
  await removeItem(FIRST_EXPERIENCE_DATE_KEY);
}

// Daily Step Goal Storage
const DAILY_STEPS_GOAL_KEY = 'dailyStepsGoal';
const DEFAULT_DAILY_STEPS_GOAL = 10000;

export function getDailyStepsGoal(): number {
  const value = storage.getString(DAILY_STEPS_GOAL_KEY);
  return value
    ? Number(value) || DEFAULT_DAILY_STEPS_GOAL
    : DEFAULT_DAILY_STEPS_GOAL;
}

export async function setDailyStepsGoal(goal: number) {
  storage.set(DAILY_STEPS_GOAL_KEY, String(goal));
}

export async function clearDailyStepsGoal() {
  await removeItem(DAILY_STEPS_GOAL_KEY);
}

// React Hook for Daily Step Goal
export const useDailyStepsGoal = () => {
  const [dailyStepsGoal, setDailyStepsGoal] = useMMKVString(
    DAILY_STEPS_GOAL_KEY,
    storage
  );
  return [
    dailyStepsGoal ? Number(dailyStepsGoal) : DEFAULT_DAILY_STEPS_GOAL,
    setDailyStepsGoal,
  ] as const;
};

// Streaks Storage
const STREAKS_KEY = 'streaks';

export type Streak = {
  id: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  daysCount: number;
  averageSteps: number;
};

export function getStreaks(): Streak[] {
  const value = storage.getString(STREAKS_KEY);
  try {
    return value ? JSON.parse(value) || [] : [];
  } catch {
    return [];
  }
}

export async function setStreaks(streaks: Streak[]) {
  await setItem(STREAKS_KEY, streaks);
}

export async function addStreak(streak: Streak) {
  const currentStreaks = getStreaks();
  const updatedStreaks = [...currentStreaks, streak];
  await setStreaks(updatedStreaks);
}

export async function clearStreaks() {
  await removeItem(STREAKS_KEY);
}

// React Hook for Streaks
export const useStreaks = () => {
  const [streaks, setStreaks] = useMMKVString(STREAKS_KEY, storage);
  return [streaks ? JSON.parse(streaks) || [] : [], setStreaks] as const;
};

// Currency Storage
const CURRENCY_KEY = 'currency';
const DEFAULT_CURRENCY = 0;

export function getCurrency(): number {
  const value = storage.getString(CURRENCY_KEY);
  return value ? Number(value) || DEFAULT_CURRENCY : DEFAULT_CURRENCY;
}

export async function setCurrency(currency: number) {
  storage.set(CURRENCY_KEY, String(currency));
}

export async function addCurrency(amount: number) {
  const currentCurrency = getCurrency();
  await setCurrency(currentCurrency + amount);
}

export async function spendCurrency(amount: number): Promise<boolean> {
  const currentCurrency = getCurrency();
  if (currentCurrency >= amount) {
    await setCurrency(currentCurrency - amount);
    return true;
  }
  return false;
}

export async function clearCurrency() {
  await removeItem(CURRENCY_KEY);
}

// React Hook for Currency
export const useCurrency = () => {
  const [currency, setCurrency] = useMMKVString(CURRENCY_KEY, storage);
  return [currency ? Number(currency) : DEFAULT_CURRENCY, setCurrency] as const;
};

// Purchased Items Storage
const PURCHASED_ITEMS_KEY = 'purchasedItems';

export function getPurchasedItems(): string[] {
  const value = storage.getString(PURCHASED_ITEMS_KEY);
  try {
    return value ? JSON.parse(value) || [] : [];
  } catch {
    return [];
  }
}

export async function setPurchasedItems(items: string[]) {
  await setItem(PURCHASED_ITEMS_KEY, items);
}

export async function addPurchasedItem(itemId: string) {
  const currentItems = getPurchasedItems();
  if (!currentItems.includes(itemId)) {
    const updatedItems = [...currentItems, itemId];
    await setPurchasedItems(updatedItems);
  }
}

export async function clearPurchasedItems() {
  await removeItem(PURCHASED_ITEMS_KEY);
}

// React Hook for Purchased Items
export const usePurchasedItems = () => {
  const [purchasedItems, setPurchasedItems] = useMMKVString(
    PURCHASED_ITEMS_KEY,
    storage
  );
  return [
    purchasedItems ? JSON.parse(purchasedItems) || [] : [],
    setPurchasedItems,
  ] as const;
};

// Hybrid Health Data Storage - Core data batched, large datasets separate
const HEALTH_CORE_KEY = 'healthCore';

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
  const value = storage.getString(HEALTH_CORE_KEY);
  try {
    return value ? JSON.parse(value) || {} : {};
  } catch {
    return {};
  }
}

export async function setHealthCore(data: Partial<HealthCore>) {
  await setItem(HEALTH_CORE_KEY, data);
}

export async function updateHealthCore(updates: Partial<HealthCore>) {
  const currentData = getHealthCore();
  const updatedData = { ...currentData, ...updates };
  await setHealthCore(updatedData);
}

// Migration helper to move from old separate keys to new batched core
export async function migrateToHealthCore() {
  const coreData: Partial<HealthCore> = {};

  // Migrate individual keys to core batch
  const experience = getExperience();
  if (experience !== 0) coreData.experience = experience;

  const cumulativeExperience = getCumulativeExperience();
  if (cumulativeExperience !== 0)
    coreData.cumulativeExperience = cumulativeExperience;

  const firstExperienceDate = getFirstExperienceDate();
  if (firstExperienceDate) coreData.firstExperienceDate = firstExperienceDate;

  const currency = getCurrency();
  if (currency !== 0) coreData.currency = currency;

  const lastCheckedDate = getLastCheckedDate();
  if (lastCheckedDate) coreData.lastCheckedDate = lastCheckedDate;

  const dailyStepsGoal = getDailyStepsGoal();
  if (dailyStepsGoal !== 10000) coreData.dailyStepsGoal = dailyStepsGoal;

  const lastMilestone = getLastMilestone();
  if (lastMilestone) coreData.lastMilestone = lastMilestone;

  if (Object.keys(coreData).length > 0) {
    await setHealthCore(coreData);
    console.log('Migrated health data to core batch storage');
  }
}

export async function migrateManualStepEntries() {
  const existingSteps = getStepsByDay();
  const existingManualSteps = getManualStepsByDay();

  if (existingSteps.length === 0) {
    return;
  }

  // Helper function to get timezone-safe date string
  const getDateString = (date: Date | string): string => {
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } else {
      return String(date).split('T')[0];
    }
  };

  // Convert old step data to manual entry format
  const migratedEntries: ManualStepEntry[] = existingSteps.map((step) => ({
    date: getDateString(step.date),
    steps: step.steps,
    source: 'manual' as const,
  }));

  // Merge with existing manual entries, avoiding duplicates
  const allEntries = [...existingManualSteps, ...migratedEntries];
  const uniqueEntries = allEntries.reduce((acc, entry) => {
    const existing = acc.find((e) => e.date === entry.date);
    if (!existing) {
      acc.push(entry);
    }
    return acc;
  }, [] as ManualStepEntry[]);

  // Sort by date
  uniqueEntries.sort((a, b) => a.date.localeCompare(b.date));

  await setManualStepsByDay(uniqueEntries);
}

export function clearAllStorage() {
  storage.clearAll();
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

  // Validate steps (non-negative number, reasonable upper limit)
  if (entry.steps < 0) {
    return false;
  }
  if (entry.steps > 100000) {
    return false;
  }

  return true;
}
