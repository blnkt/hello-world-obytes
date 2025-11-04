import { ReturnCostCalculator } from './return-cost-calculator';
import { type ShortcutInfo } from './shortcut-manager';

describe('ReturnCostCalculator', () => {
  let calculator: ReturnCostCalculator;

  beforeEach(() => {
    calculator = new ReturnCostCalculator();
  });

  describe('linear tier-based scaling algorithm', () => {
    it('should calculate base return cost using tier-based linear formula', () => {
      // Tier 1 (depths 1-5): baseMultiplier = 5
      expect(calculator.calculateBaseReturnCost(1)).toBe(5);
      expect(calculator.calculateBaseReturnCost(2)).toBe(5);
      expect(calculator.calculateBaseReturnCost(3)).toBe(5);
      expect(calculator.calculateBaseReturnCost(4)).toBe(5);
      expect(calculator.calculateBaseReturnCost(5)).toBe(5);

      // Tier 2 (depths 6-10): baseMultiplier + increment = 5 + 5 = 10
      expect(calculator.calculateBaseReturnCost(6)).toBe(10);
      expect(calculator.calculateBaseReturnCost(7)).toBe(10);
      expect(calculator.calculateBaseReturnCost(8)).toBe(10);
      expect(calculator.calculateBaseReturnCost(9)).toBe(10);
      expect(calculator.calculateBaseReturnCost(10)).toBe(10);

      // Tier 3 (depths 11-15): baseMultiplier + 2*increment = 5 + 10 = 15
      expect(calculator.calculateBaseReturnCost(11)).toBe(15);
      expect(calculator.calculateBaseReturnCost(15)).toBe(15);
    });

    it('should handle depth 0 correctly', () => {
      expect(calculator.calculateBaseReturnCost(0)).toBe(0);
    });

    it('should handle fractional depths', () => {
      // Depth 1.5 is still in tier 1, so cost is 5
      expect(calculator.calculateBaseReturnCost(1.5)).toBe(5);
      // Depth 5.5 is in tier 2, so cost is 10
      expect(calculator.calculateBaseReturnCost(5.5)).toBe(10);
    });
  });

  describe('cumulative return cost calculation', () => {
    it('should calculate cumulative cost from current depth to surface', () => {
      // From depth 3 to surface: cost(1) + cost(2) + cost(3)
      // All are in tier 1, so: 5 + 5 + 5 = 15
      const expectedCost =
        calculator.calculateBaseReturnCost(1) +
        calculator.calculateBaseReturnCost(2) +
        calculator.calculateBaseReturnCost(3);

      expect(calculator.calculateCumulativeReturnCost(3)).toBe(expectedCost);
    });

    it('should return 0 for surface depth (depth 0)', () => {
      expect(calculator.calculateCumulativeReturnCost(0)).toBe(0);
    });

    it('should return base cost for depth 1', () => {
      const baseCost = calculator.calculateBaseReturnCost(1);
      expect(calculator.calculateCumulativeReturnCost(1)).toBeCloseTo(
        baseCost,
        1
      );
    });
  });

  describe('shortcut integration', () => {
    it('should apply shortcut reduction when shortcuts are available', () => {
      const baseCost = calculator.calculateCumulativeReturnCost(3);
      const shortcutCost = calculator.calculateReturnCostWithShortcuts(3, [
        'shortcut-1',
        'shortcut-2',
      ]);

      // Should be reduced by 70% (0.3 multiplier) when shortcuts are available
      expect(shortcutCost).toBeCloseTo(baseCost * 0.3, 1);
    });

    it('should return full cost when no shortcuts are available', () => {
      const baseCost = calculator.calculateCumulativeReturnCost(3);
      const noShortcutCost = calculator.calculateReturnCostWithShortcuts(3, []);

      expect(noShortcutCost).toBeCloseTo(baseCost, 1);
    });

    it('should handle partial shortcut coverage', () => {
      // Create a shortcut map with specific depth coverage
      const shortcutMap = new Map<string, ShortcutInfo>();
      shortcutMap.set('shortcut-1', {
        id: 'shortcut-1',
        depth: 2,
        reductionFactor: 0.7,
        description: 'Passage 1',
      });

      const baseCost = calculator.calculateCumulativeReturnCost(3);
      const partialShortcutCost = calculator.calculateReturnCostWithShortcuts(
        3,
        ['shortcut-1'],
        shortcutMap
      );

      // Should be less than full cost but more than full shortcut reduction
      expect(partialShortcutCost).toBeLessThan(baseCost);
      expect(partialShortcutCost).toBeGreaterThan(baseCost * 0.3);
    });
  });

  describe('configurable scaling factors', () => {
    it('should allow custom base multiplier', () => {
      const customCalculator = new ReturnCostCalculator({ baseMultiplier: 10 });

      // Tier 1 (depth 2): baseMultiplier = 10
      expect(customCalculator.calculateBaseReturnCost(2)).toBe(10);
      // Tier 2 (depth 6): baseMultiplier + increment = 10 + 5 = 15
      expect(customCalculator.calculateBaseReturnCost(6)).toBe(15);
    });

    it('should allow custom shortcut reduction factor', () => {
      const customCalculator = new ReturnCostCalculator({
        shortcutReductionFactor: 0.5,
      });

      const baseCost = customCalculator.calculateCumulativeReturnCost(3);
      const shortcutCost = customCalculator.calculateReturnCostWithShortcuts(
        3,
        ['shortcut-1']
      );

      // Should be reduced by 50% instead of 70%
      expect(shortcutCost).toBeCloseTo(baseCost * 0.5, 1);
    });
  });

  describe('edge cases', () => {
    it('should handle negative depths gracefully', () => {
      expect(calculator.calculateBaseReturnCost(-1)).toBe(0);
      expect(calculator.calculateCumulativeReturnCost(-1)).toBe(0);
    });

    it('should handle very large depths', () => {
      const largeDepth = 100;
      const cost = calculator.calculateBaseReturnCost(largeDepth);

      expect(cost).toBeGreaterThan(0);
      expect(Number.isFinite(cost)).toBe(true);
    });

    it('should handle invalid shortcut arrays', () => {
      const baseCost = calculator.calculateCumulativeReturnCost(3);

      expect(
        calculator.calculateReturnCostWithShortcuts(3, null as any)
      ).toBeCloseTo(baseCost, 1);
      expect(
        calculator.calculateReturnCostWithShortcuts(3, undefined as any)
      ).toBeCloseTo(baseCost, 1);
    });
  });

  describe('performance', () => {
    it('should calculate return costs within performance requirements', () => {
      const startTime = performance.now();

      // Calculate return costs for multiple depths
      for (let depth = 1; depth <= 50; depth++) {
        calculator.calculateCumulativeReturnCost(depth);
        calculator.calculateReturnCostWithShortcuts(depth, [
          'shortcut-1',
          'shortcut-2',
        ]);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within 50ms as per PRD requirements
      expect(duration).toBeLessThan(50);
    });
  });
});
