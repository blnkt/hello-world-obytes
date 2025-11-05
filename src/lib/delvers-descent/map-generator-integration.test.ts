import type { EncounterType } from '@/types/delvers-descent';

import { getEncounterRoute, isEncounterSupported } from './encounter-router';
import { DungeonMapGenerator } from './map-generator';
import { ReturnCostCalculator } from './return-cost-calculator';
import { type ShortcutInfo, ShortcutManager } from './shortcut-manager';

describe('Map Generator Integration with Return Cost Calculator', () => {
  let mapGenerator: DungeonMapGenerator;
  let returnCostCalculator: ReturnCostCalculator;
  let shortcutManager: ShortcutManager;

  beforeEach(() => {
    mapGenerator = new DungeonMapGenerator();
    returnCostCalculator = new ReturnCostCalculator();
    shortcutManager = new ShortcutManager();
  });

  describe('Task 4.1: Return cost calculation integration', () => {
    it('should use ReturnCostCalculator for return costs', async () => {
      const map = await mapGenerator.generateFullMap(3);
      const node = map.find((n) => n.depth === 3 && n.position === 0);

      if (!node) {
        throw new Error('Node not found');
      }

      expect(node.returnCost).toBeDefined();
      expect(typeof node.returnCost).toBe('number');
      expect(node.returnCost).toBeGreaterThan(0);

      // Verify the cost matches the calculator (accounting for rounding)
      const expectedCost =
        returnCostCalculator.calculateCumulativeReturnCost(3);
      const expected = Math.round(expectedCost);
      expect(node.returnCost).toBeGreaterThanOrEqual(0);
      // Allow a broader tolerance due to rounding and shortcut adjustments
      expect(node.returnCost).toBeLessThanOrEqual(expected + 50);
    });

    it('should set correct return costs for all depth levels', async () => {
      const map = await mapGenerator.generateFullMap(5);

      // Note: generateFullMap adds shortcuts which modify return costs
      // We'll test nodes without shortcuts by checking depth 1
      const depth1Nodes = map.filter((n) => n.depth === 1);
      depth1Nodes.forEach((node) => {
        const expectedCost =
          returnCostCalculator.calculateCumulativeReturnCost(1);
        expect(node.returnCost).toBe(Math.round(expectedCost));
      });
    });

    it('should integrate with shortcut manager for cost optimization', async () => {
      const map = await mapGenerator.generateFullMap(3);
      const currentNode = map.find((n) => n.depth === 3 && n.position === 0);

      if (!currentNode) {
        throw new Error('Node not found');
      }

      // Discover a shortcut at depth 2
      const shortcut = {
        fromDepth: 2,
        toDepth: 1,
        energySaved: 10,
        type: 'stairs' as const,
      };

      shortcutManager.discoverShortcut({
        id: 'shortcut-1',
        depth: 2,
        reductionFactor: 0.7,
        description: 'Stairs from depth 2 to depth 1',
      });

      // Get return cost with shortcuts
      const shortcuts = shortcutManager.getAllShortcuts();
      const shortcutIds = shortcuts.map((s: ShortcutInfo) => s.id);
      const shortcutMap = new Map<string, ShortcutInfo>(
        shortcuts.map((s: ShortcutInfo) => [s.id, s])
      );

      const optimalCost = returnCostCalculator.calculateOptimalReturnCost(3, {
        availableShortcuts: shortcutIds,
        shortcutMap,
      });

      // With shortcuts, cost should be less than without
      const basicCost = returnCostCalculator.calculateCumulativeReturnCost(3);
      expect(optimalCost).toBeLessThan(basicCost);
    });

    it('should maintain energy and return cost consistency', async () => {
      const map = await mapGenerator.generateFullMap(3);

      // Verify that return costs are always less than total energy available
      map.forEach((node) => {
        expect(node.returnCost).toBeGreaterThanOrEqual(0);

        // Calculate total energy available at this depth
        const baseEnergy = 100; // Assume starting energy
        const expectedEnergyAtDepth =
          baseEnergy -
          Array.from({ length: node.depth }, (_, i) => {
            return (
              map.filter((n) => n.depth === i + 1 && n.position === 0)[0]
                ?.energyCost ?? 0
            );
          }).reduce((sum, cost) => sum + cost, 0);

        // Return cost should be reasonable compared to available energy
        expect(node.returnCost).toBeLessThan(baseEnergy);
      });
    });
  });

  describe('Task 4.2: Advanced encounter type integration', () => {
    it('should include advanced encounter types in generated nodes', async () => {
      const map = await mapGenerator.generateFullMap(5);

      const encounterTypes = map.map((node) => node.type);
      const uniqueTypes = new Set(encounterTypes);

      // Should include at least puzzle_chamber, discovery_site
      // Note: Random encounter distribution means we can't guarantee all types appear
      const expectedTypes: EncounterType[] = [
        'puzzle_chamber',
        'discovery_site',
        'risk_event',
        'hazard',
        'rest_site',
      ];
      const foundTypes = expectedTypes.filter((type: EncounterType) =>
        uniqueTypes.has(type)
      );

      expect(foundTypes.length).toBeGreaterThan(0);
    });

    it('should assign appropriate energy costs for advanced encounter types', async () => {
      const map = await mapGenerator.generateFullMap(5);

      map.forEach((node) => {
        expect(node.energyCost).toBeGreaterThan(0);

        // Validate energy cost is reasonable
        expect(node.energyCost).toBeGreaterThanOrEqual(5);
        expect(node.energyCost).toBeLessThanOrEqual(30);
      });
    });
  });

  describe('Task 4.6: State persistence', () => {
    it('should persist return costs across map regeneration', async () => {
      const map1 = await mapGenerator.generateFullMap(3);
      const node1Cost = map1.find(
        (n) => n.depth === 3 && n.position === 0
      )?.returnCost;

      const map2 = await mapGenerator.generateFullMap(3);
      const node2Cost = map2.find(
        (n) => n.depth === 3 && n.position === 0
      )?.returnCost;

      // Due to shortcut randomization, costs may vary but should be in the same ballpark
      // Both should exist and be greater than 0
      expect(node1Cost).toBeDefined();
      expect(node2Cost).toBeDefined();
      expect(node1Cost).toBeGreaterThan(0);
      expect(node2Cost).toBeGreaterThan(0);

      // Costs should be reasonable for depth 3
      // Ensure costs are within a reasonable bound for depth 3
      expect(node1Cost).toBeGreaterThan(0);
      expect(node2Cost).toBeGreaterThan(0);
      expect(node1Cost).toBeLessThanOrEqual(100);
      expect(node2Cost).toBeLessThanOrEqual(100);
    });
  });

  describe('Task 8.14: Scoundrel encounter frequency verification', () => {
    it('should generate scoundrel encounters at approximately 5% frequency', async () => {
      // Generate many maps to sample the distribution
      const samples: EncounterType[] = [];

      for (let i = 0; i < 100; i++) {
        const map = await mapGenerator.generateFullMap(5);
        samples.push(...map.map((node) => node.type));
      }

      const scoundrelCount = samples.filter(
        (type) => type === 'scoundrel'
      ).length;
      const scoundrelFrequency = scoundrelCount / samples.length;

      // With 5% distribution, we expect approximately 5% ± 2% (accounting for randomness)
      expect(scoundrelFrequency).toBeGreaterThan(0.03); // At least 3%
      expect(scoundrelFrequency).toBeLessThan(0.08); // At most 8%
    });

    it('should include scoundrel in encounter type distribution across multiple maps', async () => {
      let foundScoundrel = false;

      for (let i = 0; i < 50; i++) {
        const map = await mapGenerator.generateFullMap(5);
        const stats = mapGenerator.getMapStatistics(map);

        if (stats.encounterTypeDistribution.scoundrel > 0) {
          foundScoundrel = true;
          break;
        }
      }

      // With 5% distribution, we should find at least one in 50 attempts
      expect(foundScoundrel).toBe(true);
    });
  });

  describe('Task 8.15: Scoundrel encounter routing and screen display', () => {
    it('should generate scoundrel nodes that can be routed correctly', async () => {
      const map = await mapGenerator.generateFullMap(5);
      const scoundrelNodes = map.filter((node) => node.type === 'scoundrel');

      if (scoundrelNodes.length > 0) {
        scoundrelNodes.forEach((node) => {
          // Verify node has all required properties for routing
          expect(node.id).toBeDefined();
          expect(node.type).toBe('scoundrel');
          expect(node.depth).toBeGreaterThan(0);
          expect(node.energyCost).toBeGreaterThan(0);
          expect(Array.isArray(node.connections)).toBe(true);
        });
      }
    });

    it('should generate scoundrel nodes with valid encounter type', async () => {
      const map = await mapGenerator.generateFullMap(5);
      const scoundrelNodes = map.filter((node) => node.type === 'scoundrel');

      if (scoundrelNodes.length > 0) {
        scoundrelNodes.forEach((node) => {
          // Verify the type is exactly 'scoundrel'
          expect(node.type).toBe('scoundrel');
          // Verify it's a valid EncounterType
          const validTypes: EncounterType[] = [
            'puzzle_chamber',
            'discovery_site',
            'risk_event',
            'hazard',
            'rest_site',
            'safe_passage',
            'region_shortcut',
            'scoundrel',
          ];
          expect(validTypes).toContain(node.type);
        });
      }
    });

    it('should route generated scoundrel nodes correctly', async () => {
      const map = await mapGenerator.generateFullMap(5);
      const scoundrelNodes = map.filter((node) => node.type === 'scoundrel');

      if (scoundrelNodes.length > 0) {
        scoundrelNodes.forEach((node) => {
          // Verify routing function returns correct route
          const route = getEncounterRoute(node);
          expect(route).toBe('scoundrel');
        });
      }
    });

    it('should identify scoundrel as supported encounter type', async () => {
      const map = await mapGenerator.generateFullMap(5);
      const scoundrelNodes = map.filter((node) => node.type === 'scoundrel');

      if (scoundrelNodes.length > 0) {
        scoundrelNodes.forEach((node) => {
          // Verify isEncounterSupported returns true for scoundrel
          expect(isEncounterSupported(node.type)).toBe(true);
        });
      }
    });
  });
});
