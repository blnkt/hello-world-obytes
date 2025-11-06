import type { EncounterType } from '@/types/delvers-descent';

import { getBalanceManager } from './balance-manager';
import type { AdvancedEncounterOutcome } from './risk-event-encounter';
import { getRunStateManager } from './run-state-manager';

// Re-export for UI components
export type { AdvancedEncounterOutcome };

/**
 * Configuration for a Fate Weaver encounter
 */
export interface FateWeaverConfig {
  selectedTypes: EncounterType[]; // 3 randomly selected encounter types
  probabilityChangeAmount: number; // Fixed: ±10% (0.1)
}

/**
 * State of a Fate Weaver encounter
 */
export interface FateWeaverState {
  encounterId: string;
  encounterType: EncounterType;
  config: FateWeaverConfig;
  probabilityChanges: Partial<Record<EncounterType, number>>; // Changes for each selected type
  originalDistribution: Record<EncounterType, number>; // Original distribution
  isResolved: boolean;
  outcome?: AdvancedEncounterOutcome;
}

/**
 * Fate Weaver Encounter
 * Allows players to modify encounter probabilities for the rest of the run.
 * Randomly selects 3 encounter types and allows ±10% probability changes.
 */
export class FateWeaverEncounter {
  private state: FateWeaverState;
  private depth: number;

  constructor(
    encounterId: string,
    depth: number,
    currentDistribution: Record<EncounterType, number>
  ) {
    this.depth = depth;

    // Get available encounter types (those with probability > 0)
    const availableTypes = Object.entries(currentDistribution)
      .filter(([_, prob]) => prob > 0)
      .map(([type]) => type as EncounterType);

    // Randomly select 3 different types
    const selectedTypes = this.selectRandomTypes(availableTypes, 3);

    this.state = {
      encounterId,
      encounterType: 'fate_weaver',
      config: {
        selectedTypes,
        probabilityChangeAmount: 0.1, // Fixed ±10%
      },
      probabilityChanges: {},
      originalDistribution: { ...currentDistribution },
      isResolved: false,
    };
  }

  /**
   * Get current encounter state
   */
  getState(): FateWeaverState {
    return { ...this.state };
  }

  /**
   * Modify probability for a selected encounter type
   */
  modifyProbability(
    encounterType: EncounterType,
    direction: 'increase' | 'decrease'
  ): void {
    if (this.state.isResolved) {
      throw new Error('Encounter already resolved');
    }

    if (!this.state.config.selectedTypes.includes(encounterType)) {
      throw new Error('Encounter type not selected by Fate Weaver');
    }

    const changeAmount =
      direction === 'increase'
        ? this.state.config.probabilityChangeAmount
        : -this.state.config.probabilityChangeAmount;

    this.state.probabilityChanges[encounterType] =
      (this.state.probabilityChanges[encounterType] || 0) + changeAmount;
  }

  /**
   * Calculate new distribution with probability changes applied
   */
  calculateNewDistribution(): Record<EncounterType, number> {
    const newDistribution: Record<EncounterType, number> = {
      ...this.state.originalDistribution,
    };

    // Apply probability changes
    Object.entries(this.state.probabilityChanges).forEach(([type, change]) => {
      const encounterType = type as EncounterType;
      const originalProb = this.state.originalDistribution[encounterType] || 0;
      newDistribution[encounterType] = Math.max(0, originalProb + change);
    });

    // Normalize to sum to 1.0
    const sum = Object.values(newDistribution).reduce((a, b) => a + b, 0);
    if (sum > 0) {
      Object.keys(newDistribution).forEach((type) => {
        newDistribution[type as EncounterType] /= sum;
      });
    }

    return newDistribution;
  }

  /**
   * Execute the fate weaver encounter
   * Saves modified probabilities to run state
   */
  async execute(): Promise<AdvancedEncounterOutcome> {
    if (this.state.isResolved) {
      throw new Error('Encounter already resolved');
    }

    // Calculate new distribution
    const newDistribution = this.calculateNewDistribution();

    // Update run state with modified probabilities
    const runStateManager = getRunStateManager();
    await runStateManager.setModifiedEncounterProbabilities(newDistribution);

    const selectedTypesStr = this.state.config.selectedTypes.join(', ');
    const changesCount = Object.keys(this.state.probabilityChanges).length;

    let message = `Fate Weaver has woven new probabilities!`;
    if (changesCount > 0) {
      message += ` Modified probabilities for ${selectedTypesStr}.`;
    } else {
      message += ` No changes were made to encounter probabilities.`;
    }

    this.state.outcome = {
      type: 'success',
      message,
      // No direct rewards - probability modification is the benefit
    };

    this.state.isResolved = true;

    return this.state.outcome;
  }

  /**
   * Calculate the fixed energy cost for this encounter
   */
  getEnergyCost(): number {
    const balanceManager = getBalanceManager();
    return balanceManager.calculateNodeCost(this.depth, 'fate_weaver');
  }

  /**
   * Randomly select n different types from available types
   */
  private selectRandomTypes(
    availableTypes: EncounterType[],
    count: number
  ): EncounterType[] {
    if (availableTypes.length < count) {
      // If not enough types available, return all available
      return [...availableTypes];
    }

    const shuffled = [...availableTypes].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
}
