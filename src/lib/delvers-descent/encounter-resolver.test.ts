import type {
  EncounterOutcome,
  EncounterState,
  EncounterType,
} from '@/types/delvers-descent';

import { EncounterResolver } from './encounter-resolver';

describe('EncounterResolver', () => {
  let encounterResolver: EncounterResolver;

  beforeEach(() => {
    encounterResolver = new EncounterResolver();
    // Clear any persisted state between tests
    encounterResolver.clearPersistedState();
    encounterResolver.clearEncounterState();
  });

  describe('constructor', () => {
    it('should initialize with empty state', () => {
      expect(encounterResolver.getCurrentState()).toBeNull();
      expect(encounterResolver.isEncounterActive()).toBe(false);
    });
  });

  describe('startEncounter', () => {
    it('should start an encounter with given parameters', () => {
      const encounterData = {
        type: 'puzzle_chamber' as EncounterType,
        nodeId: 'node-1',
        depth: 1,
        energyCost: 15,
      };

      encounterResolver.startEncounter(encounterData);

      const state = encounterResolver.getCurrentState();
      expect(state).not.toBeNull();
      expect(state?.type).toBe('puzzle_chamber');
      expect(state?.nodeId).toBe('node-1');
      expect(state?.depth).toBe(1);
      expect(state?.energyCost).toBe(15);
      expect(state?.status).toBe('active');
      expect(encounterResolver.isEncounterActive()).toBe(true);
    });

    it('should throw error if encounter is already active', () => {
      const encounterData = {
        type: 'puzzle_chamber' as EncounterType,
        nodeId: 'node-1',
        depth: 1,
        energyCost: 15,
      };

      encounterResolver.startEncounter(encounterData);

      expect(() => {
        encounterResolver.startEncounter(encounterData);
      }).toThrow('Encounter is already active');
    });
  });

  describe('updateEncounterProgress', () => {
    beforeEach(() => {
      const encounterData = {
        type: 'puzzle_chamber' as EncounterType,
        nodeId: 'node-1',
        depth: 1,
        energyCost: 15,
      };
      encounterResolver.startEncounter(encounterData);
    });

    it('should update encounter progress', () => {
      const progressData = {
        tilesRevealed: 3,
        tilesRemaining: 7,
        currentObjective: 'Find the exit tile',
      };

      encounterResolver.updateEncounterProgress(progressData);

      const state = encounterResolver.getCurrentState();
      expect(state?.progress).toEqual(progressData);
    });

    it('should throw error if no encounter is active', () => {
      const outcome: EncounterOutcome = {
        success: true,
        rewards: [],
        energyUsed: 15,
        itemsGained: [],
        itemsLost: [],
      };
      encounterResolver.completeEncounter('success', outcome);

      expect(() => {
        encounterResolver.updateEncounterProgress({ tilesRevealed: 1 });
      }).toThrow('No active encounter');
    });
  });

  describe('completeEncounter', () => {
    beforeEach(() => {
      const encounterData = {
        type: 'puzzle_chamber' as EncounterType,
        nodeId: 'node-1',
        depth: 1,
        energyCost: 15,
      };
      encounterResolver.startEncounter(encounterData);
    });

    it('should complete encounter with success outcome', () => {
      const outcome: EncounterOutcome = {
        success: true,
        rewards: [
          {
            id: 'reward-1',
            type: 'trade_good',
            setId: 'set-1',
            value: 100,
            name: 'Test Reward',
            description: 'A test reward item',
          },
        ],
        energyUsed: 15,
        itemsGained: [],
        itemsLost: [],
      };

      encounterResolver.completeEncounter('success', outcome);

      const state = encounterResolver.getCurrentState();
      expect(state).toBeNull(); // Current state should be cleared
      expect(encounterResolver.isEncounterActive()).toBe(false);

      // Check history for completed encounter
      const history = encounterResolver.getEncounterHistory();
      expect(history).toHaveLength(1);
      expect(history[0].status).toBe('completed');
      expect(history[0].outcome).toEqual(outcome);
    });

    it('should complete encounter with failure outcome', () => {
      const outcome: EncounterOutcome = {
        success: false,
        rewards: [],
        energyUsed: 15,
        itemsGained: [],
        itemsLost: [],
        failureType: 'energy_exhausted',
      };

      encounterResolver.completeEncounter('failure', outcome);

      const state = encounterResolver.getCurrentState();
      expect(state).toBeNull(); // Current state should be cleared
      expect(encounterResolver.isEncounterActive()).toBe(false);

      // Check history for failed encounter
      const history = encounterResolver.getEncounterHistory();
      expect(history).toHaveLength(1);
      expect(history[0].status).toBe('failed');
      expect(history[0].outcome).toEqual(outcome);
    });

    it('should throw error if no encounter is active', () => {
      const outcome: EncounterOutcome = {
        success: true,
        rewards: [],
        energyUsed: 15,
        itemsGained: [],
        itemsLost: [],
      };
      encounterResolver.completeEncounter('success', outcome);

      expect(() => {
        encounterResolver.completeEncounter('success', outcome);
      }).toThrow('No active encounter');
    });
  });

  describe('getEncounterHistory', () => {
    it('should return empty array initially', () => {
      expect(encounterResolver.getEncounterHistory()).toEqual([]);
    });

    it('should return completed encounters', () => {
      const encounterData = {
        type: 'puzzle_chamber' as EncounterType,
        nodeId: 'node-1',
        depth: 1,
        energyCost: 15,
      };

      encounterResolver.startEncounter(encounterData);
      encounterResolver.completeEncounter('success', {
        success: true,
        rewards: [],
        energyUsed: 15,
        itemsGained: [],
        itemsLost: [],
      });

      const history = encounterResolver.getEncounterHistory();
      expect(history).toHaveLength(1);
      expect(history[0].type).toBe('puzzle_chamber');
      expect(history[0].status).toBe('completed');
    });
  });

  describe('encounter type detection and routing', () => {
    it('should detect puzzle chamber encounter type', () => {
      const encounterData = {
        type: 'puzzle_chamber' as EncounterType,
        nodeId: 'node-1',
        depth: 1,
        energyCost: 15,
      };

      encounterResolver.startEncounter(encounterData);
      const state = encounterResolver.getCurrentState();

      expect(state?.type).toBe('puzzle_chamber');
      expect(encounterResolver.getEncounterType()).toBe('puzzle_chamber');
    });

    it('should detect discovery site encounter type', () => {
      const encounterData = {
        type: 'discovery_site' as EncounterType,
        nodeId: 'node-3',
        depth: 3,
        energyCost: 25,
      };

      encounterResolver.startEncounter(encounterData);
      const state = encounterResolver.getCurrentState();

      expect(state?.type).toBe('discovery_site');
      expect(encounterResolver.getEncounterType()).toBe('discovery_site');
    });

    it('should return null for encounter type when no encounter is active', () => {
      expect(encounterResolver.getEncounterType()).toBeNull();
    });

    it('should route puzzle chamber encounters to appropriate handler', () => {
      const encounterData = {
        type: 'puzzle_chamber' as EncounterType,
        nodeId: 'node-1',
        depth: 1,
        energyCost: 15,
      };

      encounterResolver.startEncounter(encounterData);
      const handler = encounterResolver.getEncounterHandler();

      expect(handler).toBe('puzzle_chamber_handler');
    });

    it('should route trade opportunity encounters to appropriate handler', () => {
      const encounterData = {
        type: 'discovery_site' as EncounterType,
        nodeId: 'node-2',
        depth: 2,
        energyCost: 20,
      };

      encounterResolver.startEncounter(encounterData);
      const handler = encounterResolver.getEncounterHandler();

      expect(handler).toBe('discovery_site_handler');
    });

    it('should route discovery site encounters to appropriate handler', () => {
      const encounterData = {
        type: 'discovery_site' as EncounterType,
        nodeId: 'node-3',
        depth: 3,
        energyCost: 25,
      };

      encounterResolver.startEncounter(encounterData);
      const handler = encounterResolver.getEncounterHandler();

      expect(handler).toBe('discovery_site_handler');
    });

    it('should return null for handler when no encounter is active', () => {
      expect(encounterResolver.getEncounterHandler()).toBeNull();
    });

    it('should validate encounter type against supported types', () => {
      expect(encounterResolver.isValidEncounterType('puzzle_chamber')).toBe(
        true
      );
      expect(encounterResolver.isValidEncounterType('discovery_site')).toBe(
        true
      );
      expect(encounterResolver.isValidEncounterType('discovery_site')).toBe(
        true
      );
      expect(encounterResolver.isValidEncounterType('risk_event')).toBe(true);
      expect(encounterResolver.isValidEncounterType('hazard')).toBe(true);
      expect(encounterResolver.isValidEncounterType('rest_site')).toBe(true);
      expect(encounterResolver.isValidEncounterType('invalid_type')).toBe(
        false
      );
    });

    it('should route risk event encounters to appropriate handler', () => {
      const encounterData = {
        type: 'risk_event' as EncounterType,
        nodeId: 'node-4',
        depth: 3,
        energyCost: 30,
      };

      encounterResolver.startEncounter(encounterData);
      const handler = encounterResolver.getEncounterHandler();

      expect(handler).toBe('risk_event_handler');
    });

    it('should route hazard encounters to appropriate handler', () => {
      const encounterData = {
        type: 'hazard' as EncounterType,
        nodeId: 'node-5',
        depth: 4,
        energyCost: 35,
      };

      encounterResolver.startEncounter(encounterData);
      const handler = encounterResolver.getEncounterHandler();

      expect(handler).toBe('hazard_handler');
    });

    it('should route rest site encounters to appropriate handler', () => {
      const encounterData = {
        type: 'rest_site' as EncounterType,
        nodeId: 'node-6',
        depth: 5,
        energyCost: 10,
      };

      encounterResolver.startEncounter(encounterData);
      const handler = encounterResolver.getEncounterHandler();

      expect(handler).toBe('rest_site_handler');
    });
  });

  describe('encounter progress tracking and persistence', () => {
    it('should track encounter progress with detailed state', () => {
      const encounterData = {
        type: 'puzzle_chamber' as EncounterType,
        nodeId: 'node-1',
        depth: 1,
        energyCost: 15,
      };

      encounterResolver.startEncounter(encounterData);

      const progressData = {
        tilesRevealed: 5,
        tilesRemaining: 5,
        currentObjective: 'Find the exit tile',
        attempts: 3,
        hintsUsed: 1,
      };

      encounterResolver.updateEncounterProgress(progressData);
      const state = encounterResolver.getCurrentState();

      expect(state?.progress).toEqual(progressData);
      expect(state?.status).toBe('active');
    });

    it('should persist encounter state across resolver instances', () => {
      const encounterData = {
        type: 'discovery_site' as EncounterType,
        nodeId: 'node-2',
        depth: 2,
        energyCost: 20,
      };

      encounterResolver.startEncounter(encounterData);
      encounterResolver.updateEncounterProgress({
        tradeOptions: ['buy', 'sell', 'trade'],
        selectedOption: 'buy',
        negotiationAttempts: 2,
      });

      // Simulate persistence by creating a new resolver instance
      const newResolver = new EncounterResolver();
      newResolver.loadEncounterState(encounterResolver.getCurrentState());

      const state = newResolver.getCurrentState();
      expect(state?.type).toBe('discovery_site');
      expect(state?.progress?.selectedOption).toBe('buy');
      expect(state?.progress?.negotiationAttempts).toBe(2);
    });

    it('should track encounter duration', () => {
      const encounterData = {
        type: 'discovery_site' as EncounterType,
        nodeId: 'node-3',
        depth: 3,
        energyCost: 25,
      };

      encounterResolver.startEncounter(encounterData);
      const startTime = encounterResolver.getEncounterStartTime();

      expect(startTime).toBeGreaterThan(0);
      expect(startTime).toBeLessThanOrEqual(Date.now());
    });

    it('should calculate encounter duration when completed', () => {
      const encounterData = {
        type: 'puzzle_chamber' as EncounterType,
        nodeId: 'node-1',
        depth: 1,
        energyCost: 15,
      };

      encounterResolver.startEncounter(encounterData);
      const startTime = encounterResolver.getEncounterStartTime();

      // Simulate some time passing
      setTimeout(() => {
        const outcome: EncounterOutcome = {
          success: true,
          rewards: [],
          energyUsed: 15,
          itemsGained: [],
          itemsLost: [],
        };

        encounterResolver.completeEncounter('success', outcome);
        const duration = encounterResolver.getEncounterDuration();

        expect(duration).toBeGreaterThan(0);
        expect(duration).toBeLessThanOrEqual(Date.now() - (startTime || 0));
      }, 10);
    });

    it('should save encounter state to storage', () => {
      const encounterData = {
        type: 'puzzle_chamber' as EncounterType,
        nodeId: 'node-1',
        depth: 1,
        energyCost: 15,
      };

      encounterResolver.startEncounter(encounterData);
      encounterResolver.updateEncounterProgress({ tilesRevealed: 3 });

      encounterResolver.saveEncounterState();

      // Verify state was saved (this would integrate with actual storage)
      expect(encounterResolver.getCurrentState()).not.toBeNull();
    });

    it('should load encounter state from storage', () => {
      const savedState: EncounterState = {
        id: 'encounter-123',
        type: 'discovery_site',
        nodeId: 'node-3',
        depth: 3,
        energyCost: 25,
        status: 'active',
        progress: {
          explorationChoices: ['ruins', 'cave', 'tower'],
          selectedChoice: 'ruins',
          discoveries: ['ancient_artifact'],
        },
        startTime: Date.now() - 5000, // 5 seconds ago
      };

      encounterResolver.loadEncounterState(savedState);

      const state = encounterResolver.getCurrentState();
      expect(state?.id).toBe('encounter-123');
      expect(state?.type).toBe('discovery_site');
      expect(state?.progress?.selectedChoice).toBe('ruins');
      expect(state?.progress?.discoveries).toEqual(['ancient_artifact']);
    });

    it('should clear persisted state when encounter is completed', () => {
      const encounterData = {
        type: 'discovery_site' as EncounterType,
        nodeId: 'node-2',
        depth: 2,
        energyCost: 20,
      };

      encounterResolver.startEncounter(encounterData);
      encounterResolver.updateEncounterProgress({ tradeCompleted: true });

      const outcome: EncounterOutcome = {
        success: true,
        rewards: [],
        energyUsed: 20,
        itemsGained: [],
        itemsLost: [],
      };

      encounterResolver.completeEncounter('success', outcome);
      encounterResolver.clearPersistedState();

      // After clearing, loading should return null
      const loadedState = encounterResolver.loadPersistedState();
      expect(loadedState).toBeNull();
    });

    it('should handle corrupted persisted state gracefully', () => {
      // Simulate corrupted state
      const corruptedState = {
        id: 'corrupted-encounter',
        type: 'invalid_type',
        nodeId: null,
        depth: 'not_a_number',
        energyCost: undefined,
        status: 'unknown_status',
        startTime: 'invalid_date',
      };

      encounterResolver.loadEncounterState(corruptedState as any);

      // Should handle gracefully and not crash
      const state = encounterResolver.getCurrentState();
      expect(state).toBeNull();
    });
  });

  describe('encounter outcome processing system', () => {
    it('should process successful encounter outcomes with rewards', () => {
      const encounterData = {
        type: 'puzzle_chamber' as EncounterType,
        nodeId: 'node-1',
        depth: 2,
        energyCost: 20,
      };

      encounterResolver.startEncounter(encounterData);

      const outcome: EncounterOutcome = {
        success: true,
        rewards: [
          {
            id: 'reward-1',
            type: 'trade_good',
            setId: 'gems',
            value: 150,
            name: 'Ancient Gem',
            description: 'A valuable gem found in the chamber',
          },
        ],
        energyUsed: 20,
        itemsGained: [],
        itemsLost: [],
      };

      const processedOutcome =
        encounterResolver.processEncounterOutcome(outcome);

      expect(processedOutcome.success).toBe(true);
      expect(processedOutcome.rewards).toHaveLength(1);
      expect(processedOutcome.rewards[0].value).toBeGreaterThan(150); // Should be scaled by depth
      expect(processedOutcome.totalRewardValue).toBeGreaterThan(150);
    });

    it('should process failed encounter outcomes with consequences', () => {
      const encounterData = {
        type: 'discovery_site' as EncounterType,
        nodeId: 'node-2',
        depth: 3,
        energyCost: 25,
      };

      encounterResolver.startEncounter(encounterData);

      const outcome: EncounterOutcome = {
        success: false,
        rewards: [],
        energyUsed: 25,
        itemsGained: [],
        itemsLost: [
          {
            id: 'item-1',
            type: 'trade_good',
            setId: 'coins',
            value: 50,
            name: 'Gold Coin',
            description: 'Lost during failed negotiation',
          },
        ],
        failureType: 'objective_failed',
      };

      const processedOutcome =
        encounterResolver.processEncounterOutcome(outcome);

      expect(processedOutcome.success).toBe(false);
      expect(processedOutcome.failureType).toBe('objective_failed');
      expect(processedOutcome.consequences).toBeDefined();
      expect(processedOutcome.consequences?.energyLoss).toBeGreaterThan(0);
    });

    it('should calculate depth-based reward scaling', () => {
      const baseReward = 100;
      const depth1Scaling = encounterResolver.calculateRewardScaling(1);
      const depth3Scaling = encounterResolver.calculateRewardScaling(3);
      const depth5Scaling = encounterResolver.calculateRewardScaling(5);

      expect(depth1Scaling).toBeCloseTo(1.2, 1); // 1 + (1 * 0.2) = 1.2
      expect(depth3Scaling).toBeCloseTo(1.6, 1); // 1 + (3 * 0.2) = 1.6
      expect(depth5Scaling).toBeCloseTo(2.0, 1); // 1 + (5 * 0.2) = 2.0

      const scaledReward1 = encounterResolver.scaleRewardByDepth(baseReward, 1);
      const scaledReward3 = encounterResolver.scaleRewardByDepth(baseReward, 3);
      const scaledReward5 = encounterResolver.scaleRewardByDepth(baseReward, 5);

      expect(scaledReward1).toBeCloseTo(120, 0);
      expect(scaledReward3).toBeCloseTo(160, 0);
      expect(scaledReward5).toBeCloseTo(200, 0);
    });

    it('should apply encounter type multipliers to rewards', () => {
      const baseReward = 100;
      const depth = 2;

      const puzzleChamberMultiplier =
        encounterResolver.getEncounterTypeMultiplier('puzzle_chamber');
      const discoveryMultiplier =
        encounterResolver.getEncounterTypeMultiplier('discovery_site');
      const riskMultiplier =
        encounterResolver.getEncounterTypeMultiplier('risk_event');

      expect(puzzleChamberMultiplier).toBeGreaterThan(0);
      expect(discoveryMultiplier).toBeGreaterThan(0);
      expect(riskMultiplier).toBeGreaterThan(0);

      const puzzleReward = encounterResolver.calculateFinalReward(
        baseReward,
        'puzzle_chamber',
        depth
      );
      const discoveryReward = encounterResolver.calculateFinalReward(
        baseReward,
        'discovery_site',
        depth
      );
      const riskReward = encounterResolver.calculateFinalReward(
        baseReward,
        'risk_event',
        depth
      );

      expect(puzzleReward).toBeGreaterThan(baseReward);
      expect(discoveryReward).toBeGreaterThan(baseReward);
      expect(riskReward).toBeGreaterThan(baseReward);
    });

    it('should handle failure consequences with different severity levels', () => {
      const mildFailure = encounterResolver.calculateFailureConsequences(
        'energy_exhausted',
        2
      );
      const severeFailure = encounterResolver.calculateFailureConsequences(
        'forced_retreat',
        2
      );
      const criticalFailure = encounterResolver.calculateFailureConsequences(
        'encounter_lockout',
        2
      );

      expect(mildFailure.energyLoss).toBeGreaterThan(0);
      expect(mildFailure.itemLossRisk).toBeLessThan(0.5);

      expect(severeFailure.energyLoss).toBeGreaterThan(mildFailure.energyLoss);
      expect(severeFailure.itemLossRisk).toBeGreaterThan(
        mildFailure.itemLossRisk
      );

      expect(criticalFailure.energyLoss).toBeGreaterThan(
        severeFailure.energyLoss
      );
      expect(criticalFailure.itemLossRisk).toBeGreaterThan(
        severeFailure.itemLossRisk
      );
      expect(criticalFailure.encounterLockout).toBe(true);
    });

    it('should generate random reward variations within depth ranges', () => {
      const baseReward = 100;
      const depth = 2;

      // Generate multiple rewards to test variation
      const rewards = Array.from({ length: 10 }, () =>
        encounterResolver.generateRandomRewardVariation(baseReward, depth)
      );

      // All rewards should be within reasonable bounds
      rewards.forEach((reward) => {
        expect(reward).toBeGreaterThan(baseReward * 0.8); // At least 80% of base
        expect(reward).toBeLessThan(baseReward * 2.0); // At most 200% of base
      });

      // Should have some variation (not all identical)
      const uniqueRewards = new Set(rewards);
      expect(uniqueRewards.size).toBeGreaterThan(1);
    });

    it('should validate encounter outcomes before processing', () => {
      const validOutcome: EncounterOutcome = {
        success: true,
        rewards: [],
        energyUsed: 20,
        itemsGained: [],
        itemsLost: [],
      };

      const invalidOutcome = {
        success: true,
        // Missing required fields
      } as any;

      expect(encounterResolver.validateEncounterOutcome(validOutcome)).toBe(
        true
      );
      expect(encounterResolver.validateEncounterOutcome(invalidOutcome)).toBe(
        false
      );
    });

    it('should track encounter statistics after processing', () => {
      const encounterData = {
        type: 'puzzle_chamber' as EncounterType,
        nodeId: 'node-1',
        depth: 1,
        energyCost: 15,
      };

      encounterResolver.startEncounter(encounterData);

      const outcome: EncounterOutcome = {
        success: true,
        rewards: [],
        energyUsed: 15,
        itemsGained: [],
        itemsLost: [],
      };

      encounterResolver.processEncounterOutcome(outcome);

      const stats = encounterResolver.getEncounterStatistics();
      expect(stats.totalEncounters).toBeGreaterThan(0);
      expect(stats.successfulEncounters).toBeGreaterThan(0);
      expect(stats.averageRewardValue).toBeGreaterThanOrEqual(0);
    });
  });

  describe('encounter state transitions', () => {
    it('should validate state transitions from inactive to active', () => {
      const encounterData = {
        type: 'puzzle_chamber' as EncounterType,
        nodeId: 'node-1',
        depth: 1,
        energyCost: 15,
      };

      // Should be able to start from inactive state
      expect(encounterResolver.canStartEncounter()).toBe(true);

      encounterResolver.startEncounter(encounterData);

      // Should not be able to start another encounter
      expect(encounterResolver.canStartEncounter()).toBe(false);
      expect(encounterResolver.getCurrentState()?.status).toBe('active');
    });

    it('should validate state transitions from active to progress', () => {
      const encounterData = {
        type: 'discovery_site' as EncounterType,
        nodeId: 'node-2',
        depth: 2,
        energyCost: 20,
      };

      encounterResolver.startEncounter(encounterData);

      // Should be able to update progress in active state
      expect(encounterResolver.canUpdateProgress()).toBe(true);

      encounterResolver.updateEncounterProgress({
        tradeOptions: ['buy', 'sell'],
        selectedOption: 'buy',
      });

      const state = encounterResolver.getCurrentState();
      expect(state?.status).toBe('active');
      expect(state?.progress?.selectedOption).toBe('buy');
    });

    it('should validate state transitions from active to completed', () => {
      const encounterData = {
        type: 'discovery_site' as EncounterType,
        nodeId: 'node-3',
        depth: 3,
        energyCost: 25,
      };

      encounterResolver.startEncounter(encounterData);

      // Should be able to complete from active state
      expect(encounterResolver.canCompleteEncounter()).toBe(true);

      const outcome: EncounterOutcome = {
        success: true,
        rewards: [],
        energyUsed: 25,
        itemsGained: [],
        itemsLost: [],
      };

      encounterResolver.completeEncounter('success', outcome);

      // Should be back to inactive state
      expect(encounterResolver.getCurrentState()).toBeNull();
      expect(encounterResolver.canStartEncounter()).toBe(true);
    });

    it('should validate state transitions from active to failed', () => {
      const encounterData = {
        type: 'puzzle_chamber' as EncounterType,
        nodeId: 'node-1',
        depth: 1,
        energyCost: 15,
      };

      encounterResolver.startEncounter(encounterData);

      const outcome: EncounterOutcome = {
        success: false,
        rewards: [],
        energyUsed: 15,
        itemsGained: [],
        itemsLost: [],
        failureType: 'energy_exhausted',
      };

      encounterResolver.completeEncounter('failure', outcome);

      // Should be back to inactive state
      expect(encounterResolver.getCurrentState()).toBeNull();
      expect(encounterResolver.canStartEncounter()).toBe(true);
    });

    it('should prevent invalid state transitions', () => {
      // Should not be able to update progress without active encounter
      expect(encounterResolver.canUpdateProgress()).toBe(false);

      // Should not be able to complete without active encounter
      expect(encounterResolver.canCompleteEncounter()).toBe(false);

      const outcome: EncounterOutcome = {
        success: true,
        rewards: [],
        energyUsed: 15,
        itemsGained: [],
        itemsLost: [],
      };

      // Should throw error when trying to complete without active encounter
      expect(() => {
        encounterResolver.completeEncounter('success', outcome);
      }).toThrow('No active encounter');
    });

    it('should track state transition history', () => {
      const encounterData = {
        type: 'puzzle_chamber' as EncounterType,
        nodeId: 'node-1',
        depth: 1,
        energyCost: 15,
      };

      encounterResolver.startEncounter(encounterData);
      encounterResolver.updateEncounterProgress({ tilesRevealed: 3 });

      const outcome: EncounterOutcome = {
        success: true,
        rewards: [],
        energyUsed: 15,
        itemsGained: [],
        itemsLost: [],
      };

      encounterResolver.completeEncounter('success', outcome);

      const history = encounterResolver.getEncounterHistory();
      expect(history).toHaveLength(1);
      expect(history[0].status).toBe('completed');
      expect(history[0].progress?.tilesRevealed).toBe(3);
    });

    it('should handle state transition errors gracefully', () => {
      const encounterData = {
        type: 'discovery_site' as EncounterType,
        nodeId: 'node-2',
        depth: 2,
        energyCost: 20,
      };

      encounterResolver.startEncounter(encounterData);

      // Should handle invalid progress data
      expect(() => {
        encounterResolver.updateEncounterProgress(null as any);
      }).toThrow();

      // Should handle invalid outcome data
      expect(() => {
        encounterResolver.completeEncounter('success', null as any);
      }).toThrow();
    });

    it('should validate encounter data before state transitions', () => {
      const invalidEncounterData = {
        type: 'invalid_type' as any,
        nodeId: '',
        depth: -1,
        energyCost: 0,
      };

      // Should throw error for invalid encounter data
      expect(() => {
        encounterResolver.startEncounter(invalidEncounterData);
      }).toThrow();
    });

    it('should enforce encounter state consistency', () => {
      const encounterData = {
        type: 'discovery_site' as EncounterType,
        nodeId: 'node-3',
        depth: 3,
        energyCost: 25,
      };

      encounterResolver.startEncounter(encounterData);

      const state = encounterResolver.getCurrentState();
      expect(state).not.toBeNull();
      expect(state?.status).toBe('active');
      expect(state?.type).toBe('discovery_site');
      expect(state?.depth).toBe(3);
      expect(state?.energyCost).toBe(25);

      // State should remain consistent throughout encounter
      encounterResolver.updateEncounterProgress({
        explorationChoices: ['ruins'],
      });

      const updatedState = encounterResolver.getCurrentState();
      expect(updatedState?.status).toBe('active');
      expect(updatedState?.type).toBe('discovery_site');
      expect(updatedState?.depth).toBe(3);
      expect(updatedState?.energyCost).toBe(25);
    });

    it('should handle concurrent state transition attempts', () => {
      const encounterData = {
        type: 'puzzle_chamber' as EncounterType,
        nodeId: 'node-1',
        depth: 1,
        energyCost: 15,
      };

      encounterResolver.startEncounter(encounterData);

      // Should prevent multiple simultaneous state changes
      expect(() => {
        encounterResolver.startEncounter(encounterData);
      }).toThrow('Encounter is already active');

      // Should allow normal progression
      encounterResolver.updateEncounterProgress({ tilesRevealed: 1 });
      expect(encounterResolver.getCurrentState()?.progress?.tilesRevealed).toBe(
        1
      );
    });
  });

  describe('comprehensive unit tests and edge cases', () => {
    it('should handle extreme depth values correctly', () => {
      const extremeDepthData = {
        type: 'puzzle_chamber' as EncounterType,
        nodeId: 'node-extreme',
        depth: 100,
        energyCost: 1000,
      };

      encounterResolver.startEncounter(extremeDepthData);

      const outcome: EncounterOutcome = {
        success: true,
        rewards: [
          {
            id: 'reward-extreme',
            type: 'trade_good',
            setId: 'gems',
            value: 100,
            name: 'Extreme Gem',
            description: 'A gem from extreme depth',
          },
        ],
        energyUsed: 1000,
        itemsGained: [],
        itemsLost: [],
      };

      const processedOutcome =
        encounterResolver.processEncounterOutcome(outcome);

      // Should handle extreme depth scaling
      expect(processedOutcome.rewards[0].value).toBeGreaterThan(100);
      expect(processedOutcome.totalRewardValue).toBeGreaterThan(100);
    });

    it('should handle empty and null values gracefully', () => {
      // Test with empty strings
      expect(() => {
        encounterResolver.startEncounter({
          type: 'puzzle_chamber' as EncounterType,
          nodeId: '',
          depth: 1,
          energyCost: 15,
        });
      }).toThrow('Invalid node ID');

      // Test with null values
      expect(() => {
        encounterResolver.startEncounter(null as any);
      }).toThrow('Invalid encounter data');

      // Test with undefined values
      expect(() => {
        encounterResolver.startEncounter(undefined as any);
      }).toThrow('Invalid encounter data');
    });

    it('should handle boundary energy cost values', () => {
      // Test minimum energy cost
      expect(() => {
        encounterResolver.startEncounter({
          type: 'puzzle_chamber' as EncounterType,
          nodeId: 'node-min',
          depth: 1,
          energyCost: 0,
        });
      }).toThrow('Invalid energy cost');

      // Test negative energy cost
      expect(() => {
        encounterResolver.startEncounter({
          type: 'puzzle_chamber' as EncounterType,
          nodeId: 'node-neg',
          depth: 1,
          energyCost: -10,
        });
      }).toThrow('Invalid energy cost');
    });

    it('should handle boundary depth values', () => {
      // Test zero depth
      expect(() => {
        encounterResolver.startEncounter({
          type: 'puzzle_chamber' as EncounterType,
          nodeId: 'node-zero',
          depth: 0,
          energyCost: 15,
        });
      }).toThrow('Invalid depth value');

      // Test negative depth
      expect(() => {
        encounterResolver.startEncounter({
          type: 'puzzle_chamber' as EncounterType,
          nodeId: 'node-neg',
          depth: -5,
          energyCost: 15,
        });
      }).toThrow('Invalid depth value');
    });

    it('should handle large numbers without overflow', () => {
      const largeNumberData = {
        type: 'discovery_site' as EncounterType,
        nodeId: 'node-large',
        depth: 50,
        energyCost: 999999,
      };

      encounterResolver.startEncounter(largeNumberData);

      const outcome: EncounterOutcome = {
        success: true,
        rewards: [
          {
            id: 'reward-large',
            type: 'trade_good',
            setId: 'coins',
            value: 999999,
            name: 'Large Coin',
            description: 'A very valuable coin',
          },
        ],
        energyUsed: 999999,
        itemsGained: [],
        itemsLost: [],
      };

      const processedOutcome =
        encounterResolver.processEncounterOutcome(outcome);

      // Should handle large numbers without overflow
      expect(processedOutcome.totalRewardValue).toBeGreaterThan(999999);
      expect(processedOutcome.totalRewardValue).toBeLessThan(
        Number.MAX_SAFE_INTEGER
      );
    });

    it('should maintain data integrity across multiple operations', () => {
      const encounterData = {
        type: 'discovery_site' as EncounterType,
        nodeId: 'node-integrity',
        depth: 5,
        energyCost: 50,
      };

      encounterResolver.startEncounter(encounterData);

      // Perform multiple operations
      encounterResolver.updateEncounterProgress({ step1: 'explore' });
      encounterResolver.updateEncounterProgress({
        step2: 'discover',
        step1: 'explore',
      });
      encounterResolver.updateEncounterProgress({
        step3: 'analyze',
        step2: 'discover',
        step1: 'explore',
      });

      const state = encounterResolver.getCurrentState();
      expect(state?.progress?.step1).toBe('explore');
      expect(state?.progress?.step2).toBe('discover');
      expect(state?.progress?.step3).toBe('analyze');

      // Complete encounter
      const outcome: EncounterOutcome = {
        success: true,
        rewards: [],
        energyUsed: 50,
        itemsGained: [],
        itemsLost: [],
      };

      encounterResolver.completeEncounter('success', outcome);

      // Verify history integrity
      const history = encounterResolver.getEncounterHistory();
      expect(history).toHaveLength(1);
      expect(history[0].progress?.step3).toBe('analyze');
    });

    it('should handle rapid state transitions', () => {
      const encounterData = {
        type: 'puzzle_chamber' as EncounterType,
        nodeId: 'node-rapid',
        depth: 1,
        energyCost: 15,
      };

      // Rapid start -> progress -> complete cycle
      encounterResolver.startEncounter(encounterData);
      encounterResolver.updateEncounterProgress({ rapid: true });

      const outcome: EncounterOutcome = {
        success: true,
        rewards: [],
        energyUsed: 15,
        itemsGained: [],
        itemsLost: [],
      };

      encounterResolver.completeEncounter('success', outcome);

      // Should be ready for next encounter immediately
      expect(encounterResolver.canStartEncounter()).toBe(true);
      expect(encounterResolver.getCurrentState()).toBeNull();
    });

    it('should handle memory pressure scenarios', () => {
      // Create many encounters to test memory handling
      const encounterData = {
        type: 'puzzle_chamber' as EncounterType,
        nodeId: 'node-memory',
        depth: 1,
        energyCost: 15,
      };

      for (let i = 0; i < 100; i++) {
        encounterResolver.startEncounter({
          ...encounterData,
          nodeId: `node-memory-${i}`,
        });

        const outcome: EncounterOutcome = {
          success: true,
          rewards: [],
          energyUsed: 15,
          itemsGained: [],
          itemsLost: [],
        };

        encounterResolver.completeEncounter('success', outcome);
      }

      // Should handle large history without issues
      const history = encounterResolver.getEncounterHistory();
      expect(history).toHaveLength(100);
      expect(history[99].nodeId).toBe('node-memory-99');
    });

    it('should handle concurrent access simulation', () => {
      const encounterData = {
        type: 'discovery_site' as EncounterType,
        nodeId: 'node-concurrent',
        depth: 2,
        energyCost: 20,
      };

      encounterResolver.startEncounter(encounterData);

      // Test that we can update progress multiple times
      encounterResolver.updateEncounterProgress({ concurrent: 1 });
      encounterResolver.updateEncounterProgress({ concurrent: 2 });
      encounterResolver.updateEncounterProgress({ concurrent: 3 });

      // Should have handled multiple updates gracefully
      const state = encounterResolver.getCurrentState();
      expect(state).not.toBeNull();
      expect(state?.status).toBe('active');
      expect(state?.progress?.concurrent).toBe(3);
    });

    it('should handle invalid encounter types gracefully', () => {
      expect(() => {
        encounterResolver.startEncounter({
          type: 'invalid_type' as any,
          nodeId: 'node-invalid',
          depth: 1,
          energyCost: 15,
        });
      }).toThrow('Invalid encounter type');
    });

    it('should handle corrupted state recovery', () => {
      // Simulate corrupted state with invalid type
      const corruptedState = {
        id: 'corrupted-id',
        type: 'invalid_type',
        nodeId: 'corrupted-node',
        depth: 1,
        energyCost: 15,
        status: 'active',
        startTime: Date.now(),
        progress: null, // Corrupted progress
      };

      encounterResolver.loadEncounterState(corruptedState as any);

      // Should handle corrupted state gracefully
      const state = encounterResolver.getCurrentState();
      expect(state).toBeNull();
    });

    it('should handle statistics edge cases', () => {
      // Test that statistics are properly maintained
      const initialStats = encounterResolver.getEncounterStatistics();
      expect(initialStats.totalEncounters).toBeGreaterThanOrEqual(0);
      expect(initialStats.successfulEncounters).toBeGreaterThanOrEqual(0);
      expect(initialStats.failedEncounters).toBeGreaterThanOrEqual(0);
      expect(initialStats.averageRewardValue).toBeGreaterThanOrEqual(0);

      // Test with a new encounter
      const encounterData = {
        type: 'puzzle_chamber' as EncounterType,
        nodeId: 'node-stats-test',
        depth: 1,
        energyCost: 15,
      };

      encounterResolver.startEncounter(encounterData);

      const outcome: EncounterOutcome = {
        success: true,
        rewards: [
          {
            id: 'reward-stats',
            type: 'trade_good',
            setId: 'coins',
            value: 100,
            name: 'Test Coin',
            description: 'A test coin for statistics',
          },
        ],
        energyUsed: 15,
        itemsGained: [],
        itemsLost: [],
      };

      encounterResolver.completeEncounter('success', outcome);

      const finalStats = encounterResolver.getEncounterStatistics();
      expect(finalStats.totalEncounters).toBeGreaterThan(
        initialStats.totalEncounters
      );
      expect(finalStats.successfulEncounters).toBeGreaterThan(
        initialStats.successfulEncounters
      );
    });

    it('should handle performance under load', () => {
      const startTime = Date.now();

      // Perform many operations quickly
      for (let i = 0; i < 50; i++) {
        const encounterData = {
          type: 'puzzle_chamber' as EncounterType,
          nodeId: `node-perf-${i}`,
          depth: 1,
          energyCost: 15,
        };

        encounterResolver.startEncounter(encounterData);
        encounterResolver.updateEncounterProgress({ iteration: i });

        const outcome: EncounterOutcome = {
          success: true,
          rewards: [],
          energyUsed: 15,
          itemsGained: [],
          itemsLost: [],
        };

        encounterResolver.completeEncounter('success', outcome);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000);

      // Verify all operations completed successfully
      const history = encounterResolver.getEncounterHistory();
      expect(history).toHaveLength(50);
    });
  });

  describe('clearEncounterState', () => {
    it('should clear current encounter state', () => {
      const encounterData = {
        type: 'puzzle_chamber' as EncounterType,
        nodeId: 'node-1',
        depth: 1,
        energyCost: 15,
      };

      encounterResolver.startEncounter(encounterData);
      expect(encounterResolver.isEncounterActive()).toBe(true);

      encounterResolver.clearEncounterState();
      expect(encounterResolver.getCurrentState()).toBeNull();
      expect(encounterResolver.isEncounterActive()).toBe(false);
    });
  });
});
