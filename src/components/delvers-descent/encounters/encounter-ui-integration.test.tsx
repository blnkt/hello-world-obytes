import '@testing-library/jest-dom';

import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import React from 'react';

import type {
  DelvingRun,
  DungeonNode,
  EncounterType,
} from '@/types/delvers-descent';

import { useEncounterResolver } from '../hooks/use-encounter-resolver';
import { DiscoverySiteScreen } from './discovery-site-screen';
import { EncounterScreen } from './encounter-screen';
import { PuzzleChamberScreen } from './puzzle-chamber-screen';
import { TradeOpportunityScreen } from './trade-opportunity-screen';

// Mock the encounter resolver hook
jest.mock('../hooks/use-encounter-resolver');
const mockUseEncounterResolver = useEncounterResolver as jest.MockedFunction<
  typeof useEncounterResolver
>;

describe('Encounter UI Integration', () => {
  const mockRun: DelvingRun = {
    id: 'test-run',
    date: '2024-01-01',
    steps: 10000,
    baseEnergy: 10000,
    bonusEnergy: 0,
    totalEnergy: 10000,
    hasStreakBonus: false,
    status: 'active',
  };

  const mockNode: DungeonNode = {
    id: 'node-1',
    depth: 3,
    position: 1,
    type: 'puzzle_chamber',
    energyCost: 15,
    returnCost: 45,
    isRevealed: true,
    connections: [],
  };

  beforeEach(() => {
    mockUseEncounterResolver.mockReturnValue({
      encounterResolver: null,
      isLoading: false,
      error: null,
      startEncounter: jest.fn(),
      updateEncounterProgress: jest.fn(),
      completeEncounter: jest.fn(),
      getEncounterState: jest.fn(),
      clearEncounterState: jest.fn(),
    });
  });

  describe('EncounterScreen', () => {
    it('should render with proper props', () => {
      render(
        <EncounterScreen
          run={mockRun}
          node={mockNode}
          onReturnToMap={jest.fn()}
          onEncounterComplete={jest.fn()}
        />
      );

      expect(screen.getByTestId('encounter-screen')).toBeInTheDocument();
    });

    it('should route to PuzzleChamberScreen for puzzle_chamber encounters', () => {
      const puzzleNode = {
        ...mockNode,
        type: 'puzzle_chamber' as EncounterType,
      };

      render(
        <EncounterScreen
          run={mockRun}
          node={puzzleNode}
          onReturnToMap={jest.fn()}
          onEncounterComplete={jest.fn()}
        />
      );

      expect(screen.getByTestId('puzzle-chamber-screen')).toBeInTheDocument();
    });

    it('should route to TradeOpportunityScreen for trade_opportunity encounters', () => {
      const tradeNode = {
        ...mockNode,
        type: 'trade_opportunity' as EncounterType,
      };

      render(
        <EncounterScreen
          run={mockRun}
          node={tradeNode}
          onReturnToMap={jest.fn()}
          onEncounterComplete={jest.fn()}
        />
      );

      expect(
        screen.getByTestId('trade-opportunity-screen')
      ).toBeInTheDocument();
    });

    it('should route to DiscoverySiteScreen for discovery_site encounters', () => {
      const discoveryNode = {
        ...mockNode,
        type: 'discovery_site' as EncounterType,
      };

      render(
        <EncounterScreen
          run={mockRun}
          node={discoveryNode}
          onReturnToMap={jest.fn()}
          onEncounterComplete={jest.fn()}
        />
      );

      expect(screen.getByTestId('discovery-site-screen')).toBeInTheDocument();
    });

    it('should handle unknown encounter types gracefully', () => {
      const unknownNode = {
        ...mockNode,
        type: 'unknown_type' as EncounterType,
      };

      render(
        <EncounterScreen
          run={mockRun}
          node={unknownNode}
          onReturnToMap={jest.fn()}
          onEncounterComplete={jest.fn()}
        />
      );

      expect(screen.getByTestId('encounter-error')).toBeInTheDocument();
      expect(
        screen.getByText(/unsupported encounter type/i)
      ).toBeInTheDocument();
    });

    it('should show loading state when encounter resolver is loading', () => {
      mockUseEncounterResolver.mockReturnValue({
        encounterResolver: null,
        isLoading: true,
        error: null,
        startEncounter: jest.fn(),
        updateEncounterProgress: jest.fn(),
        completeEncounter: jest.fn(),
        getEncounterState: jest.fn(),
        clearEncounterState: jest.fn(),
      });

      render(
        <EncounterScreen
          run={mockRun}
          node={mockNode}
          onReturnToMap={jest.fn()}
          onEncounterComplete={jest.fn()}
        />
      );

      expect(screen.getByTestId('encounter-loading')).toBeInTheDocument();
    });

    it('should show error state when encounter resolver has error', () => {
      mockUseEncounterResolver.mockReturnValue({
        encounterResolver: null,
        isLoading: false,
        error: 'Failed to load encounter',
        startEncounter: jest.fn(),
        updateEncounterProgress: jest.fn(),
        completeEncounter: jest.fn(),
        getEncounterState: jest.fn(),
        clearEncounterState: jest.fn(),
      });

      render(
        <EncounterScreen
          run={mockRun}
          node={mockNode}
          onReturnToMap={jest.fn()}
          onEncounterComplete={jest.fn()}
        />
      );

      expect(screen.getByTestId('encounter-error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load encounter')).toBeInTheDocument();
    });
  });

  describe('PuzzleChamberScreen', () => {
    it('should render puzzle chamber interface', () => {
      render(
        <PuzzleChamberScreen
          run={mockRun}
          node={mockNode}
          onReturnToMap={jest.fn()}
          onEncounterComplete={jest.fn()}
        />
      );

      expect(screen.getByTestId('puzzle-chamber-screen')).toBeInTheDocument();
      expect(screen.getByText(/puzzle chamber/i)).toBeInTheDocument();
    });

    it('should display tile grid', () => {
      render(
        <PuzzleChamberScreen
          run={mockRun}
          node={mockNode}
          onReturnToMap={jest.fn()}
          onEncounterComplete={jest.fn()}
        />
      );

      expect(screen.getByTestId('tile-grid')).toBeInTheDocument();
    });

    it('should show remaining reveals count', () => {
      render(
        <PuzzleChamberScreen
          run={mockRun}
          node={mockNode}
          onReturnToMap={jest.fn()}
          onEncounterComplete={jest.fn()}
        />
      );

      expect(screen.getByTestId('remaining-reveals')).toBeInTheDocument();
    });

    it('should handle tile reveal interactions', async () => {
      const onEncounterComplete = jest.fn();

      render(
        <PuzzleChamberScreen
          run={mockRun}
          node={mockNode}
          onReturnToMap={jest.fn()}
          onEncounterComplete={onEncounterComplete}
        />
      );

      const tile = screen.getByTestId('tile-0-0');
      fireEvent.click(tile);

      await waitFor(() => {
        expect(screen.getByTestId('tile-0-0')).toHaveClass('revealed');
      });
    });

    it('should disable tiles when no reveals remaining', () => {
      render(
        <PuzzleChamberScreen
          run={mockRun}
          node={mockNode}
          onReturnToMap={jest.fn()}
          onEncounterComplete={jest.fn()}
        />
      );

      // Simulate no reveals remaining
      const remainingReveals = screen.getByTestId('remaining-reveals');
      expect(remainingReveals).toHaveTextContent('0');

      const tiles = screen.getAllByTestId(/^tile-/);
      tiles.forEach((tile) => {
        expect(tile).toBeDisabled();
      });
    });

    it('should show encounter completion when exit found', async () => {
      const onEncounterComplete = jest.fn();

      render(
        <PuzzleChamberScreen
          run={mockRun}
          node={mockNode}
          onReturnToMap={jest.fn()}
          onEncounterComplete={onEncounterComplete}
        />
      );

      // Simulate finding exit tile
      const exitTile = screen.getByTestId('tile-exit');
      fireEvent.click(exitTile);

      await waitFor(() => {
        expect(screen.getByTestId('encounter-success')).toBeInTheDocument();
        expect(onEncounterComplete).toHaveBeenCalled();
      });
    });
  });

  describe('TradeOpportunityScreen', () => {
    it('should render trade opportunity interface', () => {
      const tradeNode = {
        ...mockNode,
        type: 'trade_opportunity' as EncounterType,
      };

      render(
        <TradeOpportunityScreen
          run={mockRun}
          node={tradeNode}
          onReturnToMap={jest.fn()}
          onEncounterComplete={jest.fn()}
        />
      );

      expect(
        screen.getByTestId('trade-opportunity-screen')
      ).toBeInTheDocument();
      expect(screen.getByText(/trade opportunity/i)).toBeInTheDocument();
    });

    it('should display trade options', () => {
      const tradeNode = {
        ...mockNode,
        type: 'trade_opportunity' as EncounterType,
      };

      render(
        <TradeOpportunityScreen
          run={mockRun}
          node={tradeNode}
          onReturnToMap={jest.fn()}
          onEncounterComplete={jest.fn()}
        />
      );

      expect(screen.getByTestId('trade-options')).toBeInTheDocument();
    });

    it('should show trade posts information', () => {
      const tradeNode = {
        ...mockNode,
        type: 'trade_opportunity' as EncounterType,
      };

      render(
        <TradeOpportunityScreen
          run={mockRun}
          node={tradeNode}
          onReturnToMap={jest.fn()}
          onEncounterComplete={jest.fn()}
        />
      );

      expect(screen.getByTestId('trade-posts')).toBeInTheDocument();
    });

    it('should handle trade decision selection', async () => {
      const onEncounterComplete = jest.fn();
      const tradeNode = {
        ...mockNode,
        type: 'trade_opportunity' as EncounterType,
      };

      render(
        <TradeOpportunityScreen
          run={mockRun}
          node={tradeNode}
          onReturnToMap={jest.fn()}
          onEncounterComplete={onEncounterComplete}
        />
      );

      const tradeOption = screen.getByTestId('trade-option-A');
      fireEvent.click(tradeOption);

      await waitFor(() => {
        expect(screen.getByTestId('trade-result')).toBeInTheDocument();
      });
    });

    it('should show arbitrage opportunities', () => {
      const tradeNode = {
        ...mockNode,
        type: 'trade_opportunity' as EncounterType,
      };

      render(
        <TradeOpportunityScreen
          run={mockRun}
          node={tradeNode}
          onReturnToMap={jest.fn()}
          onEncounterComplete={jest.fn()}
        />
      );

      expect(screen.getByTestId('arbitrage-opportunities')).toBeInTheDocument();
    });
  });

  describe('DiscoverySiteScreen', () => {
    it('should render discovery site interface', () => {
      const discoveryNode = {
        ...mockNode,
        type: 'discovery_site' as EncounterType,
      };

      render(
        <DiscoverySiteScreen
          run={mockRun}
          node={discoveryNode}
          onReturnToMap={jest.fn()}
          onEncounterComplete={jest.fn()}
        />
      );

      expect(screen.getByTestId('discovery-site-screen')).toBeInTheDocument();
      expect(screen.getByText(/discovery site/i)).toBeInTheDocument();
    });

    it('should display exploration paths', () => {
      const discoveryNode = {
        ...mockNode,
        type: 'discovery_site' as EncounterType,
      };

      render(
        <DiscoverySiteScreen
          run={mockRun}
          node={discoveryNode}
          onReturnToMap={jest.fn()}
          onEncounterComplete={jest.fn()}
        />
      );

      expect(screen.getByTestId('exploration-paths')).toBeInTheDocument();
    });

    it('should show risk assessment for each path', () => {
      const discoveryNode = {
        ...mockNode,
        type: 'discovery_site' as EncounterType,
      };

      render(
        <DiscoverySiteScreen
          run={mockRun}
          node={discoveryNode}
          onReturnToMap={jest.fn()}
          onEncounterComplete={jest.fn()}
        />
      );

      expect(screen.getByTestId('path-risk-assessment')).toBeInTheDocument();
    });

    it('should handle exploration path selection', async () => {
      const onEncounterComplete = jest.fn();
      const discoveryNode = {
        ...mockNode,
        type: 'discovery_site' as EncounterType,
      };

      render(
        <DiscoverySiteScreen
          run={mockRun}
          node={discoveryNode}
          onReturnToMap={jest.fn()}
          onEncounterComplete={onEncounterComplete}
        />
      );

      const pathOption = screen.getByTestId('exploration-path-A');
      fireEvent.click(pathOption);

      await waitFor(() => {
        expect(screen.getByTestId('exploration-result')).toBeInTheDocument();
      });
    });

    it('should display lore discoveries', () => {
      const discoveryNode = {
        ...mockNode,
        type: 'discovery_site' as EncounterType,
      };

      render(
        <DiscoverySiteScreen
          run={mockRun}
          node={discoveryNode}
          onReturnToMap={jest.fn()}
          onEncounterComplete={jest.fn()}
        />
      );

      expect(screen.getByTestId('lore-discoveries')).toBeInTheDocument();
    });

    it('should show map intelligence', () => {
      const discoveryNode = {
        ...mockNode,
        type: 'discovery_site' as EncounterType,
      };

      render(
        <DiscoverySiteScreen
          run={mockRun}
          node={discoveryNode}
          onReturnToMap={jest.fn()}
          onEncounterComplete={jest.fn()}
        />
      );

      expect(screen.getByTestId('map-intelligence')).toBeInTheDocument();
    });
  });

  describe('useEncounterResolver Hook', () => {
    it('should provide encounter resolver functionality', () => {
      const { result } = renderHook(() =>
        useEncounterResolver(mockRun, mockNode)
      );

      expect(result.current.encounterResolver).toBeDefined();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.startEncounter).toBe('function');
      expect(typeof result.current.updateEncounterProgress).toBe('function');
      expect(typeof result.current.completeEncounter).toBe('function');
    });

    it('should handle encounter state management', async () => {
      const { result } = renderHook(() =>
        useEncounterResolver(mockRun, mockNode)
      );

      await act(async () => {
        await result.current.startEncounter();
      });

      expect(result.current.getEncounterState()).toBeDefined();
    });

    it('should handle encounter completion', async () => {
      const onEncounterComplete = jest.fn();
      const { result } = renderHook(() =>
        useEncounterResolver(mockRun, mockNode)
      );

      await act(async () => {
        await result.current.completeEncounter(
          'success',
          [],
          onEncounterComplete
        );
      });

      expect(onEncounterComplete).toHaveBeenCalled();
    });

    it('should handle encounter errors', async () => {
      const { result } = renderHook(() =>
        useEncounterResolver(mockRun, mockNode)
      );

      await act(async () => {
        await result.current.completeEncounter('failure', [], jest.fn());
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    it('should complete full encounter workflow', async () => {
      const onReturnToMap = jest.fn();
      const onEncounterComplete = jest.fn();

      render(
        <EncounterScreen
          run={mockRun}
          node={mockNode}
          onReturnToMap={onReturnToMap}
          onEncounterComplete={onEncounterComplete}
        />
      );

      // Start encounter
      const startButton = screen.getByTestId('start-encounter');
      fireEvent.click(startButton);

      // Interact with encounter
      const tile = screen.getByTestId('tile-0-0');
      fireEvent.click(tile);

      // Complete encounter
      await waitFor(() => {
        expect(screen.getByTestId('encounter-complete')).toBeInTheDocument();
      });

      const returnButton = screen.getByTestId('return-to-map');
      fireEvent.click(returnButton);

      expect(onReturnToMap).toHaveBeenCalled();
      expect(onEncounterComplete).toHaveBeenCalled();
    });

    it('should handle encounter failure gracefully', async () => {
      const onReturnToMap = jest.fn();
      const onEncounterComplete = jest.fn();

      render(
        <EncounterScreen
          run={mockRun}
          node={mockNode}
          onReturnToMap={onReturnToMap}
          onEncounterComplete={onEncounterComplete}
        />
      );

      // Simulate encounter failure
      const failButton = screen.getByTestId('fail-encounter');
      fireEvent.click(failButton);

      await waitFor(() => {
        expect(screen.getByTestId('encounter-failure')).toBeInTheDocument();
      });

      const returnButton = screen.getByTestId('return-to-map');
      fireEvent.click(returnButton);

      expect(onReturnToMap).toHaveBeenCalled();
      expect(onEncounterComplete).toHaveBeenCalledWith('failure');
    });

    it('should maintain state across encounter transitions', async () => {
      const onReturnToMap = jest.fn();
      const onEncounterComplete = jest.fn();

      const { rerender } = render(
        <EncounterScreen
          run={mockRun}
          node={mockNode}
          onReturnToMap={onReturnToMap}
          onEncounterComplete={onEncounterComplete}
        />
      );

      // Complete first encounter
      const tile = screen.getByTestId('tile-0-0');
      fireEvent.click(tile);

      await waitFor(() => {
        expect(screen.getByTestId('encounter-complete')).toBeInTheDocument();
      });

      // Move to next node
      const nextNode = {
        ...mockNode,
        id: 'node-2',
        type: 'trade_opportunity' as EncounterType,
      };
      rerender(
        <EncounterScreen
          run={mockRun}
          node={nextNode}
          onReturnToMap={onReturnToMap}
          onEncounterComplete={onEncounterComplete}
        />
      );

      expect(
        screen.getByTestId('trade-opportunity-screen')
      ).toBeInTheDocument();
    });
  });
});
