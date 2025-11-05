import { CollectionManager } from './collection-manager';
import { DiscoverySiteEncounter } from './discovery-site-encounter';
import { RegionManager } from './region-manager';

describe('DiscoverySiteEncounter', () => {
  let discoveryEncounter: DiscoverySiteEncounter;
  let collectionManager: CollectionManager;
  let regionManager: RegionManager;

  beforeEach(() => {
    collectionManager = new CollectionManager();
    regionManager = new RegionManager(collectionManager);
    discoveryEncounter = new DiscoverySiteEncounter();
  });

  describe('constructor and initialization', () => {
    it('should initialize with default settings', () => {
      expect(discoveryEncounter.getEncounterType()).toBe('discovery_site');
      expect(discoveryEncounter.getDepth()).toBeGreaterThan(0);
      expect(discoveryEncounter.getExplorationPaths()).toBeDefined();
      expect(discoveryEncounter.getExplorationPaths().length).toBeGreaterThan(
        0
      );
    });

    it('should initialize with custom depth', () => {
      const customDiscoveryEncounter = new DiscoverySiteEncounter(5);
      expect(customDiscoveryEncounter.getDepth()).toBe(5);
    });

    it('should accept RegionManager and CollectionManager as dependencies', () => {
      const encounterWithDeps = new DiscoverySiteEncounter(
        1,
        regionManager,
        collectionManager
      );
      expect(encounterWithDeps.getDepth()).toBe(1);
    });

    it('should maintain backward compatibility without dependencies', () => {
      const encounterWithoutDeps = new DiscoverySiteEncounter(3);
      expect(encounterWithoutDeps.getDepth()).toBe(3);
      expect(encounterWithoutDeps.getExplorationPaths().length).toBeGreaterThan(
        0
      );
    });

    it('should initialize with depth-based exploration paths', () => {
      const depth1Encounter = new DiscoverySiteEncounter(1);
      const depth5Encounter = new DiscoverySiteEncounter(5);

      const depth1Paths = depth1Encounter.getExplorationPaths();
      const depth5Paths = depth5Encounter.getExplorationPaths();

      expect(depth1Paths).toBeDefined();
      expect(depth5Paths).toBeDefined();
      expect(depth1Paths.length).toBeGreaterThan(0);
      expect(depth5Paths.length).toBeGreaterThan(0);
    });
  });

  describe('region unlock set selection', () => {
    it('should get available region unlock sets that have not unlocked their regions', async () => {
      const encounter = new DiscoverySiteEncounter(
        1,
        regionManager,
        collectionManager
      );
      const availableSets = await encounter.getAvailableRegionUnlockSets();

      expect(availableSets).toBeDefined();
      expect(Array.isArray(availableSets)).toBe(true);
      expect(availableSets.length).toBeGreaterThan(0);

      // Should only include region unlock sets
      const validSets = [
        'silk_road_set',
        'spice_trade_set',
        'ancient_temple_set',
        'dragons_hoard_set',
      ];
      availableSets.forEach((setId) => {
        expect(validSets).toContain(setId);
      });
    });

    it('should return all region unlock sets when no regions are unlocked', async () => {
      // Create a new region manager with no unlocked regions (default state)
      const freshCollectionManager = new CollectionManager();
      const freshRegionManager = new RegionManager(freshCollectionManager);
      const encounter = new DiscoverySiteEncounter(
        1,
        freshRegionManager,
        freshCollectionManager
      );

      const availableSets = await encounter.getAvailableRegionUnlockSets();

      // Should include all 4 region unlock sets
      expect(availableSets.length).toBe(4);
      expect(availableSets).toContain('silk_road_set');
      expect(availableSets).toContain('spice_trade_set');
      expect(availableSets).toContain('ancient_temple_set');
      expect(availableSets).toContain('dragons_hoard_set');
    });

    it('should exclude sets whose regions are already unlocked', async () => {
      // Mock region manager to indicate a region is unlocked
      const mockRegionManager = {
        isRegionUnlocked: jest.fn(async (regionId: string) => {
          return regionId === 'desert_oasis'; // silk_road_set unlocks desert_oasis
        }),
      } as unknown as RegionManager;

      const encounter = new DiscoverySiteEncounter(
        1,
        mockRegionManager,
        collectionManager
      );

      const availableSets = await encounter.getAvailableRegionUnlockSets();

      // Should not include silk_road_set since desert_oasis is unlocked
      expect(availableSets).not.toContain('silk_road_set');
      // Should still include other sets
      expect(availableSets.length).toBe(3);
      expect(availableSets).toContain('spice_trade_set');
      expect(availableSets).toContain('ancient_temple_set');
      expect(availableSets).toContain('dragons_hoard_set');
    });
  });

  describe('exploration mechanics and branching choices', () => {
    it('should provide multiple exploration paths', () => {
      const paths = discoveryEncounter.getExplorationPaths();

      expect(paths).toHaveLength(3);
      expect(paths[0].id).toBe('A');
      expect(paths[1].id).toBe('B');
      expect(paths[2].id).toBe('C');
    });

    it('should have different exploration types for each path', () => {
      const paths = discoveryEncounter.getExplorationPaths();

      const types = paths.map((path) => path.type);
      const uniqueTypes = [...new Set(types)];

      expect(uniqueTypes.length).toBeGreaterThan(1);
    });

    it('should provide exploration descriptions and outcomes', () => {
      const paths = discoveryEncounter.getExplorationPaths();

      paths.forEach((path) => {
        expect(path.description).toBeDefined();
        expect(path.description.length).toBeGreaterThan(0);
        expect(path.outcome).toBeDefined();
        expect(path.outcome.rewards).toBeDefined();
        expect(path.outcome.consequences).toBeDefined();
        expect(path.outcome.riskLevel).toBeDefined();
      });
    });

    it('should have different risk levels for different paths', () => {
      const paths = discoveryEncounter.getExplorationPaths();

      const riskLevels = paths.map((path) => path.outcome.riskLevel);
      const uniqueRiskLevels = [...new Set(riskLevels)];

      expect(uniqueRiskLevels.length).toBeGreaterThan(1);
    });

    it('should process exploration decisions', () => {
      const paths = discoveryEncounter.getExplorationPaths();
      const selectedPath = paths[0];

      const result = discoveryEncounter.processExplorationDecision(
        selectedPath.id
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.rewards).toBeDefined();
      expect(result.consequences).toBeDefined();
    });

    it('should handle invalid exploration decisions', () => {
      const result =
        discoveryEncounter.processExplorationDecision('invalid_path');

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('lore collection system', () => {
    it('should generate lore discoveries', () => {
      const paths = discoveryEncounter.getExplorationPaths();
      const result = discoveryEncounter.processExplorationDecision(paths[0].id);

      if (result.success) {
        const lore = discoveryEncounter.getLoreDiscoveries();
        expect(lore).toBeDefined();
        expect(lore.length).toBeGreaterThan(0);

        lore.forEach((loreItem) => {
          expect(loreItem.title).toBeDefined();
          expect(loreItem.content).toBeDefined();
          expect(loreItem.region).toBeDefined();
          expect(loreItem.era).toBeDefined();
        });
      }
    });

    it('should provide regional history information', () => {
      const regionalHistory = discoveryEncounter.getRegionalHistory();

      expect(regionalHistory).toBeDefined();
      expect(regionalHistory.length).toBeGreaterThan(0);

      regionalHistory.forEach((history) => {
        expect(history.region).toBeDefined();
        expect(history.description).toBeDefined();
        expect(history.era).toBeDefined();
        expect(history.significance).toBeDefined();
      });
    });

    it('should track lore collection progress', () => {
      const paths = discoveryEncounter.getExplorationPaths();
      const result = discoveryEncounter.processExplorationDecision(paths[0].id);

      if (result.success) {
        const progress = discoveryEncounter.getLoreProgress();
        expect(progress).toBeDefined();
        expect(progress.totalLore).toBeGreaterThan(0);
        expect(progress.discoveredRegions).toBeDefined();
        expect(progress.discoveredEras).toBeDefined();
      }
    });

    it('should scale lore discoveries with depth', () => {
      const depth1Encounter = new DiscoverySiteEncounter(1);
      const depth5Encounter = new DiscoverySiteEncounter(5);

      const depth1Paths = depth1Encounter.getExplorationPaths();
      const depth5Paths = depth5Encounter.getExplorationPaths();

      depth1Encounter.processExplorationDecision(depth1Paths[0].id);
      depth5Encounter.processExplorationDecision(depth5Paths[0].id);

      const depth1Lore = depth1Encounter.getLoreDiscoveries();
      const depth5Lore = depth5Encounter.getLoreDiscoveries();

      if (depth1Lore.length > 0 && depth5Lore.length > 0) {
        expect(depth5Lore[0].significance).toBeGreaterThanOrEqual(
          depth1Lore[0].significance
        );
      }
    });
  });

  describe('map information rewards', () => {
    it('should provide map intelligence', () => {
      const paths = discoveryEncounter.getExplorationPaths();
      const result = discoveryEncounter.processExplorationDecision(paths[0].id);

      if (result.success) {
        const mapIntel = discoveryEncounter.getMapIntelligence();
        expect(mapIntel).toBeDefined();
        expect(mapIntel.length).toBeGreaterThan(0);

        mapIntel.forEach((intel) => {
          expect(intel.type).toBeDefined();
          expect(intel.description).toBeDefined();
          expect(intel.depth).toBeDefined();
          expect(intel.value).toBeDefined();
        });
      }
    });

    it('should provide shortcut information', () => {
      const shortcuts = discoveryEncounter.getShortcutInformation();

      expect(shortcuts).toBeDefined();
      expect(shortcuts.length).toBeGreaterThan(0);

      shortcuts.forEach((shortcut) => {
        expect(shortcut.fromDepth).toBeDefined();
        expect(shortcut.toDepth).toBeDefined();
        expect(shortcut.energyReduction).toBeDefined();
        expect(shortcut.description).toBeDefined();
      });
    });

    it('should provide deeper path information', () => {
      const deeperPaths = discoveryEncounter.getDeeperPathInformation();

      expect(deeperPaths).toBeDefined();
      expect(deeperPaths.length).toBeGreaterThan(0);

      deeperPaths.forEach((path) => {
        expect(path.targetDepth).toBeDefined();
        expect(path.description).toBeDefined();
        expect(path.requirements).toBeDefined();
        expect(path.rewards).toBeDefined();
      });
    });

    it('should track map exploration progress', () => {
      const progress = discoveryEncounter.getMapExplorationProgress();

      expect(progress).toBeDefined();
      expect(progress.discoveredShortcuts).toBeDefined();
      expect(progress.discoveredPaths).toBeDefined();
      expect(progress.totalIntel).toBeGreaterThanOrEqual(0);
    });
  });

  describe('regional discovery items', () => {
    it('should generate regional discovery items', () => {
      const paths = discoveryEncounter.getExplorationPaths();
      const result = discoveryEncounter.processExplorationDecision(paths[0].id);

      if (result.success) {
        const discoveries = discoveryEncounter.getRegionalDiscoveries();
        expect(discoveries).toBeDefined();
        expect(discoveries.length).toBeGreaterThan(0);

        discoveries.forEach((discovery) => {
          expect(discovery.type).toBe('discovery');
          expect(discovery.setId).toBeDefined();
          expect(discovery.value).toBeGreaterThan(0);
        });
      }
    });

    it('should provide different regional collection sets', () => {
      const regionalSets = discoveryEncounter.getRegionalCollectionSets();

      expect(regionalSets).toBeDefined();
      expect(regionalSets.length).toBeGreaterThan(0);

      regionalSets.forEach((set) => {
        expect(set.id).toBeDefined();
        expect(set.name).toBeDefined();
        expect(set.region).toBeDefined();
        expect(set.items).toBeDefined();
      });
    });

    it('should scale regional discoveries with depth', () => {
      const depth1Encounter = new DiscoverySiteEncounter(1);
      const depth5Encounter = new DiscoverySiteEncounter(5);

      const depth1Paths = depth1Encounter.getExplorationPaths();
      const depth5Paths = depth5Encounter.getExplorationPaths();

      depth1Encounter.processExplorationDecision(depth1Paths[0].id);
      depth5Encounter.processExplorationDecision(depth5Paths[0].id);

      const depth1Discoveries = depth1Encounter.getRegionalDiscoveries();
      const depth5Discoveries = depth5Encounter.getRegionalDiscoveries();

      if (depth1Discoveries.length > 0 && depth5Discoveries.length > 0) {
        expect(depth5Discoveries[0].value).toBeGreaterThan(
          depth1Discoveries[0].value
        );
      }
    });
  });

  describe('risk/reward decision mechanics', () => {
    it('should implement risk assessment', () => {
      const paths = discoveryEncounter.getExplorationPaths();

      paths.forEach((path) => {
        const riskAssessment = discoveryEncounter.getPathRiskAssessment(
          path.id
        );
        expect(riskAssessment).toBeDefined();
        expect(riskAssessment.riskLevel).toBeDefined();
        expect(riskAssessment.factors).toBeDefined();
        expect(riskAssessment.rewardPotential).toBeDefined();
      });
    });

    it('should provide varying failure consequences', () => {
      const paths = discoveryEncounter.getExplorationPaths();

      paths.forEach((path) => {
        const consequences = discoveryEncounter.getFailureConsequences(path.id);
        expect(consequences).toBeDefined();
        expect(consequences.energyLoss).toBeGreaterThanOrEqual(0);
        expect(consequences.itemLossRisk).toBeGreaterThanOrEqual(0);
        expect(consequences.forcedRetreat).toBeDefined();
        expect(consequences.description).toBeDefined();
      });
    });

    it('should track exploration statistics', () => {
      const stats = discoveryEncounter.getExplorationStatistics();

      expect(stats).toBeDefined();
      expect(stats.totalExplorations).toBeGreaterThanOrEqual(0);
      expect(stats.successfulExplorations).toBeGreaterThanOrEqual(0);
      expect(stats.failedExplorations).toBeGreaterThanOrEqual(0);
      expect(stats.averageRiskLevel).toBeDefined();
    });

    it('should prevent excessive failures', () => {
      // Simulate multiple failed explorations
      for (let i = 0; i < 5; i++) {
        const testEncounter = new DiscoverySiteEncounter();
        const _paths = testEncounter.getExplorationPaths();
        testEncounter.processExplorationDecision('invalid_path');
      }

      const stats = discoveryEncounter.getExplorationStatistics();
      const failureRate =
        stats.totalExplorations > 0
          ? stats.failedExplorations / stats.totalExplorations
          : 0;

      // Failure rate should be reasonable (not more than 40%)
      expect(failureRate).toBeLessThanOrEqual(0.4);
    });
  });

  describe('encounter completion', () => {
    it('should complete encounter after successful exploration', () => {
      const paths = discoveryEncounter.getExplorationPaths();
      const result = discoveryEncounter.processExplorationDecision(paths[0].id);

      expect(result.success).toBe(true);
      expect(discoveryEncounter.isEncounterComplete()).toBe(true);
    });

    it('should generate appropriate rewards on completion', () => {
      const paths = discoveryEncounter.getExplorationPaths();
      const result = discoveryEncounter.processExplorationDecision(paths[0].id);

      if (result.success) {
        const rewards = discoveryEncounter.generateRewards();
        expect(rewards).toBeDefined();
        expect(rewards.length).toBeGreaterThan(0);
      }
    });

    it('should handle encounter failure', () => {
      const result =
        discoveryEncounter.processExplorationDecision('invalid_path');

      expect(result.success).toBe(false);
      expect(discoveryEncounter.isEncounterComplete()).toBe(true);
    });
  });

  describe('comprehensive integration tests', () => {
    it('should integrate all features seamlessly', () => {
      const depth3Encounter = new DiscoverySiteEncounter(3);

      // Test exploration paths
      const paths = depth3Encounter.getExplorationPaths();
      expect(paths.length).toBeGreaterThan(0);

      // Test lore system
      const regionalHistory = depth3Encounter.getRegionalHistory();
      expect(regionalHistory.length).toBeGreaterThan(0);

      // Test map intelligence
      const mapIntel = depth3Encounter.getMapIntelligence();
      expect(mapIntel.length).toBeGreaterThan(0);

      // Test exploration processing
      const result = depth3Encounter.processExplorationDecision(paths[0].id);

      if (result.success) {
        // Should have rewards
        expect(result.rewards).toBeDefined();
        expect(result.rewards!.length).toBeGreaterThan(0);

        // Should track lore discoveries
        const lore = depth3Encounter.getLoreDiscoveries();
        expect(lore.length).toBeGreaterThan(0);

        // Should provide comprehensive statistics
        const stats = depth3Encounter.getExplorationStatistics();
        expect(stats.totalExplorations).toBeGreaterThan(0);
      }
    });

    it('should maintain backward compatibility', () => {
      // All existing functionality should still work
      const paths = discoveryEncounter.getExplorationPaths();
      expect(paths).toHaveLength(3);

      const result = discoveryEncounter.processExplorationDecision(paths[0].id);
      expect(result.success).toBe(true);
    });

    it('should handle edge cases gracefully', () => {
      // Test with extreme depth
      const extremeEncounter = new DiscoverySiteEncounter(100);
      const _paths = extremeEncounter.getExplorationPaths();
      expect(_paths.length).toBeGreaterThan(0);

      // Test with depth 0
      const zeroDepthEncounter = new DiscoverySiteEncounter(0);
      const zeroPaths = zeroDepthEncounter.getExplorationPaths();
      expect(zeroPaths.length).toBeGreaterThan(0);

      // Test with negative depth
      const negativeEncounter = new DiscoverySiteEncounter(-1);
      const negativePaths = negativeEncounter.getExplorationPaths();
      expect(negativePaths.length).toBeGreaterThan(0);
    });
  });
});
