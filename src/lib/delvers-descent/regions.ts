import type { Region } from '@/types/delvers-descent';

/**
 * Region Definitions for Phase 4
 *
 * Defines starting regions with unique themes, encounter distributions,
 * and unlock requirements. Each region provides unique gameplay experiences.
 */

export const FOREST_DEPTHS: Region = {
  id: 'forest_depths',
  name: 'Forest Depths',
  description: 'Ancient woodland with hidden paths and mystical encounters',
  theme: 'ancient_forest',
  isUnlocked: true, // Default starting region
  unlockRequirements: {},
  startingBonus: {
    energyBonus: 0,
    itemsBonus: 0,
  },
  encounterDistribution: {
    puzzle_chamber: 18,
    discovery_site: 25,
    risk_event: 10,
    hazard: 15,
    rest_site: 9,
    safe_passage: 12,
    region_shortcut: 7,
    scoundrel: 18, // Same as puzzle_chamber
  },
  visualTheme: {
    primaryColor: '#2d5016',
    secondaryColor: '#4a7c2a',
    backgroundType: 'forest',
  },
};

export const DESERT_OASIS: Region = {
  id: 'desert_oasis',
  name: 'Desert Oasis',
  description: 'Sandy dunes with hidden oases and ancient ruins',
  theme: 'desert',
  isUnlocked: false,
  unlockRequirements: {
    completedSets: ['silk_road_set'],
    totalItemsCollected: 20,
  },
  startingBonus: {
    energyBonus: 5, // Slightly more starting energy
    itemsBonus: 0,
  },
  encounterDistribution: {
    puzzle_chamber: 13,
    discovery_site: 31,
    risk_event: 16,
    hazard: 9,
    rest_site: 8,
    safe_passage: 12,
    region_shortcut: 6,
    scoundrel: 13, // Same as puzzle_chamber
  },
  visualTheme: {
    primaryColor: '#d4a574',
    secondaryColor: '#c9a06b',
    backgroundType: 'desert',
  },
};

export const MOUNTAIN_PASS: Region = {
  id: 'mountain_pass',
  name: 'Mountain Pass',
  description: 'Treacherous mountain paths with windy cliffs',
  theme: 'mountain',
  isUnlocked: false,
  unlockRequirements: {
    completedSets: ['ancient_temple_set'],
    totalItemsCollected: 35,
  },
  startingBonus: {
    energyBonus: 0,
    itemsBonus: 3, // Extra starting items
  },
  encounterDistribution: {
    puzzle_chamber: 8,
    discovery_site: 18,
    risk_event: 18,
    hazard: 25,
    rest_site: 6,
    safe_passage: 16,
    region_shortcut: 5,
    scoundrel: 8, // Same as puzzle_chamber
  },
  visualTheme: {
    primaryColor: '#5d6d7e',
    secondaryColor: '#85929e',
    backgroundType: 'mountain',
  },
};

export const COASTAL_CAVES: Region = {
  id: 'coastal_caves',
  name: 'Coastal Caves',
  description: 'Wet caves near the ocean with unique sea treasures',
  theme: 'coastal',
  isUnlocked: false,
  unlockRequirements: {
    completedSets: ['spice_trade_set'],
    totalItemsCollected: 25,
  },
  startingBonus: {
    energyBonus: 0,
    itemsBonus: 5, // More starting items, fewer encounters
  },
  encounterDistribution: {
    puzzle_chamber: 8,
    discovery_site: 40,
    risk_event: 9,
    hazard: 10,
    rest_site: 10,
    safe_passage: 13,
    region_shortcut: 7,
    scoundrel: 8, // Same as puzzle_chamber
  },
  visualTheme: {
    primaryColor: '#34495e',
    secondaryColor: '#5dade2',
    backgroundType: 'coastal',
  },
};

export const DRAGONS_LAIR: Region = {
  id: 'dragons_lair',
  name: "Dragon's Lair",
  description:
    'The legendary lair of ancient dragons, filled with legendary treasures',
  theme: 'dragon',
  isUnlocked: false,
  unlockRequirements: {
    completedSets: ['dragons_hoard_set'],
    totalItemsCollected: 50,
  },
  startingBonus: {
    energyBonus: 15, // Highest starting energy
    itemsBonus: 10, // Highest starting items
  },
  encounterDistribution: {
    puzzle_chamber: 4,
    discovery_site: 9,
    risk_event: 27,
    hazard: 27,
    rest_site: 10,
    safe_passage: 12,
    region_shortcut: 7, // Dragons are surprisingly hospitable
    scoundrel: 4, // Same as puzzle_chamber
  },
  visualTheme: {
    primaryColor: '#8b0000',
    secondaryColor: '#ff6347',
    backgroundType: 'dragon',
  },
};

export const REGIONS: Region[] = [
  FOREST_DEPTHS,
  DESERT_OASIS,
  MOUNTAIN_PASS,
  COASTAL_CAVES,
  DRAGONS_LAIR,
];

/**
 * Get region by ID
 */
export function getRegionById(regionId: string): Region | undefined {
  return REGIONS.find((r) => r.id === regionId);
}
