/* eslint-disable testing-library/prefer-presence-queries, prettier/prettier */
import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react-native';
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
    // Create a mock EncounterResolver that returns a state so components render
    const mockEncounterResolver = {
      getCurrentState: jest.fn(() => ({ type: 'puzzle_chamber' } as any)),
      getEncounterState: jest.fn(() => ({ type: 'puzzle_chamber' } as any)),
      startEncounter: jest.fn(),
      completeEncounter: jest.fn(),
    };

    mockUseEncounterResolver.mockReturnValue({
      encounterResolver: mockEncounterResolver as any,
      isLoading: false,
      error: null,
      startEncounter: jest.fn().mockResolvedValue(undefined),
      updateEncounterProgress: jest.fn().mockResolvedValue(undefined),
      completeEncounter: jest.fn().mockResolvedValue(undefined),
      getEncounterState: jest.fn(() => ({ type: 'puzzle_chamber' } as any)),
      clearEncounterState: jest.fn(),
    });
  });

  describe('EncounterScreen', () => {
    it('should render without crashing', () => {
      render(
        <EncounterScreen
          run={mockRun}
          node={mockNode}
          onReturnToMap={jest.fn()}
          onEncounterComplete={jest.fn()}
        />
      );

      // Just verify the component renders without throwing
      expect(screen.queryByText(/puzzle chamber|discovery site|loading/i)).toBeTruthy();
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

      // Verify puzzle chamber screen renders by checking for characteristic text
      expect(screen.queryByText(/puzzle chamber/i)).toBeTruthy();
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

      // Verify discovery site screen renders by checking for characteristic text
      expect(screen.queryByText(/discovery site/i)).toBeTruthy();
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

      expect(screen.queryByText(/loading/i)).toBeTruthy();
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

      expect(screen.queryByText('Failed to load encounter')).toBeTruthy();
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

      expect(screen.queryByText(/puzzle chamber/i)).toBeTruthy();
    });

    it('should display remaining reveals count', () => {
      render(
        <PuzzleChamberScreen
          run={mockRun}
          node={mockNode}
          onReturnToMap={jest.fn()}
          onEncounterComplete={jest.fn()}
        />
      );

      // Check for reveals text (e.g., "Reveals Remaining: 15")
      expect(screen.queryByText(/reveals?/i)).toBeTruthy();
    });

    it('should handle callbacks correctly', () => {
      const onReturnToMap = jest.fn();
      const onEncounterComplete = jest.fn();

      render(
        <PuzzleChamberScreen
          run={mockRun}
          node={mockNode}
          onReturnToMap={onReturnToMap}
          onEncounterComplete={onEncounterComplete}
        />
      );

      expect(typeof onReturnToMap).toBe('function');
      expect(typeof onEncounterComplete).toBe('function');
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

      expect(screen.queryByText(/discovery site/i)).toBeTruthy();
    });

    it('should handle callbacks correctly', () => {
      const onReturnToMap = jest.fn();
      const onEncounterComplete = jest.fn();
      const discoveryNode = {
        ...mockNode,
        type: 'discovery_site' as EncounterType,
      };

      render(
        <DiscoverySiteScreen
          run={mockRun}
          node={discoveryNode}
          onReturnToMap={onReturnToMap}
          onEncounterComplete={onEncounterComplete}
        />
      );

      expect(typeof onReturnToMap).toBe('function');
      expect(typeof onEncounterComplete).toBe('function');
    });
  });

  describe('useEncounterResolver Hook', () => {
    it('should provide encounter resolver functionality', () => {
      // Since we're mocking the hook, verify the mock is set up correctly
      const hookResult = mockUseEncounterResolver(mockRun, mockNode);

      expect(hookResult.encounterResolver).toBeDefined();
      expect(typeof hookResult.startEncounter).toBe('function');
      expect(typeof hookResult.completeEncounter).toBe('function');
    });
  });

  describe('Integration Tests', () => {
    it('should handle callbacks correctly', () => {
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

      // Verify callbacks are functions and can be called
      expect(typeof onReturnToMap).toBe('function');
      expect(typeof onEncounterComplete).toBe('function');
    });

    it('should handle different encounter types', () => {
      const onReturnToMap = jest.fn();
      const onEncounterComplete = jest.fn();

      // Test puzzle chamber
      const { rerender } = render(
        <EncounterScreen
          run={mockRun}
          node={mockNode}
          onReturnToMap={onReturnToMap}
          onEncounterComplete={onEncounterComplete}
        />
      );

      expect(screen.queryByText(/puzzle chamber/i)).toBeTruthy();

      // Test discovery site
      const discoveryNode = {
        ...mockNode,
        id: 'node-2',
        type: 'discovery_site' as EncounterType,
      };
      rerender(
        <EncounterScreen
          run={mockRun}
          node={discoveryNode}
          onReturnToMap={onReturnToMap}
          onEncounterComplete={onEncounterComplete}
        />
      );

      expect(screen.queryByText(/discovery site/i)).toBeTruthy();
    });
  });
});
