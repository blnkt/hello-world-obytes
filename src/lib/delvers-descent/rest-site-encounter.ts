import {
  type AdvancedEncounterItem,
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
}

export type RestSiteType =
  | 'ancient_shrine'
  | 'crystal_cave'
  | 'mystic_grove'
  | 'energy_well'
  | 'guardian_sanctuary';

export interface RestSiteConfig {
  restSiteType: RestSiteType;
  quality: number; // 1-10 scale
  baseReward: EncounterReward;
  energyReserve: {
    maxCapacity: number;
    currentCapacity: number;
    regenerationRate: number; // per rest action
  };
  strategicIntel: {
    mapReveals: number;
    shortcutHints: number;
    hazardWarnings: number;
  };
  failureConsequence: {
    energyLoss: number;
    itemLossRisk: number; // 0.0 to 1.0
    forcedRetreat: boolean;
    encounterLockout: boolean;
  };
}

export interface RestAction {
  id: string;
  name: string;
  description: string;
  energyCost: number;
  energyGain: number;
  intelGain: {
    mapReveals: number;
    shortcutHints: number;
    hazardWarnings: number;
  };
  specialEffect?: string;
}

export interface RestSiteState {
  encounterId: string;
  encounterType: EncounterType;
  config: RestSiteConfig;
  availableActions: RestAction[];
  selectedAction?: RestAction;
  isResolved: boolean;
  outcome?: AdvancedEncounterOutcome;
}

export class RestSiteEncounter {
  private state: RestSiteState;

  constructor(encounterId: string, config: RestSiteConfig) {
    this.state = {
      encounterId,
      encounterType: 'rest_site',
      config,
      availableActions: this.generateRestActions(
        config.restSiteType,
        config.quality
      ),
      isResolved: false,
    };
  }

  /**
   * Get current encounter state
   */
  getState(): RestSiteState {
    return { ...this.state };
  }

  /**
   * Select a rest action
   */
  selectAction(actionId: string): boolean {
    const action = this.state.availableActions.find((a) => a.id === actionId);
    if (!action) {
      return false;
    }

    this.state.selectedAction = action;
    return true;
  }

  /**
   * Resolve the rest site encounter
   */
  resolve(): AdvancedEncounterOutcome {
    if (!this.state.selectedAction) {
      throw new Error('No action selected for rest site encounter');
    }

    if (this.state.isResolved) {
      return this.state.outcome!;
    }

    const action = this.state.selectedAction;
    const netEnergyGain = action.energyGain - action.energyCost;

    // Calculate actual energy gained (limited by reserve capacity)
    const actualEnergyGain = Math.min(
      netEnergyGain,
      this.state.config.energyReserve.currentCapacity
    );

    // Calculate intel rewards
    const intelReward = this.calculateIntelReward(action);

    const modifiedReward: EncounterReward = {
      energy: actualEnergyGain,
      items: [...this.state.config.baseReward.items, ...intelReward.items],
      xp: this.state.config.baseReward.xp + intelReward.xp,
    };

    let message = `Rest completed at the ${this.state.config.restSiteType.replace('_', ' ')}.`;
    if (actualEnergyGain > 0) {
      message += ` You gained ${actualEnergyGain} energy.`;
    }
    if (intelReward.items.length > 0) {
      message += ` You discovered valuable information.`;
    }
    if (action.specialEffect) {
      message += ` ${action.specialEffect}`;
    }

    this.state.outcome = {
      type: 'success',
      reward: modifiedReward,
      message,
    };

    this.state.isResolved = true;
    return this.state.outcome;
  }

  /**
   * Generate rest actions based on rest site type and quality
   */
  private generateRestActions(
    restSiteType: RestSiteType,
    quality: number
  ): RestAction[] {
    const baseActions: RestAction[] = [
      {
        id: 'quick_rest',
        name: 'Quick Rest',
        description: 'Take a brief rest to recover some energy',
        energyCost: 0,
        energyGain: Math.round(5 * Math.pow(quality, 0.5)),
        intelGain: {
          mapReveals: 0,
          shortcutHints: 0,
          hazardWarnings: 0,
        },
      },
      {
        id: 'thorough_rest',
        name: 'Thorough Rest',
        description: 'Take time to fully recover and gather information',
        energyCost: Math.round(2 * Math.pow(quality, 0.3)),
        energyGain: Math.round(10 * Math.pow(quality, 0.7)),
        intelGain: {
          mapReveals: Math.round(quality * 0.3),
          shortcutHints: Math.round(quality * 0.2),
          hazardWarnings: Math.round(quality * 0.1),
        },
      },
      {
        id: 'meditation',
        name: 'Meditation',
        description: 'Focus your mind to gain deeper insights',
        energyCost: Math.round(5 * Math.pow(quality, 0.4)),
        energyGain: Math.round(3 * Math.pow(quality, 0.6)),
        intelGain: {
          mapReveals: Math.round(quality * 0.5),
          shortcutHints: Math.round(quality * 0.4),
          hazardWarnings: Math.round(quality * 0.3),
        },
        specialEffect: 'Gains enhanced perception for future encounters',
      },
    ];

    // Add site-specific actions
    const specificActions = this.getSiteSpecificActions(restSiteType, quality);

    return [...baseActions, ...specificActions];
  }

