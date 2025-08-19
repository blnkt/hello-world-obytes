import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';

// Mock the health module to test the refresh system
jest.mock('@/lib/health', () => ({
  ...jest.requireActual('@/lib/health'),
  useManualEntryMode: jest.fn(),
  useDeveloperMode: jest.fn(),
  useExperienceData: jest.fn(),
}));

// Mock storage
jest.mock('@/lib/storage', () => require('../../../../__mocks__/storage.tsx'));

import ManualEntrySection from '../manual-entry-section';
import {
  clearManualStepsByDay,
  getManualStepsByDay,
  setManualStepEntry,
} from '@/lib/storage';
import { useDeveloperMode, useManualEntryMode, useExperienceData } from '@/lib/health';

// Mock the hooks
const mockUseManualEntryMode = jest.mocked(useManualEntryMode);
const mockUseDeveloperMode = jest.mocked(useDeveloperMode);
const mockUseExperienceData = jest.mocked(useExperienceData);

describe.skip('Manual Entry Section Component Behavior', () => {
  const mockRefreshExperience = jest.fn();

  beforeEach(async () => {
    // Clear all storage before each test
    await clearManualStepsByDay();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Default mock implementations
    mockUseManualEntryMode.mockReturnValue({
      isManualMode: true,
      setManualMode: jest.fn(),
      isLoading: false,
    });
    
    mockUseDeveloperMode.mockReturnValue({
      isDeveloperMode: false,
      setDevMode: jest.fn(),
      isLoading: false,
    });

    mockUseExperienceData.mockReturnValue({
      experience: 0,
      cumulativeExperience: 0,
      firstExperienceDate: null,
      stepsByDay: [],
      refreshExperience: mockRefreshExperience,
    });
  });

  afterEach(async () => {
    // Clean up after each test
    await clearManualStepsByDay();
  });

  describe('Form Submission and Experience Refresh', () => {
    it('should call refreshExperience when adding manual step entry', async () => {
      render(<ManualEntrySection />);
      
      // Find the form inputs
      const dateInput = screen.getByPlaceholderText('YYYY-MM-DD');
      const stepCountInput = screen.getByPlaceholderText('Enter step count');
      const addButton = screen.getByText('Add Step Entry');
      
      // Fill in the form
      fireEvent.changeText(dateInput, '2024-06-01');
      fireEvent.changeText(stepCountInput, '5000');
      
      // Submit the form
      fireEvent.press(addButton);
      
      // Wait for the form submission to complete
      await waitFor(() => {
        expect(mockRefreshExperience).toHaveBeenCalledTimes(1);
      });
      
      // Verify the manual step was added
      const manualSteps = await getManualStepsByDay();
      expect(manualSteps).toHaveLength(1);
      expect(manualSteps[0]).toEqual({
        date: '2024-06-01',
        steps: 5000,
        source: 'manual',
      });
    });

    it('should call refreshExperience for each manual step entry', async () => {
      render(<ManualEntrySection />);
      
      const dateInput = screen.getByPlaceholderText('YYYY-MM-DD');
      const stepCountInput = screen.getByPlaceholderText('Enter step count');
      const addButton = screen.getByText('Add Step Entry');
      
      // Add first entry
      fireEvent.changeText(dateInput, '2024-06-01');
      fireEvent.changeText(stepCountInput, '3000');
      fireEvent.press(addButton);
      
      // Wait for first submission
      await waitFor(() => {
        expect(mockRefreshExperience).toHaveBeenCalledTimes(1);
      });
      
      // Add second entry
      fireEvent.changeText(dateInput, '2024-06-02');
      fireEvent.changeText(stepCountInput, '4000');
      fireEvent.press(addButton);
      
      // Wait for second submission
      await waitFor(() => {
        expect(mockRefreshExperience).toHaveBeenCalledTimes(2);
      });
      
      // Verify both entries were added
      const manualSteps = await getManualStepsByDay();
      expect(manualSteps).toHaveLength(2);
    });

    it('should not call refreshExperience when form validation fails', async () => {
      render(<ManualEntrySection />);
      
      const stepCountInput = screen.getByPlaceholderText('Enter step count');
      const addButton = screen.getByText('Add Step Entry');
      
      // Try to submit with invalid data (no date, invalid step count)
      fireEvent.changeText(stepCountInput, 'abc');
      fireEvent.press(addButton);
      
      // Wait a bit to ensure no refresh is triggered
      await waitFor(() => {
        // The button should be disabled or show validation error
        expect(screen.getByText('Add Step Entry')).toBeTruthy();
      });
      
      // Verify no experience refresh was triggered
      expect(mockRefreshExperience).not.toHaveBeenCalled();
    });

    it('should call refreshExperience even when adding steps for past dates', async () => {
      render(<ManualEntrySection />);
      
      const dateInput = screen.getByPlaceholderText('YYYY-MM-DD');
      const stepCountInput = screen.getByPlaceholderText('Enter step count');
      const addButton = screen.getByText('Add Step Entry');
      
      // Add entry for a past date
      fireEvent.changeText(dateInput, '2024-01-15');
      fireEvent.changeText(stepCountInput, '2500');
      fireEvent.press(addButton);
      
      // Wait for submission
      await waitFor(() => {
        expect(mockRefreshExperience).toHaveBeenCalledTimes(1);
      });
      
      // Verify the entry was added
      const manualSteps = await getManualStepsByDay();
      expect(manualSteps).toHaveLength(1);
      expect(manualSteps[0].date).toBe('2024-01-15');
    });
  });

  describe('Form State Management', () => {
    it('should maintain form state consistency after triggering refresh', async () => {
      render(<ManualEntrySection />);
      
      const dateInput = screen.getByPlaceholderText('YYYY-MM-DD');
      const stepCountInput = screen.getByPlaceholderText('Enter step count');
      const addButton = screen.getByText('Add Step Entry');
      
      // Fill and submit form
      fireEvent.changeText(dateInput, '2024-06-01');
      fireEvent.changeText(stepCountInput, '3500');
      fireEvent.press(addButton);
      
      // Wait for submission and refresh
      await waitFor(() => {
        expect(mockRefreshExperience).toHaveBeenCalledTimes(1);
      });
      
      // Verify form is reset and ready for next entry
      await waitFor(() => {
        expect(dateInput.props.value).toBe(new Date().toISOString().split('T')[0]); // Today's date
        expect(stepCountInput.props.value).toBe(''); // Empty
      });
    });
  });

  describe('Error Handling', () => {
    it('should not call refreshExperience when step entry fails', async () => {
      // Mock a failure in setManualStepEntry
      const originalSetManualStepEntry = setManualStepEntry;
      jest.spyOn(require('@/lib/storage'), 'setManualStepEntry').mockRejectedValueOnce(
        new Error('Storage error')
      );
      
      render(<ManualEntrySection />);
      
      const dateInput = screen.getByPlaceholderText('YYYY-MM-DD');
      const stepCountInput = screen.getByPlaceholderText('Enter step count');
      const addButton = screen.getByText('Add Step Entry');
      
      // Fill and submit form
      fireEvent.changeText(dateInput, '2024-06-01');
      fireEvent.changeText(stepCountInput, '1000');
      fireEvent.press(addButton);
      
      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText(/Failed to add step entry/)).toBeTruthy();
      });
      
      // Verify no refresh was triggered due to failure
      expect(mockRefreshExperience).not.toHaveBeenCalled();
      
      // Restore original function
      jest.restoreAllMocks();
    });

    it('should handle very large step counts correctly', async () => {
      render(<ManualEntrySection />);
      
      const dateInput = screen.getByPlaceholderText('YYYY-MM-DD');
      const stepCountInput = screen.getByPlaceholderText('Enter step count');
      const addButton = screen.getByText('Add Step Entry');
      
      // Add a large but valid step count
      fireEvent.changeText(dateInput, '2024-06-01');
      fireEvent.changeText(stepCountInput, '99999');
      fireEvent.press(addButton);
      
      // Wait for submission
      await waitFor(() => {
        expect(mockRefreshExperience).toHaveBeenCalledTimes(1);
      });
      
      // Verify the entry was added
      const manualSteps = await getManualStepsByDay();
      expect(manualSteps).toHaveLength(1);
      expect(manualSteps[0].steps).toBe(99999);
    });
  });
});
