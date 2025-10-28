/**
 * Hints and Guidance Tests
 * Tests for helpful hints and guidance system
 */

import { HintsGuidance } from '../hints-guidance';

describe('HintsGuidance', () => {
  let guidance: HintsGuidance;

  beforeEach(() => {
    guidance = new HintsGuidance();
  });

  describe('contextual hint generation', () => {
    it('should generate hints for low energy situations', () => {
      const result = guidance.getContextualHint({
        context: 'low_energy',
        energyLevel: 25,
        depth: 3,
      });

      expect(result.hint).toBeDefined();
      expect(result.hint.length).toBeGreaterThan(0);
      expect(result.relevance).toBeGreaterThan(0);
    });

    it('should generate hints for deep dives', () => {
      const result = guidance.getContextualHint({
        context: 'deep_dive',
        depth: 8,
        energyLevel: 50,
      });

      expect(result.hint).toBeDefined();
      const hint = result.hint.toLowerCase();
      expect(hint.includes('deep') || hint.includes('careful')).toBe(true);
    });

    it('should generate hints for collection progress', () => {
      const result = guidance.getContextualHint({
        context: 'collection',
        completionRate: 0.65,
      });

      expect(result.hint).toBeDefined();
      expect(result.relevance).toBeGreaterThan(0);
    });
  });

  describe('guidance messages', () => {
    it('should provide guidance for first-time players', () => {
      const result = guidance.getGuidanceMessage({
        context: 'tutorial',
        playerLevel: 1,
      });

      expect(result.message).toBeDefined();
      expect(result.message.length).toBeGreaterThan(0);
      expect(result.category).toBeDefined();
    });

    it('should provide advanced guidance for experienced players', () => {
      const result = guidance.getGuidanceMessage({
        context: 'advanced',
        playerLevel: 50,
        completionRate: 0.8,
      });

      expect(result.message).toBeDefined();
      expect(result.category).toBe('advanced');
    });

    it('should provide strategic guidance for push-your-luck decisions', () => {
      const result = guidance.getGuidanceMessage({
        context: 'risk_assessment',
        energyLevel: 40,
        returnCost: 35,
      });

      expect(result.message).toBeDefined();
      const message = result.message.toLowerCase();
      expect(message.includes('risk') || message.includes('energy') || message.includes('return') || message.includes('safety')).toBe(true);
    });
  });

  describe('hint relevance calculation', () => {
    it('should calculate high relevance for critical situations', () => {
      const result = guidance.getContextualHint({
        context: 'critical',
        urgency: 1.0,
      });

      expect(result.relevance).toBeGreaterThanOrEqual(0.8);
    });

    it('should calculate low relevance for non-critical situations', () => {
      const result = guidance.getContextualHint({
        context: 'casual',
        urgency: 0.2,
      });

      expect(result.relevance).toBeLessThan(0.5);
    });
  });
});

