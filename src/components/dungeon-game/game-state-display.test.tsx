import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { GameStateDisplay } from './dungeon-game';

describe('GameStateDisplay', () => {
  it('should display win state with congratulations message', () => {
    render(<GameStateDisplay gameState="Win" />);

    expect(screen.getByText('🎉 Level Complete! 🎉')).toBeTruthy();
    expect(
      screen.getByText("Congratulations! You've completed this level!")
    ).toBeTruthy();
  });

  it('should display game over state with encouragement message', () => {
    render(<GameStateDisplay gameState="Game Over" />);

    expect(screen.getByText('💀 Game Over 💀')).toBeTruthy();
    expect(screen.getByText('Better luck next time!')).toBeTruthy();
  });

  it('should display active state with gameplay instructions', () => {
    render(<GameStateDisplay gameState="Active" />);

    expect(screen.getByText('🎮 Game Active')).toBeTruthy();
    expect(
      screen.getByText('Explore the dungeon and find the exit!')
    ).toBeTruthy();
  });

  it('should display default state when game state is not recognized', () => {
    render(<GameStateDisplay gameState={'Unknown' as any} />);

    expect(screen.getByText('🎲 Ready to Play')).toBeTruthy();
    expect(screen.getByText('Start your adventure!')).toBeTruthy();
  });
});
