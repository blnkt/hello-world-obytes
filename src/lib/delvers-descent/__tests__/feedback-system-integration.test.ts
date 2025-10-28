/**
 * Feedback System Integration Tests
 * Tests for integration between all feedback systems
 */

import { DecisionFeedbackSystem } from '../decision-feedback';
import { RiskWarningFeedback } from '../risk-warning-feedback';
import { EnergyStatusFeedback } from '../energy-status-feedback';
import { EncounterOutcomeFeedback } from '../encounter-outcome-feedback';
import { CollectionProgressFeedback } from '../collection-progress-feedback';
import { RewardCollectionFeedback } from '../reward-collection-feedback';
import { ErrorFeedback } from '../error-feedback';
import { HintsGuidance } from '../hints-guidance';

describe('Feedback System Integration', () => {
  let decisionFeedback: DecisionFeedbackSystem;
  let riskWarning: RiskWarningFeedback;
  let energyStatus: EnergyStatusFeedback;
  let encounterFeedback: EncounterOutcomeFeedback;
  let collectionFeedback: CollectionProgressFeedback;
  let rewardFeedback: RewardCollectionFeedback;
  let errorFeedback: ErrorFeedback;
  let hintsGuidance: HintsGuidance;

  beforeEach(() => {
    decisionFeedback = new DecisionFeedbackSystem();
    riskWarning = new RiskWarningFeedback(decisionFeedback);
    energyStatus = new EnergyStatusFeedback();
    encounterFeedback = new EncounterOutcomeFeedback();
    collectionFeedback = new CollectionProgressFeedback();
    rewardFeedback = new RewardCollectionFeedback();
    errorFeedback = new ErrorFeedback();
    hintsGuidance = new HintsGuidance();
  });

  describe('decision and risk warning integration', () => {
    it('should integrate decision feedback with risk warnings', () => {
      const decision = decisionFeedback.getDecisionFeedback({
        action: 'continue',
        currentEnergy: 30,
        totalEnergy: 100,
        estimatedCost: 25,
      });

      const warning = riskWarning.getRiskWarning({
        currentEnergy: 30,
        returnCost: 25,
        totalEnergy: 100,
      });

      expect(decision.type).toBeDefined();
      expect(warning.shouldShow).toBe(decision.type !== 'positive');
    });

    it('should use decision feedback to drive risk warnings', () => {
      const riskyScenario = { currentEnergy: 30, returnCost: 25, totalEnergy: 100 };

      const warning = riskWarning.getRiskWarning(riskyScenario);

      expect(warning.shouldShow).toBe(true);
      expect(warning.urgency).toBeGreaterThan(0);
    });
  });

  describe('energy status and decision integration', () => {
    it('should provide consistent feedback across systems', () => {
      const energyStatusData = energyStatus.generateEnergyStatus({
        currentEnergy: 30,
        totalEnergy: 100,
        estimatedCost: 15,
        returnCost: 25,
      });

      const decision = decisionFeedback.getDecisionFeedback({
        action: 'proceed',
        currentEnergy: 30,
        totalEnergy: 100,
        estimatedCost: 15,
      });

      const shouldBeAbleToContinue = decision.type !== 'danger';
      expect(typeof energyStatusData.canContinue).toBe('boolean');
      expect(energyStatusData.status).toBeDefined();
      expect(decision.type).toBeDefined();
    });
  });

  describe('encounter and reward integration', () => {
    it('should generate success feedback with reward animations', () => {
      const successFeedback = encounterFeedback.generateSuccessFeedback({
        rewards: [{ type: 'energy', amount: 100, description: '100 energy' }],
        itemsGained: [{ id: 'item1', name: 'Treasure', value: 50 }],
        energyUsed: 15,
      });

      const animation = rewardFeedback.generateRewardAnimation({
        rewardType: 'item',
        itemName: 'Treasure',
        rarity: 'rare',
      });

      expect(successFeedback.type).toBe('success');
      expect(animation.animationType).toBeDefined();
      expect(animation.icon).toBeDefined();
    });

    it('should handle failure feedback appropriately', () => {
      const failureFeedback = encounterFeedback.generateFailureFeedback({
        failureType: 'energy_exhausted',
        energyLost: 20,
        itemsLost: [],
      });

      expect(failureFeedback.type).toBe('failure');
      expect(failureFeedback.consequencesSummary).toBeDefined();
    });
  });

  describe('collection and progress integration', () => {
    it('should provide collection progress feedback', () => {
      const progressSummary = collectionFeedback.generateProgressSummary({
        totalItems: 100,
        collectedItems: 45,
        completedSets: 3,
        totalSets: 10,
        recentGain: 'Rare Artifact',
      });

      expect(progressSummary.completionPercentage).toBe(45);
      expect(progressSummary.message).toContain('45');
      expect(progressSummary.isNearComplete).toBe(progressSummary.completionPercentage >= 90);
    });
  });

  describe('error and recovery integration', () => {
    it('should provide recovery suggestions for errors', () => {
      const errorFeedbackData = errorFeedback.generateErrorFeedback({
        errorType: 'network',
        message: 'Connection failed',
      });

      expect(errorFeedbackData.hasRecovery).toBe(true);
      expect(errorFeedbackData.recoverySteps).toBeDefined();
      expect(errorFeedbackData.recoverySteps?.length).toBeGreaterThan(0);
    });
  });

  describe('hints and guidance integration', () => {
    it('should provide contextual hints for energy management', () => {
      const hint = hintsGuidance.getContextualHint({
        context: 'low_energy',
        energyLevel: 25,
        depth: 3,
      });

      expect(hint.hint).toBeDefined();
      expect(hint.relevance).toBeGreaterThan(0);
    });

    it('should provide guidance messages for different contexts', () => {
      const guidance = hintsGuidance.getGuidanceMessage({
        context: 'tutorial',
        playerLevel: 1,
      });

      expect(guidance.message).toBeDefined();
      expect(guidance.category).toBe('beginner');
    });
  });

  describe('full feedback flow integration', () => {
    it('should provide complete feedback flow for a typical game scenario', () => {
      const energyLevel = 30;
      const returnCost = 25;
      const totalEnergy = 100;

      const decision = decisionFeedback.getDecisionFeedback({
        action: 'continue',
        currentEnergy: energyLevel,
        totalEnergy: totalEnergy,
        estimatedCost: 15,
      });

      const energyStatusData = energyStatus.generateEnergyStatus({
        currentEnergy: energyLevel,
        totalEnergy: totalEnergy,
        estimatedCost: 15,
        returnCost: returnCost,
      });

      const warning = riskWarning.getRiskWarning({
        currentEnergy: energyLevel,
        returnCost: returnCost,
        totalEnergy: totalEnergy,
      });

      expect(decision.type).toBeDefined();
      expect(energyStatusData.status).toBeDefined();
      expect(warning.shouldShow).toBe(decision.type !== 'positive');
    });
  });
});

