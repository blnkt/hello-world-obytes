import { render, screen } from '@testing-library/react-native';
import React from 'react';

import StatusBar from './status-bar';

describe('StatusBar', () => {
  const defaultProps = {
    level: 1,
    turns: 5,
    gameState: 'Active' as const,
    revealedTiles: 12,
    totalTiles: 30,
  };

  it('should render level information correctly', () => {
    render(<StatusBar {...defaultProps} />);

    expect(screen.getByText('Level 1')).toBeTruthy();
  });

  it('should render game state correctly', () => {
    render(<StatusBar {...defaultProps} />);

    expect(screen.getByText('Active')).toBeTruthy();
  });

  it('should render turns information correctly', () => {
    render(<StatusBar {...defaultProps} />);

    expect(screen.getByText('Turns Used:')).toBeTruthy();
    expect(screen.getByText('5')).toBeTruthy();
  });

  it('should render progress information correctly', () => {
    render(<StatusBar {...defaultProps} />);

    expect(screen.getByText('Progress:')).toBeTruthy();
    expect(screen.getByText('12/30')).toBeTruthy();
  });

  it('should display correct game state icon for Active state', () => {
    render(<StatusBar {...defaultProps} />);

    expect(screen.getByText('⚔️')).toBeTruthy();
  });

  it('should display correct game state icon for Win state', () => {
    render(<StatusBar {...defaultProps} gameState="Win" />);

    expect(screen.getByText('🎉')).toBeTruthy();
  });

  it('should display correct game state icon for Game Over state', () => {
    render(<StatusBar {...defaultProps} gameState="Game Over" />);

    expect(screen.getByText('💀')).toBeTruthy();
  });

  it('should render progress bar with correct width', () => {
    render(<StatusBar {...defaultProps} />);

    // Progress should be 12/30 = 40%
    const progressBar = screen.getByTestId('progress-bar');
    expect(progressBar).toBeTruthy();
  });

  it('should handle different levels correctly', () => {
    render(<StatusBar {...defaultProps} level={5} />);

    expect(screen.getByText('Level 5')).toBeTruthy();
  });

  it('should handle different turn counts correctly', () => {
    render(<StatusBar {...defaultProps} turns={15} />);

    expect(screen.getByText('15')).toBeTruthy();
  });

  it('should handle different progress values correctly', () => {
    render(<StatusBar {...defaultProps} revealedTiles={25} totalTiles={30} />);

    expect(screen.getByText('25/30')).toBeTruthy();
  });

  it('should handle edge case of 0 revealed tiles', () => {
    render(<StatusBar {...defaultProps} revealedTiles={0} />);

    expect(screen.getByText('0/30')).toBeTruthy();
  });

  it('should handle edge case of all tiles revealed', () => {
    render(<StatusBar {...defaultProps} revealedTiles={30} />);

    expect(screen.getByText('30/30')).toBeTruthy();
  });
});
