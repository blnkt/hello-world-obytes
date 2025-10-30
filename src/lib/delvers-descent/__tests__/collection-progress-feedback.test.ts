/**
 * Collection Progress Feedback Tests
 * Tests for collection progress feedback system
 */

import { CollectionProgressFeedback } from '../collection-progress-feedback';

describe('CollectionProgressFeedback', () => {
  let feedback: CollectionProgressFeedback;

  beforeEach(() => {
    feedback = new CollectionProgressFeedback();
  });

  describe('progress summary generation', () => {
    it('should generate progress summary for collection sets', () => {
      const result = feedback.generateProgressSummary({
        totalItems: 100,
        collectedItems: 45,
        completedSets: 3,
        totalSets: 10,
        recentGain: 'Rare Artifact',
      });

      expect(result.completionPercentage).toBe(45);
      expect(result.setsProgress).toBe(30);
      expect(result.message).toContain('45');
    });

    it('should indicate near completion', () => {
      const result = feedback.generateProgressSummary({
        totalItems: 100,
        collectedItems: 95,
        completedSets: 9,
        totalSets: 10,
        recentGain: undefined,
      });

      expect(result.completionPercentage).toBe(95);
      expect(result.isNearComplete).toBe(true);
    });

    it('should indicate when no progress has been made', () => {
      const result = feedback.generateProgressSummary({
        totalItems: 100,
        collectedItems: 0,
        completedSets: 0,
        totalSets: 10,
        recentGain: undefined,
      });

      expect(result.completionPercentage).toBe(0);
      expect(result.isJustStarting).toBe(true);
    });
  });

  describe('set completion feedback', () => {
    it('should generate feedback for completing a set', () => {
      const result = feedback.generateSetCompletionFeedback({
        setName: 'Ancient Relics',
        setSize: 5,
        bonusUnlocked: true,
      });

      expect(result.type).toBe('set_completion');
      expect(result.message).toContain('Ancient Relics');
      expect(result.bonusUnlocked).toBe(true);
    });
  });

  describe('collection milestone feedback', () => {
    it('should generate feedback for reaching a milestone', () => {
      const result = feedback.generateMilestoneFeedback({
        itemsCollected: 50,
        threshold: 50,
        milestoneName: 'Collector',
      });

      expect(result.type).toBe('milestone');
      expect(result.message).toContain('50');
      expect(result.message).toContain('Collector');
    });
  });
});
