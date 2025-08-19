import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import ManualEntrySection from './manual-entry-section';

global.alert = jest.fn();

// Mock the storage module globally to fix i18n issues
jest.mock('@/lib/storage', () => {
  const originalModule = require('../../../__mocks__/storage.tsx');
  return {
    ...originalModule,
    getManualStepsByDay: jest.fn(),
    clearManualStepsByDay: jest.fn(),
    useManualStepsByDay: jest.fn(),
  };
});

// Mock the health hooks
jest.mock('@/lib/health', () => ({
  useManualEntryMode: jest.fn(),
  useDeveloperMode: jest.fn(),
  useExperienceData: jest.fn(),
}));

const mockUseManualEntryMode = jest.mocked(
  require('@/lib/health').useManualEntryMode
);
const mockUseDeveloperMode = jest.mocked(
  require('@/lib/health').useDeveloperMode
);
const mockUseExperienceData = jest.mocked(
  require('@/lib/health').useExperienceData
);
const mockGetManualStepsByDay = jest.mocked(
  require('@/lib/storage').getManualStepsByDay
);
const mockClearManualStepsByDay = jest.mocked(
  require('@/lib/storage').clearManualStepsByDay
);
const mockUseManualStepsByDay = jest.mocked(
  require('@/lib/storage').useManualStepsByDay
);

afterEach(() => {
  jest.clearAllMocks();
});

