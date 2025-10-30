/**
 * Balance Configuration System
 * Centralized configuration for game balance tuning
 */

export interface EnergyBalanceConfig {
  // Base energy cost formula: baseCost + (depth - 1) * depthMultiplier
  baseCost: number; // Default: 5
  depthMultiplier: number; // Default: 2
  minCost: number; // Default: 3
  maxCost: number; // Default: 30

  // Type-specific modifiers
  typeModifiers: {
    puzzle_chamber: number; // Default: 0
    trade_opportunity: number; // Default: -2
    discovery_site: number; // Default: 1
    risk_event: number; // Default: 2
    hazard: number; // Default: 3
    rest_site: number; // Default: -3
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
    trade_opportunity: number; // Default: 1.2
    discovery_site: number; // Default: 1.1
    risk_event: number; // Default: 1.5
    hazard: number; // Default: 0.8
    rest_site: number; // Default: 0.5
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
    puzzle_chamber: number; // Default: 0.3 (30%)
    trade_opportunity: number; // Default: 0.2 (20%)
    discovery_site: number; // Default: 0.15 (15%)
    risk_event: number; // Default: 0.15 (15%)
    hazard: number; // Default: 0.1 (10%)
    rest_site: number; // Default: 0.1 (10%)
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
  // Exponential return cost curve parameters
  baseMultiplier: number; // Default: 5
  exponent: number; // Default: 1.5

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
      trade_opportunity: -2,
      discovery_site: 1,
      risk_event: 2,
      hazard: 3,
      rest_site: -3,
    },
    returnCostBase: 5,
    returnCostExponent: 1.5,
    shortcutReductionPercent: 0.7,
  },

  reward: {
    depthScalingFactor: 0.2,
    typeMultipliers: {
      puzzle_chamber: 1.0,
      trade_opportunity: 1.2,
      discovery_site: 1.1,
      risk_event: 1.5,
      hazard: 0.8,
      rest_site: 0.5,
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
      puzzle_chamber: 0.3,
      trade_opportunity: 0.2,
      discovery_site: 0.15,
      risk_event: 0.15,
      hazard: 0.1,
      rest_site: 0.1,
    },
  },

  region: {
    difficultyMultipliers: {
      default: 1.0,
    },
    encounterDistributions: {
      default: {
        puzzle_chamber: 0.3,
        trade_opportunity: 0.2,
        discovery_site: 0.15,
        risk_event: 0.15,
        hazard: 0.1,
        rest_site: 0.1,
      },
      ruins: {
        // Ancient Ruins (exploration/economy)
        puzzle_chamber: 0.25,
        trade_opportunity: 0.25,
        discovery_site: 0.2,
        risk_event: 0.1,
        hazard: 0.1,
        rest_site: 0.1,
      },
      caverns: {
        // Crystal Caverns (tension + recovery)
        puzzle_chamber: 0.2,
        trade_opportunity: 0.1,
        discovery_site: 0.15,
        risk_event: 0.2,
        hazard: 0.2,
        rest_site: 0.15,
      },
      sanctum: {
        // Sanctum Archives (puzzle-forward, restorative)
        puzzle_chamber: 0.4,
        trade_opportunity: 0.1,
        discovery_site: 0.2,
        risk_event: 0.1,
        hazard: 0.05,
        rest_site: 0.15,
      },
      market: {
        // Frontier Market (economy burst, low danger)
        puzzle_chamber: 0.2,
        trade_opportunity: 0.35,
        discovery_site: 0.2,
        risk_event: 0.1,
        hazard: 0.05,
        rest_site: 0.1,
      },
      wastes: {
        // Ashen Wastes (hard mode)
        puzzle_chamber: 0.15,
        trade_opportunity: 0.1,
        discovery_site: 0.1,
        risk_event: 0.25,
        hazard: 0.25,
        rest_site: 0.15,
      },
    },
  },

  returnCost: {
    baseMultiplier: 5,
    exponent: 1.5,
    curveType: 'exponential',
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
  };
}
