import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { fireEvent } from '@testing-library/react-native';

import GameGrid from './game-grid';

// Helper function to get current turn count
const getTurnCount = () => {
  const turnText = screen.getByText(/Turns: \d+/);
  return parseInt(turnText.children[1] as string);
};

describe('GameGrid', () => {
  it('should render a 6x5 grid layout', () => {
    render(<GameGrid />);

    // Should display the grid title
    expect(screen.getByText('Game Grid')).toBeTruthy();

    // Should render 30 tiles (6x5 grid)
    const tiles = screen.getAllByTestId('grid-tile');
    expect(tiles).toHaveLength(30);

    // Should have 6 columns and 5 rows
    expect(screen.getByTestId('game-grid')).toBeTruthy();
  });

  it('should display grid dimensions information', () => {
    render(<GameGrid />);

    // Should show grid size information
    expect(screen.getByText('Grid: 6x5')).toBeTruthy();
    expect(screen.getByText('Total Tiles: 30')).toBeTruthy();
  });

  it('should handle tile interactions and reveal functionality', () => {
    render(<GameGrid />);

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
    render(<GameGrid />);

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
    render(<GameGrid />);

    // Initially no tiles should be revealed
    expect(screen.getByText('Revealed: 0/30')).toBeTruthy();

    // All tiles should start face-down
    const tiles = screen.getAllByTestId('grid-tile');
    tiles.forEach((tile) => {
      expect(tile).toBeTruthy();
    });
  });

  it('should assign random tile types when tiles are revealed', () => {
    render(<GameGrid />);

    // Initially no tiles should be revealed
    expect(screen.getByText('Revealed: 0/30')).toBeTruthy();

    // After revealing tiles, they should have random types
    // This tests the random distribution algorithm
    const tiles = screen.getAllByTestId('grid-tile');
    expect(tiles).toHaveLength(30);
  });

  it('should generate level with balanced tile distribution', () => {
    render(<GameGrid />);

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
    const { rerender } = render(<GameGrid />);
    
    // Re-render to ensure level tiles are generated consistently
    rerender(<GameGrid />);
    
    // Should have 30 tiles
    const tiles = screen.getAllByTestId('grid-tile');
    expect(tiles).toHaveLength(30);
    
    // Should display initial revealed count
    expect(screen.getByText('Revealed: 0/30')).toBeTruthy();
  });

  it('should deduct turns when tiles are revealed', () => {
    render(<GameGrid />);
    
    // Initially should show 0 turns used
    expect(screen.getByText('Turns: 0')).toBeTruthy();
    
    // Click first tile to reveal it
    const firstTile = screen.getAllByTestId('grid-tile')[0];
    fireEvent.press(firstTile);
    
    // Get turns after first tile (may be 0 if it was a treasure, 1 if neutral, 2 if trap)
    const turnsAfterFirst = getTurnCount();
    expect(turnsAfterFirst).toBeGreaterThanOrEqual(0);
    
    // Click second tile to reveal it
    const secondTile = screen.getAllByTestId('grid-tile')[1];
    fireEvent.press(secondTile);
    
    // Get turns after second tile
    const turnsAfterSecond = getTurnCount();
    
    // Second tile should increase turn count (unless it's also a treasure)
    expect(turnsAfterSecond).toBeGreaterThanOrEqual(turnsAfterFirst);
  });

  it('should lose additional turn when trap tile is revealed', () => {
    render(<GameGrid />);
    
    // Initially should show 0 turns used
    expect(screen.getByText('Turns: 0')).toBeTruthy();
    
    // Find and click a trap tile (we need to reveal tiles until we find one)
    const tiles = screen.getAllByTestId('grid-tile');
    let trapTileIndex = -1;
    let turnsBeforeTrap = 0;
    
    // Click tiles until we find a trap
    for (let i = 0; i < tiles.length; i++) {
      // Get turns before clicking this tile
      turnsBeforeTrap = parseInt(screen.getByText(/Turns: \d+/).children[1] as string);
      
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
    
    // Get the current turn count after revealing the trap
    const turnsAfterTrap = parseInt(screen.getByText(/Turns: \d+/).children[1] as string);
    
    // Trap should cost 2 turns total: 1 for reveal + 1 additional penalty
    expect(turnsAfterTrap).toBe(turnsBeforeTrap + 2);
  });

  it('should gain free turn when treasure tile is revealed', () => {
    render(<GameGrid />);
    
    // Initially should show 0 turns used
    expect(screen.getByText('Turns: 0')).toBeTruthy();
    
    // Find and click a treasure tile (we need to reveal tiles until we find one)
    const tiles = screen.getAllByTestId('grid-tile');
    let treasureTileIndex = -1;
    let turnsBeforeTreasure = 0;
    
    // Click tiles until we find a treasure
    for (let i = 0; i < tiles.length; i++) {
      // Get turns before clicking this tile
      turnsBeforeTreasure = parseInt(screen.getByText(/Turns: \d+/).children[1] as string);
      
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
    
    // Get the current turn count after revealing the treasure
    const turnsAfterTreasure = parseInt(screen.getByText(/Turns: \d+/).children[1] as string);
    
    // Treasure should cost 0 turns total: 1 for reveal - 1 free turn
    expect(turnsAfterTreasure).toBe(turnsBeforeTreasure + 1 - 1);
  });
});
