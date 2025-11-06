import type { AvatarCollectionSet, AvatarPartType } from '@/types/avatar';

/**
 * Avatar Collection Set Definitions
 *
 * Defines collection sets for unlocking avatar parts (heads, torsos, legs).
 * Each set contains items that players collect during runs to unlock the corresponding avatar part.
 */

// Head Collection Sets
export const WARRIOR_HELMET_SET: AvatarCollectionSet = {
  id: 'warrior_helmet_set',
  name: 'Warrior Helmet Set',
  description: 'Collect warrior artifacts to unlock the Warrior Helmet',
  category: 'trade_goods',
  items: [
    {
      id: 'warrior_medal',
      name: 'Warrior Medal',
      description: 'A badge of military honor',
      category: 'trade_goods',
      rarity: 'common',
      value: 50,
      setId: 'warrior_helmet_set',
      iconName: 'medal',
    },
    {
      id: 'steel_plate',
      name: 'Steel Plate',
      description: 'Forged steel armor piece',
      category: 'trade_goods',
      rarity: 'uncommon',
      value: 75,
      setId: 'warrior_helmet_set',
      iconName: 'plate',
    },
    {
      id: 'battle_standard',
      name: 'Battle Standard',
      description: 'War banner from ancient conflicts',
      category: 'trade_goods',
      rarity: 'uncommon',
      value: 100,
      setId: 'warrior_helmet_set',
      iconName: 'standard',
    },
    {
      id: 'gauntlet',
      name: 'Gauntlet',
      description: 'Protective hand armor',
      category: 'trade_goods',
      rarity: 'common',
      value: 60,
      setId: 'warrior_helmet_set',
      iconName: 'gauntlet',
    },
  ],
  bonuses: [],
  avatarPartId: 'head_warrior_helmet',
};

export const MAGE_HAT_SET: AvatarCollectionSet = {
  id: 'mage_hat_set',
  name: 'Mage Hat Set',
  description: 'Collect mystical artifacts to unlock the Mage Hat',
  category: 'discoveries',
  items: [
    {
      id: 'crystal_shard',
      name: 'Crystal Shard',
      description: 'A fragment of magical crystal',
      category: 'discoveries',
      rarity: 'common',
      value: 50,
      setId: 'mage_hat_set',
      iconName: 'crystal',
    },
    {
      id: 'spell_scroll',
      name: 'Spell Scroll',
      description: 'Ancient magical writings',
      category: 'discoveries',
      rarity: 'uncommon',
      value: 75,
      setId: 'mage_hat_set',
      iconName: 'scroll',
    },
    {
      id: 'mana_orb',
      name: 'Mana Orb',
      description: 'Glowing sphere of magical energy',
      category: 'discoveries',
      rarity: 'uncommon',
      value: 100,
      setId: 'mage_hat_set',
      iconName: 'orb',
    },
    {
      id: 'wizard_staff',
      name: 'Wizard Staff',
      description: 'Staff imbued with arcane power',
      category: 'discoveries',
      rarity: 'rare',
      value: 200,
      setId: 'mage_hat_set',
      iconName: 'staff',
    },
  ],
  bonuses: [],
  avatarPartId: 'head_mage_hat',
};

export const ROGUE_HOOD_SET: AvatarCollectionSet = {
  id: 'rogue_hood_set',
  name: 'Rogue Hood Set',
  description: 'Collect stealthy relics to unlock the Rogue Hood',
  category: 'trade_goods',
  items: [
    {
      id: 'shadow_cloak',
      name: 'Shadow Cloak',
      description: 'Cloak that blends with darkness',
      category: 'trade_goods',
      rarity: 'common',
      value: 50,
      setId: 'rogue_hood_set',
      iconName: 'cloak',
    },
    {
      id: 'lockpick_set',
      name: 'Lockpick Set',
      description: 'Professional lockpicking tools',
      category: 'trade_goods',
      rarity: 'uncommon',
      value: 75,
      setId: 'rogue_hood_set',
      iconName: 'lockpick',
    },
    {
      id: 'poison_vial',
      name: 'Poison Vial',
      description: 'Deadly toxin in a small bottle',
      category: 'trade_goods',
      rarity: 'uncommon',
      value: 100,
      setId: 'rogue_hood_set',
      iconName: 'vial',
    },
  ],
  bonuses: [],
  avatarPartId: 'head_rogue_hood',
};

