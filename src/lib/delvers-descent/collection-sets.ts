import type { CollectionSet } from '@/types/delvers-descent';

import { ALL_AVATAR_COLLECTION_SETS } from './avatar-collection-sets';

/**
 * Collection Set Definitions for Phase 4
 *
 * Defines all collection sets including Trade Goods, Regional Discoveries, and Legendary Treasures.
 * Each set contains items that belong to it, completion bonuses, and unlock requirements.
 */

export const SILK_ROAD_SET: CollectionSet = {
  id: 'silk_road_set',
  name: 'Silk Road Collection',
  description: 'Ancient trading route treasures from distant lands',
  category: 'trade_goods',
  items: [
    {
      id: 'silk_bolt',
      name: 'Silk Bolt',
      description: 'Fine silk fabric from the East',
      category: 'trade_goods',
      rarity: 'common',
      value: 50,
      setId: 'silk_road_set',
      iconName: 'silk',
    },
    {
      id: 'spice_sack',
      name: 'Spice Sack',
      description: 'Rare spices from Eastern markets',
      category: 'trade_goods',
      rarity: 'uncommon',
      value: 75,
      setId: 'silk_road_set',
      iconName: 'spice',
    },
    {
      id: 'porcelain_vase',
      name: 'Porcelain Vase',
      description: 'Delicate Eastern porcelain',
      category: 'trade_goods',
      rarity: 'uncommon',
      value: 100,
      setId: 'silk_road_set',
      iconName: 'vase',
    },
    {
      id: 'tea_crate',
      name: 'Tea Crate',
      description: 'Fine tea from mountain regions',
      category: 'trade_goods',
      rarity: 'common',
      value: 60,
      setId: 'silk_road_set',
      iconName: 'tea',
    },
    {
      id: 'jade_sculpture',
      name: 'Jade Sculpture',
      description: 'Beautiful jade carvings',
      category: 'trade_goods',
      rarity: 'rare',
      value: 200,
      setId: 'silk_road_set',
      iconName: 'jade',
    },
  ],
  bonuses: [
    {
      type: 'energy_efficiency',
      value: 10,
      description: '+10% energy efficiency',
      stackingType: 'additive',
    },
  ],
};

export const SPICE_TRADE_SET: CollectionSet = {
  id: 'spice_trade_set',
  name: 'Spice Trade Collection',
  description: 'Rare spices and exotic herbs',
  category: 'trade_goods',
  items: [
    {
      id: 'saffron_bundle',
      name: 'Saffron Bundle',
      description: 'Golden threads of saffron',
      category: 'trade_goods',
      rarity: 'rare',
      value: 300,
      setId: 'spice_trade_set',
      iconName: 'saffron',
    },
    {
      id: 'pepper_jar',
      name: 'Pepper Jar',
      description: 'Black pepper from the Spice Islands',
      category: 'trade_goods',
      rarity: 'common',
      value: 80,
      setId: 'spice_trade_set',
      iconName: 'pepper',
    },
    {
      id: 'cinnamon_roll',
      name: 'Cinnamon Roll',
      description: 'Ceylon cinnamon sticks',
      category: 'trade_goods',
      rarity: 'common',
      value: 70,
      setId: 'spice_trade_set',
      iconName: 'cinnamon',
    },
    {
      id: 'cardamom_pods',
      name: 'Cardamom Pods',
      description: 'Green cardamom seeds',
      category: 'trade_goods',
      rarity: 'uncommon',
      value: 120,
      setId: 'spice_trade_set',
      iconName: 'cardamom',
    },
  ],
  bonuses: [
    {
      type: 'starting_bonus',
      value: 10,
      description: 'Start runs with 10 gold',
      stackingType: 'additive',
    },
  ],
};

export const ANCIENT_TEMPLE_SET: CollectionSet = {
  id: 'ancient_temple_set',
  name: 'Ancient Temple Collection',
  description: 'Sacred relics from forgotten temples',
  category: 'discoveries',
  items: [
    {
      id: 'temple_relief',
      name: 'Temple Relief',
      description: 'Ancient stone carvings',
      category: 'discoveries',
      rarity: 'rare',
      value: 250,
      setId: 'ancient_temple_set',
      iconName: 'relief',
    },
    {
      id: 'sacred_text',
      name: 'Sacred Text',
      description: 'Mysterious ancient writings',
      category: 'discoveries',
      rarity: 'epic',
      value: 400,
      setId: 'ancient_temple_set',
      iconName: 'text',
    },
    {
      id: 'temple_bell',
      name: 'Temple Bell',
      description: 'Resonant ceremonial bell',
      category: 'discoveries',
      rarity: 'rare',
      value: 300,
      setId: 'ancient_temple_set',
      iconName: 'bell',
    },
    {
      id: 'prayer_scroll',
      name: 'Prayer Scroll',
      description: 'Blessed parchment',
      category: 'discoveries',
      rarity: 'uncommon',
      value: 150,
      setId: 'ancient_temple_set',
      iconName: 'scroll',
    },
    {
      id: 'holy_symbol',
      name: 'Holy Symbol',
      description: 'Sacred religious icon',
      category: 'discoveries',
      rarity: 'epic',
      value: 500,
      setId: 'ancient_temple_set',
      iconName: 'symbol',
    },
  ],
  bonuses: [
    {
      type: 'starting_bonus',
      value: 20,
      description: '+20% starting energy',
      stackingType: 'additive',
    },
  ],
};

export const DRAGONS_HOARD_SET: CollectionSet = {
  id: 'dragons_hoard_set',
  name: "Dragon's Hoard Collection",
  description: 'Legendary treasures from dragon hoards',
  category: 'legendaries',
  items: [
    {
      id: 'dragon_scale',
      name: 'Dragon Scale',
      description: 'Iridescent scale from an ancient dragon',
      category: 'legendaries',
      rarity: 'legendary',
      value: 1000,
      setId: 'dragons_hoard_set',
      iconName: 'scale',
    },
    {
      id: 'dragon_heart',
      name: 'Dragon Heart',
      description: 'Pulsing heart of a mighty dragon',
      category: 'legendaries',
      rarity: 'legendary',
      value: 2000,
      setId: 'dragons_hoard_set',
      iconName: 'heart',
    },
    {
      id: 'dragon_eye',
      name: 'Dragon Eye',
      description: 'Glowing eye that sees all',
      category: 'legendaries',
      rarity: 'legendary',
      value: 1500,
      setId: 'dragons_hoard_set',
      iconName: 'eye',
    },
  ],
  bonuses: [
    {
      type: 'unlock_region',
      value: 1,
      description: 'Unlock Dragon Lair region',
      stackingType: 'multiplicative',
    },
  ],
};

export const ALL_COLLECTION_SETS: CollectionSet[] = [
  SILK_ROAD_SET,
  SPICE_TRADE_SET,
  ANCIENT_TEMPLE_SET,
  DRAGONS_HOARD_SET,
  ...ALL_AVATAR_COLLECTION_SETS,
];

/**
 * Get collection sets by category
 */
export function getCollectionSetsByCategory(
  category: 'trade_goods' | 'discoveries' | 'legendaries'
): CollectionSet[] {
  return ALL_COLLECTION_SETS.filter((set) => set.category === category);
}

/**
 * Get a specific collection set by ID
 */
export function getCollectionSetById(setId: string): CollectionSet | undefined {
  return ALL_COLLECTION_SETS.find((set) => set.id === setId);
}
