/**
 * Avatar Asset Management
 *
 * Maps avatar part IDs to their corresponding image asset paths.
 * This module provides a centralized way to manage avatar part images.
 *
 * Asset Naming Convention:
 * - Default parts: `assets/{partType}.png` (e.g., `assets/head.png`)
 * - Custom parts: `assets/avatar/{partType}/{partId}_placeholder.png`
 *   (e.g., `assets/avatar/heads/head_warrior_helmet_placeholder.png`)
 *
 * Note: Placeholder images need to be created manually. Until then,
 * all custom parts will use the default images as fallbacks.
 */

import type { AvatarPartType } from '@/types/avatar';

// Default avatar images
const DEFAULT_HEAD = require('../../assets/head.png');
const DEFAULT_TORSO = require('../../assets/torso.png');
const DEFAULT_LEGS = require('../../assets/legs.png');

// Placeholder images for avatar parts
// TODO: Replace these with actual placeholder images once created
// For now, using default images as placeholders
// Uncomment and update once placeholder images are available:
/*
const HEAD_WARRIOR_HELMET = require('../../assets/avatar/heads/head_warrior_helmet_placeholder.png');
const HEAD_MAGE_HAT = require('../../assets/avatar/heads/head_mage_hat_placeholder.png');
const HEAD_ROGUE_HOOD = require('../../assets/avatar/heads/head_rogue_hood_placeholder.png');
const HEAD_CROWN = require('../../assets/avatar/heads/head_crown_placeholder.png');

const TORSO_WARRIOR_ARMOR = require('../../assets/avatar/torsos/torso_warrior_armor_placeholder.png');
const TORSO_MAGE_ROBE = require('../../assets/avatar/torsos/torso_mage_robe_placeholder.png');
const TORSO_RANGER_CLOAK = require('../../assets/avatar/torsos/torso_ranger_cloak_placeholder.png');
const TORSO_ROYAL_GARMENT = require('../../assets/avatar/torsos/torso_royal_garment_placeholder.png');

const LEGS_WARRIOR_BOOTS = require('../../assets/avatar/legs/legs_warrior_boots_placeholder.png');
const LEGS_MAGE_SANDALS = require('../../assets/avatar/legs/legs_mage_sandals_placeholder.png');
const LEGS_RANGER_LEGGINGS = require('../../assets/avatar/legs/legs_ranger_leggings_placeholder.png');
const LEGS_NOBLE_PANTS = require('../../assets/avatar/legs/legs_noble_pants_placeholder.png');
*/

// Temporary: Use defaults until placeholders are created
const HEAD_WARRIOR_HELMET = DEFAULT_HEAD;
const HEAD_MAGE_HAT = DEFAULT_HEAD;
const HEAD_ROGUE_HOOD = DEFAULT_HEAD;
const HEAD_CROWN = DEFAULT_HEAD;

const TORSO_WARRIOR_ARMOR = DEFAULT_TORSO;
const TORSO_MAGE_ROBE = DEFAULT_TORSO;
const TORSO_RANGER_CLOAK = DEFAULT_TORSO;
const TORSO_ROYAL_GARMENT = DEFAULT_TORSO;

const LEGS_WARRIOR_BOOTS = DEFAULT_LEGS;
const LEGS_MAGE_SANDALS = DEFAULT_LEGS;
const LEGS_RANGER_LEGGINGS = DEFAULT_LEGS;
const LEGS_NOBLE_PANTS = DEFAULT_LEGS;

/**
 * Mapping of avatar part IDs to their image sources
 */
export const AVATAR_IMAGE_MAP: Record<string, any> = {
  // Default parts
  default_head: DEFAULT_HEAD,
  default_torso: DEFAULT_TORSO,
  default_legs: DEFAULT_LEGS,

  // Head parts
  head_warrior_helmet: HEAD_WARRIOR_HELMET,
  head_mage_hat: HEAD_MAGE_HAT,
  head_rogue_hood: HEAD_ROGUE_HOOD,
  head_crown: HEAD_CROWN,

  // Torso parts
  torso_warrior_armor: TORSO_WARRIOR_ARMOR,
  torso_mage_robe: TORSO_MAGE_ROBE,
  torso_ranger_cloak: TORSO_RANGER_CLOAK,
  torso_royal_garment: TORSO_ROYAL_GARMENT,

  // Leg parts
  legs_warrior_boots: LEGS_WARRIOR_BOOTS,
  legs_mage_sandals: LEGS_MAGE_SANDALS,
  legs_ranger_leggings: LEGS_RANGER_LEGGINGS,
  legs_noble_pants: LEGS_NOBLE_PANTS,
};

/**
 * Get the image source for an avatar part ID
 * @param partId - The avatar part ID (e.g., 'head_warrior_helmet')
 * @param partType - The type of avatar part (for fallback)
 * @returns The image source for the part, or default image if not found
 */
export function getAvatarImageSource(
  partId: string | undefined,
  partType: AvatarPartType
): any {
  // If no part ID provided, use default
  if (!partId) {
    return getDefaultImage(partType);
  }

  // Check if part ID exists in mapping
  if (AVATAR_IMAGE_MAP[partId]) {
    return AVATAR_IMAGE_MAP[partId];
  }

  // Fallback to default for invalid part IDs
  return getDefaultImage(partType);
}

/**
 * Get default image for a part type
 * @param partType - The type of avatar part
 * @returns The default image for the part type
 */
export function getDefaultImage(partType: AvatarPartType): any {
  switch (partType) {
    case 'head':
      return DEFAULT_HEAD;
    case 'torso':
      return DEFAULT_TORSO;
    case 'legs':
      return DEFAULT_LEGS;
    default:
      return DEFAULT_HEAD;
  }
}
