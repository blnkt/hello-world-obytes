import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { CharacterSheet } from '../character-sheet';
import type { Character } from '../../../types/character';

// Mock child components
jest.mock('../character-avatar', () => ({
  CharacterAvatar: () => <div>Character Avatar</div>,
}));

jest.mock('../name-field', () => ({
  NameField: () => <div>Name Field</div>,
}));

jest.mock('../level-exp-fields', () => ({
  LevelExpFields: () => <div>Level Exp Fields</div>,
}));

describe('CharacterSheet', () => {
  const mockCharacter: Character = {
    name: 'Test Character',
    level: 5,
    experience: 25000,
    skills: ['Running', 'Swimming'],
    equipment: ['Shoes', 'Watch'],
    abilities: ['Endurance'],
    notes: 'Test notes',
  };

  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render character sheet without errors', () => {
    // This test verifies that the component renders without throwing errors
    const { root } = render(<CharacterSheet character={mockCharacter} onChange={mockOnChange} />);
    expect(root).toBeTruthy();
  });

  it('should not contain class-related components', () => {
    render(<CharacterSheet character={mockCharacter} onChange={mockOnChange} />);

    // Should not contain any class-related elements
    expect(screen.queryByText('Class Attributes')).toBeFalsy();
    expect(screen.queryByText('Choose Your Class')).toBeFalsy();
    expect(screen.queryByText('Fitness Class')).toBeFalsy();
    expect(screen.queryByText('FitnessClassFields')).toBeFalsy();
  });
});
