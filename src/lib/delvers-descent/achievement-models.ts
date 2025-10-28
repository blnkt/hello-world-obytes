/**
 * Achievement Data Models and Interfaces
 * Defines data structures for tracking achievements, progress, and state
 */

import type {
  AchievementDefinition,
  AchievementProgress,
  AchievementRequirements,
} from './achievement-types';

export interface AchievementState extends AchievementDefinition {
  unlocked: boolean;
  unlockedAt?: Date;
  progress: AchievementProgress;
}

export interface AchievementTrackingData {
  achievementId: string;
  currentProgress: number;
  targetProgress: number;
  lastUpdated: Date;
}

export interface AchievementEvent {
  type:
    | 'depth_reached'
    | 'collection_completed'
    | 'streak_milestone'
    | 'risk_taken'
    | 'efficiency_achieved'
    | 'exploration';
  data: AchievementEventData;
  timestamp: Date;
}

export interface AchievementEventData {
  depth?: number;
  collectionSetId?: string;
  streakDays?: number;
  energyRemaining?: number;
  shortcutId?: string;
  regionId?: string;
  efficiency?: number;
  cashOut?: boolean;
}

export interface AchievementUnlockEvent {
  achievementId: string;
  achievement: AchievementState;
  timestamp: Date;
}

export interface AchievementProgressUpdate {
  achievementId: string;
  previousProgress: AchievementProgress;
  newProgress: AchievementProgress;
  unlocked: boolean;
}

export interface UserAchievementData {
  userId: string;
  achievements: Map<string, AchievementState>;
  unlockedAchievements: string[];
  totalUnlocked: number;
  totalAchievements: number;
  lastUpdated: Date;
}

export interface AchievementStatistics {
  totalAchievements: number;
  unlockedAchievements: number;
  lockedAchievements: number;
  byCategory: Record<string, CategoryStatistics>;
  byRarity: Record<string, RarityStatistics>;
  completionRate: number;
}

export interface CategoryStatistics {
  category: string;
  total: number;
  unlocked: number;
  locked: number;
  completionRate: number;
}

export interface RarityStatistics {
  rarity: string;
  total: number;
  unlocked: number;
  locked: number;
  completionRate: number;
}

export interface AchievementQuery {
  category?: string;
  rarity?: string;
  unlocked?: boolean;
  minProgress?: number;
}

export interface AchievementFilterOptions {
  categories?: string[];
  rarities?: string[];
  unlocked?: boolean;
  unlockedOnly?: boolean;
  lockedOnly?: boolean;
  sortBy?: 'title' | 'progress' | 'rarity' | 'category' | 'unlockedDate';
  sortOrder?: 'asc' | 'desc';
}

export interface CheckAchievementResult {
  achievementId: string;
  matched: boolean;
  progressUpdated: boolean;
  unlocked: boolean;
  previousProgress?: AchievementProgress;
}

export class AchievementDataModel {
  private achievementId: string;
  private definition: AchievementDefinition;
  private state: AchievementState;

  constructor(definition: AchievementDefinition) {
    this.achievementId = definition.id;
    this.definition = definition;
    this.state = {
      ...definition,
      unlocked: false,
      progress: {
        current: 0,
        target: definition.requirements.threshold,
        percentage: 0,
      },
    };
  }

  getState(): AchievementState {
    return this.state;
  }

  getProgress(): AchievementProgress {
    return this.state.progress;
  }

  updateProgress(newProgress: number): AchievementProgressUpdate {
    const previousProgress = { ...this.state.progress };
    const wasUnlocked = this.state.unlocked;

    this.state.progress = {
      current: Math.min(newProgress, this.state.progress.target),
      target: this.state.progress.target,
      percentage: Math.min(
        (newProgress / this.state.progress.target) * 100,
        100
      ),
    };

    const nowUnlocked =
      this.state.progress.current >= this.state.progress.target;

    if (nowUnlocked && !wasUnlocked) {
      this.state.unlocked = true;
      this.state.unlockedAt = new Date();
    }

    return {
      achievementId: this.achievementId,
      previousProgress,
      newProgress: this.state.progress,
      unlocked: nowUnlocked && !wasUnlocked,
    };
  }

  checkRequirement(event: AchievementEvent): CheckAchievementResult {
    const { type, data } = event;
    const { requirements } = this.definition;

    let matched = false;

    switch (requirements.type) {
      case 'depth':
        // For depth achievements, unlock all achievements where
        // current depth >= required threshold
        matched =
          type === 'depth_reached' &&
          data.depth !== undefined &&
          data.depth >= requirements.threshold;

        // Check additional criteria if present
        if (matched && requirements.additionalCriteria?.cashOut === true) {
          matched = data.cashOut === true;
        }
        break;
      case 'collection':
        // For collection achievements, always match on completion
        // Progress will be tracked by count
        matched = type === 'collection_completed';
        break;
      case 'streak':
        // For streak achievements, unlock all achievements where
        // current streak >= required threshold
        matched =
          type === 'streak_milestone' &&
          data.streakDays !== undefined &&
          data.streakDays >= requirements.threshold;
        break;
      case 'risk':
        matched =
          type === 'risk_taken' &&
          this.checkRiskRequirement(data, requirements);
        break;
      case 'efficiency':
        matched =
          type === 'efficiency_achieved' &&
          data.efficiency !== undefined &&
          data.efficiency <= requirements.threshold;
        break;
      case 'exploration':
        matched = type === 'exploration' && requirements.threshold === 1;
        break;
      case 'custom':
        matched = this.checkCustomRequirement(event, requirements);
        break;
    }

    const progressUpdated = matched && !this.state.unlocked;
    const unlocked = this.state.unlocked;

    return {
      achievementId: this.achievementId,
      matched,
      progressUpdated,
      unlocked,
      previousProgress: progressUpdated ? this.state.progress : undefined,
    };
  }

  private checkRiskRequirement(
    data: AchievementEventData,
    requirements: AchievementRequirements
  ): boolean {
    const { energyRemaining } = data;
    if (requirements.threshold === 5 && energyRemaining !== undefined) {
      return energyRemaining < requirements.threshold;
    }
    return false;
  }

  private checkCustomRequirement(
    event: AchievementEvent,
    requirements: AchievementRequirements
  ): boolean {
    if (requirements.additionalCriteria) {
      if (requirements.additionalCriteria.cashOut === true) {
        // This is the risk-cashout-deep achievement
        // It requires depth >= 15 AND cashOut === true
        if (event.data.depth !== undefined && event.data.cashOut === true) {
          return event.data.depth >= requirements.threshold;
        }
        return false;
      }
    }
    return false;
  }
}
