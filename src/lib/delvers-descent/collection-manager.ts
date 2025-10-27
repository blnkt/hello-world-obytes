import { getItem, setItem } from '@/lib/storage';
import type {
  CollectedItemTracking,
  CollectionProgress,
  CollectionSet,
  CollectionStatistics,
  SetProgress,
} from '@/types/delvers-descent';

const COLLECTED_ITEMS_KEY = 'collectedItems';
const SET_COMPLETION_KEY = 'setCompletions';

export class CollectionManager {
  private collectionSets: CollectionSet[];
  private collectedItems: CollectedItemTracking[] = [];
  private completedSets: string[] = [];

  constructor(collectionSets?: CollectionSet[]) {
    this.collectionSets = collectionSets || this.getDefaultCollectionSets();
    this.loadState();
  }

  private async loadState(): Promise<void> {
    try {
      const storedItems = (await getItem(COLLECTED_ITEMS_KEY)) || [];
      this.collectedItems = Array.isArray(storedItems) ? storedItems : [];

      const storedCompletions = (await getItem(SET_COMPLETION_KEY)) || [];
      this.completedSets = Array.isArray(storedCompletions)
        ? storedCompletions
        : [];
    } catch (error) {
      console.error('Failed to load collection state:', error);
      this.collectedItems = [];
      this.completedSets = [];
    }
  }

  private async saveState(): Promise<void> {
    try {
      await setItem(COLLECTED_ITEMS_KEY, this.collectedItems);
      await setItem(SET_COMPLETION_KEY, this.completedSets);
    } catch (error) {
      console.error('Failed to save collection state:', error);
    }
  }

  private getDefaultCollectionSets(): CollectionSet[] {
    // Return empty array for now - will be populated in task 1.3
    return [];
  }

  /**
   * Add a collected item to the collection
   */
  async addCollectedItem(item: CollectedItemTracking): Promise<void> {
    // Check if item already exists
    const existingIndex = this.collectedItems.findIndex(
      (i) => i.itemId === item.itemId && i.setId === item.setId
    );

    if (existingIndex >= 0) {
      // Update existing item
      this.collectedItems[existingIndex] = item;
    } else {
      // Add new item
      this.collectedItems.push(item);
    }

    // Check for set completion
    await this.checkSetCompletion(item.setId);

    await this.saveState();
  }

  /**
   * Get all collected items
   */
  async getCollectedItems(): Promise<CollectedItemTracking[]> {
    await this.waitForLoad();
    return [...this.collectedItems];
  }

  private async waitForLoad(): Promise<void> {
    // Wait a bit for async operations in tests
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  /**
   * Check if a set is completed
   */
  private async checkSetCompletion(setId: string): Promise<void> {
    await this.waitForLoad();

    const set = this.collectionSets.find((s) => s.id === setId);
    if (!set) return;

    const collectedItemsInSet = this.collectedItems.filter(
      (item) => item.setId === setId
    );

    // Get unique item IDs
    const uniqueItemIds = new Set(
      collectedItemsInSet.map((item) => item.itemId)
    );

    // Check if we have all items in the set
    const allItemsCollected = set.items.every((item) =>
      uniqueItemIds.has(item.id)
    );

    if (allItemsCollected && !this.completedSets.includes(setId)) {
      this.completedSets.push(setId);
      await this.saveState();
    }
  }

  /**
   * Get collection progress
   */
  async getCollectionProgress(): Promise<CollectionProgress> {
    await this.waitForLoad();

    const partialSets: SetProgress[] = [];
    const completedSets: string[] = [];

    for (const set of this.collectionSets) {
      const collectedItemsInSet = this.collectedItems.filter(
        (item) => item.setId === set.id
      );

      const uniqueItemIds = new Set(
        collectedItemsInSet.map((item) => item.itemId)
      );

      const collected = uniqueItemIds.size;

      if (collected === set.items.length && collected > 0) {
        completedSets.push(set.id);
      } else if (collected > 0) {
        partialSets.push({
          setId: set.id,
          collected,
          total: set.items.length,
          items: Array.from(uniqueItemIds),
        });
      }
    }

    const byCategory = {
      trade_goods: this.getCategoryProgress('trade_goods'),
      discoveries: this.getCategoryProgress('discoveries'),
      legendaries: this.getCategoryProgress('legendaries'),
    };

    return {
      totalItems: this.collectedItems.length,
      totalSets: this.collectionSets.length,
      completedSets,
      partialSets,
      totalXP: 0, // TODO: Calculate from items
      byCategory,
    };
  }

  private getCategoryProgress(
    category: 'trade_goods' | 'discoveries' | 'legendaries'
  ) {
    const setsInCategory = this.collectionSets.filter(
      (s) => s.category === category
    );
    const itemsInCategory = this.collectedItems.filter((item) => {
      const set = this.collectionSets.find((s) => s.id === item.setId);
      return set?.category === category;
    });

    const uniqueItemIds = new Set(itemsInCategory.map((i) => i.itemId));

    const completed = setsInCategory.filter((set) => {
      const collectedItems = itemsInCategory.filter((i) => i.setId === set.id);
      const uniqueIds = new Set(collectedItems.map((i) => i.itemId));
      return uniqueIds.size === set.items.length;
    }).length;

    return {
      total: setsInCategory.reduce((sum, set) => sum + set.items.length, 0),
      collected: uniqueItemIds.size,
      sets: setsInCategory.length,
      completedSets: completed,
    };
  }

  /**
   * Get collection statistics
   */
  async getCollectionStatistics(): Promise<CollectionStatistics> {
    await this.waitForLoad();
    const progress = await this.getCollectionProgress();

    return {
      totalRunsCompleted: 0, // TODO: Track from run history
      totalItemsCollected: progress.totalItems,
      setsCompleted: progress.completedSets.length,
      collectionCompletionRate:
        progress.totalSets > 0
          ? progress.completedSets.length / progress.totalSets
          : 0,
      favoriteSets: progress.completedSets,
      lastCollectionUpdate:
        this.collectedItems.length > 0
          ? Math.max(...this.collectedItems.map((i) => i.collectedDate))
          : Date.now(),
    };
  }

  /**
   * Get available collection sets
   */
  getCollectionSets(): CollectionSet[] {
    return [...this.collectionSets];
  }
}
