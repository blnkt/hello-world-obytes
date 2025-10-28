import { AchievementRewardManager } from './achievement-rewards';
import { type AchievementDefinition } from './achievement-types';

describe('AchievementRewardManager', () => {
  let manager: AchievementRewardManager;

  beforeEach(() => {
    manager = new AchievementRewardManager();
  });

  describe('Reward Granting', () => {
    it('should grant rewards for achievement with energy reward', () => {
      const achievement: AchievementDefinition = {
        id: 'test-achievement',
        category: 'milestone',
        title: 'Test Achievement',
        description: 'Test description',
        rarity: 'common',
        requirements: { type: 'depth', threshold: 5 },
        rewards: [{ type: 'energy', amount: 100, description: '100 energy' }],
        unlocked: false,
      };

      const result = manager.grantRewardsForAchievement(achievement);
      expect(result.granted).toBe(true);
      expect(result.rewards).toHaveLength(1);
      expect(result.rewards[0].type).toBe('energy');
      expect(result.rewards[0].amount).toBe(100);
    });

    it('should grant rewards for achievement with item reward', () => {
      const achievement: AchievementDefinition = {
        id: 'test-item',
        category: 'collection',
        title: 'Collector',
        description: 'Collect an item',
        rarity: 'uncommon',
        requirements: { type: 'collection', threshold: 1 },
        rewards: [
          { type: 'items', description: 'Rare Artifact' },
          { type: 'items', description: 'Ancient Scroll' },
        ],
        unlocked: false,
      };

      const result = manager.grantRewardsForAchievement(achievement);
      expect(result.granted).toBe(true);
      expect(result.rewards).toHaveLength(2);
      expect(result.rewards[0].type).toBe('items');
      expect(result.rewards[0].description).toBe('Rare Artifact');
    });

    it('should grant rewards for achievement with bonus reward', () => {
      const achievement: AchievementDefinition = {
        id: 'test-bonus',
        category: 'exploration',
        title: 'Explorer',
        description: 'Explore something',
        rarity: 'rare',
        requirements: { type: 'exploration', threshold: 1 },
        rewards: [
          {
            type: 'bonus',
            description: '+10% energy efficiency',
          },
        ],
        unlocked: false,
      };

      const result = manager.grantRewardsForAchievement(achievement);
      expect(result.granted).toBe(true);
      expect(result.rewards).toHaveLength(1);
      expect(result.rewards[0].type).toBe('bonus');
    });

    it('should grant rewards for achievement with title reward', () => {
      const achievement: AchievementDefinition = {
        id: 'test-title',
        category: 'milestone',
        title: 'Legendary Delver',
        description: 'Reach depth 25',
        rarity: 'legendary',
        requirements: { type: 'depth', threshold: 25 },
        rewards: [{ type: 'title', description: 'Master of the Depths' }],
        unlocked: false,
      };

      const result = manager.grantRewardsForAchievement(achievement);
      expect(result.granted).toBe(true);
      expect(result.rewards).toHaveLength(1);
      expect(result.rewards[0].type).toBe('title');
      expect(result.rewards[0].description).toBe('Master of the Depths');
    });

    it('should handle achievement without rewards', () => {
      const achievement: AchievementDefinition = {
        id: 'test-no-reward',
        category: 'efficiency',
        title: 'Efficient Runner',
        description: 'Run efficiently',
        rarity: 'common',
        requirements: { type: 'efficiency', threshold: 0.1 },
        unlocked: false,
      };

      const result = manager.grantRewardsForAchievement(achievement);
      expect(result.granted).toBe(false);
      expect(result.rewards).toHaveLength(0);
    });

    it('should not grant rewards twice for same achievement', () => {
      const achievement: AchievementDefinition = {
        id: 'test-duplicate',
        category: 'milestone',
        title: 'Test',
        description: 'Test',
        rarity: 'common',
        requirements: { type: 'depth', threshold: 5 },
        rewards: [{ type: 'energy', amount: 100, description: '100 energy' }],
        unlocked: false,
      };

      const result1 = manager.grantRewardsForAchievement(achievement);
      const result2 = manager.grantRewardsForAchievement(achievement);

      expect(result1.granted).toBe(true);
      expect(result2.granted).toBe(true);
      expect(result1.rewards).toHaveLength(1);
      expect(result2.rewards).toHaveLength(1);
    });
  });

  describe('Reward Tracking', () => {
    it('should track total energy rewards', () => {
      const achievements: AchievementDefinition[] = [
        {
          id: 'test-1',
          category: 'milestone',
          title: 'Test 1',
          description: 'Test 1',
          rarity: 'common',
          requirements: { type: 'depth', threshold: 5 },
          rewards: [{ type: 'energy', amount: 50, description: '50 energy' }],
          unlocked: false,
        },
        {
          id: 'test-2',
          category: 'milestone',
          title: 'Test 2',
          description: 'Test 2',
          rarity: 'uncommon',
          requirements: { type: 'depth', threshold: 10 },
          rewards: [{ type: 'energy', amount: 100, description: '100 energy' }],
          unlocked: false,
        },
      ];

      achievements.forEach((achievement) => {
        manager.grantRewardsForAchievement(achievement);
      });

      const totals = manager.getTotalRewards();
      expect(totals.energy).toBe(150);
      expect(totals.items).toHaveLength(0);
      expect(totals.bonuses).toHaveLength(0);
      expect(totals.titles).toHaveLength(0);
    });

    it('should track all reward types', () => {
      const achievements: AchievementDefinition[] = [
        {
          id: 'test-energy',
          category: 'milestone',
          title: 'Energy',
          description: 'Energy',
          rarity: 'common',
          requirements: { type: 'depth', threshold: 5 },
          rewards: [{ type: 'energy', amount: 50, description: '50 energy' }],
          unlocked: false,
        },
        {
          id: 'test-items',
          category: 'collection',
          title: 'Items',
          description: 'Items',
          rarity: 'common',
          requirements: { type: 'collection', threshold: 1 },
          rewards: [
            { type: 'items', description: 'Item 1' },
            { type: 'items', description: 'Item 2' },
          ],
          unlocked: false,
        },
        {
          id: 'test-bonus',
          category: 'risk',
          title: 'Bonus',
          description: 'Bonus',
          rarity: 'common',
          requirements: { type: 'risk', threshold: 1 },
          rewards: [{ type: 'bonus', description: 'Bonus 1' }],
          unlocked: false,
        },
        {
          id: 'test-title',
          category: 'milestone',
          title: 'Title',
          description: 'Title',
          rarity: 'epic',
          requirements: { type: 'depth', threshold: 20 },
          rewards: [{ type: 'title', description: 'Title 1' }],
          unlocked: false,
        },
      ];

      achievements.forEach((achievement) => {
        manager.grantRewardsForAchievement(achievement);
      });

      const totals = manager.getTotalRewards();
      expect(totals.energy).toBe(50);
      expect(totals.items).toHaveLength(2);
      expect(totals.bonuses).toHaveLength(1);
      expect(totals.titles).toHaveLength(1);
    });

    it('should check if reward has been granted', () => {
      const achievement: AchievementDefinition = {
        id: 'test-check',
        category: 'milestone',
        title: 'Test',
        description: 'Test',
        rarity: 'common',
        requirements: { type: 'depth', threshold: 5 },
        rewards: [{ type: 'energy', amount: 100, description: '100 energy' }],
        unlocked: false,
      };

      expect(manager.hasRewardBeenGranted('test-check')).toBe(false);
      manager.grantRewardsForAchievement(achievement);
      expect(manager.hasRewardBeenGranted('test-check')).toBe(true);
    });

    it('should get rewards for specific achievement', () => {
      const achievement: AchievementDefinition = {
        id: 'test-get',
        category: 'milestone',
        title: 'Test',
        description: 'Test',
        rarity: 'common',
        requirements: { type: 'depth', threshold: 5 },
        rewards: [{ type: 'energy', amount: 100, description: '100 energy' }],
        unlocked: false,
      };

      manager.grantRewardsForAchievement(achievement);
      const rewards = manager.getRewardsForAchievement('test-get');
      expect(rewards).toBeDefined();
      expect(rewards?.granted).toBe(true);
      expect(rewards?.rewards).toHaveLength(1);
    });

    it('should clear all rewards', () => {
      const achievement: AchievementDefinition = {
        id: 'test-clear',
        category: 'milestone',
        title: 'Test',
        description: 'Test',
        rarity: 'common',
        requirements: { type: 'depth', threshold: 5 },
        rewards: [{ type: 'energy', amount: 100, description: '100 energy' }],
        unlocked: false,
      };

      manager.grantRewardsForAchievement(achievement);
      expect(manager.hasRewardBeenGranted('test-clear')).toBe(true);
      manager.clearRewards();
      expect(manager.hasRewardBeenGranted('test-clear')).toBe(false);
    });
  });
});
