import type {
  ActiveBonus,
  BonusType,
  CollectionBonusSummary,
} from '@/types/delvers-descent';

import { type CollectionManager } from './collection-manager';

/**
 * BonusManager - Manages collection bonuses and their application
 *
 * Calculates active bonuses from completed sets, provides bonus summaries,
 * and applies bonuses to game values (energy, items, encounter odds, etc.)
 */
export class BonusManager {
  private collectionManager: CollectionManager;
  private bonusConfig: BonusConfig;

  constructor(
    collectionManager: CollectionManager,
    bonusConfig?: Partial<BonusConfig>
  ) {
    this.collectionManager = collectionManager;
    this.bonusConfig = {
      energyEfficiencyBase: bonusConfig?.energyEfficiencyBase ?? 0.1,
      startingEnergyBase: bonusConfig?.startingEnergyBase ?? 0.2,
      startingItemsBase: bonusConfig?.startingItemsBase ?? 5,
      encounterOddsBase: bonusConfig?.encounterOddsBase ?? 0.05,
      shortcutChanceBase: bonusConfig?.shortcutChanceBase ?? 0.1,
      ...bonusConfig,
    };
  }

  /**
   * Get all active bonuses from completed sets
   */
  async getActiveBonuses(): Promise<ActiveBonus[]> {
    const progress = await this.collectionManager.getCollectionProgress();
    const collectionSets = this.collectionManager.getCollectionSets();
    const activeBonuses: ActiveBonus[] = [];

    for (const completedSetId of progress.completedSets) {
      const set = collectionSets.find((s) => s.id === completedSetId);
      if (!set) continue;

      for (const bonus of set.bonuses) {
        activeBonuses.push({
          type: bonus.type,
          value: bonus.value,
          source: completedSetId,
          isActive: true,
          description: bonus.description,
        });
      }
    }

    return activeBonuses;
  }

  /**
   * Get bonus summary with calculated totals
   */
  async getBonusSummary(): Promise<CollectionBonusSummary> {
    const activeBonuses = await this.getActiveBonuses();

    const summary: CollectionBonusSummary = {
      totalBonuses: activeBonuses.length,
      activeBonuses,
      energyEfficiency: this.calculateTotalBonus(
        activeBonuses,
        'energy_efficiency'
      ),
      startingEnergyBonus: this.calculateTotalBonus(
        activeBonuses,
        'starting_bonus'
      ),
      startingItemsBonus: this.calculateTotalBonus(
        activeBonuses,
        'starting_bonus'
      ),
      encounterOddsBonus: this.calculateTotalBonus(
        activeBonuses,
        'energy_efficiency'
      ),
      shortcutChanceBonus: this.calculateTotalBonus(
        activeBonuses,
        'permanent_ability'
      ),
    };

    return summary;
  }

  /**
   * Calculate total bonus value for a specific bonus type
   */
  private calculateTotalBonus(
    activeBonuses: ActiveBonus[],
    bonusType: BonusType
  ): number {
    const matchingBonuses = activeBonuses.filter(
      (bonus) => bonus.type === bonusType && bonus.isActive
    );

    if (matchingBonuses.length === 0) {
      return 0;
    }

    // For now, use additive stacking (can be enhanced later)
    return matchingBonuses.reduce((sum, bonus) => sum + bonus.value, 0);
  }

  /**
   * Apply energy efficiency bonus to a value
   */
  applyEnergyEfficiencyBonus(baseValue: number): number {
    // This will be implemented to apply the energy efficiency bonus
    // For now, return the base value
    return baseValue;
  }

  /**
   * Apply starting energy bonus to a value
   */
  applyStartingEnergyBonus(baseEnergy: number): number {
    // This will be implemented to apply the starting energy bonus
    // For now, return the base energy
    return baseEnergy;
  }

  /**
   * Check if a region is unlocked based on completed sets
   */
  async isRegionUnlocked(requiredSetId: string): Promise<boolean> {
    const progress = await this.collectionManager.getCollectionProgress();
    return progress.completedSets.includes(requiredSetId);
  }
}

export interface BonusConfig {
  energyEfficiencyBase: number;
  startingEnergyBase: number;
  startingItemsBase: number;
  encounterOddsBase: number;
  shortcutChanceBase: number;
}
