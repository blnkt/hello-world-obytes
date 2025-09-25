import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

import { CharacterForm } from '../character-form';

// Mock the child components
jest.mock('../name-field', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    NameField: ({ value, onChangeText, placeholder, label }: { value: string; onChangeText: (v: string) => void; placeholder: string; label: string }) => (
      <View testID="name-field">
        <Text testID="name-label">{label}</Text>
        <Text
          testID="name-input"
          onPress={() => onChangeText('New Character Name')}
        >
          {value || placeholder}
        </Text>
      </View>
    ),
  };
});

describe('CharacterForm', () => {
  const mockSetName = jest.fn();

  beforeEach(() => {
    mockSetName.mockClear();
  });

  it('renders the form with header and name field', () => {
    render(
      <CharacterForm
        name="Test Character"
        setName={mockSetName}
      />
    );

    expect(screen.getByText('Create Your Character')).toBeTruthy();
    expect(screen.getByText('Choose your name to begin your adventure')).toBeTruthy();
    expect(screen.getByTestId('name-field')).toBeTruthy();
  });

  it('displays the character name in the name field', () => {
    render(
      <CharacterForm
        name="Test Character"
        setName={mockSetName}
      />
    );

    expect(screen.getByTestId('name-label')).toHaveTextContent('Character Name');
  });

  it('calls setName when name field is interacted with', () => {
    render(
      <CharacterForm
        name=""
        setName={mockSetName}
      />
    );

    fireEvent.press(screen.getByTestId('name-input'));
    expect(mockSetName).toHaveBeenCalledWith('New Character Name');
  });

  it('renders with empty name initially', () => {
    render(
      <CharacterForm
        name=""
        setName={mockSetName}
      />
    );

    expect(screen.getByTestId('name-input')).toHaveTextContent('Enter your character\'s name');
  });
});