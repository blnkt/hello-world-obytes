import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

import { ClassSelect } from '../class-select';

// Mock the Select component
jest.mock('@/components/ui/select', () => ({
  Select: ({ options, value, onSelect, placeholder }: any) => (
    <div data-testid="select">
      <div data-testid="placeholder">{placeholder}</div>
      <div data-testid="value">{value}</div>
      <div data-testid="options-count">{options.length}</div>
      <button
        data-testid="select-button"
        onClick={() => onSelect({ value: 'Cardio Crusher' })}
      >
        Select Cardio Crusher
      </button>
    </div>
  ),
}));

describe('ClassSelect', () => {
  const mockSetSelectedClass = jest.fn();

  beforeEach(() => {
    mockSetSelectedClass.mockClear();
  });

  it('renders class selection with correct label', () => {
    render(
      <ClassSelect
        selectedClass="General Fitness"
        setSelectedClass={mockSetSelectedClass}
      />
    );

    expect(screen.getByText('Choose Your Class')).toBeTruthy();
    expect(screen.getByTestId('placeholder')).toBeTruthy();
  });

  it('displays current selected class', () => {
    render(
      <ClassSelect
        selectedClass="Strength Seeker"
        setSelectedClass={mockSetSelectedClass}
      />
    );

    expect(screen.getByTestId('value')).toHaveTextContent('Strength Seeker');
  });

  it('shows all fitness class options', () => {
    render(
      <ClassSelect
        selectedClass="General Fitness"
        setSelectedClass={mockSetSelectedClass}
      />
    );

    // Should have 5 fitness class options
    expect(screen.getByTestId('options-count')).toHaveTextContent('5');
  });

  it('calls setSelectedClass when option is selected', () => {
    render(
      <ClassSelect
        selectedClass="General Fitness"
        setSelectedClass={mockSetSelectedClass}
      />
    );

    const selectButton = screen.getByTestId('select-button');
    fireEvent.press(selectButton);

    expect(mockSetSelectedClass).toHaveBeenCalledWith('Cardio Crusher');
  });
}); 