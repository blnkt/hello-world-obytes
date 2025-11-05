import type { CollectionManager } from './collection-manager';
import { getCollectionSetById } from './collection-sets';
import type { RegionManager } from './region-manager';
import { getRegionById } from './regions';

export interface RegionUnlockProgress {
  regionId: string;
  regionName: string;
  collectionSetId: string;
  collectionSetName: string;
  itemsCollected: number;
  itemsTotal: number;
  isUnlocked: boolean;
  isComplete: boolean;
}

/**
 * Get region unlock progress for a given collection set
 * Returns progress information including items collected, total items, and unlock status
 */
export async function getRegionUnlockProgress(
  collectionSetId: string,
  collectionManager: CollectionManager,
  regionManager?: RegionManager
): Promise<RegionUnlockProgress | null> {
  // Get the collection set
  const collectionSet = getCollectionSetById(collectionSetId);
  if (!collectionSet) {
    return null;
  }

  // Map collection set IDs to region IDs
  const setToRegionMap: Record<string, string> = {
    silk_road_set: 'desert_oasis',
    spice_trade_set: 'coastal_caves',
    ancient_temple_set: 'mountain_pass',
    dragons_hoard_set: 'dragons_lair',
  };

  const regionId = setToRegionMap[collectionSetId];
  if (!regionId) {
    return null;
  }

  const region = getRegionById(regionId);
  if (!region) {
    return null;
  }

  // Get collected items for this set
  const collectedItems = await collectionManager.getCollectedItems();
  const itemsInSet = collectedItems.filter(
    (item) => item.setId === collectionSetId
  );

  // Get unique item IDs (in case of duplicates)
  const uniqueItemIds = new Set(itemsInSet.map((item) => item.itemId));

  const itemsCollected = uniqueItemIds.size;
  const itemsTotal = collectionSet.items.length;
  const isComplete = itemsCollected === itemsTotal && itemsCollected > 0;

  // Check if region is unlocked
  let isUnlocked = false;
  if (regionManager) {
    try {
      isUnlocked = await regionManager.isRegionUnlocked(regionId);
    } catch (error) {
      // If regionManager doesn't support this, assume not unlocked
      console.warn('Failed to check region unlock status:', error);
    }
  }

  return {
    regionId,
    regionName: region.name,
    collectionSetId,
    collectionSetName: collectionSet.name,
    itemsCollected,
    itemsTotal,
    isUnlocked,
    isComplete,
  };
}

/**
 * Get region unlock progress for all region unlock sets
 */
export async function getAllRegionUnlockProgress(
  collectionManager: CollectionManager,
  regionManager?: RegionManager
): Promise<RegionUnlockProgress[]> {
  const regionUnlockSets = [
    'silk_road_set',
    'spice_trade_set',
    'ancient_temple_set',
    'dragons_hoard_set',
  ];

  const progressPromises = regionUnlockSets.map((setId) =>
    getRegionUnlockProgress(setId, collectionManager, regionManager)
  );

  const progressResults = await Promise.all(progressPromises);

  // Filter out null results
  return progressResults.filter(
    (progress): progress is RegionUnlockProgress => progress !== null
  );
}
