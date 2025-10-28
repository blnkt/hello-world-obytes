/**
 * Achievement Type Definitions
 * Defines all achievement categories and types for Delver's Descent
 */

export type AchievementCategory =
  | 'milestone'
  | 'risk'
  | 'efficiency'
  | 'exploration'
  | 'collection'
  | 'streak';

export type AchievementRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary';

export interface AchievementDefinition {
  id: string;
  category: AchievementCategory;
  title: string;
  description: string;
  rarity: AchievementRarity;
  requirements: AchievementRequirements;
  rewards?: AchievementReward[];
  unlocked: boolean;
  progress?: AchievementProgress;
}

export interface AchievementRequirements {
  type:
    | 'depth'
    | 'collection'
    | 'streak'
    | 'risk'
    | 'efficiency'
    | 'exploration'
    | 'custom';
  threshold: number;
  additionalCriteria?: Record<string, unknown>;
}

export interface AchievementReward {
  type: 'energy' | 'items' | 'bonus' | 'title';
  amount?: number;
  description: string;
}

export interface AchievementProgress {
  current: number;
  target: number;
  percentage: number;
}

/**
 * Milestone Achievements - Depth-based achievements
 */
export const MILESTONE_ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'milestone-depth-5',
    category: 'milestone',
    title: 'Into the Depths',
    description: 'Reach depth level 5',
    rarity: 'common',
    requirements: { type: 'depth', threshold: 5 },
    unlocked: false,
  },
  {
    id: 'milestone-depth-10',
    category: 'milestone',
    title: 'Delver',
    description: 'Reach depth level 10',
    rarity: 'uncommon',
    requirements: { type: 'depth', threshold: 10 },
    unlocked: false,
  },
  {
    id: 'milestone-depth-15',
    category: 'milestone',
    title: 'Deep Delver',
    description: 'Reach depth level 15',
    rarity: 'rare',
    requirements: { type: 'depth', threshold: 15 },
    unlocked: false,
  },
  {
    id: 'milestone-depth-20',
    category: 'milestone',
    title: 'Master Delver',
    description: 'Reach depth level 20',
    rarity: 'epic',
    requirements: { type: 'depth', threshold: 20 },
    unlocked: false,
  },
  {
    id: 'milestone-depth-25',
    category: 'milestone',
    title: 'Legendary Delver',
    description: 'Reach depth level 25',
    rarity: 'legendary',
    requirements: { type: 'depth', threshold: 25 },
    unlocked: false,
  },
];

/**
 * Collection Achievements - Set completion achievements
 */
export const COLLECTION_ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'collection-first-set',
    category: 'collection',
    title: 'First Steps',
    description: 'Complete your first collection set',
    rarity: 'common',
    requirements: { type: 'collection', threshold: 1 },
    unlocked: false,
  },
  {
    id: 'collection-5-sets',
    category: 'collection',
    title: 'Collector',
    description: 'Complete 5 collection sets',
    rarity: 'uncommon',
    requirements: { type: 'collection', threshold: 5 },
    unlocked: false,
  },
  {
    id: 'collection-10-sets',
    category: 'collection',
    title: 'Master Collector',
    description: 'Complete 10 collection sets',
    rarity: 'rare',
    requirements: { type: 'collection', threshold: 10 },
    unlocked: false,
  },
  {
    id: 'collection-legendary',
    category: 'collection',
    title: 'Legends Only',
    description: 'Complete a legendary collection set',
    rarity: 'epic',
    requirements: { type: 'custom', threshold: 1 },
    unlocked: false,
  },
];

/**
 * Streak Achievements - Daily play streaks
 */
export const STREAK_ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'streak-3-days',
    category: 'streak',
    title: 'Consistent',
    description: 'Maintain a 3-day play streak',
    rarity: 'common',
    requirements: { type: 'streak', threshold: 3 },
    unlocked: false,
  },
  {
    id: 'streak-7-days',
    category: 'streak',
    title: 'Dedicated',
    description: 'Maintain a 7-day play streak',
    rarity: 'uncommon',
    requirements: { type: 'streak', threshold: 7 },
    unlocked: false,
  },
  {
    id: 'streak-14-days',
    category: 'streak',
    title: 'Committed',
    description: 'Maintain a 14-day play streak',
    rarity: 'rare',
    requirements: { type: 'streak', threshold: 14 },
    unlocked: false,
  },
  {
    id: 'streak-30-days',
    category: 'streak',
    title: 'Unbreakable',
    description: 'Maintain a 30-day play streak',
    rarity: 'epic',
    requirements: { type: 'streak', threshold: 30 },
    unlocked: false,
  },
];

/**
 * Risk Achievements - High-risk decisions and outcomes
 */
export const RISK_ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'risk-survive-5-energys',
    category: 'risk',
    title: 'Living on the Edge',
    description: 'Survive a run with less than 5 energy remaining',
    rarity: 'rare',
    requirements: { type: 'risk', threshold: 5 },
    unlocked: false,
  },
  {
    id: 'risk-cashout-deep',
    category: 'risk',
    title: 'Deep Reward',
    description: 'Successfully cash out from depth 15 or deeper',
    rarity: 'epic',
    requirements: {
      type: 'depth',
      threshold: 15,
      additionalCriteria: { cashOut: true },
    },
    unlocked: false,
  },
];

/**
 * Efficiency Achievements - Optimal energy usage
 */
export const EFFICIENCY_ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'efficiency-perfect-run',
    category: 'efficiency',
    title: 'Efficiency Master',
    description: 'Complete a run using less than 10% excess energy',
    rarity: 'rare',
    requirements: { type: 'efficiency', threshold: 0.1 },
    unlocked: false,
  },
];

/**
 * Exploration Achievements - Shortcuts and regions
 */
export const EXPLORATION_ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'exploration-first-shortcut',
    category: 'exploration',
    title: 'Path Finder',
    description: 'Discover your first shortcut',
    rarity: 'common',
    requirements: { type: 'exploration', threshold: 1 },
    unlocked: false,
  },
  {
    id: 'exploration-all-regions',
    category: 'exploration',
    title: 'Globe Trotter',
    description: 'Unlock all starting regions',
    rarity: 'epic',
    requirements: { type: 'custom', threshold: 5 },
    unlocked: false,
  },
];

/**
 * All achievements combined
 */
export const ALL_ACHIEVEMENTS: AchievementDefinition[] = [
  ...MILESTONE_ACHIEVEMENTS,
  ...COLLECTION_ACHIEVEMENTS,
  ...STREAK_ACHIEVEMENTS,
  ...RISK_ACHIEVEMENTS,
  ...EFFICIENCY_ACHIEVEMENTS,
  ...EXPLORATION_ACHIEVEMENTS,
];
