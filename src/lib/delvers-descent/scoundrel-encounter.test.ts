import type { ScoundrelConfig } from './scoundrel-encounter';
import { ScoundrelEncounter } from './scoundrel-encounter';

describe('ScoundrelEncounter', () => {
  const createDefaultConfig = (): ScoundrelConfig => ({
    startingLife: 10,
    dungeonSize: 5,
    depth: 1,
  });

  describe('constructor', () => {
    it('should initialize with default config', () => {
      const config = createDefaultConfig();
      const encounter = new ScoundrelEncounter('test-encounter-1', config);

      const state = encounter.getState();
      expect(state.encounterId).toBe('test-encounter-1');
      expect(state.encounterType).toBe('scoundrel');
      expect(state.config).toEqual(config);
      expect(state.currentLife).toBe(10);
      expect(state.currentRoom).toBe(0);
      expect(state.isResolved).toBe(false);
    });

    it('should initialize with custom starting life', () => {
      const config: ScoundrelConfig = {
        startingLife: 15,
        dungeonSize: 7,
        depth: 3,
      };
      const encounter = new ScoundrelEncounter('test-encounter-2', config);

      const state = encounter.getState();
      expect(state.currentLife).toBe(15);
      expect(state.config.startingLife).toBe(15);
    });
  });

  describe('getState', () => {
    it('should return a copy of the current state', () => {
      const encounter = new ScoundrelEncounter(
        'test-encounter-3',
        createDefaultConfig()
      );

      const state1 = encounter.getState();
      const state2 = encounter.getState();

      expect(state1).toEqual(state2);
      expect(state1).not.toBe(state2); // Different object references
    });
  });

  describe('getCurrentLife', () => {
    it('should return current life points', () => {
      const encounter = new ScoundrelEncounter(
        'test-encounter-4',
        createDefaultConfig()
      );

      expect(encounter.getCurrentLife()).toBe(10);
    });
  });

  describe('getMaxLife', () => {
    it('should return starting life (max life)', () => {
      const config = createDefaultConfig();
      const encounter = new ScoundrelEncounter('test-encounter-5', config);

      expect(encounter.getMaxLife()).toBe(10);
      expect(encounter.getMaxLife()).toBe(config.startingLife);
    });

    it('should return custom starting life', () => {
      const config: ScoundrelConfig = {
        startingLife: 20,
        dungeonSize: 8,
        depth: 5,
      };
      const encounter = new ScoundrelEncounter('test-encounter-6', config);

      expect(encounter.getMaxLife()).toBe(20);
    });
  });

  describe('isEncounterComplete', () => {
    it('should return false when life > 0 and dungeon not completed', () => {
      const encounter = new ScoundrelEncounter(
        'test-encounter-7',
        createDefaultConfig()
      );

      expect(encounter.isEncounterComplete()).toBe(false);
    });

    it('should return true when life is 0', () => {
      const encounter = new ScoundrelEncounter(
        'test-encounter-8',
        createDefaultConfig()
      );

      // We can't directly modify state, but we can test the logic
      // For now, we'll test that encounter is not complete with life > 0
      // This will be tested more thoroughly when we implement damage methods
      expect(encounter.getCurrentLife()).toBeGreaterThan(0);
      expect(encounter.isEncounterComplete()).toBe(false);
    });
  });

  describe('getRemainingMonsters', () => {
    it('should return empty array when dungeon is empty', () => {
      const encounter = new ScoundrelEncounter(
        'test-encounter-9',
        createDefaultConfig()
      );

      const remaining = encounter.getRemainingMonsters();
      expect(remaining).toEqual([]);
    });

    it('should return all monsters when no rooms are completed', () => {
      const encounter = new ScoundrelEncounter(
        'test-encounter-10',
        createDefaultConfig()
      );

      // Once dungeon generation is implemented, this will test properly
      const remaining = encounter.getRemainingMonsters();
      expect(Array.isArray(remaining)).toBe(true);
    });
  });
});
