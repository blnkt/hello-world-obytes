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

export async function addScenarioToHistory(scenarioHistory: any) {
  const history = getScenarioHistory();
  history.unshift(scenarioHistory); // Add to beginning of array
  await setItem(SCENARIO_HISTORY_KEY, history);
}

export async function clearScenarioHistory() {
  await removeItem(SCENARIO_HISTORY_KEY);
}
