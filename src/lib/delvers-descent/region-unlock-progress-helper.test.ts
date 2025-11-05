import { CollectionManager } from './collection-manager';
import { ALL_COLLECTION_SETS } from './collection-sets';
import { RegionManager } from './region-manager';
import {
  getAllRegionUnlockProgress,
  getRegionUnlockProgress,
} from './region-unlock-progress-helper';

describe('Region Unlock Progress Helper', () => {
  let collectionManager: CollectionManager;
  let regionManager: RegionManager;

  beforeEach(() => {
    collectionManager = new CollectionManager(ALL_COLLECTION_SETS);
    regionManager = new RegionManager(collectionManager);
  });

  describe('getRegionUnlockProgress', () => {
    it('should return null for invalid collection set ID', async () => {
      const result = await getRegionUnlockProgress(
        'invalid_set',
        collectionManager,
        regionManager
      );
      expect(result).toBeNull();
    });

    it('should return progress for silk_road_set', async () => {
      const result = await getRegionUnlockProgress(
        'silk_road_set',
        collectionManager,
        regionManager
      );

      expect(result).not.toBeNull();
      expect(result!.regionId).toBe('desert_oasis');
      expect(result!.regionName).toBe('Desert Oasis');
      expect(result!.collectionSetId).toBe('silk_road_set');
      expect(result!.itemsTotal).toBeGreaterThan(0);
      expect(result!.itemsCollected).toBe(0);
      expect(result!.isUnlocked).toBe(false);
      expect(result!.isComplete).toBe(false);
    });

    it('should return progress with collected items', async () => {
      // Add some items to the collection
      await collectionManager.addCollectedItem({
        itemId: 'silk_bolt',
        setId: 'silk_road_set',
        collectedDate: Date.now(),
      });
      await collectionManager.addCollectedItem({
        itemId: 'spice_sack',
        setId: 'silk_road_set',
        collectedDate: Date.now(),
      });

      const result = await getRegionUnlockProgress(
        'silk_road_set',
        collectionManager,
        regionManager
      );

      expect(result).not.toBeNull();
      expect(result!.itemsCollected).toBe(2);
      expect(result!.isComplete).toBe(false);
    });

    it('should detect complete sets', async () => {
      // Add all items for silk_road_set (5 items)
      const silkRoadSet = ALL_COLLECTION_SETS.find(
        (s) => s.id === 'silk_road_set'
      );
      if (silkRoadSet) {
        for (const item of silkRoadSet.items) {
          await collectionManager.addCollectedItem({
            itemId: item.id,
            setId: 'silk_road_set',
            collectedDate: Date.now(),
          });
        }
      }

      const result = await getRegionUnlockProgress(
        'silk_road_set',
        collectionManager,
        regionManager
      );

      expect(result).not.toBeNull();
      expect(result!.isComplete).toBe(true);
    });

    it('should check region unlock status', async () => {
      // Create a mock RegionManager that returns true for isRegionUnlocked
      const mockRegionManager = {
        isRegionUnlocked: jest.fn().mockResolvedValue(true),
      } as unknown as RegionManager;

      const result = await getRegionUnlockProgress(
        'silk_road_set',
        collectionManager,
        mockRegionManager
      );

      expect(result).not.toBeNull();
      expect(result!.isUnlocked).toBe(true);
      expect(mockRegionManager.isRegionUnlocked).toHaveBeenCalledWith(
        'desert_oasis'
      );
    });

    it('should work without regionManager', async () => {
      const result = await getRegionUnlockProgress(
        'silk_road_set',
        collectionManager,
        undefined
      );

      expect(result).not.toBeNull();
      expect(result!.isUnlocked).toBe(false);
    });
  });

  describe('getAllRegionUnlockProgress', () => {
    it('should return progress for all region unlock sets', async () => {
      const results = await getAllRegionUnlockProgress(
        collectionManager,
        regionManager
      );

      expect(results.length).toBe(4);
      expect(results.map((r) => r.collectionSetId)).toContain('silk_road_set');
      expect(results.map((r) => r.collectionSetId)).toContain(
        'spice_trade_set'
      );
      expect(results.map((r) => r.collectionSetId)).toContain(
        'ancient_temple_set'
      );
      expect(results.map((r) => r.collectionSetId)).toContain(
        'dragons_hoard_set'
      );
    });

    it('should return correct region mappings', async () => {
      const results = await getAllRegionUnlockProgress(
        collectionManager,
        regionManager
      );

      const silkRoad = results.find(
        (r) => r.collectionSetId === 'silk_road_set'
      );
      expect(silkRoad?.regionId).toBe('desert_oasis');

      const spiceTrade = results.find(
        (r) => r.collectionSetId === 'spice_trade_set'
      );
      expect(spiceTrade?.regionId).toBe('coastal_caves');

      const ancientTemple = results.find(
        (r) => r.collectionSetId === 'ancient_temple_set'
      );
      expect(ancientTemple?.regionId).toBe('mountain_pass');

      const dragonsHoard = results.find(
        (r) => r.collectionSetId === 'dragons_hoard_set'
      );
      expect(dragonsHoard?.regionId).toBe('dragons_lair');
    });

    it('should filter out null results', async () => {
      const results = await getAllRegionUnlockProgress(
        collectionManager,
        regionManager
      );

      expect(results.every((r) => r !== null)).toBe(true);
    });
  });
});
