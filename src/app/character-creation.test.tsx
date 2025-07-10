import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import React from 'react';

import { setCharacter } from '@/lib/storage';

import CharacterCreation from './character-creation';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

// Mock storage
jest.mock('@/lib/storage', () => ({
  setCharacter: jest.fn(),
}));

const mockRouter = {
  replace: jest.fn(),
};

beforeEach(() => {
  (useRouter as jest.Mock).mockReturnValue(mockRouter);
  (setCharacter as jest.Mock).mockResolvedValue(undefined);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('CharacterCreation', () => {
  it('renders character creation form', () => {
    render(<CharacterCreation />);
    expect(screen.getByText('Create Your Character')).toBeTruthy();
    expect(
      screen.getByText(
        'Choose your name and fitness class to begin your adventure'
      )
    ).toBeTruthy();
    expect(screen.getByText('Character Name')).toBeTruthy();
    expect(
      screen.getByPlaceholderText("Enter your character's name")
    ).toBeTruthy();
    expect(screen.getByText('Choose Your Class')).toBeTruthy();
    expect(screen.getByText('Create Character')).toBeTruthy();
  });

  it('shows class details when a class is selected', () => {
    render(<CharacterCreation />);
    expect(screen.getByText('General Fitness')).toBeTruthy();
    expect(
      screen.getByText('Balanced approach to overall health')
    ).toBeTruthy();
    expect(screen.getByText('Starting Attributes:')).toBeTruthy();
    expect(screen.getByText('💪 Might: 8')).toBeTruthy();
    expect(screen.getByText('⚡ Speed: 8')).toBeTruthy();
    expect(screen.getByText('🛡️ Fortitude: 8')).toBeTruthy();
  });
});

// Split up the long test into smaller ones for linter compliance
function fillNameAndSubmit(name: string) {
  render(<CharacterCreation />);
  const nameInput = screen.getByPlaceholderText("Enter your character's name");
  fireEvent.changeText(nameInput, name);
  const createButton = screen.getByText('Create Character');
  fireEvent.press(createButton);
}

describe('CharacterCreation form submission', () => {
  it('creates character when form is filled and submitted', async () => {
    render(<CharacterCreation />);
    const nameInput = screen.getByPlaceholderText(
      "Enter your character's name"
    );
    const createButton = screen.getByText('Create Character');
    // Initially button should be disabled
    expect(createButton.props.disabled).toBe(true);
    // Enter character name
    fireEvent.changeText(nameInput, 'Test Character');
    // Button should be enabled now
    expect(createButton.props.disabled).toBe(false);
    // Submit form
    fireEvent.press(createButton);
    await waitFor(() => {
      expect(setCharacter).toHaveBeenCalledWith({
        name: 'Test Character',
        class: 'General Fitness',
        level: 1,
        experience: 0,
        classAttributes: {
          might: 8,
          speed: 8,
          fortitude: 8,
        },
        skills: [],
        equipment: [],
        abilities: [],
        notes: '',
      });
    });
  });

  it('redirects to main app after character creation', async () => {
    fillNameAndSubmit('Test Character');
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/(app)');
    });
  });

  it('trims whitespace from character name', async () => {
    fillNameAndSubmit('  Test Character  ');
    await waitFor(() => {
      expect(setCharacter).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Character', // Should be trimmed
        })
      );
    });
  });

  it('shows loading state while creating character', async () => {
    render(<CharacterCreation />);
    const nameInput = screen.getByPlaceholderText(
      "Enter your character's name"
    );
    fireEvent.changeText(nameInput, 'Test Character');
    const createButton = screen.getByText('Create Character');
    fireEvent.press(createButton);
    expect(screen.getByText('Creating Character...')).toBeTruthy();
    expect(createButton.props.disabled).toBe(true);
  });
});
