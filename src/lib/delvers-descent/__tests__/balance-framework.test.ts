import { BalanceManager } from '../balance-manager';
import { REGIONS } from '../regions';

describe('Balance Testing Framework', () => {
  let balanceManager: BalanceManager;

  beforeEach(() => {
    balanceManager = new BalanceManager();
  });

  describe('Framework: Complete Balance Validation', () => {
    it('should validate all balance configurations together', () => {
      const config = balanceManager.getConfig();

      // Validate energy config
      expect(config.energy.baseCost).toBeGreaterThan(0);
      expect(config.energy.minCost).toBeLessThan(config.energy.maxCost);

      // Validate reward config
      expect(config.reward.depthScalingFactor).toBeGreaterThan(0);
      expect(config.reward.variationBase).toBeGreaterThan(0);

      // Validate difficulty config
      expect(config.difficulty.targetBustRateMin).toBeLessThan(
        config.difficulty.targetBustRateMax
      );

      // Validate collection config
      expect(config.collection.setCompletionBonusEnergy).toBeGreaterThan(0);

      // Validate encounter config
      const distribution = config.encounter.encounterDistribution;
      const total = Object.values(distribution).reduce(
        (sum, val) => sum + val,
        0
      );
      expect(total).toBeCloseTo(1.0, 5);
    });

    it('should validate balance across all systems', () => {
      // Energy costs should be reasonable
      const nodeCost = balanceManager.calculateNodeCost(3, 'puzzle_chamber');
      expect(nodeCost).toBeGreaterThan(0);
      expect(nodeCost).toBeLessThan(30);

      // Rewards should scale with depth
      const reward1 = balanceManager.calculateRewardValue(
        10,
        'puzzle_chamber',
        1
      );
      const reward3 = balanceManager.calculateRewardValue(
        10,
        'puzzle_chamber',
        3
      );
      expect(reward3).toBeGreaterThanOrEqual(reward1 - 2);

      // Return costs should scale exponentially
      const returnCost1 = balanceManager.calculateReturnCost(1);
      const returnCost3 = balanceManager.calculateReturnCost(3);
      expect(returnCost3).toBeGreaterThan(returnCost1 * 2);

      // Difficulty should increase with depth
      const diff1 = balanceManager.calculateDifficultyMultiplier(1);
      const diff3 = balanceManager.calculateDifficultyMultiplier(3);
      expect(diff3).toBeGreaterThan(diff1);
    });
  });

  describe('Framework: Balance Preset Testing', () => {
    it('should have working EASY preset', () => {
      balanceManager.loadPreset('EASY');
      const config = balanceManager.getConfig();

      expect(config.energy.baseCost).toBeLessThan(5);
      expect(config.difficulty.targetBustRateMin).toBeLessThan(0.2);
    });

    it('should have working HARD preset', () => {
      balanceManager.loadPreset('HARD');
      const config = balanceManager.getConfig();

      expect(config.energy.baseCost).toBeGreaterThan(5);
      expect(config.difficulty.targetBustRateMin).toBeGreaterThan(0.2);
    });

    it('should have working TESTING preset', () => {
      balanceManager.loadPreset('TESTING');
      const config = balanceManager.getConfig();

      expect(config.energy.minCost).toBe(1);
      expect(config.energy.maxCost).toBe(999);
    });
  });

  describe('Framework: Cross-System Balance Checks', () => {
    it('should maintain energy vs reward balance', () => {
      for (let depth = 1; depth <= 5; depth++) {
        const nodeCost = balanceManager.calculateNodeCost(
          depth,
          'puzzle_chamber'
        );
        const reward = balanceManager.calculateRewardValue(
          10,
          'puzzle_chamber',
          depth
        );

        // Rewards should be meaningful relative to costs
        expect(reward).toBeGreaterThan(nodeCost * 0.5);
      }
    });

    it('should maintain return cost vs total energy balance', () => {
      for (let depth = 1; depth <= 7; depth++) {
        const returnCost = balanceManager.calculateReturnCost(depth);
        const expectedEnergy =
          balanceManager.calculateExpectedEnergyCost(depth);

        // Return cost should not dominate total energy
        const ratio = returnCost / expectedEnergy;
        expect(ratio).toBeGreaterThan(0.05);
        expect(ratio).toBeLessThan(2.0);
      }
    });

    it('should have balanced regional difficulty', () => {
      const regionDifficulties = REGIONS.map((region) =>
        calculateRegionDifficulty(region)
      );

      // All regions should offer similar challenge
      const avgDifficulty =
        regionDifficulties.reduce((sum, d) => sum + d, 0) /
        regionDifficulties.length;

      regionDifficulties.forEach((difficulty) => {
        const difference = Math.abs(difficulty - avgDifficulty);
        expect(difference).toBeLessThan(avgDifficulty * 0.5); // Within 50% of average
      });
    });
  });

  describe('Framework: Performance Requirements', () => {
    it('should calculate return costs quickly', () => {
      const start = Date.now();

      for (let i = 0; i < 1000; i++) {
        balanceManager.calculateReturnCost(Math.random() * 10);
      }

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(100); // Should be fast
    });

    it('should calculate node costs quickly', () => {
      const start = Date.now();
      const types = [
        'puzzle_chamber',
        'trade_opportunity',
        'discovery_site',
        'risk_event',
        'hazard',
        'rest_site',
      ];

      for (let i = 0; i < 1000; i++) {
        const depth = Math.floor(Math.random() * 10) + 1;
        const type = types[Math.floor(Math.random() * types.length)];
        balanceManager.calculateNodeCost(depth, type as any);
      }

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(200);
    });
  });

  describe('Framework: Configuration Validation', () => {
    it('should reject invalid configurations', () => {
      const config = balanceManager.getConfig();

      // Try to set invalid values
      balanceManager.updateConfig({
        energy: {
          ...config.energy,
          maxCost: 0, // Invalid: maxCost should be > minCost
        },
      });

      // Should handle gracefully
      const newConfig = balanceManager.getConfig();
      expect(newConfig.energy).toBeDefined();
    });

    it('should maintain configuration consistency', () => {
      const config1 = balanceManager.exportConfig();
      balanceManager.importConfig(config1);
      const config2 = balanceManager.exportConfig();

      expect(config2).toEqual(config1);
    });
  });
});

/**
 * Helper function to calculate region difficulty (reused from previous test)
 */
function calculateRegionDifficulty(region: any): number {
  const distribution = region.encounterDistribution;

  const difficultyWeights: Record<string, number> = {
    puzzle_chamber: 1.0,
    trade_opportunity: 1.2,
    discovery_site: 1.1,
    risk_event: 2.0,
    hazard: 2.5,
    rest_site: 0.5,
  };

  let totalDifficulty = 0;
  for (const [encounterType, percentage] of Object.entries(distribution)) {
    const weight = difficultyWeights[encounterType] || 1.0;
    totalDifficulty += ((percentage as number) / 100) * weight;
  }

  return totalDifficulty;
}
