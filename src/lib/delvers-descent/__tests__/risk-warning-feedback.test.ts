/**
 * Risk Warning Feedback Tests
 * Tests for risk warning feedback integration
 */

import { DecisionFeedbackSystem } from '../decision-feedback';
import { RiskWarningFeedback } from '../risk-warning-feedback';

describe('RiskWarningFeedback', () => {
  let feedbackSystem: DecisionFeedbackSystem;
  let riskWarning: RiskWarningFeedback;

  beforeEach(() => {
    feedbackSystem = new DecisionFeedbackSystem();
    riskWarning = new RiskWarningFeedback(feedbackSystem);
  });

  describe('risk warning generation', () => {
    it('should generate risk warning for dangerous energy levels', () => {
      const warning = riskWarning.getRiskWarning({
        currentEnergy: 30,
        returnCost: 25,
        totalEnergy: 100,
      });

      expect(warning.shouldShow).toBe(true);
      expect(warning.severity).toBeDefined();
      expect(warning.message.length).toBeGreaterThan(0);
      expect(warning.urgency).toBeGreaterThanOrEqual(0);
    });

    it('should not generate warning for safe energy levels', () => {
      const warning = riskWarning.getRiskWarning({
        currentEnergy: 80,
        returnCost: 15,
        totalEnergy: 100,
      });

      expect(warning.shouldShow).toBe(false);
    });

    it('should calculate safety margin correctly', () => {
      const safetyMargin = riskWarning.calculateSafetyMargin(50, 30);
      expect(safetyMargin).toBe(20);
    });

    it('should determine risk severity based on safety margin', () => {
      const highRisk = riskWarning.determineRiskSeverity(10, 80);
      expect(highRisk).toBe('high');

      const mediumRisk = riskWarning.determineRiskSeverity(35, 80);
      expect(mediumRisk).toBe('medium');

      const lowRisk = riskWarning.determineRiskSeverity(60, 80);
      expect(lowRisk).toBe('low');
    });
  });
});

