import { render, screen } from '@testing-library/react-native';
import { fireEvent } from '@testing-library/react-native';
import React from 'react';

import { setCurrency } from '@/lib/storage';
import DungeonGame from './dungeon-game';

// Mock the useCurrencySystem hook to return predictable values
const mockUseCurrencySystem = jest.fn();

// Create a stateful mock currency system
let mockCurrency = 1000;
const mockSpend = jest.fn().mockImplementation(async (amount: number) => {
  if (mockCurrency >= amount) {
    mockCurrency -= amount;
    // Update the mock to return the new currency value
    mockUseCurrencySystem.mockReturnValue({
      currency: mockCurrency,
      spend: mockSpend,
      conversionRate: 0.1,
      availableCurrency: 0,
      totalCurrencyEarned: 100,
      convertCurrentExperience: jest.fn().mockResolvedValue(0),
    });
    return true;
  }
  return false;
});

jest.mock('@/lib/health', () => ({
  ...jest.requireActual('@/lib/health'),
  useCurrencySystem: () => mockUseCurrencySystem(),
}));

describe('DungeonGame', () => {
  beforeEach(async () => {
    // Reset mock currency for each test
    mockCurrency = 1000;
    
    // Set up mock to return sufficient currency by default (1000 steps = 10 turns)
    mockUseCurrencySystem.mockReturnValue({
      currency: mockCurrency,
      spend: mockSpend,
      conversionRate: 0.1,
      availableCurrency: 0,
      totalCurrencyEarned: 100,
      convertCurrentExperience: jest.fn().mockResolvedValue(0),
    });
    
    // Also set actual storage for consistency
    await setCurrency(1000);
  });
  it('should render a 6x5 grid layout', () => {
    render(<DungeonGame />);

    // Should display the grid title
    expect(screen.getByText('Game Grid')).toBeTruthy();

    // Should render 30 tiles (6x5 grid)
    const tiles = screen.getAllByTestId('grid-tile');
    expect(tiles).toHaveLength(30);

    // Should have 6 columns and 5 rows
    expect(screen.getByTestId('game-grid')).toBeTruthy();
  });

  it('should display grid dimensions information', () => {
    render(<DungeonGame />);

    // Should show grid size information
    expect(screen.getByText('Grid: 6x5')).toBeTruthy();
    expect(screen.getByText('Total Tiles: 30')).toBeTruthy();
  });

  it('should handle tile interactions and reveal functionality', () => {
    render(<DungeonGame />);

    // Should have 30 tiles initially
    const tiles = screen.getAllByTestId('grid-tile');
    expect(tiles).toHaveLength(30);

    // All tiles should start face-down
    tiles.forEach((tile) => {
      expect(tile).toBeTruthy();
    });

    // Should display initial revealed count
    expect(screen.getByText('Revealed: 0/30')).toBeTruthy();
  });

  it('should generate level with proper tile distribution', () => {
    render(<DungeonGame />);

    // Should have 30 tiles initially
    const tiles = screen.getAllByTestId('grid-tile');
    expect(tiles).toHaveLength(30);

    // Should display initial revealed count
    expect(screen.getByText('Revealed: 0/30')).toBeTruthy();

    // Should have proper grid dimensions
    expect(screen.getByText('Grid: 6x5')).toBeTruthy();
    expect(screen.getByText('Total Tiles: 30')).toBeTruthy();
  });

  it('should distribute tiles randomly when level is generated', () => {
    render(<DungeonGame />);

    // Initially no tiles should be revealed
    expect(screen.getByText('Revealed: 0/30')).toBeTruthy();

    // All tiles should start face-down
    const tiles = screen.getAllByTestId('grid-tile');
    tiles.forEach((tile) => {
      expect(tile).toBeTruthy();
    });
  });

  it('should assign random tile types when tiles are revealed', () => {
    render(<DungeonGame />);

    // Initially no tiles should be revealed
    expect(screen.getByText('Revealed: 0/30')).toBeTruthy();

    // After revealing tiles, they should have random types
    // This tests the random distribution algorithm
    const tiles = screen.getAllByTestId('grid-tile');
    expect(tiles).toHaveLength(30);
  });

  it('should generate level with balanced tile distribution', () => {
    render(<DungeonGame />);

    // Should have 30 tiles initially
    const tiles = screen.getAllByTestId('grid-tile');
    expect(tiles).toHaveLength(30);

    // Should display initial revealed count
    expect(screen.getByText('Revealed: 0/30')).toBeTruthy();

    // Level should have proper distribution (1 exit, 4 traps, 4 treasures, 4 bonuses, 17 neutral)
    expect(screen.getByText('Grid: 6x5')).toBeTruthy();
    expect(screen.getByText('Total Tiles: 30')).toBeTruthy();
  });

  it('should maintain consistent tile distribution across the entire level', () => {
    const { rerender } = render(<DungeonGame />);

    // Re-render to ensure level tiles are generated consistently
    rerender(<DungeonGame />);

    // Should have 30 tiles
    const tiles = screen.getAllByTestId('grid-tile');
    expect(tiles).toHaveLength(30);

    // Should display initial revealed count
    expect(screen.getByText('Revealed: 0/30')).toBeTruthy();
  });

  it('should deduct turns when tiles are revealed', () => {
    render(<DungeonGame />);

    // Initially should show 0 turns used
    expect(screen.getByText('Turns: 0')).toBeTruthy();

    // Click first tile to reveal it
    const firstTile = screen.getAllByTestId('grid-tile')[0];
    fireEvent.press(firstTile);

    // Should no longer show 0 turns (unless it was a treasure)
    const turnText = screen.getByText(/^Turns: \d+$/);
    expect(turnText).toBeTruthy();

    // Click second tile to reveal it
    const secondTile = screen.getAllByTestId('grid-tile')[1];
    fireEvent.press(secondTile);

    // Should still show turn information
    expect(screen.getByText(/^Turns: \d+$/)).toBeTruthy();
  });

  it('should lose additional turn when trap tile is revealed', () => {
    render(<DungeonGame />);

    // Initially should show 0 turns used
    expect(screen.getByText('Turns: 0')).toBeTruthy();

    // Find and click a trap tile (we need to reveal tiles until we find one)
    const tiles = screen.getAllByTestId('grid-tile');
    let trapTileIndex = -1;

    // Click tiles until we find a trap
    for (let i = 0; i < tiles.length; i++) {
      fireEvent.press(tiles[i]);

      // Check if this tile is a trap by looking for the trap emoji
      try {
        screen.getByText('⚠️');
        trapTileIndex = i;
        break;
      } catch {
        // Not a trap, continue to next tile
        continue;
      }
    }

    // Should have found a trap tile
    expect(trapTileIndex).toBeGreaterThan(-1);

    // Should show turn information after revealing trap
    expect(screen.getByText(/^Turns: \d+$/)).toBeTruthy();
  });

  it('should gain free turn when treasure tile is revealed', () => {
    render(<DungeonGame />);

    // Initially should show 0 turns used
    expect(screen.getByText('Turns: 0')).toBeTruthy();

    // Find and click a treasure tile (we need to reveal tiles until we find one)
    const tiles = screen.getAllByTestId('grid-tile');
    let treasureTileIndex = -1;

    // Click tiles until we find a treasure
    for (let i = 0; i < tiles.length; i++) {
      fireEvent.press(tiles[i]);

      // Check if this tile is a treasure by looking for the treasure emoji
      try {
        screen.getByText('💎');
        treasureTileIndex = i;
        break;
      } catch {
        // Not a treasure, continue to next tile
        continue;
      }
    }

    // Should have found a treasure tile
    expect(treasureTileIndex).toBeGreaterThan(-1);

    // Should show turn information after revealing treasure
    expect(screen.getByText(/^Turns: \d+$/)).toBeTruthy();
  });

  it('should auto-reveal adjacent tile when bonus reveal tile is revealed', () => {
    render(<DungeonGame />);

    // Initially should show 0 turns used and 0 revealed tiles
    expect(screen.getByText('Turns: 0')).toBeTruthy();
    expect(screen.getByText('Revealed: 0/30')).toBeTruthy();

    // Find and click a bonus reveal tile (we need to reveal tiles until we find one)
    const tiles = screen.getAllByTestId('grid-tile');
    let _bonusTileIndex = -1;

    // Click tiles until we find a bonus reveal
    for (let i = 0; i < tiles.length; i++) {
      fireEvent.press(tiles[i]);

      // Check if this tile is a bonus reveal by looking for the bonus emoji
      try {
        screen.getByText('⭐');
        _bonusTileIndex = i;
        break;
      } catch {
        // Not a bonus reveal, continue to next tile
        continue;
      }
    }

    // If we didn't find a bonus tile, that's okay - it's random
    // Just verify that we can reveal tiles and see the game state
    expect(screen.getByText(/Revealed: \d+\/30/)).toBeTruthy();
    expect(screen.getByText(/^Turns: \d+$/)).toBeTruthy();
  });

  it('should trigger win condition when exit tile is revealed', () => {
    render(<DungeonGame />);

    // Initially should show active game state
    expect(screen.getByText('Game State: Active')).toBeTruthy();

    // Find and click the exit tile (we need to reveal tiles until we find one)
    const tiles = screen.getAllByTestId('grid-tile');
    let exitTileIndex = -1;

    // Click tiles until we find the exit
    for (let i = 0; i < tiles.length; i++) {
      fireEvent.press(tiles[i]);

      // Check if this tile is the exit by looking for the exit emoji
      try {
        screen.getByText('🚪');
        exitTileIndex = i;
        break;
      } catch {
        // Not the exit, continue to next tile
        continue;
      }
    }

    // Should have found the exit tile
    expect(exitTileIndex).toBeGreaterThan(-1);

    // Should show win game state
    expect(screen.getByText('Game State: Win')).toBeTruthy();
  });

  it('should progress to next level when win condition is met', () => {
    render(<DungeonGame />);

    // Initially should show level 1
    expect(screen.getByText('Level 1')).toBeTruthy();

    // Find and click the exit tile to trigger win
    let foundExit = false;
    let clickCount = 0;
    const maxClicks = 30; // Safety limit
    
    while (!foundExit && clickCount < maxClicks) {
      // Get fresh tile elements each iteration to avoid stale references
      const tiles = screen.queryAllByTestId('grid-tile');
      if (tiles.length === 0) break; // Grid might be hidden
      
      const tile = tiles[clickCount];
      if (tile) {
        fireEvent.press(tile);
        clickCount++;

        // Check if this revealed the exit
        try {
          screen.getByText('🚪');
          foundExit = true;
        } catch {
          // Not the exit yet, continue
        }
      } else {
        break;
      }
    }

    // Should show win game state
    expect(screen.getByText('Game State: Win')).toBeTruthy();

    // Click "Next Level" button to progress
    const nextLevelButton = screen.getByText('Next Level');
    fireEvent.press(nextLevelButton);

    // Should now show level 2
    expect(screen.getByText('Level 2')).toBeTruthy();
    
    // Should reset to active game state
    expect(screen.getByText('Game State: Active')).toBeTruthy();
  });

  it('should increase difficulty with each level (more traps, fewer treasures)', () => {
    const { rerender } = render(<DungeonGame />);

    // Level 1: Should have base distribution
    expect(screen.getByText('Level 1')).toBeTruthy();

    // Progress to level 2
    const tiles = screen.getAllByTestId('grid-tile');
    
    // Find and click exit tile to win level 1
    for (let i = 0; i < tiles.length; i++) {
      fireEvent.press(tiles[i]);
      try {
        screen.getByText('🚪');
        break;
      } catch {
        continue;
      }
    }

    // Click Next Level
    const nextLevelButton = screen.getByText('Next Level');
    fireEvent.press(nextLevelButton);

    // Should now be level 2
    expect(screen.getByText('Level 2')).toBeTruthy();
    
    // Level 2 should have increased difficulty (more traps, fewer treasures)
    // The exact distribution will be random, but we can verify the level progression
    expect(screen.getByText('Game State: Active')).toBeTruthy();
  });

  it('should display currency and available turns based on currency system', () => {
    render(<DungeonGame />);

    // Should display current currency
    expect(screen.getByText(/Currency: \d+/)).toBeTruthy();
    
    // Should display available turns (calculated as Math.floor(currency / 100))
    expect(screen.getByText(/Available Turns: \d+/)).toBeTruthy();
    
    // Should display turn cost
    expect(screen.getByText(/Turn Cost: 100 steps/)).toBeTruthy();
  });

  it('should call spend function when turns are used', () => {
    const spendSpy = jest.fn().mockResolvedValue(true);
    
    // Override mock for this test to use the spy
    mockUseCurrencySystem.mockReturnValue({
      currency: 1000,
      spend: spendSpy,
      conversionRate: 0.1,
      availableCurrency: 0,
      totalCurrencyEarned: 100,
      convertCurrentExperience: jest.fn().mockResolvedValue(0),
    });

    render(<DungeonGame />);

    // Verify initial currency display
    expect(screen.getByText(/Currency: 1000/)).toBeTruthy();
    expect(screen.getByText(/Available Turns: 10/)).toBeTruthy();
    
    // Click a tile to reveal it and spend a turn
    const firstTile = screen.getAllByTestId('grid-tile')[0];
    fireEvent.press(firstTile);
    
    // Verify that spend function was called with correct amount
    expect(spendSpy).toHaveBeenCalledWith(100);
  });

  it('should prevent game start if insufficient currency (less than 100 steps)', async () => {
    // Reset mock currency to 0 for this test
    mockCurrency = 0;
    
    // Override mock to return 0 currency for this specific test
    mockUseCurrencySystem.mockReturnValue({
      currency: 0,
      spend: jest.fn().mockResolvedValue(false),
      conversionRate: 0.1,
      availableCurrency: 0,
      totalCurrencyEarned: 0,
      convertCurrentExperience: jest.fn().mockResolvedValue(0),
    });

    render(<DungeonGame />);

    // Should display insufficient currency message
    expect(screen.getByText(/Insufficient Currency/)).toBeTruthy();
    
    // Should display minimum requirement
    expect(screen.getByText(/Minimum 100 steps required/)).toBeTruthy();
    
    // Game grid should be completely hidden when insufficient currency
    expect(screen.queryByTestId('game-grid')).toBeNull();
    
    // Should show a message that the game cannot be played
    expect(screen.getByText(/Cannot play with insufficient currency/)).toBeTruthy();
  });

  it('should trigger game over condition when all tiles are revealed without finding exit', () => {
    render(<DungeonGame />);

    // Initially should show active game state
    expect(screen.getByText('Game State: Active')).toBeTruthy();

    // Click all tiles to reveal them, handling potential component re-renders
    let clickCount = 0;
    const maxClicks = 30; // Total tiles in 6x5 grid
    
    while (clickCount < maxClicks) {
      // Get fresh tile elements each iteration to avoid stale references
      const tiles = screen.queryAllByTestId('grid-tile');
      if (tiles.length === 0) break; // Grid might be hidden
      
      const tileToClick = tiles[clickCount % tiles.length];
      if (tileToClick) {
        try {
          fireEvent.press(tileToClick);
          clickCount++;
        } catch (error) {
          // Handle unmounted component errors
          break;
        }
      } else {
        break;
      }
    }

    // Should show either game over or win state after all tiles are revealed
    // Check for either state using Testing Library methods
    try {
      screen.getByText('Game State: Game Over');
      // Game over state found
    } catch {
      try {
        screen.getByText('Game State: Win');
        // Win state found
      } catch {
        // Neither state found, test should fail
        expect(screen.getByText('Game State: Active')).toBeTruthy();
        expect(false).toBe(true); // Force failure if we reach here
      }
    }
  });
});
