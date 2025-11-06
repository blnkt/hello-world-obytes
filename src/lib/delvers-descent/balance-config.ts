/**
 * Balance Configuration System
 * Centralized configuration for game balance tuning
 */

import type { EncounterGrouping } from '@/types/delvers-descent';

export interface EncounterGroupingDistribution {
  minigame: number;
  loot: number;
  recovery_and_navigation: number;
  passive: number;
}

export interface DepthConstraint {
  minDepth?: number;
  maxDepth?: number;
}

export interface GroupingBalanceConfig {
  encounterGroupingDistribution: EncounterGroupingDistribution;
  depthConstraints: Record<EncounterGrouping, DepthConstraint>;
}

export interface EnergyBalanceConfig {
  // Base energy cost formula: baseCost + (depth - 1) * depthMultiplier
  baseCost: number; // Default: 5
  depthMultiplier: number; // Default: 2
  minCost: number; // Default: 3
  maxCost: number; // Default: 30

  // Type-specific modifiers
  typeModifiers: {
    puzzle_chamber: number; // Default: 0
    discovery_site: number; // Default: 1
    risk_event: number; // Default: 2
    hazard: number; // Default: 3
    rest_site: number; // Default: -3
    safe_passage: number; // Default: -2 (low cost, free return is the benefit)
    region_shortcut: number; // Default: 1 (normal cost, region switching is the benefit)
    scoundrel: number; // Default: 2 (similar to risk_event, strategic encounter)
    luck_shrine: number; // Default: 2 (utility encounter with fixed cost)
    energy_nexus: number; // Default: 2 (utility encounter with fixed cost)
    fate_weaver: number; // Default: 2 (utility encounter with fixed cost)
  };

  // Return cost configuration
  returnCostBase: number; // Default: 5
  returnCostExponent: number; // Default: 1.5
  shortcutReductionPercent: number; // Default: 0.7 (70% reduction)
}

export interface RewardBalanceConfig {
  // Depth scaling: 1 + depth * depthScalingFactor
  depthScalingFactor: number; // Default: 0.2

  // Encounter type multipliers
  typeMultipliers: {
    puzzle_chamber: number; // Default: 1.0
    discovery_site: number; // Default: 1.1
    risk_event: number; // Default: 1.5
    hazard: number; // Default: 0.8
    rest_site: number; // Default: 0.5
    safe_passage: number; // Default: 0.6
    region_shortcut: number; // Default: 0.5 (low reward, region switching is the benefit)
    scoundrel: number; // Default: 1.2 (tiered rewards based on score)
    luck_shrine: number; // Default: 1.0 (no direct rewards, provides utility)
    energy_nexus: number; // Default: 1.0 (no direct rewards, provides utility)
    fate_weaver: number; // Default: 1.0 (no direct rewards, provides utility)
  };

  // Reward variation (randomness)
  variationBase: number; // Default: 0.15 (±15%)
  variationDepthMultiplier: number; // Default: 0.02 (+2% per depth)
}

export interface DifficultyBalanceConfig {
  // Difficulty curve scaling with depth
  difficultyBaseMultiplier: number; // Default: 1.0
  difficultyDepthMultiplier: number; // Default: 0.2

  // Bust rate target (aim for 20-30%)
  targetBustRateMin: number; // Default: 0.2 (20%)
  targetBustRateMax: number; // Default: 0.3 (30%)

  // Energy thresholds for risk assessment
  safetyMarginLow: number; // Default: 10 (below this is dangerous)
  safetyMarginMedium: number; // Default: 25 (below this is risky)
  safetyMarginHigh: number; // Default: 50 (above this is safe)
}

export interface CollectionBalanceConfig {
  // Collection bonus values
  setCompletionBonusEnergy: number; // Default: 50
  setCompletionBonusItems: number; // Default: 2
  legendaryBonusEnergyMultiplier: number; // Default: 1.5

  // Collection item values
  tradeGoodBaseValue: number; // Default: 10
  discoveryBaseValue: number; // Default: 15
  legendaryBaseValue: number; // Default: 25
}

export interface EncounterBalanceConfig {
  // Encounter distribution percentages
  encounterDistribution: {
    puzzle_chamber: number; // Default: 0.22325 (22.325%)
    discovery_site: number; // Default: 0.1672 (16.72%)
    risk_event: number; // Default: 0.1672 (16.72%)
    hazard: number; // Default: 0.1121 (11.21%)
    rest_site: number; // Default: 0.1121 (11.21%)
    safe_passage: number; // Default: 0.1121 (11.21%)
    region_shortcut: number; // Default: 0.057 (5.7% - rare)
    scoundrel: number; // Default: 0.22325 (22.325% - same as puzzle_chamber)
    luck_shrine: number; // Default: 0.05 (5% - utility encounter)
    energy_nexus: number; // Default: 0.05 (5% - utility encounter)
    fate_weaver: number; // Default: 0.05 (5% - utility encounter)
  };
}

export interface RegionBalanceConfig {
  // Regional difficulty scaling
  difficultyMultipliers: {
    [regionId: string]: number;
  };

