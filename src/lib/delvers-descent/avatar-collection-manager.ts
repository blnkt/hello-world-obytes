import { getItem, setItem } from '@/lib/storage';
import type { AvatarPartType, EquippedAvatarParts } from '@/types/avatar';

import { ALL_AVATAR_COLLECTION_SETS } from './avatar-collection-sets';
import type { CollectionManager } from './collection-manager';

const UNLOCKED_AVATAR_PARTS_KEY = 'unlockedAvatarParts';
const EQUIPPED_AVATAR_PARTS_KEY = 'equippedAvatarParts';

const DEFAULT_AVATAR_PARTS = {
  head: 'default_head',
  torso: 'default_torso',
  legs: 'default_legs',
} as const;

interface UnlockedAvatarParts {
  head: string[];
  torso: string[];
  legs: string[];
}

export class AvatarCollectionManager {
  private collectionManager: CollectionManager;
  private unlockedParts: UnlockedAvatarParts = {
    head: [DEFAULT_AVATAR_PARTS.head],
    torso: [DEFAULT_AVATAR_PARTS.torso],
    legs: [DEFAULT_AVATAR_PARTS.legs],
  };
  private equippedParts: EquippedAvatarParts = {
    headId: DEFAULT_AVATAR_PARTS.head,
    torsoId: DEFAULT_AVATAR_PARTS.torso,
    legsId: DEFAULT_AVATAR_PARTS.legs,
  };

  constructor(collectionManager: CollectionManager) {
    this.collectionManager = collectionManager;
    this.loadState();
  }

  private async loadState(): Promise<void> {
    try {
      const storedUnlocked =
        (await getItem<UnlockedAvatarParts>(UNLOCKED_AVATAR_PARTS_KEY)) || null;

      if (storedUnlocked) {
        // Ensure default parts are always included
        this.unlockedParts = {
          head: [
            ...new Set([
              DEFAULT_AVATAR_PARTS.head,
              ...(storedUnlocked.head || []),
            ]),
          ],
          torso: [
            ...new Set([
              DEFAULT_AVATAR_PARTS.torso,
              ...(storedUnlocked.torso || []),
            ]),
          ],
          legs: [
            ...new Set([
              DEFAULT_AVATAR_PARTS.legs,
              ...(storedUnlocked.legs || []),
            ]),
          ],
        };
      }

      const storedEquipped =
        (await getItem<EquippedAvatarParts>(EQUIPPED_AVATAR_PARTS_KEY)) || null;

      if (storedEquipped) {
        this.equippedParts = {
          headId: storedEquipped.headId || DEFAULT_AVATAR_PARTS.head,
          torsoId: storedEquipped.torsoId || DEFAULT_AVATAR_PARTS.torso,
          legsId: storedEquipped.legsId || DEFAULT_AVATAR_PARTS.legs,
        };
      }
    } catch (error) {
      console.error('Failed to load avatar collection state:', error);
      // Keep defaults
    }
  }

  private async saveState(): Promise<void> {
    try {
      await setItem(UNLOCKED_AVATAR_PARTS_KEY, this.unlockedParts);
      await setItem(EQUIPPED_AVATAR_PARTS_KEY, this.equippedParts);
    } catch (error) {
      console.error('Failed to save avatar collection state:', error);
    }
  }

  /**
   * Get all unlocked avatar parts organized by category
   */
  async getUnlockedAvatarParts(): Promise<UnlockedAvatarParts> {
    await this.waitForLoad();
    return {
      head: [...this.unlockedParts.head],
      torso: [...this.unlockedParts.torso],
      legs: [...this.unlockedParts.legs],
    };
  }

  /**
   * Check if an avatar part is unlocked
   */
  async isAvatarPartUnlocked(partId: string): Promise<boolean> {
    await this.waitForLoad();

    if (partId.startsWith('default_')) {
      return true;
    }

    if (partId.startsWith('head_')) {
      return this.unlockedParts.head.includes(partId);
    }

    if (partId.startsWith('torso_')) {
      return this.unlockedParts.torso.includes(partId);
    }

    if (partId.startsWith('legs_')) {
      return this.unlockedParts.legs.includes(partId);
    }

    return false;
  }

  /**
   * Unlock an avatar part
   */
  async unlockAvatarPart(partId: string): Promise<void> {
    await this.waitForLoad();

    if (partId.startsWith('head_')) {
      if (!this.unlockedParts.head.includes(partId)) {
        this.unlockedParts.head.push(partId);
      }
    } else if (partId.startsWith('torso_')) {
      if (!this.unlockedParts.torso.includes(partId)) {
        this.unlockedParts.torso.push(partId);
      }
    } else if (partId.startsWith('legs_')) {
      if (!this.unlockedParts.legs.includes(partId)) {
        this.unlockedParts.legs.push(partId);
      }
    }

    await this.saveState();
  }

  /**
   * Get currently equipped avatar parts
   */
  async getEquippedAvatarParts(): Promise<EquippedAvatarParts> {
    await this.waitForLoad();
    return { ...this.equippedParts };
  }

  /**
   * Equip an avatar part
   */
  async equipAvatarPart(
    partType: AvatarPartType,
    partId: string
  ): Promise<void> {
    await this.waitForLoad();

    // Check if part is unlocked
    const isUnlocked = await this.isAvatarPartUnlocked(partId);
    if (!isUnlocked) {
      return;
    }

    if (partType === 'head') {
      this.equippedParts.headId = partId;
    } else if (partType === 'torso') {
      this.equippedParts.torsoId = partId;
    } else if (partType === 'legs') {
      this.equippedParts.legsId = partId;
    }

    await this.saveState();
  }

  /**
   * Check CollectionManager for completed avatar sets and unlock corresponding parts
   */
  async checkForAvatarUnlocks(): Promise<void> {
    await this.waitForLoad();

    // Wait a bit to ensure CollectionManager has processed all additions
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Get collection progress from CollectionManager
    const progress = await this.collectionManager.getCollectionProgress();

    // Check each completed set
    for (const completedSetId of progress.completedSets) {
      // Find the avatar collection set with this ID
      const avatarSet = ALL_AVATAR_COLLECTION_SETS.find(
        (set) => set.id === completedSetId
      );

      if (avatarSet && avatarSet.avatarPartId) {
        // Check if already unlocked
        const isUnlocked = await this.isAvatarPartUnlocked(
          avatarSet.avatarPartId
        );

        if (!isUnlocked) {
          await this.unlockAvatarPart(avatarSet.avatarPartId);
        }
      }
    }
  }

  private async waitForLoad(): Promise<void> {
    // Wait a bit for async operations in tests
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}
