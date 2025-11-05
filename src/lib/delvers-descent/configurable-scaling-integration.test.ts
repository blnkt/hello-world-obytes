import { ReturnCostCalculator } from './return-cost-calculator';
import { RiskEscalationManager } from './risk-escalation-manager';
import { SafetyMarginManager } from './safety-margin-manager';
import { ShortcutManager } from './shortcut-manager';

describe('Configurable Scaling Factors Integration', () => {
  let calculator: ReturnCostCalculator;
  let shortcutManager: ShortcutManager;
  let _safetyManager: SafetyMarginManager;
  let riskManager: RiskEscalationManager;

  beforeEach(() => {
    calculator = new ReturnCostCalculator();
    shortcutManager = new ShortcutManager();
    shortcutManager.clearAllShortcuts();
    _safetyManager = new SafetyMarginManager(calculator);
    riskManager = new RiskEscalationManager();
  });

  describe('exponential curve configuration', () => {
    it('should allow custom exponential curves in return cost calculation', () => {
      const customCalculator = new ReturnCostCalculator({
        baseMultiplier: 10, // Double the base multiplier
        exponent: 2, // Square instead of 1.5 power
        shortcutReductionFactor: 0.5, // 50% reduction instead of 70%
      });

      const depth3Cost = customCalculator.calculateBaseReturnCost(3);
      const defaultDepth3Cost = calculator.calculateBaseReturnCost(3);

      // Custom should be different from default
      expect(depth3Cost).not.toBeCloseTo(defaultDepth3Cost, 1);

      // Custom configuration should produce a positive cost
      expect(depth3Cost).toBeGreaterThan(0);
    });

    it('should allow gradual vs steep exponential curves', () => {
      const gradualCalculator = new ReturnCostCalculator({
        baseMultiplier: 5,
        exponent: 1.2, // Gradual increase
      });

      const steepCalculator = new ReturnCostCalculator({
        baseMultiplier: 5,
        exponent: 2.0, // Steep increase
      });

      const depth5Gradual = gradualCalculator.calculateBaseReturnCost(5);
      const depth5Steep = steepCalculator.calculateBaseReturnCost(5);

      expect(depth5Steep).toBeGreaterThanOrEqual(depth5Gradual);
    });
  });

  describe('shortcut effectiveness configuration', () => {
    it('should allow different shortcut reduction factors', () => {
      const weakShortcuts = new ReturnCostCalculator({
        shortcutReductionFactor: 0.8, // 80% reduction (0.8 multiplier) - weak shortcuts
      });

      const strongShortcuts = new ReturnCostCalculator({
        shortcutReductionFactor: 0.2, // 20% reduction (0.2 multiplier) - strong shortcuts
      });

      const baseCost = calculator.calculateCumulativeReturnCost(3);
      const weakShortcutCost = weakShortcuts.calculateReturnCostWithShortcuts(
        3,
        ['shortcut-1']
      );
      const strongShortcutCost =
        strongShortcuts.calculateReturnCostWithShortcuts(3, ['shortcut-1']);

      expect(weakShortcutCost).toBeGreaterThan(strongShortcutCost);
      expect(weakShortcutCost).toBeLessThan(baseCost);
      expect(strongShortcutCost).toBeLessThan(baseCost);
    });

    it('should integrate with shortcut manager reduction factors', () => {
      // Create shortcuts with different reduction factors
      const weakShortcut = {
        id: 'weak-shortcut',
        depth: 2,
        reductionFactor: 0.3, // 30% reduction
        description: 'Weak shortcut',
      };

      const strongShortcut = {
        id: 'strong-shortcut',
        depth: 2,
        reductionFactor: 0.8, // 80% reduction
        description: 'Strong shortcut',
      };

      shortcutManager.discoverShortcut(weakShortcut);
      shortcutManager.discoverShortcut(strongShortcut);

      const shortcutMap = shortcutManager
        .getAllShortcuts()
        .reduce((map, shortcut) => {
          map.set(shortcut.id, shortcut);
          return map;
        }, new Map());

      const weakCost = calculator.calculateOptimalReturnCost(2, {
        availableShortcuts: ['weak-shortcut'],
        shortcutMap,
      });
      const strongCost = calculator.calculateOptimalReturnCost(2, {
        availableShortcuts: ['strong-shortcut'],
        shortcutMap,
      });

      expect(strongCost).toBeLessThan(weakCost);
    });
  });

  describe('safety margin configuration', () => {
    it('should allow custom safety thresholds', () => {
      const conservativeManager = new SafetyMarginManager(calculator, {
        safeThreshold: 0.8, // 80% safety margin for safe zone
        cautionThreshold: 0.5, // 50% safety margin for caution zone
        dangerThreshold: 0.2, // 20% safety margin for danger zone
        safetyBuffer: 0.2, // 20% safety buffer
      });

      const aggressiveManager = new SafetyMarginManager(calculator, {
        safeThreshold: 0.4, // 40% safety margin for safe zone
        cautionThreshold: 0.2, // 20% safety margin for caution zone
        dangerThreshold: 0.05, // 5% safety margin for danger zone
        safetyBuffer: 0.05, // 5% safety buffer
      });

      const currentEnergy = 100;
      const returnCost = 60; // 40% safety margin

      const conservativeZone = conservativeManager.getSafetyZone(
        currentEnergy,
        returnCost,
        3
      );
      const aggressiveZone = aggressiveManager.getSafetyZone(
        currentEnergy,
        returnCost,
        3
      );

      expect(conservativeZone).toBe('danger'); // 40% < 50% caution threshold, so danger
      expect(aggressiveZone).toBe('safe'); // 40% >= 40% safe threshold
    });

    it('should affect point of no return detection', () => {
      const highBufferManager = new SafetyMarginManager(calculator, {
        safetyBuffer: 0.3, // 30% safety buffer
      });

      const lowBufferManager = new SafetyMarginManager(calculator, {
        safetyBuffer: 0.05, // 5% safety buffer
      });

      const currentEnergy = 55;
      const returnCost = 50;

      const highBufferPointOfNoReturn = highBufferManager.isPointOfNoReturn(
        currentEnergy,
        returnCost,
        3
      );
      const lowBufferPointOfNoReturn = lowBufferManager.isPointOfNoReturn(
        currentEnergy,
        returnCost,
        3
      );

      // High buffer: 50 * 1.3 = 65, so 55 < 65 = true (point of no return)
      // Low buffer: 50 * 1.05 = 52.5, so 55 > 52.5 = false (not point of no return)
      expect(highBufferPointOfNoReturn).toBe(true);
      expect(lowBufferPointOfNoReturn).toBe(false);
    });
  });

  describe('risk escalation configuration', () => {
    it('should allow different risk scaling rates', () => {
      const slowRiskManager = new RiskEscalationManager({
        riskScalingFactor: 0.1, // 10% increase per depth
      });

      const fastRiskManager = new RiskEscalationManager({
        riskScalingFactor: 0.5, // 50% increase per depth
      });

      const depth5SlowRisk = slowRiskManager.getRiskMultiplier(5);
      const depth5FastRisk = fastRiskManager.getRiskMultiplier(5);

      expect(depth5FastRisk).toBeGreaterThan(depth5SlowRisk);
    });

    it('should allow different reward scaling factors', () => {
      const lowRewardManager = new RiskEscalationManager({
        rewardScalingFactor: 0.5, // Lower reward scaling
      });

      const highRewardManager = new RiskEscalationManager({
        rewardScalingFactor: 2.0, // Higher reward scaling
      });

      const baseReward = 100;
      const depth3LowReward = lowRewardManager.scaleReward(baseReward, 3);
      const depth3HighReward = highRewardManager.scaleReward(baseReward, 3);

      expect(depth3HighReward).toBeGreaterThan(depth3LowReward);
    });

    it('should allow different difficulty scaling factors', () => {
      const easyManager = new RiskEscalationManager({
        difficultyScalingFactor: 0.5, // Easier encounters
      });

      const hardManager = new RiskEscalationManager({
        difficultyScalingFactor: 2.0, // Harder encounters
      });

      const baseDifficulty = 50;
      const depth3EasyDifficulty = easyManager.scaleEncounterDifficulty(
        baseDifficulty,
        3
      );
      const depth3HardDifficulty = hardManager.scaleEncounterDifficulty(
        baseDifficulty,
        3
      );

      expect(depth3HardDifficulty).toBeGreaterThan(depth3EasyDifficulty);
    });
  });

  describe('integrated configuration scenarios', () => {
    it('should support easy mode configuration', () => {
      const easyCalculator = new ReturnCostCalculator({
        baseMultiplier: 3, // Lower base cost
        exponent: 1.2, // Gradual increase
        shortcutReductionFactor: 0.8, // Strong shortcuts
      });

      const _easySafetyManager = new SafetyMarginManager(easyCalculator, {
        safeThreshold: 0.5, // Lower safe threshold
        safetyBuffer: 0.2, // Higher safety buffer
      });

      const easyRiskManager = new RiskEscalationManager({
        riskScalingFactor: 0.2, // Slower risk increase
        rewardScalingFactor: 1.5, // Higher rewards
        difficultyScalingFactor: 0.7, // Easier encounters
      });

      // Test easy mode characteristics
      const depth3Cost = easyCalculator.calculateBaseReturnCost(3);
      const depth3Risk = easyRiskManager.getRiskMultiplier(3);
      const depth3Reward = easyRiskManager.scaleReward(100, 3);

      expect(depth3Cost).toBeLessThan(calculator.calculateBaseReturnCost(3));
      expect(depth3Risk).toBeLessThan(riskManager.getRiskMultiplier(3));
      expect(depth3Reward).toBeGreaterThan(riskManager.scaleReward(100, 3));
    });

    it('should support hard mode configuration', () => {
      const hardCalculator = new ReturnCostCalculator({
        baseMultiplier: 8, // Higher base cost
        exponent: 1.8, // Steep increase
        shortcutReductionFactor: 0.3, // Weak shortcuts
      });

      const _hardSafetyManager = new SafetyMarginManager(hardCalculator, {
        safeThreshold: 0.8, // Higher safe threshold
        safetyBuffer: 0.05, // Lower safety buffer
      });

      const hardRiskManager = new RiskEscalationManager({
        riskScalingFactor: 0.4, // Faster risk increase
        rewardScalingFactor: 0.8, // Lower rewards
        difficultyScalingFactor: 1.5, // Harder encounters
      });

      // Test hard mode characteristics
      const depth3Cost = hardCalculator.calculateBaseReturnCost(3);
      const depth3Risk = hardRiskManager.getRiskMultiplier(3);
      const depth3Reward = hardRiskManager.scaleReward(100, 3);

      expect(depth3Cost).toBeGreaterThan(calculator.calculateBaseReturnCost(3));
      expect(depth3Risk).toBeGreaterThan(riskManager.getRiskMultiplier(3));
      expect(depth3Reward).toBeLessThan(riskManager.scaleReward(100, 3));
    });
  });

  describe('configuration validation', () => {
    it('should handle invalid configuration values gracefully', () => {
      const invalidCalculator = new ReturnCostCalculator({
        baseMultiplier: -5, // Invalid negative value
        exponent: 0, // Invalid zero exponent
        shortcutReductionFactor: 1.5, // Invalid > 1 value
      });

      // Should still work with clamped/default values
      const cost = invalidCalculator.calculateBaseReturnCost(3);
      expect(cost).toBeGreaterThan(0);
    });

    it('should maintain performance with custom configurations', () => {
      const customCalculator = new ReturnCostCalculator({
        baseMultiplier: 10,
        exponent: 2.5,
        shortcutReductionFactor: 0.9,
      });

      const startTime = performance.now();

      // Perform many calculations with custom config
      for (let i = 0; i < 1000; i++) {
        customCalculator.calculateBaseReturnCost(i % 20);
        customCalculator.calculateCumulativeReturnCost(i % 20);
        customCalculator.calculateReturnCostWithShortcuts(i % 20, [
          'shortcut-1',
        ]);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should still complete within performance requirements
      expect(duration).toBeLessThan(50);
    });
  });
});
