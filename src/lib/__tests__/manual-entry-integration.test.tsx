import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { renderHook } from '@testing-library/react-native';

// Mock all necessary modules
jest.mock('@/lib/health', () => ({
  ...jest.requireActual('@/lib/health'),
  useManualEntryMode: jest.fn(),
  useDeveloperMode: jest.fn(),
}));

import {
  getManualStepsByDay,
  setManualStepsByDay,
  clearManualStepsByDay,
  setManualStepEntry,
  getStepsByDay,
  setStepsByDay,
  clearStepsByDay,
  getCurrency,
  setCurrency,
  getExperience,
  setExperience,
  getCumulativeExperience,
  setCumulativeExperience,
  validateManualStepEntry,
} from '../storage';

import {
  useStepCountAsExperience,
  getManualEntryMode,
  setManualEntryMode,
} from '../health';

import { ManualEntrySection } from '@/components/settings/manual-entry-section';

// Mock the hooks
const mockUseManualEntryMode = jest.mocked(require('@/lib/health').useManualEntryMode);
const mockUseDeveloperMode = jest.mocked(require('@/lib/health').useDeveloperMode);

// Get HealthKit mock
const HealthKitMock = require('@kingstinct/react-native-healthkit');

describe('Manual Entry Integration Tests', () => {
  beforeEach(async () => {
    // Clear all storage before each test
    await clearManualStepsByDay();
    await clearStepsByDay();
    setManualEntryMode(false);
    setCurrency(0);
    setExperience(0);
    setCumulativeExperience(0);
    
    // Clear HealthKit mock data
    HealthKitMock.__setStepSamples([]);
    
    // Ensure getStepsByDay returns empty array for HealthKit steps
    // This prevents triple-counting: manual + cached HealthKit + fresh HealthKit
    const emptyHealthKitSteps: { date: Date; steps: number }[] = [];
    await setStepsByDay(emptyHealthKitSteps);
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Default mock implementations
    mockUseManualEntryMode.mockReturnValue({
      isManualMode: false,
      toggleManualMode: jest.fn(),
    });
    
    mockUseDeveloperMode.mockReturnValue({
      isDeveloperMode: false,
      toggleDeveloperMode: jest.fn(),
    });
  });

  afterEach(async () => {
    // Clean up after each test
    await clearManualStepsByDay();
    await clearStepsByDay();
    setManualEntryMode(false);
    HealthKitMock.__setStepSamples([]);
  });

  describe('API-Level Integration Tests', () => {
    it('should integrate manual entries with experience and currency system', async () => {
      // Set up initial state
      await setCurrency(100);
      await setExperience(500);
      await setCumulativeExperience(1000);

      // Add manual step entries
      const manualSteps = [
        { date: '2024-06-01', steps: 5000, source: 'manual' as const },
        { date: '2024-06-02', steps: 3000, source: 'manual' as const },
      ];
      await setManualStepsByDay(manualSteps);

      // Set up HealthKit mock data (do NOT call setStepsByDay)
      HealthKitMock.__setStepSamples([
        { startDate: new Date('2024-06-01'), endDate: new Date('2024-06-01'), quantity: 2000 },
        { startDate: new Date('2024-06-02'), endDate: new Date('2024-06-02'), quantity: 4000 },
      ]);

      // Enable manual entry mode
      setManualEntryMode(true);

      // Test experience calculation
      const lastCheckedDateTime = new Date('2024-06-01');
      const { result } = renderHook(() =>
        useStepCountAsExperience(lastCheckedDateTime)
      );

      await waitFor(() => {
        const day1 = result.current.stepsByDay.find(day => {
          const dayDate = typeof day.date === 'string' ? new Date(day.date) : day.date;
          return dayDate.toISOString().split('T')[0] === '2024-06-01';
        });
        
        expect(day1?.steps).toBe(7000); // 5000 (manual) + 2000 (HealthKit)
        expect(result.current.experience).toBe(14000); // 7000 + 7000 for two days
      });
    });

    it('should validate step limit logic directly', () => {
      expect(validateManualStepEntry({ date: '2024-06-01', steps: 100001, source: 'manual' })).toBe(false);
      expect(validateManualStepEntry({ date: '2024-06-01', steps: 100000, source: 'manual' })).toBe(true);
    });

    it('should handle manual entry validation and error cases', async () => {
      // Test invalid entry structure
      const invalidEntry = { date: 'invalid-date', steps: -100, source: 'manual' as const };
      expect(validateManualStepEntry(invalidEntry)).toBe(false);

      // Test entry with steps above limit
      const tooHighEntry = { date: '2024-06-01', steps: 100001, source: 'manual' as const };
      expect(validateManualStepEntry(tooHighEntry)).toBe(false);

      // Test valid entry
      const validEntry = { date: '2024-06-01', steps: 5000, source: 'manual' as const };
      expect(validateManualStepEntry(validEntry)).toBe(true);
    });

    it('should handle duplicate date entries by combining steps', async () => {
      await clearManualStepsByDay();
      // Add multiple entries for the same date
      await setManualStepEntry({ date: '2024-06-01', steps: 3000, source: 'manual' });
      await setManualStepEntry({ date: '2024-06-01', steps: 2000, source: 'manual' });

      // Verify steps are combined
      const storedEntries = await getManualStepsByDay();
      expect(storedEntries).toHaveLength(1);
      expect(storedEntries[0].steps).toBe(5000); // 3000 + 2000
    });

    it('should clear manual entries and update experience accordingly', async () => {
      // Set up manual entries
      const manualSteps = [
        { date: '2024-06-01', steps: 5000, source: 'manual' as const },
        { date: '2024-06-02', steps: 3000, source: 'manual' as const },
      ];
      await setManualStepsByDay(manualSteps);

      // Verify entries exist
      let storedEntries = await getManualStepsByDay();
      expect(storedEntries).toHaveLength(2);

      // Clear entries
      await clearManualStepsByDay();

      // Verify entries are cleared
      storedEntries = await getManualStepsByDay();
      expect(storedEntries).toHaveLength(0);

      // Verify experience calculation reflects cleared entries
      const lastCheckedDateTime = new Date('2024-06-01');
      const { result } = renderHook(() =>
        useStepCountAsExperience(lastCheckedDateTime)
      );

      await waitFor(() => {
        expect(result.current.experience).toBe(0);
        expect(result.current.stepsByDay).toHaveLength(0);
      });
    });
  });

  describe('UI-Level Integration Tests', () => {
    it('should display correct entry mode indicator', () => {
      // Test HealthKit mode
      mockUseManualEntryMode.mockReturnValue({
        isManualMode: false,
        toggleManualMode: jest.fn(),
      });

      render(<ManualEntrySection />);
      expect(screen.getByText('HealthKit')).toBeOnTheScreen();
      expect(screen.getByText('Using automatic HealthKit step tracking')).toBeOnTheScreen();

      // Test Manual mode
      mockUseManualEntryMode.mockReturnValue({
        isManualMode: true,
        toggleManualMode: jest.fn(),
      });

      render(<ManualEntrySection />);
      expect(screen.getByText('Manual Entry')).toBeOnTheScreen();
      expect(screen.getByText('You are manually entering step data')).toBeOnTheScreen();
    });

    it('should display DEV badge when developer mode is enabled', () => {
      mockUseManualEntryMode.mockReturnValue({
        isManualMode: true,
        toggleManualMode: jest.fn(),
      });

      mockUseDeveloperMode.mockReturnValue({
        isDeveloperMode: true,
        toggleDeveloperMode: jest.fn(),
      });

      render(<ManualEntrySection />);
      expect(screen.getByText('DEV')).toBeOnTheScreen();
    });

    it('should display manual entries count correctly', async () => {
      // Set up manual entries
      const manualSteps = [
        { date: '2024-06-01', steps: 5000, source: 'manual' as const },
        { date: '2024-06-02', steps: 3000, source: 'manual' as const },
      ];
      await setManualStepsByDay(manualSteps);

      mockUseManualEntryMode.mockReturnValue({
        isManualMode: true,
        toggleManualMode: jest.fn(),
      });

      render(<ManualEntrySection />);

      await waitFor(() => {
        expect(screen.getByText('2 manual step entries stored')).toBeOnTheScreen();
      });
    });

    it('should display manual entry history correctly', async () => {
      // Set up manual entries
      const manualSteps = [
        { date: '2024-06-01', steps: 5000, source: 'manual' as const },
        { date: '2024-06-02', steps: 3000, source: 'manual' as const },
      ];
      await setManualStepsByDay(manualSteps);

      mockUseManualEntryMode.mockReturnValue({
        isManualMode: true,
        toggleManualMode: jest.fn(),
      });

      render(<ManualEntrySection />);

      await waitFor(() => {
        expect(screen.getByText('5,000 steps')).toBeOnTheScreen();
        expect(screen.getByText('3,000 steps')).toBeOnTheScreen();
      });
    });

    it('should handle clear manual entries functionality', async () => {
      // Set up manual entries
      const manualSteps = [
        { date: '2024-06-01', steps: 5000, source: 'manual' as const },
      ];
      await setManualStepsByDay(manualSteps);

      mockUseManualEntryMode.mockReturnValue({
        isManualMode: true,
        toggleManualMode: jest.fn(),
      });

      render(<ManualEntrySection />);

      // Verify entry exists
      await waitFor(() => {
        expect(screen.getByText('1 manual step entries stored')).toBeOnTheScreen();
      });

      // Clear entries
      const clearButton = screen.getByText('Clear All Manual Entries');
      fireEvent.press(clearButton);

      // Verify entries are cleared
      await waitFor(() => {
        expect(screen.getByText('0 manual step entries stored')).toBeOnTheScreen();
      });

      // Verify storage is cleared
      const storedEntries = await getManualStepsByDay();
      expect(storedEntries).toHaveLength(0);
    });

    it('should handle empty state for manual entries', async () => {
      mockUseManualEntryMode.mockReturnValue({
        isManualMode: true,
        toggleManualMode: jest.fn(),
      });

      render(<ManualEntrySection />);

      await waitFor(() => {
        expect(screen.getByText('0 manual step entries stored')).toBeOnTheScreen();
        expect(screen.getByText('No manual entries found')).toBeOnTheScreen();
      });
    });
  });

  describe('End-to-End Flow Tests', () => {
    it('should complete full manual entry workflow', async () => {
      // 1. Enable manual entry mode
      setManualEntryMode(true);

      // 2. Add manual entries
      await setManualStepEntry({ date: '2024-06-01', steps: 5000, source: 'manual' });
      await setManualStepEntry({ date: '2024-06-02', steps: 3000, source: 'manual' });

      // Set up HealthKit mock data (do NOT call setStepsByDay)
      HealthKitMock.__setStepSamples([
        { startDate: new Date('2024-06-01'), endDate: new Date('2024-06-01'), quantity: 2000 },
        { startDate: new Date('2024-06-02'), endDate: new Date('2024-06-02'), quantity: 4000 },
      ]);

      // 4. Verify storage
      const storedEntries = await getManualStepsByDay();
      expect(storedEntries).toHaveLength(2);

      // 5. Verify experience calculation
      const lastCheckedDateTime = new Date('2024-06-01');
      const { result } = renderHook(() =>
        useStepCountAsExperience(lastCheckedDateTime)
      );

      await waitFor(() => {
        const day1 = result.current.stepsByDay.find(day => {
          const dayDate = typeof day.date === 'string' ? new Date(day.date) : day.date;
          return dayDate.toISOString().split('T')[0] === '2024-06-01';
        });
        const day2 = result.current.stepsByDay.find(day => {
          const dayDate = typeof day.date === 'string' ? new Date(day.date) : day.date;
          return dayDate.toISOString().split('T')[0] === '2024-06-02';
        });
        expect(day1?.steps).toBe(7000);
        expect(day2?.steps).toBe(7000);
        expect(result.current.experience).toBe(14000);
      });

      // 6. Test UI display
      mockUseManualEntryMode.mockReturnValue({
        isManualMode: true,
        toggleManualMode: jest.fn(),
      });

      render(<ManualEntrySection />);

      await waitFor(() => {
        expect(screen.getByText('Manual Entry')).toBeOnTheScreen();
        expect(screen.getByText('2 manual step entries stored')).toBeOnTheScreen();
      });

      // 7. Clear entries
      const clearButton = screen.getByText('Clear All Manual Entries');
      fireEvent.press(clearButton);

      await waitFor(() => {
        expect(screen.getByText('0 manual step entries stored')).toBeOnTheScreen();
      });

      // 8. Verify storage is cleared
      const clearedEntries = await getManualStepsByDay();
      expect(clearedEntries).toHaveLength(0);
    });

    it('should handle mixed HealthKit and manual entries correctly', async () => {
      // Set up mixed data for the same date
      const dateStr = '2024-06-01';
      const manualSteps = [
        { date: dateStr, steps: 5000, source: 'manual' as const },
      ];
      await setManualStepsByDay(manualSteps);

      // Set up HealthKit mock data (do NOT call setStepsByDay)
      HealthKitMock.__setStepSamples([
        { startDate: new Date(dateStr), endDate: new Date(dateStr), quantity: 3000 },
      ]);

      // Test experience calculation with mixed data
      const lastCheckedDateTime = new Date(dateStr);
      const { result } = renderHook(() =>
        useStepCountAsExperience(lastCheckedDateTime)
      );

      await waitFor(() => {
        expect(result.current.experience).toBe(8000); // 5000 (manual) + 3000 (HealthKit)
        expect(result.current.stepsByDay.length).toBeGreaterThan(0);
        const entry = result.current.stepsByDay.find(day => {
          const dayDate = typeof day.date === 'string' ? new Date(day.date) : day.date;
          return dayDate.toISOString().split('T')[0] === '2024-06-01';
        });
        
        expect(entry?.steps).toBe(8000); // 5000 (manual) + 3000 (HealthKit)
      });

      // Add another manual entry for the same date and verify sum
      await setManualStepEntry({ date: dateStr, steps: 2000, source: 'manual' });
      const { result: result2 } = renderHook(() =>
        useStepCountAsExperience(lastCheckedDateTime)
      );
      await waitFor(() => {
        const entry = result2.current.stepsByDay.find(day => {
          const dayDate = typeof day.date === 'string' ? new Date(day.date) : day.date;
          return dayDate.toISOString().split('T')[0] === dateStr;
        });
        expect(entry?.steps).toBe(10000); // 5000 + 3000 + 2000
      });
    });
  });
}); 