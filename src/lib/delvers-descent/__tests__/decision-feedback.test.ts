/**
 * Decision Feedback System Tests
 * Tests for player action feedback system
 */

import { DecisionFeedbackSystem } from '../decision-feedback';

describe('DecisionFeedbackSystem', () => {
  let feedbackSystem: DecisionFeedbackSystem;

  beforeEach(() => {
    feedbackSystem = new DecisionFeedbackSystem();
  });

  describe('decision feedback generation', () => {
    it('should provide feedback for safe decisions', () => {
      const feedback = feedbackSystem.getDecisionFeedback({
        action: 'safe',
        totalEnergy: 100,
        currentEnergy: 80,
        estimatedCost: 10,
      });

      expect(feedback.type).toBe('positive');
      expect(feedback.message).toContain('safe');
      expect(feedback.shouldWarn).toBe(false);
    });

    it('should provide feedback for risky decisions', () => {
      const feedback = feedbackSystem.getDecisionFeedback({
        action: 'risky',
        totalEnergy: 100,
        currentEnergy: 40,
        estimatedCost: 15,
      });

      expect(feedback.type).toBe('warning');
      expect(feedback.message).toContain('risky');
      expect(feedback.shouldWarn).toBe(true);
    });

    it('should provide feedback for dangerous decisions', () => {
      const feedback = feedbackSystem.getDecisionFeedback({
        action: 'dangerous',
        totalEnergy: 100,
        currentEnergy: 30,
        estimatedCost: 25,
      });

      expect(feedback.type).toBe('danger');
      expect(feedback.message).toContain('dangerous');
      expect(feedback.shouldWarn).toBe(true);
    });
  });

  describe('feedback message generation', () => {
    it('should generate appropriate messages for different energy states', () => {
      const safeFeedback = feedbackSystem.getDecisionFeedback({
        action: 'safe',
        totalEnergy: 100,
        currentEnergy: 80,
        estimatedCost: 15,
      });
      expect(safeFeedback.type).toBe('positive');

      const riskyFeedback = feedbackSystem.getDecisionFeedback({
        action: 'risky',
        totalEnergy: 100,
        currentEnergy: 45,
        estimatedCost: 18,
      });
      expect(riskyFeedback.type).toBe('warning');

      const dangerousFeedback = feedbackSystem.getDecisionFeedback({
        action: 'dangerous',
        totalEnergy: 100,
        currentEnergy: 25,
        estimatedCost: 20,
      });
      expect(dangerousFeedback.type).toBe('danger');
    });
  });
});

