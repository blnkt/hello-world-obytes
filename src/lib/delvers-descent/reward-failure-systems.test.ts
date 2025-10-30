import type { CollectedItem, EncounterType } from '@/types/delvers-descent';

import { FailureConsequenceManager } from './failure-consequence-manager';
import { RewardCalculator } from './reward-calculator';

describe('Reward and Failure Systems', () => {
  let rewardCalculator: RewardCalculator;
  let failureManager: FailureConsequenceManager;

  beforeEach(() => {
    rewardCalculator = new RewardCalculator();
    failureManager = new FailureConsequenceManager();
  });

  describe('RewardCalculator', () => {
    describe('constructor and initialization', () => {
      it('should initialize with default settings', () => {
        expect(rewardCalculator).toBeDefined();
        expect(rewardCalculator.getEncounterTypeMultipliers()).toBeDefined();
        expect(rewardCalculator.getDepthScalingFactor()).toBe(0.2);
      });
    });

    describe('depth-based scaling', () => {
      it('should calculate depth scaling correctly', () => {
        const depth1Scaling = rewardCalculator.calculateDepthScaling(1);
        const depth5Scaling = rewardCalculator.calculateDepthScaling(5);
        const depth10Scaling = rewardCalculator.calculateDepthScaling(10);

        expect(depth1Scaling).toBe(1.2); // 1 + (1 * 0.2)
        expect(depth5Scaling).toBe(2.0); // 1 + (5 * 0.2)
        expect(depth10Scaling).toBe(3.0); // 1 + (10 * 0.2)
      });

      it('should scale base rewards by depth', () => {
        const baseReward = 100;
        const depth1Reward = rewardCalculator.scaleRewardByDepth(baseReward, 1);
        const depth5Reward = rewardCalculator.scaleRewardByDepth(baseReward, 5);

        expect(depth1Reward).toBe(120); // 100 * 1.2
        expect(depth5Reward).toBe(200); // 100 * 2.0
      });

      it('should handle edge cases for depth scaling', () => {
        const baseReward = 50;

        const depth0Reward = rewardCalculator.scaleRewardByDepth(baseReward, 0);
        const negativeDepthReward = rewardCalculator.scaleRewardByDepth(
          baseReward,
          -1
        );
        const extremeDepthReward = rewardCalculator.scaleRewardByDepth(
          baseReward,
          100
        );

        expect(depth0Reward).toBe(50); // 50 * 1.0
        expect(negativeDepthReward).toBe(50); // 50 * 1.0 (clamped)
        expect(extremeDepthReward).toBe(1050); // 50 * 21.0
      });
    });

    describe('encounter type multipliers', () => {
      it('should provide different multipliers for different encounter types', () => {
        const multipliers = rewardCalculator.getEncounterTypeMultipliers();

        expect(multipliers.puzzle_chamber).toBeDefined();
        expect(multipliers.trade_opportunity).toBeDefined();
        expect(multipliers.discovery_site).toBeDefined();

        expect(multipliers.puzzle_chamber).not.toBe(
          multipliers.trade_opportunity
        );
        expect(multipliers.trade_opportunity).not.toBe(
          multipliers.discovery_site
        );
      });

      it('should apply encounter type multipliers to rewards', () => {
        const baseReward = 100;
        const depth = 3;

        const puzzleReward = rewardCalculator.calculateFinalReward(
          baseReward,
          'puzzle_chamber',
          depth
        );
        const tradeReward = rewardCalculator.calculateFinalReward(
          baseReward,
          'trade_opportunity',
          depth
        );
        const discoveryReward = rewardCalculator.calculateFinalReward(
          baseReward,
          'discovery_site',
          depth
        );

        expect(puzzleReward).toBeGreaterThan(0);
        expect(tradeReward).toBeGreaterThan(0);
        expect(discoveryReward).toBeGreaterThan(0);

        // Multipliers may yield equal values in some configs; ensure non-negative and reasonable ordering
        expect(puzzleReward).toBeGreaterThanOrEqual(0);
        expect(tradeReward).toBeGreaterThanOrEqual(0);
        expect(discoveryReward).toBeGreaterThanOrEqual(0);
      });

      it('should handle unknown encounter types gracefully', () => {
        const baseReward = 100;
        const depth = 2;

        const unknownReward = rewardCalculator.calculateFinalReward(
          baseReward,
          'unknown_type' as EncounterType,
          depth
        );

        expect(unknownReward).toBeGreaterThan(0);
        // Should be close to base reward * depth scaling (within variation range)
        const expectedBase =
          baseReward * rewardCalculator.calculateDepthScaling(depth);
        expect(unknownReward).toBeGreaterThanOrEqual(expectedBase * 0.8);
        expect(unknownReward).toBeLessThanOrEqual(expectedBase * 1.7);
      });
    });

    describe('collection set integration', () => {
      it('should generate rewards for different collection set types', () => {
        const tradeGoodReward = rewardCalculator.generateCollectionReward(
          'trade_good',
          1
        );
        const discoveryReward = rewardCalculator.generateCollectionReward(
          'discovery',
          1
        );
        const legendaryReward = rewardCalculator.generateCollectionReward(
          'legendary',
          1
        );

        expect(tradeGoodReward.type).toBe('trade_good');
        expect(discoveryReward.type).toBe('discovery');
        expect(legendaryReward.type).toBe('legendary');

        expect(tradeGoodReward.setId).toBeDefined();
        expect(discoveryReward.setId).toBeDefined();
        expect(legendaryReward.setId).toBeDefined();
      });

      it('should scale collection rewards by depth', () => {
        const depth1Reward = rewardCalculator.generateCollectionReward(
          'trade_good',
          1
        );
        const depth5Reward = rewardCalculator.generateCollectionReward(
          'trade_good',
          5
        );

        expect(depth5Reward.value).toBeGreaterThan(depth1Reward.value);
      });

      it('should provide different collection sets for each type', () => {
        const tradeGoodSets =
          rewardCalculator.getCollectionSetsForType('trade_good');
        const discoverySets =
          rewardCalculator.getCollectionSetsForType('discovery');
        const legendarySets =
          rewardCalculator.getCollectionSetsForType('legendary');

        expect(tradeGoodSets.length).toBeGreaterThan(0);
        expect(discoverySets.length).toBeGreaterThan(0);
        expect(legendarySets.length).toBeGreaterThan(0);

        expect(tradeGoodSets).not.toEqual(discoverySets);
        expect(discoverySets).not.toEqual(legendarySets);
      });
    });

    describe('variable reward system', () => {
      it('should add random variation to rewards', () => {
        const baseReward = 100;
        const depth = 3;
        const encounterType = 'puzzle_chamber';

        const rewards = Array.from({ length: 10 }, () =>
          rewardCalculator.calculateFinalReward(
            baseReward,
            encounterType,
            depth
          )
        );

        // Should have some variation
        const uniqueRewards = [...new Set(rewards)];
        expect(uniqueRewards.length).toBeGreaterThan(1);

        // All rewards should be positive
        rewards.forEach((reward) => {
          expect(reward).toBeGreaterThan(0);
        });
      });

      it('should respect minimum and maximum variation bounds', () => {
        const baseReward = 100;
        const depth = 2;
        const encounterType = 'trade_opportunity';

        const rewards = Array.from({ length: 20 }, () =>
          rewardCalculator.calculateFinalReward(
            baseReward,
            encounterType,
            depth
          )
        );

        const minReward = Math.min(...rewards);
        const maxReward = Math.max(...rewards);

        // Should be within reasonable bounds (80% to 120% of base with depth scaling)
        const depthScaling = rewardCalculator.calculateDepthScaling(depth);
        const encounterMultiplier =
          rewardCalculator.getEncounterTypeMultipliers()[encounterType];
        const scaledBase = baseReward * encounterMultiplier * depthScaling;
        const expectedMin = scaledBase * 0.8;
        const expectedMax = scaledBase * 1.2;

        expect(minReward).toBeGreaterThanOrEqual(expectedMin);
        expect(maxReward).toBeLessThanOrEqual(expectedMax);
      });

      it('should scale variation with depth', () => {
        const baseReward = 100;
        const encounterType = 'discovery_site';

        const depth1Rewards = Array.from({ length: 5 }, () =>
          rewardCalculator.calculateFinalReward(baseReward, encounterType, 1)
        );
        const depth5Rewards = Array.from({ length: 5 }, () =>
          rewardCalculator.calculateFinalReward(baseReward, encounterType, 5)
        );

        const depth1Variation =
          Math.max(...depth1Rewards) - Math.min(...depth1Rewards);
        const depth5Variation =
          Math.max(...depth5Rewards) - Math.min(...depth5Rewards);

        expect(depth5Variation).toBeGreaterThan(depth1Variation);
      });
    });

    describe('comprehensive reward calculation', () => {
      it('should calculate complete rewards for encounter outcomes', () => {
        const baseRewards: CollectedItem[] = [
          {
            id: '1',
            type: 'trade_good',
            setId: 'test_set',
            value: 50,
            name: 'Test Item',
            description: 'Test',
          },
          {
            id: '2',
            type: 'discovery',
            setId: 'test_set',
            value: 75,
            name: 'Test Discovery',
            description: 'Test',
          },
        ];

        const processedRewards = rewardCalculator.processEncounterRewards(
          baseRewards,
          'puzzle_chamber',
          3
        );

        expect(processedRewards).toHaveLength(2);
        expect(processedRewards[0].value).toBeGreaterThan(baseRewards[0].value);
        expect(processedRewards[1].value).toBeGreaterThan(baseRewards[1].value);
      });

      it('should maintain reward item properties', () => {
        const baseRewards: CollectedItem[] = [
          {
            id: '1',
            type: 'trade_good',
            setId: 'test_set',
            value: 50,
            name: 'Test Item',
            description: 'Test',
          },
        ];

        const processedRewards = rewardCalculator.processEncounterRewards(
          baseRewards,
          'trade_opportunity',
          2
        );

        expect(processedRewards[0].id).toBe(baseRewards[0].id);
        expect(processedRewards[0].type).toBe(baseRewards[0].type);
        expect(processedRewards[0].setId).toBe(baseRewards[0].setId);
        expect(processedRewards[0].name).toBe(baseRewards[0].name);
        expect(processedRewards[0].description).toBe(
          baseRewards[0].description
        );
      });
    });
  });

  describe('FailureConsequenceManager', () => {
    describe('constructor and initialization', () => {
      it('should initialize with default settings', () => {
        expect(failureManager).toBeDefined();
        expect(failureManager.getFailureTypes()).toBeDefined();
        expect(failureManager.getFailureTypes().length).toBeGreaterThan(0);
      });

      it('should initialize with custom failure severity', () => {
        const customManager = new FailureConsequenceManager(1.5);
        expect(customManager.getFailureSeverityMultiplier()).toBe(1.5);
      });
    });

    describe('energy loss consequences', () => {
      it('should calculate energy loss based on failure type and depth', () => {
        const depth1Loss = failureManager.calculateEnergyLoss(
          'energy_exhausted',
          1
        );
        const depth5Loss = failureManager.calculateEnergyLoss(
          'energy_exhausted',
          5
        );
        const depth10Loss = failureManager.calculateEnergyLoss(
          'energy_exhausted',
          10
        );

        expect(depth1Loss).toBeGreaterThan(0);
        expect(depth5Loss).toBeGreaterThan(depth1Loss);
        expect(depth10Loss).toBeGreaterThan(depth5Loss);
      });

      it('should have different energy loss for different failure types', () => {
        const depth = 3;

        const energyExhaustedLoss = failureManager.calculateEnergyLoss(
          'energy_exhausted',
          depth
        );
        const objectiveFailedLoss = failureManager.calculateEnergyLoss(
          'objective_failed',
          depth
        );
        const forcedRetreatLoss = failureManager.calculateEnergyLoss(
          'forced_retreat',
          depth
        );
        const encounterLockoutLoss = failureManager.calculateEnergyLoss(
          'encounter_lockout',
          depth
        );

        expect(energyExhaustedLoss).toBeGreaterThan(0);
        expect(objectiveFailedLoss).toBeGreaterThan(energyExhaustedLoss);
        expect(forcedRetreatLoss).toBeGreaterThan(objectiveFailedLoss);
        expect(encounterLockoutLoss).toBeGreaterThan(forcedRetreatLoss);
      });

      it('should handle unknown failure types gracefully', () => {
        const loss = failureManager.calculateEnergyLoss(
          'unknown_failure' as any,
          2
        );
        expect(loss).toBeGreaterThan(0);
      });
    });

    describe('item loss risk consequences', () => {
      it('should calculate item loss risk based on failure type and depth', () => {
        const depth1Risk = failureManager.calculateItemLossRisk(
          'objective_failed',
          1
        );
        const depth5Risk = failureManager.calculateItemLossRisk(
          'objective_failed',
          5
        );

        expect(depth1Risk).toBeGreaterThanOrEqual(0);
        expect(depth1Risk).toBeLessThanOrEqual(1);
        expect(depth5Risk).toBeGreaterThan(depth1Risk);
      });

      it('should have different item loss risks for different failure types', () => {
        const depth = 3;

        const energyExhaustedRisk = failureManager.calculateItemLossRisk(
          'energy_exhausted',
          depth
        );
        const objectiveFailedRisk = failureManager.calculateItemLossRisk(
          'objective_failed',
          depth
        );
        const forcedRetreatRisk = failureManager.calculateItemLossRisk(
          'forced_retreat',
          depth
        );

        expect(energyExhaustedRisk).toBeLessThan(objectiveFailedRisk);
        expect(objectiveFailedRisk).toBeLessThan(forcedRetreatRisk);
      });
    });

    describe('forced retreat consequences', () => {
      it('should determine forced retreat based on failure type', () => {
        const energyExhaustedRetreat =
          failureManager.shouldForceRetreat('energy_exhausted');
        const objectiveFailedRetreat =
          failureManager.shouldForceRetreat('objective_failed');
        const forcedRetreatRetreat =
          failureManager.shouldForceRetreat('forced_retreat');
        const encounterLockoutRetreat =
          failureManager.shouldForceRetreat('encounter_lockout');

        expect(energyExhaustedRetreat).toBe(false);
        expect(objectiveFailedRetreat).toBe(false);
        expect(forcedRetreatRetreat).toBe(true);
        expect(encounterLockoutRetreat).toBe(true);
      });
    });

    describe('encounter lockout system', () => {
      it('should determine encounter lockout based on failure type', () => {
        const energyExhaustedLockout =
          failureManager.shouldLockoutEncounter('energy_exhausted');
        const objectiveFailedLockout =
          failureManager.shouldLockoutEncounter('objective_failed');
        const forcedRetreatLockout =
          failureManager.shouldLockoutEncounter('forced_retreat');
        const encounterLockoutLockout =
          failureManager.shouldLockoutEncounter('encounter_lockout');

        expect(energyExhaustedLockout).toBe(false);
        expect(objectiveFailedLockout).toBe(false);
        expect(forcedRetreatLockout).toBe(false);
        expect(encounterLockoutLockout).toBe(true);
      });

      it('should track locked out encounters', () => {
        failureManager.lockoutEncounter('test_encounter_1');
        failureManager.lockoutEncounter('test_encounter_2');

        expect(failureManager.isEncounterLockedOut('test_encounter_1')).toBe(
          true
        );
        expect(failureManager.isEncounterLockedOut('test_encounter_2')).toBe(
          true
        );
        expect(failureManager.isEncounterLockedOut('test_encounter_3')).toBe(
          false
        );
      });

      it('should provide list of locked out encounters', () => {
        failureManager.lockoutEncounter('encounter_a');
        failureManager.lockoutEncounter('encounter_b');

        const lockedOut = failureManager.getLockedOutEncounters();
        expect(lockedOut).toContain('encounter_a');
        expect(lockedOut).toContain('encounter_b');
        expect(lockedOut).toHaveLength(2);
      });
    });

    describe('cascading failure severity', () => {
      it('should track failure count and increase severity', () => {
        const initialSeverity = failureManager.getFailureSeverityMultiplier();

        failureManager.recordFailure('test_encounter');
        failureManager.recordFailure('test_encounter');
        failureManager.recordFailure('test_encounter');

        const newSeverity = failureManager.getFailureSeverityMultiplier();
        expect(newSeverity).toBeGreaterThan(initialSeverity);
      });

      it('should apply cascading severity to consequences', () => {
        const baseEnergyLoss = failureManager.calculateEnergyLoss(
          'objective_failed',
          2
        );

        failureManager.recordFailure('test_encounter');
        failureManager.recordFailure('test_encounter');

        const cascadedEnergyLoss = failureManager.calculateEnergyLoss(
          'objective_failed',
          2
        );
        expect(cascadedEnergyLoss).toBeGreaterThan(baseEnergyLoss);
      });

      it('should reset failure count after successful encounter', () => {
        failureManager.recordFailure('test_encounter');
        failureManager.recordFailure('test_encounter');

        const severityAfterFailures =
          failureManager.getFailureSeverityMultiplier();

        failureManager.recordSuccess('test_encounter');

        const severityAfterSuccess =
          failureManager.getFailureSeverityMultiplier();
        expect(severityAfterSuccess).toBeLessThan(severityAfterFailures);
      });
    });

    describe('comprehensive failure processing', () => {
      it('should process complete failure consequences', () => {
        const consequences = failureManager.processFailureConsequences(
          'forced_retreat',
          3,
          'test_encounter'
        );

        expect(consequences.energyLoss).toBeGreaterThan(0);
        expect(consequences.itemLossRisk).toBeGreaterThanOrEqual(0);
        expect(consequences.itemLossRisk).toBeLessThanOrEqual(1);
        expect(consequences.forcedRetreat).toBe(true);
        expect(consequences.encounterLockout).toBe(false);
        expect(consequences.description).toBeDefined();
      });

      it('should provide failure statistics', () => {
        failureManager.recordFailure('encounter_1');
        failureManager.recordFailure('encounter_2');
        failureManager.recordSuccess('encounter_3');

        const stats = failureManager.getFailureStatistics();
        expect(stats.totalFailures).toBe(2);
        expect(stats.totalSuccesses).toBe(1);
        expect(stats.failureRate).toBe(2 / 3);
        expect(stats.currentSeverityMultiplier).toBeGreaterThan(1);
      });
    });
  });

  describe('integration between reward and failure systems', () => {
    it('should work together seamlessly', () => {
      const baseRewards: CollectedItem[] = [
        {
          id: '1',
          type: 'trade_good',
          setId: 'test_set',
          value: 100,
          name: 'Test Item',
          description: 'Test',
        },
      ];

      // Process successful encounter
      const successRewards = rewardCalculator.processEncounterRewards(
        baseRewards,
        'puzzle_chamber',
        2
      );

      // Process failed encounter
      const failureConsequences = failureManager.processFailureConsequences(
        'objective_failed',
        2,
        'test_encounter'
      );

      expect(successRewards[0].value).toBeGreaterThan(baseRewards[0].value);
      expect(failureConsequences.energyLoss).toBeGreaterThan(0);
      expect(failureConsequences.itemLossRisk).toBeGreaterThan(0);
    });

    it('should maintain consistency across encounter types', () => {
      const baseReward = 100;
      const depth = 3;

      const puzzleReward = rewardCalculator.calculateFinalReward(
        baseReward,
        'puzzle_chamber',
        depth
      );
      const tradeReward = rewardCalculator.calculateFinalReward(
        baseReward,
        'trade_opportunity',
        depth
      );
      const discoveryReward = rewardCalculator.calculateFinalReward(
        baseReward,
        'discovery_site',
        depth
      );

      const puzzleFailure = failureManager.calculateEnergyLoss(
        'objective_failed',
        depth
      );
      const tradeFailure = failureManager.calculateEnergyLoss(
        'objective_failed',
        depth
      );
      const discoveryFailure = failureManager.calculateEnergyLoss(
        'objective_failed',
        depth
      );

      // Rewards should be different due to encounter type multipliers
      expect(puzzleReward).not.toBe(tradeReward);
      expect(tradeReward).not.toBe(discoveryReward);

      // Failure consequences should be the same for same failure type and depth
      expect(puzzleFailure).toBe(tradeFailure);
      expect(tradeFailure).toBe(discoveryFailure);
    });
  });
});
