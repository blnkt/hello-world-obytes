import { MMKV } from 'react-native-mmkv';
import { useMMKVString } from 'react-native-mmkv';

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

export function clearAllStorage() {
  storage.clearAll();
}
