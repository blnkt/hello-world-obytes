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

export type ObstacleType =
  | 'collapsed_passage'
  | 'treacherous_bridge'
  | 'ancient_guardian'
  | 'energy_drain'
  | 'maze_of_mirrors';

export interface HazardConfig {
  obstacleType: ObstacleType;
  difficulty: number; // 1-10 scale
  baseReward: EncounterReward;
  failureConsequence: {
    energyLoss: number;
    itemLossRisk: number; // 0.0 to 1.0
    forcedRetreat: boolean;
    encounterLockout: boolean;
  };
}

export interface SolutionPath {
  id: string;
  name: string;
  description: string;
  energyCost: number;
  successRate: number; // 0.0 to 1.0
  rewardModifier: number; // 0.5 to 2.0
  consequenceModifier: number; // 0.5 to 2.0
  specialEffect?: string; // Optional special effect description
}

export interface HazardState {
  encounterId: string;
  encounterType: EncounterType;
  config: HazardConfig;
  availablePaths: SolutionPath[];
  selectedPath?: SolutionPath;
  isResolved: boolean;
  outcome?: AdvancedEncounterOutcome;
}

export class HazardEncounter {
  private state: HazardState;

  constructor(encounterId: string, config: HazardConfig) {
    this.state = {
      encounterId,
      encounterType: 'hazard',
      config,
      availablePaths: this.generateSolutionPaths(
        config.obstacleType,
        config.difficulty
      ),
      isResolved: false,
    };
  }

  /**
   * Get current encounter state
   */
  getState(): HazardState {
    return { ...this.state };
  }

  /**
   * Select a solution path for the hazard
   */
  selectPath(pathId: string): boolean {
    const path = this.state.availablePaths.find((p) => p.id === pathId);
    if (!path) {
      return false;
    }

    this.state.selectedPath = path;
    return true;
  }

  /**
   * Resolve the hazard based on selected path
   */
  resolve(): AdvancedEncounterOutcome {
    if (!this.state.selectedPath) {
      throw new Error('No path selected for hazard encounter');
    }

    if (this.state.isResolved) {
      return this.state.outcome!;
    }

    const path = this.state.selectedPath;
    const isSuccess = Math.random() < path.successRate;

    if (isSuccess) {
      this.state.outcome = this.generateSuccessOutcome(path);
    } else {
      this.state.outcome = this.generateFailureOutcome(path);
    }

    this.state.isResolved = true;
    return this.state.outcome;
  }

  /**
   * Generate solution paths based on obstacle type and difficulty
   */
  private generateSolutionPaths(
    obstacleType: ObstacleType,
    difficulty: number
  ): SolutionPath[] {
    const basePaths: SolutionPath[] = [
      {
        id: 'pay_toll',
        name: 'Pay Energy Toll',
        description: 'Spend energy to safely bypass the obstacle',
        energyCost: Math.round(10 * Math.pow(difficulty, 0.8)),
        successRate: 1.0, // Always succeeds
        rewardModifier: 0.8, // Lower rewards
        consequenceModifier: 0.0, // No failure consequences
      },
      {
        id: 'alternate_route',
        name: 'Find Alternate Route',
        description: 'Look for a safer way around',
        energyCost: Math.round(5 * Math.pow(difficulty, 0.6)),
        successRate: Math.max(0.3, 0.9 - difficulty * 0.08), // Decreases with difficulty
        rewardModifier: 1.0, // Standard rewards
        consequenceModifier: 1.0, // Standard consequences
      },
      {
        id: 'risky_gamble',
        name: 'Risky Gamble',
        description: 'Attempt a dangerous but potentially rewarding approach',
        energyCost: 0,
        successRate: Math.max(0.1, 0.6 - difficulty * 0.06), // Lower success rate
        rewardModifier: 1.5 + difficulty * 0.1, // Higher rewards for higher difficulty
        consequenceModifier: 1.5 + difficulty * 0.1, // Higher consequences
      },
    ];

    // Add obstacle-specific paths
    const specificPaths = this.getObstacleSpecificPaths(
      obstacleType,
      difficulty
    );

    return [...basePaths, ...specificPaths];
  }

  /**
   * Get obstacle-specific solution paths
   */
  private getObstacleSpecificPaths(
    obstacleType: ObstacleType,
    difficulty: number
  ): SolutionPath[] {
    switch (obstacleType) {
      case 'collapsed_passage':
        return this.getCollapsedPassagePaths(difficulty);
      case 'treacherous_bridge':
        return this.getTreacherousBridgePaths(difficulty);
      case 'ancient_guardian':
        return this.getAncientGuardianPaths(difficulty);
      case 'energy_drain':
        return this.getEnergyDrainPaths(difficulty);
      case 'maze_of_mirrors':
        return this.getMazeOfMirrorsPaths(difficulty);
      default:
        return [];
    }
  }

  private getCollapsedPassagePaths(difficulty: number): SolutionPath[] {
    return [
      {
        id: 'excavate',
        name: 'Excavate Passage',
        description: 'Carefully dig through the collapsed area',
        energyCost: Math.round(15 * Math.pow(difficulty, 0.7)),
        successRate: Math.max(0.4, 0.8 - difficulty * 0.05),
        rewardModifier: 1.2,
        consequenceModifier: 1.3,
        specialEffect: 'May discover hidden treasures',
      },
    ];
  }

  private getTreacherousBridgePaths(difficulty: number): SolutionPath[] {
    return [
      {
        id: 'repair_bridge',
        name: 'Repair Bridge',
        description: 'Attempt to stabilize the bridge structure',
        energyCost: Math.round(20 * Math.pow(difficulty, 0.8)),
        successRate: Math.max(0.3, 0.7 - difficulty * 0.06),
        rewardModifier: 1.3,
        consequenceModifier: 1.4,
        specialEffect: 'Creates permanent shortcut for future runs',
      },
    ];
  }

