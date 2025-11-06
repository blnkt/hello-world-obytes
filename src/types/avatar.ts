import type { CollectionSet } from './delvers-descent';

/**
 * Avatar Part Type
 * Defines the three categories of avatar parts
 */
export type AvatarPartType = 'head' | 'torso' | 'legs';

/**
 * Avatar Part
 * Represents a single avatar part that can be unlocked and equipped
 */
export interface AvatarPart {
  id: string;
  name: string;
  description: string;
  partType: AvatarPartType;
  assetPath: string;
  setId: string;
}

/**
 * Avatar Collection Set
 * Extends CollectionSet with an avatarPartId field to link the set to an avatar part
 */
export interface AvatarCollectionSet extends CollectionSet {
  avatarPartId: string;
}

/**
 * Equipped Avatar Parts
 * Tracks which avatar parts are currently equipped on the character
 */
export interface EquippedAvatarParts {
  headId: string;
  torsoId: string;
  legsId: string;
}
