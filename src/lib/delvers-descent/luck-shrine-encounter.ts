import type { EncounterType } from '@/types/delvers-descent';

import { getBalanceManager } from './balance-manager';
import type { AdvancedEncounterOutcome } from './risk-event-encounter';
import { getRunStateManager } from './run-state-manager';

// Re-export for UI components
export type { AdvancedEncounterOutcome };

/**
 * Configuration for a Luck Shrine encounter
 */
export interface LuckShrineConfig {
  multiplierBonus: number; // Fixed bonus: 0.5 (50% increase)
  duration: number; // Number of encounters the boost lasts (2-3)
}

/**
 * State of a Luck Shrine encounter
 */
export interface LuckShrineState {
  encounterId: string;
  encounterType: EncounterType;
  config: LuckShrineConfig;
  isResolved: boolean;
  outcome?: AdvancedEncounterOutcome;
}

/**
 * Luck Shrine Encounter
 * Allows players to activate a luck boost that increases reward multipliers
 * for the next 2-3 encounters.
 */
export class LuckShrineEncounter {
  private state: LuckShrineState;
  private depth: number;

  constructor(encounterId: string, depth: number) {
    this.depth = depth;
    this.state = {
      encounterId,
      encounterType: 'luck_shrine',
      config: {
        multiplierBonus: 0.5, // Fixed 50% bonus
        duration: Math.floor(Math.random() * 2) + 2, // Random: 2 or 3
      },
      isResolved: false,
    };
  }

  /**
   * Get current encounter state
   */
  getState(): LuckShrineState {
    return { ...this.state };
  }

  /**
   * Activate the luck shrine
   * Sets the luck boost in run state and returns the outcome
   */
  async activate(): Promise<AdvancedEncounterOutcome> {
    if (this.state.isResolved) {
      throw new Error('Encounter already resolved');
    }

    // Update run state with luck boost
    const runStateManager = getRunStateManager();
    await runStateManager.setLuckBoost(
      this.state.config.duration,
      this.state.config.multiplierBonus
    );

    const message = `Luck Shrine activated! Your reward multipliers are increased by ${(this.state.config.multiplierBonus * 100).toFixed(0)}% for the next ${this.state.config.duration} encounters.`;

    this.state.outcome = {
      type: 'success',
      message,
      // No direct rewards - the luck boost is the benefit
    };

    this.state.isResolved = true;

    return this.state.outcome;
  }

  /**
   * Calculate the fixed energy cost for this encounter
   */
  getEnergyCost(): number {
    const balanceManager = getBalanceManager();
    return balanceManager.calculateNodeCost(this.depth, 'luck_shrine');
  }
}
