/**
 * Reward Collection Feedback Tests
 * Tests for reward collection feedback animations and UI
 */

import { RewardCollectionFeedback } from '../reward-collection-feedback';

describe('RewardCollectionFeedback', () => {
  let feedback: RewardCollectionFeedback;

  beforeEach(() => {
    feedback = new RewardCollectionFeedback();
  });

  describe('reward animation generation', () => {
    it('should generate animation data for energy rewards', () => {
      const result = feedback.generateRewardAnimation({
        rewardType: 'energy',
        amount: 100,
        rarity: 'common',
      });

      expect(result.animationType).toBe('bounce');
      expect(result.animationDuration).toBe(500);
      expect(result.icon).toBe('⚡');
      expect(result.color).toBe('#yellow');
    });

    it('should generate animation data for item rewards', () => {
      const result = feedback.generateRewardAnimation({
        rewardType: 'item',
        itemName: 'Rare Artifact',
        rarity: 'rare',
      });

      expect(result.animationType).toBe('glow');
      expect(result.animationDuration).toBe(700);
      expect(result.icon).toBe('⭐');
      expect(result.color).toBe('#cyan');
    });

    it('should generate animation data for legendary rewards', () => {
      const result = feedback.generateRewardAnimation({
        rewardType: 'item',
        itemName: 'Legendary Treasure',
        rarity: 'legendary',
      });

      expect(result.animationType).toBe('pulse');
      expect(result.animationDuration).toBe(1000);
      expect(result.icon).toBe('💎');
      expect(result.color).toBe('#purple');
    });
  });

  describe('collection sequence generation', () => {
    it('should generate sequence for multiple rewards', () => {
      const result = feedback.generateCollectionSequence([
        { type: 'energy', amount: 100 },
        { type: 'item', name: 'Artifact' },
      ]);

      expect(result.sequence.length).toBe(2);
      expect(result.totalDuration).toBeGreaterThan(0);
      expect(result.shouldStagger).toBe(true);
    });

    it('should handle single reward without staggering', () => {
      const result = feedback.generateCollectionSequence([
        { type: 'energy', amount: 50 },
      ]);

      expect(result.sequence.length).toBe(1);
      expect(result.shouldStagger).toBe(false);
    });
  });

  describe('message generation', () => {
    it('should generate message for energy collection', () => {
      const result = feedback.generateCollectionMessage({
        rewardType: 'energy',
        amount: 150,
      });

      expect(result.message).toContain('150');
      expect(result.message).toContain('energy');
    });

    it('should generate message for item collection', () => {
      const result = feedback.generateCollectionMessage({
        rewardType: 'item',
        itemName: 'Ancient Relic',
      });

      expect(result.message).toContain('Ancient Relic');
      expect(result.message.toLowerCase()).toContain('collected');
    });
  });
});

