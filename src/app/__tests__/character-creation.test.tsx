import { render, screen } from '@testing-library/react-native';
import React from 'react';

import CharacterCreation from '../character-creation';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    replace: jest.fn(),
  })),
}));

// Mock storage functions
jest.mock('@/lib/storage', () => ({
  setCharacter: jest.fn(),
}));

// Mock UI components
jest.mock('@/components/ui', () => ({
  Button: ({ label }: { label: string }) => <div>{label}</div>,
  FocusAwareStatusBar: () => <div />,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock character form
jest.mock('@/components/character/character-form', () => ({
  CharacterForm: () => <div>Character Form</div>,
}));

describe('Character Creation Flow', () => {
  it('should render character creation form without errors', () => {
    // This test verifies that the component renders without throwing errors
    const { root } = render(<CharacterCreation />);
    expect(root).toBeTruthy();
  });

  it('should not contain class-related elements', () => {
    render(<CharacterCreation />);

    // Should not contain any class-related elements
    expect(screen.queryByText('Choose your fitness class')).toBeFalsy();
    expect(screen.queryByText('Class Selection')).toBeFalsy();
    expect(screen.queryByText('Fitness Class')).toBeFalsy();
  });
});
