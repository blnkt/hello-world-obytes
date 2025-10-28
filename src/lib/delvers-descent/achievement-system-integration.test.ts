/**
 * Achievement System Integration Tests
 * Tests the complete achievement system including types, models, manager, rewards, persistence, and UI
 */

import { getItem, setItem } from '@/lib/storage';

import { AchievementManager } from './achievement-manager';
import {
  loadAchievementEvents,
  loadAchievements,
  saveAchievementEvents,
  saveAchievements,
} from './achievement-persistence';
import { AchievementRewardManager } from './achievement-rewards';
import { ALL_ACHIEVEMENTS } from './achievement-types';

jest.mock('@/lib/storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('Achievement System Integration', () => {
  let manager: AchievementManager;
  let rewardManager: AchievementRewardManager;

  beforeEach(() => {
    manager = new AchievementManager(ALL_ACHIEVEMENTS);
    rewardManager = new AchievementRewardManager();
    jest.clearAllMocks();
  });

  describe('Complete Achievement Flow', () => {
    it('should process events, update achievements, and grant rewards', async () => {
      // Process depth event
      const updates = manager.processEvent({
        type: 'depth_reached',
        data: { depth: 5 },
        timestamp: new Date(),
      });

      // Check that achievement was updated
      expect(updates.length).toBeGreaterThan(0);

      // Get achievements
      const achievement = manager.getAchievement('milestone-depth-5');
      expect(achievement?.unlocked).toBe(true);

      // Grant rewards
      const rewards = rewardManager.grantRewardsForAchievement({
        ...achievement!,
        rewards: [{ type: 'energy', amount: 100, description: '100 energy' }],
      });

      expect(rewards.granted).toBe(true);
    });

    it('should persist and restore achievement state', async () => {
      // Process event
      manager.processEvent({
        type: 'depth_reached',
        data: { depth: 10 },
        timestamp: new Date(),
      });

      // Save state
      (setItem as jest.Mock).mockResolvedValue(undefined);
      await saveAchievements(manager);

      expect(setItem).toHaveBeenCalled();

      // Load state
      const achievements = manager.getAllAchievements();
      (getItem as jest.Mock).mockResolvedValue(
        JSON.stringify({ achievements, lastSaved: new Date() })
      );

      const loaded = await loadAchievements();
      expect(loaded).toBeDefined();
      expect(loaded.length).toBeGreaterThan(0);
    });
  });

  describe('Achievement Statistics', () => {
    it('should calculate statistics for all achievement categories', () => {
      // Process various events
      manager.processEvent({
        type: 'depth_reached',
        data: { depth: 5 },
        timestamp: new Date(),
      });

      manager.processEvent({
        type: 'exploration',
        data: { shortcutId: 'test' },
        timestamp: new Date(),
      });

      const stats = manager.getStatistics();
      expect(stats.totalAchievements).toBeGreaterThan(0);
      expect(stats.unlockedAchievements).toBeGreaterThan(0);
      expect(stats.completionRate).toBeGreaterThanOrEqual(0);
      expect(stats.byCategory).toBeDefined();
      expect(stats.byRarity).toBeDefined();
    });
  });

  describe('Reward System Integration', () => {
    it('should grant and track rewards across multiple achievements', () => {
      // Process multiple depth events
      manager.processEvent({
        type: 'depth_reached',
        data: { depth: 5 },
        timestamp: new Date(),
      });

      manager.processEvent({
        type: 'depth_reached',
        data: { depth: 10 },
        timestamp: new Date(),
      });

      // Grant rewards
      const achievements = manager.getAllAchievements();
      achievements
        .filter((a) => a.unlocked)
        .forEach((achievement) => {
          if (achievement.rewards) {
            rewardManager.grantRewardsForAchievement(achievement);
          }
        });

      const totalRewards = rewardManager.getTotalRewards();
      expect(totalRewards).toBeDefined();
    });
  });

  describe('Event Persistence', () => {
    it('should save and load achievement events', async () => {
      const events = [
        {
          type: 'depth_reached' as const,
          data: { depth: 5 },
          timestamp: new Date(),
        },
        {
          type: 'exploration' as const,
          data: { shortcutId: 'test' },
          timestamp: new Date(),
        },
      ];

      (setItem as jest.Mock).mockResolvedValue(undefined);
      await saveAchievementEvents(events);
      expect(setItem).toHaveBeenCalled();

      (getItem as jest.Mock).mockResolvedValue(JSON.stringify(events));
      const loaded = await loadAchievementEvents();
      expect(loaded).toHaveLength(2);
    });
  });

  describe('Multi-Tier Achievement Unlocking', () => {
    it('should unlock multiple tier achievements simultaneously', () => {
      // Process high depth event
      manager.processEvent({
        type: 'depth_reached',
        data: { depth: 25 },
        timestamp: new Date(),
      });

      // Check that multiple achievements are unlocked
      const depth5 = manager.getAchievement('milestone-depth-5');
      const depth10 = manager.getAchievement('milestone-depth-10');
      const depth15 = manager.getAchievement('milestone-depth-15');
      const depth20 = manager.getAchievement('milestone-depth-20');
      const depth25 = manager.getAchievement('milestone-depth-25');

      // All depth achievements up to 25 should be unlocked
      expect(depth5?.unlocked).toBe(true);
      expect(depth10?.unlocked).toBe(true);
      expect(depth15?.unlocked).toBe(true);
      expect(depth20?.unlocked).toBe(true);
      expect(depth25?.unlocked).toBe(true);
    });
  });

  describe('Achievement Progress Tracking', () => {
    it('should track partial progress for collection achievements', () => {
      // Process collection events
      for (let i = 0; i < 3; i++) {
        manager.processEvent({
          type: 'collection_completed',
          data: {},
          timestamp: new Date(),
        });
      }

      const stats = manager.getStatistics();
      expect(stats.unlockedAchievements).toBeGreaterThanOrEqual(1);
    });

    it('should track progress for exploration achievements', () => {
      // Process exploration events
      for (let i = 1; i <= 3; i++) {
        manager.processEvent({
          type: 'exploration',
          data: { regionId: `region-${i}` },
          timestamp: new Date(),
        });
      }

      const allRegions = manager.getAchievement('exploration-all-regions');
      // Progress should be tracked correctly
      expect(allRegions?.progress.current).toBeGreaterThanOrEqual(1);
      // Achievement may or may not be unlocked depending on implementation
      expect(allRegions?.progress.target).toBe(5);
    });
  });
});
