import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import { act, render } from '@testing-library/react-native';

import RunHistoryScreen from '../run-history';
import { getProgressionManager } from '@/lib/delvers-descent/progression-manager';

// Mock dependencies
jest.mock('expo-router', () => ({
  Stack: {
    Screen: ({ children }: { children: React.ReactNode }) => children,
  },
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock('@/lib/delvers-descent/progression-manager');
jest.mock('@/components/delvers-descent/progression/progression-navigation', () => ({
  ProgressionNavigation: () => null,
}));

describe('RunHistoryScreen - Refresh on Focus', () => {
  let mockProgressionManager: any;
  let mockFocusCallback: (() => void) | null = null;

  const mockProgressionData = {
    allTimeDeepestDepth: 5,
    totalRunsCompleted: 10,
    totalRunsBusted: 3,
    totalRunsAttempted: 13,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock progression manager
    mockProgressionManager = {
      getProgressionData: jest.fn().mockReturnValue(mockProgressionData),
    };

    (getProgressionManager as jest.Mock).mockReturnValue(mockProgressionManager);

    // Mock useFocusEffect to capture the callback
    (useFocusEffect as jest.Mock).mockImplementation((callback) => {
      mockFocusCallback = callback;
    });
  });

  it('should load progression data on initial render', () => {
    render(<RunHistoryScreen />);

    // The component should call getProgressionData via useFocusEffect
    // which is called on mount/focus
    if (mockFocusCallback) {
      act(() => {
        mockFocusCallback!();
      });
    }

    expect(mockProgressionManager.getProgressionData).toHaveBeenCalled();
  });

  it('should refresh progression data when screen comes into focus', () => {
    render(<RunHistoryScreen />);

    // Clear the initial call
    jest.clearAllMocks();

    // Simulate screen focus
    if (mockFocusCallback) {
      act(() => {
        mockFocusCallback!();
      });
    }

    expect(mockProgressionManager.getProgressionData).toHaveBeenCalled();
  });

  it('should display updated progression data after refresh', () => {
    const { getByText, rerender } = render(<RunHistoryScreen />);

    // Trigger initial focus to load data
    if (mockFocusCallback) {
      act(() => {
        mockFocusCallback!();
      });
    }

    // Wait for initial render
    expect(getByText('3')).toBeDefined(); // totalRunsBusted

    // Update progression data
    mockProgressionManager.getProgressionData.mockReturnValue({
      allTimeDeepestDepth: 7,
      totalRunsCompleted: 12,
      totalRunsBusted: 5,
      totalRunsAttempted: 17,
    });

    // Simulate focus refresh
    if (mockFocusCallback) {
      act(() => {
        mockFocusCallback!();
      });
    }

    // Re-render to see updated data
    rerender(<RunHistoryScreen />);

    expect(getByText('5')).toBeDefined(); // Updated totalRunsBusted
    expect(getByText('7')).toBeDefined(); // Updated deepest depth
  });

  it('should use useFocusEffect hook', () => {
    render(<RunHistoryScreen />);

    expect(useFocusEffect).toHaveBeenCalled();
  });

  it('should handle multiple focus events', () => {
    render(<RunHistoryScreen />);

    jest.clearAllMocks();

    // Simulate multiple focus events
    if (mockFocusCallback) {
      act(() => {
        mockFocusCallback!();
        mockFocusCallback!();
        mockFocusCallback!();
      });
    }

    // Should refresh each time
    expect(mockProgressionManager.getProgressionData).toHaveBeenCalledTimes(3);
  });

  it('should display all progression statistics', () => {
    const { getByText } = render(<RunHistoryScreen />);

    // Trigger focus callback to load data
    if (mockFocusCallback) {
      act(() => {
        mockFocusCallback!();
      });
    }

    // Wait for progression data to be loaded
    expect(getByText('All-Time Deepest Depth')).toBeDefined();
    expect(getByText('Total Runs Completed')).toBeDefined();
    expect(getByText('Total Runs Busted')).toBeDefined();
    expect(getByText('Total Runs Attempted')).toBeDefined();
    expect(getByText('5')).toBeDefined(); // deepest depth
    expect(getByText('10')).toBeDefined(); // completed
    expect(getByText('3')).toBeDefined(); // busted
    expect(getByText('13')).toBeDefined(); // attempted
  });
});

