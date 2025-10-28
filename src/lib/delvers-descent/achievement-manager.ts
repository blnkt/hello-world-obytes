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
