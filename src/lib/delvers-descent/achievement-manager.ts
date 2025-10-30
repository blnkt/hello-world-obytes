/**
 * Achievement Manager
 * Tracks player achievements, processes events, and manages unlock status
 */

import {
  AchievementDataModel,
  type AchievementEvent,
  type AchievementProgressUpdate,
  type AchievementState,
  type AchievementStatistics,
} from './achievement-models';
import { loadAchievements } from './achievement-persistence';
import type { AchievementDefinition } from './achievement-types';

export class AchievementManager {
  private achievements: Map<string, AchievementDataModel>;
  private definitions: AchievementDefinition[];

  constructor(definitions: AchievementDefinition[]) {
    this.definitions = definitions;
    this.achievements = new Map();

    definitions.forEach((def) => {
      this.achievements.set(def.id, new AchievementDataModel(def));
    });
  }

  /**
   * Load saved achievement state from persisted data
   */
  async loadSavedState(): Promise<void> {
    try {
      const savedAchievements = await loadAchievements();

      if (savedAchievements && savedAchievements.length > 0) {
        // Restore each achievement model with saved state
        savedAchievements.forEach((saved) => {
          const model = this.achievements.get(saved.id);
          if (model) {
            // Convert saved AchievementDefinition to AchievementState
            const savedState: AchievementState = {
              ...saved,
              unlocked: saved.unlocked || false,
              progress: saved.progress || {
                current: 0,
                target: saved.requirements?.threshold || 1,
                percentage: 0,
              },
            };
            model.restoreState(savedState);
          }
        });
      }
    } catch (error) {
      console.error('Failed to load saved achievement state:', error);
    }
  }

  /**
   * Restore state directly from saved AchievementDefinition[]
   */
  restoreState(savedAchievements: AchievementDefinition[]): void {
    savedAchievements.forEach((saved) => {
      const model = this.achievements.get(saved.id);
      if (model) {
        // We need to restore the state - but AchievementDataModel doesn't expose setState
        // So we'll process events to restore progress instead
        if (saved.unlocked && saved.progress) {
          const requirements = saved.requirements;
          if (
            requirements.type === 'depth' &&
            saved.progress.current >= requirements.threshold
          ) {
            // Process the depth event
            this.processEvent({
              type: 'depth_reached',
              data: {
                depth: saved.progress.current,
                cashOut: requirements.additionalCriteria?.cashOut === true,
              },
              timestamp: new Date(),
            });
          }
          // For collection achievements, we can't easily restore without knowing which sets
          // This is a limitation - we'd need to store which sets were completed
        }
      }
    });
  }

  getAchievements(): AchievementState[] {
    return Array.from(this.achievements.values()).map((model) =>
      model.getState()
    );
  }

  getAchievement(id: string): AchievementState | undefined {
    const model = this.achievements.get(id);
    return model?.getState();
  }

  getUnlockedAchievements(): AchievementState[] {
    return this.getAchievements().filter((achievement) => achievement.unlocked);
  }

  getLockedAchievements(): AchievementState[] {
    return this.getAchievements().filter(
      (achievement) => !achievement.unlocked
    );
  }

  getAllAchievements(): AchievementDefinition[] {
    return this.getAchievements().map((state) => {
      const original = this.definitions.find((d) => d.id === state.id);
      if (!original) {
        throw new Error(`Achievement ${state.id} not found in definitions`);
      }
      return {
        ...original,
        unlocked: state.unlocked,
        progress: state.progress,
      };
    });
  }

  processEvent(event: AchievementEvent): AchievementProgressUpdate[] {
    const updates: AchievementProgressUpdate[] = [];

    this.achievements.forEach((model) => {
      const result = model.checkRequirement(event);
      if (result.matched && !result.unlocked) {
        const progress = model.getProgress();
        // For depth/streak: progress is set to threshold when reached
        // For collection: progress is incremented by 1
        const newProgress = Math.max(progress.current + 1, progress.target);
        const update = model.updateProgress(newProgress);
        updates.push(update);
      } else if (result.matched && result.unlocked) {
        // Achievement already unlocked - this is OK, just continue
        // This can happen when we process events for already-unlocked achievements
      }
    });

    return updates;
  }

  getStatistics(): AchievementStatistics {
    const achievements = this.getAchievements();
    const totalAchievements = achievements.length;
    const unlockedAchievements = achievements.filter((a) => a.unlocked).length;
    const lockedAchievements = totalAchievements - unlockedAchievements;

    const byCategory = this.calculateCategoryStatistics(achievements);
    const byRarity = this.calculateRarityStatistics(achievements);

    this.calculateCompletionRates(byCategory);
    this.calculateCompletionRates(byRarity);

    return {
      totalAchievements,
      unlockedAchievements,
      lockedAchievements,
      byCategory,
      byRarity,
      completionRate: (unlockedAchievements / totalAchievements) * 100,
    };
  }

  private calculateCategoryStatistics(achievements: AchievementState[]): Record<
    string,
    {
      category: string;
      total: number;
      unlocked: number;
      locked: number;
      completionRate: number;
    }
  > {
    const byCategory: Record<
      string,
      {
        category: string;
        total: number;
        unlocked: number;
        locked: number;
        completionRate: number;
      }
    > = {};

    achievements.forEach((achievement) => {
      if (!byCategory[achievement.category]) {
        byCategory[achievement.category] = {
          category: achievement.category,
          total: 0,
          unlocked: 0,
          locked: 0,
          completionRate: 0,
        };
      }
      byCategory[achievement.category].total++;
      if (achievement.unlocked) {
        byCategory[achievement.category].unlocked++;
      } else {
        byCategory[achievement.category].locked++;
      }
    });

    return byCategory;
  }

  private calculateRarityStatistics(achievements: AchievementState[]): Record<
    string,
    {
      rarity: string;
      total: number;
      unlocked: number;
      locked: number;
      completionRate: number;
    }
  > {
    const byRarity: Record<
      string,
      {
        rarity: string;
        total: number;
        unlocked: number;
        locked: number;
        completionRate: number;
      }
    > = {};

    achievements.forEach((achievement) => {
      if (!byRarity[achievement.rarity]) {
        byRarity[achievement.rarity] = {
          rarity: achievement.rarity,
          total: 0,
          unlocked: 0,
          locked: 0,
          completionRate: 0,
        };
      }
      byRarity[achievement.rarity].total++;
      if (achievement.unlocked) {
        byRarity[achievement.rarity].unlocked++;
      } else {
        byRarity[achievement.rarity].locked++;
      }
    });

    return byRarity;
  }

  private calculateCompletionRates(
    stats: Record<
      string,
      { total: number; unlocked: number; completionRate: number }
    >
  ): void {
    Object.values(stats).forEach((stat) => {
      stat.completionRate = (stat.unlocked / stat.total) * 100;
    });
  }
}
