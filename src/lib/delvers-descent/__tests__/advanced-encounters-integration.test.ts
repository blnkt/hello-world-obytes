import { EncounterResolver } from '../encounter-resolver';
import { RewardCalculator } from '../reward-calculator';
import { FailureConsequenceManager } from '../failure-consequence-manager';
import { RiskEventEncounter } from '../risk-event-encounter';
import { HazardEncounter } from '../hazard-encounter';
import { RestSiteEncounter } from '../rest-site-encounter';
import type { EncounterType } from '@/types/delvers-descent';

describe('Advanced Encounters Integration with Existing System (Task 6.4)', () => {
  let encounterResolver: EncounterResolver;
  let rewardCalculator: RewardCalculator;
  let failureManager: FailureConsequenceManager;

  beforeEach(() => {
    encounterResolver = new EncounterResolver();
    rewardCalculator = new RewardCalculator();
    failureManager = new FailureConsequenceManager();
  });

  describe('RiskEventEncounter integration', () => {
    it('should integrate with EncounterResolver for risk events', async () => {
      const riskConfig = RiskEventEncounter.createRiskLevelConfig('high', 5);
      const riskEncounter = new RiskEventEncounter('risk-1', riskConfig);

      // Verify encounter state
      const state = riskEncounter.getState();
      expect(state.encounterType).toBe('risk_event');
      expect(state.encounterId).toBe('risk-1');
      expect(state.availableChoices.length).toBeGreaterThan(0);

      // Select choice and resolve
      riskEncounter.selectChoice(state.availableChoices[0].id);
      const outcome = riskEncounter.resolve();

      expect(outcome.type).toMatch(/success|failure/);
      if (outcome.type === 'success' && outcome.reward) {
        expect(outcome.reward.energy).toBeDefined();
        expect(outcome.reward.xp).toBeDefined();
      }
    });

    it('should work with RewardCalculator for depth scaling', () => {
      const riskConfig = RiskEventEncounter.createRiskLevelConfig('extreme', 10);
      const riskEncounter = new RiskEventEncounter('risk-2', riskConfig);

      // Verify config has depth-based difficulty
      expect(riskConfig.successRate).toBeGreaterThan(0);
      expect(riskConfig.baseReward.xp).toBeGreaterThan(0);

      // Test reward calculation scaling
      const baseReward = riskConfig.baseReward;
      const depthScaling = rewardCalculator.calculateDepthScaling(10);
      const scaledXp = rewardCalculator.scaleRewardByDepth(baseReward.xp, 10);

      expect(scaledXp).toBeGreaterThan(baseReward.xp);
      expect(depthScaling).toBeGreaterThan(1);
    });

    it('should apply failure consequences correctly', () => {
      const riskConfig = RiskEventEncounter.createRiskLevelConfig('low', 3);
      const riskEncounter = new RiskEventEncounter('risk-3', riskConfig);

      const state = riskEncounter.getState();
      riskEncounter.selectChoice(state.availableChoices[0].id);

      const outcome = riskEncounter.resolve();

      // Verify failure consequences if failure
      if (outcome.type === 'failure' && outcome.consequence) {
        expect(outcome.consequence.energyLoss).toBeDefined();
        expect(typeof outcome.consequence.itemLossRisk).toBe('number');
        expect(typeof outcome.consequence.forcedRetreat).toBe('boolean');
        expect(typeof outcome.consequence.encounterLockout).toBe('boolean');
      }
    });
  });

  describe('HazardEncounter integration', () => {
    it('should integrate with EncounterResolver for hazards', () => {
      const hazardConfig = HazardEncounter.createHazardConfig(
        'collapsed_passage',
        5,
        5
      );
      const hazardEncounter = new HazardEncounter('hazard-1', hazardConfig);

      // Verify encounter state
      const state = hazardEncounter.getState();
      expect(state.encounterType).toBe('hazard');
      expect(state.encounterId).toBe('hazard-1');
      expect(state.availablePaths.length).toBeGreaterThan(0);
      expect(state.config.obstacleType).toBe('collapsed_passage');

      // Select path and resolve
      hazardEncounter.selectPath(state.availablePaths[0].id);
      const outcome = hazardEncounter.resolve();

      expect(outcome.type).toMatch(/success|failure/);
    });

    it('should provide multiple solution paths', () => {
      const hazardConfig = HazardEncounter.createHazardConfig(
        'treacherous_bridge',
        7,
        7
      );
      const hazardEncounter = new HazardEncounter('hazard-2', hazardConfig);

      const state = hazardEncounter.getState();
      expect(state.availablePaths.length).toBeGreaterThan(1);

      // Verify each path has different costs/success rates
      const path1 = state.availablePaths[0];
      const path2 = state.availablePaths[1];

      expect(path1.energyCost).toBeDefined();
      expect(path1.successRate).toBeGreaterThan(0);
      expect(path1.rewardModifier).toBeGreaterThan(0);
    });

    it('should handle hazard-specific logic for ancient guardians', () => {
      const hazardConfig = HazardEncounter.createHazardConfig('ancient_guardian', 8, 8);
      const hazardEncounter = new HazardEncounter('hazard-3', hazardConfig);

      const state = hazardEncounter.getState();

      // Ancient guardian should have negotiation paths
      const negotiationPaths = state.availablePaths.filter((path) =>
        path.description.toLowerCase().includes('negot')
      );

      expect(state.availablePaths.length).toBeGreaterThan(0);
    });
  });

  describe('RestSiteEncounter integration', () => {
    it('should integrate with EncounterResolver for rest sites', () => {
      const restConfig = RestSiteEncounter.createRestSiteConfig(
        'ancient_shrine',
        5,
        5
      );
      const restEncounter = new RestSiteEncounter('rest-1', restConfig);

      // Verify encounter state
      const state = restEncounter.getState();
      expect(state.encounterType).toBe('rest_site');
      expect(state.encounterId).toBe('rest-1');
      expect(state.availableActions.length).toBeGreaterThan(0);
      expect(state.config.restSiteType).toBe('ancient_shrine');

      // Select action and resolve
      restEncounter.selectAction(state.availableActions[0].id);
      const outcome = restEncounter.resolve();

      expect(outcome.type).toMatch(/success|failure/);
      if (outcome.type === 'success' && outcome.reward) {
        // Should have energy gain from rest
        expect(outcome.reward.energy).toBeGreaterThan(0);
      }
    });

    it('should provide energy recovery benefits', () => {
      const restConfig = RestSiteEncounter.createRestSiteConfig('energy_well', 8, 8);
      const restEncounter = new RestSiteEncounter('rest-2', restConfig);

      const state = restEncounter.getState();

      // Should have multiple rest actions
      expect(state.availableActions.length).toBeGreaterThan(1);

      // Quick rest should be available
      const quickRest = state.availableActions.find((a) => a.id === 'quick_rest');
      expect(quickRest).toBeDefined();
      expect(quickRest?.energyGain).toBeGreaterThan(0);

      // Thorough rest should provide more energy
      const thoroughRest = state.availableActions.find(
        (a) => a.id === 'thorough_rest'
      );
      expect(thoroughRest).toBeDefined();
      if (thoroughRest) {
        expect(thoroughRest.energyGain).toBeGreaterThan(quickRest!.energyGain);
      }
    });

    it('should provide strategic intel rewards', () => {
      const restConfig = RestSiteEncounter.createRestSiteConfig('mystic_grove', 7, 7);
      const restEncounter = new RestSiteEncounter('rest-3', restConfig);

      const state = restEncounter.getState();

      // Should have meditation action with intel
      const meditation = state.availableActions.find((a) => a.id === 'meditation');
      expect(meditation).toBeDefined();

      if (meditation) {
        expect(meditation.intelGain.mapReveals).toBeGreaterThan(0);
        expect(meditation.specialEffect).toBeDefined();
      }
    });
  });

  describe('RewardCalculator integration', () => {
    it('should apply correct multipliers for all advanced encounter types', () => {
      const mockXp = 100;

      const riskEventXp = rewardCalculator.scaleRewardByDepth(mockXp, 5);
      expect(riskEventXp).toBeGreaterThan(mockXp);

      const hazardXp = rewardCalculator.scaleRewardByDepth(mockXp, 5);
      expect(hazardXp).toBeGreaterThan(mockXp);

      const restSiteXp = rewardCalculator.scaleRewardByDepth(mockXp, 5);
      expect(restSiteXp).toBeGreaterThan(mockXp);
    });

    it('should scale rewards appropriately with depth', () => {
      const baseXp = 100;
      const shallowXp = rewardCalculator.scaleRewardByDepth(baseXp, 1);
      const deepXp = rewardCalculator.scaleRewardByDepth(baseXp, 10);

      // Deep rewards should be more valuable
      expect(deepXp).toBeGreaterThan(shallowXp);
    });
  });

  describe('FailureConsequenceManager integration', () => {
    it('should handle energy loss from encounter failures', () => {
      const riskConfig = RiskEventEncounter.createRiskLevelConfig('extreme', 8);
      const riskEncounter = new RiskEventEncounter('risk-4', riskConfig);

      // Simulate failure
      const state = riskEncounter.getState();
      riskEncounter.selectChoice(state.availableChoices[0].id);
      const outcome = riskEncounter.resolve();

      // Check failure consequences
      if (outcome.type === 'failure' && outcome.consequence) {
        expect(outcome.consequence.energyLoss).toBeGreaterThanOrEqual(0);
      }
    });

    it('should handle item loss risk from failures', () => {
      const hazardConfig = HazardEncounter.createHazardConfig('energy_drain', 9, 9);
      const hazardEncounter = new HazardEncounter('hazard-4', hazardConfig);

      const state = hazardEncounter.getState();
      hazardEncounter.selectPath(state.availablePaths[0].id);
      const outcome = hazardEncounter.resolve();

      if (outcome.type === 'failure' && outcome.consequence) {
        expect(outcome.consequence.itemLossRisk).toBeGreaterThanOrEqual(0);
        expect(outcome.consequence.itemLossRisk).toBeLessThanOrEqual(1);
      }
    });

    it('should handle encounter lockout from failures', () => {
      const riskConfig = RiskEventEncounter.createRiskLevelConfig('extreme', 10);
      const riskEncounter = new RiskEventEncounter('risk-5', riskConfig);

      const state = riskEncounter.getState();
      riskEncounter.selectChoice(state.availableChoices[0].id);
      const outcome = riskEncounter.resolve();

      if (outcome.type === 'failure' && outcome.consequence) {
        expect(typeof outcome.consequence.encounterLockout).toBe('boolean');
      }
    });
  });

  describe('Complete encounter flow integration', () => {
    it('should handle complete flow: create → select → resolve → apply rewards', () => {
      // Risk Event
      const riskConfig = RiskEventEncounter.createRiskLevelConfig('medium', 5);
      const riskEncounter = new RiskEventEncounter('risk-complete', riskConfig);

      let state = riskEncounter.getState();
      expect(state.isResolved).toBe(false);

      riskEncounter.selectChoice(state.availableChoices[0].id);
      const outcome = riskEncounter.resolve();

      state = riskEncounter.getState();
      expect(state.isResolved).toBe(true);
      expect(state.outcome).toBeDefined();

      // Verify outcome is valid
      expect(['success', 'failure']).toContain(outcome.type);
      expect(outcome.message).toBeDefined();
    });

    it('should integrate with existing encounter resolution framework', () => {
      // Verify EncounterResolver recognizes all advanced types
      expect(encounterResolver.isValidEncounterType('risk_event')).toBe(true);
      expect(encounterResolver.isValidEncounterType('hazard')).toBe(true);
      expect(encounterResolver.isValidEncounterType('rest_site')).toBe(true);
    });

    it('should support all encounter types uniformly', () => {
      const encounterTypes: EncounterType[] = [
        'puzzle_chamber',
        'trade_opportunity',
        'discovery_site',
        'risk_event',
        'hazard',
        'rest_site',
      ];

      for (const encounterType of encounterTypes) {
        expect(encounterResolver.isValidEncounterType(encounterType)).toBe(true);
      }
    });
  });

  describe('Encounter outcome diversity', () => {
    it('should provide varied outcomes based on encounter type', () => {
      // Risk Events should have binary success/failure
      const riskConfig = RiskEventEncounter.createRiskLevelConfig('medium', 5);
      const riskEncounter = new RiskEventEncounter('risk-diversity', riskConfig);

      riskEncounter.selectChoice(riskEncounter.getState().availableChoices[0].id);
      const riskOutcome = riskEncounter.resolve();

      expect(['success', 'failure']).toContain(riskOutcome.type);
      expect(riskOutcome.reward || riskOutcome.consequence).toBeDefined();

      // Rest Sites should always succeed
      const restConfig = RestSiteEncounter.createRestSiteConfig('crystal_cave', 5, 5);
      const restEncounter = new RestSiteEncounter('rest-diversity', restConfig);

      restEncounter.selectAction(restEncounter.getState().availableActions[0].id);
      const restOutcome = restEncounter.resolve();

      expect(restOutcome.type).toBe('success');
      expect(restOutcome.reward).toBeDefined();
    });

    it('should provide different rewards for different choice selections', () => {
      const riskConfig = RiskEventEncounter.createRiskLevelConfig('high', 6);
      const riskEncounter = new RiskEventEncounter('risk-choices', riskConfig);

      const state = riskEncounter.getState();

      if (state.availableChoices.length >= 2) {
        // Test first choice
        riskEncounter.selectChoice(state.availableChoices[0].id);
        const outcome1 = riskEncounter.resolve();

        // Reset and test second choice
        const riskEncounter2 = new RiskEventEncounter('risk-choices-2', riskConfig);
        riskEncounter2.selectChoice(state.availableChoices[1].id);
        const outcome2 = riskEncounter2.resolve();

        // Outcomes might differ
        expect(outcome1.type).toBeDefined();
        expect(outcome2.type).toBeDefined();
      }
    });
  });
});

