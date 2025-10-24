export interface RiskEscalationConfig {
  riskScalingFactor?: number; // Base factor for risk scaling
  rewardScalingFactor?: number; // Factor for reward scaling
  difficultyScalingFactor?: number; // Factor for difficulty scaling
  consequenceScalingFactor?: number; // Factor for failure consequence scaling
}

export interface DepthThresholds {
  safe: number; // Maximum safe depth
  caution: number; // Caution zone starts
  danger: number; // Danger zone starts
  critical: number; // Critical zone starts
}

export interface RiskWarning {
  type: 'caution' | 'danger' | 'critical';
  message: string;
  severity: number; // 1-10 scale
}

export class RiskEscalationManager {
  private readonly config: Required<RiskEscalationConfig>;
  private readonly depthThresholds: DepthThresholds;

  constructor(config: RiskEscalationConfig = {}) {
    this.config = {
      riskScalingFactor: config.riskScalingFactor ?? 0.3, // 30% increase per depth
      rewardScalingFactor: config.rewardScalingFactor ?? 1.0, // Same as risk
      difficultyScalingFactor: config.difficultyScalingFactor ?? 1.0, // Same as risk
      consequenceScalingFactor: config.consequenceScalingFactor ?? 1.2, // 20% higher than risk
    };

    this.depthThresholds = {
      safe: 3,
      caution: 5,
      danger: 8,
      critical: 12,
    };
  }

  /**
   * Calculate risk multiplier based on depth
   * Uses exponential scaling: base * (1 + scalingFactor)^depth
   */
  getRiskMultiplier(depth: number): number {
    if (depth <= 0) {
      return 1; // Base risk at surface
    }

    return Math.pow(1 + this.config.riskScalingFactor, depth);
  }

  /**
   * Scale encounter difficulty based on depth
   */
  scaleEncounterDifficulty(baseDifficulty: number, depth: number): number {
    if (baseDifficulty <= 0) {
      return 0;
    }

    const riskMultiplier = this.getRiskMultiplier(depth);
    const scaledDifficulty =
      baseDifficulty * riskMultiplier * this.config.difficultyScalingFactor;

    // Cap maximum difficulty to prevent impossible encounters
    const maxDifficulty = baseDifficulty * 5;
    return Math.min(scaledDifficulty, maxDifficulty);
  }

  /**
   * Scale rewards based on depth and risk
   */
  scaleReward(baseReward: number, depth: number): number {
    if (baseReward <= 0) {
      return 0;
    }

    const riskMultiplier = this.getRiskMultiplier(depth);
    return baseReward * riskMultiplier * this.config.rewardScalingFactor;
  }

  /**
   * Scale failure consequences based on depth
   */
  scaleFailureConsequence(
    baseConsequence: number,
    depth: number,
    consequenceType:
      | 'energy_loss'
      | 'item_loss'
      | 'forced_retreat' = 'energy_loss'
  ): number {
    if (baseConsequence <= 0) {
      return 0;
    }

    const riskMultiplier = this.getRiskMultiplier(depth);
    let scalingFactor = this.config.consequenceScalingFactor;

    // Apply different scaling based on consequence type
    switch (consequenceType) {
      case 'energy_loss':
        scalingFactor *= 1.0; // Standard scaling
        break;
      case 'item_loss':
        scalingFactor *= 0.8; // Slightly less severe
        break;
      case 'forced_retreat':
        scalingFactor *= 1.5; // More severe
        break;
    }

    return baseConsequence * riskMultiplier * scalingFactor;
  }

  /**
   * Get depth thresholds for different risk zones
   */
  getDepthThresholds(): DepthThresholds {
    return { ...this.depthThresholds };
  }

  /**
   * Classify depth into risk category
   */
  classifyDepth(depth: number): 'safe' | 'caution' | 'danger' | 'critical' {
    if (depth <= this.depthThresholds.safe) {
      return 'safe';
    } else if (depth <= this.depthThresholds.caution) {
      return 'caution';
    } else if (depth <= this.depthThresholds.danger) {
      return 'danger';
    } else {
      return 'critical';
    }
  }

