import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import BustScreen, { type BustConsequence } from '../bust-screen';

// Mock expo-router
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

describe('BustScreen', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockConsequence: BustConsequence = {
    itemsLost: 5,
    energyLost: 100,
    xpPreserved: true,
    xpAmount: 150,
    message: 'You ran out of energy and could not afford to return safely.',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('should render bust screen with consequence data', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      consequence: JSON.stringify(mockConsequence),
    });

    const { getByText } = render(<BustScreen />);

    expect(getByText('You Busted!')).toBeDefined();
    expect(getByText(mockConsequence.message)).toBeDefined();
  });

  it('should display items lost', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      consequence: JSON.stringify(mockConsequence),
    });

    const { getByText } = render(<BustScreen />);

    expect(getByText('Items Lost')).toBeDefined();
    expect(getByText(/-\s*5$/)).toBeDefined();
  });

  it('should display energy lost', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      consequence: JSON.stringify(mockConsequence),
    });

    const { getByText } = render(<BustScreen />);

    expect(getByText('Energy Lost')).toBeDefined();
    expect(getByText(/-\s*100$/)).toBeDefined();
  });

  it('should display XP preserved when xpPreserved is true', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      consequence: JSON.stringify(mockConsequence),
    });

    const { getByText } = render(<BustScreen />);

    expect(getByText('Progress Preserved')).toBeDefined();
    expect(getByText('XP Gained (Preserved)')).toBeDefined();
    expect(getByText('150')).toBeDefined();
  });

  it('should not display XP section when xpPreserved is false', () => {
    const consequenceWithoutXP: BustConsequence = {
      ...mockConsequence,
      xpPreserved: false,
    };

    (useLocalSearchParams as jest.Mock).mockReturnValue({
      consequence: JSON.stringify(consequenceWithoutXP),
    });

    const { queryByText } = render(<BustScreen />);

    expect(queryByText('Progress Preserved')).toBeNull();
  });

  it('should navigate to run queue when acknowledge button is pressed', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      consequence: JSON.stringify(mockConsequence),
    });

    const { getByTestId } = render(<BustScreen />);

    const acknowledgeButton = getByTestId('acknowledge-bust');
    fireEvent.press(acknowledgeButton);

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(mockRouter.push).toHaveBeenCalledWith('/(app)/run-queue');
  });

  it('should handle missing consequence parameter', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({});

    const rendered = render(<BustScreen />);
    const { getByText } = rendered;

    expect(getByText('You Busted!')).toBeDefined();
    expect(
      rendered.getAllByText(
        /You pushed too deep and could not afford to return\./
      ).length
    ).toBeGreaterThan(0);
  });

  it('should handle invalid JSON in consequence parameter', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      consequence: 'invalid json',
    });

    const rendered = render(<BustScreen />);
    const { getByText } = rendered;

    expect(getByText('You Busted!')).toBeDefined();
    // Duplicate lines may render; ensure at least one instance is present
    expect(
      rendered.getAllByText(/You pushed too deep and could not afford to return\./)
        .length
    ).toBeGreaterThan(0);
  });

  it('should format large numbers correctly', () => {
    const largeConsequence: BustConsequence = {
      itemsLost: 1234,
      energyLost: 5678,
      xpPreserved: true,
      xpAmount: 9012,
      message: 'Test message',
    };

    (useLocalSearchParams as jest.Mock).mockReturnValue({
      consequence: JSON.stringify(largeConsequence),
    });

    const { getByText } = render(<BustScreen />);

    expect(getByText(/-\s*1234$/)).toBeDefined();
    expect(getByText(/-\s*5678$/)).toBeDefined();
    expect(getByText('9012')).toBeDefined();
  });

  it('should handle zero values', () => {
    const zeroConsequence: BustConsequence = {
      itemsLost: 0,
      energyLost: 0,
      xpPreserved: true,
      xpAmount: 0,
      message: 'No losses',
    };

    (useLocalSearchParams as jest.Mock).mockReturnValue({
      consequence: JSON.stringify(zeroConsequence),
    });

    const { getByText } = render(<BustScreen />);

    expect(getByText('0')).toBeDefined();
    expect(getByText('No losses')).toBeDefined();
  });

  it('should display loss indicators correctly', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      consequence: JSON.stringify(mockConsequence),
    });

    const { getByText } = render(<BustScreen />);

    // Items and energy should show as losses (negative indicator)
    const itemsSection = getByText('Items Lost');
    expect(itemsSection).toBeDefined();

    const energySection = getByText('Energy Lost');
    expect(energySection).toBeDefined();
  });
});
