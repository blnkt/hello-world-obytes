import { CashOutManager } from './cash-out-manager';
import { ReturnCostCalculator } from './return-cost-calculator';
import { SafetyMarginManager } from './safety-margin-manager';
import { type ShortcutInfo, ShortcutManager } from './shortcut-manager';

describe('Phase 3 Performance Optimization (Task 4.7)', () => {
  let returnCostCalculator: ReturnCostCalculator;
  let shortcutManager: ShortcutManager;
  let safetyMarginManager: SafetyMarginManager;
  let cashOutManager: CashOutManager;

  beforeEach(() => {
    returnCostCalculator = new ReturnCostCalculator();
    shortcutManager = new ShortcutManager();
    safetyMarginManager = new SafetyMarginManager(returnCostCalculator);
    cashOutManager = new CashOutManager();
  });

  describe('return cost calculation performance', () => {
    it('should complete return cost calculation within 50ms for depth 10', () => {
      const depth = 10;
      const startTime = performance.now();
      const cost = returnCostCalculator.calculateCumulativeReturnCost(depth);
      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(50);
      expect(cost).toBeGreaterThan(0);
    });

    it('should complete return cost calculation within 50ms for depth 20', () => {
      const depth = 20;
      const startTime = performance.now();
      const cost = returnCostCalculator.calculateCumulativeReturnCost(depth);
      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(50);
      expect(cost).toBeGreaterThan(0);
    });

    it('should complete return cost calculation with shortcuts within 50ms', () => {
      // Add multiple shortcuts
      for (let i = 1; i <= 5; i++) {
        shortcutManager.discoverShortcut({
          id: `shortcut-${i}`,
          depth: i * 2,
          reductionFactor: 0.7,
          description: `Shortcut at depth ${i * 2}`,
        });
      }

      const depth = 10;
      const shortcutIds = shortcutManager.getShortcutIdsAtDepth(depth);
      const shortcutMap = new Map<string, ShortcutInfo>(
        shortcutManager.getAllShortcuts().map((s) => [s.id, s])
      );

      const startTime = performance.now();
      const cost = returnCostCalculator.calculateOptimalReturnCost(depth, {
        availableShortcuts: shortcutIds,
        shortcutMap,
      });
      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(50);
      expect(cost).toBeGreaterThan(0);
    });
  });

  describe('safety margin calculation performance', () => {
    it('should complete safety margin calculation within 50ms', () => {
      const currentEnergy = 100;
      const returnCost = 50;
      const currentDepth = 5;

      const startTime = performance.now();
      const margin = safetyMarginManager.calculateSafetyMargin(
        currentEnergy,
        returnCost,
        currentDepth
      );
      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(50);
      expect(margin.remainingEnergy).toBeDefined();
    });

    it('should complete risk warnings generation within 50ms', () => {
      const currentEnergy = 100;
      const returnCost = 50;
      const currentDepth = 5;

      const startTime = performance.now();
      const warnings = safetyMarginManager.getRiskWarnings(
        currentEnergy,
        returnCost,
        currentDepth
      );
      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(50);
      expect(Array.isArray(warnings)).toBe(true);
    });
  });

  describe('cash out manager performance', () => {
    it('should complete cash out decision within 50ms', () => {
      const currentEnergy = 100;
      const returnCost = 50;
      const rewards = {
        energy: 0,
        items: [],
        xp: 100,
      };

      const startTime = performance.now();
      const canCashOut = cashOutManager.canCashOut(
        currentEnergy,
        returnCost,
        rewards
      );
      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(50);
      expect(typeof canCashOut).toBe('boolean');
    });

    it('should complete cash out summary generation within 50ms', () => {
      const rewards = {
        energy: 10,
        items: [
          {
            id: 'item-1',
            name: 'Test Item 1',
            quantity: 2,
            rarity: 'common' as const,
            type: 'trade_good' as const,
            setId: 'test',
            value: 10,
            description: 'Test',
          },
          {
            id: 'item-2',
            name: 'Test Item 2',
            quantity: 1,
            rarity: 'epic' as const,
            type: 'legendary' as const,
            setId: 'test',
            value: 100,
            description: 'Test',
          },
        ],
        xp: 200,
      };

      const startTime = performance.now();
      const summary = cashOutManager.getCashOutSummary(rewards);
      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(50);
      expect(summary.totalItems).toBe(2);
    });
  });

  describe('complex path optimization performance', () => {
    it('should handle path optimization with many shortcuts efficiently', () => {
      // Add many shortcuts
      for (let i = 1; i <= 10; i++) {
        shortcutManager.discoverShortcut({
          id: `shortcut-${i}`,
          depth: i,
          reductionFactor: 0.5 + i * 0.03, // Varying reduction factors
          description: `Shortcut at depth ${i}`,
        });
      }

      const depth = 20;
      const shortcutIds = shortcutManager.getShortcutIdsAtDepth(depth);
      const shortcutMap = new Map<string, ShortcutInfo>(
        shortcutManager.getAllShortcuts().map((s) => [s.id, s])
      );

      const startTime = performance.now();
      const cost = returnCostCalculator.calculateOptimalReturnCost(depth, {
        availableShortcuts: shortcutIds,
        shortcutMap,
        visitedNodes: Array.from({ length: 20 }, (_, i) => `node-${i}`),
      });
      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(50);
      expect(cost).toBeGreaterThan(0);
    });
  });

  describe('performance under load', () => {
    it('should handle multiple rapid calculations without degradation', () => {
      const depths = [5, 10, 15, 20];
      const results: number[] = [];

      const startTime = performance.now();
      depths.forEach((depth) => {
        const cost = returnCostCalculator.calculateCumulativeReturnCost(depth);
        results.push(cost);
      });
      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(50 * depths.length); // Should complete all within reasonable time
      expect(results.every((cost) => cost > 0)).toBe(true);
    });
  });
});
