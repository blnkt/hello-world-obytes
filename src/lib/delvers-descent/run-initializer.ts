import type { DelvingRun } from '@/types/delvers-descent';

import { type BonusManager } from './bonus-manager';
import { type CollectionManager } from './collection-manager';
import { type RegionManager } from './region-manager';

const DEFAULT_STARTING_ENERGY_BONUS = 0;
const DEFAULT_STARTING_ITEMS_BONUS = 0;

export interface RunInitializationOptions {
  baseEnergy: number;
  steps: number;
  selectedRegionId?: string;
}

export interface RunInitializationResult {
  run: DelvingRun;
  bonusEnergy: number;
  totalEnergy: number;
  startingItemsBonus: number;
  activeBonuses: string[];
}

/**
 * RunInitializer - Applies collection bonuses to run initialization
 *
 * Integrates collection bonuses with run initialization to provide permanent
 * progression benefits. Applies energy efficiency, starting bonuses, and other
 * collection-based bonuses to new runs.
 */
export class RunInitializer {
  private collectionManager: CollectionManager;
  private bonusManager: BonusManager;
  private regionManager: RegionManager;

  constructor(
    collectionManager: CollectionManager,
    bonusManager: BonusManager,
    regionManager: RegionManager
  ) {
    this.collectionManager = collectionManager;
    this.bonusManager = bonusManager;
    this.regionManager = regionManager;
  }

  /**
   * Initialize a new run with applied collection bonuses
   */
  async initializeRun(
    runId: string,
    options: RunInitializationOptions
  ): Promise<RunInitializationResult> {
    // Get active bonuses
    const bonusSummary = await this.bonusManager.getBonusSummary();

    // Apply energy efficiency bonus
    const energyEfficiency = 1 + bonusSummary.energyEfficiency / 100;
    const adjustedBaseEnergy = Math.round(
      options.baseEnergy * energyEfficiency
    );

    // Apply starting energy bonus
    const startingEnergyBonus = bonusSummary.startingEnergyBonus;
    const bonusEnergy = Math.round(
      startingEnergyBonus * (options.steps / 1000)
    ); // Scale with steps

    // Apply starting items bonus
    const startingItemsBonus = bonusSummary.startingItemsBonus;

    // Get selected region bonuses
    let regionBonus = { energyBonus: 0, itemsBonus: 0 };
    if (options.selectedRegionId) {
      const region = await this.regionManager.getSelectedRegion();
      if (region) {
        regionBonus = region.startingBonus;
      }
    }

    const totalEnergy =
      adjustedBaseEnergy + bonusEnergy + regionBonus.energyBonus;
    const totalItemsBonus = startingItemsBonus + regionBonus.itemsBonus;

    // Create run object
    const run: DelvingRun = {
      id: runId,
      date: new Date().toISOString(),
      steps: options.steps,
      baseEnergy: adjustedBaseEnergy,
      bonusEnergy: bonusEnergy + regionBonus.energyBonus,
      totalEnergy,
      hasStreakBonus: false,
      status: 'queued',
    };

    // Collect active bonus descriptions
    const activeBonuses = bonusSummary.activeBonuses.map(
      (bonus) => bonus.description
    );

    return {
      run,
      bonusEnergy: bonusEnergy + regionBonus.energyBonus,
      totalEnergy,
      startingItemsBonus: totalItemsBonus,
      activeBonuses,
    };
  }

  /**
   * Get active bonus descriptions for UI display
   */
  async getActiveBonusDescriptions(): Promise<string[]> {
    const bonusSummary = await this.bonusManager.getBonusSummary();
    return bonusSummary.activeBonuses.map((bonus) => bonus.description);
  }

  /**
   * Check if any bonus is currently active
   */
  async hasActiveBonuses(): Promise<boolean> {
    const bonusSummary = await this.bonusManager.getBonusSummary();
    return bonusSummary.totalBonuses > 0;
  }
}
