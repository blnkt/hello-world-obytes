/**
 * Decision Feedback System
 * Provides contextual feedback for player actions based on energy state
 */

export type FeedbackType = 'positive' | 'warning' | 'danger';

export interface DecisionFeedback {
  type: FeedbackType;
  message: string;
  shouldWarn: boolean;
  urgency: number; // 0-100 scale
}

interface DecisionFeedbackParams {
  action: string;
  totalEnergy: number;
  currentEnergy: number;
  estimatedCost: number;
}

export class DecisionFeedbackSystem {
  getDecisionFeedback(params: DecisionFeedbackParams): DecisionFeedback {
    const { action, totalEnergy, currentEnergy, estimatedCost } = params;
    const energyRatio = currentEnergy / totalEnergy;

    // Safe: High energy ratio AND cost is less than 30% of current energy
    if (energyRatio > 0.5 && estimatedCost < currentEnergy * 0.3) {
      return {
        type: 'positive',
        message: `You have plenty of energy. ${action} is safe.`,
        shouldWarn: false,
        urgency: 0,
      };
    }

    // Risky: Moderate energy ratio OR cost is 30-50% of current energy
    if (
      (energyRatio > 0.3 && energyRatio <= 0.5) ||
      (estimatedCost >= currentEnergy * 0.3 &&
        estimatedCost < currentEnergy * 0.5)
    ) {
      return {
        type: 'warning',
        message: `Consider your energy carefully. ${action} is risky.`,
        shouldWarn: true,
        urgency: 30,
      };
    }

    // Danger: Low energy ratio OR high cost
    return {
      type: 'danger',
      message: `Low energy! ${action} is dangerous.`,
      shouldWarn: true,
      urgency: 80,
    };
  }
}
