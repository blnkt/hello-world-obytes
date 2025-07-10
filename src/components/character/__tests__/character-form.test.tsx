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

jest.mock('../fitness-background-class-fields', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    FitnessClassFields: ({ selectedClass, setSelectedClass, label }: { selectedClass: string; setSelectedClass: (v: string) => void; label: string }) => (
      <View testID="fitness-class-fields">
        <Text testID="class-label">{label}</Text>
        <Text testID="selected-class">Selected: {selectedClass}</Text>
        <Text
          testID="change-class"
          onPress={() => setSelectedClass('Cardio Crusher')}
        >
          Change Class
        </Text>
      </View>
    ),
  };
});

describe('CharacterForm', () => {
  const mockSetName = jest.fn();
  const mockSetSelectedClass = jest.fn();

  beforeEach(() => {
    mockSetName.mockClear();
    mockSetSelectedClass.mockClear();
  });

  it('renders character creation form with header', () => {
    render(
      <CharacterForm
        name=""
        setName={mockSetName}
        selectedClass="General Fitness"
        setSelectedClass={mockSetSelectedClass}
      />
    );

    expect(screen.getByText('Create Your Character')).toBeTruthy();
    expect(screen.getByText('Choose your name and fitness class to begin your adventure')).toBeTruthy();
    expect(screen.getByText('Character Name')).toBeTruthy();
    expect(screen.getByTestId('name-input')).toBeTruthy();
    expect(screen.getByText('Choose Your Class')).toBeTruthy();
  });

  it('displays current name and class', () => {
    render(
      <CharacterForm
        name="Test Character"
        setName={mockSetName}
        selectedClass="Strength Seeker"
        setSelectedClass={mockSetSelectedClass}
      />
    );

    expect(screen.getByTestId('name-input')).toHaveTextContent('Test Character');
    expect(screen.getByText('Selected: Strength Seeker')).toBeTruthy();
  });

  it('calls setName when name input changes', () => {
    render(
      <CharacterForm
        name=""
        setName={mockSetName}
        selectedClass="General Fitness"
        setSelectedClass={mockSetSelectedClass}
      />
    );

    const nameInput = screen.getByTestId('name-input');
    fireEvent.press(nameInput);

    expect(mockSetName).toHaveBeenCalledWith('New Character Name');
  });

  it('calls setSelectedClass when class is changed', () => {
    render(
      <CharacterForm
        name=""
        setName={mockSetName}
        selectedClass="General Fitness"
        setSelectedClass={mockSetSelectedClass}
      />
    );

    const changeClassButton = screen.getByTestId('change-class');
    fireEvent.press(changeClassButton);

    expect(mockSetSelectedClass).toHaveBeenCalledWith('Cardio Crusher');
  });

  it('renders fitness class fields component', () => {
    render(
      <CharacterForm
        name=""
        setName={mockSetName}
        selectedClass="General Fitness"
        setSelectedClass={mockSetSelectedClass}
      />
    );

    expect(screen.getByTestId('fitness-class-fields')).toBeTruthy();
    expect(screen.getByText('Selected: General Fitness')).toBeTruthy();
  });
}); 