export const CROWN_SET: AvatarCollectionSet = {
  id: 'crown_set',
  name: 'Crown Set',
  description: 'Collect royal treasures to unlock the Crown',
  category: 'legendaries',
  items: [
    {
      id: 'royal_seal',
      name: 'Royal Seal',
      description: 'Official seal of the kingdom',
      category: 'legendaries',
      rarity: 'rare',
      value: 500,
      setId: 'crown_set',
      iconName: 'seal',
    },
    {
      id: 'golden_scepter',
      name: 'Golden Scepter',
      description: 'Symbol of royal authority',
      category: 'legendaries',
      rarity: 'epic',
      value: 800,
      setId: 'crown_set',
      iconName: 'scepter',
    },
    {
      id: 'imperial_jewel',
      name: 'Imperial Jewel',
      description: 'Priceless gem from the royal treasury',
      category: 'legendaries',
      rarity: 'legendary',
      value: 1500,
      setId: 'crown_set',
      iconName: 'jewel',
    },
  ],
  bonuses: [],
  avatarPartId: 'head_crown',
};

// Torso Collection Sets
export const WARRIOR_ARMOR_SET: AvatarCollectionSet = {
  id: 'warrior_armor_set',
  name: 'Warrior Armor Set',
  description: 'Collect warrior equipment to unlock the Warrior Armor',
  category: 'trade_goods',
  items: [
    {
      id: 'chainmail',
      name: 'Chainmail',
      description: 'Interlocking metal rings',
      category: 'trade_goods',
      rarity: 'common',
      value: 50,
      setId: 'warrior_armor_set',
      iconName: 'chainmail',
    },
    {
      id: 'shield',
      name: 'Shield',
      description: 'Protective combat shield',
      category: 'trade_goods',
      rarity: 'uncommon',
      value: 75,
      setId: 'warrior_armor_set',
      iconName: 'shield',
    },
    {
      id: 'breastplate',
      name: 'Breastplate',
      description: 'Chest armor piece',
      category: 'trade_goods',
      rarity: 'uncommon',
      value: 100,
      setId: 'warrior_armor_set',
      iconName: 'breastplate',
    },
    {
      id: 'shoulder_pads',
      name: 'Shoulder Pads',
      description: 'Armor for the shoulders',
      category: 'trade_goods',
      rarity: 'common',
      value: 60,
      setId: 'warrior_armor_set',
      iconName: 'pads',
    },
  ],
  bonuses: [],
  avatarPartId: 'torso_warrior_armor',
};

export const MAGE_ROBE_SET: AvatarCollectionSet = {
  id: 'mage_robe_set',
  name: 'Mage Robe Set',
  description: 'Collect arcane artifacts to unlock the Mage Robe',
  category: 'discoveries',
  items: [
    {
      id: 'enchanted_fabric',
      name: 'Enchanted Fabric',
      description: 'Cloth woven with magic',
      category: 'discoveries',
      rarity: 'common',
      value: 50,
      setId: 'mage_robe_set',
      iconName: 'fabric',
    },
    {
      id: 'rune_stone',
      name: 'Rune Stone',
      description: 'Stone inscribed with ancient runes',
      category: 'discoveries',
      rarity: 'uncommon',
      value: 75,
      setId: 'mage_robe_set',
      iconName: 'rune',
    },
    {
      id: 'phylactery',
      name: 'Phylactery',
      description: 'Magical container for spells',
      category: 'discoveries',
      rarity: 'uncommon',
      value: 100,
      setId: 'mage_robe_set',
      iconName: 'phylactery',
    },
    {
      id: 'arcane_pendant',
      name: 'Arcane Pendant',
      description: 'Jewelry imbued with magical power',
      category: 'discoveries',
      rarity: 'rare',
      value: 200,
      setId: 'mage_robe_set',
      iconName: 'pendant',
    },
  ],
  bonuses: [],
  avatarPartId: 'torso_mage_robe',
};

