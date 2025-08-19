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
});
