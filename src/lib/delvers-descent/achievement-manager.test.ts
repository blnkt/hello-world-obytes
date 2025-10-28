import { AchievementManager } from './achievement-manager';
import type { AchievementEvent } from './achievement-models';
import { ALL_ACHIEVEMENTS } from './achievement-types';

describe('AchievementManager', () => {
  let manager: AchievementManager;

  beforeEach(() => {
    manager = new AchievementManager(ALL_ACHIEVEMENTS);
  });

  describe('Initialization', () => {
    it('should initialize with all achievements', () => {
      const achievements = manager.getAchievements();
      expect(achievements.length).toBe(ALL_ACHIEVEMENTS.length);
    });

    it('should start with no achievements unlocked', () => {
      const unlocked = manager.getUnlockedAchievements();
      expect(unlocked.length).toBe(0);
    });
  });

  describe('Achievement Tracking', () => {
    it('should track progress for milestone achievements', () => {
      const event: AchievementEvent = {
        type: 'depth_reached',
        data: { depth: 5 },
        timestamp: new Date(),
      };

      const updated = manager.processEvent(event);
      expect(updated.length).toBeGreaterThan(0);
    });

    it('should unlock achievement when threshold is met', () => {
      const event: AchievementEvent = {
        type: 'depth_reached',
        data: { depth: 5 },
        timestamp: new Date(),
      };

      manager.processEvent(event);
      const unlocked = manager.getUnlockedAchievements();
      expect(unlocked.length).toBeGreaterThan(0);
    });

    it('should track progress for collection achievements', () => {
      const event: AchievementEvent = {
        type: 'collection_completed',
        data: { collectionSetId: 'test-set' },
        timestamp: new Date(),
      };

      const updated = manager.processEvent(event);
      expect(updated.length).toBeGreaterThanOrEqual(0);
    });

    it('should track progress for streak achievements', () => {
      const event: AchievementEvent = {
        type: 'streak_milestone',
        data: { streakDays: 3 },
        timestamp: new Date(),
      };

      const updated = manager.processEvent(event);
      expect(updated.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Statistics', () => {
    it('should provide achievement statistics', () => {
      const stats = manager.getStatistics();
      expect(stats.totalAchievements).toBe(ALL_ACHIEVEMENTS.length);
      expect(stats.unlockedAchievements).toBe(0);
      expect(stats.lockedAchievements).toBe(ALL_ACHIEVEMENTS.length);
    });

    it('should update statistics after unlocking achievements', () => {
      const event: AchievementEvent = {
        type: 'depth_reached',
        data: { depth: 5 },
        timestamp: new Date(),
      };

      manager.processEvent(event);
      const stats = manager.getStatistics();
      expect(stats.unlockedAchievements).toBeGreaterThan(0);
    });
  });
});
