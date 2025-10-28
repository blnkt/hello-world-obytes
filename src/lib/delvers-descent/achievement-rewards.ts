/**
 * Achievement Rewards System
 * Handles granting and tracking rewards when achievements are unlocked
 */

import {
  type AchievementDefinition,
  type AchievementReward,
} from './achievement-types';

export interface RewardGrantResult {
  achievementId: string;
  rewards: AchievementReward[];
  granted: boolean;
}

export interface TotalRewardsGranted {
  energy: number;
  items: string[];
  bonuses: string[];
  titles: string[];
}

export class AchievementRewardManager {
  private grantedRewards: Map<string, RewardGrantResult>;

  constructor() {
    this.grantedRewards = new Map();
  }

  /**
   * Process reward for unlocked achievement
   */
  grantRewardsForAchievement(
    achievement: AchievementDefinition
  ): RewardGrantResult {
    const achievementId = achievement.id;

    // Check if rewards already granted
    if (this.grantedRewards.has(achievementId)) {
      return this.grantedRewards.get(achievementId)!;
    }

    const rewards = achievement.rewards || [];
    const result: RewardGrantResult = {
      achievementId,
      rewards,
      granted: rewards.length > 0,
    };

    // Store granted rewards
    this.grantedRewards.set(achievementId, result);

    return result;
  }

  /**
   * Get all rewards granted so far
   */
  getTotalRewards(): TotalRewardsGranted {
    const total: TotalRewardsGranted = {
      energy: 0,
      items: [],
      bonuses: [],
      titles: [],
    };

    this.grantedRewards.forEach((result) => {
      result.rewards.forEach((reward) => {
        switch (reward.type) {
          case 'energy':
            total.energy += reward.amount || 0;
            break;
          case 'items':
            if (reward.description) {
              total.items.push(reward.description);
            }
            break;
          case 'bonus':
            if (reward.description) {
              total.bonuses.push(reward.description);
            }
            break;
          case 'title':
            if (reward.description) {
              total.titles.push(reward.description);
            }
            break;
        }
      });
    });

    return total;
  }

  /**
   * Check if specific reward has been granted
   */
  hasRewardBeenGranted(achievementId: string): boolean {
    return this.grantedRewards.has(achievementId);
  }

  /**
   * Get rewards for specific achievement
   */
  getRewardsForAchievement(
    achievementId: string
  ): RewardGrantResult | undefined {
    return this.grantedRewards.get(achievementId);
  }

  /**
   * Clear all granted rewards (for testing or reset)
   */
  clearRewards(): void {
    this.grantedRewards.clear();
  }
}
