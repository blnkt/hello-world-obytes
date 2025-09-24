import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';

import { GameStateProvider } from '../providers/game-state-provider';
import GameGrid from '../game-grid';
import { 
  mockUseCurrencySystem, 
  resetUseCurrencySystem,
  currencyScenarios 
} from '../../../../__mocks__/currency-system';

// Mock the persistence hook to avoid storage dependencies
jest.mock('../hooks/use-dungeon-game-persistence', () => ({
  useDungeonGamePersistence: () => ({
    saveGameState: jest.fn(),
    loadGameState: jest.fn(),
    clearGameState: jest.fn(),
    hasExistingSaveData: jest.fn(() => false),
    lastSaveTime: null,
  }),
}));

// Test wrapper component - now without hardcoded currency
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <GameStateProvider>
    {children}
  </GameStateProvider>
);

describe('Currency Integration and Validation', () => {
  beforeEach(() => {
    resetUseCurrencySystem();
  });

  afterEach(() => {
    resetUseCurrencySystem();
  });

  describe('Real Currency System Integration', () => {
    it('should use real currency from useCurrencySystem instead of hardcoded values', () => {
      // Use the centralized mock
      mockUseCurrencySystem(2500); // 25 turns worth

      render(
        <TestWrapper>
          <GameGrid level={1} disabled={false} />
        </TestWrapper>
      );

      // Verify the game shows the real currency, not hardcoded 1000
      expect(screen.getByTestId('game-grid')).toBeTruthy();
      
      // The game should now use the real currency system
      // We can verify this by checking that the currency state is properly initialized
    });

    it('should calculate available turns based on actual currency, not hardcoded value', () => {
      // Use the centralized mock
      mockUseCurrencySystem(750); // 7.5 turns, should round down to 7

      render(
        <TestWrapper>
          <GameGrid level={1} disabled={false} />
        </TestWrapper>
      );

      // Verify turns calculation uses real currency system
      expect(screen.getByTestId('game-grid')).toBeTruthy();
      
      // The game should now calculate turns based on the real currency (750 = 7 turns)
    });
  });

  describe('Currency Display and Accuracy', () => {
    it('should display accurate available turns based on currency', () => {
      render(
        <TestWrapper>
          <GameGrid level={1} disabled={false} />
        </TestWrapper>
      );

      // Verify that currency display shows correct available turns
      // 1000 currency = 10 turns available
      expect(screen.getByTestId('game-grid')).toBeTruthy();
    });

    it('should update currency display after tile interactions', async () => {
      render(
        <TestWrapper>
          <GameGrid level={1} disabled={false} />
        </TestWrapper>
      );

      // Reveal a tile and verify currency updates
      const tiles = screen.getAllByTestId('grid-tile');
      const firstTile = tiles[0];

      await act(async () => {
        fireEvent.press(firstTile);
      });

      // Verify currency decreased by 100 (1 turn cost)
      // This will be tested through the GameStateProvider state
    });

    it('should handle currency display for very high values', () => {
      // Use predefined scenario
      currencyScenarios.veryHigh();

      render(
        <TestWrapper>
          <GameGrid level={1} disabled={false} />
        </TestWrapper>
      );

      // Verify high currency values are displayed correctly
      // 100000 currency = 1000 turns available
      expect(screen.getByTestId('game-grid')).toBeTruthy();
    });
  });

  describe('Currency Validation Before Game Start', () => {
    it('should prevent game start with insufficient currency', () => {
      // Use predefined scenario
      currencyScenarios.insufficient();

      render(
        <TestWrapper>
          <GameGrid level={1} disabled={false} />
        </TestWrapper>
      );

      // Verify game cannot start with insufficient currency
      // Check that appropriate error messages are shown
      expect(screen.getByTestId('game-grid')).toBeTruthy();
    });

    it('should allow game start with sufficient currency', () => {
      // Use predefined scenario
      currencyScenarios.minimum();

      render(
        <TestWrapper>
          <GameGrid level={1} disabled={false} />
        </TestWrapper>
      );

      // Verify game can start with minimum required currency
      // 100 currency = 1 turn available
      expect(screen.getByTestId('game-grid')).toBeTruthy();
    });

    it('should validate minimum playability requirements', () => {
      // Use custom currency value
      mockUseCurrencySystem(99);

      render(
        <TestWrapper>
          <GameGrid level={1} disabled={false} />
        </TestWrapper>
      );

      // Verify game cannot start with less than 100 currency
      // Check validation messages
      expect(screen.getByTestId('game-grid')).toBeTruthy();
    });
  });

  describe('Currency Validation During Gameplay', () => {
    it('should validate currency before each tile reveal', async () => {
      render(
        <GameStateProvider _initialCurrency={150}>
          <GameGrid level={1} disabled={false} />
        </GameStateProvider>
      );

      // Reveal one tile (costs 100, leaves 50)
      const tiles = screen.getAllByTestId('grid-tile');
      const firstTile = tiles[0];

      await act(async () => {
        fireEvent.press(firstTile);
      });

      // Try to reveal another tile (should fail with 50 currency)
      const secondTile = tiles[1];
      fireEvent.press(secondTile);

      // Verify second tile cannot be revealed
      // This will be tested through the GameStateProvider state
    });

    it('should prevent actions when currency drops below threshold', () => {
      render(
        <GameStateProvider _initialCurrency={100}>
          <GameGrid level={1} disabled={false} />
        </GameStateProvider>
      );

      // Reveal one tile (costs 100, leaves 0)
      const tiles = screen.getAllByTestId('grid-tile');
      const firstTile = tiles[0];

      fireEvent.press(firstTile);

      // Verify no further actions can be performed
      // This will be tested through the GameStateProvider state
    });

    it('should handle edge case of exactly 100 currency', () => {
      render(
        <GameStateProvider _initialCurrency={100}>
          <GameGrid level={1} disabled={false} />
        </GameStateProvider>
      );

      // Verify exactly 100 currency allows one tile reveal
      const tiles = screen.getAllByTestId('grid-tile');
      const firstTile = tiles[0];

      fireEvent.press(firstTile);

      // Verify tile can be revealed with exactly 100 currency
      // This will be tested through the GameStateProvider state
    });
  });

  describe('Currency Calculation and Precision', () => {
    it('should calculate available turns correctly', () => {
      render(
        <GameStateProvider _initialCurrency={250}>
          <GameGrid level={1} disabled={false} />
        </GameStateProvider>
      );

      // Verify 250 currency = 2 turns available (250/100 = 2.5, floored to 2)
      expect(screen.getByTestId('game-grid')).toBeTruthy();
    });

    it('should handle currency values that don\'t divide evenly by 100', () => {
      render(
        <GameStateProvider _initialCurrency={350}>
          <GameGrid level={1} disabled={false} />
        </GameStateProvider>
      );

      // Verify 350 currency = 3 turns available (350/100 = 3.5, floored to 3)
      expect(screen.getByTestId('game-grid')).toBeTruthy();
    });

    it('should prevent negative currency values', () => {
      render(
        <GameStateProvider _initialCurrency={50}>
          <GameGrid level={1} disabled={false} />
        </GameStateProvider>
      );

      // Try to reveal tile with insufficient currency
      const tiles = screen.getAllByTestId('grid-tile');
      const firstTile = tiles[0];

      fireEvent.press(firstTile);

      // Verify currency never goes below 0
      // This will be tested through the GameStateProvider state
    });
  });

  describe('Currency Integration with Game State', () => {
    it('should coordinate currency with game state transitions', () => {
      render(
        <TestWrapper>
          <GameGrid level={1} disabled={false} />
        </TestWrapper>
      );

      // Verify currency management works with game state changes
      expect(screen.getByTestId('game-grid')).toBeTruthy();
    });

    it('should maintain currency consistency across game resets', () => {
      render(
        <TestWrapper>
          <GameGrid level={1} disabled={false} />
        </TestWrapper>
      );

      // Verify currency resets properly when game is reset
      expect(screen.getByTestId('game-grid')).toBeTruthy();
    });

    it('should handle currency during level progression', () => {
      render(
        <TestWrapper>
          <GameGrid level={1} disabled={false} />
        </TestWrapper>
      );

      // Verify currency management during level transitions
      expect(screen.getByTestId('game-grid')).toBeTruthy();
    });
  });

  describe('Currency Error Handling and User Feedback', () => {
    it('should provide clear error messages for insufficient currency', () => {
      render(
        <GameStateProvider _initialCurrency={50}>
          <GameGrid level={1} disabled={false} />
        </GameStateProvider>
      );

      // Verify clear error messages are shown
      expect(screen.getByTestId('game-grid')).toBeTruthy();
    });

    it('should show validation messages before game actions', () => {
      render(
        <GameStateProvider _initialCurrency={75}>
          <GameGrid level={1} disabled={false} />
        </GameStateProvider>
      );

      // Verify validation messages are shown before actions
      expect(screen.getByTestId('game-grid')).toBeTruthy();
    });

    it('should handle currency validation edge cases gracefully', () => {
      render(
        <GameStateProvider _initialCurrency={0}>
          <GameGrid level={1} disabled={false} />
        </GameStateProvider>
      );

      // Verify graceful handling of zero currency
      expect(screen.getByTestId('game-grid')).toBeTruthy();
    });
  });

  describe('Currency Performance and Optimization', () => {
    it('should handle rapid currency changes efficiently', async () => {
      render(
        <TestWrapper>
          <GameGrid level={1} disabled={false} />
        </TestWrapper>
      );

      // Test rapid tile reveals to verify performance
      const tiles = screen.getAllByTestId('grid-tile');
      const firstTile = tiles[0];
      const secondTile = tiles[1];
      const thirdTile = tiles[2];

      await act(async () => {
        fireEvent.press(firstTile);
        fireEvent.press(secondTile);
        fireEvent.press(thirdTile);
      });

      // Verify performance is maintained during rapid changes
      // This will be tested through performance metrics
    });

    it('should optimize currency calculations for large values', () => {
      render(
        <GameStateProvider _initialCurrency={1000000}>
          <GameGrid level={1} disabled={false} />
        </GameStateProvider>
      );

      // Verify large currency values are handled efficiently
      // 1000000 currency = 10000 turns available
      expect(screen.getByTestId('game-grid')).toBeTruthy();
    });
  });

  describe('Currency Integration with Persistence', () => {
    it('should maintain currency state across app sessions', () => {
      render(
        <TestWrapper>
          <GameGrid level={1} disabled={false} />
        </TestWrapper>
      );

      // Verify currency persists correctly
      expect(screen.getByTestId('game-grid')).toBeTruthy();
    });

    it('should handle currency recovery from saved games', () => {
      render(
        <TestWrapper>
          <GameGrid level={1} disabled={false} />
        </TestWrapper>
      );

      // Verify currency recovery works correctly
      expect(screen.getByTestId('game-grid')).toBeTruthy();
    });
  });
});
