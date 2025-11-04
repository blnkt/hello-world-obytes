import { storage } from '@/lib/storage';
import type { DelvingRun } from '@/types/delvers-descent';

import { getProgressionManager } from './progression-manager';

const DELVING_RUNS_KEY = 'delvingRuns';

export class RunQueueManager {
  private runs: DelvingRun[] = [];

  constructor() {
    this.loadRuns();
  }

  /**
   * Generate a run from daily step data
   */
  generateRunFromSteps(date: string, steps: number): DelvingRun {
    const hasStreakBonus = this.calculateStreakBonus(steps);
    const baseEnergy = steps; // 1:1 ratio
    const bonusEnergy = hasStreakBonus ? Math.floor(steps * 0.2) : 0;
    const totalEnergy = baseEnergy + bonusEnergy;

    return {
      id: this.generateRunId(date),
      date,
      steps,
      baseEnergy,
      bonusEnergy,
      totalEnergy,
      hasStreakBonus,
      status: 'queued',
    };
  }

  /**
   * Calculate run energy with streak bonus
   */
  calculateRunEnergy(steps: number, hasStreakBonus: boolean): number {
    const baseEnergy = steps; // 1:1 ratio
    const bonusEnergy = hasStreakBonus ? Math.floor(steps * 0.2) : 0;
    return baseEnergy + bonusEnergy;
  }

  /**
   * Add a run to the queue
   */
  async addRunToQueue(run: DelvingRun): Promise<void> {
    // Check if run already exists for this date
    const existingRun = this.runs.find((r) => r.date === run.date);
    if (existingRun) {
      throw new Error(`Run already exists for date ${run.date}`);
    }

    this.runs.push(run);
    await this.saveRuns();
  }

  /**
   * Remove a run from the queue
   */
  async removeRunFromQueue(runId: string): Promise<void> {
    const index = this.runs.findIndex((r) => r.id === runId);
    if (index === -1) {
      throw new Error(`Run with id ${runId} not found`);
    }

    this.runs.splice(index, 1);
    await this.saveRuns();
  }

  /**
   * Get all queued runs
   */
  getQueuedRuns(): DelvingRun[] {
    return this.runs.filter((run) => run.status === 'queued');
  }

  /**
   * Get all runs (any status)
   */
  getAllRuns(): DelvingRun[] {
    return [...this.runs];
  }

  /**
   * Get a specific run by ID
   */
  getRunById(runId: string): DelvingRun | null {
    return this.runs.find((run) => run.id === runId) || null;
  }

  /**
   * Get runs by status
   */
  getRunsByStatus(status: DelvingRun['status']): DelvingRun[] {
    return this.runs.filter((run) => run.status === status);
  }

  /**
   * Update run status
   * Keeps completed/busted runs in memory (with status) to prevent regenerating runs
   * for dates that have already been processed, but filters them from queue display
   */
  async updateRunStatus(
    runId: string,
    status: DelvingRun['status']
  ): Promise<void> {
    const run = this.getRunById(runId);
    if (!run) {
      throw new Error(`Run with id ${runId} not found`);
    }

    // Update the run status
    // We keep completed/busted runs in this.runs to track that the date has been processed
    // This prevents regenerating runs for dates that have already been completed/busted
    run.status = status;

    await this.saveRuns();
  }

  /**
   * Generate runs for multiple days from step data
   */
  async generateRunsFromStepHistory(
    stepHistory: { date: string; steps: number }[]
  ): Promise<void> {
    const newRuns: DelvingRun[] = [];

    for (const entry of stepHistory) {
      // Skip if run already exists for this date (regardless of status)
      // This prevents regenerating runs for dates that have been processed (completed/busted)
      const existingRun = this.runs.find((r) => r.date === entry.date);
      if (existingRun) {
        continue;
      }

      const run = this.generateRunFromSteps(entry.date, entry.steps);
      newRuns.push(run);
    }

    // Add all new runs to the queue
    this.runs.push(...newRuns);
    await this.saveRuns();
  }

  /**
   * Clear all runs
   */
  async clearAllRuns(): Promise<void> {
    this.runs = [];
    await this.saveRuns();
  }

