import { getItem, setItem } from '@/lib/storage';
import type { ProgressionData } from '@/types/delvers-descent';

const PROGRESSION_DATA_KEY = 'delvers_descent_progression';

export class ProgressionManager {
  private progressionData: ProgressionData;

  constructor() {
    this.progressionData = this.loadState();
  }

  /**
   * Load progression data from storage
   */
  private loadState(): ProgressionData {
    try {
      const saved = getItem<ProgressionData>(PROGRESSION_DATA_KEY);
      if (saved) {
        return {
          allTimeDeepestDepth: saved.allTimeDeepestDepth || 0,
          totalRunsCompleted: saved.totalRunsCompleted || 0,
          totalRunsBusted: saved.totalRunsBusted || 0,
          totalRunsAttempted:
            (saved.totalRunsCompleted || 0) + (saved.totalRunsBusted || 0),
        };
      }
    } catch (error) {
      console.error('Failed to load progression data:', error);
    }

    return {
      allTimeDeepestDepth: 0,
      totalRunsCompleted: 0,
      totalRunsBusted: 0,
      totalRunsAttempted: 0,
    };
  }

  /**
   * Save progression data to storage
   */
  private async saveState(): Promise<void> {
    try {
      // Recalculate totalRunsAttempted before saving
      this.progressionData.totalRunsAttempted =
        this.progressionData.totalRunsCompleted +
        this.progressionData.totalRunsBusted;
      await setItem(PROGRESSION_DATA_KEY, this.progressionData);
    } catch (error) {
      console.error('Failed to save progression data:', error);
      throw error;
    }
  }

  /**
   * Update deepest depth if the new depth is greater
   */
  async updateDeepestDepth(depth: number): Promise<void> {
    if (depth > this.progressionData.allTimeDeepestDepth) {
      this.progressionData.allTimeDeepestDepth = depth;
      await this.saveState();
    }
  }

  /**
   * Increment completed runs count
   */
  async incrementCompletedRuns(): Promise<void> {
    this.progressionData.totalRunsCompleted += 1;
    await this.saveState();
  }

  /**
   * Increment busted runs count
   */
  async incrementBustedRuns(): Promise<void> {
    this.progressionData.totalRunsBusted += 1;
    await this.saveState();
  }

  /**
   * Get current progression data
   */
  getProgressionData(): ProgressionData {
    // Recalculate totalRunsAttempted
    this.progressionData.totalRunsAttempted =
      this.progressionData.totalRunsCompleted +
      this.progressionData.totalRunsBusted;
    return { ...this.progressionData };
  }

  /**
   * Process a completed run - updates depth and increments completed count
   */
  async processRunCompletion(depth: number): Promise<void> {
    await this.updateDeepestDepth(depth);
    await this.incrementCompletedRuns();
  }

  /**
   * Process a busted run - updates depth (if applicable) and increments busted count
   */
  async processRunBust(depth: number): Promise<void> {
    await this.updateDeepestDepth(depth);
    await this.incrementBustedRuns();
  }
}

// Singleton instance
let progressionManagerInstance: ProgressionManager | null = null;

/**
 * Get the singleton ProgressionManager instance
 */
export function getProgressionManager(): ProgressionManager {
  if (!progressionManagerInstance) {
    progressionManagerInstance = new ProgressionManager();
  }
  return progressionManagerInstance;
}
