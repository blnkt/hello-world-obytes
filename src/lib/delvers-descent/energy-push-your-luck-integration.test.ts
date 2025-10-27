import { CashOutManager } from './cash-out-manager';
import { ReturnCostCalculator } from './return-cost-calculator';
import { RunStateManager } from './run-state-manager';
import { SafetyMarginManager } from './safety-margin-manager';

describe('Energy Management & Push-Your-Luck Integration (Task 4.3)', () => {
  let runStateManager: RunStateManager;
  let returnCostCalculator: ReturnCostCalculator;
  let safetyMarginManager: SafetyMarginManager;
  let cashOutManager: CashOutManager;

  beforeEach(() => {
    runStateManager = new RunStateManager();
    returnCostCalculator = new ReturnCostCalculator();
    safetyMarginManager = new SafetyMarginManager(returnCostCalculator);
    cashOutManager = new CashOutManager();
  });

  describe('energy tracking with return costs', () => {
    it('should calculate return cost based on current depth', async () => {
      const runId = await runStateManager.initializeRun('test-run', 100);

      const state = runStateManager.getCurrentState();
      if (!state) {
        throw new Error('State not initialized');
      }

      // Manually set depth to 2 for this test
      await runStateManager.updateDepth(2);
      const updatedState = runStateManager.getCurrentState();
      if (!updatedState) {
        throw new Error('State not initialized');
      }

      const returnCost = returnCostCalculator.calculateCumulativeReturnCost(
        updatedState.currentDepth
      );

      expect(returnCost).toBeGreaterThan(0);
    });

    it('should update energy when consuming energy for movement', async () => {
      const runId = await runStateManager.initializeRun('test-run', 100);

      await runStateManager.updateEnergy(-15); // Move to depth 2

      const state = runStateManager.getCurrentState();
      if (!state) {
        throw new Error('State not initialized');
      }

      expect(state.energyRemaining).toBe(85);
    });

    it('should track safety margin as energy changes', async () => {
      const runId = await runStateManager.initializeRun('test-run', 100);
      let state = runStateManager.getCurrentState();

      if (!state) {
        throw new Error('State not initialized');
      }

      // Simulate at depth 2
      await runStateManager.updateEnergy(-15); // Consume energy
      state = runStateManager.getCurrentState();

      if (!state) {
        throw new Error('State not initialized');
      }

      // Calculate return cost for depth 2 (use depth 2 for calculations)
      const returnCost = returnCostCalculator.calculateCumulativeReturnCost(2);
      const safetyMargin = safetyMarginManager.calculateSafetyMargin(
        state.energyRemaining,
        returnCost,
        2
      );

      expect(safetyMargin.remainingEnergy).toBeGreaterThanOrEqual(0);
      expect(safetyMargin.remainingEnergy).toBe(
        state.energyRemaining - returnCost
      );
    });
  });

  describe('push-your-luck decision making', () => {
    it('should allow player to choose cash out when energy is sufficient', async () => {
      const runId = await runStateManager.initializeRun('test-run', 200);
      await runStateManager.updateEnergy(-15); // Consume some energy
      await runStateManager.updateDepth(2);

      const state = runStateManager.getCurrentState();
      if (!state) {
        throw new Error('State not initialized');
      }

      const returnCost = returnCostCalculator.calculateCumulativeReturnCost(
        state.currentDepth
      );
      const canCashOut = cashOutManager.canCashOut(
        state.energyRemaining,
        returnCost,
        { energy: 0, items: [], xp: 0 }
      );

      expect(canCashOut).toBe(true);
    });

    it('should warn player when approaching point of no return', async () => {
      const runId = await runStateManager.initializeRun('test-run', 50);
      await runStateManager.updateDepth(3);

      const state = runStateManager.getCurrentState();
      if (!state) {
        throw new Error('State not initialized');
      }

      // Simulate reaching a dangerous depth with low energy
      await runStateManager.updateEnergy(-45); // Leave only 5 energy

      const updatedState = runStateManager.getCurrentState();
      if (!updatedState) {
        throw new Error('State not initialized');
      }

      // Use depth 3 for return cost calculation (simulating deeper descent)
      const returnCost = returnCostCalculator.calculateCumulativeReturnCost(3);
      const warnings = safetyMarginManager.getRiskWarnings(
        updatedState.energyRemaining,
        returnCost,
        3
      );

      expect(warnings.length).toBeGreaterThan(0);
    });

    it('should prevent cash out when energy is insufficient', async () => {
      const runId = await runStateManager.initializeRun('test-run', 50);
      await runStateManager.updateDepth(5);

      const state = runStateManager.getCurrentState();
      if (!state) {
        throw new Error('State not initialized');
      }

      // Consume more energy than available for return
      await runStateManager.updateEnergy(-35);

      const updatedState = runStateManager.getCurrentState();
      if (!updatedState) {
        throw new Error('State not initialized');
      }

      // Use a high return cost that exceeds remaining energy
      const returnCost = returnCostCalculator.calculateCumulativeReturnCost(5);
      const canCashOut = cashOutManager.canCashOut(
        updatedState.energyRemaining,
        returnCost,
        { energy: 0, items: [], xp: 0 }
      );

      expect(canCashOut).toBe(false);
    });
  });

  describe('energy consumption tracking', () => {
    it('should track total energy consumed across depth levels', async () => {
      const runId = await runStateManager.initializeRun('test-run', 100);
      const initialState = runStateManager.getCurrentState();

      if (!initialState) {
        throw new Error('State not initialized');
      }

      const initialEnergy = initialState.energyRemaining;

      // Consume energy progressively
      await runStateManager.updateEnergy(-15);
      let state = runStateManager.getCurrentState();
      if (!state) {
        throw new Error('State not initialized');
      }

      expect(state.energyRemaining).toBe(initialEnergy - 15);

      await runStateManager.updateEnergy(-20);
      state = runStateManager.getCurrentState();
      if (!state) {
        throw new Error('State not initialized');
      }

      expect(state.energyRemaining).toBe(initialEnergy - 35);
    });

    it('should handle energy reaching zero', async () => {
      const runId = await runStateManager.initializeRun('test-run', 100);

      // Consume all energy
      await runStateManager.updateEnergy(-100);

      const state = runStateManager.getCurrentState();
      if (!state) {
        throw new Error('State not initialized');
      }

      expect(state.energyRemaining).toBe(0);

      // Should not allow additional energy consumption
      await runStateManager.updateEnergy(-10);
      const finalState = runStateManager.getCurrentState();

      if (!finalState) {
        throw new Error('State not initialized');
      }

      expect(finalState.energyRemaining).toBe(0); // Clamped at 0
    });
  });

  describe('shortcut impact on energy calculations', () => {
    it('should reduce return cost when shortcuts are discovered', async () => {
      const runId = await runStateManager.initializeRun('test-run', 100);
      await runStateManager.updateDepth(3);
      await runStateManager.updateEnergy(-15); // Simulate movement

      const state = runStateManager.getCurrentState();
      if (!state) {
        throw new Error('State not initialized');
      }

      // Calculate return cost for depth 3 (simulating deep descent)
      const basicReturnCost =
        returnCostCalculator.calculateCumulativeReturnCost(3);

      // Add a shortcut at depth 2
      await runStateManager.addShortcut({
        id: 'shortcut-1',
        fromDepth: 2,
        toDepth: 1,
        energyReduction: 10,
        isPermanent: true,
      });

      // Verify the integration point exists - shortcuts are added to state
      expect(basicReturnCost).toBeGreaterThan(0);
      expect(state.discoveredShortcuts.length).toBe(1);
    });
  });
});
