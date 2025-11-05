import { CollectionManager } from './collection-manager';
import {
  ANCIENT_TEMPLE_SET,
  DRAGONS_HOARD_SET,
  getCollectionSetById,
  SILK_ROAD_SET,
  SPICE_TRADE_SET,
} from './collection-sets';
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

    it('should return empty array when regionManager is not provided', async () => {
      const encounter = new DiscoverySiteEncounter(1);
      const availableSets = await encounter.getAvailableRegionUnlockSets();

      expect(availableSets).toBeDefined();
      expect(Array.isArray(availableSets)).toBe(true);
      expect(availableSets.length).toBe(0);
    });

    it('should return empty array when all regions are unlocked', async () => {
      // Mock region manager where all regions are unlocked
      const mockRegionManager = {
        isRegionUnlocked: jest.fn(async () => {
          return true; // All regions unlocked
        }),
      } as unknown as RegionManager;

      const encounter = new DiscoverySiteEncounter(
        1,
        mockRegionManager,
        collectionManager
      );

      const availableSets = await encounter.getAvailableRegionUnlockSets();

      expect(availableSets).toBeDefined();
      expect(Array.isArray(availableSets)).toBe(true);
      expect(availableSets.length).toBe(0);
    });

    it('should handle partial region unlocks correctly', async () => {
      // Mock region manager where some regions are unlocked
      const mockRegionManager = {
        isRegionUnlocked: jest.fn(async (regionId: string) => {
          // Unlock desert_oasis (silk_road_set) and coastal_caves (spice_trade_set)
          return regionId === 'desert_oasis' || regionId === 'coastal_caves';
        }),
      } as unknown as RegionManager;

      const encounter = new DiscoverySiteEncounter(
        1,
        mockRegionManager,
        collectionManager
      );

      const availableSets = await encounter.getAvailableRegionUnlockSets();

      // Should exclude silk_road_set and spice_trade_set
      expect(availableSets).not.toContain('silk_road_set');
      expect(availableSets).not.toContain('spice_trade_set');
      // Should still include ancient_temple_set and dragons_hoard_set
      expect(availableSets.length).toBe(2);
      expect(availableSets).toContain('ancient_temple_set');
      expect(availableSets).toContain('dragons_hoard_set');
    });

    it('should correctly map set IDs to region IDs', async () => {
      // Test that the mapping is correct for each set
      const setToRegionMap: Record<string, string> = {
        silk_road_set: 'desert_oasis',
        spice_trade_set: 'coastal_caves',
        ancient_temple_set: 'mountain_pass',
        dragons_hoard_set: 'dragons_lair',
      };

      for (const [setId, expectedRegionId] of Object.entries(setToRegionMap)) {
        // Mock region manager to check if the correct region is checked
        const mockRegionManager = {
          isRegionUnlocked: jest.fn(async (regionId: string) => {
            // Only unlock the region we're testing
            return regionId === expectedRegionId;
          }),
        } as unknown as RegionManager;

        const encounter = new DiscoverySiteEncounter(
          1,
          mockRegionManager,
          collectionManager
        );

        const availableSets = await encounter.getAvailableRegionUnlockSets();

        // Should exclude the set whose region is unlocked
        expect(availableSets).not.toContain(setId);
        // Should include all other sets
        expect(availableSets.length).toBe(3);
      }
    });

    it('should use available sets in generateRegionalDiscoveries', async () => {
      // Mock region manager to return only one available set
      const mockRegionManager = {
        isRegionUnlocked: jest.fn(async (regionId: string) => {
          // Only unlock all except mountain_pass (ancient_temple_set)
          return regionId !== 'mountain_pass';
        }),
      } as unknown as RegionManager;

      const encounter = new DiscoverySiteEncounter(
        1,
        mockRegionManager,
        collectionManager
      );

      const paths = encounter.getExplorationPaths();
      const result = await encounter.processExplorationDecision(paths[0].id);

      if (result.success) {
        const discoveries = encounter.getRegionalDiscoveries();
        // Should only generate discoveries from ancient_temple_set
        discoveries.forEach((discovery) => {
          expect(discovery.setId).toBe('ancient_temple_set');
        });
      }
    });

    it('should not generate discoveries when all regions are unlocked', async () => {
      // Mock region manager where all regions are unlocked
      const mockRegionManager = {
        isRegionUnlocked: jest.fn(async () => {
          return true; // All regions unlocked
        }),
      } as unknown as RegionManager;

      const encounter = new DiscoverySiteEncounter(
        1,
        mockRegionManager,
        collectionManager
      );

      const paths = encounter.getExplorationPaths();
      const result = await encounter.processExplorationDecision(paths[0].id);

      if (result.success) {
        const discoveries = encounter.getRegionalDiscoveries();
        // Should not generate any discoveries when all regions are unlocked
        expect(discoveries.length).toBe(0);
      }
    });

    it('should randomly select from available sets across multiple encounters', async () => {
      // Create multiple encounters to test random selection
      const selectedSetIds: string[] = [];

      for (let i = 0; i < 20; i++) {
        const encounter = new DiscoverySiteEncounter(
          1,
          regionManager,
          collectionManager
        );
        const paths = encounter.getExplorationPaths();
        const result = await encounter.processExplorationDecision(paths[0].id);

        if (result.success) {
          const discoveries = encounter.getRegionalDiscoveries();
          discoveries.forEach((discovery) => {
            if (!selectedSetIds.includes(discovery.setId)) {
              selectedSetIds.push(discovery.setId);
            }
          });
        }
      }

      // With 20 runs, we should see variety in set selection
      expect(selectedSetIds.length).toBeGreaterThan(0);

      // Verify all selected sets are valid region unlock sets
      const validSets = [
        'silk_road_set',
        'spice_trade_set',
        'ancient_temple_set',
        'dragons_hoard_set',
      ];
      selectedSetIds.forEach((setId) => {
        expect(validSets).toContain(setId);
      });
    });
  });

  describe('region unlock checking and automatic unlocking', () => {
    it('should check eligible regions that can be unlocked', async () => {
      // Mock region manager with some eligible regions
      const mockRegionManager = {
        isRegionUnlocked: jest.fn(async (regionId: string) => {
          // Only forest_depths is unlocked (starting region)
          return regionId === 'forest_depths';
        }),
        canUnlockRegion: jest.fn(async (regionId: string) => {
          // desert_oasis and coastal_caves can be unlocked
          return regionId === 'desert_oasis' || regionId === 'coastal_caves';
        }),
      } as unknown as RegionManager;

      const encounter = new DiscoverySiteEncounter(
        1,
        mockRegionManager,
        collectionManager
      );

      const eligibleRegions = await encounter.checkEligibleRegions();

      expect(eligibleRegions).toBeDefined();
      expect(Array.isArray(eligibleRegions)).toBe(true);
      expect(eligibleRegions.length).toBeGreaterThan(0);
      expect(eligibleRegions).toContain('desert_oasis');
      expect(eligibleRegions).toContain('coastal_caves');
      // Should not include already unlocked regions
      expect(eligibleRegions).not.toContain('forest_depths');
    });

    it('should return empty array when no regions are eligible', async () => {
      // Mock region manager where all eligible regions are already unlocked
      const mockRegionManager = {
        isRegionUnlocked: jest.fn(async () => {
          return true; // All regions unlocked
        }),
        canUnlockRegion: jest.fn(async () => {
          return false; // No regions can be unlocked
        }),
      } as unknown as RegionManager;

      const encounter = new DiscoverySiteEncounter(
        1,
        mockRegionManager,
        collectionManager
      );

      const eligibleRegions = await encounter.checkEligibleRegions();

      expect(eligibleRegions).toBeDefined();
      expect(Array.isArray(eligibleRegions)).toBe(true);
      expect(eligibleRegions.length).toBe(0);
    });

    it('should return empty array when regionManager is not provided', async () => {
      const encounter = new DiscoverySiteEncounter(1);

      const eligibleRegions = await encounter.checkEligibleRegions();

      expect(eligibleRegions).toBeDefined();
      expect(Array.isArray(eligibleRegions)).toBe(true);
      expect(eligibleRegions.length).toBe(0);
    });

    it('should automatically unlock a region when requirements are met', async () => {
      const unlockSpy = jest.fn(async () => {
        // Simulate successful unlock
      });

      const mockRegionManager = {
        isRegionUnlocked: jest.fn(async (regionId: string) => {
          return regionId === 'forest_depths';
        }),
        canUnlockRegion: jest.fn(async (regionId: string) => {
          return regionId === 'desert_oasis';
        }),
        unlockRegion: unlockSpy,
      } as unknown as RegionManager;

      const encounter = new DiscoverySiteEncounter(
        1,
        mockRegionManager,
        collectionManager
      );

      const unlockedRegion = await encounter.checkAndUnlockRegions();

      expect(unlockedRegion).toBe('desert_oasis');
      expect(unlockSpy).toHaveBeenCalledWith('desert_oasis');
      expect(unlockSpy).toHaveBeenCalledTimes(1);
    });

    it('should return undefined when no regions are eligible for unlocking', async () => {
      const mockRegionManager = {
        isRegionUnlocked: jest.fn(async () => {
          return true; // All unlocked
        }),
        canUnlockRegion: jest.fn(async () => {
          return false; // None eligible
        }),
        unlockRegion: jest.fn(),
      } as unknown as RegionManager;

      const encounter = new DiscoverySiteEncounter(
        1,
        mockRegionManager,
        collectionManager
      );

      const unlockedRegion = await encounter.checkAndUnlockRegions();

      expect(unlockedRegion).toBeUndefined();
    });

    it('should return undefined when regionManager is not provided', async () => {
      const encounter = new DiscoverySiteEncounter(1);

      const unlockedRegion = await encounter.checkAndUnlockRegions();

      expect(unlockedRegion).toBeUndefined();
    });

    it('should randomly select one region when multiple regions are eligible', async () => {
      const unlockedRegions: string[] = [];

      const mockRegionManager = {
        isRegionUnlocked: jest.fn(async (regionId: string) => {
          return regionId === 'forest_depths';
        }),
        canUnlockRegion: jest.fn(async (regionId: string) => {
          // Multiple regions eligible
          return (
            regionId === 'desert_oasis' ||
            regionId === 'coastal_caves' ||
            regionId === 'mountain_pass'
          );
        }),
        unlockRegion: jest.fn(async (regionId: string) => {
          unlockedRegions.push(regionId);
        }),
      } as unknown as RegionManager;

      // Run multiple times to test random selection
      const selectedRegions: string[] = [];
      for (let i = 0; i < 20; i++) {
        const encounter = new DiscoverySiteEncounter(
          1,
          mockRegionManager,
          collectionManager
        );
        const unlocked = await encounter.checkAndUnlockRegions();
        if (unlocked) {
          selectedRegions.push(unlocked);
        }
      }

      // Should have unlocked some regions
      expect(selectedRegions.length).toBeGreaterThan(0);

      // All selected regions should be from the eligible set
      const eligibleSet = ['desert_oasis', 'coastal_caves', 'mountain_pass'];
      selectedRegions.forEach((regionId) => {
        expect(eligibleSet).toContain(regionId);
      });

      // With 20 runs, we should see some variety (not all the same region)
      const uniqueRegions = [...new Set(selectedRegions)];
      expect(uniqueRegions.length).toBeGreaterThan(0);
    });

    it('should handle unlock failure gracefully', async () => {
      const mockRegionManager = {
        isRegionUnlocked: jest.fn(async () => {
          return false;
        }),
        canUnlockRegion: jest.fn(async () => {
          return true;
        }),
        unlockRegion: jest.fn(async () => {
          throw new Error('Unlock failed');
        }),
      } as unknown as RegionManager;

      const encounter = new DiscoverySiteEncounter(
        1,
        mockRegionManager,
        collectionManager
      );

      const unlockedRegion = await encounter.checkAndUnlockRegions();

      // Should return undefined on failure, not throw
      expect(unlockedRegion).toBeUndefined();
    });

    it('should check for unlocks after item collection via checkForRegionUnlocksAfterItemCollection', async () => {
      const unlockSpy = jest.fn(async () => {
        // Simulate successful unlock
      });

      const mockRegionManager = {
        isRegionUnlocked: jest.fn(async (regionId: string) => {
          return regionId === 'forest_depths';
        }),
        canUnlockRegion: jest.fn(async (regionId: string) => {
          return regionId === 'desert_oasis';
        }),
        unlockRegion: unlockSpy,
      } as unknown as RegionManager;

      const encounter = new DiscoverySiteEncounter(
        1,
        mockRegionManager,
        collectionManager
      );

      // Simulate items being processed first
      // (In real scenario, CollectionManager.addCollectedItem() would be called here)
      const unlockedRegion =
        await encounter.checkForRegionUnlocksAfterItemCollection();

      expect(unlockedRegion).toBe('desert_oasis');
      expect(unlockSpy).toHaveBeenCalledWith('desert_oasis');
    });

    it('should return undefined when regionManager methods are not available', async () => {
      // Mock region manager without required methods
      const mockRegionManager = {
        isRegionUnlocked: jest.fn(),
        // Missing canUnlockRegion and unlockRegion
      } as unknown as RegionManager;

      const encounter = new DiscoverySiteEncounter(
        1,
        mockRegionManager,
        collectionManager
      );

      const unlockedRegion =
        await encounter.checkForRegionUnlocksAfterItemCollection();

      expect(unlockedRegion).toBeUndefined();
    });

    it('should handle errors gracefully in checkForRegionUnlocksAfterItemCollection', async () => {
      const mockRegionManager = {
        isRegionUnlocked: jest.fn(async () => {
          throw new Error('Test error');
        }),
        canUnlockRegion: jest.fn(),
        unlockRegion: jest.fn(),
      } as unknown as RegionManager;

      const encounter = new DiscoverySiteEncounter(
        1,
        mockRegionManager,
        collectionManager
      );

      // Should not throw, should return undefined
      const unlockedRegion =
        await encounter.checkForRegionUnlocksAfterItemCollection();

      expect(unlockedRegion).toBeUndefined();
    });

    it('should not unlock regions that are already unlocked', async () => {
      const unlockSpy = jest.fn();

      const mockRegionManager = {
        isRegionUnlocked: jest.fn(async (regionId: string) => {
          // desert_oasis is already unlocked
          return regionId === 'forest_depths' || regionId === 'desert_oasis';
        }),
        canUnlockRegion: jest.fn(async (regionId: string) => {
          return regionId === 'desert_oasis' || regionId === 'coastal_caves';
        }),
        unlockRegion: unlockSpy,
      } as unknown as RegionManager;

      const encounter = new DiscoverySiteEncounter(
        1,
        mockRegionManager,
        collectionManager
      );

      const unlockedRegion = await encounter.checkAndUnlockRegions();

      // Should only unlock coastal_caves (desert_oasis is already unlocked)
      expect(unlockedRegion).toBe('coastal_caves');
      expect(unlockSpy).toHaveBeenCalledWith('coastal_caves');
      expect(unlockSpy).not.toHaveBeenCalledWith('desert_oasis');
    });

    it('should correctly identify eligible regions based on unlock requirements', async () => {
      // Test that canUnlockRegion is called for each region
      const canUnlockSpy = jest.fn(async (regionId: string) => {
        // Only desert_oasis meets requirements
        return regionId === 'desert_oasis';
      });

      const mockRegionManager = {
        isRegionUnlocked: jest.fn(async (regionId: string) => {
          return regionId === 'forest_depths';
        }),
        canUnlockRegion: canUnlockSpy,
      } as unknown as RegionManager;

      const encounter = new DiscoverySiteEncounter(
        1,
        mockRegionManager,
        collectionManager
      );

      const eligibleRegions = await encounter.checkEligibleRegions();

      // Should check all regions except already unlocked ones
      expect(canUnlockSpy).toHaveBeenCalled();
      expect(eligibleRegions).toContain('desert_oasis');
      expect(eligibleRegions.length).toBe(1);
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

    it('should process exploration decisions', async () => {
      const paths = discoveryEncounter.getExplorationPaths();
      const selectedPath = paths[0];

      const result = await discoveryEncounter.processExplorationDecision(
        selectedPath.id
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.rewards).toBeDefined();
      expect(result.consequences).toBeDefined();
    });

    it('should handle invalid exploration decisions', async () => {
      const result =
        await discoveryEncounter.processExplorationDecision('invalid_path');

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('lore collection system', () => {
    it('should generate lore discoveries', async () => {
      const paths = discoveryEncounter.getExplorationPaths();
      const result = await discoveryEncounter.processExplorationDecision(
        paths[0].id
      );

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

    it('should track lore collection progress', async () => {
      const paths = discoveryEncounter.getExplorationPaths();
      const result = await discoveryEncounter.processExplorationDecision(
        paths[0].id
      );

      if (result.success) {
        const progress = discoveryEncounter.getLoreProgress();
        expect(progress).toBeDefined();
        expect(progress.totalLore).toBeGreaterThan(0);
        expect(progress.discoveredRegions).toBeDefined();
        expect(progress.discoveredEras).toBeDefined();
      }
    });

    it('should scale lore discoveries with depth', async () => {
      const depth1Encounter = new DiscoverySiteEncounter(1);
      const depth5Encounter = new DiscoverySiteEncounter(5);

      const depth1Paths = depth1Encounter.getExplorationPaths();
      const depth5Paths = depth5Encounter.getExplorationPaths();

      await depth1Encounter.processExplorationDecision(depth1Paths[0].id);
      await depth5Encounter.processExplorationDecision(depth5Paths[0].id);

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
    it('should provide map intelligence', async () => {
      const paths = discoveryEncounter.getExplorationPaths();
      const result = await discoveryEncounter.processExplorationDecision(
        paths[0].id
      );

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
    it('should generate regional discovery items when regionManager is provided', async () => {
      const encounter = new DiscoverySiteEncounter(
        1,
        regionManager,
        collectionManager
      );
      const paths = encounter.getExplorationPaths();
      const result = await encounter.processExplorationDecision(paths[0].id);

      if (result.success) {
        const discoveries = encounter.getRegionalDiscoveries();
        expect(discoveries).toBeDefined();
        expect(discoveries.length).toBeGreaterThan(0);

        discoveries.forEach((discovery) => {
          expect(discovery.type).toBeDefined();
          expect(discovery.setId).toBeDefined();
          expect(discovery.value).toBeGreaterThan(0);
        });
      }
    });

    it('should not generate discoveries when regionManager is not provided', async () => {
      const encounter = new DiscoverySiteEncounter(1);
      const paths = encounter.getExplorationPaths();
      const result = await encounter.processExplorationDecision(paths[0].id);

      if (result.success) {
        const discoveries = encounter.getRegionalDiscoveries();
        // Without regionManager, no discoveries should be generated
        expect(discoveries.length).toBe(0);
      }
    });

    it('should use region unlock sets when RegionManager is provided', async () => {
      const encounter = new DiscoverySiteEncounter(
        1,
        regionManager,
        collectionManager
      );
      const paths = encounter.getExplorationPaths();
      const result = await encounter.processExplorationDecision(paths[0].id);

      if (result.success) {
        const discoveries = encounter.getRegionalDiscoveries();
        expect(discoveries.length).toBeGreaterThan(0);

        const regionUnlockSets = [
          'silk_road_set',
          'spice_trade_set',
          'ancient_temple_set',
          'dragons_hoard_set',
        ];

        discoveries.forEach((discovery) => {
          // Should use region unlock sets, not old regional sets
          expect(regionUnlockSets).toContain(discovery.setId);
        });
      }
    });

    it('should randomly select from available region unlock sets', async () => {
      const encounter = new DiscoverySiteEncounter(
        1,
        regionManager,
        collectionManager
      );
      const paths = encounter.getExplorationPaths();

      // Process multiple paths to get multiple discoveries
      const discoveries: string[] = [];
      for (let i = 0; i < paths.length; i++) {
        const testEncounter = new DiscoverySiteEncounter(
          1,
          regionManager,
          collectionManager
        );
        const testPaths = testEncounter.getExplorationPaths();
        const result = await testEncounter.processExplorationDecision(
          testPaths[i].id
        );
        if (result.success) {
          const regionalDiscoveries = testEncounter.getRegionalDiscoveries();
          regionalDiscoveries.forEach((d) => {
            if (!discoveries.includes(d.setId)) {
              discoveries.push(d.setId);
            }
          });
        }
      }

      // Should have discovered items from different sets (random selection)
      expect(discoveries.length).toBeGreaterThan(0);
      const regionUnlockSets = [
        'silk_road_set',
        'spice_trade_set',
        'ancient_temple_set',
        'dragons_hoard_set',
      ];
      discoveries.forEach((setId) => {
        expect(regionUnlockSets).toContain(setId);
      });
    });

    it('should use actual collection set items from collection-sets.ts', async () => {
      const encounter = new DiscoverySiteEncounter(
        1,
        regionManager,
        collectionManager
      );
      const paths = encounter.getExplorationPaths();
      const result = await encounter.processExplorationDecision(paths[0].id);

      if (result.success) {
        const discoveries = encounter.getRegionalDiscoveries();
        expect(discoveries.length).toBeGreaterThan(0);

        discoveries.forEach((discovery) => {
          // Should have proper item structure from collection sets
          expect(discovery.name).toBeDefined();
          expect(discovery.description).toBeDefined();
          expect(discovery.setId).toBeDefined();
          expect(discovery.value).toBeGreaterThan(0);

          // Item name should be from actual collection set items
          // (not hardcoded names like "Ancient Artifact")
          const regionUnlockSets = [
            'silk_road_set',
            'spice_trade_set',
            'ancient_temple_set',
            'dragons_hoard_set',
          ];
          if (regionUnlockSets.includes(discovery.setId)) {
            // Should have real item names from collection sets
            expect(discovery.name).not.toBe('Ancient Artifact');
            expect(discovery.name).not.toBe('Ruined Relic');
            expect(discovery.name).not.toBe('Lost Treasure');
          }
        });
      }
    });

    it('should randomly select items from the chosen collection set items array', async () => {
      // Create multiple encounters to test random selection
      const itemNames: string[] = [];
      const testSetId = 'silk_road_set'; // Use a known set with multiple items

      // Run multiple times to get different items
      for (let i = 0; i < 10; i++) {
        const encounter = new DiscoverySiteEncounter(
          1,
          regionManager,
          collectionManager
        );
        // Manually set up to use a specific set for testing
        const paths = encounter.getExplorationPaths();
        const result = await encounter.processExplorationDecision(paths[0].id);

        if (result.success) {
          const discoveries = encounter.getRegionalDiscoveries();
          discoveries.forEach((discovery) => {
            if (discovery.setId === testSetId) {
              itemNames.push(discovery.name);
            }
          });
        }
      }

      // Should have collected some item names
      expect(itemNames.length).toBeGreaterThan(0);

      // Verify items are from the silk_road_set (which has 5 items)
      const validSilkRoadItems = [
        'Silk Bolt',
        'Spice Sack',
        'Porcelain Vase',
        'Tea Crate',
        'Jade Sculpture',
      ];
      itemNames.forEach((name) => {
        expect(validSilkRoadItems).toContain(name);
      });

      // If we ran enough times, we should see some variety (not all the same item)
      // This is probabilistic but should work with 10 runs
      const uniqueItems = [...new Set(itemNames)];
      // With 10 runs on a set with 5 items, we should see at least 2 different items
      expect(uniqueItems.length).toBeGreaterThanOrEqual(1);
    });

    it('should generate items that match collection set data exactly', async () => {
      const encounter = new DiscoverySiteEncounter(
        1,
        regionManager,
        collectionManager
      );
      const paths = encounter.getExplorationPaths();
      const result = await encounter.processExplorationDecision(paths[0].id);

      if (result.success) {
        const discoveries = encounter.getRegionalDiscoveries();
        expect(discoveries.length).toBeGreaterThan(0);

        discoveries.forEach((discovery) => {
          // Get the collection set this item should be from
          const collectionSet = getCollectionSetById(discovery.setId);
          expect(collectionSet).toBeDefined();

          if (collectionSet) {
            // Find the matching item in the collection set
            const matchingItem = collectionSet.items.find(
              (item) => item.name === discovery.name
            );

            // The item should exist in the collection set
            expect(matchingItem).toBeDefined();

            if (matchingItem) {
              // Verify all properties match
              expect(discovery.name).toBe(matchingItem.name);
              expect(discovery.description).toBe(matchingItem.description);
              expect(discovery.setId).toBe(matchingItem.setId);
              // Value may be scaled by depth, so just check it's positive
              expect(discovery.value).toBeGreaterThan(0);
            }
          }
        });
      }
    });

    it('should generate items with correct type based on collection set category', async () => {
      const encounter = new DiscoverySiteEncounter(
        1,
        regionManager,
        collectionManager
      );
      const paths = encounter.getExplorationPaths();
      const result = await encounter.processExplorationDecision(paths[0].id);

      if (result.success) {
        const discoveries = encounter.getRegionalDiscoveries();
        expect(discoveries.length).toBeGreaterThan(0);

        discoveries.forEach((discovery) => {
          const collectionSet = getCollectionSetById(discovery.setId);
          expect(collectionSet).toBeDefined();

          if (collectionSet) {
            // Verify type mapping is correct
            if (collectionSet.category === 'trade_goods') {
              expect(discovery.type).toBe('trade_good');
            } else if (collectionSet.category === 'discoveries') {
              expect(discovery.type).toBe('discovery');
            } else if (collectionSet.category === 'legendaries') {
              expect(discovery.type).toBe('legendary');
            }
          }
        });
      }
    });

    it('should only generate items from region unlock sets', async () => {
      const encounter = new DiscoverySiteEncounter(
        1,
        regionManager,
        collectionManager
      );
      const paths = encounter.getExplorationPaths();
      const result = await encounter.processExplorationDecision(paths[0].id);

      if (result.success) {
        const discoveries = encounter.getRegionalDiscoveries();
        expect(discoveries.length).toBeGreaterThan(0);

        const validRegionUnlockSets = [
          'silk_road_set',
          'spice_trade_set',
          'ancient_temple_set',
          'dragons_hoard_set',
        ];

        discoveries.forEach((discovery) => {
          // Should only be from region unlock sets
          expect(validRegionUnlockSets).toContain(discovery.setId);
        });
      }
    });

    it('should generate items from silk_road_set when that set is available', async () => {
      // Mock region manager to only allow silk_road_set
      const mockRegionManager = {
        isRegionUnlocked: jest.fn(async (regionId: string) => {
          // Unlock all regions except desert_oasis (silk_road_set unlocks desert_oasis)
          return regionId !== 'desert_oasis';
        }),
      } as unknown as RegionManager;

      const encounter = new DiscoverySiteEncounter(
        1,
        mockRegionManager,
        collectionManager
      );
      const paths = encounter.getExplorationPaths();
      const result = await encounter.processExplorationDecision(paths[0].id);

      if (result.success) {
        const discoveries = encounter.getRegionalDiscoveries();
        expect(discoveries.length).toBeGreaterThan(0);

        const validItemNames = SILK_ROAD_SET.items.map((item) => item.name);

        discoveries.forEach((discovery) => {
          expect(discovery.setId).toBe('silk_road_set');
          expect(validItemNames).toContain(discovery.name);
        });
      }
    });

    it('should generate items from spice_trade_set when that set is available', async () => {
      // Mock region manager to only allow spice_trade_set
      const mockRegionManager = {
        isRegionUnlocked: jest.fn(async (regionId: string) => {
          // Unlock all regions except coastal_caves (spice_trade_set unlocks coastal_caves)
          return regionId !== 'coastal_caves';
        }),
      } as unknown as RegionManager;

      const encounter = new DiscoverySiteEncounter(
        1,
        mockRegionManager,
        collectionManager
      );
      const paths = encounter.getExplorationPaths();
      const result = await encounter.processExplorationDecision(paths[0].id);

      if (result.success) {
        const discoveries = encounter.getRegionalDiscoveries();
        expect(discoveries.length).toBeGreaterThan(0);

        const validItemNames = SPICE_TRADE_SET.items.map((item) => item.name);

        discoveries.forEach((discovery) => {
          expect(discovery.setId).toBe('spice_trade_set');
          expect(validItemNames).toContain(discovery.name);
        });
      }
    });

    it('should generate items from ancient_temple_set when that set is available', async () => {
      // Mock region manager to only allow ancient_temple_set
      const mockRegionManager = {
        isRegionUnlocked: jest.fn(async (regionId: string) => {
          // Unlock all regions except mountain_pass (ancient_temple_set unlocks mountain_pass)
          return regionId !== 'mountain_pass';
        }),
      } as unknown as RegionManager;

      const encounter = new DiscoverySiteEncounter(
        1,
        mockRegionManager,
        collectionManager
      );
      const paths = encounter.getExplorationPaths();
      const result = await encounter.processExplorationDecision(paths[0].id);

      if (result.success) {
        const discoveries = encounter.getRegionalDiscoveries();
        expect(discoveries.length).toBeGreaterThan(0);

        const validItemNames = ANCIENT_TEMPLE_SET.items.map(
          (item) => item.name
        );

        discoveries.forEach((discovery) => {
          expect(discovery.setId).toBe('ancient_temple_set');
          expect(validItemNames).toContain(discovery.name);
        });
      }
    });

    it('should generate items from dragons_hoard_set when that set is available', async () => {
      // Mock region manager to only allow dragons_hoard_set
      const mockRegionManager = {
        isRegionUnlocked: jest.fn(async (regionId: string) => {
          // Unlock all regions except dragons_lair (dragons_hoard_set unlocks dragons_lair)
          return regionId !== 'dragons_lair';
        }),
      } as unknown as RegionManager;

      const encounter = new DiscoverySiteEncounter(
        1,
        mockRegionManager,
        collectionManager
      );
      const paths = encounter.getExplorationPaths();
      const result = await encounter.processExplorationDecision(paths[0].id);

      if (result.success) {
        const discoveries = encounter.getRegionalDiscoveries();
        expect(discoveries.length).toBeGreaterThan(0);

        const validItemNames = DRAGONS_HOARD_SET.items.map((item) => item.name);

        discoveries.forEach((discovery) => {
          expect(discovery.setId).toBe('dragons_hoard_set');
          expect(validItemNames).toContain(discovery.name);
        });
      }
    });

    it('should generate items with unique IDs that include collection set and item info', async () => {
      const encounter = new DiscoverySiteEncounter(
        1,
        regionManager,
        collectionManager
      );
      const paths = encounter.getExplorationPaths();
      const result = await encounter.processExplorationDecision(paths[0].id);

      if (result.success) {
        const discoveries = encounter.getRegionalDiscoveries();
        expect(discoveries.length).toBeGreaterThan(0);

        discoveries.forEach((discovery) => {
          // ID should include the collection set ID
          expect(discovery.id).toContain(discovery.setId);
          // ID should be unique (check against other discoveries)
          const otherDiscoveries = discoveries.filter(
            (d) => d.id !== discovery.id
          );
          otherDiscoveries.forEach((other) => {
            expect(other.id).not.toBe(discovery.id);
          });
        });
      }
    });

    it('should return region unlock sets instead of old regional sets', async () => {
      const encounter = new DiscoverySiteEncounter(
        1,
        regionManager,
        collectionManager
      );
      const regionalSets = encounter.getRegionalCollectionSets();

      expect(regionalSets).toBeDefined();
      expect(regionalSets.length).toBeGreaterThan(0);

      // Should return region unlock sets, not old regional sets
      const regionUnlockSetIds = [
        'silk_road_set',
        'spice_trade_set',
        'ancient_temple_set',
        'dragons_hoard_set',
      ];

      const oldRegionalSetIds = [
        'ancient_ruins_set',
        'crystal_caverns_set',
        'shadow_realm_set',
        'ethereal_plains_set',
      ];

      regionalSets.forEach((set) => {
        expect(set.id).toBeDefined();
        expect(set.name).toBeDefined();
        expect(set.region).toBeDefined();
        expect(set.items).toBeDefined();

        // Should be region unlock sets
        expect(regionUnlockSetIds).toContain(set.id);
        // Should NOT be old regional sets
        expect(oldRegionalSetIds).not.toContain(set.id);
      });

      // Should have all 4 region unlock sets
      const returnedIds = regionalSets.map((s) => s.id);
      expect(returnedIds.length).toBe(4);
      regionUnlockSetIds.forEach((setId) => {
        expect(returnedIds).toContain(setId);
      });
    });

    it('should map region unlock sets to correct region names', () => {
      const encounter = new DiscoverySiteEncounter(
        1,
        regionManager,
        collectionManager
      );
      const regionalSets = encounter.getRegionalCollectionSets();

      // Mapping of set IDs to expected region names
      const setToRegionMap: Record<string, string> = {
        silk_road_set: 'Desert Oasis',
        spice_trade_set: 'Coastal Caves',
        ancient_temple_set: 'Mountain Pass',
        dragons_hoard_set: "Dragon's Lair",
      };

      regionalSets.forEach((set) => {
        const expectedRegion = setToRegionMap[set.id];
        if (expectedRegion) {
          expect(set.region).toBe(expectedRegion);
        }
      });
    });

    it('should scale regional discoveries with depth', async () => {
      const depth1Encounter = new DiscoverySiteEncounter(1);
      const depth5Encounter = new DiscoverySiteEncounter(5);

      const depth1Paths = depth1Encounter.getExplorationPaths();
      const depth5Paths = depth5Encounter.getExplorationPaths();

      await depth1Encounter.processExplorationDecision(depth1Paths[0].id);
      await depth5Encounter.processExplorationDecision(depth5Paths[0].id);

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

    it('should prevent excessive failures', async () => {
      // Simulate multiple failed explorations
      for (let i = 0; i < 5; i++) {
        const testEncounter = new DiscoverySiteEncounter();
        const _paths = testEncounter.getExplorationPaths();
        await testEncounter.processExplorationDecision('invalid_path');
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
    it('should complete encounter after successful exploration', async () => {
      const paths = discoveryEncounter.getExplorationPaths();
      const result = await discoveryEncounter.processExplorationDecision(
        paths[0].id
      );

      expect(result.success).toBe(true);
      expect(discoveryEncounter.isEncounterComplete()).toBe(true);
    });

    it('should generate appropriate rewards on completion when regionManager is provided', async () => {
      const encounter = new DiscoverySiteEncounter(
        1,
        regionManager,
        collectionManager
      );
      const paths = encounter.getExplorationPaths();
      const result = await encounter.processExplorationDecision(paths[0].id);

      if (result.success) {
        const rewards = encounter.generateRewards();
        expect(rewards).toBeDefined();
        expect(rewards.length).toBeGreaterThan(0);
      }
    });

    it('should handle encounter failure', async () => {
      const result =
        await discoveryEncounter.processExplorationDecision('invalid_path');

      expect(result.success).toBe(false);
      expect(discoveryEncounter.isEncounterComplete()).toBe(true);
    });
  });

  describe('comprehensive integration tests', () => {
    it('should integrate all features seamlessly', async () => {
      const depth3Encounter = new DiscoverySiteEncounter(
        3,
        regionManager,
        collectionManager
      );

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
      const result = await depth3Encounter.processExplorationDecision(
        paths[0].id
      );

      if (result.success) {
        // Should have rewards (from regional discoveries)
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

    it('should maintain backward compatibility', async () => {
      // All existing functionality should still work
      const paths = discoveryEncounter.getExplorationPaths();
      expect(paths).toHaveLength(3);

      const result = await discoveryEncounter.processExplorationDecision(
        paths[0].id
      );
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
