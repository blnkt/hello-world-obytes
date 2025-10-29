import type { DelvingRun } from '@/types/delvers-descent';

import { getRunQueueManager } from './run-queue';

/**
 * HealthKit Integration for Delver's Descent Daily Runs
 *
 * This module extends the existing HealthKit functionality to support
 * the daily runs queue system for Delver's Descent.
 */

export interface DailyStepsData {
  date: string; // YYYY-MM-DD format
  steps: number;
  hasStreakBonus: boolean;
}

export interface StreakBonusData {
  date: string; // YYYY-MM-DD format
  steps: number;
  qualifiesForBonus: boolean;
}

/**
 * Calculate streak bonus eligibility for a given day
 * @param steps Number of steps for the day
 * @returns True if qualifies for 20% bonus (10,000+ steps)
 */
export function calculateStreakBonusEligibility(steps: number): boolean {
  return steps >= 10000;
}

/**
 * Get daily steps data for a specific date
 * @param date Date string in YYYY-MM-DD format
 * @param stepsByDay Array of daily step data from HealthKit
 * @returns DailyStepsData or null if no data for that date
 */
export function getDailyStepsForDate(
  date: string,
  stepsByDay: { date: Date; steps: number }[]
): DailyStepsData | null {
  const targetDate = new Date(date);
  const entry = stepsByDay.find((day) => {
    const dayDate = new Date(day.date);
    return (
      dayDate.getFullYear() === targetDate.getFullYear() &&
      dayDate.getMonth() === targetDate.getMonth() &&
      dayDate.getDate() === targetDate.getDate()
    );
  });

  if (!entry) {
    return null;
  }

  return {
    date,
    steps: entry.steps,
    hasStreakBonus: calculateStreakBonusEligibility(entry.steps),
  };
}

/**
 * Calculate streak bonus data for multiple days
 * @param stepsByDay Array of daily step data from HealthKit
 * @returns Array of StreakBonusData
 */
export function calculateStreakBonusData(
  stepsByDay: { date: Date | string; steps: number }[]
): StreakBonusData[] {
  return stepsByDay.map((day) => {
    // Handle cases where date might be string or undefined
    const date = day.date || new Date();
    const dateStr = formatDateForDelving(date);
    return {
      date: dateStr,
      steps: day.steps,
      qualifiesForBonus: calculateStreakBonusEligibility(day.steps),
    };
  });
}

/**
 * Format a Date object to YYYY-MM-DD string for Delver's Descent
 * @param date Date object or string to format
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateForDelving(date: Date | string | undefined): string {
  // Handle undefined or null
  if (!date) {
    const today = new Date();
    return formatDateForDelving(today);
  }

  // If it's already a string, return it if it's in the correct format
  if (typeof date === 'string') {
    // Check if it's already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    // Try to parse the string as a date
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      // Invalid date, return today's date
      const today = new Date();
      return formatDateForDelving(today);
    }
    date = parsedDate;
  }

  // Now date should be a Date object
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generate delving runs from HealthKit step history
 * @param stepsByDay Array of daily step data from HealthKit
 * @returns Promise<void>
 */
export async function generateDelvingRunsFromStepHistory(
  stepsByDay: { date: Date | string; steps: number }[]
): Promise<void> {
  const runQueueManager = getRunQueueManager();

  // Convert HealthKit data to the format expected by run queue manager
  const stepHistory = stepsByDay.map((day) => ({
    date: formatDateForDelving(day.date || new Date()),
    steps: day.steps,
  }));

  // Calculate streak bonus dates
  const streakBonusData = calculateStreakBonusData(stepsByDay);
  const _streakDates = new Set(
    streakBonusData
      .filter((data) => data.qualifiesForBonus)
      .map((data) => data.date)
  );

  // Generate runs from step history
  await runQueueManager.generateRunsFromStepHistory(stepHistory);
}

/**
 * Get daily steps data for the current date
 * @param stepsByDay Array of daily step data from HealthKit
 * @returns DailyStepsData or null if no data for today
 */
export function getTodayStepsData(
  stepsByDay: { date: Date; steps: number }[]
): DailyStepsData | null {
  const today = new Date();
  const todayStr = formatDateForDelving(today);

  // Find entry that matches today's date string
  const entry = stepsByDay.find((day) => {
    const dayStr = formatDateForDelving(day.date);
    return dayStr === todayStr;
  });

  if (!entry) {
    return null;
  }

  return {
    date: todayStr,
    steps: entry.steps,
    hasStreakBonus: calculateStreakBonusEligibility(entry.steps),
  };
}

