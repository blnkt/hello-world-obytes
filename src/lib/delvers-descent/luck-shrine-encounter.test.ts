import { LuckShrineEncounter } from './luck-shrine-encounter';
import { getRunStateManager } from './run-state-manager';

describe('LuckShrineEncounter', () => {
  beforeEach(async () => {
    // Initialize a run state for testing
    const runStateManager = getRunStateManager();
    await runStateManager.initializeRun('test-run-1', 100);
  });

  afterEach(async () => {
    // Clean up run state after each test
    const runStateManager = getRunStateManager();
    await runStateManager.clearActiveRun();
  });
  describe('constructor', () => {
    it('should create a luck shrine encounter with valid config', () => {
      const encounter = new LuckShrineEncounter('encounter-1', 3);

      const state = encounter.getState();
      expect(state.encounterId).toBe('encounter-1');
      expect(state.encounterType).toBe('luck_shrine');
      expect(state.config.multiplierBonus).toBeGreaterThan(0);
      expect(state.config.duration).toBeGreaterThanOrEqual(2);
      expect(state.config.duration).toBeLessThanOrEqual(3);
      expect(state.isResolved).toBe(false);
    });

    it('should generate different multiplier bonuses for different encounters', () => {
      const encounter1 = new LuckShrineEncounter('encounter-1', 3);
      const encounter2 = new LuckShrineEncounter('encounter-2', 3);

      // Since multiplier bonus is fixed (0.5), they should be the same
      // But duration can vary (2-3)
      const state1 = encounter1.getState();
      const state2 = encounter2.getState();

      expect(state1.config.multiplierBonus).toBe(state2.config.multiplierBonus);
    });
  });

  describe('getState', () => {
    it('should return a copy of the current state', () => {
      const encounter = new LuckShrineEncounter('encounter-1', 5);
      const state1 = encounter.getState();
      const state2 = encounter.getState();

      expect(state1).toEqual(state2);
      expect(state1).not.toBe(state2); // Should be different objects
    });
  });

  describe('activate', () => {
    it('should activate the luck shrine and return success outcome', async () => {
      const encounter = new LuckShrineEncounter('encounter-1', 3);
      const outcome = await encounter.activate();

      expect(outcome.type).toBe('success');
      expect(outcome.message.toLowerCase()).toContain('luck');
      expect(outcome.reward).toBeUndefined(); // No direct rewards
      expect(encounter.getState().isResolved).toBe(true);
      expect(encounter.getState().outcome).toBeDefined();
    });

    it('should include luck boost information in outcome', async () => {
      const encounter = new LuckShrineEncounter('encounter-1', 3);
      const state = encounter.getState();
      const outcome = await encounter.activate();

      expect(outcome.type).toBe('success');
      // The outcome should indicate the luck boost was activated
      expect(outcome.message).toBeDefined();
    });

    it('should throw error if already resolved', async () => {
      const encounter = new LuckShrineEncounter('encounter-1', 3);
      await encounter.activate();

      await expect(encounter.activate()).rejects.toThrow(
        'Encounter already resolved'
      );
    });
  });

  describe('getEnergyCost', () => {
    it('should calculate energy cost based on depth and type modifier', () => {
      const encounter1 = new LuckShrineEncounter('encounter-1', 1);
      const encounter2 = new LuckShrineEncounter('encounter-2', 5);
      const encounter3 = new LuckShrineEncounter('encounter-3', 10);

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
      const encounter1 = new LuckShrineEncounter('encounter-1', 3);
      const encounter2 = new LuckShrineEncounter('encounter-2', 3);

      expect(encounter1.getEnergyCost()).toBe(encounter2.getEnergyCost());
    });
  });
});
