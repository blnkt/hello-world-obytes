/**
 * Encounter Outcome Feedback Tests
 * Tests for success/failure feedback in encounters
 */

import { EncounterOutcomeFeedback } from '../encounter-outcome-feedback';

describe('EncounterOutcomeFeedback', () => {
  let feedback: EncounterOutcomeFeedback;

  beforeEach(() => {
    feedback = new EncounterOutcomeFeedback();
  });

  describe('success feedback generation', () => {
    it('should generate success feedback for completed encounters', () => {
      const result = feedback.generateSuccessFeedback({
        rewards: [{ type: 'energy', amount: 100, description: '100 energy' }],
        itemsGained: [{ id: 'item1', name: 'Treasure', value: 50 }],
        energyUsed: 15,
      });

      expect(result.type).toBe('success');
      expect(result.message).toContain('success');
      expect(result.showRewards).toBe(true);
    });

    it('should include reward summary in success feedback', () => {
      const result = feedback.generateSuccessFeedback({
        rewards: [
          { type: 'energy', amount: 100, description: '100 energy' },
          { type: 'items', description: 'Rare Artifact' },
        ],
        itemsGained: [],
        energyUsed: 10,
      });

      expect(result.rewardsSummary).toBeDefined();
      expect(result.rewardsSummary?.length).toBeGreaterThan(0);
    });
  });

  describe('failure feedback generation', () => {
    it('should generate failure feedback for failed encounters', () => {
      const result = feedback.generateFailureFeedback({
        failureType: 'energy_exhausted',
        energyLost: 20,
        itemsLost: [],
      });

      expect(result.type).toBe('failure');
      expect(result.message.toLowerCase()).toContain('fail');
      expect(result.showConsequences).toBe(true);
    });

    it('should include consequences in failure feedback', () => {
      const result = feedback.generateFailureFeedback({
        failureType: 'objective_failed',
        energyLost: 25,
        itemsLost: [{ id: 'item1', name: 'Lost Item' }],
      });

      expect(result.consequencesSummary).toBeDefined();
      expect(result.consequencesSummary.length).toBeGreaterThan(0);
      expect(result.consequencesSummary.some((s) => s.includes('energy'))).toBe(
        true
      );
    });
  });

  describe('feedback message generation', () => {
    it('should generate appropriate messages for different outcome types', () => {
      const successResult = feedback.generateSuccessFeedback({
        rewards: [],
        itemsGained: [],
        energyUsed: 15,
      });
      expect(successResult.type).toBe('success');

      const failureResult = feedback.generateFailureFeedback({
        failureType: 'energy_exhausted',
        energyLost: 20,
        itemsLost: [],
      });
      expect(failureResult.type).toBe('failure');
    });
  });
});