export const RANGER_CLOAK_SET: AvatarCollectionSet = {
  id: 'ranger_cloak_set',
  name: 'Ranger Cloak Set',
  description: 'Collect wilderness finds to unlock the Ranger Cloak',
  category: 'discoveries',
  items: [
    {
      id: 'feather',
      name: 'Feather',
      description: 'Feather from a rare bird',
      category: 'discoveries',
      rarity: 'common',
      value: 50,
      setId: 'ranger_cloak_set',
      iconName: 'feather',
    },
    {
      id: 'herbal_remedy',
      name: 'Herbal Remedy',
      description: 'Natural healing potion',
      category: 'discoveries',
      rarity: 'uncommon',
      value: 75,
      setId: 'ranger_cloak_set',
      iconName: 'herb',
    },
    {
      id: 'tracking_guide',
      name: 'Tracking Guide',
      description: 'Book on animal tracking',
      category: 'discoveries',
      rarity: 'uncommon',
      value: 100,
      setId: 'ranger_cloak_set',
      iconName: 'book',
    },
  ],
  bonuses: [],
  avatarPartId: 'torso_ranger_cloak',
};

export const ROYAL_GARMENT_SET: AvatarCollectionSet = {
  id: 'royal_garment_set',
  name: 'Royal Garment Set',
  description: 'Collect royal treasures to unlock the Royal Garment',
  category: 'legendaries',
  items: [
    {
      id: 'silk_tapestry',
      name: 'Silk Tapestry',
      description: 'Exquisite royal tapestry',
      category: 'legendaries',
      rarity: 'rare',
      value: 500,
      setId: 'royal_garment_set',
      iconName: 'tapestry',
    },
    {
      id: 'royal_pendant',
      name: 'Royal Pendant',
      description: 'Jeweled pendant of the royal family',
      category: 'legendaries',
      rarity: 'epic',
      value: 800,
      setId: 'royal_garment_set',
      iconName: 'pendant',
    },
    {
      id: 'crown_jewels',
      name: 'Crown Jewels',
      description: 'Priceless gems from the royal collection',
      category: 'legendaries',
      rarity: 'legendary',
      value: 1500,
      setId: 'royal_garment_set',
      iconName: 'jewels',
    },
  ],
  bonuses: [],
  avatarPartId: 'torso_royal_garment',
};

// Leg Collection Sets
export const WARRIOR_BOOTS_SET: AvatarCollectionSet = {
  id: 'warrior_boots_set',
  name: 'Warrior Boots Set',
  description: 'Collect warrior gear to unlock the Warrior Boots',
  category: 'trade_goods',
  items: [
    {
      id: 'iron_greaves',
      name: 'Iron Greaves',
      description: 'Leg armor protection',
      category: 'trade_goods',
      rarity: 'common',
      value: 50,
      setId: 'warrior_boots_set',
      iconName: 'greaves',
    },
    {
      id: 'spurs',
      name: 'Spurs',
      description: 'Metal spikes for boots',
      category: 'trade_goods',
      rarity: 'uncommon',
      value: 75,
      setId: 'warrior_boots_set',
      iconName: 'spurs',
    },
    {
      id: 'leather_straps',
      name: 'Leather Straps',
      description: 'Reinforced leather bindings',
      category: 'trade_goods',
      rarity: 'uncommon',
      value: 100,
      setId: 'warrior_boots_set',
      iconName: 'straps',
    },
    {
      id: 'metal_buckles',
      name: 'Metal Buckles',
      description: 'Ornate boot fasteners',
      category: 'trade_goods',
      rarity: 'common',
      value: 60,
      setId: 'warrior_boots_set',
      iconName: 'buckles',
    },
  ],
  bonuses: [],
  avatarPartId: 'legs_warrior_boots',
};

export const MAGE_SANDALS_SET: AvatarCollectionSet = {
  id: 'mage_sandals_set',
  name: 'Mage Sandals Set',
  description: 'Collect mystical items to unlock the Mage Sandals',
  category: 'discoveries',
  items: [
    {
      id: 'magic_thread',
      name: 'Magic Thread',
      description: 'Thread woven with enchantments',
      category: 'discoveries',
      rarity: 'common',
      value: 50,
      setId: 'mage_sandals_set',
      iconName: 'thread',
    },
    {
      id: 'crystal_buckle',
      name: 'Crystal Buckle',
      description: 'Buckle made from magical crystal',
      category: 'discoveries',
      rarity: 'uncommon',
      value: 75,
      setId: 'mage_sandals_set',
      iconName: 'buckle',
    },
    {
      id: 'rune_inscription',
      name: 'Rune Inscription',
      description: 'Ancient runes carved into leather',
      category: 'discoveries',
      rarity: 'uncommon',
      value: 100,
      setId: 'mage_sandals_set',
      iconName: 'inscription',
    },
    {
      id: 'arcane_gem',
      name: 'Arcane Gem',
      description: 'Small gem with magical properties',
      category: 'discoveries',
      rarity: 'rare',
      value: 200,
      setId: 'mage_sandals_set',
      iconName: 'gem',
    },
  ],
  bonuses: [],
  avatarPartId: 'legs_mage_sandals',
};

