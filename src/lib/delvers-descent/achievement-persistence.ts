/**
 * Achievement Persistence System
 * Handles saving and loading achievement progress using MMKV storage
 */

import { getItem, setItem } from '@/lib/storage';

import { type AchievementManager } from './achievement-manager';
import type { AchievementEvent } from './achievement-models';
import { type AchievementDefinition } from './achievement-types';

const ACHIEVEMENT_STORAGE_KEY = 'delvers-descent-achievements';
const ACHIEVEMENT_EVENTS_STORAGE_KEY = 'delvers-descent-achievement-events';

export interface AchievementPersistenceData {
  achievements: AchievementDefinition[];
  lastSaved: Date;
}

/**
 * Save achievement state to persistent storage
 */
export async function saveAchievements(
  manager: AchievementManager
): Promise<void> {
  const achievements = manager.getAllAchievements();
  const data: AchievementPersistenceData = {
    achievements,
    lastSaved: new Date(),
  };

  await setItem(ACHIEVEMENT_STORAGE_KEY, JSON.stringify(data));
}

/**
 * Load achievement state from persistent storage
 */
export async function loadAchievements(): Promise<AchievementDefinition[]> {
  const data = await getItem<string>(ACHIEVEMENT_STORAGE_KEY);
  if (!data || data === '') {
    return [];
  }

  try {
    const parsed = JSON.parse(data) as AchievementPersistenceData;
    return parsed.achievements || [];
  } catch (error) {
    return [];
  }
}

/**
 * Clear achievement state from persistent storage
 */
export async function clearAchievements(): Promise<void> {
  await setItem(
    ACHIEVEMENT_STORAGE_KEY,
    JSON.stringify({ achievements: [], lastSaved: new Date() })
  );
}

/**
 * Save achievement events to persistent storage
 */
export async function saveAchievementEvents(
  events: AchievementEvent[]
): Promise<void> {
  const data = JSON.stringify(events);
  await setItem(ACHIEVEMENT_EVENTS_STORAGE_KEY, data);
}

/**
 * Load achievement events from persistent storage
 */
export async function loadAchievementEvents(): Promise<AchievementEvent[]> {
  const data = await getItem<string>(ACHIEVEMENT_EVENTS_STORAGE_KEY);
  if (!data || data === '') {
    return [];
  }

  try {
    const events = JSON.parse(data) as AchievementEvent[];
    return events || [];
  } catch (error) {
    return [];
  }
}
