import { AchievementManager } from './achievement-manager';
import { ALL_ACHIEVEMENTS } from './achievement-types';

describe('Achievement Milestones', () => {
  let manager: AchievementManager;

  beforeEach(() => {
    manager = new AchievementManager(ALL_ACHIEVEMENTS);
  });

  describe('Depth Milestone Achievements', () => {
    it('should track progress for depth achievements', () => {
      const depth5 = manager.getAchievement('milestone-depth-5');
      expect(depth5?.unlocked).toBe(false);

      manager.processEvent({
        type: 'depth_reached',
        data: { depth: 5 },
        timestamp: new Date(),
      });

      const updatedDepth5 = manager.getAchievement('milestone-depth-5');
      expect(updatedDepth5?.unlocked).toBe(true);
    });

    it('should unlock multiple depth achievements simultaneously', () => {
      manager.processEvent({
        type: 'depth_reached',
        data: { depth: 10 },
        timestamp: new Date(),
      });

      const depth5 = manager.getAchievement('milestone-depth-5');
      const depth10 = manager.getAchievement('milestone-depth-10');

      expect(depth5?.unlocked).toBe(true);
      expect(depth10?.unlocked).toBe(true);
    });

    it('should not unlock achievements for insufficient depth', () => {
      manager.processEvent({
        type: 'depth_reached',
        data: { depth: 4 },
        timestamp: new Date(),
      });

      const depth5 = manager.getAchievement('milestone-depth-5');
      expect(depth5?.unlocked).toBe(false);
    });
  });

  describe('Collection Milestone Achievements', () => {
    it('should track progress for collection achievements', () => {
      manager.processEvent({
        type: 'collection_completed',
        data: { collectionSetId: 'test-set' },
        timestamp: new Date(),
      });

      const firstSet = manager.getAchievement('collection-first-set');
      expect(firstSet?.unlocked).toBe(true);
    });

    it('should track multiple collection completions', () => {
      for (let i = 0; i < 5; i++) {
        manager.processEvent({
          type: 'collection_completed',
          data: { collectionSetId: `set-${i}` },
          timestamp: new Date(),
        });
      }

      const fiveSets = manager.getAchievement('collection-5-sets');
      expect(fiveSets?.unlocked).toBe(true);
    });
  });

  describe('Streak Milestone Achievements', () => {
    it('should track progress for streak achievements', () => {
      manager.processEvent({
        type: 'streak_milestone',
        data: { streakDays: 3 },
        timestamp: new Date(),
      });

      const threeDays = manager.getAchievement('streak-3-days');
      expect(threeDays?.unlocked).toBe(true);
    });

    it('should track longer streaks', () => {
      manager.processEvent({
        type: 'streak_milestone',
        data: { streakDays: 7 },
        timestamp: new Date(),
      });

      const threeDays = manager.getAchievement('streak-3-days');
      const sevenDays = manager.getAchievement('streak-7-days');

      expect(threeDays?.unlocked).toBe(true);
      expect(sevenDays?.unlocked).toBe(true);
    });
  });

  describe('Milestone Achievement Statistics', () => {
    it('should provide milestone progress tracking', () => {
      manager.processEvent({
        type: 'depth_reached',
        data: { depth: 10 },
        timestamp: new Date(),
      });

      const stats = manager.getStatistics();
      expect(stats.unlockedAchievements).toBeGreaterThan(0);
    });

    it('should track all achievement categories', () => {
      manager.processEvent({
        type: 'depth_reached',
        data: { depth: 5 },
        timestamp: new Date(),
      });

      manager.processEvent({
        type: 'collection_completed',
        data: { collectionSetId: 'test' },
        timestamp: new Date(),
      });

      manager.processEvent({
        type: 'streak_milestone',
        data: { streakDays: 3 },
        timestamp: new Date(),
      });

      const stats = manager.getStatistics();
      expect(stats.byCategory.milestone).toBeDefined();
      expect(stats.byCategory.collection).toBeDefined();
      expect(stats.byCategory.streak).toBeDefined();
    });
  });
});
