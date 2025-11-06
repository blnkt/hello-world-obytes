import {
  DEFAULT_BALANCE_CONFIG,
  type DepthConstraint,
  type EncounterGroupingDistribution,
  type GroupingBalanceConfig,
  validateGroupingDistribution,
} from './balance-config';

describe('Balance Config - Grouping Configuration', () => {
  describe('EncounterGroupingDistribution interface', () => {
    it('should define grouping distribution with all four groupings', () => {
      const distribution: EncounterGroupingDistribution = {
        minigame: 0.3,
        loot: 0.4,
        recovery_and_navigation: 0.2,
        passive: 0.1,
      };

      expect(distribution.minigame).toBe(0.3);
      expect(distribution.loot).toBe(0.4);
      expect(distribution.recovery_and_navigation).toBe(0.2);
      expect(distribution.passive).toBe(0.1);
    });
  });

  describe('DepthConstraint interface', () => {
    it('should support minDepth constraint', () => {
      const constraint: DepthConstraint = {
        minDepth: 11,
      };

      expect(constraint.minDepth).toBe(11);
      expect(constraint.maxDepth).toBeUndefined();
    });

    it('should support maxDepth constraint', () => {
      const constraint: DepthConstraint = {
        maxDepth: 50,
      };

      expect(constraint.maxDepth).toBe(50);
      expect(constraint.minDepth).toBeUndefined();
    });

    it('should support both minDepth and maxDepth', () => {
      const constraint: DepthConstraint = {
        minDepth: 10,
        maxDepth: 20,
      };

      expect(constraint.minDepth).toBe(10);
      expect(constraint.maxDepth).toBe(20);
    });
  });

  describe('GroupingBalanceConfig interface', () => {
    it('should contain encounterGroupingDistribution and depthConstraints', () => {
      const config: GroupingBalanceConfig = {
        encounterGroupingDistribution: {
          minigame: 0.3,
          loot: 0.4,
          recovery_and_navigation: 0.2,
          passive: 0.1,
        },
        depthConstraints: {
          minigame: {},
          loot: {},
          recovery_and_navigation: { minDepth: 11 },
          passive: {},
        },
      };

      expect(config.encounterGroupingDistribution).toBeDefined();
      expect(config.depthConstraints).toBeDefined();
      expect(config.depthConstraints.recovery_and_navigation?.minDepth).toBe(
        11
      );
    });
  });

  describe('DEFAULT_BALANCE_CONFIG.grouping', () => {
    it('should have grouping property with default distribution', () => {
      expect(DEFAULT_BALANCE_CONFIG.grouping).toBeDefined();
      expect(
        DEFAULT_BALANCE_CONFIG.grouping.encounterGroupingDistribution
      ).toEqual({
        minigame: 0.3,
        loot: 0.4,
        recovery_and_navigation: 0.2,
        passive: 0.1,
      });
    });

    it('should have default depth constraints', () => {
      expect(DEFAULT_BALANCE_CONFIG.grouping.depthConstraints).toBeDefined();
      expect(
        DEFAULT_BALANCE_CONFIG.grouping.depthConstraints.recovery_and_navigation
          ?.minDepth
      ).toBe(11);
    });

    it('should have grouping distribution that sums to 1.0', () => {
      const dist =
        DEFAULT_BALANCE_CONFIG.grouping.encounterGroupingDistribution;
      const sum =
        dist.minigame + dist.loot + dist.recovery_and_navigation + dist.passive;
      expect(sum).toBeCloseTo(1.0, 5);
    });
  });

  describe('validateGroupingDistribution', () => {
    it('should return true for valid distribution summing to 1.0', () => {
      const dist: EncounterGroupingDistribution = {
        minigame: 0.3,
        loot: 0.4,
        recovery_and_navigation: 0.2,
        passive: 0.1,
      };

      expect(validateGroupingDistribution(dist)).toBe(true);
    });

    it('should return true for distribution summing to 1.0 within tolerance', () => {
      const dist: EncounterGroupingDistribution = {
        minigame: 0.300001,
        loot: 0.399999,
        recovery_and_navigation: 0.2,
        passive: 0.1,
      };

      expect(validateGroupingDistribution(dist)).toBe(true);
    });

    it('should return false for distribution not summing to 1.0', () => {
      const dist: EncounterGroupingDistribution = {
        minigame: 0.3,
        loot: 0.4,
        recovery_and_navigation: 0.2,
        passive: 0.2, // Sums to 1.1
      };

      expect(validateGroupingDistribution(dist)).toBe(false);
    });

    it('should return false for distribution summing to less than 1.0', () => {
      const dist: EncounterGroupingDistribution = {
        minigame: 0.3,
        loot: 0.4,
        recovery_and_navigation: 0.2,
        passive: 0.05, // Sums to 0.95
      };

      expect(validateGroupingDistribution(dist)).toBe(false);
    });
  });
});
