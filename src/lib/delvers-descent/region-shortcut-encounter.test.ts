import { CollectionManager } from '@/lib/delvers-descent/collection-manager';
import { ALL_COLLECTION_SETS } from '@/lib/delvers-descent/collection-sets';
import { RegionManager } from '@/lib/delvers-descent/region-manager';
import {
  RegionShortcutEncounter,
  type ShortcutType,
} from '@/lib/delvers-descent/region-shortcut-encounter';
import { REGIONS } from '@/lib/delvers-descent/regions';

describe('RegionShortcutEncounter', () => {
  let collectionManager: CollectionManager;
  let regionManager: RegionManager;

  beforeEach(() => {
    collectionManager = new CollectionManager(ALL_COLLECTION_SETS);
    regionManager = new RegionManager(collectionManager);
  });

  describe('createRegionShortcutConfig', () => {
    it('should never offer shortcut to the current region', async () => {
      // Mock multiple unlocked regions
      const mockUnlockedRegions = [
        REGIONS.find((r) => r.id === 'forest_depths')!,
        REGIONS.find((r) => r.id === 'desert_oasis')!,
        REGIONS.find((r) => r.id === 'mountain_pass')!,
      ].filter((r) => r !== undefined);

      // Mock regionManager.getUnlockedRegions to return multiple regions
      jest
        .spyOn(regionManager, 'getUnlockedRegions')
        .mockResolvedValue(mockUnlockedRegions);

      const currentRegionId = 'forest_depths';
      const shortcutType: ShortcutType = 'hidden_pathway';

      // Create config multiple times to ensure current region is never offered
      for (let i = 0; i < 20; i++) {
        const config = await RegionShortcutEncounter.createRegionShortcutConfig(
          {
            regionManager,
            currentRegionId,
            shortcutType,
            quality: 5,
            depth: 11,
          }
        );

        // Target region should never be the current region
        expect(config.targetRegion.id).not.toBe(currentRegionId);
        // Should be one of the other unlocked regions
        expect(
          mockUnlockedRegions
            .filter((r) => r.id !== currentRegionId)
            .map((r) => r.id)
        ).toContain(config.targetRegion.id);
      }
    });

    it('should throw error if no other regions available (after filtering current)', async () => {
      // Mock only one unlocked region (the current one)
      const mockUnlockedRegions = [
        REGIONS.find((r) => r.id === 'forest_depths')!,
      ].filter((r) => r !== undefined);

      jest
        .spyOn(regionManager, 'getUnlockedRegions')
        .mockResolvedValue(mockUnlockedRegions);

      const currentRegionId = 'forest_depths';
      const shortcutType: ShortcutType = 'hidden_pathway';

      // Should throw error when no other regions available
      await expect(
        RegionShortcutEncounter.createRegionShortcutConfig({
          regionManager,
          currentRegionId,
          shortcutType,
          quality: 5,
          depth: 11,
        })
      ).rejects.toThrow(
        'No other unlocked regions available for shortcut. Current region cannot be offered.'
      );
    });

    it('should select from available regions excluding current', async () => {
      // Mock multiple unlocked regions
      const mockUnlockedRegions = [
        REGIONS.find((r) => r.id === 'forest_depths')!,
        REGIONS.find((r) => r.id === 'desert_oasis')!,
        REGIONS.find((r) => r.id === 'mountain_pass')!,
        REGIONS.find((r) => r.id === 'coastal_caves')!,
      ].filter((r) => r !== undefined);

      jest
        .spyOn(regionManager, 'getUnlockedRegions')
        .mockResolvedValue(mockUnlockedRegions);

      const currentRegionId = 'desert_oasis';
      const shortcutType: ShortcutType = 'hidden_pathway';

      const config = await RegionShortcutEncounter.createRegionShortcutConfig({
        regionManager,
        currentRegionId,
        shortcutType,
        quality: 5,
        depth: 11,
      });

      // Should be one of the regions excluding current
      const availableRegionIds = mockUnlockedRegions
        .filter((r) => r.id !== currentRegionId)
        .map((r) => r.id);

      expect(availableRegionIds).toContain(config.targetRegion.id);
      expect(config.targetRegion.id).not.toBe(currentRegionId);
    });
  });
});
