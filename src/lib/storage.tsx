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

export function clearAllStorage() {
  storage.clearAll();
}