  /**
   * Get run statistics
   * Uses progression data for completed/busted counts instead of calculating from runs array
   */
  getRunStatistics(): {
    totalRuns: number;
    queuedRuns: number;
    completedRuns: number;
    bustedRuns: number;
    activeRuns: number;
    totalSteps: number;
    averageSteps: number;
  } {
    const queuedRuns = this.runs.filter((r) => r.status === 'queued').length;
    const activeRuns = this.runs.filter((r) => r.status === 'active').length;
    // Only count steps for queued/active runs (not completed/busted)
    const activeAndQueuedRuns = this.runs.filter(
      (r) => r.status === 'queued' || r.status === 'active'
    );
    const totalSteps = activeAndQueuedRuns.reduce(
      (sum, run) => sum + run.steps,
      0
    );
    const currentRuns = activeAndQueuedRuns.length;
    const averageSteps = currentRuns > 0 ? totalSteps / currentRuns : 0;

    // Get progression data for completed/busted counts
    const progressionManager = getProgressionManager();
    const progression = progressionManager.getProgressionData();
    const completedRuns = progression.totalRunsCompleted;
    const bustedRuns = progression.totalRunsBusted;
    // Total runs = active/queued runs in memory + completed/busted from progression
    const totalRuns = completedRuns + bustedRuns + currentRuns;

    return {
      totalRuns,
      queuedRuns,
      completedRuns,
      bustedRuns,
      activeRuns,
      totalSteps,
      averageSteps,
    };
  }

  /**
   * Check if there are any queued runs
   */
  hasQueuedRuns(): boolean {
    return this.getQueuedRuns().length > 0;
  }

  /**
   * Get the oldest queued run
   */
  getOldestQueuedRun(): DelvingRun | null {
    const queuedRuns = this.getQueuedRuns();
    if (queuedRuns.length === 0) {
      return null;
    }

    // Sort by date (oldest first)
    return queuedRuns.sort((a, b) => a.date.localeCompare(b.date))[0];
  }

  /**
   * Get the newest queued run
   */
  getNewestQueuedRun(): DelvingRun | null {
    const queuedRuns = this.getQueuedRuns();
    if (queuedRuns.length === 0) {
      return null;
    }

    // Sort by date (newest first)
    return queuedRuns.sort((a, b) => b.date.localeCompare(a.date))[0];
  }

  /**
   * Calculate streak bonus based on step count
   */
  private calculateStreakBonus(steps: number): boolean {
    // 10,000+ steps = streak bonus
    return steps >= 10000;
  }

  /**
   * Generate a unique run ID
   */
  private generateRunId(date: string): string {
    const timestamp = Date.now();
    return `run-${date}-${timestamp}`;
  }

  /**
   * Load runs from storage
   * Keeps all runs (including completed/busted) to track processed dates
   * They are filtered out when displaying the queue but kept to prevent regeneration
   */
  private loadRuns(): void {
    try {
      const value = storage.getString(DELVING_RUNS_KEY);
      if (value) {
        const loadedRuns = JSON.parse(value) || [];
        // Keep all runs, including completed/busted ones
        // This allows us to check if a date has already been processed
        this.runs = loadedRuns;
      } else {
        this.runs = [];
      }
    } catch (error) {
      console.error('Error loading delving runs:', error);
      this.runs = [];
    }
  }

  /**
   * Save runs to storage
   */
  private async saveRuns(): Promise<void> {
    try {
      storage.set(DELVING_RUNS_KEY, JSON.stringify(this.runs));
    } catch (error) {
      console.error('Error saving delving runs:', error);
      throw error;
    }
  }
}

// Singleton instance
let runQueueManagerInstance: RunQueueManager | null = null;

export const getRunQueueManager = (): RunQueueManager => {
  if (!runQueueManagerInstance) {
    runQueueManagerInstance = new RunQueueManager();
  }
  return runQueueManagerInstance;
};

// Storage functions for direct access
export const getDelvingRuns = (): DelvingRun[] => {
  const manager = getRunQueueManager();
  return manager.getAllRuns();
};

export const addDelvingRun = async (run: DelvingRun): Promise<void> => {
  const manager = getRunQueueManager();
  await manager.addRunToQueue(run);
};

export const removeDelvingRun = async (runId: string): Promise<void> => {
  const manager = getRunQueueManager();
  await manager.removeRunFromQueue(runId);
};

export const updateDelvingRunStatus = async (
  runId: string,
  status: DelvingRun['status']
): Promise<void> => {
  const manager = getRunQueueManager();
  await manager.updateRunStatus(runId, status);
};

export const clearAllDelvingRuns = async (): Promise<void> => {
  const manager = getRunQueueManager();
  await manager.clearAllRuns();
};
