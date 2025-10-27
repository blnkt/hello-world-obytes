import type { Shortcut } from '@/types/delvers-descent';

import { ReturnCostCalculator } from './return-cost-calculator';
import { RunStateManager } from './run-state-manager';
import { ShortcutManager } from './shortcut-manager';

describe('Phase 3 State Persistence Across App Sessions (Task 4.6)', () => {
  let runStateManager: RunStateManager;
  let shortcutManager: ShortcutManager;
  let returnCostCalculator: ReturnCostCalculator;

  beforeEach(() => {
    runStateManager = new RunStateManager();
    shortcutManager = new ShortcutManager();
    shortcutManager.clearAllShortcuts(); // Clean state for each test
    returnCostCalculator = new ReturnCostCalculator();
  });

  describe('return cost state persistence', () => {
    it('should persist current depth which affects return cost calculations', async () => {
      await runStateManager.initializeRun('test-run', 100);
      await runStateManager.updateDepth(3);

      const state = runStateManager.getCurrentState();
      if (!state) {
        throw new Error('State not initialized');
      }

      expect(state.currentDepth).toBe(3);

      // Verify return cost can be calculated from persisted depth
      const returnCost = returnCostCalculator.calculateCumulativeReturnCost(
        state.currentDepth
      );
      expect(returnCost).toBeGreaterThan(0);
    });

    it('should persist visited nodes for return path calculation', async () => {
      await runStateManager.initializeRun('test-run', 100);
      await runStateManager.moveToNode('node-1', 15);
      await runStateManager.moveToNode('node-2', 20);

      const state = runStateManager.getCurrentState();
      if (!state) {
        throw new Error('State not initialized');
      }

      // Verify visited nodes are persisted
      expect(state.visitedNodes.length).toBeGreaterThan(0);
      expect(state.visitedNodes).toContain('node-1');
    });
  });

  describe('shortcut discovery persistence', () => {
    it('should persist shortcuts across app sessions', () => {
      const shortcut = {
        id: 'persistent-shortcut',
        depth: 3,
        reductionFactor: 0.7,
        description: 'Persistent shortcut for testing',
      };

      shortcutManager.discoverShortcut(shortcut);

      // Create new manager instance (simulating app restart)
      const newShortcutManager = new ShortcutManager();

      // Shortcut should still be available
      expect(newShortcutManager.hasShortcut('persistent-shortcut')).toBe(true);

      const loadedShortcut = newShortcutManager.getShortcut(
        'persistent-shortcut'
      );
      expect(loadedShortcut).toBeDefined();
      expect(loadedShortcut?.depth).toBe(3);
      expect(loadedShortcut?.reductionFactor).toBe(0.7);
    });
  });

  describe('inventory persistence', () => {
    it('should persist inventory items across app sessions', async () => {
      await runStateManager.initializeRun('test-run', 100);

      const item = {
        id: 'persistent-item',
        name: 'Persistent Item',
        type: 'trade_good' as const,
        setId: 'test-set',
        value: 100,
        description: 'An item that persists across sessions',
      };

      await runStateManager.addToInventory(item);

      const state = runStateManager.getCurrentState();
      if (!state) {
        throw new Error('State not initialized');
      }

      expect(state.inventory.length).toBe(1);
      expect(state.inventory[0].id).toBe('persistent-item');

      // Simulate app restart
      const newRunStateManager = new RunStateManager();

      const persistedState = newRunStateManager.getCurrentState();
      if (!persistedState) {
        throw new Error('State not initialized');
      }

      expect(persistedState.inventory.length).toBe(1);
      expect(persistedState.inventory[0].id).toBe('persistent-item');
      expect(persistedState.inventory[0].name).toBe('Persistent Item');
    });
  });

  describe('energy state persistence', () => {
    it('should persist energy remaining across app sessions', async () => {
      await runStateManager.initializeRun('test-run', 100);
      await runStateManager.updateEnergy(-30);

      const state = runStateManager.getCurrentState();
      if (!state) {
        throw new Error('State not initialized');
      }

      expect(state.energyRemaining).toBe(70);

      // Simulate app restart
      const newRunStateManager = new RunStateManager();

      const persistedState = newRunStateManager.getCurrentState();
      if (!persistedState) {
        throw new Error('State not initialized');
      }

      // Energy should persist
      expect(persistedState.energyRemaining).toBe(70);
    });
  });

  describe('complete run state persistence', () => {
    it('should persist all Phase 3 state together', async () => {
      await runStateManager.initializeRun('test-run', 200);

      // Set depth
      await runStateManager.updateDepth(3);

      // Add inventory
      await runStateManager.addToInventory({
        id: 'item-1',
        name: 'Item 1',
        type: 'trade_good' as const,
        setId: 'test-set',
        value: 50,
        description: 'Test item',
      });

      // Add shortcuts
      const runShortcut: Shortcut = {
        id: 'run-shortcut-1',
        fromDepth: 2,
        toDepth: 1,
        energyReduction: 10,
        isPermanent: true,
      };
      await runStateManager.addShortcut(runShortcut);

      // Discover permanent shortcut
      shortcutManager.discoverShortcut({
        id: 'permanent-shortcut',
        depth: 3,
        reductionFactor: 0.75,
        description: 'Permanent shortcut',
      });

      const state = runStateManager.getCurrentState();
      if (!state) {
        throw new Error('State not initialized');
      }

      // Verify everything is in state
      expect(state.currentDepth).toBe(3);
      expect(state.inventory.length).toBe(1);
      expect(state.discoveredShortcuts.length).toBe(1);

      // Simulate app restart
      const newRunStateManager = new RunStateManager();
      const newShortcutManager = new ShortcutManager();

      const persistedState = newRunStateManager.getCurrentState();
      if (!persistedState) {
        throw new Error('State not initialized');
      }

      // Everything should persist
      expect(persistedState.currentDepth).toBe(3);
      expect(persistedState.inventory.length).toBe(1);
      expect(persistedState.discoveredShortcuts.length).toBe(1);
      expect(newShortcutManager.hasShortcut('permanent-shortcut')).toBe(true);
    });
  });
});