  /**
   * Generate depth-based risk warnings
   */
  getDepthRiskWarnings(depth: number): RiskWarning[] {
    const warnings: RiskWarning[] = [];
    const classification = this.classifyDepth(depth);

    switch (classification) {
      case 'caution':
        warnings.push({
          type: 'caution',
          message: 'You are entering deeper territory. Risks are increasing.',
          severity: 3,
        });
        break;
      case 'danger':
        warnings.push({
          type: 'danger',
          message:
            'DANGER! You are in high-risk territory. Failure consequences are severe.',
          severity: 7,
        });
        warnings.push({
          type: 'caution',
          message: 'Consider your return path carefully.',
          severity: 5,
        });
        break;
      case 'critical':
        warnings.push({
          type: 'critical',
          message: 'CRITICAL DEPTH! You are in extremely dangerous territory!',
          severity: 10,
        });
        warnings.push({
          type: 'danger',
          message: 'Failure consequences are catastrophic.',
          severity: 9,
        });
        warnings.push({
          type: 'caution',
          message: 'Return costs are astronomical.',
          severity: 8,
        });
        break;
    }

    // Add specific depth warnings
    if (depth >= 10) {
      warnings.push({
        type: 'critical',
        message: 'You have reached legendary depths. Only the bravest survive.',
        severity: 10,
      });
    }

    if (depth >= 15) {
      warnings.push({
        type: 'critical',
        message: 'MYTHIC DEPTHS! You are in uncharted territory!',
        severity: 10,
      });
    }

    return warnings;
  }

  /**
   * Calculate recommended maximum depth for given energy
   */
  calculateRecommendedMaxDepth(
    currentEnergy: number,
    currentDepth: number = 0
  ): number {
    if (currentEnergy <= 0) {
      return currentDepth;
    }

    // Find the maximum depth where risk is still manageable
    let maxDepth = currentDepth;
    let testDepth = currentDepth + 1;

    while (testDepth <= 20) {
      // Reasonable upper limit
      const riskMultiplier = this.getRiskMultiplier(testDepth);

      // If risk becomes too high (more than 5x base), stop
      if (riskMultiplier > 5) {
        break;
      }

      maxDepth = testDepth;
      testDepth++;
    }

    return maxDepth;
  }

  /**
   * Get risk statistics for a given depth range
   */
  getRiskStatistics(
    startDepth: number,
    endDepth: number
  ): {
    averageRisk: number;
    maxRisk: number;
    riskIncrease: number;
    recommendedDepth: number;
  } {
    let totalRisk = 0;
    let maxRisk = 0;
    let count = 0;

    for (let depth = startDepth; depth <= endDepth; depth++) {
      const risk = this.getRiskMultiplier(depth);
      totalRisk += risk;
      maxRisk = Math.max(maxRisk, risk);
      count++;
    }

    const averageRisk = count > 0 ? totalRisk / count : 0;
    const riskIncrease =
      endDepth > startDepth
        ? (this.getRiskMultiplier(endDepth) -
            this.getRiskMultiplier(startDepth)) /
          this.getRiskMultiplier(startDepth)
        : 0;

    const recommendedDepth = Math.min(endDepth, this.depthThresholds.caution);

    return {
      averageRisk,
      maxRisk,
      riskIncrease,
      recommendedDepth,
    };
  }

  /**
   * Get configuration used by this manager
   */
  getConfig(): Required<RiskEscalationConfig> {
    return { ...this.config };
  }

  /**
   * Create a new manager with updated configuration
   */
  withConfig(config: Partial<RiskEscalationConfig>): RiskEscalationManager {
    return new RiskEscalationManager({
      ...this.config,
      ...config,
    });
  }
}
