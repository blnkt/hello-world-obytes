import '@testing-library/jest-dom';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import type { DelvingRun, DungeonNode, RunState } from '@/types/delvers-descent';

import ActiveRunRoute from '../active-run';

// Mock the encounter resolver and map generator
jest.mock('@/components/delvers-descent/hooks/use-encounter-resolver');
jest.mock('@/components/delvers-descent/hooks/use-map-generator');
jest.mock('@/lib/delvers-descent/run-queue');

const mockGetRunById = jest.fn();
const mockUseMapGenerator = jest.fn();
const mockUseEncounterResolver = jest.fn();

jest.mock('@/lib/delvers-descent/run-queue', () => ({
  getRunQueueManager: () => ({
    getRunById: mockGetRunById,
  }),
}));

jest.mock('@/components/delvers-descent/hooks/use-map-generator', () => ({
  useMapGenerator: () => mockUseMapGenerator(),
}));

describe('ActiveRunRoute Integration Tests', () => {
  const mockRun: DelvingRun = {
    id: 'test-run-1',
    date: '2024-01-01',
    steps: 10000,
    baseEnergy: 1000,
    bonusEnergy: 0,
    totalEnergy: 1000,
    hasStreakBonus: false,
    status: 'active',
  };

  const mockNodes: DungeonNode[] = [
    {
      id: 'node-1',
      depth: 1,
      position: 1,
      type: 'puzzle_chamber',
      energyCost: 50,
      returnCost: 100,
      isRevealed: true,
      connections: ['node-2'],
    },
    {
      id: 'node-2',
      depth: 2,
      position: 1,
      type: 'trade_opportunity',
      energyCost: 75,
      returnCost: 150,
      isRevealed: true,
      connections: ['node-3'],
    },
    {
      id: 'node-3',
      depth: 3,
      position: 1,
      type: 'discovery_site',
      energyCost: 100,
      returnCost: 200,
      isRevealed: true,
      connections: [],
    },
  ];

  const mockRunState: RunState = {
    runId: 'test-run-1',
    currentDepth: 0,
    currentNode: '',
    energyRemaining: 1000,
    inventory: [],
    visitedNodes: [],
    discoveredShortcuts: [],
  };

  beforeEach(() => {
    mockGetRunById.mockReturnValue(mockRun);
    mockUseMapGenerator.mockReturnValue({
      generateFullMap: jest.fn(() => mockNodes),
    });
  });

  describe('Run Loading and Display', () => {
    it('should display run details on load', async () => {
      render(<ActiveRunRoute />);

      await waitFor(() => {
        expect(screen.getByText(/active run/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/energy: 1000/i)).toBeInTheDocument();
      expect(screen.getByText(/steps: 10,000/i)).toBeInTheDocument();
    });

    it('should show error when run not found', async () => {
      mockGetRunById.mockReturnValue(null);

      render(<ActiveRunRoute />);

      await waitFor(() => {
        expect(screen.getByText(/run not found/i)).toBeInTheDocument();
      });
    });

    it('should display current energy remaining', async () => {
      render(<ActiveRunRoute />);

      await waitFor(() => {
        expect(screen.getByTestId('energy-remaining')).toBeInTheDocument();
      });

      // Energy should show 1000 initially
      expect(screen.getByText(/1000/i)).toBeInTheDocument();
    });

    it('should display current depth', async () => {
      render(<ActiveRunRoute />);

      await waitFor(() => {
        expect(screen.getByTestId('current-depth')).toBeInTheDocument();
      });

      // Should start at depth 0
      expect(screen.getByText(/depth 0/i)).toBeInTheDocument();
    });
  });

  describe('Interactive Map', () => {
    it('should render interactive map with nodes', async () => {
      render(<ActiveRunRoute />);

      await waitFor(() => {
        expect(screen.getByTestId(/node-node-1/)).toBeInTheDocument();
      });

      // Should show Depth 1 header
      expect(screen.getByText(/depth 1/i)).toBeInTheDocument();
    });

    it('should mark nodes as available based on current depth', async () => {
      render(<ActiveRunRoute />);

      await waitFor(() => {
        const node1 = screen.getByTestId(/node-node-1/);
        expect(node1).toBeInTheDocument();
      });

      // Node at depth 1 should be available
      const node1 = screen.getByTestId(/node-node-1/);
      expect(node1).not.toBeDisabled();
    });

    it('should mark deeper nodes as unavailable initially', async () => {
      render(<ActiveRunRoute />);

      await waitFor(() => {
        const node2 = screen.getByTestId(/node-node-2/);
        expect(node2).toBeInTheDocument();
      });

      // Node at depth 2 should be disabled initially
      const node2 = screen.getByTestId(/node-node-2/);
      expect(node2).toBeDisabled();
    });

    it('should enable next depth nodes after visiting current depth', async () => {
      render(<ActiveRunRoute />);

      await waitFor(() => {
        const node1 = screen.getByTestId(/node-node-1/);
        fireEvent.press(node1);
      });

      // After visiting depth 1, depth 2 nodes should become available
      await waitFor(() => {
        const node2 = screen.getByTestId(/node-node-2/);
        expect(node2).not.toBeDisabled();
      });
    });
  });

  describe('Energy Management', () => {
    it('should prevent visiting nodes with insufficient energy', async () => {
      render(<ActiveRunRoute />);

      // Set energy to less than node cost
      await waitFor(() => {
        const node1 = screen.getByTestId(/node-node-1/);
        fireEvent.press(node1);
      });

      // The encounter should check energy before allowing visit
      expect(screen.getByText(/not enough energy/i)).toBeInTheDocument();
    });

    it('should update energy after completing an encounter', async () => {
      render(<ActiveRunRoute />);

      // Start with 1000 energy
      expect(screen.getByText(/1000/i)).toBeInTheDocument();

      // Visit a node that costs 50 energy
      await waitFor(() => {
        const node1 = screen.getByTestId(/node-node-1/);
        fireEvent.press(node1);
      });

      // Energy should decrease by node cost (1000 - 50 = 950)
      await waitFor(() => {
        expect(screen.getByText(/950/i)).toBeInTheDocument();
      });
    });

    it('should apply failure penalties to energy', async () => {
      render(<ActiveRunRoute />);

      // Start with 1000 energy
      expect(screen.getByText(/1000/i)).toBeInTheDocument();

      // Visit a node and fail the encounter
      await waitFor(() => {
        const node1 = screen.getByTestId(/node-node-1/);
        fireEvent.press(node1);
      });

      // Simulate failure
      const failButton = screen.getByTestId('fail-encounter');
      fireEvent.press(failButton);

      // Energy should decrease by node cost plus failure penalty
      await waitFor(() => {
        expect(screen.getByText(/900/i)).toBeInTheDocument(); // Assuming 100 penalty
      });
    });
  });

  describe('Depth Progression', () => {
    it('should advance depth after completing encounters', async () => {
      render(<ActiveRunRoute />);

      // Start at depth 0
      expect(screen.getByText(/depth 0/i)).toBeInTheDocument();

      // Complete an encounter at depth 1
      await waitFor(() => {
        const node1 = screen.getByTestId(/node-node-1/);
        fireEvent.press(node1);
      });

      // Should show current depth updated
      await waitFor(() => {
        expect(screen.getByText(/depth 1/i)).toBeInTheDocument();
      });
    });

    it('should unlock nodes at next depth after progression', async () => {
      render(<ActiveRunRoute />);

      // Complete encounter at depth 1
      await waitFor(() => {
        const node1 = screen.getByTestId(/node-node-1/);
        fireEvent.press(node1);
      });

      // Complete the encounter successfully
      const returnButton = screen.getByTestId('return-to-map');
      fireEvent.press(returnButton);

      // Depth 2 nodes should now be available
      await waitFor(() => {
        const node2 = screen.getByTestId(/node-node-2/);
        expect(node2).not.toBeDisabled();
      });
    });
  });

  describe('Encounter Completion Handlers', () => {
    it('should update inventory on successful encounter', async () => {
      render(<ActiveRunRoute />);

      await waitFor(() => {
        const node1 = screen.getByTestId(/node-node-1/);
        fireEvent.press(node1);
      });

      // Complete encounter successfully
      const tile = screen.getByTestId('tile-0-0');
      fireEvent.press(tile);

      // Find exit tile to complete
      const exitTile = screen.getByTestId('tile-exit');
      fireEvent.press(exitTile);

      await waitFor(() => {
        // Inventory should be updated
        expect(mockRunState.inventory.length).toBeGreaterThan(0);
      });
    });

    it('should mark nodes as visited after completion', async () => {
      render(<ActiveRunRoute />);

      await waitFor(() => {
        const node1 = screen.getByTestId(/node-node-1/);
        fireEvent.press(node1);
      });

      // Complete the encounter
      const returnButton = screen.getByTestId('return-to-map');
      fireEvent.press(returnButton);

      await waitFor(() => {
        // Node should be marked as visited
        expect(mockRunState.visitedNodes).toContain('node-1');
      });
    });
  });

  describe('Return to Map Functionality', () => {
    it('should return to map from encounter screen', async () => {
      render(<ActiveRunRoute />);

      // Start encounter
      await waitFor(() => {
        const node1 = screen.getByTestId(/node-node-1/);
        fireEvent.press(node1);
      });

      // Should show encounter screen
      expect(screen.getByTestId('encounter-screen')).toBeInTheDocument();

      // Click return to map
      const returnButton = screen.getByTestId('return-to-map');
      fireEvent.press(returnButton);

      // Should return to map
      await waitFor(() => {
        expect(screen.queryByTestId('encounter-screen')).not.toBeInTheDocument();
        expect(screen.getByText(/delver's descent/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle error loading run data', async () => {
      mockGetRunById.mockImplementation(() => {
        throw new Error('Failed to load run');
      });

      render(<ActiveRunRoute />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load run/i)).toBeInTheDocument();
      });
    });

    it('should handle error generating map', async () => {
      mockUseMapGenerator.mockReturnValue({
        generateFullMap: jest.fn(() => {
          throw new Error('Failed to generate map');
        }),
      });

      render(<ActiveRunRoute />);

      await waitFor(() => {
        expect(screen.getByText(/error loading run/i)).toBeInTheDocument();
      });
    });
  });
});