  /**
   * Get site-specific rest actions
   */
  private getSiteSpecificActions(
    restSiteType: RestSiteType,
    quality: number
  ): RestAction[] {
    switch (restSiteType) {
      case 'ancient_shrine':
        return this.getAncientShrineActions(quality);
      case 'crystal_cave':
        return this.getCrystalCaveActions(quality);
      case 'mystic_grove':
        return this.getMysticGroveActions(quality);
      case 'energy_well':
        return this.getEnergyWellActions(quality);
      case 'guardian_sanctuary':
        return this.getGuardianSanctuaryActions(quality);
      default:
        return [];
    }
  }

  private getAncientShrineActions(quality: number): RestAction[] {
    return [
      {
        id: 'prayer',
        name: 'Prayer',
        description: 'Offer prayers to the ancient spirits',
        energyCost: 0,
        energyGain: Math.round(8 * Math.pow(quality, 0.6)),
        intelGain: {
          mapReveals: Math.round(quality * 0.4),
          shortcutHints: Math.round(quality * 0.3),
          hazardWarnings: Math.round(quality * 0.2),
        },
        specialEffect: 'May receive divine guidance',
      },
      {
        id: 'offering',
        name: 'Make Offering',
        description: 'Leave an offering to gain favor',
        energyCost: Math.round(3 * Math.pow(quality, 0.3)),
        energyGain: Math.round(15 * Math.pow(quality, 0.8)),
        intelGain: {
          mapReveals: Math.round(quality * 0.6),
          shortcutHints: Math.round(quality * 0.5),
          hazardWarnings: Math.round(quality * 0.4),
        },
        specialEffect: 'Gains blessing that reduces future energy costs',
      },
    ];
  }

  private getCrystalCaveActions(quality: number): RestAction[] {
    return [
      {
        id: 'crystal_harvest',
        name: 'Harvest Crystals',
        description: 'Gather energy from the crystals',
        energyCost: Math.round(4 * Math.pow(quality, 0.4)),
        energyGain: Math.round(12 * Math.pow(quality, 0.7)),
        intelGain: {
          mapReveals: Math.round(quality * 0.3),
          shortcutHints: Math.round(quality * 0.2),
          hazardWarnings: Math.round(quality * 0.1),
        },
        specialEffect: 'May discover rare crystal formations',
      },
      {
        id: 'crystal_resonance',
        name: 'Crystal Resonance',
        description: 'Harmonize with the crystal frequencies',
        energyCost: Math.round(6 * Math.pow(quality, 0.5)),
        energyGain: Math.round(6 * Math.pow(quality, 0.6)),
        intelGain: {
          mapReveals: Math.round(quality * 0.7),
          shortcutHints: Math.round(quality * 0.6),
          hazardWarnings: Math.round(quality * 0.5),
        },
        specialEffect: 'Gains enhanced spatial awareness',
      },
    ];
  }

  private getMysticGroveActions(quality: number): RestAction[] {
    return [
      {
        id: 'nature_bond',
        name: 'Nature Bond',
        description: 'Connect with the natural energies',
        energyCost: Math.round(2 * Math.pow(quality, 0.3)),
        energyGain: Math.round(7 * Math.pow(quality, 0.6)),
        intelGain: {
          mapReveals: Math.round(quality * 0.4),
          shortcutHints: Math.round(quality * 0.3),
          hazardWarnings: Math.round(quality * 0.2),
        },
        specialEffect: 'Gains ability to sense natural hazards',
      },
    ];
  }

