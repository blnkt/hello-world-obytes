import React from 'react';

import { cleanup, render, screen, setup } from '@/lib/test-utils';

import { ManualEntrySection } from './manual-entry-section';

global.alert = jest.fn();

// Mock the storage module globally to fix i18n issues
jest.mock('@/lib/storage', () => {
  const originalModule = require('../../../__mocks__/storage.tsx');
  return {
    ...originalModule,
    getManualStepsByDay: jest.fn(),
    clearManualStepsByDay: jest.fn(),
  };
});

// Mock the health hooks
jest.mock('@/lib/health', () => ({
  useManualEntryMode: jest.fn(),
  useDeveloperMode: jest.fn(),
}));

const mockUseManualEntryMode = jest.mocked(
  require('@/lib/health').useManualEntryMode
);
const mockUseDeveloperMode = jest.mocked(
  require('@/lib/health').useDeveloperMode
);
const mockGetManualStepsByDay = jest.mocked(
  require('@/lib/storage').getManualStepsByDay
);
const mockClearManualStepsByDay = jest.mocked(
  require('@/lib/storage').clearManualStepsByDay
);

afterEach(() => {
  cleanup();
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
    mockGetManualStepsByDay.mockReturnValue([]);
    mockClearManualStepsByDay.mockResolvedValue(undefined);
  });

  it('should render the manual entry section title', () => {
    render(<ManualEntrySection />);
    expect(screen.getByText('Manual Entry Settings')).toBeOnTheScreen();
  });

  it('should render manual entry mode toggle', () => {
    render(<ManualEntrySection />);
    expect(screen.getByText('Manual Entry Mode')).toBeOnTheScreen();
    expect(
      screen.getByText('Currently using HealthKit for step tracking')
    ).toBeOnTheScreen();
    expect(screen.getByText('Switch to Manual')).toBeOnTheScreen();
  });

  it('should render developer mode toggle', () => {
    render(<ManualEntrySection />);
    expect(screen.getByText('Developer Mode')).toBeOnTheScreen();
    expect(
      screen.getByText('Normal HealthKit availability checks')
    ).toBeOnTheScreen();
    expect(screen.getByText('Enable')).toBeOnTheScreen();
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

  describe('Manual Entry Mode Toggle', () => {
    it('should show correct state when manual mode is enabled', () => {
      mockUseManualEntryMode.mockReturnValue({
        ...defaultManualEntryMode,
        isManualMode: true,
      });

      render(<ManualEntrySection />);
      expect(
        screen.getByText('Currently using manual step entry')
      ).toBeOnTheScreen();
      expect(screen.getByText('Switch to HealthKit')).toBeOnTheScreen();
    });

    it('should show correct state when manual mode is disabled', () => {
      mockUseManualEntryMode.mockReturnValue({
        ...defaultManualEntryMode,
        isManualMode: false,
      });

      render(<ManualEntrySection />);
      expect(
        screen.getByText('Currently using HealthKit for step tracking')
      ).toBeOnTheScreen();
      expect(screen.getByText('Switch to Manual')).toBeOnTheScreen();
    });

    it('should call setManualMode when toggle button is pressed', async () => {
      const setManualMode = jest.fn();
      mockUseManualEntryMode.mockReturnValue({
        ...defaultManualEntryMode,
        setManualMode,
      });

      const { user } = setup(<ManualEntrySection />);
      await user.press(screen.getByText('Switch to Manual'));

      expect(setManualMode).toHaveBeenCalledWith(true);
    });

    it('should disable toggle when loading', () => {
      mockUseManualEntryMode.mockReturnValue({
        ...defaultManualEntryMode,
        isLoading: true,
      });

      render(<ManualEntrySection />);
      const toggleButton = screen.getByText('Switch to Manual');
      expect(toggleButton).toBeDisabled();
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
        screen.getByText('HealthKit checks bypassed for testing')
      ).toBeOnTheScreen();
      expect(screen.getByText('Disable')).toBeOnTheScreen();
    });

    it('should show correct state when developer mode is disabled', () => {
      mockUseDeveloperMode.mockReturnValue({
        ...defaultDeveloperMode,
        isDeveloperMode: false,
      });

      render(<ManualEntrySection />);
      expect(
        screen.getByText('Normal HealthKit availability checks')
      ).toBeOnTheScreen();
      expect(screen.getByText('Enable')).toBeOnTheScreen();
    });

    it('should call setDevMode when toggle button is pressed', async () => {
      const setDevMode = jest.fn();
      mockUseDeveloperMode.mockReturnValue({
        ...defaultDeveloperMode,
        setDevMode,
      });

      const { user } = setup(<ManualEntrySection />);
      await user.press(screen.getByText('Enable'));

      expect(setDevMode).toHaveBeenCalledWith(true);
    });

    it('should disable toggle when loading', () => {
      mockUseDeveloperMode.mockReturnValue({
        ...defaultDeveloperMode,
        isLoading: true,
      });

      render(<ManualEntrySection />);
      const toggleButton = screen.getByText('Enable');
      expect(toggleButton).toBeDisabled();
    });
  });

  describe('Manual Entries Info', () => {
    it('should show correct count when manual entries exist', () => {
      mockGetManualStepsByDay.mockReturnValue([
        { date: '2024-01-01', steps: 5000, source: 'manual' },
        { date: '2024-01-02', steps: 6000, source: 'manual' },
      ]);

      render(<ManualEntrySection />);
      expect(
        screen.getByText('2 manual step entries stored')
      ).toBeOnTheScreen();
    });

    it('should show zero count when no manual entries', () => {
      mockGetManualStepsByDay.mockReturnValue([]);

      render(<ManualEntrySection />);
      expect(
        screen.getByText('0 manual step entries stored')
      ).toBeOnTheScreen();
    });

    it('should show zero count when manual entries is null', () => {
      mockGetManualStepsByDay.mockReturnValue(null);

      render(<ManualEntrySection />);
      expect(
        screen.getByText('0 manual step entries stored')
      ).toBeOnTheScreen();
    });

    it('should handle error when loading manual steps count', () => {
      mockGetManualStepsByDay.mockImplementation(() => {
        throw new Error('Storage error');
      });

      render(<ManualEntrySection />);
      expect(
        screen.getByText('0 manual step entries stored')
      ).toBeOnTheScreen();
    });
  });

  describe('Clear Manual Entries', () => {
    it('should be enabled when manual entries exist', () => {
      mockGetManualStepsByDay.mockReturnValue([
        { date: '2024-01-01', steps: 5000, source: 'manual' },
      ]);

      render(<ManualEntrySection />);
      const clearButton = screen.getByText('Clear All Manual Entries');
      expect(clearButton).toBeEnabled();
    });

    it('should be disabled when no manual entries', () => {
      mockGetManualStepsByDay.mockReturnValue([]);

      render(<ManualEntrySection />);
      const clearButton = screen.getByText('Clear All Manual Entries');
      expect(clearButton).toBeDisabled();
    });

    it('should call clearManualStepsByDay when button is pressed', async () => {
      mockGetManualStepsByDay.mockReturnValue([
        { date: '2024-01-01', steps: 5000, source: 'manual' },
      ]);

      const { user } = setup(<ManualEntrySection />);
      await user.press(screen.getByText('Clear All Manual Entries'));

      expect(mockClearManualStepsByDay).toHaveBeenCalledTimes(1);
    });

    it('should handle error when clearing manual entries', async () => {
      mockGetManualStepsByDay.mockReturnValue([
        { date: '2024-01-01', steps: 5000, source: 'manual' },
      ]);
      mockClearManualStepsByDay.mockRejectedValue(new Error('Clear error'));

      const { user } = setup(<ManualEntrySection />);
      await user.press(screen.getByText('Clear All Manual Entries'));

      expect(mockClearManualStepsByDay).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle error in manual mode toggle', async () => {
      const setManualMode = jest
        .fn()
        .mockRejectedValue(new Error('Toggle error'));
      mockUseManualEntryMode.mockReturnValue({
        ...defaultManualEntryMode,
        setManualMode,
      });

      const { user } = setup(<ManualEntrySection />);
      await user.press(screen.getByText('Switch to Manual'));

      expect(setManualMode).toHaveBeenCalledWith(true);
    });

    it('should handle error in developer mode toggle', async () => {
      const setDevMode = jest.fn().mockRejectedValue(new Error('Toggle error'));
      mockUseDeveloperMode.mockReturnValue({
        ...defaultDeveloperMode,
        setDevMode,
      });

      const { user } = setup(<ManualEntrySection />);
      await user.press(screen.getByText('Enable'));

      expect(setDevMode).toHaveBeenCalledWith(true);
    });
  });
});
