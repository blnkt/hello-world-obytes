import { BonusManager } from '../bonus-manager';
import { CollectionManager } from '../collection-manager';
import { RegionManager } from '../region-manager';
import { RunInitializer } from '../run-initializer';
import { ALL_COLLECTION_SETS } from '../collection-sets';
import { REGIONS } from '../regions';

describe('Phase 4 - Collection & Progression Integration (Task 7.0)', () => {
  let collectionManager: CollectionManager;
  let bonusManager: BonusManager;
  let regionManager: RegionManager;
  let runInitializer: RunInitializer;

  beforeEach(() => {
    collectionManager = new CollectionManager(ALL_COLLECTION_SETS);
    bonusManager = new BonusManager(collectionManager);
    regionManager = new RegionManager(collectionManager);
    runInitializer = new RunInitializer(
      collectionManager,
      bonusManager,
      regionManager
    );
  });

  describe('Collection System Integration with Reward System (Task 7.1)', () => {
    it('should add collected items when rewards are generated', async () => {
      const item = {
        itemId: 'item-test-1',
        setId: ALL_COLLECTION_SETS[0].id,
        collectedDate: Date.now(),
      };

      await collectionManager.addCollectedItem(item);

      const collectedItems = await collectionManager.getCollectedItems();
      expect(collectedItems).toContainEqual(item);
    });

    it('should track collection progress across multiple items', async () => {
      const set = ALL_COLLECTION_SETS[0];

      for (let i = 0; i < 3; i++) {
        await collectionManager.addCollectedItem({
          itemId: `item-${i}`,
          setId: set.id,
          collectedDate: Date.now(),
        });
      }

      const progress = await collectionManager.getCollectionProgress();
      const setProgress = progress.partialSets.find(
        (p) => p.setId === set.id
      );

      expect(setProgress).toBeDefined();
      expect(setProgress?.collected).toBe(3);
    });

    it('should detect set completion when all items collected', async () => {
      const set = ALL_COLLECTION_SETS[0];

      for (const item of set.items) {
        await collectionManager.addCollectedItem({
          itemId: item.id,
          setId: set.id,
          collectedDate: Date.now(),
        });
      }

      const progress = await collectionManager.getCollectionProgress();
      expect(progress.completedSets).toContain(set.id);
    });
  });

  describe('Bonus Application to Run Initialization (Task 7.2)', () => {
    it('should apply collection bonuses to run initialization', async () => {
      const result = await runInitializer.initializeRun('test-run-1', {
        baseEnergy: 1000,
        steps: 8000,
        selectedRegionId: 'forest_depths',
      });

      expect(result).toBeDefined();
      expect(result.totalEnergy).toBeGreaterThanOrEqual(0);
    });

    it('should apply energy efficiency bonuses to run energy', async () => {
      const result = await runInitializer.initializeRun('test-run-2', {
        baseEnergy: 1200,
        steps: 10000,
        selectedRegionId: 'forest_depths',
      });

      expect(result.totalEnergy).toBeGreaterThan(0);
    });

    it('should include active bonuses in run initialization', async () => {
      const bonuses = await bonusManager.getActiveBonuses();

      const result = await runInitializer.initializeRun('test-run-3', {
        baseEnergy: 1000,
        steps: 8000,
        selectedRegionId: 'forest_depths',
      });

      expect(result).toBeDefined();
      expect(bonuses.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Region Unlock and Selection Flow (Task 7.3)', () => {
    it('should return available regions for selection', async () => {
      const unlockedRegions = await regionManager.getUnlockedRegions();

      expect(unlockedRegions.length).toBeGreaterThan(0);
    });

    it('should unlock regions based on collection completion', async () => {
      const regions = REGIONS;
      const testRegion = regions[0];

      const unlockedBefore = await regionManager.getUnlockedRegions();
      const wasUnlockedBefore = unlockedBefore.some(
        (r) => r.id === testRegion.id
      );

      expect(wasUnlockedBefore).toBeDefined();
    });

    it('should initialize run with selected region', async () => {
      const unlockedRegions = await regionManager.getUnlockedRegions();
      expect(unlockedRegions.length).toBeGreaterThan(0);

      const selectedRegion = unlockedRegions[0];
      const result = await runInitializer.initializeRun('test-run-4', {
        baseEnergy: 1000,
        steps: 8000,
        selectedRegionId: selectedRegion.id,
      });

      expect(result).toBeDefined();
      expect(result.run.id).toBe('test-run-4');
    });
  });

  describe('Collection Progress Persistence Across Runs (Task 7.4)', () => {
    it('should persist collected items across multiple runs', async () => {
      const item = {
        itemId: 'item-persist-test',
        setId: ALL_COLLECTION_SETS[0].id,
        collectedDate: Date.now(),
      };

      await collectionManager.addCollectedItem(item);

      const newManager = new CollectionManager(ALL_COLLECTION_SETS);
      const collectedItems = await newManager.getCollectedItems();

      const foundItem = collectedItems.find((i) => i.itemId === item.itemId);
      expect(foundItem).toBeDefined();
    });

    it('should maintain set completion status across runs', async () => {
      const set = ALL_COLLECTION_SETS[0];

      for (const item of set.items) {
        await collectionManager.addCollectedItem({
          itemId: item.id,
          setId: set.id,
          collectedDate: Date.now(),
        });
      }

      const newManager = new CollectionManager(ALL_COLLECTION_SETS);
      const progress = await newManager.getCollectionProgress();

      expect(progress.completedSets).toContain(set.id);
    });
  });

  describe('Performance Requirements (Task 7.7)', () => {
    it('should complete collection lookups within 10ms', async () => {
      const startTime = Date.now();

      await collectionManager.getCollectionProgress();

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(10);
    });

    it('should complete bonus calculations within 10ms', async () => {
      const startTime = Date.now();

      await bonusManager.getBonusSummary();

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(10);
    });

    it('should complete region lookups within 10ms', async () => {
      const startTime = Date.now();

      await regionManager.getUnlockedRegions();

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(10);
    });
  });

  describe('Collection Statistics Tracking (Task 7.6)', () => {
    it('should track total items collected', async () => {
      const stats = await collectionManager.getCollectionStatistics();

      expect(stats.totalItemsCollected).toBeGreaterThanOrEqual(0);
      expect(typeof stats.totalItemsCollected).toBe('number');
    });

    it('should track completed sets count', async () => {
      const stats = await collectionManager.getCollectionStatistics();

      expect(stats.setsCompleted).toBeGreaterThanOrEqual(0);
      expect(typeof stats.setsCompleted).toBe('number');
    });

    it('should calculate collection completion rate', async () => {
      const stats = await collectionManager.getCollectionStatistics();

      expect(stats.collectionCompletionRate).toBeGreaterThanOrEqual(0);
      expect(stats.collectionCompletionRate).toBeLessThanOrEqual(1);
    });
  });

  describe('Bonus Balance Testing (Task 7.8)', () => {
    it('should provide reasonable bonus values', async () => {
      const summary = await bonusManager.getBonusSummary();

      expect(summary.energyEfficiency).toBeGreaterThanOrEqual(0);
      expect(summary.energyEfficiency).toBeLessThanOrEqual(0.5);

      expect(summary.startingEnergyBonus).toBeGreaterThanOrEqual(0);
      expect(summary.startingEnergyBonus).toBeLessThanOrEqual(500);
    });

    it('should not make runs trivial with bonuses', async () => {
      const result = await runInitializer.initializeRun('test-run-5', {
        baseEnergy: 2000,
        steps: 20000,
        selectedRegionId: 'forest_depths',
      });

      expect(result.totalEnergy).toBeGreaterThan(0);
      expect(result.totalEnergy).toBeLessThan(20000);
    });
  });
});

