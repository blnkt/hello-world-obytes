import type { EncounterReward } from '@/types/delvers-descent';

export interface RiskWarning {
  level: 'safe' | 'caution' | 'danger' | 'critical';
  message: string;
  safetyMargin: number;
}

export interface BustConsequence {
  message: string;
  xpPreserved: boolean;
  itemsLost: boolean;
  energyLost: number;
}

export interface CashOutSummary {
  totalItems: number;
  totalXP: number;
  totalEnergy: number;
  rewardDetails: string;
}

export interface CashOutResult {
  success: boolean;
  xpPreserved: boolean;
  preservedXp: number;
  bankedItems: number;
}

export interface BustResult {
  xpPreserved: boolean;
  preservedXp: number;
  itemsLost: number;
}

export class CashOutManager {
  private readonly SAFE_THRESHOLD = 0.5; // 50% remaining energy
  private readonly CAUTION_THRESHOLD = 0.3; // 30% remaining energy
  private readonly DANGER_THRESHOLD = 0.1; // 10% remaining energy
  private readonly CRITICAL_THRESHOLD = 0.0; // 0% remaining energy

  /**
   * Always allow player to continue (no forced busts)
   */
  canContinue(currentEnergy: number, returnCost: number): boolean {
    // Player always has the choice to continue, regardless of energy
    return true;
  }

  /**
   * Check if player can safely cash out
   */
  canCashOut(
    currentEnergy: number,
    returnCost: number,
    rewards: EncounterReward
  ): boolean {
    const safetyMargin = this.calculateSafetyMargin(currentEnergy, returnCost);
    // Can cash out if there's any safety margin
    return safetyMargin > 0;
  }

  /**
   * Calculate safety margin (remaining energy after return cost)
   */
  calculateSafetyMargin(currentEnergy: number, returnCost: number): number {
    return Math.max(0, currentEnergy - returnCost);
  }

  /**
   * Get risk warning based on current situation
   */
  getRiskWarning(currentEnergy: number, returnCost: number): RiskWarning {
    const safetyMargin = this.calculateSafetyMargin(currentEnergy, returnCost);
    const safetyPercentage = safetyMargin / currentEnergy;

    if (safetyPercentage >= this.SAFE_THRESHOLD) {
      return {
        level: 'safe',
        message: `Safe to continue. ${Math.round(safetyMargin)} energy remaining after return.`,
        safetyMargin,
      };
    } else if (safetyPercentage >= this.CAUTION_THRESHOLD) {
      return {
        level: 'caution',
        message: `Caution: ${Math.round(safetyMargin)} energy remaining. Consider cashing out soon.`,
        safetyMargin,
      };
    } else if (safetyPercentage >= this.DANGER_THRESHOLD) {
      return {
        level: 'danger',
        message: `Danger: ${Math.round(safetyMargin)} energy remaining! Return cost is expensive.`,
        safetyMargin,
      };
    } else {
      return {
        level: 'critical',
        message: `CRITICAL: Point of no return! You cannot afford to return!`,
        safetyMargin,
      };
    }
  }

  /**
   * Securely bank all collected items on cash out
   */
  bankRewards(rewards: EncounterReward): EncounterReward {
    // Return a deep copy to prevent mutation
    return {
      energy: rewards.energy,
      items: rewards.items.map((item) => ({ ...item })),
      xp: rewards.xp,
    };
  }

  /**
   * Process cash out with XP preservation
   */
  processCashOut(rewards: EncounterReward): CashOutResult {
    const bankedRewards = this.bankRewards(rewards);

    return {
      success: true,
      xpPreserved: true,
      preservedXp: bankedRewards.xp,
      bankedItems: bankedRewards.items.length,
    };
  }

  /**
   * Process bust with XP preservation
   */
  processBust(rewards: EncounterReward): BustResult {
    // XP is always preserved, even on bust
    return {
      xpPreserved: true,
      preservedXp: rewards.xp,
      itemsLost: rewards.items.length,
    };
  }

  /**
   * Get bust consequence explanation with context
   */
  getBustConsequence(context?: {
    currentEnergy?: number;
    returnCost?: number;
    itemsLost?: number;
  }): BustConsequence {
    const itemsLost = context?.itemsLost ?? 0;
    const energyLost = context?.currentEnergy ?? 100;

    let message =
      'You have exhausted your energy and cannot afford to return to the surface safely. ';

    if (itemsLost > 0) {
      message += `Your ${itemsLost} collected item${itemsLost === 1 ? '' : 's'} ${itemsLost === 1 ? 'has' : 'have'} been lost. `;
    } else {
      message += 'Your collected items are lost. ';
    }

    message +=
      'However, your XP (step progress) is preserved and you will retain your progression.';

    return {
      message,
      xpPreserved: true,
      itemsLost: true,
      energyLost,
    };
  }

  /**
   * Get cash out summary with reward details
   */
  getCashOutSummary(rewards: EncounterReward): CashOutSummary {
    const itemNames = rewards.items.map((item) => item.name).join(', ');

    return {
      totalItems: rewards.items.length,
      totalXP: rewards.xp,
      totalEnergy: rewards.energy,
      rewardDetails: itemNames || 'No items collected',
    };
  }
}
