import {
  type EncounterReward,
  type EncounterType,
} from '@/types/delvers-descent';

export interface AdvancedEncounterOutcome {
  type: 'success' | 'failure';
  message: string;
  reward?: EncounterReward;
  consequence?: {
    energyLoss: number;
    itemLossRisk: number;
    forcedRetreat: boolean;
    encounterLockout: boolean;
  };
  freeReturn?: boolean; // Special flag for safe passage
}

export type SafePassageType =
  | 'ancient_portal'
  | 'hidden_tunnel'
  | 'magical_gateway'
  | 'wind_passage'
  | 'light_beam';

export interface SafePassageConfig {
  safePassageType: SafePassageType;
  quality: number; // 1-10 scale
  baseReward: EncounterReward;
  description: string;
  failureConsequence: {
    energyLoss: number;
    itemLossRisk: number; // 0.0 to 1.0
    forcedRetreat: boolean;
    encounterLockout: boolean;
  };
}

export interface SafePassageState {
  encounterId: string;
  encounterType: EncounterType;
  config: SafePassageConfig;
  isResolved: boolean;
  outcome?: AdvancedEncounterOutcome;
}

export class SafePassageEncounter {
  private state: SafePassageState;

  constructor(encounterId: string, config: SafePassageConfig) {
    this.state = {
      encounterId,
      encounterType: 'safe_passage',
      config,
      isResolved: false,
    };
  }

  /**
   * Get current encounter state
   */
  getState(): SafePassageState {
    return { ...this.state };
  }

  /**
   * Complete the encounter - always succeeds with free return
   */
  complete(): AdvancedEncounterOutcome {
    if (this.state.isResolved) {
      return this.state.outcome!;
    }

    const outcome: AdvancedEncounterOutcome = {
      type: 'success',
      message: this.getSuccessMessage(),
      reward: this.calculateReward(),
      freeReturn: true, // This is the key feature - free return
    };

    this.state.outcome = outcome;
    this.state.isResolved = true;

    return outcome;
  }

  /**
   * Get success message based on passage type
   */
  private getSuccessMessage(): string {
    const { safePassageType } = this.state.config;
    const messages: Record<SafePassageType, string> = {
      ancient_portal:
        'You discover an ancient portal that shimmers with protective magic. You can return to the surface at no cost!',
      hidden_tunnel:
        'A hidden tunnel reveals a safe passage back to the surface. No energy is required!',
      magical_gateway:
        'A magical gateway opens before you, offering a free return to the surface.',
      wind_passage:
        'A gentle wind guides you through a safe passage. You can return without spending energy!',
      light_beam:
        'A beam of light illuminates a path to the surface. The journey is effortless!',
    };

    return messages[safePassageType] || messages.ancient_portal;
  }

  /**
   * Calculate reward for completing the safe passage
   * Returns empty reward - free return is the only benefit
   */
  private calculateReward(): EncounterReward {
    return {
      energy: 0,
      items: [],
      xp: 0,
    };
  }

  /**
   * Create a safe passage configuration for a specific type
   */
  static createSafePassageConfig(
    safePassageType: SafePassageType,
    quality: number = 5,
    depth: number = 1
  ): SafePassageConfig {
    const scaledQuality = Math.max(
      1,
      Math.min(10, quality * Math.pow(depth, 0.2))
    );

    const descriptions: Record<SafePassageType, string> = {
      ancient_portal:
        'An ancient portal hums with protective magic, offering a safe return to the surface.',
      hidden_tunnel:
        'A hidden tunnel winds through the dungeon, providing a secret route back to safety.',
      magical_gateway:
        'A magical gateway pulses with energy, ready to transport you back without cost.',
      wind_passage:
        'A gentle wind reveals a passage that leads directly to the surface above.',
      light_beam:
        'A beam of pure light illuminates a safe path through the darkness, back to the surface.',
    };

    const baseReward: EncounterReward = {
      energy: 0,
      items: [],
      xp: 0, // No rewards - free return is the only benefit
    };

    const failureConsequence = {
      energyLoss: Math.round(5 * Math.pow(depth, 0.8)),
      itemLossRisk: 0.05, // Very low risk
      forcedRetreat: false,
      encounterLockout: false,
    };

    return {
      safePassageType,
      quality: scaledQuality,
      baseReward,
      description: descriptions[safePassageType],
      failureConsequence,
    };
  }

  /**
   * Get available passage types
   */
  static getPassageTypes(): SafePassageType[] {
    return [
      'ancient_portal',
      'hidden_tunnel',
      'magical_gateway',
      'wind_passage',
      'light_beam',
    ];
  }
}
