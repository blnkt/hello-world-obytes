import type { CollectedItem, EncounterType } from '@/types/delvers-descent';

import { getBalanceManager } from './balance-manager';
import type { AdvancedEncounterOutcome } from './risk-event-encounter';

// Re-export for UI components
export type { AdvancedEncounterOutcome };

/**
 * Configuration for an Energy Nexus encounter
 */
export interface EnergyNexusConfig {
  conversionRate: number; // Fixed rate: 1 item value = 10 energy (or vice versa)
}

/**
 * Conversion direction
 */
export type ConversionDirection = 'items_to_energy' | 'energy_to_items';

/**
 * State of an Energy Nexus encounter
 */
export interface EnergyNexusState {
  encounterId: string;
  encounterType: EncounterType;
  config: EnergyNexusConfig;
  conversionDirection?: ConversionDirection;
  isResolved: boolean;
  outcome?: AdvancedEncounterOutcome;
}

/**
 * Energy Nexus Encounter
 * Allows players to convert items to energy OR energy to items (one-way conversion per encounter).
 */
export class EnergyNexusEncounter {
  private state: EnergyNexusState;
  private depth: number;

  constructor(encounterId: string, depth: number) {
    this.depth = depth;
    this.state = {
      encounterId,
      encounterType: 'energy_nexus',
      config: {
        conversionRate: 10, // Fixed: 1 item value = 10 energy
      },
      isResolved: false,
    };
  }

  /**
   * Get current encounter state
   */
  getState(): EnergyNexusState {
    return { ...this.state };
  }

  /**
   * Select conversion direction
   */
  selectConversionDirection(direction: ConversionDirection): void {
    if (this.state.isResolved) {
      throw new Error('Encounter already resolved');
    }

    this.state.conversionDirection = direction;
  }

  /**
   * Validate that conversion can be performed
   */
  validateConversion(
    inventory: CollectedItem[],
    currentEnergy: number
  ): boolean {
    if (!this.state.conversionDirection) {
      throw new Error('No conversion direction selected');
    }

    if (this.state.isResolved) {
      return false;
    }

    if (this.state.conversionDirection === 'items_to_energy') {
      // Need at least one item
      return inventory.length > 0;
    } else {
      // Need at least conversionRate energy (minimum 10 energy)
      return currentEnergy >= this.state.config.conversionRate;
    }
  }

  /**
   * Calculate energy from item values
   */
  convertItemsToEnergy(items: CollectedItem[]): number {
    const totalItemValue = items.reduce((sum, item) => sum + item.value, 0);
    return totalItemValue * this.state.config.conversionRate;
  }

  /**
   * Calculate item value from energy
   */
  convertEnergyToItems(energy: number): number {
    // Round down to ensure we don't over-convert
    return Math.floor(energy / this.state.config.conversionRate);
  }

  /**
   * Execute the conversion and return outcome
   * Limits to 1 conversion per encounter
   */
  executeConversion(
    inventory: CollectedItem[],
    currentEnergy: number
  ): AdvancedEncounterOutcome {
    if (this.state.isResolved) {
      throw new Error('Encounter already resolved');
    }

    if (!this.state.conversionDirection) {
      throw new Error('No conversion direction selected');
    }

    if (!this.validateConversion(inventory, currentEnergy)) {
      throw new Error('Insufficient resources for conversion');
    }

    let message = '';
    let energyDelta = 0;
    let itemsToRemove: string[] = [];
    let itemValueGained = 0;

    if (this.state.conversionDirection === 'items_to_energy') {
      // Convert all items to energy
      const energyGained = this.convertItemsToEnergy(inventory);
      energyDelta = energyGained;
      itemsToRemove = inventory.map((item) => item.id);
      const totalItemValue = inventory.reduce(
        (sum, item) => sum + item.value,
        0
      );

      message = `Converted ${totalItemValue} item value to ${energyGained} energy.`;
    } else {
      // Convert energy to items (minimum 1 item value)
      const energyToConvert =
        Math.floor(currentEnergy / this.state.config.conversionRate) *
        this.state.config.conversionRate;
      itemValueGained = this.convertEnergyToItems(energyToConvert);
      energyDelta = -energyToConvert;

      message = `Converted ${energyToConvert} energy to ${itemValueGained} item value.`;
    }

    this.state.outcome = {
      type: 'success',
      message,
      // Include conversion data in outcome for UI to process
      // Note: The UI will need to handle updating energy and inventory
    };

    // Store conversion details in outcome for UI processing
    (this.state.outcome as any).conversionData = {
      energyDelta,
      itemsToRemove,
      itemValueGained,
      direction: this.state.conversionDirection,
    };

    this.state.isResolved = true;

    return this.state.outcome;
  }

  /**
   * Calculate the fixed energy cost for this encounter
   */
  getEnergyCost(): number {
    const balanceManager = getBalanceManager();
    return balanceManager.calculateNodeCost(this.depth, 'energy_nexus');
  }
}
