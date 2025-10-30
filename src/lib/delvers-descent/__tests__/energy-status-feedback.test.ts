/**
 * Energy Status Feedback Tests
 * Tests for energy status feedback with safety margins
 */

import { EnergyStatusFeedback } from '../energy-status-feedback';

describe('EnergyStatusFeedback', () => {
  let feedback: EnergyStatusFeedback;

  beforeEach(() => {
    feedback = new EnergyStatusFeedback();
  });

  describe('energy status generation', () => {
    it('should generate status for healthy energy levels', () => {
      const result = feedback.generateEnergyStatus({
        currentEnergy: 80,
        totalEnergy: 100,
        estimatedCost: 10,
        returnCost: 20,
      });

      expect(result.status).toBe('healthy');
      expect(result.safetyMargin).toBeGreaterThan(0);
      expect(result.message.toLowerCase()).toContain('healthy');
    });

    it('should generate status for low energy levels', () => {
      const result = feedback.generateEnergyStatus({
        currentEnergy: 30,
        totalEnergy: 100,
        estimatedCost: 15,
        returnCost: 25,
      });

      expect(result.status).toBe('low');
      expect(result.safetyMargin).toBeLessThanOrEqual(10);
      expect(result.message.toLowerCase()).toContain('low');
    });

    it('should generate status for critical energy levels', () => {
      const result = feedback.generateEnergyStatus({
        currentEnergy: 15,
        totalEnergy: 100,
        estimatedCost: 10,
        returnCost: 16,
      });

      expect(result.status).toBe('critical');
      expect(result.safetyMargin).toBeLessThan(0);
      expect(result.message.toLowerCase()).toContain('critical');
    });
  });

  describe('safety margin calculation', () => {
    it('should calculate positive safety margin for safe scenarios', () => {
      const result = feedback.generateEnergyStatus({
        currentEnergy: 70,
        totalEnergy: 100,
        estimatedCost: 10,
        returnCost: 20,
      });

      expect(result.safetyMargin).toBeGreaterThan(0);
      expect(result.canContinue).toBe(true);
    });

    it('should calculate negative safety margin for risky scenarios', () => {
      const result = feedback.generateEnergyStatus({
        currentEnergy: 10,
        totalEnergy: 100,
        estimatedCost: 5,
        returnCost: 15,
      });

      expect(result.safetyMargin).toBeLessThan(0);
      expect(result.canContinue).toBe(false);
    });
  });

  describe('recommendation generation', () => {
    it('should recommend continuing when energy is sufficient', () => {
      const result = feedback.generateEnergyStatus({
        currentEnergy: 60,
        totalEnergy: 100,
        estimatedCost: 10,
        returnCost: 15,
      });

      expect(result.recommendation).toBe('safe_to_continue');
      expect(result.canContinue).toBe(true);
    });

    it('should recommend returning when energy is low', () => {
      const result = feedback.generateEnergyStatus({
        currentEnergy: 25,
        totalEnergy: 100,
        estimatedCost: 10,
        returnCost: 26,
      });

      expect(result.recommendation).toBe('consider_retreating');
      expect(result.canContinue).toBe(false);
    });
  });
});
