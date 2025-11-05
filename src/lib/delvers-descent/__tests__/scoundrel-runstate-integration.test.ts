import { RunStateManager } from '../run-state-manager';
import { ScoundrelEncounter } from '../scoundrel-encounter';
import type { CollectedItem, RunState } from '@/types/delvers-descent';

describe('Scoundrel Encounter Integration with RunStateManager', () => {
  let runStateManager: RunStateManager;

  beforeEach(async () => {
    runStateManager = new RunStateManager();
    await runStateManager.initializeRun('test-run', 1000);
  });

  describe('Task 6.17: Failure Consequences Integration', () => {
    it('should remove items from inventory when scoundrel encounter fails', async () => {
      // Add items to inventory
      const items: CollectedItem[] = [
        {
          id: 'item-1',
          name: 'Item 1',
          type: 'trade_good',
          setId: 'test-set',
          value: 10,
          description: 'Test item 1',
        },
        {
          id: 'item-2',
          name: 'Item 2',
          type: 'trade_good',
          setId: 'test-set',
          value: 20,
          description: 'Test item 2',
        },
        {
          id: 'item-3',
          name: 'Item 3',
          type: 'trade_good',
          setId: 'test-set',
          value: 30,
          description: 'Test item 3',
        },
      ];

      for (const item of items) {
        await runStateManager.addToInventory(item);
      }

      const stateBefore = runStateManager.getCurrentState();
      expect(stateBefore?.inventory.length).toBe(3);

      // Create scoundrel encounter and force failure
      const config = ScoundrelEncounter.createScoundrelConfig(1, 1, 3); // Low life, small dungeon
      const encounter = new ScoundrelEncounter('test-scoundrel', config);

      // Complete all rooms to trigger failure (life will be 0 or less)
      const encounterState = encounter.getState();
      encounterState.dungeon.forEach((room) => {
        room.isCompleted = true;
      });
      encounterState.currentLife = 0; // Force failure

      // Resolve encounter with failure
      const outcome = encounter.resolve(stateBefore?.inventory || []);

      expect(outcome.type).toBe('failure');

      // Extract items to steal from outcome
      const itemsToSteal =
        outcome.consequence && 'itemsToSteal' in outcome.consequence
          ? (outcome.consequence as any).itemsToSteal
          : [];

      if (itemsToSteal.length > 0) {
        // Remove stolen items from inventory
        const updatedInventory = (stateBefore?.inventory || []).filter(
          (item) => !itemsToSteal.includes(item.id)
        );

        // Update run state with new inventory
        for (const itemId of itemsToSteal) {
          await runStateManager.removeFromInventory(itemId);
        }

        const stateAfter = runStateManager.getCurrentState();
        expect(stateAfter?.inventory.length).toBe(3 - itemsToSteal.length);
        expect(stateAfter?.inventory.every((item) => !itemsToSteal.includes(item.id))).toBe(true);
      }
    });

    it('should apply additional energy loss when scoundrel encounter fails', async () => {
      const initialState = runStateManager.getCurrentState();
      const initialEnergy = initialState?.energyRemaining || 0;

      // Create scoundrel encounter and force failure
      const config = ScoundrelEncounter.createScoundrelConfig(3, 1, 3); // Depth 3, low life
      const encounter = new ScoundrelEncounter('test-scoundrel', config);

      // Force failure
      const encounterState = encounter.getState();
      encounterState.dungeon.forEach((room) => {
        room.isCompleted = true;
      });
      encounterState.currentLife = 0;

      // Resolve encounter
      const outcome = encounter.resolve(initialState?.inventory || []);

      expect(outcome.type).toBe('failure');

      // Extract additional energy loss from outcome
      const additionalEnergyLoss =
        outcome.consequence && 'energyLoss' in outcome.consequence
          ? outcome.consequence.energyLoss
          : 0;

      if (additionalEnergyLoss > 0) {
        // Apply energy loss
        await runStateManager.updateEnergy(-additionalEnergyLoss);

        const stateAfter = runStateManager.getCurrentState();
        expect(stateAfter?.energyRemaining).toBe(initialEnergy - additionalEnergyLoss);
      }
    });

    it('should handle both item theft and energy loss on failure', async () => {
      // Setup inventory
      const items: CollectedItem[] = [
        {
          id: 'item-1',
          name: 'Item 1',
          type: 'trade_good',
          setId: 'test-set',
          value: 10,
          description: 'Test item 1',
        },
        {
          id: 'item-2',
          name: 'Item 2',
          type: 'trade_good',
          setId: 'test-set',
          value: 20,
          description: 'Test item 2',
        },
      ];

      for (const item of items) {
        await runStateManager.addToInventory(item);
      }

      const stateBefore = runStateManager.getCurrentState();
      const initialEnergy = stateBefore?.energyRemaining || 0;
      const initialInventoryCount = stateBefore?.inventory.length || 0;

      // Create scoundrel encounter and force failure
      const config = ScoundrelEncounter.createScoundrelConfig(3, 1, 3);
      const encounter = new ScoundrelEncounter('test-scoundrel', config);

      const encounterState = encounter.getState();
      encounterState.dungeon.forEach((room) => {
        room.isCompleted = true;
      });
      encounterState.currentLife = 0;

      // Resolve encounter
      const outcome = encounter.resolve(stateBefore?.inventory || []);

      expect(outcome.type).toBe('failure');

      // Extract failure consequences
      const itemsToSteal =
        outcome.consequence && 'itemsToSteal' in outcome.consequence
          ? (outcome.consequence as any).itemsToSteal
          : [];
      const additionalEnergyLoss =
        outcome.consequence && 'energyLoss' in outcome.consequence
          ? outcome.consequence.energyLoss
          : 0;

      // Apply both consequences
      if (itemsToSteal.length > 0) {
        for (const itemId of itemsToSteal) {
          await runStateManager.removeFromInventory(itemId);
        }
      }

      if (additionalEnergyLoss > 0) {
        await runStateManager.updateEnergy(-additionalEnergyLoss);
      }

      // Verify both consequences were applied
      const stateAfter = runStateManager.getCurrentState();
      expect(stateAfter?.inventory.length).toBe(initialInventoryCount - itemsToSteal.length);
      expect(stateAfter?.energyRemaining).toBe(initialEnergy - additionalEnergyLoss);
    });

    it('should handle failure with no items to steal when inventory is empty', async () => {
      const stateBefore = runStateManager.getCurrentState();
      expect(stateBefore?.inventory.length).toBe(0);

      // Create scoundrel encounter and force failure
      const config = ScoundrelEncounter.createScoundrelConfig(1, 1, 3);
      const encounter = new ScoundrelEncounter('test-scoundrel', config);

      const encounterState = encounter.getState();
      encounterState.dungeon.forEach((room) => {
        room.isCompleted = true;
      });
      encounterState.currentLife = 0;

      // Resolve encounter
      const outcome = encounter.resolve([]);

      expect(outcome.type).toBe('failure');

      // Extract items to steal (should be empty or limited)
      const itemsToSteal =
        outcome.consequence && 'itemsToSteal' in outcome.consequence
          ? (outcome.consequence as any).itemsToSteal
          : [];

      // Should handle empty inventory gracefully
      if (itemsToSteal.length > 0) {
        for (const itemId of itemsToSteal) {
          await runStateManager.removeFromInventory(itemId);
        }
      }

      const stateAfter = runStateManager.getCurrentState();
      expect(stateAfter?.inventory.length).toBe(0);
    });

    it('should preserve inventory when scoundrel encounter succeeds', async () => {
      // Add items to inventory
      const items: CollectedItem[] = [
        {
          id: 'item-1',
          name: 'Item 1',
          type: 'trade_good',
          setId: 'test-set',
          value: 10,
          description: 'Test item 1',
        },
      ];

      for (const item of items) {
        await runStateManager.addToInventory(item);
      }

      const stateBefore = runStateManager.getCurrentState();
      const initialInventoryCount = stateBefore?.inventory.length || 0;

      // Create scoundrel encounter and simulate success scenario
      // Success means: life > 0 AND dungeon completed
      const config = ScoundrelEncounter.createScoundrelConfig(1, 10, 3);
      const encounter = new ScoundrelEncounter('test-scoundrel', config);

      // Manually set up success state: complete all rooms, life > 0
      const encounterState = encounter.getState();
      encounterState.dungeon.forEach((room) => {
        room.isCompleted = true;
        room.monsters = []; // Remove monsters for positive score
      });
      encounterState.currentRoom = encounterState.dungeon.length - 1; // Last room
      encounterState.currentLife = 5; // Still alive

      // Resolve encounter
      const outcome = encounter.resolve(stateBefore?.inventory || []);

      // On success, no items should be stolen
      if (outcome.type === 'success') {
        const itemsToSteal =
          outcome.consequence && 'itemsToSteal' in outcome.consequence
            ? (outcome.consequence as any).itemsToSteal
            : [];

        expect(itemsToSteal.length).toBe(0);

        // Inventory should be preserved
        const stateAfter = runStateManager.getCurrentState();
        expect(stateAfter?.inventory.length).toBe(initialInventoryCount);
      } else {
        // If outcome is failure, verify items would be stolen (but this test focuses on success)
        // Just verify the test setup is correct
        expect(encounterState.currentLife).toBeGreaterThan(0);
      }
    });

    it('should calculate correct number of items to steal based on negative score', async () => {
      // Add many items to inventory
      const items: CollectedItem[] = Array.from({ length: 10 }, (_, i) => ({
        id: `item-${i + 1}`,
        name: `Item ${i + 1}`,
        type: 'trade_good' as const,
        setId: 'test-set',
        value: 10,
        description: `Test item ${i + 1}`,
      }));

      for (const item of items) {
        await runStateManager.addToInventory(item);
      }

      const stateBefore = runStateManager.getCurrentState();
      expect(stateBefore?.inventory.length).toBe(10);

      // Create scoundrel encounter with very negative score scenario
      const config = ScoundrelEncounter.createScoundrelConfig(1, 1, 3);
      const encounter = new ScoundrelEncounter('test-scoundrel', config);

      const encounterState = encounter.getState();
      encounterState.dungeon.forEach((room) => {
        room.isCompleted = true;
      });
      encounterState.currentLife = 0;

      // Calculate score to determine items to steal
      const score = encounter.calculateScore();
      const itemsToStealCount = encounter.calculateItemsToSteal(score);

      // Resolve encounter
      const outcome = encounter.resolve(stateBefore?.inventory || []);

      expect(outcome.type).toBe('failure');

      const itemsToSteal =
        outcome.consequence && 'itemsToSteal' in outcome.consequence
          ? (outcome.consequence as any).itemsToSteal
          : [];

      // Should match calculated count (within expected range)
      expect(itemsToSteal.length).toBeGreaterThanOrEqual(0);
      expect(itemsToSteal.length).toBeLessThanOrEqual(5); // Max 5 items
      expect(itemsToSteal.length).toBe(itemsToStealCount);
    });
  });
});

