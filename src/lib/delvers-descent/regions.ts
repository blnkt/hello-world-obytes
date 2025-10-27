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
    puzzle_chamber: 20,
    trade_opportunity: 20,
    discovery_site: 25,
    risk_event: 10,
    hazard: 15,
    rest_site: 10,
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
    puzzle_chamber: 15,
    trade_opportunity: 30,
    discovery_site: 20,
    risk_event: 15,
    hazard: 10,
    rest_site: 10,
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
    puzzle_chamber: 10,
    trade_opportunity: 15,
    discovery_site: 20,
    risk_event: 20,
    hazard: 30,
    rest_site: 5,
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
    puzzle_chamber: 10,
    trade_opportunity: 25,
    discovery_site: 35,
    risk_event: 10,
    hazard: 10,
    rest_site: 10,
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
    puzzle_chamber: 5,
    trade_opportunity: 5,
    discovery_site: 10,
    risk_event: 30,
    hazard: 30,
    rest_site: 20, // Dragons are surprisingly hospitable
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
