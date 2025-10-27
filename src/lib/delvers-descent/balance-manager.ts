import type { EncounterType } from '@/types/delvers-descent';

import {
  BALANCE_PRESETS,
  DEFAULT_BALANCE_CONFIG,
  type GameBalanceConfig,
  mergeBalanceConfig,
} from './balance-config';

/**
 * Balance Manager
 * Manages game balance, provides balance calculations, and supports dynamic tuning
 */
export class BalanceManager {
  private config: GameBalanceConfig;

  constructor(config?: GameBalanceConfig) {
    this.config = config || DEFAULT_BALANCE_CONFIG;
  }

  getConfig(): GameBalanceConfig {
    return this.config;
  }

  /**
   * Update balance configuration
   */
  updateConfig(config: Partial<GameBalanceConfig>): void {
    this.config = mergeBalanceConfig(this.config, config);
  }

  /**
   * Load a preset configuration
   */
  loadPreset(preset: keyof typeof BALANCE_PRESETS): void {
    this.config = BALANCE_PRESETS[preset];
  }

  /**
   * Calculate node energy cost based on depth and type
   */
  calculateNodeCost(depth: number, nodeType: EncounterType): number {
    const { baseCost, depthMultiplier, minCost, maxCost, typeModifiers } =
      this.config.energy;

    if (depth < 1) {
      throw new Error('Depth must be at least 1');
    }

    const baseEnergyCost = baseCost + (depth - 1) * depthMultiplier;
    const typeModifier = typeModifiers[nodeType] || 0;
    const finalCost = baseEnergyCost + typeModifier;

    return Math.max(minCost, Math.min(maxCost, finalCost));
  }

  /**
   * Calculate return cost using the configured exponential formula
   */
  calculateReturnCost(depth: number): number {
    const { baseMultiplier, exponent } = this.config.returnCost;
    return Math.round(baseMultiplier * Math.pow(depth, exponent));
  }

  /**
   * Calculate reward scaling by depth
   */
  calculateDepthRewardScaling(depth: number): number {
    const { depthScalingFactor } = this.config.reward;
    return 1 + Math.max(0, depth) * depthScalingFactor;
  }

  /**
   * Calculate final reward value
   */
  calculateRewardValue(
    baseReward: number,
    encounterType: EncounterType,
    depth: number
  ): number {
    const { typeMultipliers, variationBase, variationDepthMultiplier } =
      this.config.reward;

    const depthScaling = this.calculateDepthRewardScaling(depth);
    const typeMultiplier = typeMultipliers[encounterType] || 1.0;
    const baseRewardValue = baseReward * typeMultiplier * depthScaling;

    const variationRange = variationBase + depth * variationDepthMultiplier;
    const variation = (Math.random() - 0.5) * 2 * variationRange;
    const finalReward = baseRewardValue * (1 + variation);

    return Math.round(Math.max(1, finalReward));
  }

  /**
   * Calculate difficulty multiplier for a given depth
   */
  calculateDifficultyMultiplier(depth: number): number {
    const { difficultyBaseMultiplier, difficultyDepthMultiplier } =
      this.config.difficulty;

    return difficultyBaseMultiplier + depth * difficultyDepthMultiplier;
  }

  /**
   * Assess safety margin level
   */
  assessSafetyMargin(
    energy: number,
    returnCost: number
  ): 'low' | 'medium' | 'high' {
    const safetyMargin = energy - returnCost;
    const { safetyMarginLow, safetyMarginMedium, safetyMarginHigh } =
      this.config.difficulty;

    if (safetyMargin < safetyMarginLow) {
      return 'low';
    }

    if (safetyMargin < safetyMarginMedium) {
      return 'medium';
    }

    if (safetyMargin < safetyMarginHigh) {
      return 'medium';
    }

    return 'high';
  }

  /**
   * Calculate collection bonus energy
   */
  calculateCollectionBonusEnergy(setCompletionCount: number): number {
    const { setCompletionBonusEnergy } = this.config.collection;
    return setCompletionBonusEnergy * setCompletionCount;
  }

  /**
   * Calculate collection bonus items
   */
  calculateCollectionBonusItems(setCompletionCount: number): number {
    const { setCompletionBonusItems } = this.config.collection;
    return setCompletionBonusItems * setCompletionCount;
  }

  /**
   * Get encounter distribution
   */
  getEncounterDistribution() {
    return this.config.encounter.encounterDistribution;
  }

  /**
   * Check if current bust rate is within target range
   */
  isBustRateBalanced(
    totalRuns: number,
    bustRuns: number
  ): { balanced: boolean; bustRate: number; targetRange: [number, number] } {
    const bustRate = bustRuns / totalRuns;
    const { targetBustRateMin, targetBustRateMax } = this.config.difficulty;

    return {
      balanced: bustRate >= targetBustRateMin && bustRate <= targetBustRateMax,
      bustRate,
      targetRange: [targetBustRateMin, targetBustRateMax],
    };
  }

  /**
   * Get safety margin configuration
   */
  getSafetyMarginConfig() {
    return {
      low: this.config.difficulty.safetyMarginLow,
      medium: this.config.difficulty.safetyMarginMedium,
      high: this.config.difficulty.safetyMarginHigh,
    };
  }

  /**
   * Calculate expected energy cost for a full run to a given depth
   */
  calculateExpectedEnergyCost(maxDepth: number): number {
    let totalCost = 0;
    const distribution = this.getEncounterDistribution();

    for (let depth = 1; depth <= maxDepth; depth++) {
      const encounterCosts = Object.entries(distribution).map(
        ([encounterType, probability]) => {
          const cost = this.calculateNodeCost(
            depth,
            encounterType as EncounterType
          );
          return cost * probability;
        }
      );

      const expectedCost = encounterCosts.reduce((sum, cost) => sum + cost, 0);
      totalCost += expectedCost;
    }

    return Math.round(totalCost);
  }

  /**
   * Get recommended starting energy for a target depth
   */
  getRecommendedStartingEnergy(targetDepth: number): number {
    const expectedCost = this.calculateExpectedEnergyCost(targetDepth);
    const returnCost = this.calculateReturnCost(targetDepth);
    const safetyBuffer = 50; // Extra energy for safety

    return expectedCost + returnCost + safetyBuffer;
  }

  /**
   * Export current configuration for persistence
   */
  exportConfig(): GameBalanceConfig {
    return JSON.parse(JSON.stringify(this.config));
  }

  /**
   * Import configuration
   */
  importConfig(config: GameBalanceConfig): void {
    this.config = config;
  }
}

/**
 * Global singleton instance
 */
let globalBalanceManager: BalanceManager | null = null;

export function getBalanceManager(): BalanceManager {
  if (!globalBalanceManager) {
    globalBalanceManager = new BalanceManager();
  }

  return globalBalanceManager;
}

export function resetBalanceManager(): void {
  globalBalanceManager = new BalanceManager();
}
