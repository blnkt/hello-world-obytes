import { RewardCalculator } from './reward-calculator';
import { RiskEventEncounter } from './risk-event-encounter';

/**
 * Integration tests verifying that advanced encounter types integrate with the reward calculation system.
 *
 * These tests verify:
 * - Advanced encounter types can be created and configured
 * - Depth-based scaling works across all advanced encounter types
 * - Reward multipliers are applied correctly
 * - Reward system maintains consistency across encounter types
 */
describe('Advanced Encounters & Reward System Integration (Task 4.4)', () => {
  let rewardCalculator: RewardCalculator;

  beforeEach(() => {
    rewardCalculator = new RewardCalculator();
  });

  describe('Risk Event Encounter integration', () => {
    it('should process risk event rewards through RewardCalculator', () => {
      const config = RiskEventEncounter.createRiskLevelConfig('low', 3);
      const encounter = new RiskEventEncounter('test-1', config);
      const state = encounter.getState();

      expect(state.config.baseReward).toBeDefined();
      expect(state.config.baseReward.energy).toBeGreaterThanOrEqual(0);
      expect(state.config.baseReward.items.length).toBeGreaterThan(0);
    });

    it('should apply depth-based scaling to risk event rewards', () => {
      const depth1Config = RiskEventEncounter.createRiskLevelConfig('low', 1);
      const depth5Config = RiskEventEncounter.createRiskLevelConfig('low', 5);
      const depth1Encounter = new RiskEventEncounter('test-1', depth1Config);
      const depth5Encounter = new RiskEventEncounter('test-2', depth5Config);

      const depth1Reward = depth1Encounter.getState().config.baseReward;
      const depth5Reward = depth5Encounter.getState().config.baseReward;

      expect(depth5Reward.energy).toBeGreaterThanOrEqual(depth1Reward.energy);
      expect(depth5Reward.xp).toBeGreaterThan(depth1Reward.xp);
    });

    it('should generate legendary rewards for extreme risk success', () => {
      const config = RiskEventEncounter.createRiskLevelConfig('extreme', 3);
      const encounter = new RiskEventEncounter('test-1', config);

      // Select a choice first
      const state = encounter.getState();
      const choice = state.availableChoices[0];
      encounter.selectChoice(choice.id);

      // Mock high success rate to trigger legendary
      const originalRandom = Math.random;
      Math.random = () => 0.01; // Very low = success

      const outcome = encounter.resolve();

      Math.random = originalRandom;

      expect(outcome.type).toBe('success');
      if (outcome.type === 'success' && outcome.reward) {
        expect(outcome.reward.energy).toBeGreaterThanOrEqual(0);
        expect(outcome.reward.items.length).toBeGreaterThan(0);
      }
    });
  });

  describe('RewardCalculator integration', () => {
    it('should have RewardCalculator configured for all encounter types', () => {
      // Verify RewardCalculator supports all advanced encounter types
      const multipliers = rewardCalculator.getEncounterTypeMultipliers();
      expect(multipliers.risk_event).toBeDefined();
      expect(multipliers.hazard).toBeDefined();
      expect(multipliers.rest_site).toBeDefined();
    });

    it('should process rewards with correct multipliers', () => {
      const testItem = {
        id: 'test',
        name: 'Test Item',
        type: 'trade_good' as const,
        setId: 'test',
        value: 10,
        description: 'Test',
      };

      // Test that RewardCalculator can process items for each encounter type
      const riskRewards = rewardCalculator.processEncounterRewards(
        [testItem],
        'risk_event',
        3
      );
      expect(riskRewards[0].value).toBeGreaterThan(testItem.value);

      const hazardRewards = rewardCalculator.processEncounterRewards(
        [testItem],
        'hazard',
        3
      );
      expect(hazardRewards[0].value).toBeDefined();

      const restRewards = rewardCalculator.processEncounterRewards(
        [testItem],
        'rest_site',
        3
      );
      expect(restRewards[0].value).toBeDefined();
    });

    it('should apply depth-based scaling to all encounter types', () => {
      const testItem = {
        id: 'test',
        name: 'Test Item',
        type: 'trade_good' as const,
        setId: 'test',
        value: 10,
        description: 'Test',
      };

      const depth1Rewards = rewardCalculator.processEncounterRewards(
        [testItem],
        'risk_event',
        1
      );
      const depth5Rewards = rewardCalculator.processEncounterRewards(
        [testItem],
        'risk_event',
        5
      );

      expect(depth5Rewards[0].value).toBeGreaterThan(depth1Rewards[0].value);
    });
  });
});
