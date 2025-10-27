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

export interface RiskEventConfig {
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  successRate: number; // 0.0 to 1.0
  baseReward: EncounterReward;
  legendaryReward?: EncounterReward; // Special reward for extreme success
  failureConsequence: {
    energyLoss: number;
    itemLossRisk: number; // 0.0 to 1.0
    forcedRetreat: boolean;
    encounterLockout: boolean;
  };
}

export interface RiskEventChoice {
  id: string;
  description: string;
  successRateModifier: number; // -0.3 to +0.3
  rewardModifier: number; // 0.5 to 2.0
  consequenceModifier: number; // 0.5 to 2.0
  energyCost: number;
}

export interface RiskEventState {
  encounterId: string;
  encounterType: EncounterType;
  config: RiskEventConfig;
  availableChoices: RiskEventChoice[];
  selectedChoice?: RiskEventChoice;
  isResolved: boolean;
  outcome?: AdvancedEncounterOutcome;
}

export class RiskEventEncounter {
  private state: RiskEventState;

  constructor(encounterId: string, config: RiskEventConfig) {
    this.state = {
      encounterId,
      encounterType: 'risk_event',
      config,
      availableChoices: this.generateChoices(config.riskLevel),
      isResolved: false,
    };
  }

  /**
   * Create a risk event configuration for a specific risk level
   */
  static createRiskLevelConfig(
    riskLevel: 'low' | 'medium' | 'high' | 'extreme',
    depth: number = 1
  ): RiskEventConfig {
    const depthMultiplier = Math.pow(depth, 1.2);

    switch (riskLevel) {
      case 'low':
        return this.createLowRiskConfig(depthMultiplier);
      case 'medium':
        return this.createMediumRiskConfig(depthMultiplier);
      case 'high':
        return this.createHighRiskConfig(depthMultiplier);
      case 'extreme':
        return this.createExtremeRiskConfig(depthMultiplier);
      default:
        throw new Error(`Invalid risk level: ${riskLevel}`);
    }
  }

  private static createLowRiskConfig(depthMultiplier: number): RiskEventConfig {
    return {
      riskLevel: 'low',
      successRate: 0.8,
      baseReward: {
        energy: Math.round(10 * depthMultiplier),
        items: [
          {
            id: 'common_gem',
            name: 'Common Gem',
            quantity: 1,
            rarity: 'common',
            type: 'trade_good',
            setId: 'gem_set',
            value: 10,
            description: 'A common gem',
          },
        ],
        xp: Math.round(25 * depthMultiplier),
      },
      failureConsequence: {
        energyLoss: Math.round(5 * depthMultiplier),
        itemLossRisk: 0.1,
        forcedRetreat: false,
        encounterLockout: false,
      },
    };
  }

  private static createMediumRiskConfig(
    depthMultiplier: number
  ): RiskEventConfig {
    return {
      riskLevel: 'medium',
      successRate: 0.6,
      baseReward: {
        energy: Math.round(20 * depthMultiplier),
        items: [
          {
            id: 'rare_crystal',
            name: 'Rare Crystal',
            quantity: 1,
            rarity: 'rare',
            type: 'trade_good',
            setId: 'crystal_set',
            value: 25,
            description: 'A rare crystal',
          } as AdvancedEncounterItem,
        ],
        xp: Math.round(50 * depthMultiplier),
      },
      failureConsequence: {
        energyLoss: Math.round(15 * depthMultiplier),
        itemLossRisk: 0.3,
        forcedRetreat: false,
        encounterLockout: false,
      },
    };
  }