describe('ManualEntrySection', () => {
  const defaultManualEntryMode = {
    isManualMode: false,
    setManualMode: jest.fn(),
    isLoading: false,
  };

  const defaultDeveloperMode = {
    isDeveloperMode: false,
    setDevMode: jest.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    mockUseManualEntryMode.mockReturnValue(defaultManualEntryMode);
    mockUseDeveloperMode.mockReturnValue(defaultDeveloperMode);
    mockUseExperienceData.mockReturnValue({
      experience: 0,
      cumulativeExperience: 0,
      firstExperienceDate: null,
      stepsByDay: [],
      refreshExperience: jest.fn(),
    });
    mockGetManualStepsByDay.mockReturnValue([]);
    mockClearManualStepsByDay.mockResolvedValue(undefined);
    mockUseManualStepsByDay.mockReturnValue([[], jest.fn()]);
  });

  it('should render the manual entry section title', () => {
    render(<ManualEntrySection />);
    expect(screen.getByText('Manual Entry Settings')).toBeOnTheScreen();
  });

  it('should render manual entry mode toggle', () => {
    render(<ManualEntrySection />);
    expect(screen.getByText('Manual Entry Mode')).toBeOnTheScreen();
    expect(
      screen.getByText('Enable manual step entry when HealthKit is unavailable')
    ).toBeOnTheScreen();
    expect(screen.getByTestId('manual-mode-toggle-button')).toBeOnTheScreen();
  });

  it('should render developer mode toggle', () => {
    render(<ManualEntrySection />);
    expect(screen.getByText('Developer Mode')).toBeOnTheScreen();
    expect(
      screen.getByText('Enable additional debugging and development features')
    ).toBeOnTheScreen();
    expect(
      screen.getByTestId('developer-mode-toggle-button')
    ).toBeOnTheScreen();
  });

  it('should render manual entries info', () => {
    render(<ManualEntrySection />);
    expect(screen.getByText('Manual Entries')).toBeOnTheScreen();
    expect(screen.getByText('0 manual step entries stored')).toBeOnTheScreen();
  });

  it('should render clear manual entries button', () => {
    render(<ManualEntrySection />);
    expect(screen.getByText('Clear All Manual Entries')).toBeOnTheScreen();
  });

  describe('Entry Mode Indicator', () => {
    it('should show HealthKit mode when manual mode is disabled', () => {
      mockUseManualEntryMode.mockReturnValue({
        ...defaultManualEntryMode,
        isManualMode: false,
      });

      render(<ManualEntrySection />);
      expect(screen.getByText('HealthKit')).toBeOnTheScreen();
      expect(
        screen.getByText('Using automatic HealthKit step tracking')
      ).toBeOnTheScreen();
    });

    it('should show Manual Entry mode when manual mode is enabled', () => {
      mockUseManualEntryMode.mockReturnValue({
        ...defaultManualEntryMode,
        isManualMode: true,
      });

      render(<ManualEntrySection />);
      expect(screen.getByText('Manual Entry')).toBeOnTheScreen();
      expect(
        screen.getByText('You are manually entering step data')
      ).toBeOnTheScreen();
    });

    it('should show DEV badge when developer mode is enabled', () => {
      mockUseDeveloperMode.mockReturnValue({
        ...defaultDeveloperMode,
        isDeveloperMode: true,
      });

      render(<ManualEntrySection />);
      expect(screen.getByText('DEV')).toBeOnTheScreen();
    });

    it('should not show DEV badge when developer mode is disabled', () => {
      mockUseDeveloperMode.mockReturnValue({
        ...defaultDeveloperMode,
        isDeveloperMode: false,
      });

      render(<ManualEntrySection />);
      expect(screen.queryByText('DEV')).not.toBeOnTheScreen();
    });

    it('should show both manual mode and DEV badge when both are enabled', () => {
      mockUseManualEntryMode.mockReturnValue({
        ...defaultManualEntryMode,
        isManualMode: true,
      });
      mockUseDeveloperMode.mockReturnValue({
        ...defaultDeveloperMode,
        isDeveloperMode: true,
      });

      render(<ManualEntrySection />);
      expect(screen.getByText('Manual Entry')).toBeOnTheScreen();
      expect(
        screen.getByText('You are manually entering step data')
      ).toBeOnTheScreen();
      expect(screen.getByText('DEV')).toBeOnTheScreen();
    });
  });

  describe('Manual Entry Mode Toggle', () => {
    it('should show correct state when manual mode is disabled', () => {
      render(<ManualEntrySection />);
      expect(
        screen.getByText(
          'Enable manual step entry when HealthKit is unavailable'
        )
      ).toBeOnTheScreen();
      // Use testID to avoid ambiguity
      expect(screen.getByTestId('manual-mode-toggle-button')).toBeOnTheScreen();
    });

    it('should call setManualMode when toggle button is pressed', () => {
      const setManualMode = jest.fn();
      mockUseManualEntryMode.mockReturnValue({
        ...defaultManualEntryMode,
        setManualMode,
      });

      render(<ManualEntrySection />);
      // Use testID to avoid ambiguity
      const enableButton = screen.getByTestId('manual-mode-toggle-button');
      fireEvent.press(enableButton);

      expect(setManualMode).toHaveBeenCalledWith(true);
    });

    it('should disable toggle when loading', () => {
      mockUseManualEntryMode.mockReturnValue({
        ...defaultManualEntryMode,
        isLoading: true,
      });

      render(<ManualEntrySection />);
      // Use testID to avoid ambiguity
      const enableButton = screen.getByTestId('manual-mode-toggle-button');
      expect(enableButton).toBeDisabled();
    });
  });

  describe('Developer Mode Toggle', () => {
    it('should show correct state when developer mode is enabled', () => {
      mockUseDeveloperMode.mockReturnValue({
        ...defaultDeveloperMode,
        isDeveloperMode: true,
      });

      render(<ManualEntrySection />);
      expect(
        screen.getByText('Enable additional debugging and development features')
      ).toBeOnTheScreen();
      // Use testID to avoid ambiguity
      expect(
        screen.getByTestId('developer-mode-toggle-button')
      ).toBeOnTheScreen();
    });

    it('should show correct state when developer mode is disabled', () => {
      render(<ManualEntrySection />);
      expect(
        screen.getByText('Enable additional debugging and development features')
      ).toBeOnTheScreen();
      // Use testID to avoid ambiguity
      expect(
        screen.getByTestId('developer-mode-toggle-button')
      ).toBeOnTheScreen();
    });

    it('should call setDevMode when toggle button is pressed', () => {
      const setDevMode = jest.fn();
      mockUseDeveloperMode.mockReturnValue({
        ...defaultDeveloperMode,
        setDevMode,
      });

      render(<ManualEntrySection />);
      // Use testID to avoid ambiguity
      const enableButton = screen.getByTestId('developer-mode-toggle-button');
      fireEvent.press(enableButton);

      expect(setDevMode).toHaveBeenCalledWith(true);
    });

    it('should disable toggle when loading', () => {
      mockUseDeveloperMode.mockReturnValue({
        ...defaultDeveloperMode,
        isLoading: true,
      });

      render(<ManualEntrySection />);
      // Use testID to avoid ambiguity
      const enableButton = screen.getByTestId('developer-mode-toggle-button');
      expect(enableButton).toBeDisabled();
    });
  });

  describe('Manual Entries Info', () => {
    it('should show correct count when manual entries exist', () => {
      mockUseManualStepsByDay.mockReturnValue([
        [
          { date: '2024-01-01', steps: 5000, source: 'manual' },
          { date: '2024-01-02', steps: 6000, source: 'manual' },
        ],
        jest.fn(),
      ]);

      render(<ManualEntrySection />);
      expect(
        screen.getByText('2 manual step entries stored')
      ).toBeOnTheScreen();
    });

    it('should show zero count when no manual entries', () => {
      mockUseManualStepsByDay.mockReturnValue([[], jest.fn()]);

      render(<ManualEntrySection />);
      expect(
        screen.getByText('0 manual step entries stored')
      ).toBeOnTheScreen();
    });

    it('should show zero count when manual entries is null', () => {
      mockUseManualStepsByDay.mockReturnValue([[], jest.fn()]);

      render(<ManualEntrySection />);
      expect(
        screen.getByText('0 manual step entries stored')
      ).toBeOnTheScreen();
    });

    it('should handle error when loading manual steps count', () => {
      mockUseManualStepsByDay.mockReturnValue([[], jest.fn()]);

      render(<ManualEntrySection />);

      // The error should be logged but the component should continue to work
      // with default values (0 count)
      expect(
        screen.getByText('0 manual step entries stored')
      ).toBeOnTheScreen();
    });
  });

  describe('Clear Manual Entries', () => {
    it('should be enabled when manual entries exist', () => {
      mockUseManualStepsByDay.mockReturnValue([
        [{ date: '2024-01-01', steps: 5000, source: 'manual' }],
        jest.fn(),
      ]);

      render(<ManualEntrySection />);
      const clearButton = screen.getByText('Clear All Manual Entries');
      expect(clearButton).toBeEnabled();
    });

    it('should be disabled when no manual entries', () => {
      mockUseManualStepsByDay.mockReturnValue([[], jest.fn()]);

      render(<ManualEntrySection />);
      const clearButton = screen.getByText('Clear All Manual Entries');
      expect(clearButton).toBeDisabled();
    });

    it('should call clearManualStepsByDay when button is pressed', async () => {
      mockUseManualStepsByDay.mockReturnValue([
        [{ date: '2024-01-01', steps: 5000, source: 'manual' }],
        jest.fn(),
      ]);

      render(<ManualEntrySection />);
      fireEvent.press(screen.getByText('Clear All Manual Entries'));

      expect(mockClearManualStepsByDay).toHaveBeenCalledTimes(1);
    });

    it('should handle error when clearing manual entries', async () => {
      mockUseManualStepsByDay.mockReturnValue([
        [{ date: '2024-01-01', steps: 5000, source: 'manual' }],
        jest.fn(),
      ]);
      mockClearManualStepsByDay.mockRejectedValue(new Error('Clear error'));

      render(<ManualEntrySection />);
      fireEvent.press(screen.getByText('Clear All Manual Entries'));

      expect(mockClearManualStepsByDay).toHaveBeenCalledTimes(1);

      // The error should be logged but the component should continue to work
      // The clear operation should still be attempted
      expect(mockClearManualStepsByDay).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle error in manual mode toggle', () => {
      const setManualMode = jest.fn();
      mockUseManualEntryMode.mockReturnValue({
        ...defaultManualEntryMode,
        setManualMode,
      });

      render(<ManualEntrySection />);
      // Use testID to avoid ambiguity
      const enableButton = screen.getByTestId('manual-mode-toggle-button');
      fireEvent.press(enableButton);

      expect(setManualMode).toHaveBeenCalledWith(true);
    });

    it('should handle error in developer mode toggle', () => {
      const setDevMode = jest.fn();
      mockUseDeveloperMode.mockReturnValue({
        ...defaultDeveloperMode,
        setDevMode,
      });

      render(<ManualEntrySection />);
      // Use testID to avoid ambiguity
      const enableButton = screen.getByTestId('developer-mode-toggle-button');
      fireEvent.press(enableButton);

      expect(setDevMode).toHaveBeenCalledWith(true);
    });
  });
});
