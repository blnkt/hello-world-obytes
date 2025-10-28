/**
 * Reward Collection Feedback
 * Provides animations and UI feedback for reward collection
 */

export type RewardType = 'energy' | 'item';
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type AnimationType = 'bounce' | 'glow' | 'pulse' | 'sparkle';

export interface RewardAnimationData {
  animationType: AnimationType;
  animationDuration: number;
  icon: string;
  color: string;
}

export interface CollectionSequence {
  sequence: RewardAnimationData[];
  totalDuration: number;
  shouldStagger: boolean;
}

export interface CollectionMessage {
  message: string;
  shouldHighlight: boolean;
}

interface RewardAnimationParams {
  rewardType: RewardType;
  amount?: number;
  itemName?: string;
  rarity?: Rarity;
}

interface Reward {
  type: RewardType;
  amount?: number;
  name?: string;
}

interface CollectionMessageParams {
  rewardType: RewardType;
  amount?: number;
  itemName?: string;
}

export class RewardCollectionFeedback {
  generateRewardAnimation(params: RewardAnimationParams): RewardAnimationData {
    const rarity = params.rarity || 'common';

    if (params.rewardType === 'energy') {
      return {
        animationType: 'bounce',
        animationDuration: 500,
        icon: '⚡',
        color: '#yellow',
      };
    } else {
      const animationConfig = this.getItemAnimationConfig(rarity);
      return animationConfig;
    }
  }

  generateCollectionSequence(rewards: Reward[]): CollectionSequence {
    const sequence = rewards.map((reward) =>
      this.generateRewardAnimation({
        rewardType: reward.type,
        amount: reward.amount,
        itemName: reward.name,
      })
    );

    const totalDuration = sequence.reduce(
      (sum, anim) => sum + anim.animationDuration,
      0
    );

    return {
      sequence,
      totalDuration,
      shouldStagger: rewards.length > 1,
    };
  }

  generateCollectionMessage(
    params: CollectionMessageParams
  ): CollectionMessage {
    let message = '';
    let shouldHighlight = false;

    if (params.rewardType === 'energy' && params.amount) {
      message = `Collected ${params.amount} energy!`;
      shouldHighlight = params.amount >= 100;
    } else if (params.rewardType === 'item' && params.itemName) {
      message = `Collected ${params.itemName}!`;
      shouldHighlight = true;
    }

    return {
      message,
      shouldHighlight,
    };
  }

  private getItemAnimationConfig(rarity: Rarity): RewardAnimationData {
    switch (rarity) {
      case 'legendary':
        return {
          animationType: 'pulse',
          animationDuration: 1000,
          icon: '💎',
          color: '#purple',
        };
      case 'epic':
        return {
          animationType: 'glow',
          animationDuration: 800,
          icon: '⭐',
          color: '#blue',
        };
      case 'rare':
        return {
          animationType: 'glow',
          animationDuration: 700,
          icon: '⭐',
          color: '#cyan',
        };
      default:
        return {
          animationType: 'bounce',
          animationDuration: 500,
          icon: '✨',
          color: '#gray',
        };
    }
  }
}
