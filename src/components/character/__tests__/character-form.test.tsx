import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

import { CharacterForm } from '../character-form';

// Mock the child components
jest.mock('../class-details', () => ({
  ClassDetails: ({ selectedClass }: { selectedClass: string }) => (
    <div data-testid="class-details">{selectedClass}</div>
  ),
}));

jest.mock('../class-select', () => ({
  ClassSelect: ({ selectedClass, setSelectedClass }: any) => (
    <div data-testid="class-select">
      <div>Selected: {selectedClass}</div>
      <button
        data-testid="change-class"
        onClick={() => setSelectedClass('Cardio Crusher')}
      >
        Change Class
      </button>
    </div>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChangeText, placeholder }: any) => (
    <input
      data-testid="name-input"
      value={value}
      onChange={(e) => onChangeText(e.target.value)}
      placeholder={placeholder}
    />
  ),
}));

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

    const nameInput = screen.getByTestId('name-input') as HTMLInputElement;
    expect(nameInput.value).toBe('Test Character');
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
    fireEvent.changeText(nameInput, 'New Character Name');

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

  it('renders class details component', () => {
    render(
      <CharacterForm
        name=""
        setName={mockSetName}
        selectedClass="General Fitness"
        setSelectedClass={mockSetSelectedClass}
      />
    );

    expect(screen.getByTestId('class-details')).toHaveTextContent('General Fitness');
  });
}); 