  // Region-specific encounter distributions
  encounterDistributions: {
    [regionId: string]: EncounterBalanceConfig['encounterDistribution'];
  };
}

export interface ReturnCostBalanceConfig {
  // Linear tier-based return cost parameters
  baseMultiplier: number; // Default: 5
  exponent?: number; // Kept for backward compatibility, not used in tier system
  tierSize: number; // Number of depth levels per tier (default: 5)
  linearIncrement: number; // Linear increment per tier (default: 5)

  // Can be adjusted for different difficulty curves
  curveType: 'linear' | 'exponential' | 'quadratic';

  // Optional modifiers
  depthModifier?: (depth: number) => number;
}

/**
 * Complete game balance configuration
 */
export interface GameBalanceConfig {
  energy: EnergyBalanceConfig;
  reward: RewardBalanceConfig;
  difficulty: DifficultyBalanceConfig;
  collection: CollectionBalanceConfig;
  encounter: EncounterBalanceConfig;
  region: RegionBalanceConfig;
  returnCost: ReturnCostBalanceConfig;
  grouping: GroupingBalanceConfig;
}

/**
 * Default balance configuration
 * These values represent the current game balance
 * All values can be overridden for testing or adjustment
 */
export const DEFAULT_BALANCE_CONFIG: GameBalanceConfig = {
  energy: {
    baseCost: 5,
    depthMultiplier: 2,
    minCost: 3,
    maxCost: 30,
    typeModifiers: {
      puzzle_chamber: 0,
      discovery_site: 1,
      risk_event: 2,
      hazard: 3,
      rest_site: -3,
      safe_passage: -2,
      region_shortcut: 1,
      scoundrel: 2,
      luck_shrine: 2,
      energy_nexus: 2,
      fate_weaver: 2,
    },
    returnCostBase: 5,
    returnCostExponent: 2.0, // Increased from 1.5 to make return cost scale more aggressively
    shortcutReductionPercent: 0.7,
  },

  reward: {
    depthScalingFactor: 0.2,
    typeMultipliers: {
      puzzle_chamber: 1.0,
      discovery_site: 1.1,
      risk_event: 1.5,
      hazard: 0.8,
      rest_site: 0.5,
      safe_passage: 0.6,
      region_shortcut: 0.5,
      scoundrel: 1.2,
      luck_shrine: 1.0,
      energy_nexus: 1.0,
      fate_weaver: 1.0,
    },
    variationBase: 0.15,
    variationDepthMultiplier: 0.02,
  },

  difficulty: {
    difficultyBaseMultiplier: 1.0,
    difficultyDepthMultiplier: 0.2,
    targetBustRateMin: 0.2,
    targetBustRateMax: 0.3,
    safetyMarginLow: 10,
    safetyMarginMedium: 25,
    safetyMarginHigh: 50,
  },

  collection: {
    setCompletionBonusEnergy: 50,
    setCompletionBonusItems: 2,
    legendaryBonusEnergyMultiplier: 1.5,
    tradeGoodBaseValue: 10,
    discoveryBaseValue: 15,
    legendaryBaseValue: 25,
  },

  encounter: {
    encounterDistribution: {
      puzzle_chamber: 0.16859,
      discovery_site: 0.12626,
      risk_event: 0.12626,
      hazard: 0.08465,
      rest_site: 0.08465,
      safe_passage: 0.08465,
      region_shortcut: 0.04304,
      scoundrel: 0.16859, // Same probability as puzzle_chamber
      luck_shrine: 0.03776, // ~3.8% - utility encounter
      energy_nexus: 0.03776, // ~3.8% - utility encounter
      fate_weaver: 0.03776, // ~3.8% - utility encounter
    },
  },

  region: {
    difficultyMultipliers: {
      default: 1.0,
    },
    encounterDistributions: {
      default: {
        puzzle_chamber: 0.16859,
        discovery_site: 0.12626,
        risk_event: 0.12626,
        hazard: 0.08465,
        rest_site: 0.08465,
        safe_passage: 0.08465,
        region_shortcut: 0.04304,
        scoundrel: 0.16859, // Same probability as puzzle_chamber
        luck_shrine: 0.03776,
        energy_nexus: 0.03776,
        fate_weaver: 0.03776,
      },
      ruins: {
        // Ancient Ruins (exploration/economy)
        puzzle_chamber: 0.14414,
        discovery_site: 0.18553,
        risk_event: 0.09239,
        hazard: 0.09239,
        rest_site: 0.09313,
        safe_passage: 0.08722,
        region_shortcut: 0.04435,
        scoundrel: 0.14414, // Same probability as puzzle_chamber
        luck_shrine: 0.0389,
        energy_nexus: 0.0389,
        fate_weaver: 0.0389,
      },
      caverns: {
        // Crystal Caverns (tension + recovery)
        puzzle_chamber: 0.07281,
        discovery_site: 0.12561,
        risk_event: 0.16721,
        hazard: 0.16721,
        rest_site: 0.12561,
        safe_passage: 0.09441,
        region_shortcut: 0.048,
        scoundrel: 0.07281, // Same probability as puzzle_chamber
        luck_shrine: 0.04211,
        energy_nexus: 0.04211,
        fate_weaver: 0.04211,
      },
      sanctum: {
        // Sanctum Archives (puzzle-forward, restorative)
        puzzle_chamber: 0.20564,
        discovery_site: 0.14326,
        risk_event: 0.07129,
        hazard: 0.03633,
        rest_site: 0.10762,
        safe_passage: 0.08088,
        region_shortcut: 0.04113,
        scoundrel: 0.20564, // Same probability as puzzle_chamber
        luck_shrine: 0.03608,
        energy_nexus: 0.03608,
        fate_weaver: 0.03608,
      },
      market: {
        // Frontier Market (economy burst, low danger)
        puzzle_chamber: 0.12924,
        discovery_site: 0.2179,
        risk_event: 0.10895,
        hazard: 0.0541,
        rest_site: 0.1082,
        safe_passage: 0.08866,
        region_shortcut: 0.04508,
        scoundrel: 0.12924, // Same probability as puzzle_chamber
        luck_shrine: 0.03955,
        energy_nexus: 0.03955,
        fate_weaver: 0.03955,
      },
      wastes: {
        // Ashen Wastes (hard mode)
        puzzle_chamber: 0.03261,
        discovery_site: 0.08696,
        risk_event: 0.21825,
        hazard: 0.21825,
        rest_site: 0.13045,
        safe_passage: 0.09867,
        region_shortcut: 0.05017,
        scoundrel: 0.03261, // Same probability as puzzle_chamber
        luck_shrine: 0.04401,
        energy_nexus: 0.04401,
        fate_weaver: 0.04401,
      },
    },
  },

  returnCost: {
    baseMultiplier: 5,
    tierSize: 5, // Cost increases every 5 depth levels
    linearIncrement: 5, // +5 per tier
    curveType: 'linear',
  },

  grouping: {
    encounterGroupingDistribution: {
      minigame: 0.3,
      loot: 0.4,
      recovery_and_navigation: 0.2,
      passive: 0.1,
    },
    depthConstraints: {
      minigame: {},
      loot: {},
      recovery_and_navigation: { minDepth: 11 },
      passive: {},
    },
  },
};

