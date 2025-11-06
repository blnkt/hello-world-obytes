import { AvatarCollectionManager } from '@/lib/delvers-descent/avatar-collection-manager';
import { ALL_AVATAR_COLLECTION_SETS } from '@/lib/delvers-descent/avatar-collection-sets';
import { CollectionManager } from '@/lib/delvers-descent/collection-manager';
import { ALL_COLLECTION_SETS } from '@/lib/delvers-descent/collection-sets';

describe('Avatar Collection Integration', () => {
  describe('CollectionManager Integration', () => {
    it('should include avatar collection sets in ALL_COLLECTION_SETS', () => {
      const avatarSetIds = ALL_AVATAR_COLLECTION_SETS.map((set) => set.id);
      const allSetIds = ALL_COLLECTION_SETS.map((set) => set.id);

      // All avatar sets should be in ALL_COLLECTION_SETS
      for (const avatarSetId of avatarSetIds) {
        expect(allSetIds).toContain(avatarSetId);
      }
    });

    it('should allow collecting avatar set items', async () => {
      const collectionManager = new CollectionManager(ALL_COLLECTION_SETS);
      const avatarCollectionManager = new AvatarCollectionManager(
        collectionManager
      );

      // Wait for CollectionManager to finish loading state
      await new Promise((resolve) => setTimeout(resolve, 50));

      const warriorHelmetSet = ALL_AVATAR_COLLECTION_SETS.find(
        (set) => set.id === 'warrior_helmet_set'
      );

      if (!warriorHelmetSet) {
        throw new Error('Warrior helmet set not found');
      }

      // Verify the set exists in CollectionManager
      const sets = collectionManager.getCollectionSets();
      const setExists = sets.some((set) => set.id === 'warrior_helmet_set');
      expect(setExists).toBe(true);

      // Add all items from the warrior helmet set
      for (const item of warriorHelmetSet.items) {
        await collectionManager.addCollectedItem({
          itemId: item.id,
          setId: item.setId,
          collectedDate: Date.now(),
          runId: 'test-run',
          source: 'encounter',
        });
      }

      // Wait for processing
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Verify the set is completed in CollectionManager
      const progress = await collectionManager.getCollectionProgress();
      expect(progress.completedSets).toContain('warrior_helmet_set');

      // Check that avatar part should be unlocked
      await avatarCollectionManager.checkForAvatarUnlocks();

      // Wait a bit more for unlock to be processed
      await new Promise((resolve) => setTimeout(resolve, 100));

      const isUnlocked = await avatarCollectionManager.isAvatarPartUnlocked(
        'head_warrior_helmet'
      );

      expect(isUnlocked).toBe(true);
    });
  });

  describe('Collection Overview Display', () => {
    it('should display avatar collection sets in collection overview', () => {
      const collectionManager = new CollectionManager(ALL_COLLECTION_SETS);
      const sets = collectionManager.getCollectionSets();

      // Should include avatar sets
      const avatarSets = sets.filter((set) =>
        ALL_AVATAR_COLLECTION_SETS.some((as) => as.id === set.id)
      );

      expect(avatarSets.length).toBeGreaterThan(0);
    });
  });
});
