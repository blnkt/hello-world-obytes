/**
 * Risk Warning Feedback System
 * Integrates decision feedback with risk warning display logic
 */

import type { DecisionFeedbackSystem } from './decision-feedback';

export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface RiskWarningResult {
  shouldShow: boolean;
  severity: RiskSeverity;
  message: string;
  urgency: number;
}

export interface RiskWarningParams {
  currentEnergy: number;
  returnCost: number;
  totalEnergy: number;
}

export class RiskWarningFeedback {
  constructor(private decisionFeedback: DecisionFeedbackSystem) {}

  getRiskWarning(params: RiskWarningParams): RiskWarningResult {
    const safetyMargin = this.calculateSafetyMargin(
      params.currentEnergy,
      params.returnCost
    );

    const severity = this.determineRiskSeverity(
      safetyMargin,
      params.currentEnergy
    );

    const feedback = this.decisionFeedback.getDecisionFeedback({
      action: 'continuing deeper',
      totalEnergy: params.totalEnergy,
      currentEnergy: params.currentEnergy,
      estimatedCost: params.returnCost,
    });

    // Only show warnings for dangerous or risky situations
    const shouldShow =
      feedback.type === 'danger' || feedback.type === 'warning';

    return {
      shouldShow,
      severity,
      message: this.generateRiskMessage(severity, safetyMargin),
      urgency: feedback.urgency,
    };
  }

  calculateSafetyMargin(currentEnergy: number, returnCost: number): number {
    return Math.max(0, currentEnergy - returnCost);
  }

  determineRiskSeverity(
    safetyMargin: number,
    currentEnergy: number
  ): RiskSeverity {
    const marginPercentage = (safetyMargin / currentEnergy) * 100;

    if (marginPercentage < 10) {
      return 'critical';
    }
    if (marginPercentage < 25) {
      return 'high';
    }
    if (marginPercentage < 50) {
      return 'medium';
    }
    return 'low';
  }

  private generateRiskMessage(
    severity: RiskSeverity,
    safetyMargin: number
  ): string {
    switch (severity) {
      case 'critical':
        return `Critical: ${safetyMargin} energy remaining! You may not have enough to return.`;
      case 'high':
        return `High Risk: Only ${safetyMargin} energy safety margin.`;
      case 'medium':
        return `Moderate Risk: ${safetyMargin} energy safety margin.`;
      case 'low':
        return `Safe: ${safetyMargin} energy safety margin.`;
    }
  }
}
