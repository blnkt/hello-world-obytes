import { act, renderHook } from '@testing-library/react';

import { getRunStateManager } from '@/lib/delvers-descent/run-state-manager';
import type {
  CollectedItem,
  DungeonNode,
  RunState,
} from '@/types/delvers-descent';

import { useRunState } from './use-run-state';

// Mock the run state manager
jest.mock('@/lib/delvers-descent/run-state-manager', () => ({
  getRunStateManager: jest.fn(),
}));

describe('useRunState', () => {
  let mockRunStateManager: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock run state manager
    mockRunStateManager = {
      getCurrentState: jest.fn(),
      initializeRun: jest.fn(),
      moveToNode: jest.fn(),
      addToInventory: jest.fn(),
      removeFromInventory: jest.fn(),
      updateEnergy: jest.fn(),
      completeRun: jest.fn(),
      bustRun: jest.fn(),
      getCurrentNode: jest.fn(),
      getAvailableMoves: jest.fn(),
      canAffordReturn: jest.fn(),
      getTotalInventoryValue: jest.fn(),
      clearActiveRun: jest.fn(),
    };

    (getRunStateManager as jest.Mock).mockReturnValue(mockRunStateManager);
  });

  describe('initialization', () => {
    it('should load initial run state', () => {
      const mockRunState: RunState = {
        runId: 'run-1',
        currentDepth: 1,
        currentNode: 'node-1',
        energyRemaining: 1000,
        inventory: [],
        visitedNodes: ['node-1'],
        discoveredShortcuts: [],
      };

      mockRunStateManager.getCurrentState.mockReturnValue(mockRunState);

      const { result } = renderHook(() => useRunState());

      expect(result.current.activeRunState).toEqual(mockRunState);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle no active run state', () => {
      mockRunStateManager.getCurrentState.mockReturnValue(null);

      const { result } = renderHook(() => useRunState());

      expect(result.current.activeRunState).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle errors during initialization', () => {
      mockRunStateManager.getCurrentState.mockImplementation(() => {
        throw new Error('Failed to load run state');
      });

      const { result } = renderHook(() => useRunState());

      expect(result.current.activeRunState).toBeNull();
      expect(result.current.error).toBe('Failed to load run state');
    });
  });

  describe('initializeRun', () => {
    it('should initialize a new run', async () => {
      const mockRunState: RunState = {
        runId: 'run-1',
        currentDepth: 1,
        currentNode: 'node-1',
        energyRemaining: 1000,
        inventory: [],
        visitedNodes: ['node-1'],
        discoveredShortcuts: [],
      };

      mockRunStateManager.getCurrentState.mockReturnValue(mockRunState);
      mockRunStateManager.initializeRun.mockResolvedValue(undefined);

      const { result } = renderHook(() => useRunState());

      let initializedRun: RunState;
      await act(async () => {
        initializedRun = await result.current.initializeRun('run-1', 1000);
      });

      expect(initializedRun!).toEqual(mockRunState);
      expect(result.current.activeRunState).toEqual(mockRunState);
      expect(mockRunStateManager.initializeRun).toHaveBeenCalledWith(
        'run-1',
        1000
      );
    });

    it('should handle errors during initialization', async () => {
      mockRunStateManager.initializeRun.mockRejectedValue(
        new Error('Failed to initialize run')
      );

      const { result } = renderHook(() => useRunState());

      await act(async () => {
        await expect(
          result.current.initializeRun('run-1', 1000)
        ).rejects.toThrow('Failed to initialize run');
      });

      expect(result.current.error).toBe('Failed to initialize run');
    });
  });

  describe('moveToNode', () => {
    it('should move to a node', async () => {
      const initialRunState: RunState = {
        runId: 'run-1',
        currentDepth: 1,
        currentNode: 'node-1',
        energyRemaining: 1000,
        inventory: [],
        visitedNodes: ['node-1'],
        discoveredShortcuts: [],
      };

      const updatedRunState: RunState = {
        runId: 'run-1',
        currentDepth: 2,
        currentNode: 'node-2',
        energyRemaining: 950,
        inventory: [],
        visitedNodes: ['node-1', 'node-2'],
        discoveredShortcuts: [],
      };

      mockRunStateManager.getCurrentState
        .mockReturnValueOnce(initialRunState) // Initial state
        .mockReturnValueOnce(updatedRunState); // After moveToNode
      mockRunStateManager.moveToNode.mockResolvedValue(undefined);

      const { result } = renderHook(() => useRunState());

      let newState: RunState;
      await act(async () => {
        newState = await result.current.moveToNode('node-2', 50);
      });

      expect(newState!).toEqual(updatedRunState);
      expect(result.current.activeRunState).toEqual(updatedRunState);
      expect(mockRunStateManager.moveToNode).toHaveBeenCalledWith('node-2', 50);
    });

    it('should handle errors when no active run state', async () => {
      mockRunStateManager.getCurrentState.mockReturnValue(null);

      const { result } = renderHook(() => useRunState());

      await act(async () => {
        await expect(result.current.moveToNode('node-2', 50)).rejects.toThrow(
          'No active run state'
        );
      });
    });
  });

  describe('addToInventory', () => {
    it('should add item to inventory', async () => {
      const initialRunState: RunState = {
        runId: 'run-1',
        currentDepth: 1,
        currentNode: 'node-1',
        energyRemaining: 1000,
        inventory: [],
        visitedNodes: ['node-1'],
        discoveredShortcuts: [],
      };

      const item: CollectedItem = {
        id: 'item-1',
        type: 'trade_good',
        setId: 'set-1',
        value: 100,
        name: 'Test Item',
        description: 'A test item for inventory',
      };

      const updatedRunState: RunState = {
        ...initialRunState,
        inventory: [item],
      };

      mockRunStateManager.getCurrentState
        .mockReturnValueOnce(initialRunState) // Initial state
        .mockReturnValueOnce(updatedRunState); // After addToInventory
      mockRunStateManager.addToInventory.mockResolvedValue(undefined);

      const { result } = renderHook(() => useRunState());

      let newState: RunState;
      await act(async () => {
        newState = await result.current.addToInventory(item);
      });

      expect(newState!).toEqual(updatedRunState);
      expect(result.current.activeRunState).toEqual(updatedRunState);
      expect(mockRunStateManager.addToInventory).toHaveBeenCalledWith(item);
    });
  });

  describe('removeFromInventory', () => {
    it('should remove item from inventory', async () => {
      const item: CollectedItem = {
        id: 'item-1',
        type: 'trade_good',
        setId: 'set-1',
        value: 100,
        name: 'Test Item',
        description: 'A test item for inventory',
      };

      const initialRunState: RunState = {
        runId: 'run-1',
        currentDepth: 1,
        currentNode: 'node-1',
        energyRemaining: 1000,
        inventory: [item],
        visitedNodes: ['node-1'],
        discoveredShortcuts: [],
      };

      const updatedRunState: RunState = {
        ...initialRunState,
        inventory: [],
      };

      mockRunStateManager.getCurrentState
        .mockReturnValueOnce(initialRunState) // Initial state
        .mockReturnValueOnce(updatedRunState); // After removeFromInventory
      mockRunStateManager.removeFromInventory.mockResolvedValue(undefined);

      const { result } = renderHook(() => useRunState());

      let newState: RunState;
      await act(async () => {
        newState = await result.current.removeFromInventory('item-1');
      });

      expect(newState!).toEqual(updatedRunState);
      expect(result.current.activeRunState).toEqual(updatedRunState);
      expect(mockRunStateManager.removeFromInventory).toHaveBeenCalledWith(
        'item-1'
      );
    });
  });

  describe('updateEnergy', () => {
    it('should update energy', async () => {
      const initialRunState: RunState = {
        runId: 'run-1',
        currentDepth: 1,
        currentNode: 'node-1',
        energyRemaining: 1000,
        inventory: [],
        visitedNodes: ['node-1'],
        discoveredShortcuts: [],
      };

      const updatedRunState: RunState = {
        ...initialRunState,
        energyRemaining: 900,
      };

      mockRunStateManager.getCurrentState
        .mockReturnValueOnce(initialRunState) // Initial state
        .mockReturnValueOnce(updatedRunState); // After updateEnergy
      mockRunStateManager.updateEnergy.mockResolvedValue(undefined);

      const { result } = renderHook(() => useRunState());

      let newState: RunState;
      await act(async () => {
        newState = await result.current.updateEnergy(-100);
      });

      expect(newState!).toEqual(updatedRunState);
      expect(result.current.activeRunState).toEqual(updatedRunState);
      expect(mockRunStateManager.updateEnergy).toHaveBeenCalledWith(-100);
    });
  });

  describe('completeRun', () => {
    it('should complete the run', async () => {
      const initialRunState: RunState = {
        runId: 'run-1',
        currentDepth: 1,
        currentNode: 'node-1',
        energyRemaining: 1000,
        inventory: [],
        visitedNodes: ['node-1'],
        discoveredShortcuts: [],
      };

      mockRunStateManager.getCurrentState.mockReturnValue(initialRunState);
      mockRunStateManager.completeRun.mockResolvedValue(undefined);

      const { result } = renderHook(() => useRunState());

      await act(async () => {
        await result.current.completeRun();
      });

      expect(mockRunStateManager.completeRun).toHaveBeenCalledWith();
      expect(result.current.activeRunState).toBeNull();
    });
  });

  describe('bustRun', () => {
    it('should bust the run', async () => {
      const initialRunState: RunState = {
        runId: 'run-1',
        currentDepth: 1,
        currentNode: 'node-1',
        energyRemaining: 1000,
        inventory: [],
        visitedNodes: ['node-1'],
        discoveredShortcuts: [],
      };

      mockRunStateManager.getCurrentState.mockReturnValue(initialRunState);
      mockRunStateManager.bustRun.mockResolvedValue(undefined);

      const { result } = renderHook(() => useRunState());

      await act(async () => {
        await result.current.bustRun();
      });

      expect(mockRunStateManager.bustRun).toHaveBeenCalledWith();
      expect(result.current.activeRunState).toBeNull();
    });
  });

  describe('getter functions', () => {
    it('should call appropriate getter methods', () => {
      const mockRunState: RunState = {
        runId: 'run-1',
        currentDepth: 1,
        currentNode: 'node-1',
        energyRemaining: 1000,
        inventory: [],
        visitedNodes: ['node-1'],
        discoveredShortcuts: [],
      };

      const mockNode: DungeonNode = {
        id: 'node-1',
        depth: 1,
        position: 0,
        type: 'puzzle_chamber',
        energyCost: 5,
        returnCost: 0,
        isRevealed: true,
        connections: ['node-2'],
      };

      const _mockMoves: DungeonNode[] = [mockNode];

      mockRunStateManager.getCurrentState.mockReturnValue(mockRunState);
      mockRunStateManager.getCurrentNode.mockReturnValue('node-1');
      mockRunStateManager.getAvailableMoves.mockReturnValue([]);
      mockRunStateManager.canAffordReturn.mockReturnValue(true);
      mockRunStateManager.getTotalInventoryValue.mockReturnValue(100);

      const { result } = renderHook(() => useRunState());

      expect(result.current.getCurrentNode()).toEqual('node-1');
      expect(result.current.getInventoryValue()).toBe(100);
    });
  });

  describe('clearActiveRun', () => {
    it('should clear active run', async () => {
      mockRunStateManager.clearActiveRun.mockResolvedValue(undefined);

      const { result } = renderHook(() => useRunState());

      await act(async () => {
        await result.current.clearActiveRun();
      });

      expect(result.current.activeRunState).toBeNull();
    });
  });

  describe('refresh', () => {
    it('should refresh state manually', async () => {
      const mockRunState: RunState = {
        runId: 'run-1',
        currentDepth: 1,
        currentNode: 'node-1',
        energyRemaining: 1000,
        inventory: [],
        visitedNodes: ['node-1'],
        discoveredShortcuts: [],
      };

      mockRunStateManager.getCurrentState.mockReturnValue(mockRunState);

      const { result } = renderHook(() => useRunState());

      await act(async () => {
        await result.current.refreshData();
      });

      expect(result.current.activeRunState).toEqual(mockRunState);
      expect(result.current.error).toBeNull();
    });
  });
});
