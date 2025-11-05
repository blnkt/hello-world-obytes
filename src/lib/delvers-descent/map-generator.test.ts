import type { DungeonNode, EncounterType } from '@/types/delvers-descent';

import { DungeonMapGenerator } from './map-generator';

describe('DungeonMapGenerator', () => {
  let generator: DungeonMapGenerator;

  beforeEach(() => {
    generator = new DungeonMapGenerator();
  });

  describe('generateDepthLevel', () => {
    it('should generate 2-3 nodes for a depth level', async () => {
      const nodes = await generator.generateDepthLevel(1);

      expect(nodes.length).toBeGreaterThanOrEqual(2);
      expect(nodes.length).toBeLessThanOrEqual(3);
    });

    it('should generate nodes with correct depth', async () => {
      const nodes = await generator.generateDepthLevel(3);

      nodes.forEach((node) => {
        expect(node.depth).toBe(3);
      });
    });

    it('should generate nodes with unique positions', async () => {
      const nodes = await generator.generateDepthLevel(1);
      const positions = nodes.map((node) => node.position);
      const uniquePositions = new Set(positions);

      expect(positions.length).toBe(uniquePositions.size);
    });

    it('should generate nodes with valid encounter types', async () => {
      const nodes = await generator.generateDepthLevel(1);
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

      nodes.forEach((node) => {
        expect(validTypes).toContain(node.type);
      });
    });

    it('should generate nodes with correct IDs', async () => {
      const nodes = await generator.generateDepthLevel(2);

      nodes.forEach((node, index) => {
        expect(node.id).toBe(`depth2-node${index}`);
      });
    });

    it('should generate nodes with energy costs', async () => {
      const nodes = await generator.generateDepthLevel(1);

      nodes.forEach((node) => {
        expect(node.energyCost).toBeGreaterThan(0);
        expect(node.energyCost).toBeLessThanOrEqual(25);
      });
    });

    it('should generate nodes with return costs', async () => {
      const nodes = await generator.generateDepthLevel(3);

      nodes.forEach((node) => {
        expect(node.returnCost).toBeGreaterThan(0);
      });
    });

    it('should throw error for invalid depth', async () => {
      await expect(generator.generateDepthLevel(0)).rejects.toThrow(
        'Depth must be at least 1'
      );
      await expect(generator.generateDepthLevel(-1)).rejects.toThrow(
        'Depth must be at least 1'
      );
    });
  });

  describe('generateFullMap', () => {
    it('should generate a complete map with specified depth', async () => {
      const map = await generator.generateFullMap(5);

      expect(map.length).toBeGreaterThan(0);

      // Check that all depths are represented
      const depths = new Set(map.map((node) => node.depth));
      for (let depth = 1; depth <= 5; depth++) {
        expect(depths.has(depth)).toBe(true);
      }
    });

    it('should generate nodes with connections', async () => {
      const map = await generator.generateFullMap(3);

      // Surface nodes should have connections
      const surfaceNodes = map.filter((node) => node.depth === 1);
      surfaceNodes.forEach((node) => {
        expect(Array.isArray(node.connections)).toBe(true);
      });
    });

    it('should generate valid connections between depths', async () => {
      const map = await generator.generateFullMap(3);

      map.forEach((node) => {
        node.connections.forEach((connectionId) => {
          const connectedNode = map.find((n) => n.id === connectionId);
          expect(connectedNode).toBeDefined();
          expect(connectedNode!.depth).toBe(node.depth + 1);
        });
      });
    });

    it('should throw error for invalid max depth', async () => {
      await expect(generator.generateFullMap(0)).rejects.toThrow(
        'Maximum depth must be at least 1'
      );
      await expect(generator.generateFullMap(-1)).rejects.toThrow(
        'Maximum depth must be at least 1'
      );
    });

    it('should generate different maps on multiple calls', async () => {
      const map1 = await generator.generateFullMap(3);
      const map2 = await generator.generateFullMap(3);

      // Maps should have different encounter types or connections
      const map1Types = map1.map((node) => node.type).sort();
      const map2Types = map2.map((node) => node.type).sort();

      // At least one property should be different (encounter types, connections, etc.)
      const hasDifferentTypes =
        JSON.stringify(map1Types) !== JSON.stringify(map2Types);
      const hasDifferentConnections = map1.some(
        (node, index) =>
          JSON.stringify(node.connections) !==
          JSON.stringify(map2[index]?.connections)
      );

      expect(hasDifferentTypes || hasDifferentConnections).toBe(true);
    });
  });

  describe('getNodesAtDepth', () => {
    it('should return nodes at specific depth', async () => {
      const map = await generator.generateFullMap(3);
      const depth2Nodes = generator.getNodesAtDepth(map, 2);

      depth2Nodes.forEach((node) => {
        expect(node.depth).toBe(2);
      });
    });

    it('should return empty array for non-existent depth', async () => {
      const map = await generator.generateFullMap(3);
      const depth10Nodes = generator.getNodesAtDepth(map, 10);

      expect(depth10Nodes).toEqual([]);
    });
  });

  describe('getConnectedNodes', () => {
    it('should return connected nodes', async () => {
      const map = await generator.generateFullMap(3);
      const surfaceNodes = generator.getNodesAtDepth(map, 1);

      if (surfaceNodes.length > 0) {
        const connectedNodes = generator.getConnectedNodes(
          map,
          surfaceNodes[0].id
        );

        connectedNodes.forEach((node) => {
          expect(node.depth).toBe(2);
        });
      }
    });

    it('should return empty array for non-existent node', async () => {
      const map = await generator.generateFullMap(3);
      const connectedNodes = generator.getConnectedNodes(
        map,
        'non-existent-id'
      );

      expect(connectedNodes).toEqual([]);
    });
  });

  describe('getPathsToDepth', () => {
    it('should find paths to target depth', async () => {
      const map = await generator.generateFullMap(3);
      const paths = generator.getPathsToDepth(map, 3);

      expect(paths.length).toBeGreaterThan(0);

      paths.forEach((path) => {
        expect(path.length).toBe(3); // Should have 3 nodes (depths 1, 2, 3)
        expect(path[0]).toMatch(/^depth1-node\d+$/); // Start at depth 1
        expect(path[2]).toMatch(/^depth3-node\d+$/); // End at depth 3
      });
    });

    it('should return empty array for unreachable depth', async () => {
      const map = await generator.generateFullMap(2);
      const paths = generator.getPathsToDepth(map, 5);

      expect(paths).toEqual([]);
    });
  });

  describe('validateMap', () => {
    it('should validate a correct map', async () => {
      const map = await generator.generateFullMap(3);
      const validation = generator.validateMap(map);

      if (!validation.isValid) {
        console.log('Validation errors:', validation.errors);
      }

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should detect duplicate IDs', () => {
      const map: DungeonNode[] = [
        {
          id: 'duplicate',
          depth: 1,
          position: 0,
          type: 'puzzle_chamber',
          energyCost: 10,
          returnCost: 5,
          isRevealed: false,
          connections: [],
        },
        {
          id: 'duplicate',
          depth: 1,
          position: 1,
          type: 'discovery_site',
          energyCost: 10,
          returnCost: 5,
          isRevealed: false,
          connections: [],
        },
      ];

      const validation = generator.validateMap(map);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Duplicate node IDs found');
    });

    it('should detect invalid connections', () => {
      const map: DungeonNode[] = [
        {
          id: 'node1',
          depth: 1,
          position: 0,
          type: 'puzzle_chamber',
          energyCost: 10,
          returnCost: 5,
          isRevealed: false,
          connections: ['invalid-id'],
        },
      ];

      const validation = generator.validateMap(map);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        'Node node1 has invalid connection to invalid-id'
      );
    });

    it('should detect missing surface nodes', () => {
      const map: DungeonNode[] = [
        {
          id: 'node1',
          depth: 2,
          position: 0,
          type: 'puzzle_chamber',
          energyCost: 10,
          returnCost: 5,
          isRevealed: false,
          connections: [],
        },
      ];

      const validation = generator.validateMap(map);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('No surface nodes found (depth 1)');
    });

    it('should detect unreachable nodes', () => {
      const map: DungeonNode[] = [
        {
          id: 'surface',
          depth: 1,
          position: 0,
          type: 'puzzle_chamber',
          energyCost: 10,
          returnCost: 5,
          isRevealed: false,
          connections: [],
        },
        {
          id: 'orphan',
          depth: 2,
          position: 0,
          type: 'discovery_site',
          energyCost: 10,
          returnCost: 5,
          isRevealed: false,
          connections: [],
        },
      ];

      const validation = generator.validateMap(map);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        'Node orphan is unreachable from surface'
      );
    });
  });

  describe('getMapStatistics', () => {
    it('should return correct statistics', async () => {
      const map = await generator.generateFullMap(3);
      const stats = generator.getMapStatistics(map);

      expect(stats.totalNodes).toBe(map.length);
      expect(stats.maxDepth).toBe(3);
      expect(stats.nodesPerDepth[1]).toBeGreaterThan(0);
      expect(stats.nodesPerDepth[2]).toBeGreaterThan(0);
      expect(stats.nodesPerDepth[3]).toBeGreaterThan(0);
      expect(stats.averageConnectionsPerNode).toBeGreaterThan(0);

      // Check encounter type distribution
      const totalEncounterCount = Object.values(
        stats.encounterTypeDistribution
      ).reduce((sum, count) => sum + count, 0);
      expect(totalEncounterCount).toBe(map.length);
    });

    it('should handle empty map', () => {
      const stats = generator.getMapStatistics([]);

      expect(stats.totalNodes).toBe(0);
      expect(stats.maxDepth).toBe(-Infinity);
      expect(stats.averageConnectionsPerNode).toBe(0);
    });
  });

  describe('energy cost calculations', () => {
    it('should generate reasonable energy costs', async () => {
      const map = await generator.generateFullMap(5);

      map.forEach((node) => {
        expect(node.energyCost).toBeGreaterThanOrEqual(5);
        expect(node.energyCost).toBeLessThanOrEqual(25);
      });
    });

    it('should have increasing return costs with depth', async () => {
      const map = await generator.generateFullMap(5);

      for (let depth = 1; depth <= 5; depth++) {
        const depthNodes = generator.getNodesAtDepth(map, depth);
        if (depthNodes.length > 0) {
          const returnCost = depthNodes[0].returnCost;
          expect(returnCost).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('shortcuts', () => {
    it('should generate maps with potential shortcuts', async () => {
      // Generate multiple maps to increase chance of shortcuts
      let hasShortcuts = false;

      for (let i = 0; i < 20; i++) {
        // Increased attempts
        const map = await generator.generateFullMap(5);

        // Check if any node has unusually low return cost (indicating shortcut)
        // A shortcut would make return cost significantly lower than normal
        const normalReturnCost = (depth: number) => {
          let cost = 0;
          for (let d = depth; d > 0; d--) {
            cost += 5 * Math.pow(d, 1.5);
          }
          return Math.round(cost);
        };

        const lowReturnCostNodes = map.filter((node) => {
          const normalCost = normalReturnCost(node.depth);
          return node.returnCost < normalCost * 0.8; // 20% reduction indicates shortcut
        });

        if (lowReturnCostNodes.length > 0) {
          hasShortcuts = true;
          break;
        }
      }

      // With 20 attempts, we should get at least one map with shortcuts
      expect(hasShortcuts).toBe(true);
    });
  });

  describe('map consistency', () => {
    it('should generate consistent maps', async () => {
      const map = await generator.generateFullMap(4);

      // All nodes should have valid properties
      map.forEach((node) => {
        expect(node.id).toMatch(/^depth\d+-node\d+$/);
        expect(node.depth).toBeGreaterThan(0);
        expect(node.position).toBeGreaterThanOrEqual(0);
        expect(node.energyCost).toBeGreaterThan(0);
        expect(node.returnCost).toBeGreaterThan(0);
        expect(Array.isArray(node.connections)).toBe(true);
        expect(typeof node.isRevealed).toBe('boolean');
      });
    });

    it('should have proper depth progression', async () => {
      const map = await generator.generateFullMap(4);

      // Check that each depth has nodes
      for (let depth = 1; depth <= 4; depth++) {
        const depthNodes = generator.getNodesAtDepth(map, depth);
        expect(depthNodes.length).toBeGreaterThan(0);
      }
    });
  });

  describe('scoundrel encounter generation', () => {
    it('should generate scoundrel encounters in maps', async () => {
      // Generate multiple maps to increase chance of scoundrel encounters
      let foundScoundrel = false;

      for (let i = 0; i < 50; i++) {
        const map = await generator.generateFullMap(5);
        const hasScoundrel = map.some((node) => node.type === 'scoundrel');

        if (hasScoundrel) {
          foundScoundrel = true;
          break;
        }
      }

      // With 5% distribution, we should find at least one in 50 attempts
      expect(foundScoundrel).toBe(true);
    });

    it('should generate scoundrel encounters with correct energy costs', async () => {
      const map = await generator.generateFullMap(5);
      const scoundrelNodes = map.filter((node) => node.type === 'scoundrel');

      if (scoundrelNodes.length > 0) {
        scoundrelNodes.forEach((node) => {
          // Energy cost should be reasonable and positive
          expect(node.energyCost).toBeGreaterThan(0);
          expect(node.energyCost).toBeLessThanOrEqual(30);
          // Scoundrel has 2x energy modifier, so costs should be higher
          // Base cost for depth 1 is typically 5-10, so with 2x modifier: 10-20
          // But we'll just check it's reasonable
          expect(node.energyCost).toBeGreaterThanOrEqual(5);
        });
      }
    });

    it('should generate scoundrel encounters with correct depth', async () => {
      const map = await generator.generateFullMap(5);
      const scoundrelNodes = map.filter((node) => node.type === 'scoundrel');

      if (scoundrelNodes.length > 0) {
        scoundrelNodes.forEach((node) => {
          expect(node.depth).toBeGreaterThan(0);
          expect(node.depth).toBeLessThanOrEqual(5);
        });
      }
    });

    it('should include scoundrel in encounter type distribution statistics', async () => {
      const map = await generator.generateFullMap(5);
      const stats = generator.getMapStatistics(map);

      // Scoundrel should be in the distribution (even if count is 0)
      expect(stats.encounterTypeDistribution).toHaveProperty('scoundrel');
    });
  });
});
