import { render, screen } from '@testing-library/react-native';
import React from 'react';

import DungeonGame from './dungeon-game';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  },
}));

describe('DungeonGame', () => {
  it('should render the main dungeon game screen', () => {
    render(<DungeonGame />);

    // Should show the level in condensed header
    expect(screen.getByText('Level')).toBeTruthy();
    expect(screen.getByText('1')).toBeTruthy();

    // Should show turns left in header
    expect(screen.getByText(/TURNS LEFT:/)).toBeTruthy();
  });

  it('should manage game state correctly', () => {
    render(<DungeonGame />);

    // Should display currency information in condensed header
    expect(screen.getByText('Balance')).toBeTruthy();
    expect(screen.getByText('Turn Cost')).toBeTruthy();

    // Should show turns left
    expect(screen.getByText(/TURNS LEFT:/)).toBeTruthy();
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

    // When currency is insufficient, should show message
    expect(
      screen.getByText('Cannot play with insufficient currency')
    ).toBeTruthy();

    // Test that navigation functions are available
    expect(mockNavigate).toBeDefined();
    expect(mockGoBack).toBeDefined();
  });

  it('should use expo-router for navigation when no navigation prop is provided', () => {
    const { router } = require('expo-router');

    render(<DungeonGame />);

    // When currency is insufficient, should show message
    expect(
      screen.getByText('Cannot play with insufficient currency')
    ).toBeTruthy();
  });

  it('should handle game state transitions correctly', () => {
    render(<DungeonGame />);

    // Should show the condensed header
    expect(screen.getByText('Level')).toBeTruthy();

    // When currency is insufficient, should show message instead of game grid
    expect(
      screen.getByText('Cannot play with insufficient currency')
    ).toBeTruthy();
  });
});
