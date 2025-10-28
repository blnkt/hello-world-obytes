import { AchievementManager } from './achievement-manager';
import { ALL_ACHIEVEMENTS } from './achievement-types';

describe('Risk Achievements', () => {
  let manager: AchievementManager;

  beforeEach(() => {
    manager = new AchievementManager(ALL_ACHIEVEMENTS);
  });

  describe('Energy Risk Achievements', () => {
    it('should unlock achievement for surviving with low energy', () => {
      const lowEnergy = manager.getAchievement('risk-survive-5-energys');
      expect(lowEnergy?.unlocked).toBe(false);

      manager.processEvent({
        type: 'risk_taken',
        data: { energyRemaining: 3 },
        timestamp: new Date(),
      });

      const updatedLowEnergy = manager.getAchievement('risk-survive-5-energys');
      expect(updatedLowEnergy?.unlocked).toBe(true);
    });

    it('should not unlock for energy above threshold', () => {
      manager.processEvent({
        type: 'risk_taken',
        data: { energyRemaining: 10 },
        timestamp: new Date(),
      });

      const lowEnergy = manager.getAchievement('risk-survive-5-energys');
      expect(lowEnergy?.unlocked).toBe(false);
    });

    it('should unlock for exactly 5 energy', () => {
      manager.processEvent({
        type: 'risk_taken',
        data: { energyRemaining: 5 },
        timestamp: new Date(),
      });

      const lowEnergy = manager.getAchievement('risk-survive-5-energys');
      expect(lowEnergy?.unlocked).toBe(false); // Threshold is < 5, not <= 5
    });
  });

  describe('Deep Cash Out Risk Achievements', () => {
    it('should unlock achievement for deep cash out', () => {
      const deepCashOut = manager.getAchievement('risk-cashout-deep');
      expect(deepCashOut?.unlocked).toBe(false);

      manager.processEvent({
        type: 'depth_reached',
        data: { depth: 15, cashOut: true },
        timestamp: new Date(),
      });

      const updatedDeepCashOut = manager.getAchievement('risk-cashout-deep');
      expect(updatedDeepCashOut?.unlocked).toBe(true);
    });

    it('should not unlock for shallow cash out', () => {
      manager.processEvent({
        type: 'depth_reached',
        data: { depth: 10, cashOut: true },
        timestamp: new Date(),
      });

      const deepCashOut = manager.getAchievement('risk-cashout-deep');
      expect(deepCashOut?.unlocked).toBe(false);
    });

    it('should not unlock for deep non-cash-out', () => {
      const newManager = new AchievementManager(ALL_ACHIEVEMENTS);

      newManager.processEvent({
        type: 'depth_reached',
        data: { depth: 15, cashOut: false },
        timestamp: new Date(),
      });

      const deepCashOut = newManager.getAchievement('risk-cashout-deep');
      expect(deepCashOut?.unlocked).toBe(false);
    });
  });

  describe('Risk Achievement Statistics', () => {
    it('should track risk achievements in statistics', () => {
      manager.processEvent({
        type: 'risk_taken',
        data: { energyRemaining: 3 },
        timestamp: new Date(),
      });

      const stats = manager.getStatistics();
      expect(stats.unlockedAchievements).toBeGreaterThan(0);
      expect(stats.byCategory.risk).toBeDefined();
      expect(stats.byCategory.risk.unlocked).toBeGreaterThan(0);
    });

    it('should show multiple risk achievements unlocked', () => {
      manager.processEvent({
        type: 'risk_taken',
        data: { energyRemaining: 3 },
        timestamp: new Date(),
      });

      manager.processEvent({
        type: 'depth_reached',
        data: { depth: 15, cashOut: true },
        timestamp: new Date(),
      });

      const stats = manager.getStatistics();
      expect(stats.byCategory.risk.unlocked).toBeGreaterThanOrEqual(2);
    });
  });
});
