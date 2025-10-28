/**
 * Collection Progress Feedback
 * Provides feedback for collection progress and milestones
 */

export type FeedbackType = 'progress_summary' | 'set_completion' | 'milestone';

export interface ProgressSummary {
  completionPercentage: number;
  setsProgress: number;
  message: string;
  isNearComplete: boolean;
  isJustStarting: boolean;
}

export interface SetCompletionFeedback {
  type: 'set_completion';
  message: string;
  bonusUnlocked: boolean;
}

export interface MilestoneFeedback {
  type: 'milestone';
  message: string;
  threshold: number;
}

export type CollectionFeedback =
  | ProgressSummary
  | SetCompletionFeedback
  | MilestoneFeedback;

interface ProgressSummaryParams {
  totalItems: number;
  collectedItems: number;
  completedSets: number;
  totalSets: number;
  recentGain?: string;
}

interface SetCompletionParams {
  setName: string;
  setSize: number;
  bonusUnlocked: boolean;
}

interface MilestoneParams {
  itemsCollected: number;
  threshold: number;
  milestoneName: string;
}

export class CollectionProgressFeedback {
  generateProgressSummary(params: ProgressSummaryParams): ProgressSummary {
    const completionPercentage = this.calculateCompletionPercentage(
      params.collectedItems,
      params.totalItems
    );
    const setsProgress = this.calculateSetsProgress(
      params.completedSets,
      params.totalSets
    );

    const message = `Collection progress: ${params.collectedItems}/${params.totalItems} items, ${params.completedSets}/${params.totalSets} sets`;

    return {
      completionPercentage,
      setsProgress,
      message,
      isNearComplete: completionPercentage >= 90,
      isJustStarting: completionPercentage === 0,
    };
  }

  generateSetCompletionFeedback(
    params: SetCompletionParams
  ): SetCompletionFeedback {
    const message = `Completed ${params.setName} set! Collected all ${params.setSize} items.${params.bonusUnlocked ? ' Bonus unlocked!' : ''}`;

    return {
      type: 'set_completion',
      message,
      bonusUnlocked: params.bonusUnlocked,
    };
  }

  generateMilestoneFeedback(params: MilestoneParams): MilestoneFeedback {
    const message = `Collection milestone achieved: ${params.milestoneName}! You've collected ${params.itemsCollected} items (threshold: ${params.threshold}).`;

    return {
      type: 'milestone',
      message,
      threshold: params.threshold,
    };
  }

  private calculateCompletionPercentage(
    collected: number,
    total: number
  ): number {
    if (total === 0) return 0;
    return Math.round((collected / total) * 100);
  }

  private calculateSetsProgress(completed: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  }
}
