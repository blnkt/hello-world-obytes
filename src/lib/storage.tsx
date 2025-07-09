import { MMKV } from 'react-native-mmkv';

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
