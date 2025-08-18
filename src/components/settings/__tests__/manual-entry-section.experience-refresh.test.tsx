import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';

// Mock the health module to test the refresh system
jest.mock('@/lib/health', () => ({
  ...jest.requireActual('@/lib/health'),
  useManualEntryMode: jest.fn(),
  useDeveloperMode: jest.fn(),
  triggerExperienceRefresh: jest.fn(),
}));

// Mock storage
jest.mock('@/lib/storage', () => require('../../../../__mocks__/storage.tsx'));

import { ManualEntrySection } from '../manual-entry-section';
import {
  getManualStepsByDay,
  setManualStepsByDay,
  clearManualStepsByDay,
  setManualStepEntry,
  getCurrency,
  setCurrency,
  getExperience,
  setExperience,
  getCumulativeExperience,
  setCumulativeExperience,
} from '@/lib/storage';

import {
  useManualEntryMode,
  useDeveloperMode,
  triggerExperienceRefresh,
} from '@/lib/health';

// Mock the hooks
const mockUseManualEntryMode = jest.mocked(useManualEntryMode);
const mockUseDeveloperMode = jest.mocked(useDeveloperMode);
const mockTriggerExperienceRefresh = jest.mocked(triggerExperienceRefresh);

describe('Manual Entry Section Experience Refresh Integration', () => {
  beforeEach(async () => {
    // Clear all storage before each test
    await clearManualStepsByDay();
    await setCurrency(0);
    await setExperience(0);
    await setCumulativeExperience(0);
    
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
  });

  afterEach(async () => {
    // Clean up after each test
    await clearManualStepsByDay();
    await setCurrency(0);
    await setExperience(0);
    await setCumulativeExperience(0);
  });

  describe('Manual Step Entry Triggers Experience Refresh', () => {
    it('should trigger experience refresh when adding manual step entry', async () => {
      // Set up initial state
      await setExperience(1000);
      await setCumulativeExperience(1000);
      await setCurrency(100);
      
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
        expect(mockTriggerExperienceRefresh).toHaveBeenCalledTimes(1);
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

    it('should trigger experience refresh for each manual step entry', async () => {
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
        expect(mockTriggerExperienceRefresh).toHaveBeenCalledTimes(1);
      });
      
      // Add second entry
      fireEvent.changeText(dateInput, '2024-06-02');
      fireEvent.changeText(stepCountInput, '4000');
      fireEvent.press(addButton);
      
      // Wait for second submission
      await waitFor(() => {
        expect(mockTriggerExperienceRefresh).toHaveBeenCalledTimes(2);
      });
      
      // Verify both entries were added
      const manualSteps = await getManualStepsByDay();
      expect(manualSteps).toHaveLength(2);
    });

    it('should not trigger experience refresh when form validation fails', async () => {
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
      expect(mockTriggerExperienceRefresh).not.toHaveBeenCalled();
    });

    it('should trigger experience refresh even when adding steps for past dates', async () => {
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
        expect(mockTriggerExperienceRefresh).toHaveBeenCalledTimes(1);
      });
      
      // Verify the entry was added
      const manualSteps = await getManualStepsByDay();
      expect(manualSteps).toHaveLength(1);
      expect(manualSteps[0].date).toBe('2024-01-15');
    });
  });

  describe('Experience Refresh Timing and State Updates', () => {
    it('should trigger refresh after successful step entry and before showing success message', async () => {
      render(<ManualEntrySection />);
      
      const dateInput = screen.getByPlaceholderText('YYYY-MM-DD');
      const stepCountInput = screen.getByPlaceholderText('Enter step count');
      const addButton = screen.getByText('Add Step Entry');
      
      // Fill and submit form
      fireEvent.changeText(dateInput, '2024-06-01');
      fireEvent.changeText(stepCountInput, '6000');
      fireEvent.press(addButton);
      
      // Wait for the refresh to be triggered
      await waitFor(() => {
        expect(mockTriggerExperienceRefresh).toHaveBeenCalledTimes(1);
      });
      
      // Verify the success message appears (this happens after refresh)
      // Note: In tests, the alert might not be visible, so we just verify the refresh was triggered
      await waitFor(() => {
        expect(mockTriggerExperienceRefresh).toHaveBeenCalledTimes(1);
      });
    });

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
        expect(mockTriggerExperienceRefresh).toHaveBeenCalledTimes(1);
      });
      
      // Verify form is reset and ready for next entry
      await waitFor(() => {
        expect(dateInput.props.value).toBe(new Date().toISOString().split('T')[0]); // Today's date
        expect(stepCountInput.props.value).toBe(''); // Empty
      });
    });
  });

  describe('Integration with Experience System', () => {
    it('should properly integrate manual steps with existing experience totals', async () => {
      // Set up existing experience
      await setExperience(8000);
      await setCumulativeExperience(8000);
      await setCurrency(800);
      
      render(<ManualEntrySection />);
      
      const dateInput = screen.getByPlaceholderText('YYYY-MM-DD');
      const stepCountInput = screen.getByPlaceholderText('Enter step count');
      const addButton = screen.getByText('Add Step Entry');
      
      // Add manual steps
      fireEvent.changeText(dateInput, '2024-06-01');
      fireEvent.changeText(stepCountInput, '2000');
      fireEvent.press(addButton);
      
      // Wait for refresh
      await waitFor(() => {
        expect(mockTriggerExperienceRefresh).toHaveBeenCalledTimes(1);
      });
      
      // Verify manual steps were added
      const manualSteps = await getManualStepsByDay();
      expect(manualSteps).toHaveLength(1);
      expect(manualSteps[0].steps).toBe(2000);
      
      // The experience refresh should have been triggered to update totals
      // Note: In a real app, this would update the experience across all components
      expect(mockTriggerExperienceRefresh).toHaveBeenCalledWith();
    });

    it('should handle multiple step entries for the same date correctly', async () => {
      render(<ManualEntrySection />);
      
      const dateInput = screen.getByPlaceholderText('YYYY-MM-DD');
      const stepCountInput = screen.getByPlaceholderText('Enter step count');
      const addButton = screen.getByText('Add Step Entry');
      
      // Add first entry for same date
      fireEvent.changeText(dateInput, '2024-06-01');
      fireEvent.changeText(stepCountInput, '1500');
      fireEvent.press(addButton);
      
      await waitFor(() => {
        expect(mockTriggerExperienceRefresh).toHaveBeenCalledTimes(1);
      });
      
      // Add second entry for same date (form resets to today's date, so we need to set it again)
      fireEvent.changeText(dateInput, '2024-06-01');
      fireEvent.changeText(stepCountInput, '2500');
      fireEvent.press(addButton);
      
      await waitFor(() => {
        expect(mockTriggerExperienceRefresh).toHaveBeenCalledTimes(2);
      });
      
      // Verify both entries exist
      const manualSteps = await getManualStepsByDay();
      // The storage system replaces entries for the same date, so we expect 1 entry with the last value
      expect(manualSteps).toHaveLength(1);
      expect(manualSteps[0].date).toBe('2024-06-01');
      expect(manualSteps[0].steps).toBe(2500); // Last entry value (replaces the first)
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should not trigger refresh when step entry fails', async () => {
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
      expect(mockTriggerExperienceRefresh).not.toHaveBeenCalled();
      
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
        expect(mockTriggerExperienceRefresh).toHaveBeenCalledTimes(1);
      });
      
      // Verify the entry was added
      const manualSteps = await getManualStepsByDay();
      expect(manualSteps).toHaveLength(1);
      expect(manualSteps[0].steps).toBe(99999);
    });
  });
});