export const RANGER_LEGGINGS_SET: AvatarCollectionSet = {
  id: 'ranger_leggings_set',
  name: 'Ranger Leggings Set',
  description: 'Collect nature items to unlock the Ranger Leggings',
  category: 'discoveries',
  items: [
    {
      id: 'deer_hide',
      name: 'Deer Hide',
      description: 'Tanned hide from a deer',
      category: 'discoveries',
      rarity: 'common',
      value: 50,
      setId: 'ranger_leggings_set',
      iconName: 'hide',
    },
    {
      id: 'plant_fiber',
      name: 'Plant Fiber',
      description: 'Strong natural fiber',
      category: 'discoveries',
      rarity: 'uncommon',
      value: 75,
      setId: 'ranger_leggings_set',
      iconName: 'fiber',
    },
    {
      id: 'animal_track',
      name: 'Animal Track',
      description: 'Preserved track of a wild animal',
      category: 'discoveries',
      rarity: 'uncommon',
      value: 100,
      setId: 'ranger_leggings_set',
      iconName: 'track',
    },
  ],
  bonuses: [],
  avatarPartId: 'legs_ranger_leggings',
};

export const NOBLE_PANTS_SET: AvatarCollectionSet = {
  id: 'noble_pants_set',
  name: 'Noble Pants Set',
  description: 'Collect noble items to unlock the Noble Pants',
  category: 'legendaries',
  items: [
    {
      id: 'fine_linen',
      name: 'Fine Linen',
      description: 'Exquisite fabric for nobility',
      category: 'legendaries',
      rarity: 'rare',
      value: 500,
      setId: 'noble_pants_set',
      iconName: 'linen',
    },
    {
      id: 'golden_thread',
      name: 'Golden Thread',
      description: 'Thread woven with gold',
      category: 'legendaries',
      rarity: 'epic',
      value: 800,
      setId: 'noble_pants_set',
      iconName: 'thread',
    },
    {
      id: 'noble_seal',
      name: 'Noble Seal',
      description: 'Official seal of nobility',
      category: 'legendaries',
      rarity: 'legendary',
      value: 1500,
      setId: 'noble_pants_set',
      iconName: 'seal',
    },
  ],
  bonuses: [],
  avatarPartId: 'legs_noble_pants',
};

export const ALL_AVATAR_COLLECTION_SETS: AvatarCollectionSet[] = [
  // Head sets
  WARRIOR_HELMET_SET,
  MAGE_HAT_SET,
  ROGUE_HOOD_SET,
  CROWN_SET,
  // Torso sets
  WARRIOR_ARMOR_SET,
  MAGE_ROBE_SET,
  RANGER_CLOAK_SET,
  ROYAL_GARMENT_SET,
  // Leg sets
  WARRIOR_BOOTS_SET,
  MAGE_SANDALS_SET,
  RANGER_LEGGINGS_SET,
  NOBLE_PANTS_SET,
];

/**
 * Get avatar collection sets by part type
 */
export function getAvatarSetsByPartType(
  partType: AvatarPartType
): AvatarCollectionSet[] {
  const prefix = `${partType}_`;
  return ALL_AVATAR_COLLECTION_SETS.filter((set) =>
    set.avatarPartId.startsWith(prefix)
  );
}

/**
 * Get a specific avatar collection set by ID
 */
export function getAvatarCollectionSetById(
  setId: string
): AvatarCollectionSet | undefined {
  return ALL_AVATAR_COLLECTION_SETS.find((set) => set.id === setId);
}

/**
 * Get avatar collection set by avatar part ID
 */
export function getAvatarCollectionSetByPartId(
  partId: string
): AvatarCollectionSet | undefined {
  return ALL_AVATAR_COLLECTION_SETS.find((set) => set.avatarPartId === partId);
}
