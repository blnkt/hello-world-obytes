import { ReturnCostCalculator, ShortcutInfo } from './return-cost-calculator';

describe('ReturnCostCalculator', () => {
  let calculator: ReturnCostCalculator;

  beforeEach(() => {
    calculator = new ReturnCostCalculator();
  });

  describe('exponential scaling algorithm', () => {
    it('should calculate base return cost using 5 * depth^1.5 formula', () => {
      // Test the exponential scaling formula: 5 * depth^1.5
      expect(calculator.calculateBaseReturnCost(1)).toBeCloseTo(5, 1); // 5 * 1^1.5 = 5
      expect(calculator.calculateBaseReturnCost(2)).toBeCloseTo(14.14, 1); // 5 * 2^1.5 ≈ 14.14
      expect(calculator.calculateBaseReturnCost(3)).toBeCloseTo(25.98, 1); // 5 * 3^1.5 ≈ 25.98
      expect(calculator.calculateBaseReturnCost(4)).toBeCloseTo(40, 1); // 5 * 4^1.5 = 40
    });

    it('should handle depth 0 correctly', () => {
      expect(calculator.calculateBaseReturnCost(0)).toBe(0);
    });

    it('should handle fractional depths', () => {
      expect(calculator.calculateBaseReturnCost(1.5)).toBeCloseTo(9.19, 1); // 5 * 1.5^1.5 ≈ 9.19
    });
  });

  describe('cumulative return cost calculation', () => {
    it('should calculate cumulative cost from current depth to surface', () => {
      // From depth 3 to surface: cost(1) + cost(2) + cost(3)
      const expectedCost = calculator.calculateBaseReturnCost(1) + 
                          calculator.calculateBaseReturnCost(2) + 
                          calculator.calculateBaseReturnCost(3);
      
      expect(calculator.calculateCumulativeReturnCost(3)).toBeCloseTo(expectedCost, 1);
    });

    it('should return 0 for surface depth (depth 0)', () => {
      expect(calculator.calculateCumulativeReturnCost(0)).toBe(0);
    });

    it('should return base cost for depth 1', () => {
      const baseCost = calculator.calculateBaseReturnCost(1);
      expect(calculator.calculateCumulativeReturnCost(1)).toBeCloseTo(baseCost, 1);
    });
  });

  describe('shortcut integration', () => {
    it('should apply shortcut reduction when shortcuts are available', () => {
      const baseCost = calculator.calculateCumulativeReturnCost(3);
      const shortcutCost = calculator.calculateReturnCostWithShortcuts(3, ['shortcut-1', 'shortcut-2']);
      
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
      shortcutMap.set('shortcut-1', { id: 'shortcut-1', depth: 2, reductionFactor: 0.7 });
      
      const baseCost = calculator.calculateCumulativeReturnCost(3);
      const partialShortcutCost = calculator.calculateReturnCostWithShortcuts(3, ['shortcut-1'], shortcutMap);
      
      // Should be less than full cost but more than full shortcut reduction
      expect(partialShortcutCost).toBeLessThan(baseCost);
      expect(partialShortcutCost).toBeGreaterThan(baseCost * 0.3);
    });
  });

  describe('configurable scaling factors', () => {
    it('should allow custom base multiplier', () => {
      const customCalculator = new ReturnCostCalculator({ baseMultiplier: 10 });
      
      // Should use 10 * depth^1.5 instead of 5 * depth^1.5
      expect(customCalculator.calculateBaseReturnCost(2)).toBeCloseTo(28.28, 1); // 10 * 2^1.5 ≈ 28.28
    });

    it('should allow custom exponent', () => {
      const customCalculator = new ReturnCostCalculator({ exponent: 2 });
      
      // Should use 5 * depth^2 instead of 5 * depth^1.5
      expect(customCalculator.calculateBaseReturnCost(2)).toBeCloseTo(20, 1); // 5 * 2^2 = 20
    });

    it('should allow custom shortcut reduction factor', () => {
      const customCalculator = new ReturnCostCalculator({ shortcutReductionFactor: 0.5 });
      
      const baseCost = customCalculator.calculateCumulativeReturnCost(3);
      const shortcutCost = customCalculator.calculateReturnCostWithShortcuts(3, ['shortcut-1']);
      
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
      
      expect(calculator.calculateReturnCostWithShortcuts(3, null as any)).toBeCloseTo(baseCost, 1);
      expect(calculator.calculateReturnCostWithShortcuts(3, undefined as any)).toBeCloseTo(baseCost, 1);
    });
  });

  describe('performance', () => {
    it('should calculate return costs within performance requirements', () => {
      const startTime = performance.now();
      
      // Calculate return costs for multiple depths
      for (let depth = 1; depth <= 50; depth++) {
        calculator.calculateCumulativeReturnCost(depth);
        calculator.calculateReturnCostWithShortcuts(depth, ['shortcut-1', 'shortcut-2']);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete within 50ms as per PRD requirements
      expect(duration).toBeLessThan(50);
    });
  });
});