/**
 * Balance preset configurations for different game modes or testing
 */
export const BALANCE_PRESETS = {
  // Easier mode - more forgiving
  EASY: {
    ...DEFAULT_BALANCE_CONFIG,
    energy: {
      ...DEFAULT_BALANCE_CONFIG.energy,
      baseCost: 4,
      depthMultiplier: 1.5,
      maxCost: 25,
    },
    difficulty: {
      ...DEFAULT_BALANCE_CONFIG.difficulty,
      targetBustRateMin: 0.15,
      targetBustRateMax: 0.25,
      safetyMarginHigh: 60,
    },
  },

  // Harder mode - more challenging
  HARD: {
    ...DEFAULT_BALANCE_CONFIG,
    energy: {
      ...DEFAULT_BALANCE_CONFIG.energy,
      baseCost: 6,
      depthMultiplier: 2.5,
      maxCost: 35,
    },
    difficulty: {
      ...DEFAULT_BALANCE_CONFIG.difficulty,
      targetBustRateMin: 0.25,
      targetBustRateMax: 0.4,
      safetyMarginHigh: 40,
    },
  },

  // Testing mode - balanced for QA
  TESTING: {
    ...DEFAULT_BALANCE_CONFIG,
    energy: {
      ...DEFAULT_BALANCE_CONFIG.energy,
      minCost: 1,
      maxCost: 999,
    },
    difficulty: {
      ...DEFAULT_BALANCE_CONFIG.difficulty,
      targetBustRateMin: 0.05,
      targetBustRateMax: 0.95,
    },
  },
} as const;

/**
 * Helper to merge configurations
 */
export function mergeBalanceConfig(
  base: GameBalanceConfig,
  overrides: Partial<GameBalanceConfig>
): GameBalanceConfig {
  return {
    energy: { ...base.energy, ...overrides.energy },
    reward: { ...base.reward, ...overrides.reward },
    difficulty: { ...base.difficulty, ...overrides.difficulty },
    collection: { ...base.collection, ...overrides.collection },
    encounter: { ...base.encounter, ...overrides.encounter },
    region: { ...base.region, ...overrides.region },
    returnCost: { ...base.returnCost, ...overrides.returnCost },
    grouping: { ...base.grouping, ...overrides.grouping },
  };
}

/**
 * Validate that grouping distribution sums to 1.0 (within tolerance)
 * @param dist The grouping distribution to validate
 * @returns true if distribution sums to 1.0 within tolerance (0.0001), false otherwise
 */
export function validateGroupingDistribution(
  dist: EncounterGroupingDistribution
): boolean {
  const sum =
    dist.minigame + dist.loot + dist.recovery_and_navigation + dist.passive;
  const tolerance = 0.0001;
  return Math.abs(sum - 1.0) < tolerance;
}
