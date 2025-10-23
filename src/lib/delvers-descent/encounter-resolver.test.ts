import type { EncounterOutcome, EncounterType } from '@/types/delvers-descent';

import { EncounterResolver } from './encounter-resolver';

describe('EncounterResolver', () => {
  let encounterResolver: EncounterResolver;

  beforeEach(() => {
    encounterResolver = new EncounterResolver();
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
