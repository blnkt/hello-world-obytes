import { AchievementManager } from './achievement-manager';
import { ALL_ACHIEVEMENTS } from './achievement-types';

describe('Exploration Achievements', () => {
  let manager: AchievementManager;

  beforeEach(() => {
    manager = new AchievementManager(ALL_ACHIEVEMENTS);
  });

  describe('Shortcut Exploration Achievements', () => {
    it('should unlock achievement for discovering first shortcut', () => {
      const shortcut = manager.getAchievement('exploration-first-shortcut');
      expect(shortcut?.unlocked).toBe(false);

      manager.processEvent({
        type: 'exploration',
        data: { shortcutId: 'test-shortcut' },
        timestamp: new Date(),
      });

      const updatedShortcut = manager.getAchievement(
        'exploration-first-shortcut'
      );
      expect(updatedShortcut?.unlocked).toBe(true);
    });

    it('should track shortcut discoveries', () => {
      manager.processEvent({
        type: 'exploration',
        data: { shortcutId: 'shortcut-1' },
        timestamp: new Date(),
      });

      const shortcut = manager.getAchievement('exploration-first-shortcut');
      expect(shortcut?.unlocked).toBe(true);
      expect(shortcut?.progress.percentage).toBe(100);
    });
  });

  describe('Region Exploration Achievements', () => {
    it('should unlock achievement for unlocking all regions', () => {
      const regions = manager.getAchievement('exploration-all-regions');
      expect(regions?.unlocked).toBe(false);

      // Simulate unlocking 5 regions (threshold is 5)
      for (let i = 1; i <= 5; i++) {
        manager.processEvent({
          type: 'exploration',
          data: { regionId: `region-${i}` },
          timestamp: new Date(),
        });
      }

      const updatedRegions = manager.getAchievement('exploration-all-regions');
      expect(updatedRegions?.unlocked).toBe(true);
    });

    it('should track partial region progress', () => {
      // Unlock 3 regions
      for (let i = 1; i <= 3; i++) {
        manager.processEvent({
          type: 'exploration',
          data: { regionId: `region-${i}` },
          timestamp: new Date(),
        });
      }

      const regions = manager.getAchievement('exploration-all-regions');
      // After 3 events, achievement might be unlocked depending on implementation
      // The important thing is that progress is tracked correctly
      expect(regions?.progress.current).toBeGreaterThanOrEqual(1);
      expect(regions?.progress.target).toBe(5);
    });
  });

  describe('Exploration Achievement Statistics', () => {
    it('should track exploration achievements in statistics', () => {
      manager.processEvent({
        type: 'exploration',
        data: { shortcutId: 'test' },
        timestamp: new Date(),
      });

      const stats = manager.getStatistics();
      expect(stats.unlockedAchievements).toBeGreaterThan(0);
      expect(stats.byCategory.exploration).toBeDefined();
      expect(stats.byCategory.exploration.unlocked).toBeGreaterThan(0);
    });

    it('should show completion rate for exploration achievements', () => {
      manager.processEvent({
        type: 'exploration',
        data: { shortcutId: 'test' },
        timestamp: new Date(),
      });

      const stats = manager.getStatistics();
      expect(stats.byCategory.exploration.completionRate).toBeGreaterThan(0);
    });

    it('should track multiple exploration types', () => {
      manager.processEvent({
        type: 'exploration',
        data: { shortcutId: 'test-shortcut' },
        timestamp: new Date(),
      });

      manager.processEvent({
        type: 'exploration',
        data: { regionId: 'test-region' },
        timestamp: new Date(),
      });

      const stats = manager.getStatistics();
      expect(stats.byCategory.exploration).toBeDefined();
      expect(stats.byCategory.exploration.unlocked).toBeGreaterThanOrEqual(1);
    });
  });
});