  private getEnergyWellActions(quality: number): RestAction[] {
    return [
      {
        id: 'well_draw',
        name: 'Draw from Well',
        description: 'Draw pure energy from the well',
        energyCost: Math.round(1 * Math.pow(quality, 0.2)),
        energyGain: Math.round(20 * Math.pow(quality, 0.8)),
        intelGain: {
          mapReveals: Math.round(quality * 0.2),
          shortcutHints: Math.round(quality * 0.1),
          hazardWarnings: Math.round(quality * 0.1),
        },
        specialEffect: 'May discover ancient energy patterns',
      },
    ];
  }

  private getGuardianSanctuaryActions(quality: number): RestAction[] {
    return [
      {
        id: 'guardian_counsel',
        name: 'Guardian Counsel',
        description: 'Seek wisdom from the guardian',
        energyCost: Math.round(5 * Math.pow(quality, 0.4)),
        energyGain: Math.round(5 * Math.pow(quality, 0.5)),
        intelGain: {
          mapReveals: Math.round(quality * 0.8),
          shortcutHints: Math.round(quality * 0.7),
          hazardWarnings: Math.round(quality * 0.6),
        },
        specialEffect: 'Gains ancient knowledge and warnings',
      },
    ];
  }

  /**
   * Calculate intel rewards based on action
   */
  private calculateIntelReward(action: RestAction): EncounterReward {
    const items: AdvancedEncounterItem[] = [];
    let xp = 0;

    if (action.intelGain.mapReveals > 0) {
      items.push({
        id: 'map_reveal',
        name: 'Map Information',
        quantity: action.intelGain.mapReveals,
        rarity: 'common',
        type: 'discovery',
        setId: 'intel_set',
        value: 5,
        description: 'Reveals map information',
      });
      xp += action.intelGain.mapReveals * 5;
    }

    if (action.intelGain.shortcutHints > 0) {
      items.push({
        id: 'shortcut_hint',
        name: 'Shortcut Hint',
        quantity: action.intelGain.shortcutHints,
        rarity: 'rare',
        type: 'discovery',
        setId: 'intel_set',
        value: 10,
        description: 'Provides shortcut information',
      });
      xp += action.intelGain.shortcutHints * 10;
    }

    if (action.intelGain.hazardWarnings > 0) {
      items.push({
        id: 'hazard_warning',
        name: 'Hazard Warning',
        quantity: action.intelGain.hazardWarnings,
        rarity: 'uncommon',
        type: 'discovery',
        setId: 'intel_set',
        value: 8,
        description: 'Warns about hazards',
      });
      xp += action.intelGain.hazardWarnings * 8;
    }

    return {
      energy: 0,
      items,
      xp,
    };
  }

  /**
   * Create a rest site configuration for a specific type
   */
  static createRestSiteConfig(
    restSiteType: RestSiteType,
    quality: number = 5,
    depth: number = 1
  ): RestSiteConfig {
    const depthMultiplier = Math.pow(depth, 1.0);
    const scaledQuality = Math.max(
      1,
      Math.min(10, quality * Math.pow(depth, 0.2))
    );

    const baseReward: EncounterReward = {
      energy: 0, // Energy comes from rest actions, not base reward
      items: [
        {
          id: 'rest_site_loot',
          name: 'Rest Site Loot',
          quantity: 1,
          rarity: 'common',
          type: 'trade_good',
          setId: 'rest_set',
          value: 10,
          description: 'Loot from rest site',
        } as AdvancedEncounterItem,
      ],
      xp: Math.round(20 * depthMultiplier),
    };

    const energyReserve = {
      maxCapacity: Math.round(
        50 * Math.pow(scaledQuality, 0.8) * depthMultiplier
      ),
      currentCapacity: Math.round(
        50 * Math.pow(scaledQuality, 0.8) * depthMultiplier
      ),
      regenerationRate: Math.round(5 * Math.pow(scaledQuality, 0.6)),
    };

    const strategicIntel = {
      mapReveals: Math.round(scaledQuality * 0.5),
      shortcutHints: Math.round(scaledQuality * 0.3),
      hazardWarnings: Math.round(scaledQuality * 0.2),
    };

    const failureConsequence = {
      energyLoss: Math.round(8 * depthMultiplier),
      itemLossRisk: 0.1,
      forcedRetreat: false,
      encounterLockout: false,
    };

    return {
      restSiteType,
      quality: scaledQuality,
      baseReward,
      energyReserve,
      strategicIntel,
      failureConsequence,
    };
  }
}
