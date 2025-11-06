import type { CollectedItemTracking } from '@/types/delvers-descent';

import { AvatarCollectionManager } from './avatar-collection-manager';
import {
  ALL_AVATAR_COLLECTION_SETS,
  WARRIOR_HELMET_SET,
} from './avatar-collection-sets';
import { CollectionManager } from './collection-manager';

describe('AvatarCollectionManager', () => {
  let collectionManager: CollectionManager;
  let avatarManager: AvatarCollectionManager;

  beforeEach(() => {
    collectionManager = new CollectionManager([]);
    avatarManager = new AvatarCollectionManager(collectionManager);
  });

  describe('Initialization', () => {
    it('should initialize with default avatar parts unlocked', async () => {
      const unlocked = await avatarManager.getUnlockedAvatarParts();
      expect(unlocked.head).toContain('default_head');
      expect(unlocked.torso).toContain('default_torso');
      expect(unlocked.legs).toContain('default_legs');
    });

    it('should initialize with default avatar parts equipped', async () => {
      const equipped = await avatarManager.getEquippedAvatarParts();
      expect(equipped.headId).toBe('default_head');
      expect(equipped.torsoId).toBe('default_torso');
      expect(equipped.legsId).toBe('default_legs');
    });
  });

  describe('loadState and saveState', () => {
    it('should load unlocked parts from storage', async () => {
      const manager1 = new AvatarCollectionManager(collectionManager);
      await manager1.unlockAvatarPart('head_warrior_helmet');

      const manager2 = new AvatarCollectionManager(collectionManager);
      const unlocked = await manager2.getUnlockedAvatarParts();
      expect(unlocked.head).toContain('head_warrior_helmet');
    });

    it('should load equipped parts from storage', async () => {
      const manager1 = new AvatarCollectionManager(collectionManager);
      await manager1.unlockAvatarPart('head_warrior_helmet');
      await manager1.equipAvatarPart('head', 'head_warrior_helmet');

      const manager2 = new AvatarCollectionManager(collectionManager);
      const equipped = await manager2.getEquippedAvatarParts();
      expect(equipped.headId).toBe('head_warrior_helmet');
    });
  });

  describe('getUnlockedAvatarParts', () => {
    it('should return unlocked parts by category', async () => {
      await avatarManager.unlockAvatarPart('head_warrior_helmet');
      await avatarManager.unlockAvatarPart('torso_warrior_armor');

      const unlocked = await avatarManager.getUnlockedAvatarParts();
      expect(unlocked.head).toContain('default_head');
      expect(unlocked.head).toContain('head_warrior_helmet');
      expect(unlocked.torso).toContain('default_torso');
      expect(unlocked.torso).toContain('torso_warrior_armor');
      expect(unlocked.legs).toContain('default_legs');
    });
  });

  describe('isAvatarPartUnlocked', () => {
    it('should return true for default parts', async () => {
      expect(await avatarManager.isAvatarPartUnlocked('default_head')).toBe(
        true
      );
      expect(await avatarManager.isAvatarPartUnlocked('default_torso')).toBe(
        true
      );
      expect(await avatarManager.isAvatarPartUnlocked('default_legs')).toBe(
        true
      );
    });

    it('should return false for locked parts', async () => {
      expect(
        await avatarManager.isAvatarPartUnlocked('head_warrior_helmet')
      ).toBe(false);
    });

    it('should return true for unlocked parts', async () => {
      await avatarManager.unlockAvatarPart('head_warrior_helmet');
      expect(
        await avatarManager.isAvatarPartUnlocked('head_warrior_helmet')
      ).toBe(true);
    });
  });

  describe('unlockAvatarPart', () => {
    it('should unlock an avatar part', async () => {
      await avatarManager.unlockAvatarPart('head_warrior_helmet');
      expect(
        await avatarManager.isAvatarPartUnlocked('head_warrior_helmet')
      ).toBe(true);
    });

    it('should persist unlocked parts', async () => {
      await avatarManager.unlockAvatarPart('head_warrior_helmet');

      const manager2 = new AvatarCollectionManager(collectionManager);
      expect(await manager2.isAvatarPartUnlocked('head_warrior_helmet')).toBe(
        true
      );
    });
  });

  describe('getEquippedAvatarParts', () => {
    it('should return currently equipped parts', async () => {
      const equipped = await avatarManager.getEquippedAvatarParts();
      expect(equipped.headId).toBe('default_head');
      expect(equipped.torsoId).toBe('default_torso');
      expect(equipped.legsId).toBe('default_legs');
    });
  });

  describe('equipAvatarPart', () => {
    it('should equip an unlocked avatar part', async () => {
      await avatarManager.unlockAvatarPart('head_warrior_helmet');
      await avatarManager.equipAvatarPart('head', 'head_warrior_helmet');

      const equipped = await avatarManager.getEquippedAvatarParts();
      expect(equipped.headId).toBe('head_warrior_helmet');
    });

    it('should not equip a locked avatar part', async () => {
      await avatarManager.equipAvatarPart('head', 'head_warrior_helmet');

      const equipped = await avatarManager.getEquippedAvatarParts();
      expect(equipped.headId).toBe('default_head');
    });

    it('should persist equipped parts', async () => {
      await avatarManager.unlockAvatarPart('head_warrior_helmet');
      await avatarManager.equipAvatarPart('head', 'head_warrior_helmet');

      const manager2 = new AvatarCollectionManager(collectionManager);
      const equipped = await manager2.getEquippedAvatarParts();
      expect(equipped.headId).toBe('head_warrior_helmet');
    });
  });

  describe('checkForAvatarUnlocks', () => {
    it('should unlock avatar part when collection set is completed', async () => {
      // Set up collection manager with avatar sets
      const collectionManagerWithSets = new CollectionManager(
        ALL_AVATAR_COLLECTION_SETS
      );

      // Wait for CollectionManager to initialize
      await new Promise((resolve) => setTimeout(resolve, 50));

      const avatarManagerWithSets = new AvatarCollectionManager(
        collectionManagerWithSets
      );

      // Collect all items in warrior helmet set
      for (const item of WARRIOR_HELMET_SET.items) {
        const tracking: CollectedItemTracking = {
          itemId: item.id,
          setId: WARRIOR_HELMET_SET.id,
          collectedDate: Date.now(),
        };
        await collectionManagerWithSets.addCollectedItem(tracking);
      }

      // Wait for CollectionManager to process all items
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify the set is actually completed in CollectionManager
      const progress = await collectionManagerWithSets.getCollectionProgress();
      expect(progress.completedSets).toContain(WARRIOR_HELMET_SET.id);

      // Check for unlocks
      await avatarManagerWithSets.checkForAvatarUnlocks();

      // Should have unlocked the warrior helmet
      expect(
        await avatarManagerWithSets.isAvatarPartUnlocked('head_warrior_helmet')
      ).toBe(true);
    });

    it('should not unlock avatar part if set is not completed', async () => {
      const collectionManagerWithSets = new CollectionManager(
        ALL_AVATAR_COLLECTION_SETS
      );
      const avatarManagerWithSets = new AvatarCollectionManager(
        collectionManagerWithSets
      );

      // Collect only one item
      const tracking: CollectedItemTracking = {
        itemId: WARRIOR_HELMET_SET.items[0].id,
        setId: WARRIOR_HELMET_SET.id,
        collectedDate: Date.now(),
      };
      await collectionManagerWithSets.addCollectedItem(tracking);

      // Check for unlocks
      await avatarManagerWithSets.checkForAvatarUnlocks();

      // Should not have unlocked
      expect(
        await avatarManagerWithSets.isAvatarPartUnlocked('head_warrior_helmet')
      ).toBe(false);
    });

    it('should not duplicate unlock if already unlocked', async () => {
      const collectionManagerWithSets = new CollectionManager(
        ALL_AVATAR_COLLECTION_SETS
      );
      const avatarManagerWithSets = new AvatarCollectionManager(
        collectionManagerWithSets
      );

      // Manually unlock first
      await avatarManagerWithSets.unlockAvatarPart('head_warrior_helmet');

      // Collect all items and check for unlocks
      for (const item of WARRIOR_HELMET_SET.items) {
        const tracking: CollectedItemTracking = {
          itemId: item.id,
          setId: WARRIOR_HELMET_SET.id,
          collectedDate: Date.now(),
        };
        await collectionManagerWithSets.addCollectedItem(tracking);
      }

      await avatarManagerWithSets.checkForAvatarUnlocks();

      // Should still be unlocked (not duplicated)
      const unlocked = await avatarManagerWithSets.getUnlockedAvatarParts();
      const headUnlocks = unlocked.head.filter(
        (id) => id === 'head_warrior_helmet'
      );
      expect(headUnlocks.length).toBe(1);
    });
  });
});
