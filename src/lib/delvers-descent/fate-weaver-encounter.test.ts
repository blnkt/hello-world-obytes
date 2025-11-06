import type { EncounterType } from '@/types/delvers-descent';

import { FateWeaverEncounter } from './fate-weaver-encounter';
import { getRunStateManager } from './run-state-manager';

describe('FateWeaverEncounter', () => {
  let runStateManager: ReturnType<typeof getRunStateManager>;

  beforeEach(async () => {
    runStateManager = getRunStateManager();
    await runStateManager.initializeRun('test-run-1', 100);
  });

  afterEach(async () => {
    await runStateManager.clearActiveRun();
  });

  const mockEncounterDistribution = {
    puzzle_chamber: 0.2,
    discovery_site: 0.15,
    risk_event: 0.15,
    hazard: 0.1,
    rest_site: 0.1,
    safe_passage: 0.1,
    region_shortcut: 0.05,
    scoundrel: 0.15,
    luck_shrine: 0.05,
    energy_nexus: 0.05,
    time_distortion: 0.03,
    fate_weaver: 0.05,
  };

  describe('constructor', () => {
    it('should create a fate weaver encounter with valid config', () => {
      const encounter = new FateWeaverEncounter(
        'encounter-1',
        3,
        mockEncounterDistribution
      );

      const state = encounter.getState();
      expect(state.encounterId).toBe('encounter-1');
      expect(state.encounterType).toBe('fate_weaver');
      expect(state.config.probabilityChangeAmount).toBe(0.1); // ±10%
      expect(state.config.selectedTypes).toHaveLength(3);
      expect(state.isResolved).toBe(false);
    });

    it('should select 3 different encounter types from available types', () => {
      const encounter = new FateWeaverEncounter(
        'encounter-1',
        3,
        mockEncounterDistribution
      );

      const state = encounter.getState();
      const selectedTypes = state.config.selectedTypes;

      expect(selectedTypes.length).toBe(3);
      expect(new Set(selectedTypes).size).toBe(3); // All unique
      selectedTypes.forEach((type) => {
        expect(mockEncounterDistribution[type]).toBeDefined();
        expect(mockEncounterDistribution[type]).toBeGreaterThan(0);
      });
    });
  });

  describe('getState', () => {
    it('should return a copy of the current state', () => {
      const encounter = new FateWeaverEncounter(
        'encounter-1',
        5,
        mockEncounterDistribution
      );
      const state1 = encounter.getState();
      const state2 = encounter.getState();

      expect(state1).toEqual(state2);
      expect(state1).not.toBe(state2); // Should be different objects
    });
  });

  describe('modifyProbability', () => {
    it('should modify probability for a selected encounter type', () => {
      const encounter = new FateWeaverEncounter(
        'encounter-1',
        3,
        mockEncounterDistribution
      );
      const state = encounter.getState();
      const selectedType = state.config.selectedTypes[0];

      encounter.modifyProbability(selectedType, 'increase');
      const updatedState = encounter.getState();

      expect(updatedState.probabilityChanges[selectedType]).toBe(0.1);
    });

    it('should allow decreasing probability', () => {
      const encounter = new FateWeaverEncounter(
        'encounter-1',
        3,
        mockEncounterDistribution
      );
      const state = encounter.getState();
      const selectedType = state.config.selectedTypes[0];

      encounter.modifyProbability(selectedType, 'decrease');
      const updatedState = encounter.getState();

      expect(updatedState.probabilityChanges[selectedType]).toBe(-0.1);
    });

    it('should throw error if type is not in selected types', () => {
      const encounter = new FateWeaverEncounter(
        'encounter-1',
        3,
        mockEncounterDistribution
      );
      const state = encounter.getState();
      const selectedTypes = new Set(state.config.selectedTypes);

      // Find a type that is NOT selected
      const allTypes: EncounterType[] = [
        'puzzle_chamber',
        'discovery_site',
        'risk_event',
        'hazard',
        'rest_site',
        'safe_passage',
        'region_shortcut',
        'scoundrel',
        'luck_shrine',
        'energy_nexus',
        'time_distortion',
        'fate_weaver',
      ];
      const unselectedType = allTypes.find((type) => !selectedTypes.has(type));

      if (unselectedType) {
        expect(() => {
          encounter.modifyProbability(unselectedType, 'increase');
        }).toThrow('Encounter type not selected by Fate Weaver');
      }
    });

    it('should throw error if already resolved', async () => {
      const encounter = new FateWeaverEncounter(
        'encounter-1',
        3,
        mockEncounterDistribution
      );
      const state = encounter.getState();
      const selectedType = state.config.selectedTypes[0];

      await encounter.execute();

      expect(() => {
        encounter.modifyProbability(selectedType, 'increase');
      }).toThrow('Encounter already resolved');
    });
  });

  describe('calculateNewDistribution', () => {
    it('should calculate new distribution with probability changes', () => {
      const encounter = new FateWeaverEncounter(
        'encounter-1',
        3,
        mockEncounterDistribution
      );
      const state = encounter.getState();
      const selectedType1 = state.config.selectedTypes[0];
      const selectedType2 = state.config.selectedTypes[1];

      encounter.modifyProbability(selectedType1, 'increase');
      encounter.modifyProbability(selectedType2, 'decrease');

      const newDistribution = encounter.calculateNewDistribution();

      expect(newDistribution[selectedType1]).toBeGreaterThan(
        mockEncounterDistribution[selectedType1]
      );
      expect(newDistribution[selectedType2]).toBeLessThan(
        mockEncounterDistribution[selectedType2]
      );
    });

    it('should normalize probabilities to sum to 1.0', () => {
      const encounter = new FateWeaverEncounter(
        'encounter-1',
        3,
        mockEncounterDistribution
      );
      const state = encounter.getState();

      state.config.selectedTypes.forEach((type) => {
        encounter.modifyProbability(type, 'increase');
      });

      const newDistribution = encounter.calculateNewDistribution();
      const sum = Object.values(newDistribution).reduce((a, b) => a + b, 0);

      expect(sum).toBeCloseTo(1.0, 5);
    });

    it('should ensure no probability goes below 0', () => {
      const encounter = new FateWeaverEncounter(
        'encounter-1',
        3,
        mockEncounterDistribution
      );
      const state = encounter.getState();
      const selectedType = state.config.selectedTypes[0];

      // Try to decrease multiple times
      encounter.modifyProbability(selectedType, 'decrease');
      encounter.modifyProbability(selectedType, 'decrease');
      encounter.modifyProbability(selectedType, 'decrease');

      const newDistribution = encounter.calculateNewDistribution();

      expect(newDistribution[selectedType]).toBeGreaterThanOrEqual(0);
    });
  });

  describe('execute', () => {
    it('should execute and save modified probabilities to run state', async () => {
      const encounter = new FateWeaverEncounter(
        'encounter-1',
        3,
        mockEncounterDistribution
      );
      const state = encounter.getState();
      const selectedType = state.config.selectedTypes[0];

      encounter.modifyProbability(selectedType, 'increase');
      const outcome = await encounter.execute();

      expect(outcome.type).toBe('success');
      expect(encounter.getState().isResolved).toBe(true);

      const runState = runStateManager.getCurrentState();
      expect(runState?.modifiedEncounterProbabilities).toBeDefined();
      expect(
        runState?.modifiedEncounterProbabilities?.[selectedType]
      ).toBeGreaterThan(mockEncounterDistribution[selectedType]);
    });

    it('should throw error if already resolved', async () => {
      const encounter = new FateWeaverEncounter(
        'encounter-1',
        3,
        mockEncounterDistribution
      );

      await encounter.execute();

      await expect(encounter.execute()).rejects.toThrow(
        'Encounter already resolved'
      );
    });

    it('should work even if no probability changes were made', async () => {
      const encounter = new FateWeaverEncounter(
        'encounter-1',
        3,
        mockEncounterDistribution
      );

      const outcome = await encounter.execute();

      expect(outcome.type).toBe('success');
      expect(encounter.getState().isResolved).toBe(true);
    });
  });

  describe('getEnergyCost', () => {
    it('should calculate energy cost based on depth and type modifier', () => {
      const encounter1 = new FateWeaverEncounter(
        'encounter-1',
        1,
        mockEncounterDistribution
      );
      const encounter2 = new FateWeaverEncounter(
        'encounter-2',
        5,
        mockEncounterDistribution
      );
      const encounter3 = new FateWeaverEncounter(
        'encounter-3',
        10,
        mockEncounterDistribution
      );

      const cost1 = encounter1.getEnergyCost();
      const cost2 = encounter2.getEnergyCost();
      const cost3 = encounter3.getEnergyCost();

      // Cost should increase with depth
      expect(cost1).toBeLessThan(cost2);
      expect(cost2).toBeLessThan(cost3);
      expect(cost1).toBeGreaterThanOrEqual(3); // Min cost
      expect(cost3).toBeLessThanOrEqual(30); // Max cost
    });

    it('should return consistent cost for same depth', () => {
      const encounter1 = new FateWeaverEncounter(
        'encounter-1',
        3,
        mockEncounterDistribution
      );
      const encounter2 = new FateWeaverEncounter(
        'encounter-2',
        3,
        mockEncounterDistribution
      );

      expect(encounter1.getEnergyCost()).toBe(encounter2.getEnergyCost());
    });
  });
});
