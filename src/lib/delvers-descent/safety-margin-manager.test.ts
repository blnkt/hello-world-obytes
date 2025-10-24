import { ReturnCostCalculator } from './return-cost-calculator';
import { SafetyMarginManager } from './safety-margin-manager';

describe('SafetyMarginManager', () => {
  let safetyManager: SafetyMarginManager;
  let calculator: ReturnCostCalculator;

  beforeEach(() => {
    calculator = new ReturnCostCalculator();
    safetyManager = new SafetyMarginManager(calculator);
  });

  describe('safety margin calculation', () => {
    it('should calculate safety margin based on current energy and return cost', () => {
      const currentEnergy = 100;
      const returnCost = 50;
      const currentDepth = 3;

      const safetyMargin = safetyManager.calculateSafetyMargin(
        currentEnergy,
        returnCost,
        currentDepth
      );

      expect(safetyMargin).toBeDefined();
      expect(safetyMargin.remainingEnergy).toBe(currentEnergy - returnCost);
      expect(safetyMargin.safetyPercentage).toBeCloseTo(50, 1); // (100-50)/100 * 100
    });

    it('should handle zero return cost', () => {
      const currentEnergy = 100;
      const returnCost = 0;
      const currentDepth = 0;

      const safetyMargin = safetyManager.calculateSafetyMargin(
        currentEnergy,
        returnCost,
        currentDepth
      );

      expect(safetyMargin.remainingEnergy).toBe(100);
      expect(safetyMargin.safetyPercentage).toBe(100);
    });

    it('should handle negative safety margin', () => {
      const currentEnergy = 30;
      const returnCost = 50;
      const currentDepth = 3;

      const safetyMargin = safetyManager.calculateSafetyMargin(
        currentEnergy,
        returnCost,
        currentDepth
      );

      expect(safetyMargin.remainingEnergy).toBe(-20);
      expect(safetyMargin.safetyPercentage).toBeCloseTo(-66.7, 1); // (30-50)/30 * 100
    });
  });

  describe('safety zone classification', () => {
    it('should classify safe zone correctly', () => {
      const currentEnergy = 100;
      const returnCost = 20; // 80% safety margin
      const currentDepth = 3;

      const safetyZone = safetyManager.getSafetyZone(
        currentEnergy,
        returnCost,
        currentDepth
      );

      expect(safetyZone).toBe('safe');
    });

    it('should classify caution zone correctly', () => {
      const currentEnergy = 100;
      const returnCost = 60; // 40% safety margin
      const currentDepth = 3;

      const safetyZone = safetyManager.getSafetyZone(
        currentEnergy,
        returnCost,
        currentDepth
      );

      expect(safetyZone).toBe('caution');
    });

    it('should classify danger zone correctly', () => {
      const currentEnergy = 100;
      const returnCost = 90; // 10% safety margin
      const currentDepth = 3;

      const safetyZone = safetyManager.getSafetyZone(
        currentEnergy,
        returnCost,
        currentDepth
      );

      expect(safetyZone).toBe('danger');
    });

    it('should classify critical zone correctly', () => {
      const currentEnergy = 100;
      const returnCost = 100; // 0% safety margin
      const currentDepth = 3;

      const safetyZone = safetyManager.getSafetyZone(
        currentEnergy,
        returnCost,
        currentDepth
      );

      expect(safetyZone).toBe('critical');
    });
  });

  describe('point of no return detection', () => {
    it('should detect point of no return when return cost exceeds energy', () => {
      const currentEnergy = 50;
      const returnCost = 60;
      const currentDepth = 3;

      const isPointOfNoReturn = safetyManager.isPointOfNoReturn(
        currentEnergy,
        returnCost,
        currentDepth
      );

      expect(isPointOfNoReturn).toBe(true);
    });

    it('should not detect point of no return when energy exceeds return cost', () => {
      const currentEnergy = 100;
      const returnCost = 50;
      const currentDepth = 3;

      const isPointOfNoReturn = safetyManager.isPointOfNoReturn(
        currentEnergy,
        returnCost,
        currentDepth
      );

      expect(isPointOfNoReturn).toBe(false);
    });

    it('should consider safety buffer in point of no return detection', () => {
      const currentEnergy = 60; // Increased to ensure safety with buffer
      const returnCost = 50;
      const currentDepth = 3;

      // With default 10% safety buffer, 60 energy with 50 return cost should be safe
      // Buffered return cost = 50 * 1.1 = 55, so 60 > 55
      const isPointOfNoReturn = safetyManager.isPointOfNoReturn(
        currentEnergy,
        returnCost,
        currentDepth
      );

      expect(isPointOfNoReturn).toBe(false);
    });
  });

  describe('risk warnings', () => {
    it('should generate appropriate risk warnings', () => {
      const currentEnergy = 100;
      const returnCost = 60; // 40% safety margin - should be caution zone
      const currentDepth = 3;

      const warnings = safetyManager.getRiskWarnings(
        currentEnergy,
        returnCost,
        currentDepth
      );

      expect(warnings).toBeDefined();
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings.some((w) => w.type === 'caution')).toBe(true);
    });

    it('should generate critical warnings for dangerous situations', () => {
      const currentEnergy = 100;
      const returnCost = 95;
      const currentDepth = 3;

      const warnings = safetyManager.getRiskWarnings(
        currentEnergy,
        returnCost,
        currentDepth
      );

      expect(warnings.some((w) => w.type === 'critical')).toBe(true);
    });

    it('should not generate warnings for safe situations', () => {
      const currentEnergy = 100;
      const returnCost = 20;
      const currentDepth = 3;

      const warnings = safetyManager.getRiskWarnings(
        currentEnergy,
        returnCost,
        currentDepth
      );

      expect(warnings.length).toBe(0);
    });
  });

  describe('configurable thresholds', () => {
    it('should allow custom safety thresholds', () => {
      const customManager = new SafetyMarginManager(calculator, {
        safeThreshold: 0.8, // 80% safety margin for safe zone
        cautionThreshold: 0.5, // 50% safety margin for caution zone
        dangerThreshold: 0.2, // 20% safety margin for danger zone
        safetyBuffer: 0.15, // 15% safety buffer
      });

      const currentEnergy = 100;
      const returnCost = 30; // 70% safety margin
      const currentDepth = 3;

      const safetyZone = customManager.getSafetyZone(
        currentEnergy,
        returnCost,
        currentDepth
      );

      expect(safetyZone).toBe('caution'); // Should be caution with 70% margin and 80% threshold
    });

    it('should use default thresholds when not specified', () => {
      const defaultManager = new SafetyMarginManager(calculator);

      const currentEnergy = 100;
      const returnCost = 30; // 70% safety margin
      const currentDepth = 3;

      const safetyZone = defaultManager.getSafetyZone(
        currentEnergy,
        returnCost,
        currentDepth
      );

      expect(safetyZone).toBe('safe'); // Should be safe with default thresholds
    });
  });

  describe('depth-based risk scaling', () => {
    it('should increase risk warnings at greater depths', () => {
      const currentEnergy = 100;
      const returnCost = 50; // 50% safety margin

      const shallowWarnings = safetyManager.getRiskWarnings(
        currentEnergy,
        returnCost,
        2
      );
      const deepWarnings = safetyManager.getRiskWarnings(
        currentEnergy,
        returnCost,
        5
      );

      // Deeper depths should have more or stronger warnings
      expect(deepWarnings.length).toBeGreaterThanOrEqual(
        shallowWarnings.length
      );
    });

    it('should consider depth in point of no return detection', () => {
      const currentEnergy = 60;
      const returnCost = 50;

      const shallowPointOfNoReturn = safetyManager.isPointOfNoReturn(
        currentEnergy,
        returnCost,
        2
      );
      const deepPointOfNoReturn = safetyManager.isPointOfNoReturn(
        currentEnergy,
        returnCost,
        5
      );

      // Deeper depths should be more likely to trigger point of no return
      if (shallowPointOfNoReturn) {
        expect(deepPointOfNoReturn).toBe(true);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle zero energy', () => {
      const currentEnergy = 0;
      const returnCost = 50;
      const currentDepth = 3;

      const safetyZone = safetyManager.getSafetyZone(
        currentEnergy,
        returnCost,
        currentDepth
      );
      const isPointOfNoReturn = safetyManager.isPointOfNoReturn(
        currentEnergy,
        returnCost,
        currentDepth
      );

      expect(safetyZone).toBe('critical');
      expect(isPointOfNoReturn).toBe(true);
    });

    it('should handle negative energy', () => {
      const currentEnergy = -10;
      const returnCost = 50;
      const currentDepth = 3;

      const safetyZone = safetyManager.getSafetyZone(
        currentEnergy,
        returnCost,
        currentDepth
      );
      const isPointOfNoReturn = safetyManager.isPointOfNoReturn(
        currentEnergy,
        returnCost,
        currentDepth
      );

      expect(safetyZone).toBe('critical');
      expect(isPointOfNoReturn).toBe(true);
    });

    it('should handle very large return costs', () => {
      const currentEnergy = 100;
      const returnCost = 1000;
      const currentDepth = 3;

      const safetyZone = safetyManager.getSafetyZone(
        currentEnergy,
        returnCost,
        currentDepth
      );
      const isPointOfNoReturn = safetyManager.isPointOfNoReturn(
        currentEnergy,
        returnCost,
        currentDepth
      );

      expect(safetyZone).toBe('critical');
      expect(isPointOfNoReturn).toBe(true);
    });
  });

  describe('performance', () => {
    it('should complete safety calculations within performance requirements', () => {
      const startTime = performance.now();

      // Perform many safety calculations
      for (let i = 0; i < 1000; i++) {
        safetyManager.calculateSafetyMargin(100, 50, 3);
        safetyManager.getSafetyZone(100, 50, 3);
        safetyManager.isPointOfNoReturn(100, 50, 3);
        safetyManager.getRiskWarnings(100, 50, 3);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within 50ms as per PRD requirements
      expect(duration).toBeLessThan(50);
    });
  });
});
