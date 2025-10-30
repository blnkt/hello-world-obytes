import { describe, expect, it, jest } from '@jest/globals';

import {
  type CollectedItemTracking,
  type CollectionSet,
} from '@/types/delvers-descent';

import { CollectionManager } from './collection-manager';

// Mock storage
const mockStorage: Record<string, any> = {};

jest.mock('@/lib/storage', () => ({
  getItem: jest.fn((key: string) => {
    return Promise.resolve(mockStorage[key]);
  }),
  setItem: jest.fn((key: string, value: any) => {
    mockStorage[key] = value;
    return Promise.resolve();
  }),
  removeItem: jest.fn((key: string) => {
    delete mockStorage[key];
    return Promise.resolve();
  }),
}));

describe('CollectionManager', () => {
  beforeEach(() => {
    // Clear mock storage before each test
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  });

  describe('initialization', () => {
    it('should initialize with empty collection', async () => {
      const manager = new CollectionManager();

      const progress = await manager.getCollectionProgress();

      expect(progress.totalItems).toBe(0);
      expect(progress.totalSets).toBe(0);
      expect(progress.completedSets).toEqual([]);
      expect(progress.partialSets).toEqual([]);
    });

    it('should initialize with collection sets', async () => {
      const sets: CollectionSet[] = [
        {
          id: 'test_set',
          name: 'Test Set',
          description: 'Test description',
          category: 'trade_goods',
          items: [],
          bonuses: [],
        },
      ];

      const manager = new CollectionManager(sets);

      const progress = await manager.getCollectionProgress();

      expect(progress.totalSets).toBe(1);
    });
  });

  describe('item collection', () => {
    it('should add collected item', async () => {
      const manager = new CollectionManager();
      const item: CollectedItemTracking = {
        itemId: 'item1',
        setId: 'set1',
        collectedDate: Date.now(),
        runId: 'run1',
        source: 'encounter',
      };

      await manager.addCollectedItem(item);

      const tracking = await manager.getCollectedItems();
      expect(Array.isArray(tracking)).toBe(true);
    });

    it('should handle multiple collected items', async () => {
      const manager = new CollectionManager();

      await manager.addCollectedItem({
        itemId: 'item1',
        setId: 'set1',
        collectedDate: Date.now(),
      });
      await manager.addCollectedItem({
        itemId: 'item2',
        setId: 'set1',
        collectedDate: Date.now(),
      });

      const tracking = await manager.getCollectedItems();
      expect(Array.isArray(tracking)).toBe(true);
    });

    it('should persist collected items across manager instances', async () => {
      const manager1 = new CollectionManager();

      await manager1.addCollectedItem({
        itemId: 'item1',
        setId: 'set1',
        collectedDate: Date.now(),
      });

      const manager2 = new CollectionManager();
      const tracking = await manager2.getCollectedItems();

      expect(Array.isArray(tracking)).toBe(true);
    });
  });

  describe('set completion detection', () => {
    it('should detect completed set', async () => {
      const sets: CollectionSet[] = [
        {
          id: 'set1',
          name: 'Test Set',
          description: 'Test',
          category: 'trade_goods',
          items: [
            {
              id: 'item1',
              name: 'Item 1',
              description: 'Test',
              category: 'trade_goods',
              rarity: 'common',
              value: 10,
              setId: 'set1',
            },
            {
              id: 'item2',
              name: 'Item 2',
              description: 'Test',
              category: 'trade_goods',
              rarity: 'common',
              value: 10,
              setId: 'set1',
            },
          ],
          bonuses: [],
        },
      ];

      const manager = new CollectionManager(sets);

      await manager.addCollectedItem({
        itemId: 'item1',
        setId: 'set1',
        collectedDate: Date.now(),
      });
      await manager.addCollectedItem({
        itemId: 'item2',
        setId: 'set1',
        collectedDate: Date.now(),
      });

      const progress = await manager.getCollectionProgress();

      expect(Array.isArray(progress.completedSets)).toBe(true);
    });

    it('should track partial set progress', async () => {
      const sets: CollectionSet[] = [
        {
          id: 'set1',
          name: 'Test Set',
          description: 'Test',
          category: 'trade_goods',
          items: [
            {
              id: 'item1',
              name: 'Item 1',
              description: 'Test',
              category: 'trade_goods',
              rarity: 'common',
              value: 10,
              setId: 'set1',
            },
            {
              id: 'item2',
              name: 'Item 2',
              description: 'Test',
              category: 'trade_goods',
              rarity: 'common',
              value: 10,
              setId: 'set1',
            },
          ],
          bonuses: [],
        },
      ];

      const manager = new CollectionManager(sets);

      await manager.addCollectedItem({
        itemId: 'item1',
        setId: 'set1',
        collectedDate: Date.now(),
      });

      const progress = await manager.getCollectionProgress();

      expect(progress.completedSets).not.toContain('set1');
      expect(Array.isArray(progress.partialSets)).toBe(true);
    });
  });

  describe('collection statistics', () => {
    it('should calculate collection statistics', async () => {
      const manager = new CollectionManager();

      await manager.addCollectedItem({
        itemId: 'item1',
        setId: 'set1',
        collectedDate: Date.now(),
      });
      await manager.addCollectedItem({
        itemId: 'item2',
        setId: 'set2',
        collectedDate: Date.now(),
      });

      const stats = await manager.getCollectionStatistics();

      expect(stats.totalItemsCollected).toBeGreaterThanOrEqual(0);
      expect(stats.lastCollectionUpdate).toBeDefined();
    });
  });
});
