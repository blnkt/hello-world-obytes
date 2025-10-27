import { ReturnCostCalculator } from './return-cost-calculator';
import { type ShortcutInfo, ShortcutManager } from './shortcut-manager';

describe('Path Optimization Algorithm', () => {
  let calculator: ReturnCostCalculator;
  let shortcutManager: ShortcutManager;

  beforeEach(() => {
    calculator = new ReturnCostCalculator();
    shortcutManager = new ShortcutManager();
    shortcutManager.clearAllShortcuts();
  });

  describe('path optimization with shortcuts', () => {
    it('should find optimal path using shortcuts', () => {
      // Set up shortcuts
      const shortcuts: ShortcutInfo[] = [
        {
          id: 'shortcut-1',
          depth: 2,
          reductionFactor: 0.7,
          description: 'Passage 1',
        },
        {
          id: 'shortcut-2',
          depth: 4,
          reductionFactor: 0.8,
          description: 'Passage 2',
        },
      ];
      shortcuts.forEach((shortcut) =>
        shortcutManager.discoverShortcut(shortcut)
      );

      const visitedNodes = ['node-1', 'node-2', 'node-3', 'node-4'];
      const currentDepth = 4;

      const optimalCost = calculator.calculateOptimalReturnCost(currentDepth, {
        visitedNodes,
        availableShortcuts: shortcutManager.getShortcutIdsAtDepth(currentDepth),
        shortcutMap: shortcutManager
          .getAllShortcuts()
          .reduce((map, shortcut) => {
            map.set(shortcut.id, shortcut);
            return map;
          }, new Map<string, ShortcutInfo>()),
      });

      // Should be less than the basic cumulative cost
      const basicCost = calculator.calculateCumulativeReturnCost(currentDepth);
      expect(optimalCost).toBeLessThan(basicCost);
    });

    it('should consider visited nodes in path optimization', () => {
      // Set up shortcuts at different depths
      const shortcuts: ShortcutInfo[] = [
        {
          id: 'shortcut-1',
          depth: 2,
          reductionFactor: 0.7,
          description: 'Passage 1',
        },
        {
          id: 'shortcut-2',
          depth: 3,
          reductionFactor: 0.6,
          description: 'Passage 2',
        },
      ];
      shortcuts.forEach((shortcut) =>
        shortcutManager.discoverShortcut(shortcut)
      );

      const visitedNodes = ['node-1', 'node-2', 'node-3']; // Visited depths 1, 2, and 3
      const currentDepth = 3;

      const optimalCost = calculator.calculateOptimalReturnCost(currentDepth, {
        visitedNodes,
        availableShortcuts: shortcutManager.getShortcutIdsAtDepth(currentDepth),
        shortcutMap: shortcutManager
          .getAllShortcuts()
          .reduce((map, shortcut) => {
            map.set(shortcut.id, shortcut);
            return map;
          }, new Map<string, ShortcutInfo>()),
      });

      // Should use both shortcuts since we've visited all depths
      const expectedCost =
        calculator.calculateBaseReturnCost(1) +
        calculator.calculateBaseReturnCost(2) * 0.3 + // shortcut-1 applies (0.7 reduction)
        calculator.calculateBaseReturnCost(3) * 0.4; // shortcut-2 applies (0.6 reduction)

      expect(optimalCost).toBeCloseTo(expectedCost, 1);
    });

    it('should handle multiple shortcuts at same depth', () => {
      // Set up multiple shortcuts at depth 2
      const shortcuts: ShortcutInfo[] = [
        {
          id: 'shortcut-1',
          depth: 2,
          reductionFactor: 0.7,
          description: 'Passage 1',
        },
        {
          id: 'shortcut-2',
          depth: 2,
          reductionFactor: 0.8,
          description: 'Passage 2',
        },
      ];
      shortcuts.forEach((shortcut) =>
        shortcutManager.discoverShortcut(shortcut)
      );

      const visitedNodes = ['node-1', 'node-2'];
      const currentDepth = 2;

      const optimalCost = calculator.calculateOptimalReturnCost(currentDepth, {
        visitedNodes,
        availableShortcuts: shortcutManager.getShortcutIdsAtDepth(currentDepth),
        shortcutMap: shortcutManager
          .getAllShortcuts()
          .reduce((map, shortcut) => {
            map.set(shortcut.id, shortcut);
            return map;
          }, new Map<string, ShortcutInfo>()),
      });

      // Should use the better shortcut (0.8 reduction = 0.2 multiplier)
      const expectedCost =
        calculator.calculateBaseReturnCost(1) +
        calculator.calculateBaseReturnCost(2) * 0.2; // best shortcut applies

      expect(optimalCost).toBeCloseTo(expectedCost, 1);
    });
  });

  describe('path optimization edge cases', () => {
    it('should handle no shortcuts available', () => {
      const visitedNodes = ['node-1', 'node-2', 'node-3'];
      const currentDepth = 3;

      const optimalCost = calculator.calculateOptimalReturnCost(currentDepth, {
        visitedNodes,
        availableShortcuts: [], // no shortcuts
        shortcutMap: new Map<string, ShortcutInfo>(),
      });

      // Should return basic cumulative cost
      const basicCost = calculator.calculateCumulativeReturnCost(currentDepth);
      expect(optimalCost).toBeCloseTo(basicCost, 1);
    });

    it('should handle empty visited nodes', () => {
      const shortcuts: ShortcutInfo[] = [
        {
          id: 'shortcut-1',
          depth: 2,
          reductionFactor: 0.7,
          description: 'Passage 1',
        },
      ];
      shortcuts.forEach((shortcut) =>
        shortcutManager.discoverShortcut(shortcut)
      );

      const visitedNodes: string[] = []; // no visited nodes
      const currentDepth = 3;

      const optimalCost = calculator.calculateOptimalReturnCost(currentDepth, {
        visitedNodes,
        availableShortcuts: shortcutManager.getShortcutIdsAtDepth(currentDepth),
        shortcutMap: shortcutManager
          .getAllShortcuts()
          .reduce((map, shortcut) => {
            map.set(shortcut.id, shortcut);
            return map;
          }, new Map<string, ShortcutInfo>()),
      });

      // Should still use shortcuts since they're available
      const basicCost = calculator.calculateCumulativeReturnCost(currentDepth);
      expect(optimalCost).toBeLessThan(basicCost);
    });

    it('should handle shortcuts beyond current depth', () => {
      const shortcuts: ShortcutInfo[] = [
        {
          id: 'shortcut-1',
          depth: 5,
          reductionFactor: 0.7,
          description: 'Deep passage',
        },
      ];
      shortcuts.forEach((shortcut) =>
        shortcutManager.discoverShortcut(shortcut)
      );

      const visitedNodes = ['node-1', 'node-2', 'node-3'];
      const currentDepth = 3;

      const optimalCost = calculator.calculateOptimalReturnCost(currentDepth, {
        visitedNodes,
        availableShortcuts: shortcutManager.getShortcutIdsAtDepth(currentDepth),
        shortcutMap: shortcutManager
          .getAllShortcuts()
          .reduce((map, shortcut) => {
            map.set(shortcut.id, shortcut);
            return map;
          }, new Map<string, ShortcutInfo>()),
      });

      // Should return basic cost since shortcut is not applicable
      const basicCost = calculator.calculateCumulativeReturnCost(currentDepth);
      expect(optimalCost).toBeCloseTo(basicCost, 1);
    });
  });

  describe('performance requirements', () => {
    it('should complete path optimization within performance requirements', () => {
      // Set up many shortcuts
      const shortcuts: ShortcutInfo[] = [];
      for (let i = 1; i <= 20; i++) {
        shortcuts.push({
          id: `shortcut-${i}`,
          depth: i,
          reductionFactor: 0.7,
          description: `Passage ${i}`,
        });
      }
      shortcuts.forEach((shortcut) =>
        shortcutManager.discoverShortcut(shortcut)
      );

      const visitedNodes = Array.from(
        { length: 10 },
        (_, i) => `node-${i + 1}`
      );
      const currentDepth = 10;

      const startTime = performance.now();

      const optimalCost = calculator.calculateOptimalReturnCost(currentDepth, {
        visitedNodes,
        availableShortcuts: shortcutManager.getShortcutIdsAtDepth(currentDepth),
        shortcutMap: shortcutManager
          .getAllShortcuts()
          .reduce((map, shortcut) => {
            map.set(shortcut.id, shortcut);
            return map;
          }, new Map<string, ShortcutInfo>()),
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within 50ms as per PRD requirements
      expect(duration).toBeLessThan(50);
      expect(optimalCost).toBeGreaterThan(0);
    });
  });

  describe('integration with existing systems', () => {
    it('should integrate with shortcut manager seamlessly', () => {
      // Discover shortcuts through shortcut manager
      const shortcuts: ShortcutInfo[] = [
        {
          id: 'shortcut-1',
          depth: 2,
          reductionFactor: 0.7,
          description: 'Passage 1',
        },
        {
          id: 'shortcut-2',
          depth: 3,
          reductionFactor: 0.8,
          description: 'Passage 2',
        },
      ];
      shortcuts.forEach((shortcut) =>
        shortcutManager.discoverShortcut(shortcut)
      );

      // Use shortcut manager data directly
      const visitedNodes = ['node-1', 'node-2', 'node-3'];
      const currentDepth = 3;

      const optimalCost = calculator.calculateOptimalReturnCost(currentDepth, {
        visitedNodes,
        availableShortcuts: shortcutManager.getShortcutIdsAtDepth(currentDepth),
        shortcutMap: shortcutManager
          .getAllShortcuts()
          .reduce((map, shortcut) => {
            map.set(shortcut.id, shortcut);
            return map;
          }, new Map<string, ShortcutInfo>()),
      });

      // Should work seamlessly with shortcut manager
      expect(optimalCost).toBeGreaterThan(0);
      expect(optimalCost).toBeLessThan(
        calculator.calculateCumulativeReturnCost(currentDepth)
      );
    });
  });
});
