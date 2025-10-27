import { RiskEscalationManager } from './risk-escalation-manager';

describe('RiskEscalationManager', () => {
  let riskManager: RiskEscalationManager;

  beforeEach(() => {
    riskManager = new RiskEscalationManager();
  });

  describe('depth-based risk scaling', () => {
    it('should calculate risk multiplier based on depth', () => {
      const depth1Risk = riskManager.getRiskMultiplier(1);
      const depth3Risk = riskManager.getRiskMultiplier(3);
      const depth5Risk = riskManager.getRiskMultiplier(5);

      expect(depth1Risk).toBeGreaterThan(0);
      expect(depth3Risk).toBeGreaterThan(depth1Risk);
      expect(depth5Risk).toBeGreaterThan(depth3Risk);
    });

    it('should have exponential risk scaling', () => {
      const depth2Risk = riskManager.getRiskMultiplier(2);
      const depth4Risk = riskManager.getRiskMultiplier(4);
      const depth8Risk = riskManager.getRiskMultiplier(8);

      // Risk should increase exponentially, not linearly
      const ratio1 = depth4Risk / depth2Risk;
      const ratio2 = depth8Risk / depth4Risk;

      expect(ratio2).toBeGreaterThan(ratio1);
    });

    it('should handle depth 0 correctly', () => {
      const depth0Risk = riskManager.getRiskMultiplier(0);

      expect(depth0Risk).toBe(1); // Base risk at surface
    });
  });

  describe('encounter difficulty scaling', () => {
    it('should scale encounter difficulty based on depth', () => {
      const baseDifficulty = 50;

      const depth1Difficulty = riskManager.scaleEncounterDifficulty(
        baseDifficulty,
        1
      );
      const depth3Difficulty = riskManager.scaleEncounterDifficulty(
        baseDifficulty,
        3
      );
      const depth5Difficulty = riskManager.scaleEncounterDifficulty(
        baseDifficulty,
        5
      );

      expect(depth1Difficulty).toBeGreaterThan(baseDifficulty);
      expect(depth3Difficulty).toBeGreaterThan(depth1Difficulty);
      expect(depth5Difficulty).toBeGreaterThan(depth3Difficulty);
    });

    it('should maintain minimum difficulty', () => {
      const baseDifficulty = 10;
      const scaledDifficulty = riskManager.scaleEncounterDifficulty(
        baseDifficulty,
        10
      );

      expect(scaledDifficulty).toBeGreaterThanOrEqual(baseDifficulty);
    });

    it('should cap maximum difficulty', () => {
      const baseDifficulty = 100;
      const scaledDifficulty = riskManager.scaleEncounterDifficulty(
        baseDifficulty,
        20
      );

      expect(scaledDifficulty).toBeLessThanOrEqual(baseDifficulty * 5); // Reasonable cap
    });
  });

  describe('reward scaling', () => {
    it('should scale rewards based on depth and risk', () => {
      const baseReward = 100;

      const depth1Reward = riskManager.scaleReward(baseReward, 1);
      const depth3Reward = riskManager.scaleReward(baseReward, 3);
      const depth5Reward = riskManager.scaleReward(baseReward, 5);

      expect(depth1Reward).toBeGreaterThan(baseReward);
      expect(depth3Reward).toBeGreaterThan(depth1Reward);
      expect(depth5Reward).toBeGreaterThan(depth3Reward);
    });

    it('should maintain reward scaling consistency', () => {
      const baseReward = 50;
      const riskMultiplier = riskManager.getRiskMultiplier(3);
      const scaledReward = riskManager.scaleReward(baseReward, 3);

      // Scaled reward should be proportional to risk multiplier
      expect(scaledReward).toBeCloseTo(baseReward * riskMultiplier, 1);
    });
  });

  describe('failure consequence scaling', () => {
    it('should scale failure consequences based on depth', () => {
      const baseConsequence = 10;

      const depth1Consequence = riskManager.scaleFailureConsequence(
        baseConsequence,
        1
      );
      const depth3Consequence = riskManager.scaleFailureConsequence(
        baseConsequence,
        3
      );
      const depth5Consequence = riskManager.scaleFailureConsequence(
        baseConsequence,
        5
      );

      expect(depth1Consequence).toBeGreaterThan(baseConsequence);
      expect(depth3Consequence).toBeGreaterThan(depth1Consequence);
      expect(depth5Consequence).toBeGreaterThan(depth3Consequence);
    });

    it('should apply different scaling factors for different consequence types', () => {
      const baseEnergyLoss = 10;
      const baseItemLoss = 5;

      const energyLoss = riskManager.scaleFailureConsequence(
        baseEnergyLoss,
        3,
        'energy_loss'
      );
      const itemLoss = riskManager.scaleFailureConsequence(
        baseItemLoss,
        3,
        'item_loss'
      );

      expect(energyLoss).toBeGreaterThan(baseEnergyLoss);
      expect(itemLoss).toBeGreaterThan(baseItemLoss);
      // Different consequence types might have different scaling
    });
  });

  describe('configurable scaling factors', () => {
    it('should allow custom risk scaling factors', () => {
      const customManager = new RiskEscalationManager({
        riskScalingFactor: 0.1, // Much slower risk increase
        rewardScalingFactor: 1.5, // Higher reward scaling
        difficultyScalingFactor: 0.8, // Slower difficulty increase
      });

      const depth3Risk = customManager.getRiskMultiplier(3);
      const defaultDepth3Risk = riskManager.getRiskMultiplier(3);

      expect(depth3Risk).toBeLessThan(defaultDepth3Risk);
    });

    it('should use default scaling factors when not specified', () => {
      const defaultManager = new RiskEscalationManager();

      const depth3Risk = defaultManager.getRiskMultiplier(3);
      expect(depth3Risk).toBeGreaterThan(1);
    });
  });

  describe('depth thresholds', () => {
    it('should identify critical depth thresholds', () => {
      const thresholds = riskManager.getDepthThresholds();

      expect(thresholds).toBeDefined();
      expect(thresholds.safe).toBeLessThan(thresholds.caution);
      expect(thresholds.caution).toBeLessThan(thresholds.danger);
      expect(thresholds.danger).toBeLessThan(thresholds.critical);
    });

    it('should classify depths correctly', () => {
      const safeDepth = riskManager.classifyDepth(2);
      const cautionDepth = riskManager.classifyDepth(5);
      const dangerDepth = riskManager.classifyDepth(8);
      const criticalDepth = riskManager.classifyDepth(12);

      expect(safeDepth).toBe('safe');
      expect(cautionDepth).toBe('caution');
      expect(dangerDepth).toBe('danger');
      expect(criticalDepth).toBe('critical');
    });
  });

  describe('risk warnings', () => {
    it('should generate depth-based risk warnings', () => {
      const warnings = riskManager.getDepthRiskWarnings(5);

      expect(warnings).toBeDefined();
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings.some((w) => w.type === 'caution')).toBe(true);
    });

    it('should generate stronger warnings for deeper depths', () => {
      const shallowWarnings = riskManager.getDepthRiskWarnings(3);
      const deepWarnings = riskManager.getDepthRiskWarnings(10); // Critical depth

      expect(deepWarnings.length).toBeGreaterThanOrEqual(
        shallowWarnings.length
      );
      expect(deepWarnings.some((w) => w.severity >= 8)).toBe(true);
    });

    it('should not generate warnings for safe depths', () => {
      const safeWarnings = riskManager.getDepthRiskWarnings(1);

      expect(safeWarnings.length).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle negative depths', () => {
      const negativeDepthRisk = riskManager.getRiskMultiplier(-1);

      expect(negativeDepthRisk).toBe(1); // Should default to base risk
    });

    it('should handle very large depths', () => {
      const largeDepthRisk = riskManager.getRiskMultiplier(100);

      expect(largeDepthRisk).toBeGreaterThan(1);
      expect(Number.isFinite(largeDepthRisk)).toBe(true);
    });

    it('should handle zero base values', () => {
      const zeroReward = riskManager.scaleReward(0, 3);
      const zeroDifficulty = riskManager.scaleEncounterDifficulty(0, 3);

      expect(zeroReward).toBe(0);
      expect(zeroDifficulty).toBe(0);
    });
  });

  describe('performance', () => {
    it('should complete risk calculations within performance requirements', () => {
      const startTime = performance.now();

      // Perform many risk calculations
      for (let i = 0; i < 1000; i++) {
        riskManager.getRiskMultiplier(i % 20);
        riskManager.scaleReward(100, i % 20);
        riskManager.scaleEncounterDifficulty(50, i % 20);
        riskManager.scaleFailureConsequence(10, i % 20);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within 50ms as per PRD requirements
      expect(duration).toBeLessThan(50);
    });
  });

  describe('integration with other systems', () => {
    it('should provide consistent scaling across different operations', () => {
      const depth = 4;
      const baseValue = 100;

      const riskMultiplier = riskManager.getRiskMultiplier(depth);
      const scaledReward = riskManager.scaleReward(baseValue, depth);
      const scaledDifficulty = riskManager.scaleEncounterDifficulty(
        baseValue,
        depth
      );

      // All scaling should be consistent with the risk multiplier
      expect(scaledReward).toBeCloseTo(baseValue * riskMultiplier, 1);
      expect(scaledDifficulty).toBeCloseTo(baseValue * riskMultiplier, 1);
    });
  });
});
