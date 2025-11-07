/**
 * Integration tests for grouping-based map generation
 * Tests full depth level generation with various scenarios
 */

import type { EncounterType } from '@/types/delvers-descent';
import {
  ENCOUNTER_GROUPINGS,
  getEncounterGrouping,
  type EncounterGrouping,
} from '@/types/delvers-descent';

import { DEFAULT_BALANCE_CONFIG } from '../balance-config';
import { DungeonMapGenerator } from '../map-generator';

describe('Map Generator Grouping Integration Tests', () => {
  let generator: DungeonMapGenerator;

  beforeEach(() => {
    generator = new DungeonMapGenerator();
  });

  describe('Full Depth Level Generation', () => {
    it('should generate valid depth levels with grouping-based selection', async () => {
      for (let depth = 1; depth <= 20; depth++) {
        const nodes = await generator.generateDepthLevel(depth);

        // Should generate 2-3 nodes
        expect(nodes.length).toBeGreaterThanOrEqual(2);
        expect(nodes.length).toBeLessThanOrEqual(3);

        // All nodes should have valid encounter types
        nodes.forEach((node) => {
          expect(node.type).toBeDefined();
          expect(node.type).not.toBe('');
          expect(node.depth).toBe(depth);
        });
      }
    });

    it('should respect depth constraints across multiple depth levels', async () => {
      const recoveryNavEncounters: EncounterType[] = [
        'rest_site',
        'region_shortcut',
        'safe_passage',
      ];

      // Test depths 1-10 (recovery_and_navigation should be excluded)
      for (let depth = 1; depth <= 10; depth++) {
        for (let i = 0; i < 10; i++) {
          const nodes = await generator.generateDepthLevel(depth);
          nodes.forEach((node) => {
            expect(recoveryNavEncounters).not.toContain(node.type);
          });
        }
      }

      // Test depths 11-20 (recovery_and_navigation should be available)
      let foundRecoveryNav = false;
      for (let depth = 11; depth <= 20; depth++) {
        for (let i = 0; i < 10; i++) {
          const nodes = await generator.generateDepthLevel(depth);
          if (nodes.some((node) => recoveryNavEncounters.includes(node.type))) {
            foundRecoveryNav = true;
            break;
          }
        }
        if (foundRecoveryNav) {
          break;
        }
      }
      expect(foundRecoveryNav).toBe(true);
    });

    it('should maintain no duplicate encounters within a depth level', async () => {
      for (let depth = 1; depth <= 20; depth++) {
        for (let i = 0; i < 50; i++) {
          const nodes = await generator.generateDepthLevel(depth);
          const encounterTypes = nodes.map((node) => node.type);
          const uniqueTypes = new Set(encounterTypes);

          expect(encounterTypes.length).toBe(uniqueTypes.size);
        }
      }
    });

    it('should maintain no duplicate groupings within a depth level', async () => {
      for (let depth = 1; depth <= 20; depth++) {
        for (let i = 0; i < 50; i++) {
          const nodes = await generator.generateDepthLevel(depth);
          const groupings = nodes
            .map((node) => getEncounterGrouping(node.type))
            .filter((g) => g !== null) as EncounterGrouping[];
          const uniqueGroupings = new Set(groupings);

          expect(groupings.length).toBe(uniqueGroupings.size);
        }
      }
    });
  });

  describe('Grouping Distribution Scenarios', () => {
    it('should distribute groupings according to configured weights at depths > 10', async () => {
      const expectedDistribution =
        DEFAULT_BALANCE_CONFIG.grouping.encounterGroupingDistribution;
      const sampleSize = 500;
      const groupingCounts: Record<EncounterGrouping, number> = {
        minigame: 0,
        loot: 0,
        recovery_and_navigation: 0,
        passive: 0,
      };

      // Generate depth levels at depths > 10
      for (let i = 0; i < sampleSize; i++) {
        const depth = Math.floor(Math.random() * 10) + 11; // Random depth 11-20
        const nodes = await generator.generateDepthLevel(depth);
        nodes.forEach((node) => {
          const grouping = getEncounterGrouping(node.type);
          if (grouping) {
            groupingCounts[grouping]++;
          }
        });
      }

      const totalEncounters = Object.values(groupingCounts).reduce(
        (sum, count) => sum + count,
        0
      );

      // Verify all groupings appear
      Object.keys(expectedDistribution).forEach((grouping) => {
        const count = groupingCounts[grouping as EncounterGrouping];
        expect(count).toBeGreaterThan(0);
        expect(count / totalEncounters).toBeGreaterThan(0.05); // At least 5% of encounters
      });
    });

    it('should redistribute weights correctly at depths 1-10', async () => {
      const sampleSize = 500;
      const groupingCounts: Record<EncounterGrouping, number> = {
        minigame: 0,
        loot: 0,
        recovery_and_navigation: 0,
        passive: 0,
      };

      // Generate depth levels at depths 1-10
      for (let i = 0; i < sampleSize; i++) {
        const depth = Math.floor(Math.random() * 10) + 1; // Random depth 1-10
        const nodes = await generator.generateDepthLevel(depth);
        nodes.forEach((node) => {
          const grouping = getEncounterGrouping(node.type);
          if (grouping) {
            groupingCounts[grouping]++;
          }
        });
      }

      // recovery_and_navigation should never appear
      expect(groupingCounts.recovery_and_navigation).toBe(0);

      // Other groupings should appear
      const otherGroupingsCount =
        groupingCounts.minigame +
        groupingCounts.loot +
        groupingCounts.passive;
      expect(otherGroupingsCount).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases and Fallback Behavior', () => {
    it('should handle edge case when all encounters in a grouping are exhausted', async () => {
      // This is unlikely but should be handled gracefully
      // Generate many depth levels to potentially exhaust encounters
      for (let i = 0; i < 100; i++) {
        const depth = Math.floor(Math.random() * 20) + 1;
        const nodes = await generator.generateDepthLevel(depth);

        // Should always generate valid nodes
        expect(nodes.length).toBeGreaterThanOrEqual(2);
        expect(nodes.length).toBeLessThanOrEqual(3);

        nodes.forEach((node) => {
          expect(node.type).toBeDefined();
          expect(node.type).not.toBe('');
        });
      }
    });

    it('should handle depth 1 correctly with constraints', async () => {
      const recoveryNavEncounters: EncounterType[] = [
        'rest_site',
        'region_shortcut',
        'safe_passage',
      ];

      for (let i = 0; i < 100; i++) {
        const nodes = await generator.generateDepthLevel(1);

        expect(nodes.length).toBeGreaterThanOrEqual(2);
        expect(nodes.length).toBeLessThanOrEqual(3);

        nodes.forEach((node) => {
          expect(recoveryNavEncounters).not.toContain(node.type);
        });
      }
    });

    it('should handle very deep depths correctly', async () => {
      const nodes = await generator.generateDepthLevel(100);

      expect(nodes.length).toBeGreaterThanOrEqual(2);
      expect(nodes.length).toBeLessThanOrEqual(3);

      nodes.forEach((node) => {
        expect(node.depth).toBe(100);
        expect(node.type).toBeDefined();
      });
    });
  });

  describe('Full Map Generation with Groupings', () => {
    it('should generate full map respecting grouping constraints', async () => {
      const map = await generator.generateFullMap(15);
      const recoveryNavEncounters: EncounterType[] = [
        'rest_site',
        'region_shortcut',
        'safe_passage',
      ];

      // Check depths 1-10
      for (let depth = 1; depth <= 10; depth++) {
        const depthNodes = map.filter((node) => node.depth === depth);
        depthNodes.forEach((node) => {
          expect(recoveryNavEncounters).not.toContain(node.type);
        });
      }

      // Verify no duplicate encounters within each depth level
      for (let depth = 1; depth <= 15; depth++) {
        const depthNodes = map.filter((node) => node.depth === depth);
        const encounterTypes = depthNodes.map((node) => node.type);
        const uniqueTypes = new Set(encounterTypes);

        expect(encounterTypes.length).toBe(uniqueTypes.size);
      }

      // Verify no duplicate groupings within each depth level
      for (let depth = 1; depth <= 15; depth++) {
        const depthNodes = map.filter((node) => node.depth === depth);
        const groupings = depthNodes
          .map((node) => getEncounterGrouping(node.type))
          .filter((g) => g !== null) as EncounterGrouping[];
        const uniqueGroupings = new Set(groupings);

        expect(groupings.length).toBe(uniqueGroupings.size);
      }
    });
  });
});

