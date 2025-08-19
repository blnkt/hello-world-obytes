import { render, screen } from '@testing-library/react-native';
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
});
