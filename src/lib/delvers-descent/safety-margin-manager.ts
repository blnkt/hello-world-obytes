import { ReturnCostCalculator } from './return-cost-calculator';

export interface SafetyMarginConfig {
  safeThreshold?: number; // Percentage (0-1) for safe zone
  cautionThreshold?: number; // Percentage (0-1) for caution zone
  dangerThreshold?: number; // Percentage (0-1) for danger zone
  safetyBuffer?: number; // Additional buffer (0-1) for point of no return detection
}

export interface SafetyMargin {
  remainingEnergy: number;
  safetyPercentage: number;
  safetyZone: 'safe' | 'caution' | 'danger' | 'critical';
  isPointOfNoReturn: boolean;
}

export interface RiskWarning {
  type: 'caution' | 'danger' | 'critical';
  message: string;
  severity: number; // 1-10 scale
}

export class SafetyMarginManager {
  private readonly calculator: ReturnCostCalculator;
  private readonly config: Required<SafetyMarginConfig>;

  constructor(calculator: ReturnCostCalculator, config: SafetyMarginConfig = {}) {
    this.calculator = calculator;
    this.config = {
      safeThreshold: config.safeThreshold ?? 0.6, // 60% safety margin for safe zone
      cautionThreshold: config.cautionThreshold ?? 0.3, // 30% safety margin for caution zone
      dangerThreshold: config.dangerThreshold ?? 0.1, // 10% safety margin for danger zone
      safetyBuffer: config.safetyBuffer ?? 0.1, // 10% additional buffer
    };
  }

  /**
   * Calculate safety margin based on current energy and return cost
   */
  calculateSafetyMargin(
    currentEnergy: number,
    returnCost: number,
    currentDepth: number
  ): SafetyMargin {
    const remainingEnergy = currentEnergy - returnCost;
    const safetyPercentage = currentEnergy > 0 ? (remainingEnergy / currentEnergy) * 100 : -100;
    const safetyZone = this.getSafetyZone(currentEnergy, returnCost, currentDepth);
    const isPointOfNoReturn = this.isPointOfNoReturn(currentEnergy, returnCost, currentDepth);

    return {
      remainingEnergy,
      safetyPercentage,
      safetyZone,
      isPointOfNoReturn,
    };
  }

  /**
   * Determine safety zone based on energy and return cost
   */
  getSafetyZone(
    currentEnergy: number,
    returnCost: number,
    currentDepth: number
  ): 'safe' | 'caution' | 'danger' | 'critical' {
    if (currentEnergy <= 0) {
      return 'critical';
    }

    const safetyPercentage = ((currentEnergy - returnCost) / currentEnergy) * 100;

    if (safetyPercentage >= this.config.safeThreshold * 100) {
      return 'safe';
    } else if (safetyPercentage >= this.config.cautionThreshold * 100) {
      return 'caution';
    } else if (safetyPercentage >= this.config.dangerThreshold * 100) {
      return 'danger';
    } else {
      return 'critical';
    }
  }

  /**
   * Check if current situation represents a point of no return
   */
  isPointOfNoReturn(
    currentEnergy: number,
    returnCost: number,
    currentDepth: number
  ): boolean {
    if (currentEnergy <= 0) {
      return true;
    }

    // Apply safety buffer to return cost
    const bufferedReturnCost = returnCost * (1 + this.config.safetyBuffer);
    
    return currentEnergy < bufferedReturnCost;
  }

  /**
   * Generate risk warnings based on current situation
   */
  getRiskWarnings(
    currentEnergy: number,
    returnCost: number,
    currentDepth: number
  ): RiskWarning[] {
    const warnings: RiskWarning[] = [];
    const safetyZone = this.getSafetyZone(currentEnergy, returnCost, currentDepth);
    const isPointOfNoReturn = this.isPointOfNoReturn(currentEnergy, returnCost, currentDepth);

    // Generate warnings based on safety zone
    switch (safetyZone) {
      case 'caution':
        warnings.push({
          type: 'caution',
          message: 'Energy levels are getting low. Consider returning soon.',
          severity: 3,
        });
        break;
      case 'danger':
        warnings.push({
          type: 'danger',
          message: 'Danger! Energy levels are critically low. Return immediately!',
          severity: 7,
        });
        break;
      case 'critical':
        warnings.push({
          type: 'critical',
          message: 'CRITICAL! You may not have enough energy to return!',
          severity: 10,
        });
        break;
    }

    // Add depth-based warnings
    if (currentDepth >= 5) {
      warnings.push({
        type: 'caution',
        message: 'You are very deep. Return costs increase exponentially.',
        severity: 4,
      });
    }

    if (currentDepth >= 8) {
      warnings.push({
        type: 'danger',
        message: 'EXTREME DEPTH! Return costs are extremely high!',
        severity: 8,
      });
    }

    // Add point of no return warning
    if (isPointOfNoReturn) {
      warnings.push({
        type: 'critical',
        message: 'POINT OF NO RETURN! You cannot afford to return!',
        severity: 10,
      });
    }

    return warnings;
  }

  /**
   * Get recommended action based on current situation
   */
  getRecommendedAction(
    currentEnergy: number,
    returnCost: number,
    currentDepth: number
  ): string {
    const safetyZone = this.getSafetyZone(currentEnergy, returnCost, currentDepth);
    const isPointOfNoReturn = this.isPointOfNoReturn(currentEnergy, returnCost, currentDepth);

    if (isPointOfNoReturn) {
      return 'You must find a way to reduce return costs or gain more energy immediately!';
    }

    switch (safetyZone) {
      case 'safe':
        return 'Safe to continue exploring.';
      case 'caution':
        return 'Consider returning soon or finding shortcuts.';
      case 'danger':
        return 'Return immediately or find shortcuts to reduce costs.';
      case 'critical':
        return 'EMERGENCY: Return immediately or risk being trapped!';
      default:
        return 'Unknown situation.';
    }
  }

  /**
   * Calculate maximum safe depth to explore with current energy
   */
  calculateMaxSafeDepth(
    currentEnergy: number,
    currentDepth: number = 0
  ): number {
    if (currentEnergy <= 0) {
      return currentDepth;
    }

    // Find the maximum depth where we can still return safely
    let maxDepth = currentDepth;
    let testDepth = currentDepth + 1;

    while (testDepth <= 20) { // Reasonable upper limit
      const returnCost = this.calculator.calculateCumulativeReturnCost(testDepth);
      const bufferedReturnCost = returnCost * (1 + this.config.safetyBuffer);
      
      if (currentEnergy >= bufferedReturnCost) {
        maxDepth = testDepth;
        testDepth++;
      } else {
        break;
      }
    }

    return maxDepth;
  }

  /**
   * Get configuration used by this manager
   */
  getConfig(): Required<SafetyMarginConfig> {
    return { ...this.config };
  }

  /**
   * Create a new manager with updated configuration
   */
  withConfig(config: Partial<SafetyMarginConfig>): SafetyMarginManager {
    return new SafetyMarginManager(this.calculator, {
      ...this.config,
      ...config,
    });
  }
}