/**
 * Check if a specific date has a queued delving run
 * @param date Date string in YYYY-MM-DD format
 * @returns True if a run exists for that date
 */
export function hasQueuedRunForDate(date: string): boolean {
  const runQueueManager = getRunQueueManager();
  const allRuns = runQueueManager.getAllRuns();
  return allRuns.some((run) => run.date === date);
}

/**
 * Get the most recent queued delving run
 * @returns DelvingRun or null if no queued runs
 */
export function getMostRecentQueuedRun(): DelvingRun | null {
  const runQueueManager = getRunQueueManager();
  return runQueueManager.getNewestQueuedRun();
}

/**
 * Get the oldest queued delving run
 * @returns DelvingRun or null if no queued runs
 */
export function getOldestQueuedRun(): DelvingRun | null {
  const runQueueManager = getRunQueueManager();
  return runQueueManager.getOldestQueuedRun();
}

/**
 * Get all queued delving runs
 * @returns Array of DelvingRun objects
 */
export function getAllQueuedRuns(): DelvingRun[] {
  const runQueueManager = getRunQueueManager();
  return runQueueManager.getQueuedRuns();
}

/**
 * Get delving run statistics
 * @returns Object with run statistics
 */
export function getDelvingRunStatistics() {
  const runQueueManager = getRunQueueManager();
  return runQueueManager.getRunStatistics();
}

/**
 * Check if there are any queued delving runs
 * @returns True if there are queued runs
 */
export function hasQueuedDelvingRuns(): boolean {
  const runQueueManager = getRunQueueManager();
  return runQueueManager.hasQueuedRuns();
}

/**
 * Sync HealthKit data with delving runs queue
 * This function should be called whenever HealthKit data is updated
 * @param stepsByDay Array of daily step data from HealthKit
 * @returns Promise<void>
 */
export async function syncHealthKitWithDelvingRuns(
  stepsByDay: { date: Date; steps: number }[]
): Promise<void> {
  try {
    await generateDelvingRunsFromStepHistory(stepsByDay);
  } catch (error) {
    console.error('Error syncing HealthKit with delving runs:', error);
    throw error;
  }
}

/**
 * Get energy calculation for a specific date's steps
 * @param steps Number of steps
 * @param hasStreakBonus Whether streak bonus applies
 * @returns Total energy for the run
 */
export function calculateRunEnergyFromSteps(
  steps: number,
  hasStreakBonus: boolean
): number {
  const runQueueManager = getRunQueueManager();
  return runQueueManager.calculateRunEnergy(steps, hasStreakBonus);
}

/**
 * Validate daily steps data
 * @param data DailyStepsData to validate
 * @returns True if valid
 */
export function validateDailyStepsData(data: DailyStepsData): boolean {
  if (!data || typeof data !== 'object') {
    return false;
  }

  if (!data.date || typeof data.date !== 'string') {
    return false;
  }

  if (typeof data.steps !== 'number' || data.steps < 0) {
    return false;
  }

  if (typeof data.hasStreakBonus !== 'boolean') {
    return false;
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(data.date)) {
    return false;
  }

  return true;
}

/**
 * Get date range for delving runs
 * @param startDate Start date (inclusive)
 * @param endDate End date (inclusive)
 * @param stepsByDay Array of daily step data from HealthKit
 * @returns Array of DailyStepsData for the date range
 */
export function getDailyStepsForDateRange(
  startDate: string,
  endDate: string,
  stepsByDay: { date: Date; steps: number }[]
): DailyStepsData[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const results: DailyStepsData[] = [];

  for (
    let current = new Date(start);
    current <= end;
    current.setDate(current.getDate() + 1)
  ) {
    const dateStr = formatDateForDelving(current);
    const data = getDailyStepsForDate(dateStr, stepsByDay);
    if (data) {
      results.push(data);
    }
  }

  return results;
}

/**
 * Check if a date is in the past (not today or future)
 * @param date Date string in YYYY-MM-DD format
 * @returns True if the date is in the past
 */
export function isDateInPast(date: string): boolean {
  const targetDate = new Date(date + 'T00:00:00.000Z'); // Parse as UTC
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0); // Set to UTC midnight
  return targetDate < today;
}

/**
 * Get the number of days between two dates
 * @param startDate Start date string
 * @param endDate End date string
 * @returns Number of days between dates
 */
export function getDaysBetweenDates(
  startDate: string,
  endDate: string
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