  private getAncientGuardianPaths(difficulty: number): SolutionPath[] {
    return [
      {
        id: 'negotiate',
        name: 'Negotiate with Guardian',
        description: 'Attempt to reason with the ancient being',
        energyCost: 0,
        successRate: Math.max(0.2, 0.5 - difficulty * 0.04),
        rewardModifier: 2.0,
        consequenceModifier: 2.0,
        specialEffect: "May gain guardian's blessing",
      },
      {
        id: 'outsmart',
        name: 'Outsmart Guardian',
        description: 'Use cunning to bypass the guardian',
        energyCost: Math.round(8 * Math.pow(difficulty, 0.5)),
        successRate: Math.max(0.3, 0.6 - difficulty * 0.05),
        rewardModifier: 1.4,
        consequenceModifier: 1.6,
      },
    ];
  }

  private getEnergyDrainPaths(difficulty: number): SolutionPath[] {
    return [
      {
        id: 'resist_drain',
        name: 'Resist Energy Drain',
        description: 'Focus your willpower to resist the draining effect',
        energyCost: Math.round(12 * Math.pow(difficulty, 0.6)),
        successRate: Math.max(0.4, 0.8 - difficulty * 0.06),
        rewardModifier: 1.1,
        consequenceModifier: 0.8,
        specialEffect: 'Gains resistance to future energy drains',
      },
    ];
  }

  private getMazeOfMirrorsPaths(difficulty: number): SolutionPath[] {
    return [
      {
        id: 'solve_puzzle',
        name: 'Solve Mirror Puzzle',
        description: 'Use logic to navigate the maze',
        energyCost: Math.round(6 * Math.pow(difficulty, 0.4)),
        successRate: Math.max(0.5, 0.9 - difficulty * 0.04),
        rewardModifier: 1.3,
        consequenceModifier: 1.2,
        specialEffect: 'May reveal hidden passages',
      },
      {
        id: 'break_mirrors',
        name: 'Break the Mirrors',
        description: 'Force your way through by breaking mirrors',
        energyCost: Math.round(25 * Math.pow(difficulty, 0.9)),
        successRate: Math.max(0.6, 0.95 - difficulty * 0.03),
        rewardModifier: 0.9,
        consequenceModifier: 1.5,
        specialEffect: 'Creates noise that may attract other hazards',
      },
    ];
  }

  /**
   * Generate success outcome
   */
  private generateSuccessOutcome(path: SolutionPath): AdvancedEncounterOutcome {
    const baseReward = this.state.config.baseReward;
    const modifiedReward: EncounterReward = {
      energy: Math.round(baseReward.energy * path.rewardModifier),
      items: baseReward.items.map((item: AdvancedEncounterItem) => ({
        ...item,
        quantity: Math.round(item.quantity * path.rewardModifier),
      })),
      xp: Math.round(baseReward.xp * path.rewardModifier),
    };

    let message = `Successfully navigated the ${this.state.config.obstacleType.replace('_', ' ')}!`;
    if (path.specialEffect) {
      message += ` ${path.specialEffect}`;
    }

    return {
      type: 'success',
      reward: modifiedReward,
      message,
    };
  }

  /**
   * Generate failure outcome
   */
  private generateFailureOutcome(path: SolutionPath): AdvancedEncounterOutcome {
    const consequence = this.state.config.failureConsequence;
    const modifiedConsequence = {
      energyLoss: Math.round(consequence.energyLoss * path.consequenceModifier),
      itemLossRisk: Math.min(
        1,
        consequence.itemLossRisk * path.consequenceModifier
      ),
      forcedRetreat:
        consequence.forcedRetreat || path.consequenceModifier > 1.5,
      encounterLockout:
        consequence.encounterLockout || path.consequenceModifier > 2.0,
    };

    return {
      type: 'failure',
      consequence: {
        energyLoss: modifiedConsequence.energyLoss,
        itemLossRisk: modifiedConsequence.itemLossRisk,
        forcedRetreat: modifiedConsequence.forcedRetreat,
        encounterLockout: modifiedConsequence.encounterLockout,
      },
      message: `Failed to overcome the ${this.state.config.obstacleType.replace('_', ' ')}. You lost ${modifiedConsequence.energyLoss} energy.`,
    };
  }

  /**
   * Create a hazard configuration for a specific obstacle type
   */
  static createHazardConfig(
    obstacleType: ObstacleType,
    difficulty: number = 5,
    depth: number = 1
  ): HazardConfig {
    const depthMultiplier = Math.pow(depth, 1.1);
    const scaledDifficulty = Math.max(
      1,
      Math.min(10, difficulty * Math.pow(depth, 0.3))
    );

    const baseReward: EncounterReward = {
      energy: 0,
      items: [
        {
          id: 'hazard_loot',
          name: 'Hazard Loot',
          quantity: 1,
          rarity: 'common',
          type: 'trade_good',
          setId: 'hazard_set',
          value: 10,
          description: 'Loot from hazard',
        } as AdvancedEncounterItem,
      ],
      xp: Math.round(30 * depthMultiplier),
    };

    const failureConsequence = {
      energyLoss: Math.round(12 * depthMultiplier),
      itemLossRisk: 0.2,
      forcedRetreat: scaledDifficulty >= 7,
      encounterLockout: scaledDifficulty >= 8,
    };

    return {
      obstacleType,
      difficulty: scaledDifficulty,
      baseReward,
      failureConsequence,
    };
  }
}
