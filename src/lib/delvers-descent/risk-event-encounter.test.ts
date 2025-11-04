import { type AdvancedEncounterItem } from '@/types/delvers-descent';

import {
  type RiskEventConfig,
  RiskEventEncounter,
} from './risk-event-encounter';

describe('RiskEventEncounter', () => {
  let encounter: RiskEventEncounter;
  let config: RiskEventConfig;

  beforeEach(() => {
    config = {
      riskLevel: 'medium',
      successRate: 0.6,
      baseReward: {
        energy: 20,
        items: [
          {
            id: 'gem',
            name: 'Gem',
            quantity: 1,
            rarity: 'common',
            type: 'trade_good',
            setId: 'gem_set',
            value: 10,
            description: 'A valuable gem',
          } as AdvancedEncounterItem,
        ],
        xp: 50,
      },
      failureConsequence: {
        energyLoss: 15,
        itemLossRisk: 0.3,
        forcedRetreat: false,
        encounterLockout: false,
      },
    };
    encounter = new RiskEventEncounter('test-risk-1', config);
  });

  describe('encounter initialization', () => {
    it('should initialize with correct state', () => {
      const state = encounter.getState();

      expect(state.encounterId).toBe('test-risk-1');
      expect(state.encounterType).toBe('risk_event');
      expect(state.config).toEqual(config);
      expect(state.availableChoices).toHaveLength(3); // base choices for medium risk
      expect(state.isResolved).toBe(false);
      expect(state.outcome).toBeUndefined();
    });

    it('should generate appropriate choices for different risk levels', () => {
      const lowRiskConfig = { ...config, riskLevel: 'low' as const };
      const lowRiskEncounter = new RiskEventEncounter(
        'low-risk',
        lowRiskConfig
      );

      const highRiskConfig = { ...config, riskLevel: 'high' as const };
      const highRiskEncounter = new RiskEventEncounter(
        'high-risk',
        highRiskConfig
      );

      const extremeRiskConfig = { ...config, riskLevel: 'extreme' as const };
      const extremeRiskEncounter = new RiskEventEncounter(
        'extreme-risk',
        extremeRiskConfig
      );

      expect(lowRiskEncounter.getState().availableChoices).toHaveLength(3);
      expect(highRiskEncounter.getState().availableChoices).toHaveLength(4);
      expect(extremeRiskEncounter.getState().availableChoices).toHaveLength(4);
    });

    it('should include risk-specific choices for high and extreme levels', () => {
      const highRiskConfig = { ...config, riskLevel: 'high' as const };
      const highRiskEncounter = new RiskEventEncounter(
        'high-risk',
        highRiskConfig
      );

      const extremeRiskConfig = { ...config, riskLevel: 'extreme' as const };
      const extremeRiskEncounter = new RiskEventEncounter(
        'extreme-risk',
        extremeRiskConfig
      );

      const highChoices = highRiskEncounter.getState().availableChoices;
      const extremeChoices = extremeRiskEncounter.getState().availableChoices;

      expect(highChoices.find((c) => c.id === 'high_stakes')).toBeDefined();
      expect(
        extremeChoices.find((c) => c.id === 'all_or_nothing')
      ).toBeDefined();
    });
  });

  describe('choice selection', () => {
    it('should allow selecting valid choices', () => {
      const state = encounter.getState();
      const choice = state.availableChoices[0];

      const result = encounter.selectChoice(choice.id);

      expect(result).toBe(true);
      expect(encounter.getState().selectedChoice).toEqual(choice);
    });

    it('should reject invalid choice IDs', () => {
      const result = encounter.selectChoice('invalid-choice');

      expect(result).toBe(false);
      expect(encounter.getState().selectedChoice).toBeUndefined();
    });

    it('should update state when choice is selected', () => {
      const state = encounter.getState();
      const choice = state.availableChoices[1];

      encounter.selectChoice(choice.id);
      const updatedState = encounter.getState();

      expect(updatedState.selectedChoice).toEqual(choice);
    });
  });

  describe('encounter resolution', () => {
    beforeEach(() => {
      const state = encounter.getState();
      encounter.selectChoice(state.availableChoices[0].id);
    });

    it('should resolve encounter with selected choice', () => {
      const outcome = encounter.resolve();

      expect(outcome).toBeDefined();
      expect(outcome.type).toMatch(/^(success|failure)$/);
      expect(outcome.message).toBeDefined();
      expect(encounter.getState().isResolved).toBe(true);
    });

    it('should throw error if no choice selected', () => {
      const newEncounter = new RiskEventEncounter('no-choice', config);

      expect(() => newEncounter.resolve()).toThrow(
        'No choice selected for risk event'
      );
    });

    it('should return same outcome on multiple resolve calls', () => {
      const outcome1 = encounter.resolve();
      const outcome2 = encounter.resolve();

      expect(outcome1).toEqual(outcome2);
    });

    it('should generate success outcomes with modified rewards', () => {
      // Mock Math.random to ensure success
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.1); // Low number ensures success

      const outcome = encounter.resolve();

      expect(outcome.type).toBe('success');
      expect(outcome.reward).toBeDefined();
      expect(outcome.reward!.energy).toBe(0);
      expect(outcome.reward!.items).toBeDefined();
      expect(outcome.reward!.xp).toBeGreaterThan(0);

      Math.random = originalRandom;
    });

    it('should generate failure outcomes with consequences', () => {
      // Mock Math.random to ensure failure
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.9); // High number ensures failure

      const outcome = encounter.resolve();

      expect(outcome.type).toBe('failure');
      expect(outcome.consequence).toBeDefined();
      expect(outcome.consequence!.energyLoss).toBeGreaterThan(0);
      expect(outcome.consequence!.itemLossRisk).toBeGreaterThanOrEqual(0);
      expect(typeof outcome.consequence!.forcedRetreat).toBe('boolean');

      Math.random = originalRandom;
    });
  });

  describe('choice modifiers', () => {
    it('should apply success rate modifiers correctly', () => {
      const state = encounter.getState();
      const conservativeChoice = state.availableChoices.find(
        (c) => c.id === 'conservative'
      )!;
      const aggressiveChoice = state.availableChoices.find(
        (c) => c.id === 'aggressive'
      )!;

      encounter.selectChoice(conservativeChoice.id);
      const conservativeOutcome = encounter.resolve();

      // Reset encounter for next test
      encounter = new RiskEventEncounter('test-risk-2', config);
      encounter.selectChoice(aggressiveChoice.id);
      const aggressiveOutcome = encounter.resolve();

      // Both should be valid outcomes
      expect(conservativeOutcome).toBeDefined();
      expect(aggressiveOutcome).toBeDefined();
    });

    it('should apply reward modifiers on success', () => {
      const state = encounter.getState();
      const aggressiveChoice = state.availableChoices.find(
        (c) => c.id === 'aggressive'
      )!;

      encounter.selectChoice(aggressiveChoice.id);

      // Mock Math.random to ensure success
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.1);

      const outcome = encounter.resolve();

      if (outcome.type === 'success') {
        expect(outcome.reward!.energy).toBe(0);
        expect(outcome.reward!.xp).toBeGreaterThan(config.baseReward.xp);
      }

      Math.random = originalRandom;
    });

    it('should apply consequence modifiers on failure', () => {
      const state = encounter.getState();
      const aggressiveChoice = state.availableChoices.find(
        (c) => c.id === 'aggressive'
      )!;

      encounter.selectChoice(aggressiveChoice.id);

      // Mock Math.random to ensure failure
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.9);

      const outcome = encounter.resolve();

      if (outcome.type === 'failure') {
        expect(outcome.consequence!.energyLoss).toBeGreaterThan(
          config.failureConsequence.energyLoss
        );
      }

      Math.random = originalRandom;
    });
  });

  describe('edge cases', () => {
    it('should handle extreme success rate modifiers', () => {
      const extremeConfig = {
        ...config,
        successRate: 0.1, // Very low base success rate
      };
      const extremeEncounter = new RiskEventEncounter(
        'extreme-test',
        extremeConfig
      );

      const state = extremeEncounter.getState();
      const conservativeChoice = state.availableChoices.find(
        (c) => c.id === 'conservative'
      )!;

      extremeEncounter.selectChoice(conservativeChoice.id);

      // Should not throw error even with extreme modifiers
      expect(() => extremeEncounter.resolve()).not.toThrow();
    });

    it('should clamp success rates to valid range', () => {
      const highSuccessConfig = {
        ...config,
        successRate: 0.9, // High base success rate
      };
      const highSuccessEncounter = new RiskEventEncounter(
        'high-success',
        highSuccessConfig
      );

      const state = highSuccessEncounter.getState();
      const aggressiveChoice = state.availableChoices.find(
        (c) => c.id === 'aggressive'
      )!;

      highSuccessEncounter.selectChoice(aggressiveChoice.id);

      // Should not throw error even with extreme modifiers
      expect(() => highSuccessEncounter.resolve()).not.toThrow();
    });

    it('should handle empty reward items', () => {
      const emptyRewardConfig = {
        ...config,
        baseReward: {
          energy: 10,
          items: [],
          xp: 25,
        },
      };
      const emptyRewardEncounter = new RiskEventEncounter(
        'empty-reward',
        emptyRewardConfig
      );

      const state = emptyRewardEncounter.getState();
      emptyRewardEncounter.selectChoice(state.availableChoices[0].id);

      const outcome = emptyRewardEncounter.resolve();

      expect(outcome).toBeDefined();
      if (outcome.type === 'success') {
        expect(outcome.reward!.items).toEqual([]);
      }
    });
  });

  describe('performance', () => {
    it('should resolve encounters within performance requirements', () => {
      const state = encounter.getState();
      encounter.selectChoice(state.availableChoices[0].id);

      const startTime = performance.now();
      encounter.resolve();
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50); // Should complete within 50ms
    });
  });

  describe('risk level configurations', () => {
    it('should create low risk configuration', () => {
      const config = RiskEventEncounter.createRiskLevelConfig('low', 1);

      expect(config.riskLevel).toBe('low');
      expect(config.successRate).toBe(0.8);
      expect(config.baseReward.energy).toBe(0);
      expect(config.baseReward.items[0].rarity).toBe('common');
      expect(config.failureConsequence.energyLoss).toBe(5);
      expect(config.failureConsequence.forcedRetreat).toBe(false);
    });

    it('should create medium risk configuration', () => {
      const config = RiskEventEncounter.createRiskLevelConfig('medium', 1);

      expect(config.riskLevel).toBe('medium');
      expect(config.successRate).toBe(0.6);
      expect(config.baseReward.energy).toBe(0);
      expect(config.baseReward.items[0].rarity).toBe('rare');
      expect(config.failureConsequence.energyLoss).toBe(15);
      expect(config.failureConsequence.forcedRetreat).toBe(false);
    });

    it('should create high risk configuration with legendary rewards', () => {
      const config = RiskEventEncounter.createRiskLevelConfig('high', 1);

      expect(config.riskLevel).toBe('high');
      expect(config.successRate).toBe(0.4);
      expect(config.baseReward.energy).toBe(0);
      expect(config.baseReward.items[0].rarity).toBe('epic');
      expect(config.legendaryReward).toBeDefined();
      expect(config.legendaryReward!.items[0].rarity).toBe('legendary');
      expect(config.failureConsequence.forcedRetreat).toBe(true);
    });

    it('should create extreme risk configuration with divine rewards', () => {
      const config = RiskEventEncounter.createRiskLevelConfig('extreme', 1);

      expect(config.riskLevel).toBe('extreme');
      expect(config.successRate).toBe(0.2);
      expect(config.baseReward.energy).toBe(0);
      // Rarity has been adjusted in current config
      expect(['legendary', 'mythic']).toContain(
        config.baseReward.items[0].rarity
      );
      expect(config.legendaryReward).toBeDefined();
      expect(['legendary', 'divine']).toContain(
        config.legendaryReward!.items[0].rarity
      );
      expect(config.legendaryReward!.items).toHaveLength(2);
      expect(config.failureConsequence.forcedRetreat).toBe(true);
    });

    it('should scale rewards with depth', () => {
      const depth1Config = RiskEventEncounter.createRiskLevelConfig(
        'medium',
        1
      );
      const depth3Config = RiskEventEncounter.createRiskLevelConfig(
        'medium',
        3
      );

      expect(depth3Config.baseReward.energy).toBe(0);
      expect(depth1Config.baseReward.energy).toBe(0);
      expect(depth3Config.baseReward.xp).toBeGreaterThan(
        depth1Config.baseReward.xp
      );
      expect(depth3Config.failureConsequence.energyLoss).toBeGreaterThan(
        depth1Config.failureConsequence.energyLoss
      );
    });

    it('should throw error for invalid risk level', () => {
      expect(() =>
        RiskEventEncounter.createRiskLevelConfig('invalid' as any)
      ).toThrow('Invalid risk level');
    });
  });

  describe('legendary success mechanics', () => {
    it('should generate legendary success for extreme risk with all-or-nothing choice', () => {
      const extremeConfig = RiskEventEncounter.createRiskLevelConfig(
        'extreme',
        1
      );
      extremeConfig.successRate = 1.1; // Very high success rate to overcome -0.4 modifier (will be clamped to 1.0)

      const extremeEncounter = new RiskEventEncounter(
        'extreme-test',
        extremeConfig
      );
      const state = extremeEncounter.getState();
      const allOrNothingChoice = state.availableChoices.find(
        (c) => c.id === 'all_or_nothing'
      )!;

      extremeEncounter.selectChoice(allOrNothingChoice.id);

      // Mock Math.random to ensure success
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.1);

      const outcome = extremeEncounter.resolve();

      expect(outcome.type).toBe('success');
      expect(outcome.message).toContain('LEGENDARY SUCCESS');
      expect(outcome.reward!.energy).toBe(0);

      Math.random = originalRandom;
    });

    it('should not generate legendary success for non-extreme risk levels', () => {
      const highConfig = RiskEventEncounter.createRiskLevelConfig('high', 1);
      highConfig.successRate = 0.9; // High success rate

      const highEncounter = new RiskEventEncounter('high-test', highConfig);
      const state = highEncounter.getState();
      const highStakesChoice = state.availableChoices.find(
        (c) => c.id === 'high_stakes'
      )!;

      highEncounter.selectChoice(highStakesChoice.id);

      // Mock Math.random to ensure success
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.1);

      const outcome = highEncounter.resolve();

      expect(outcome.type).toBe('success');
      expect(outcome.message).not.toContain('LEGENDARY SUCCESS');

      Math.random = originalRandom;
    });

    it('should not generate legendary success without legendary reward configured', () => {
      const extremeConfig = RiskEventEncounter.createRiskLevelConfig(
        'extreme',
        1
      );
      extremeConfig.successRate = 0.9;
      extremeConfig.legendaryReward = undefined; // Remove legendary reward

      const extremeEncounter = new RiskEventEncounter(
        'extreme-no-legendary',
        extremeConfig
      );
      const state = extremeEncounter.getState();
      const allOrNothingChoice = state.availableChoices.find(
        (c) => c.id === 'all_or_nothing'
      )!;

      extremeEncounter.selectChoice(allOrNothingChoice.id);

      // Mock Math.random to ensure success
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.1);

      const outcome = extremeEncounter.resolve();

      expect(outcome.type).toBe('success');
      expect(outcome.message).not.toContain('LEGENDARY SUCCESS');

      Math.random = originalRandom;
    });
  });
});
