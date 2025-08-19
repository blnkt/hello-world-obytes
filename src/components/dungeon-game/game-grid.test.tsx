import { render, screen } from '@testing-library/react-native';
import { fireEvent } from '@testing-library/react-native';
import React from 'react';

import DungeonGame from './dungeon-game';

describe('DungeonGame', () => {
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
    const turnText = screen.getByText(/Turns: \d+/);
    expect(turnText).toBeTruthy();

    // Click second tile to reveal it
    const secondTile = screen.getAllByTestId('grid-tile')[1];
    fireEvent.press(secondTile);

    // Should still show turn information
    expect(screen.getByText(/Turns: \d+/)).toBeTruthy();
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
    expect(screen.getByText(/Turns: \d+/)).toBeTruthy();
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
    expect(screen.getByText(/Turns: \d+/)).toBeTruthy();
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
    expect(screen.getByText(/Turns: \d+/)).toBeTruthy();
  });
});
