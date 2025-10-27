import type {
  CollectedItem,
  RunState,
  Shortcut,
} from '@/types/delvers-descent';

import { getRunStateManager, RunStateManager } from './run-state-manager';

// Mock storage
jest.mock('@/lib/storage', () => ({
  storage: {
    getString: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('RunStateManager', () => {
  let manager: RunStateManager;
  let mockStorage: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Get mock storage
    const { storage } = require('@/lib/storage');
    mockStorage = storage;

    // Mock empty storage by default
    mockStorage.getString.mockReturnValue(null);
    mockStorage.set.mockImplementation(() => {});
    mockStorage.delete.mockImplementation(() => {});

    // Create new manager instance
    manager = new RunStateManager();
  });

  describe('initializeRun', () => {
    it('should initialize a new run', async () => {
      await manager.initializeRun('run-123', 100);

      const state = manager.getCurrentState();
      expect(state).toBeDefined();
      expect(state?.runId).toBe('run-123');
      expect(state?.energyRemaining).toBe(100);
      expect(state?.currentDepth).toBe(0);
      expect(state?.currentNode).toBe('');
      expect(state?.inventory).toEqual([]);
      expect(state?.visitedNodes).toEqual([]);
      expect(state?.discoveredShortcuts).toEqual([]);
    });

    it('should throw error when trying to initialize while another run is active', async () => {
      await manager.initializeRun('run-123', 100);

      await expect(manager.initializeRun('run-456', 50)).rejects.toThrow(
        'Cannot initialize new run while another run is active'
      );
    });

    it('should allow reinitializing the same run', async () => {
      await manager.initializeRun('run-123', 100);
      await manager.initializeRun('run-123', 150);

      const state = manager.getCurrentState();
      expect(state?.energyRemaining).toBe(150);
    });
  });

  describe('moveToNode', () => {
    beforeEach(async () => {
      await manager.initializeRun('run-123', 100);
    });

    it('should move to a node successfully', async () => {
      await manager.moveToNode('depth1-node0', 10);

      const state = manager.getCurrentState();
      expect(state?.currentNode).toBe('depth1-node0');
      expect(state?.energyRemaining).toBe(90);
      expect(state?.currentDepth).toBe(1);
      expect(state?.visitedNodes).toContain('depth1-node0');
    });

    it('should throw error for insufficient energy', async () => {
      await expect(manager.moveToNode('depth1-node0', 150)).rejects.toThrow(
        'Insufficient energy to move to node'
      );
    });

    it('should throw error when no active run', async () => {
      await manager.clearActiveRun();

      await expect(manager.moveToNode('depth1-node0', 10)).rejects.toThrow(
        'No active run to move'
      );
    });

    it('should not add duplicate visited nodes', async () => {
      await manager.moveToNode('depth1-node0', 10);
      await manager.moveToNode('depth1-node0', 5);

      const state = manager.getCurrentState();
      expect(state?.visitedNodes).toEqual(['depth1-node0']);
    });

    it('should extract depth from node ID', async () => {
      await manager.moveToNode('depth3-node1', 10);

      const state = manager.getCurrentState();
      expect(state?.currentDepth).toBe(3);
    });
  });

  describe('addToInventory', () => {
    beforeEach(async () => {
      await manager.initializeRun('run-123', 100);
    });

    it('should add item to inventory', async () => {
      const item: CollectedItem = {
        id: 'item-1',
        type: 'trade_good',
        setId: 'silk_set',
        value: 50,
        name: 'Silk Fabric',
        description: 'Fine silk from the east',
      };

      await manager.addToInventory(item);

      const inventory = manager.getInventory();
      expect(inventory).toHaveLength(1);
      expect(inventory[0]).toEqual(item);
    });

    it('should throw error when inventory is full', async () => {
      // Fill inventory to capacity (50 items)
      for (let i = 0; i < 50; i++) {
        const item: CollectedItem = {
          id: `item-${i}`,
          type: 'trade_good',
          setId: 'test_set',
          value: 1,
          name: `Item ${i}`,
          description: `Test item ${i}`,
        };
        await manager.addToInventory(item);
      }

      const newItem: CollectedItem = {
        id: 'item-51',
        type: 'trade_good',
        setId: 'test_set',
        value: 1,
        name: 'Item 51',
        description: 'Test item 51',
      };

      await expect(manager.addToInventory(newItem)).rejects.toThrow(
        'Inventory is full'
      );
    });

    it('should throw error when no active run', async () => {
      await manager.clearActiveRun();

      const item: CollectedItem = {
        id: 'item-1',
        type: 'trade_good',
        setId: 'test_set',
        value: 1,
        name: 'Test Item',
        description: 'Test item',
      };

      await expect(manager.addToInventory(item)).rejects.toThrow(
        'No active run to add item to'
      );
    });
  });

  describe('removeFromInventory', () => {
    beforeEach(async () => {
      await manager.initializeRun('run-123', 100);

      const item: CollectedItem = {
        id: 'item-1',
        type: 'trade_good',
        setId: 'test_set',
        value: 50,
        name: 'Test Item',
        description: 'Test item',
      };
      await manager.addToInventory(item);
    });

    it('should remove item from inventory', async () => {
      const removedItem = await manager.removeFromInventory('item-1');

      expect(removedItem).toBeDefined();
      expect(removedItem?.id).toBe('item-1');

      const inventory = manager.getInventory();
      expect(inventory).toHaveLength(0);
    });

    it('should return null for non-existent item', async () => {
      const removedItem = await manager.removeFromInventory('non-existent');

      expect(removedItem).toBeNull();
    });

    it('should throw error when no active run', async () => {
      await manager.clearActiveRun();

      await expect(manager.removeFromInventory('item-1')).rejects.toThrow(
        'No active run to remove item from'
      );
    });
  });

  describe('updateEnergy', () => {
    beforeEach(async () => {
      await manager.initializeRun('run-123', 100);
    });

    it('should increase energy', async () => {
      await manager.updateEnergy(20);

      expect(manager.getCurrentEnergy()).toBe(120);
    });

    it('should decrease energy', async () => {
      await manager.updateEnergy(-30);

      expect(manager.getCurrentEnergy()).toBe(70);
    });

    it('should not allow negative energy', async () => {
      await manager.updateEnergy(-150);

      expect(manager.getCurrentEnergy()).toBe(0);
    });

    it('should throw error when no active run', async () => {
      await manager.clearActiveRun();

      await expect(manager.updateEnergy(20)).rejects.toThrow(
        'No active run to update energy for'
      );
    });
  });

  describe('addShortcut', () => {
    beforeEach(async () => {
      await manager.initializeRun('run-123', 100);
    });

    it('should add shortcut', async () => {
      const shortcut: Shortcut = {
        id: 'shortcut-1',
        fromDepth: 3,
        toDepth: 1,
        energyReduction: 20,
        isPermanent: true,
      };

      await manager.addShortcut(shortcut);

      const shortcuts = manager.getDiscoveredShortcuts();
      expect(shortcuts).toHaveLength(1);
      expect(shortcuts[0]).toEqual(shortcut);
    });

    it('should not add duplicate shortcuts', async () => {
      const shortcut: Shortcut = {
        id: 'shortcut-1',
        fromDepth: 3,
        toDepth: 1,
        energyReduction: 20,
        isPermanent: true,
      };

      await manager.addShortcut(shortcut);
      await manager.addShortcut(shortcut);

      const shortcuts = manager.getDiscoveredShortcuts();
      expect(shortcuts).toHaveLength(1);
    });

    it('should throw error when no active run', async () => {
      await manager.clearActiveRun();

      const shortcut: Shortcut = {
        id: 'shortcut-1',
        fromDepth: 3,
        toDepth: 1,
        energyReduction: 20,
        isPermanent: true,
      };

      await expect(manager.addShortcut(shortcut)).rejects.toThrow(
        'No active run to add shortcut to'
      );
    });
  });

  describe('completeRun', () => {
    beforeEach(async () => {
      await manager.initializeRun('run-123', 100);

      // Add some items and shortcuts
      const item: CollectedItem = {
        id: 'item-1',
        type: 'trade_good',
        setId: 'test_set',
        value: 50,
        name: 'Test Item',
        description: 'Test item',
      };
      await manager.addToInventory(item);

      const shortcut: Shortcut = {
        id: 'shortcut-1',
        fromDepth: 3,
        toDepth: 1,
        energyReduction: 20,
        isPermanent: true,
      };
      await manager.addShortcut(shortcut);

      await manager.moveToNode('depth2-node0', 20);
    });

    it('should complete run successfully', async () => {
      const result = await manager.completeRun();

      expect(result.finalInventory).toHaveLength(1);
      expect(result.shortcutsDiscovered).toHaveLength(1);
      expect(result.deepestDepth).toBe(2);

      expect(manager.hasActiveRun()).toBe(false);
    });

    it('should throw error when no active run', async () => {
      await manager.clearActiveRun();

      await expect(manager.completeRun()).rejects.toThrow(
        'No active run to complete'
      );
    });
  });

  describe('bustRun', () => {
    beforeEach(async () => {
      await manager.initializeRun('run-123', 100);

      const shortcut: Shortcut = {
        id: 'shortcut-1',
        fromDepth: 3,
        toDepth: 1,
        energyReduction: 20,
        isPermanent: true,
      };
      await manager.addShortcut(shortcut);

      await manager.moveToNode('depth2-node0', 20);
    });

    it('should bust run successfully', async () => {
      const result = await manager.bustRun();

      expect(result.energyLost).toBe(80);
      expect(result.deepestDepth).toBe(2);
      expect(result.shortcutsDiscovered).toHaveLength(1);

      expect(manager.hasActiveRun()).toBe(false);
    });

    it('should throw error when no active run', async () => {
      await manager.clearActiveRun();

      await expect(manager.bustRun()).rejects.toThrow('No active run to bust');
    });
  });

  describe('getter methods', () => {
    beforeEach(async () => {
      await manager.initializeRun('run-123', 100);

      const item: CollectedItem = {
        id: 'item-1',
        type: 'trade_good',
        setId: 'silk_set',
        value: 50,
        name: 'Silk Fabric',
        description: 'Fine silk',
      };
      await manager.addToInventory(item);

      await manager.moveToNode('depth1-node0', 10);
    });

    it('should return current state', () => {
      const state = manager.getCurrentState();
      expect(state).toBeDefined();
      expect(state?.runId).toBe('run-123');
    });

    it('should return current energy', () => {
      expect(manager.getCurrentEnergy()).toBe(90);
    });

    it('should return current depth', () => {
      expect(manager.getCurrentDepth()).toBe(1);
    });

    it('should return current node', () => {
      expect(manager.getCurrentNode()).toBe('depth1-node0');
    });

    it('should return inventory', () => {
      const inventory = manager.getInventory();
      expect(inventory).toHaveLength(1);
    });

    it('should return visited nodes', () => {
      const visitedNodes = manager.getVisitedNodes();
      expect(visitedNodes).toContain('depth1-node0');
    });

    it('should return discovered shortcuts', async () => {
      const shortcut: Shortcut = {
        id: 'shortcut-1',
        fromDepth: 3,
        toDepth: 1,
        energyReduction: 20,
        isPermanent: true,
      };
      await manager.addShortcut(shortcut);

      const shortcuts = manager.getDiscoveredShortcuts();
      expect(shortcuts).toHaveLength(1);
    });
  });

  describe('inventory query methods', () => {
    beforeEach(async () => {
      await manager.initializeRun('run-123', 100);

      const items: CollectedItem[] = [
        {
          id: 'item-1',
          type: 'trade_good',
          setId: 'silk_set',
          value: 50,
          name: 'Silk Fabric',
          description: 'Fine silk',
        },
        {
          id: 'item-2',
          type: 'discovery',
          setId: 'silk_set',
          value: 100,
          name: 'Ancient Map',
          description: 'Old map',
        },
        {
          id: 'item-3',
          type: 'trade_good',
          setId: 'spice_set',
          value: 75,
          name: 'Spices',
          description: 'Rare spices',
        },
      ];

      for (const item of items) {
        await manager.addToInventory(item);
      }
    });

    it('should get inventory item by ID', () => {
      const item = manager.getInventoryItem('item-1');
      expect(item?.name).toBe('Silk Fabric');
    });

    it('should return null for non-existent item', () => {
      const item = manager.getInventoryItem('non-existent');
      expect(item).toBeNull();
    });

    it('should get inventory items by type', () => {
      const tradeGoods = manager.getInventoryItemsByType('trade_good');
      expect(tradeGoods).toHaveLength(2);

      const discoveries = manager.getInventoryItemsByType('discovery');
      expect(discoveries).toHaveLength(1);
    });

    it('should get inventory items by set ID', () => {
      const silkItems = manager.getInventoryItemsBySet('silk_set');
      expect(silkItems).toHaveLength(2);

      const spiceItems = manager.getInventoryItemsBySet('spice_set');
      expect(spiceItems).toHaveLength(1);
    });

    it('should calculate total inventory value', () => {
      const totalValue = manager.getTotalInventoryValue();
      expect(totalValue).toBe(225); // 50 + 100 + 75
    });
  });

  describe('run statistics', () => {
    beforeEach(async () => {
      await manager.initializeRun('run-123', 100);

      const item: CollectedItem = {
        id: 'item-1',
        type: 'trade_good',
        setId: 'test_set',
        value: 50,
        name: 'Test Item',
        description: 'Test item',
      };
      await manager.addToInventory(item);

      const shortcut: Shortcut = {
        id: 'shortcut-1',
        fromDepth: 3,
        toDepth: 1,
        energyReduction: 20,
        isPermanent: true,
      };
      await manager.addShortcut(shortcut);

      await manager.moveToNode('depth1-node0', 10);
      await manager.moveToNode('depth2-node1', 15);
    });

    it('should return run statistics', () => {
      const stats = manager.getRunStatistics();

      expect(stats.energyRemaining).toBe(75);
      expect(stats.currentDepth).toBe(2);
      expect(stats.nodesVisited).toBe(2);
      expect(stats.itemsCollected).toBe(1);
      expect(stats.shortcutsDiscovered).toBe(1);
      expect(stats.inventoryValue).toBe(50);
    });

    it('should return zero stats when no active run', async () => {
      await manager.clearActiveRun();

      const stats = manager.getRunStatistics();

      expect(stats.energyRemaining).toBe(0);
      expect(stats.currentDepth).toBe(0);
      expect(stats.nodesVisited).toBe(0);
      expect(stats.itemsCollected).toBe(0);
      expect(stats.shortcutsDiscovered).toBe(0);
      expect(stats.inventoryValue).toBe(0);
    });
  });

  describe('validation', () => {
    it('should validate correct state', async () => {
      await manager.initializeRun('run-123', 100);

      const validation = manager.validateState();
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should detect negative energy', async () => {
      await manager.initializeRun('run-123', 100);

      // Manually set negative energy to test validation (simulating corrupted state)
      // We need to access the internal state directly since getCurrentState returns a copy
      const managerAny = manager as any;
      if (managerAny.currentState) {
        managerAny.currentState.energyRemaining = -10;
      }

      const validation = manager.validateState();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        'Energy remaining cannot be negative'
      );
    });

    it('should detect duplicate items', async () => {
      await manager.initializeRun('run-123', 100);

      const item: CollectedItem = {
        id: 'item-1',
        type: 'trade_good',
        setId: 'test_set',
        value: 50,
        name: 'Test Item',
        description: 'Test item',
      };

      await manager.addToInventory(item);

      // Manually add duplicate (simulating corrupted state)
      const state = manager.getCurrentState();
      if (state) {
        state.inventory.push(item);
      }

      const validation = manager.validateState();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Duplicate items found in inventory');
    });
  });

  describe('storage integration', () => {
    it('should load state from storage on initialization', () => {
      const existingState: RunState = {
        runId: 'run-123',
        currentDepth: 2,
        currentNode: 'depth2-node0',
        energyRemaining: 80,
        inventory: [],
        visitedNodes: ['depth1-node0', 'depth2-node0'],
        discoveredShortcuts: [],
      };

      mockStorage.getString.mockReturnValue(JSON.stringify(existingState));

      const newManager = new RunStateManager();
      const state = newManager.getCurrentState();

      expect(state).toEqual(existingState);
    });

    it('should handle corrupted storage data', () => {
      mockStorage.getString.mockReturnValue('invalid json');

      const newManager = new RunStateManager();
      const state = newManager.getCurrentState();

      expect(state).toBeNull();
    });

    it('should handle null storage data', () => {
      mockStorage.getString.mockReturnValue(null);

      const newManager = new RunStateManager();
      const state = newManager.getCurrentState();

      expect(state).toBeNull();
    });
  });

  describe('helper methods', () => {
    beforeEach(async () => {
      await manager.initializeRun('run-123', 100);

      await manager.moveToNode('depth1-node0', 10);

      const shortcut: Shortcut = {
        id: 'shortcut-1',
        fromDepth: 3,
        toDepth: 1,
        energyReduction: 20,
        isPermanent: true,
      };
      await manager.addShortcut(shortcut);
    });

    it('should check if node has been visited', () => {
      expect(manager.hasVisitedNode('depth1-node0')).toBe(true);
      expect(manager.hasVisitedNode('depth2-node0')).toBe(false);
    });

    it('should check if shortcut has been discovered', () => {
      expect(manager.hasDiscoveredShortcut('shortcut-1')).toBe(true);
      expect(manager.hasDiscoveredShortcut('shortcut-2')).toBe(false);
    });
  });
});

describe('Singleton getRunStateManager', () => {
  it('should return the same instance', () => {
    const manager1 = getRunStateManager();
    const manager2 = getRunStateManager();

    expect(manager1).toBe(manager2);
  });
});
