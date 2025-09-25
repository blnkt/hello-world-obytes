import * as React from 'react';
import { MMKV } from 'react-native-mmkv';
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';

import type { Character } from '@/types/character';
import type { ScenarioHistory } from '@/types/scenario';

export const storage = new MMKV();

export function getItem<T>(key: string): T | null {
  const value = storage.getString(key);
  return value ? JSON.parse(value) || null : null;
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  storage.set(key, JSON.stringify(value));
}

export async function removeItem(key: string): Promise<void> {
  storage.delete(key);
}

// Scenario History Storage
const SCENARIO_HISTORY_KEY = 'SCENARIO_HISTORY';

export function getScenarioHistory(): ScenarioHistory[] {
  const value = storage.getString(SCENARIO_HISTORY_KEY);
  return value ? JSON.parse(value) || [] : [];
}

export async function addScenarioToHistory(
  historyEntry: ScenarioHistory
): Promise<void> {
  const currentHistory = getScenarioHistory();
  const updatedHistory = [historyEntry, ...currentHistory];
  await setItem(SCENARIO_HISTORY_KEY, updatedHistory);
}

export async function clearScenarioHistory(): Promise<void> {
  await removeItem(SCENARIO_HISTORY_KEY);
}

// Character Storage
const CHARACTER_STORAGE_KEY = 'CHARACTER_DATA';

export function getCharacter(): Character | null {
  const value = storage.getString(CHARACTER_STORAGE_KEY);
  const result = value ? JSON.parse(value) || null : null;
  return result;
}

export async function setCharacter(character: Character): Promise<void> {
  const jsonString = JSON.stringify(character);
  storage.set(CHARACTER_STORAGE_KEY, jsonString);
}

export async function clearCharacter(): Promise<void> {
  await removeItem(CHARACTER_STORAGE_KEY);
}

