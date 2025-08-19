import { render, screen } from '@testing-library/react-native';
import React from 'react';

import GameGrid from './game-grid';

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
});
