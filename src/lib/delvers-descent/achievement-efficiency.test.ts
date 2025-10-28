import { AchievementManager } from './achievement-manager';
import { ALL_ACHIEVEMENTS } from './achievement-types';

describe('Efficiency Achievements', () => {
  let manager: AchievementManager;

  beforeEach(() => {
    manager = new AchievementManager(ALL_ACHIEVEMENTS);
  });

  describe('Energy Efficiency Achievements', () => {
    it('should unlock achievement for high efficiency runs', () => {
      const efficiency = manager.getAchievement('efficiency-perfect-run');
      expect(efficiency?.unlocked).toBe(false);

      // 5% excess energy is well below the 10% threshold
      manager.processEvent({
        type: 'efficiency_achieved',
        data: { efficiency: 0.05 },
        timestamp: new Date(),
      });

      const updatedEfficiency = manager.getAchievement(
        'efficiency-perfect-run'
      );
      expect(updatedEfficiency?.unlocked).toBe(true);
    });

    it('should unlock for exactly 10% efficiency', () => {
      manager.processEvent({
        type: 'efficiency_achieved',
        data: { efficiency: 0.1 },
        timestamp: new Date(),
      });

      const efficiency = manager.getAchievement('efficiency-perfect-run');
      expect(efficiency?.unlocked).toBe(true);
    });

    it('should not unlock for efficiency above 10% threshold', () => {
      manager.processEvent({
        type: 'efficiency_achieved',
        data: { efficiency: 0.15 },
        timestamp: new Date(),
      });

      const efficiency = manager.getAchievement('efficiency-perfect-run');
      expect(efficiency?.unlocked).toBe(false);
    });

    it('should track efficiency in percentage', () => {
      manager.processEvent({
        type: 'efficiency_achieved',
        data: { efficiency: 0.08 },
        timestamp: new Date(),
      });

      const efficiency = manager.getAchievement('efficiency-perfect-run');
      expect(efficiency?.unlocked).toBe(true);
      expect(efficiency?.progress.percentage).toBe(100);
    });
  });

  describe('Efficiency Achievement Statistics', () => {
    it('should track efficiency achievements in statistics', () => {
      manager.processEvent({
        type: 'efficiency_achieved',
        data: { efficiency: 0.05 },
        timestamp: new Date(),
      });

      const stats = manager.getStatistics();
      expect(stats.unlockedAchievements).toBeGreaterThan(0);
      expect(stats.byCategory.efficiency).toBeDefined();
      expect(stats.byCategory.efficiency.unlocked).toBeGreaterThan(0);
    });

    it('should show completion rate for efficiency achievements', () => {
      manager.processEvent({
        type: 'efficiency_achieved',
        data: { efficiency: 0.05 },
        timestamp: new Date(),
      });

      const stats = manager.getStatistics();
      expect(stats.byCategory.efficiency.completionRate).toBeGreaterThan(0);
    });
  });
});