  private static createHighRiskConfig(
    depthMultiplier: number
  ): RiskEventConfig {
    return {
      riskLevel: 'high',
      successRate: 0.4,
      baseReward: {
        energy: Math.round(35 * depthMultiplier),
        items: [
          {
            id: 'epic_artifact',
            name: 'Epic Artifact',
            quantity: 1,
            rarity: 'epic',
            type: 'legendary',
            setId: 'artifact_set',
            value: 50,
            description: 'An epic artifact',
          } as AdvancedEncounterItem,
        ],
        xp: Math.round(100 * depthMultiplier),
      },
      legendaryReward: {
        energy: Math.round(50 * depthMultiplier),
        items: [
          {
            id: 'legendary_relic',
            name: 'Legendary Relic',
            quantity: 1,
            rarity: 'legendary',
            type: 'legendary',
            setId: 'relic_set',
            value: 100,
            description: 'A legendary relic',
          } as AdvancedEncounterItem,
        ],
        xp: Math.round(150 * depthMultiplier),
      },
      failureConsequence: {
        energyLoss: Math.round(25 * depthMultiplier),
        itemLossRisk: 0.5,
        forcedRetreat: true,
        encounterLockout: false,
      },
    };
  }

  private static createExtremeRiskConfig(
    depthMultiplier: number
  ): RiskEventConfig {
    return {
      riskLevel: 'extreme',
      successRate: 0.2,
      baseReward: {
        energy: Math.round(60 * depthMultiplier),
        items: [
          {
            id: 'mythic_treasure',
            name: 'Mythic Treasure',
            quantity: 1,
            rarity: 'legendary',
            type: 'legendary',
            setId: 'mythic_set',
            value: 200,
            description: 'A mythic treasure',
          } as AdvancedEncounterItem,
        ],
        xp: Math.round(200 * depthMultiplier),
      },
      legendaryReward: {
        energy: Math.round(100 * depthMultiplier),
        items: [
          {
            id: 'divine_artifact',
            name: 'Divine Artifact',
            quantity: 1,
            rarity: 'legendary',
            type: 'legendary',
            setId: 'divine_set',
            value: 500,
            description: 'A divine artifact',
          } as AdvancedEncounterItem,
          {
            id: 'ancient_power',
            name: 'Ancient Power',
            quantity: 1,
            rarity: 'legendary',
            type: 'legendary',
            setId: 'power_set',
            value: 300,
            description: 'Ancient power',
          } as AdvancedEncounterItem,
        ],
        xp: Math.round(300 * depthMultiplier),
      },
      failureConsequence: {
        energyLoss: Math.round(40 * depthMultiplier),
        itemLossRisk: 0.7,
        forcedRetreat: true,
        encounterLockout: true,
      },
    };
  }

  /**
   * Get current encounter state
   */
  getState(): RiskEventState {
    return { ...this.state };
  }

  /**
   * Select a choice for the risk event
   */
  selectChoice(choiceId: string): boolean {
    const choice = this.state.availableChoices.find((c) => c.id === choiceId);
    if (!choice) {
      return false;
    }

    this.state.selectedChoice = choice;
    return true;
  }

  /**
   * Resolve the risk event based on selected choice
   */
  resolve(): AdvancedEncounterOutcome {
    if (!this.state.selectedChoice) {
      throw new Error('No choice selected for risk event');
    }

    if (this.state.isResolved) {
      return this.state.outcome!;
    }

    const choice = this.state.selectedChoice;
    const finalSuccessRate = Math.max(
      0,
      Math.min(1, this.state.config.successRate + choice.successRateModifier)
    );

    const isSuccess = Math.random() < finalSuccessRate;

    if (isSuccess) {
      this.state.outcome = this.generateSuccessOutcome(
        choice,
        finalSuccessRate
      );
    } else {
      this.state.outcome = this.generateFailureOutcome(choice);
    }

    this.state.isResolved = true;
    return this.state.outcome;
  }

