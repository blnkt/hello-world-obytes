/**
 * Encounter Outcome Feedback
 * Provides feedback for encounter success and failure outcomes
 */

export type FeedbackType = 'success' | 'failure';

export interface Reward {
  type: string;
  amount?: number;
  description: string;
}

export interface Item {
  id: string;
  name: string;
  value?: number;
}

export interface SuccessFeedback {
  type: 'success';
  message: string;
  rewardsSummary: string[];
  showRewards: boolean;
}

export interface FailureFeedback {
  type: 'failure';
  message: string;
  consequencesSummary: string[];
  showConsequences: boolean;
}

export type EncounterFeedback = SuccessFeedback | FailureFeedback;

interface SuccessParams {
  rewards: Reward[];
  itemsGained: Item[];
  energyUsed: number;
}

interface FailureParams {
  failureType: string;
  energyLost: number;
  itemsLost: Item[];
}

export class EncounterOutcomeFeedback {
  generateSuccessFeedback(params: SuccessParams): SuccessFeedback {
    const rewardsSummary = this.generateRewardsSummary(params);
    const message = `Encounter completed successfully!`;

    return {
      type: 'success',
      message,
      rewardsSummary,
      showRewards: true,
    };
  }

  generateFailureFeedback(params: FailureParams): FailureFeedback {
    const consequencesSummary = this.generateConsequencesSummary(params);
    const message = `Encounter failed: ${params.failureType}`;

    return {
      type: 'failure',
      message,
      consequencesSummary,
      showConsequences: true,
    };
  }

  private generateRewardsSummary(params: SuccessParams): string[] {
    const summary: string[] = [];

    params.rewards.forEach((reward) => {
      if (reward.amount) {
        summary.push(`${reward.amount} ${reward.description}`);
      } else {
        summary.push(reward.description);
      }
    });

    params.itemsGained.forEach((item) => {
      summary.push(`Collected: ${item.name}`);
    });

    summary.push(`Energy used: ${params.energyUsed}`);

    return summary;
  }

  private generateConsequencesSummary(params: FailureParams): string[] {
    const summary: string[] = [];

    summary.push(`Lost ${params.energyLost} energy`);

    if (params.itemsLost.length > 0) {
      summary.push(`Lost ${params.itemsLost.length} item(s)`);
    }

    return summary;
  }
}
