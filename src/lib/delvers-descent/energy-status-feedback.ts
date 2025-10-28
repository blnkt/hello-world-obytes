/**
 * Energy Status Feedback
 * Provides feedback for energy status with safety margin calculations
 */

export type EnergyStatus = 'healthy' | 'low' | 'critical';

export type Recommendation = 'safe_to_continue' | 'consider_retreating';

export interface EnergyStatusData {
  status: EnergyStatus;
  safetyMargin: number;
  message: string;
  recommendation: Recommendation;
  canContinue: boolean;
}

interface EnergyStatusParams {
  currentEnergy: number;
  totalEnergy: number;
  estimatedCost: number;
  returnCost: number;
}

export class EnergyStatusFeedback {
  generateEnergyStatus(params: EnergyStatusParams): EnergyStatusData {
    const safetyMargin = params.currentEnergy - params.returnCost;
    const energyPercentage = this.calculateEnergyPercentage(
      params.currentEnergy,
      params.totalEnergy
    );
    const status = this.determineStatus(safetyMargin, energyPercentage);
    const recommendation = this.generateRecommendation(status, safetyMargin);
    const message = this.generateMessage(
      status,
      safetyMargin,
      energyPercentage
    );

    return {
      status,
      safetyMargin,
      message,
      recommendation,
      canContinue: safetyMargin > 0,
    };
  }

  private calculateEnergyPercentage(current: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((current / total) * 100);
  }

  private determineStatus(
    safetyMargin: number,
    energyPercentage: number
  ): EnergyStatus {
    if (safetyMargin <= 0 || energyPercentage <= 10) {
      return 'critical';
    } else if (safetyMargin <= 10 || energyPercentage <= 30) {
      return 'low';
    } else {
      return 'healthy';
    }
  }

  private generateRecommendation(
    status: EnergyStatus,
    safetyMargin: number
  ): Recommendation {
    if (status === 'critical' || safetyMargin <= 0) {
      return 'consider_retreating';
    } else {
      return 'safe_to_continue';
    }
  }

  private generateMessage(
    status: EnergyStatus,
    safetyMargin: number,
    energyPercentage: number
  ): string {
    if (status === 'critical') {
      return `Critical energy status: ${energyPercentage}% remaining (${safetyMargin} safety margin). Immediate retreat recommended.`;
    } else if (status === 'low') {
      return `Low energy status: ${energyPercentage}% remaining (${safetyMargin} safety margin). Consider retreating soon.`;
    } else {
      return `Healthy energy status: ${energyPercentage}% remaining (${safetyMargin} safety margin). Safe to continue.`;
    }
  }
}
