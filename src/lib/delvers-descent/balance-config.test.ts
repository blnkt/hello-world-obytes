import {
  ALL_ENCOUNTER_GROUPINGS,
  type EncounterGrouping,
} from '@/types/delvers-descent';

import {
  DEFAULT_BALANCE_CONFIG,
  type DepthConstraint,
  type EncounterGroupingDistribution,
  filterGroupingsByDepth,
  getAvailableGroupingsForDepth,
  type GroupingBalanceConfig,
  redistributeGroupingWeights,
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

describe('Balance Config - Depth Constraint System', () => {
  describe('filterGroupingsByDepth', () => {
    it('should filter out groupings with minDepth constraint', () => {
      const groupings: EncounterGrouping[] = [
        'minigame',
        'loot',
        'recovery_and_navigation',
        'passive',
      ];
      const constraints: Record<EncounterGrouping, DepthConstraint> = {
        minigame: {},
        loot: {},
        recovery_and_navigation: { minDepth: 11 },
        passive: {},
      };

      const result = filterGroupingsByDepth(groupings, 5, constraints);

      expect(result).not.toContain('recovery_and_navigation');
      expect(result).toContain('minigame');
      expect(result).toContain('loot');
      expect(result).toContain('passive');
    });

    it('should include groupings with minDepth constraint when depth >= minDepth', () => {
      const groupings: EncounterGrouping[] = [
        'minigame',
        'loot',
        'recovery_and_navigation',
        'passive',
      ];
      const constraints: Record<EncounterGrouping, DepthConstraint> = {
        minigame: {},
        loot: {},
        recovery_and_navigation: { minDepth: 11 },
        passive: {},
      };

      const result = filterGroupingsByDepth(groupings, 15, constraints);

      expect(result).toContain('recovery_and_navigation');
      expect(result).toContain('minigame');
      expect(result).toContain('loot');
      expect(result).toContain('passive');
    });

    it('should filter out groupings with maxDepth constraint', () => {
      const groupings: EncounterGrouping[] = [
        'minigame',
        'loot',
        'recovery_and_navigation',
        'passive',
      ];
      const constraints: Record<EncounterGrouping, DepthConstraint> = {
        minigame: {},
        loot: {},
        recovery_and_navigation: {},
        passive: { maxDepth: 20 },
      };

      const result = filterGroupingsByDepth(groupings, 25, constraints);

      expect(result).not.toContain('passive');
      expect(result).toContain('minigame');
      expect(result).toContain('loot');
      expect(result).toContain('recovery_and_navigation');
    });

    it('should include groupings with maxDepth constraint when depth <= maxDepth', () => {
      const groupings: EncounterGrouping[] = [
        'minigame',
        'loot',
        'recovery_and_navigation',
        'passive',
      ];
      const constraints: Record<EncounterGrouping, DepthConstraint> = {
        minigame: {},
        loot: {},
        recovery_and_navigation: {},
        passive: { maxDepth: 20 },
      };

      const result = filterGroupingsByDepth(groupings, 15, constraints);

      expect(result).toContain('passive');
    });

    it('should handle both minDepth and maxDepth constraints', () => {
      const groupings: EncounterGrouping[] = [
        'minigame',
        'loot',
        'recovery_and_navigation',
        'passive',
      ];
      const constraints: Record<EncounterGrouping, DepthConstraint> = {
        minigame: {},
        loot: {},
        recovery_and_navigation: { minDepth: 10, maxDepth: 20 },
        passive: {},
      };

      expect(filterGroupingsByDepth(groupings, 5, constraints)).not.toContain(
        'recovery_and_navigation'
      );
      expect(filterGroupingsByDepth(groupings, 15, constraints)).toContain(
        'recovery_and_navigation'
      );
      expect(filterGroupingsByDepth(groupings, 25, constraints)).not.toContain(
        'recovery_and_navigation'
      );
    });
  });

  describe('redistributeGroupingWeights', () => {
    it('should redistribute weights proportionally when groupings are filtered', () => {
      const weights: EncounterGroupingDistribution = {
        minigame: 0.3,
        loot: 0.4,
        recovery_and_navigation: 0.2,
        passive: 0.1,
      };
      const availableGroupings: EncounterGrouping[] = [
        'minigame',
        'loot',
        'passive',
      ];

      const result = redistributeGroupingWeights(weights, availableGroupings);

      const sum = result.minigame + result.loot + result.passive;
      expect(sum).toBeCloseTo(1.0, 5);
      expect(result.recovery_and_navigation).toBe(0);
    });

    it('should maintain relative proportions when redistributing', () => {
      const weights: EncounterGroupingDistribution = {
        minigame: 0.3,
        loot: 0.4,
        recovery_and_navigation: 0.2,
        passive: 0.1,
      };
      const availableGroupings: EncounterGrouping[] = [
        'minigame',
        'loot',
        'passive',
      ];

      const result = redistributeGroupingWeights(weights, availableGroupings);

      // minigame:loot:passive ratio should be 3:4:1
      // After removing recovery_and_navigation (0.2), remaining is 0.8
      // So minigame should be 0.3/0.8 = 0.375
      expect(result.minigame).toBeCloseTo(0.375, 5);
      expect(result.loot).toBeCloseTo(0.5, 5);
      expect(result.passive).toBeCloseTo(0.125, 5);
    });

    it('should return original weights if all groupings are available', () => {
      const weights: EncounterGroupingDistribution = {
        minigame: 0.3,
        loot: 0.4,
        recovery_and_navigation: 0.2,
        passive: 0.1,
      };
      const availableGroupings: EncounterGrouping[] = ALL_ENCOUNTER_GROUPINGS;

      const result = redistributeGroupingWeights(weights, availableGroupings);

      expect(result).toEqual(weights);
    });

    it('should handle single grouping available', () => {
      const weights: EncounterGroupingDistribution = {
        minigame: 0.3,
        loot: 0.4,
        recovery_and_navigation: 0.2,
        passive: 0.1,
      };
      const availableGroupings: EncounterGrouping[] = ['minigame'];

      const result = redistributeGroupingWeights(weights, availableGroupings);

      expect(result.minigame).toBe(1.0);
      expect(result.loot).toBe(0);
      expect(result.recovery_and_navigation).toBe(0);
      expect(result.passive).toBe(0);
    });
  });

  describe('getAvailableGroupingsForDepth', () => {
    it('should filter and redistribute weights correctly', () => {
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

      const result = getAvailableGroupingsForDepth(5, config);

      expect(result.groupings).not.toContain('recovery_and_navigation');
      expect(result.groupings.length).toBe(3);
      const sum =
        result.weights.minigame +
        result.weights.loot +
        result.weights.recovery_and_navigation +
        result.weights.passive;
      expect(sum).toBeCloseTo(1.0, 5);
    });

    it('should include all groupings when depth allows', () => {
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

      const result = getAvailableGroupingsForDepth(15, config);

      expect(result.groupings).toContain('recovery_and_navigation');
      expect(result.groupings.length).toBe(4);
      expect(result.weights).toEqual(config.encounterGroupingDistribution);
    });
  });

  describe('recovery_and_navigation depth constraint', () => {
    it('should filter out recovery_and_navigation for depths 1-10', () => {
      const config = DEFAULT_BALANCE_CONFIG.grouping;

      for (let depth = 1; depth <= 10; depth++) {
        const result = getAvailableGroupingsForDepth(depth, config);
        expect(result.groupings).not.toContain('recovery_and_navigation');
      }
    });

    it('should include recovery_and_navigation for depth 11 and above', () => {
      const config = DEFAULT_BALANCE_CONFIG.grouping;

      for (let depth = 11; depth <= 20; depth++) {
        const result = getAvailableGroupingsForDepth(depth, config);
        expect(result.groupings).toContain('recovery_and_navigation');
      }
    });
  });
});