// React Hook for Character
export const useCharacter = (): [
  Character | null,
  (character: Character) => void,
] => {
  const [characterString, setCharacterString] = useMMKVString(
    CHARACTER_STORAGE_KEY,
    storage
  );

  const character = characterString ? JSON.parse(characterString) : null;

  const setCharacter = React.useCallback(
    (newCharacter: Character) => {
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

export async function setManualEntryMode(enabled: boolean): Promise<void> {
  storage.set(MANUAL_ENTRY_MODE_KEY, JSON.stringify(enabled));
}

export async function clearManualEntryMode(): Promise<void> {
  storage.delete(MANUAL_ENTRY_MODE_KEY);
}

// React Hook for Manual Entry Mode
export const useManualEntryMode = (): [boolean, (value: boolean) => void] => {
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

export async function setDeveloperMode(enabled: boolean): Promise<void> {
  storage.set(DEVELOPER_MODE_KEY, JSON.stringify(enabled));
}

export async function clearDeveloperMode(): Promise<void> {
  storage.delete(DEVELOPER_MODE_KEY);
}

// React Hook for Developer Mode
export const useDeveloperMode = (): [boolean, (value: boolean) => void] => {
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

export async function setManualStepsByDay(
  stepsByDay: ManualStepEntry[]
): Promise<void> {
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

export async function clearManualStepsByDay(): Promise<void> {
  await removeItem(MANUAL_STEPS_BY_DAY_KEY);
}

export async function setManualStepEntry(
  entry: ManualStepEntry
): Promise<void> {
  if (!validateManualStepEntry(entry)) {
    throw new Error('Invalid manual step entry');
  }

  // Get current manual steps from storage
  const existing = getManualStepsByDay();
  const idx = existing.findIndex((e: ManualStepEntry) => e.date === entry.date);

  if (idx !== -1) {
    // Combine steps for the same date
    existing[idx].steps += entry.steps;
  } else {
    existing.push(entry);
  }

  // Update storage directly to ensure the reactive hook gets the update
  storage.set(MANUAL_STEPS_BY_DAY_KEY, JSON.stringify(existing));
}

export function getManualStepEntry(date: string): ManualStepEntry | null {
  const entries = getManualStepsByDay();
  return entries.find((entry: ManualStepEntry) => entry.date === date) || null;
}

export function hasManualEntryForDate(date: string): boolean {
  const entry = getManualStepEntry(date);
  return entry !== null;
}

// React Hook for Manual Steps By Day
export const useManualStepsByDay = (): [
  ManualStepEntry[],
  (steps: ManualStepEntry[]) => void,
] => {
  const [manualStepsString, setManualStepsString] = useMMKVString(
    MANUAL_STEPS_BY_DAY_KEY,
    storage
  );

  const manualSteps = React.useMemo(() => {
    if (!manualStepsString) {
      return [];
    }

    try {
      const parsed = JSON.parse(manualStepsString);
      return Array.isArray(parsed) ? parsed : [];
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

export function resetFirstTime(): void {
  storage.delete(IS_FIRST_TIME_KEY);
}

export function setFirstTime(value: boolean): void {
  storage.set(IS_FIRST_TIME_KEY, value);
}

// Last Checked Date Storage
const LAST_CHECKED_DATE_KEY = 'lastCheckedDate';

export function getLastCheckedDate(): string | null {
  return storage.getString(LAST_CHECKED_DATE_KEY) || null;
}

export async function setLastCheckedDate(date: string): Promise<void> {
  storage.set(LAST_CHECKED_DATE_KEY, date);
}

export async function clearLastCheckedDate(): Promise<void> {
  await removeItem(LAST_CHECKED_DATE_KEY);
}

// React Hook for Last Checked Date
export const useLastCheckedDate = (): [
  string | null,
  (value: string | null) => void,
] => {
  const [lastCheckedDate, setLastCheckedDate] = useMMKVString(
    LAST_CHECKED_DATE_KEY,
    storage
  );
  const value = lastCheckedDate === undefined ? null : lastCheckedDate;
  const setter = (newValue: string | null) => {
    setLastCheckedDate(newValue === null ? undefined : newValue);
  };
  return [value, setter] as const;
};

// Last Milestone Storage
const LAST_MILESTONE_KEY = 'lastMilestone';

export function getLastMilestone(): string | null {
  return storage.getString(LAST_MILESTONE_KEY) || null;
}

export async function setLastMilestone(milestone: string): Promise<void> {
  storage.set(LAST_MILESTONE_KEY, milestone);
}

export async function clearLastMilestone(): Promise<void> {
  await removeItem(LAST_MILESTONE_KEY);
}

// React Hook for Last Milestone
export const useLastMilestone = (): [
  string | null,
  (value: string | null) => void,
] => {
  const [lastMilestone, setLastMilestone] = useMMKVString(
    LAST_MILESTONE_KEY,
    storage
  );
  const value = lastMilestone === undefined ? null : lastMilestone;
  const setter = (newValue: string | null) => {
    setLastMilestone(newValue === null ? undefined : newValue);
  };
  return [value, setter] as const;
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
): Promise<void> {
  await setItem(STEPS_BY_DAY_KEY, stepsByDay);
}

export async function clearStepsByDay(): Promise<void> {
  await removeItem(STEPS_BY_DAY_KEY);
}

// Experience Storage
const EXPERIENCE_KEY = 'experience';

export function getExperience(): number {
  const value = storage.getString(EXPERIENCE_KEY);
  return value ? Number(value) || 0 : 0;
}

export async function setExperience(experience: number): Promise<void> {
  storage.set(EXPERIENCE_KEY, String(experience));
}

export async function clearExperience(): Promise<void> {
  await removeItem(EXPERIENCE_KEY);
}

// Cumulative Experience Storage
const CUMULATIVE_EXPERIENCE_KEY = 'cumulativeExperience';

export function getCumulativeExperience(): number {
  const value = storage.getString(CUMULATIVE_EXPERIENCE_KEY);
  return value ? Number(value) || 0 : 0;
}

export async function setCumulativeExperience(
  experience: number
): Promise<void> {
  storage.set(CUMULATIVE_EXPERIENCE_KEY, String(experience));
}

export async function clearCumulativeExperience(): Promise<void> {
  await removeItem(CUMULATIVE_EXPERIENCE_KEY);
}

// First Experience Date Storage
const FIRST_EXPERIENCE_DATE_KEY = 'firstExperienceDate';

export function getFirstExperienceDate(): string | null {
  return storage.getString(FIRST_EXPERIENCE_DATE_KEY) || null;
}

export async function setFirstExperienceDate(date: string): Promise<void> {
  storage.set(FIRST_EXPERIENCE_DATE_KEY, date);
}

export async function clearFirstExperienceDate(): Promise<void> {
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

export async function setDailyStepsGoal(goal: number): Promise<void> {
  storage.set(DAILY_STEPS_GOAL_KEY, String(goal));
}

export async function clearDailyStepsGoal(): Promise<void> {
  await removeItem(DAILY_STEPS_GOAL_KEY);
}

// React Hook for Daily Step Goal
export const useDailyStepsGoal = (): [number, (value: number) => void] => {
  const [dailyStepsGoal, setDailyStepsGoal] = useMMKVString(
    DAILY_STEPS_GOAL_KEY,
    storage
  );
  const value = dailyStepsGoal
    ? Number(dailyStepsGoal)
    : DEFAULT_DAILY_STEPS_GOAL;
  const setter = (newValue: number) => {
    setDailyStepsGoal(newValue.toString());
  };
  return [value, setter] as const;
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

export async function setStreaks(streaks: Streak[]): Promise<void> {
  await setItem(STREAKS_KEY, streaks);
}

export async function addStreak(streak: Streak): Promise<void> {
  const currentStreaks = getStreaks();
  const updatedStreaks = [...currentStreaks, streak];
  await setStreaks(updatedStreaks);
}

export async function clearStreaks(): Promise<void> {
  await removeItem(STREAKS_KEY);
}

// React Hook for Streaks
export const useStreaks = (): [Streak[], (value: Streak[]) => void] => {
  const [streaks, setStreaks] = useMMKVString(STREAKS_KEY, storage);
  const value = streaks ? JSON.parse(streaks) || [] : [];
  const setter = (newValue: Streak[]) => {
    setStreaks(JSON.stringify(newValue));
  };
  return [value, setter] as const;
};

// Currency Storage
const CURRENCY_KEY = 'currency';
const DEFAULT_CURRENCY = 0;

export function getCurrency(): number {
  const value = storage.getString(CURRENCY_KEY);
  return value ? Number(value) || DEFAULT_CURRENCY : DEFAULT_CURRENCY;
}

export async function setCurrency(currency: number): Promise<void> {
  storage.set(CURRENCY_KEY, String(currency));
}

export async function addCurrency(amount: number): Promise<void> {
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

export async function clearCurrency(): Promise<void> {
  await removeItem(CURRENCY_KEY);
}

// React Hook for Currency
export const useCurrency = (): [number, (value: number) => void] => {
  const [currency, setCurrency] = useMMKVString(CURRENCY_KEY, storage);
  const value = currency ? Number(currency) : DEFAULT_CURRENCY;
  const setter = (newValue: number) => {
    setCurrency(newValue.toString());
  };
  return [value, setter] as const;
};

// Purchased Items Storage
const PURCHASED_ITEMS_KEY = 'purchasedItems';

export type PurchasedItem = {
  id: string;
  quantity: number;
};

export function getPurchasedItems(): PurchasedItem[] {
  const value = storage.getString(PURCHASED_ITEMS_KEY);
  try {
    return value ? JSON.parse(value) || [] : [];
  } catch {
    return [];
  }
}

export async function setPurchasedItems(items: PurchasedItem[]): Promise<void> {
  await setItem(PURCHASED_ITEMS_KEY, items);
}

export async function addPurchasedItem(itemId: string): Promise<void> {
  const currentItems = getPurchasedItems();
  const existingItem = currentItems.find(
    (item: PurchasedItem) => item.id === itemId
  );

  if (existingItem) {
    // Increment quantity if item already exists
    existingItem.quantity += 1;
    await setPurchasedItems(currentItems);
  } else {
    // Add new item with quantity 1
    const updatedItems = [...currentItems, { id: itemId, quantity: 1 }];
    await setPurchasedItems(updatedItems);
  }
}

export async function consumeItem(itemId: string): Promise<boolean> {
  const currentItems = getPurchasedItems();
  const itemIndex = currentItems.findIndex(
    (item: PurchasedItem) => item.id === itemId
  );

  if (itemIndex === -1 || currentItems[itemIndex].quantity <= 0) {
    return false; // Item not found or no quantity left
  }

  // Decrease quantity
  currentItems[itemIndex].quantity -= 1;

  // Remove item if quantity reaches 0
  if (currentItems[itemIndex].quantity === 0) {
    currentItems.splice(itemIndex, 1);
  }

  await setPurchasedItems(currentItems);
  return true; // Item used successfully
}

export async function clearPurchasedItems(): Promise<void> {
  await removeItem(PURCHASED_ITEMS_KEY);
}

// React Hook for Purchased Items
export const usePurchasedItems = (): [
  PurchasedItem[],
  (value: PurchasedItem[]) => void,
] => {
  const [purchasedItems, setPurchasedItems] = useMMKVString(
    PURCHASED_ITEMS_KEY,
    storage
  );
  const value = purchasedItems ? JSON.parse(purchasedItems) || [] : [];
  const setter = (newValue: PurchasedItem[]) => {
    setPurchasedItems(JSON.stringify(newValue));
  };
  return [value, setter] as const;
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

export async function setHealthCore(data: Partial<HealthCore>): Promise<void> {
  await setItem(HEALTH_CORE_KEY, data);
}

export async function updateHealthCore(
  updates: Partial<HealthCore>
): Promise<void> {
  const currentData = getHealthCore();
  const updatedData = { ...currentData, ...updates };
  await setHealthCore(updatedData);
}

// Migration helper to move from old separate keys to new batched core
export async function migrateToHealthCore(): Promise<void> {
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

export async function migrateManualStepEntries(): Promise<void> {
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
  const migratedEntries: ManualStepEntry[] = existingSteps.map(
    (step: { date: Date; steps: number }) => ({
      date: getDateString(step.date),
      steps: step.steps,
      source: 'manual' as const,
    })
  );

  // Merge with existing manual entries, avoiding duplicates
  const allEntries = [...existingManualSteps, ...migratedEntries];
  const uniqueEntries = allEntries.reduce(
    (acc: ManualStepEntry[], entry: ManualStepEntry) => {
      const existing = acc.find((e: ManualStepEntry) => e.date === entry.date);
      if (!existing) {
        acc.push(entry);
      }
      return acc;
    },
    [] as ManualStepEntry[]
  );

  // Sort by date
  uniqueEntries.sort((a, b) => a.date.localeCompare(b.date));

  await setManualStepsByDay(uniqueEntries);
}

export function clearAllStorage(): void {
  storage.clearAll();
}

export function validateManualStepEntry(
  entry: unknown
): entry is ManualStepEntry {
  // Check if entry is an object
  if (!entry || typeof entry !== 'object') {
    return false;
  }

  const obj = entry as Record<string, unknown>;

  // Check required fields
  if (!obj.date || typeof obj.date !== 'string') {
    return false;
  }

  if (typeof obj.steps !== 'number') {
    return false;
  }

  if (obj.source !== 'manual') {
    return false;
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(obj.date)) {
    return false;
  }

  // Validate steps (non-negative number, reasonable upper limit)
  if (obj.steps < 0) {
    return false;
  }
  if (obj.steps > 100000) {
    return false;
  }

  return true;
}
