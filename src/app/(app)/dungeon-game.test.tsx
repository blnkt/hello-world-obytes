import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import DungeonGame from './dungeon-game';

describe('DungeonGame', () => {
  it('should render the main dungeon game screen', () => {
    render(<DungeonGame />);

    // Should display the game title
    expect(screen.getByText('Dungeon Game')).toBeTruthy();

    // Should show the current level
    expect(screen.getByText('Level 1')).toBeTruthy();

    // Should have a home button to return to main menu
    expect(screen.getByText('Home')).toBeTruthy();
  });

  it('should manage game state correctly', () => {
    render(<DungeonGame />);

    // Should display initial game state
    expect(screen.getByText('Turns: 0')).toBeTruthy();
    expect(screen.getByText('Game State: Active')).toBeTruthy();

    // Should show revealed tiles count
    expect(screen.getByText('Revealed: 0/30')).toBeTruthy();
  });

  it('should handle navigation correctly', () => {
    const mockNavigate = jest.fn();
    const mockGoBack = jest.fn();

    // Mock navigation props
    const navigation = {
      navigate: mockNavigate,
      goBack: mockGoBack,
    };

    render(<DungeonGame navigation={navigation} />);

    // Should have navigation functionality
    expect(screen.getByText('Home')).toBeTruthy();

    // Home button should be pressable and should call navigation
    const homeButton = screen.getByText('Home');
    expect(homeButton).toBeTruthy();

    // Test that navigation functions are available
    expect(mockNavigate).toBeDefined();
    expect(mockGoBack).toBeDefined();

    // Test that pressing home button navigates to main menu
    fireEvent.press(homeButton);
    expect(mockNavigate).toHaveBeenCalledWith('index');
  });
});
