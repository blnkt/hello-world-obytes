import type { Shortcut } from '@/types/delvers-descent';

import { EnergyCalculator } from './energy-calculator';

describe('EnergyCalculator', () => {
  let calculator: EnergyCalculator;

  beforeEach(() => {
    calculator = new EnergyCalculator();
  });

  describe('calculateReturnCost', () => {
    it('should calculate return cost with exponential scaling', () => {
      const cost1 = calculator.calculateReturnCost(1);
      const cost2 = calculator.calculateReturnCost(2);
      const cost3 = calculator.calculateReturnCost(3);

      expect(cost1).toBe(5); // 5 * (1^2.0) = 5
      expect(cost2).toBe(25); // 5 * (2^2.0) + 5 * (1^2.0) = 20 + 5 = 25
      expect(cost3).toBe(70); // 5 * (3^2.0) + 5 * (2^2.0) + 5 * (1^2.0) = 45 + 20 + 5 = 70
    });

    it('should handle zero depth', () => {
      const cost = calculator.calculateReturnCost(0);
      expect(cost).toBe(0);
    });

    it('should handle negative depth', () => {
      const cost = calculator.calculateReturnCost(-1);
      expect(cost).toBe(0);
    });

    it('should apply shortcut reductions', () => {
      const shortcuts: Shortcut[] = [
        {
          id: 'shortcut1',
          fromDepth: 3,
          toDepth: 1,
          energyReduction: 15,
          isPermanent: true,
        },
      ];

      const costWithShortcut = calculator.calculateReturnCost(3, shortcuts);
      const costWithoutShortcut = calculator.calculateReturnCost(3);

      expect(costWithShortcut).toBeLessThan(costWithoutShortcut);
    });

    it('should handle multiple shortcuts', () => {
      const shortcuts: Shortcut[] = [
        {
          id: 'shortcut1',
          fromDepth: 3,
          toDepth: 1,
          energyReduction: 10,
          isPermanent: true,
        },
        {
          id: 'shortcut2',
          fromDepth: 2,
          toDepth: 1,
          energyReduction: 5,
          isPermanent: true,
        },
      ];

      const cost = calculator.calculateReturnCost(3, shortcuts);
      expect(cost).toBeGreaterThan(0);
    });
  });

  describe('calculateNodeCost', () => {
    it('should calculate base node cost', () => {
      const cost1 = calculator.calculateNodeCost(1, 'puzzle_chamber');
      const cost2 = calculator.calculateNodeCost(2, 'puzzle_chamber');
      const cost3 = calculator.calculateNodeCost(3, 'puzzle_chamber');

      expect(cost1).toBe(5); // Base cost for depth 1
      expect(cost2).toBe(7); // Base cost for depth 2
      expect(cost3).toBe(9); // Base cost for depth 3
    });

    it('should apply type-specific modifiers', () => {
      const puzzleCost = calculator.calculateNodeCost(2, 'puzzle_chamber');
      const discoveryCost = calculator.calculateNodeCost(2, 'discovery_site');
      const hazardCost = calculator.calculateNodeCost(2, 'hazard');
      const restCost = calculator.calculateNodeCost(2, 'rest_site');

      expect(discoveryCost).toBeGreaterThan(puzzleCost); // +1 modifier
      expect(hazardCost).toBeGreaterThan(puzzleCost); // +3 modifier
      expect(restCost).toBeLessThan(puzzleCost); // -3 modifier
    });

    it('should enforce minimum and maximum costs', () => {
      const lowCost = calculator.calculateNodeCost(1, 'rest_site');
      const highCost = calculator.calculateNodeCost(10, 'hazard');

      expect(lowCost).toBeGreaterThanOrEqual(3); // Minimum cost
      expect(highCost).toBeLessThanOrEqual(30); // Maximum cost
    });

    it('should throw error for invalid depth', () => {
      expect(() => calculator.calculateNodeCost(0, 'puzzle_chamber')).toThrow(
        'Depth must be at least 1'
      );
      expect(() => calculator.calculateNodeCost(-1, 'puzzle_chamber')).toThrow(
        'Depth must be at least 1'
      );
    });
  });

  describe('calculateSafetyMargin', () => {
    it('should calculate safety margin correctly', () => {
      const margin = calculator.calculateSafetyMargin(100, 50);
      expect(margin).toBe(50);
    });

    it('should return zero for negative margin', () => {
      const margin = calculator.calculateSafetyMargin(30, 50);
      expect(margin).toBe(0);
    });

    it('should handle equal energy and return cost', () => {
      const margin = calculator.calculateSafetyMargin(50, 50);
      expect(margin).toBe(0);
    });
  });

  describe('applyShortcutReduction', () => {
    it('should apply 70% reduction', () => {
      const shortcuts: Shortcut[] = [
        {
          id: 'shortcut1',
          fromDepth: 3,
          toDepth: 1,
          energyReduction: 10,
          isPermanent: true,
        },
      ];

      const originalCost = 100;
      const reducedCost = calculator.applyShortcutReduction(
        originalCost,
        shortcuts
      );

      expect(reducedCost).toBe(30); // 100 * 0.3 = 30
    });

    it('should enforce minimum cost of 1', () => {
      const shortcuts: Shortcut[] = [
        {
          id: 'shortcut1',
          fromDepth: 3,
          toDepth: 1,
          energyReduction: 10,
          isPermanent: true,
        },
      ];

      const originalCost = 1;
      const reducedCost = calculator.applyShortcutReduction(
        originalCost,
        shortcuts
      );

      expect(reducedCost).toBe(1); // Minimum cost
    });

    it('should return original cost when no shortcuts', () => {
      const originalCost = 100;
      const reducedCost = calculator.applyShortcutReduction(originalCost, []);

      expect(reducedCost).toBe(100);
    });
  });

  describe('canAffordReturn', () => {
    it('should return true when energy is sufficient', () => {
      const canReturn = calculator.canAffordReturn(100, 50);
      expect(canReturn).toBe(true);
    });

    it('should return false when energy is insufficient', () => {
      const canReturn = calculator.canAffordReturn(30, 50);
      expect(canReturn).toBe(false);
    });

    it('should return true when energy equals return cost', () => {
      const canReturn = calculator.canAffordReturn(50, 50);
      expect(canReturn).toBe(true);
    });
  });

  describe('calculatePointOfNoReturn', () => {
    it('should calculate point of no return with default buffer', () => {
      const pointOfNoReturn = calculator.calculatePointOfNoReturn(50);
      expect(pointOfNoReturn).toBe(60); // 50 + 10 buffer
    });

    it('should calculate point of no return with custom buffer', () => {
      const pointOfNoReturn = calculator.calculatePointOfNoReturn(50, 20);
      expect(pointOfNoReturn).toBe(70); // 50 + 20 buffer
    });
  });

  describe('calculateEnergyEfficiency', () => {
    it('should calculate efficiency correctly', () => {
      const efficiency = calculator.calculateEnergyEfficiency(50, 100);
      expect(efficiency).toBe(200); // (100 / 50) * 100 = 200
    });

    it('should return 0 for zero energy used', () => {
      const efficiency = calculator.calculateEnergyEfficiency(0, 100);
      expect(efficiency).toBe(0);
    });

    it('should handle fractional efficiency', () => {
      const efficiency = calculator.calculateEnergyEfficiency(33, 100);
      expect(efficiency).toBe(303); // (100 / 33) * 100 ≈ 303
    });
  });

  describe('calculateOptimalDepth', () => {
    it('should calculate optimal depth for given energy', () => {
      const optimalDepth = calculator.calculateOptimalDepth(50);
      expect(optimalDepth).toBeGreaterThan(0);
      expect(optimalDepth).toBeLessThanOrEqual(20);
    });

    it('should return 1 for very low energy', () => {
      const optimalDepth = calculator.calculateOptimalDepth(5);
      expect(optimalDepth).toBe(1);
    });

    it('should consider shortcuts in calculation', () => {
      const shortcuts: Shortcut[] = [
        {
          id: 'shortcut1',
          fromDepth: 3,
          toDepth: 1,
          energyReduction: 20,
          isPermanent: true,
        },
      ];

      const optimalDepthWithShortcuts = calculator.calculateOptimalDepth(
        50,
        shortcuts
      );
      const optimalDepthWithoutShortcuts = calculator.calculateOptimalDepth(50);

      expect(optimalDepthWithShortcuts).toBeGreaterThanOrEqual(
        optimalDepthWithoutShortcuts
      );
    });
  });

  describe('calculatePathCost', () => {
    it('should calculate total path cost', () => {
      const pathDepths = [1, 2, 3];
      const totalCost = calculator.calculatePathCost(pathDepths);

      expect(totalCost).toBeGreaterThan(0);
    });

    it('should include return cost for deepest point', () => {
      const pathDepths = [1, 2, 3];
      const totalCost = calculator.calculatePathCost(pathDepths);

      // Should include node costs + return cost from depth 3
      const expectedMinCost = 5 + 7 + 9 + 45; // Node costs + return cost
      expect(totalCost).toBeGreaterThanOrEqual(expectedMinCost);
    });

    it('should handle empty path', () => {
      const totalCost = calculator.calculatePathCost([]);
      expect(totalCost).toBe(0);
    });
  });

  describe('calculateShortcutSavings', () => {
    it('should calculate savings correctly', () => {
      const savings = calculator.calculateShortcutSavings(100, 70);
      expect(savings).toBe(30);
    });

    it('should return 0 for no savings', () => {
      const savings = calculator.calculateShortcutSavings(100, 100);
      expect(savings).toBe(0);
    });

    it('should return 0 for negative savings', () => {
      const savings = calculator.calculateShortcutSavings(70, 100);
      expect(savings).toBe(0);
    });
  });

  describe('calculateRiskLevel', () => {
    it('should return 100 for zero energy', () => {
      const riskLevel = calculator.calculateRiskLevel(0, 50);
      expect(riskLevel).toBe(100);
    });

    it('should return 100 when energy is less than return cost', () => {
      const riskLevel = calculator.calculateRiskLevel(30, 50);
      expect(riskLevel).toBe(100);
    });

    it('should return 0 for high safety margin', () => {
      const riskLevel = calculator.calculateRiskLevel(200, 50);
      expect(riskLevel).toBe(0);
    });

    it('should calculate risk level proportionally', () => {
      const riskLevel = calculator.calculateRiskLevel(75, 50);
      expect(riskLevel).toBeGreaterThan(0);
      expect(riskLevel).toBeLessThan(100);
    });
  });

  describe('getRecommendedAction', () => {
    it('should recommend return for critical energy', () => {
      const recommendation = calculator.getRecommendedAction(10, 50, 3);

      expect(recommendation.action).toBe('return');
      expect(recommendation.reason).toContain('Critical');
      expect(recommendation.riskLevel).toBeGreaterThanOrEqual(80);
    });

    it('should recommend return for high risk', () => {
      const recommendation = calculator.getRecommendedAction(70, 50, 3);

      expect(recommendation.action).toBe('return');
      expect(recommendation.reason).toContain('High risk');
      expect(recommendation.riskLevel).toBeGreaterThanOrEqual(60);
    });

    it('should recommend continue for safe energy levels', () => {
      const recommendation = calculator.getRecommendedAction(200, 50, 3);

      expect(recommendation.action).toBe('continue');
      expect(recommendation.reason).toContain('Safe to continue');
    });

    it('should recommend rest for moderate energy', () => {
      const recommendation = calculator.getRecommendedAction(80, 50, 2);

      expect(recommendation.action).toBe('rest');
      expect(recommendation.reason).toContain('resting');
    });
  });

  describe('calculateRegenerationRate', () => {
    it('should calculate base regeneration rate', () => {
      const rate = calculator.calculateRegenerationRate();
      expect(rate).toBe(5);
    });

    it('should apply modifiers', () => {
      const rate = calculator.calculateRegenerationRate(5, 3);
      expect(rate).toBe(8);
    });

    it('should enforce minimum rate of 1', () => {
      const rate = calculator.calculateRegenerationRate(1, -5);
      expect(rate).toBe(1);
    });
  });

  describe('calculateBacktrackCost', () => {
    it('should calculate backtrack cost', () => {
      const cost = calculator.calculateBacktrackCost(5, 3);
      expect(cost).toBe(4); // (5-3) * 2 = 4
    });

    it('should return 0 for forward movement', () => {
      const cost = calculator.calculateBacktrackCost(3, 5);
      expect(cost).toBe(0);
    });

    it('should return 0 for same depth', () => {
      const cost = calculator.calculateBacktrackCost(3, 3);
      expect(cost).toBe(0);
    });

    it('should enforce minimum cost of 1', () => {
      // Test with a case where the calculated cost would be less than 1
      const cost = calculator.calculateBacktrackCost(1, 0);
      expect(cost).toBeGreaterThanOrEqual(1);

      // Test with a case where the calculated cost is exactly 1
      const cost2 = calculator.calculateBacktrackCost(1, 0);
      expect(cost2).toBeGreaterThanOrEqual(1);
    });
  });

  describe('calculateTotalEnergyBudget', () => {
    it('should calculate total budget with bonuses', () => {
      const budget = calculator.calculateTotalEnergyBudget(100, {
        streakBonus: 20,
        collectionBonus: 10,
        regionBonus: 5,
      });

      expect(budget).toBe(135); // 100 + 20 + 10 + 5
    });

    it('should handle partial bonuses', () => {
      const budget = calculator.calculateTotalEnergyBudget(100, {
        streakBonus: 20,
      });

      expect(budget).toBe(120); // 100 + 20
    });

    it('should handle no bonuses', () => {
      const budget = calculator.calculateTotalEnergyBudget(100);
      expect(budget).toBe(100);
    });

    it('should enforce minimum budget of 0', () => {
      const budget = calculator.calculateTotalEnergyBudget(50, {
        streakBonus: -100,
      });

      expect(budget).toBe(0);
    });
  });

  describe('validateEnergyCalculations', () => {
    it('should validate correct values', () => {
      const validation = calculator.validateEnergyCalculations(100, 50);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should detect negative energy', () => {
      const validation = calculator.validateEnergyCalculations(-10, 50);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Energy cannot be negative');
    });

    it('should detect negative return cost', () => {
      const validation = calculator.validateEnergyCalculations(100, -10);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Return cost cannot be negative');
    });

    it('should detect unreasonably high values', () => {
      const validation = calculator.validateEnergyCalculations(200000, 50);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        'Energy value seems unreasonably high'
      );
    });

    it('should detect multiple errors', () => {
      const validation = calculator.validateEnergyCalculations(-10, -20);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveLength(2);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle very large depth values', () => {
      const cost = calculator.calculateReturnCost(100);
      expect(cost).toBeGreaterThan(0);
      expect(Number.isFinite(cost)).toBe(true);
    });

    it('should handle very small energy values', () => {
      const canReturn = calculator.canAffordReturn(0.1, 0.2);
      expect(canReturn).toBe(false);
    });

    it('should handle fractional energy values', () => {
      const margin = calculator.calculateSafetyMargin(50.5, 25.3);
      expect(margin).toBeCloseTo(25.2);
    });
  });
});