  /**
   * Generate available choices based on risk level
   */
  private generateChoices(riskLevel: string): RiskEventChoice[] {
    const baseChoices: RiskEventChoice[] = [
      {
        id: 'conservative',
        description: 'Take a conservative approach',
        successRateModifier: 0.2,
        rewardModifier: 0.7,
        consequenceModifier: 0.5,
        energyCost: 0,
      },
      {
        id: 'standard',
        description: 'Use standard tactics',
        successRateModifier: 0,
        rewardModifier: 1.0,
        consequenceModifier: 1.0,
        energyCost: 0,
      },
      {
        id: 'aggressive',
        description: 'Take an aggressive approach',
        successRateModifier: -0.2,
        rewardModifier: 1.5,
        consequenceModifier: 1.5,
        energyCost: 0,
      },
    ];

    // Add risk-specific choices
    switch (riskLevel) {
      case 'extreme':
        baseChoices.push({
          id: 'all_or_nothing',
          description: 'Go all or nothing!',
          successRateModifier: -0.4,
          rewardModifier: 3.0,
          consequenceModifier: 2.5,
          energyCost: 10,
        });
        break;
      case 'high':
        baseChoices.push({
          id: 'high_stakes',
          description: 'High stakes gamble',
          successRateModifier: -0.3,
          rewardModifier: 2.0,
          consequenceModifier: 1.8,
          energyCost: 5,
        });
        break;
    }

    return baseChoices;
  }

  /**
   * Generate success outcome
   */
  private generateSuccessOutcome(
    choice: RiskEventChoice,
    finalSuccessRate: number
  ): AdvancedEncounterOutcome {
    const baseReward = this.state.config.baseReward;
    const legendaryReward = this.state.config.legendaryReward;

    // Check for legendary success (very high success rate with aggressive choices)
    const isLegendarySuccess = this.isLegendarySuccess(
      choice,
      finalSuccessRate
    );
    const rewardToUse =
      isLegendarySuccess && legendaryReward ? legendaryReward : baseReward;

    const modifiedReward: EncounterReward = {
      energy: Math.round(rewardToUse.energy * choice.rewardModifier),
      items: rewardToUse.items.map((item: AdvancedEncounterItem) => ({
        ...item,
        quantity: Math.round(item.quantity * choice.rewardModifier),
      })),
      xp: Math.round(rewardToUse.xp * choice.rewardModifier),
    };

    const message = isLegendarySuccess
      ? `LEGENDARY SUCCESS! You discovered incredible treasures!`
      : `Risk paid off! You gained ${modifiedReward.energy} energy and valuable items.`;

    return {
      type: 'success',
      reward: modifiedReward,
      message,
    };
  }

  /**
   * Determine if this is a legendary success
   */
  private isLegendarySuccess(
    choice: RiskEventChoice,
    finalSuccessRate: number
  ): boolean {
    // Legendary success requires high risk level, aggressive choice, and high success rate
    return (
      this.state.config.riskLevel === 'extreme' &&
      choice.id === 'all_or_nothing' &&
      finalSuccessRate > 0.7
    );
  }

  /**
   * Generate failure outcome
   */
  private generateFailureOutcome(
    choice: RiskEventChoice
  ): AdvancedEncounterOutcome {
    const consequence = this.state.config.failureConsequence;
    const modifiedConsequence = {
      energyLoss: Math.round(
        consequence.energyLoss * choice.consequenceModifier
      ),
      itemLossRisk: Math.min(
        1,
        consequence.itemLossRisk * choice.consequenceModifier
      ),
      forcedRetreat:
        consequence.forcedRetreat || choice.consequenceModifier > 1.5,
      encounterLockout:
        consequence.encounterLockout || choice.consequenceModifier > 2.0,
    };

    return {
      type: 'failure',
      consequence: {
        energyLoss: modifiedConsequence.energyLoss,
        itemLossRisk: modifiedConsequence.itemLossRisk,
        forcedRetreat: modifiedConsequence.forcedRetreat,
        encounterLockout: modifiedConsequence.encounterLockout,
      },
      message: `The risk didn't pay off. You lost ${modifiedConsequence.energyLoss} energy.`,
    };
  }
}
