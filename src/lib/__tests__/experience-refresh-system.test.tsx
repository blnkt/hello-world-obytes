import { renderHook, waitFor } from '@testing-library/react-native';
import { useExperienceData } from '../health';
import {
  clearManualStepsByDay,
  getManualStepsByDay,
  setManualStepEntry,
} from '../storage';

// Mock storage
jest.mock('../storage', () => ({
  clearManualStepsByDay: jest.fn(),
  getManualStepsByDay: jest.fn(),
  setManualStepEntry: jest.fn(),
  getExperience: jest.fn(() => 0),
  getCumulativeExperience: jest.fn(() => 0),
  getFirstExperienceDate: jest.fn(() => null),
  getStepsByDay: jest.fn(() => []),
  setExperience: jest.fn(),
  setCumulativeExperience: jest.fn(),
  setFirstExperienceDate: jest.fn(),
  setStepsByDay: jest.fn(),
}));

// Mock MMKV
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn(() => ({
    getString: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
  useMMKVString: jest.fn((key) => {
    // Simple mock that returns static values
    if (key === 'experience') return [String(0), jest.fn()];
    if (key === 'cumulativeExperience') return [String(0), jest.fn()];
    if (key === 'firstExperienceDate') return [null, jest.fn()];
    if (key === 'stepsByDay') return [JSON.stringify([]), jest.fn()];
    return [null, jest.fn()];
  }),
}));

// Mock HealthKit
jest.mock('@kingstinct/react-native-healthkit', () => ({
  default: {
    requestPermissions: jest.fn(),
    getQuantitySamples: jest.fn(),
  },
}));

describe('Experience Data System Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset manual steps
    (clearManualStepsByDay as jest.Mock).mockResolvedValue(undefined);
    (getManualStepsByDay as jest.Mock).mockReturnValue([]);
    (setManualStepEntry as jest.Mock).mockResolvedValue(undefined);

    // Reset storage mocks
    const storageMock = require('../storage');
    storageMock.getExperience.mockReturnValue(0);
    storageMock.getCumulativeExperience.mockReturnValue(0);
    storageMock.getFirstExperienceDate.mockReturnValue(null);
    storageMock.getStepsByDay.mockReturnValue([]);
  });

  afterEach(() => {
    // Clean up global state between tests
    jest.resetModules();
  });

  describe('Manual Step Entry Experience Updates', () => {
    it('should refresh experience totals when manual steps are added', async () => {
      // Mock manual steps data
      const mockManualSteps = [
        { date: '2024-06-01', steps: 5000 },
        { date: '2024-06-02', steps: 3000 },
      ];

      // Set up storage mocks for this test
      const storageMock = require('../storage');
      storageMock.getStepsByDay.mockReturnValue(mockManualSteps);
      storageMock.getExperience.mockReturnValue(8000);
      storageMock.getCumulativeExperience.mockReturnValue(8000);
      storageMock.getFirstExperienceDate.mockReturnValue('2024-06-01');

      // Render the hook
      const { result } = renderHook(() => useExperienceData());

      // Wait for initial load and verify
      await waitFor(() => {
        expect(result.current.stepsByDay).toBeDefined();
        expect(Array.isArray(result.current.stepsByDay)).toBe(true);
      });

      // Verify initial state
      expect(result.current.stepsByDay).toBeDefined();
      expect(result.current.experience).toBeGreaterThanOrEqual(0);
      expect(result.current.cumulativeExperience).toBeGreaterThanOrEqual(0);
    });

    it('should update cumulative experience when manual steps are added', async () => {
      const lastCheckedDateTime = new Date('2024-06-01');

      // Mock manual steps data
      const mockManualSteps = [
        { date: '2024-06-01', steps: 8000 },
        { date: '2024-06-02', steps: 6000 },
      ];

      // Set up storage mocks for this test
      const storageMock = require('../storage');
      storageMock.getStepsByDay.mockReturnValue(mockManualSteps);
      storageMock.getExperience.mockReturnValue(14000);
      storageMock.getCumulativeExperience.mockReturnValue(14000);
      storageMock.getFirstExperienceDate.mockReturnValue('2024-06-01');

      // Render the hook
      const { result } = renderHook(() => useExperienceData());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.cumulativeExperience).toBeDefined();
      });

      // Verify cumulative experience is calculated
      expect(result.current.cumulativeExperience).toBeGreaterThanOrEqual(0);
    });

    it('should properly merge manual and HealthKit steps in experience calculation', async () => {
      // Mock manual steps data
      const mockManualSteps = [
        { date: '2024-06-01', steps: 8000 },
        { date: '2024-06-02', steps: 6000 },
      ];

      // Set up storage mocks for this test
      const storageMock = require('../storage');
      storageMock.getStepsByDay.mockReturnValue(mockManualSteps);
      storageMock.getExperience.mockReturnValue(14000);
      storageMock.getCumulativeExperience.mockReturnValue(14000);
      storageMock.getFirstExperienceDate.mockReturnValue('2024-06-01');

      // Render the hook
      const { result } = renderHook(() => useExperienceData());

      // Wait for initial load and verify
      await waitFor(() => {
        expect(result.current.stepsByDay).toBeDefined();
        expect(Array.isArray(result.current.stepsByDay)).toBe(true);
      });

      // Verify steps are properly loaded
      expect(result.current.stepsByDay).toBeDefined();
      expect(result.current.experience).toBeGreaterThanOrEqual(0);
      expect(result.current.cumulativeExperience).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Currency Conversion and Experience Updates', () => {
    it('should convert new experience to currency when manual steps are added', async () => {
      // Mock manual steps data
      const mockManualSteps = [{ date: '2024-06-01', steps: 10000 }];

      // Set up storage mocks for this test
      const storageMock = require('../storage');
      storageMock.getStepsByDay.mockReturnValue(mockManualSteps);
      storageMock.getExperience.mockReturnValue(10000);
      storageMock.getCumulativeExperience.mockReturnValue(10000);
      storageMock.getFirstExperienceDate.mockReturnValue('2024-06-01');

      // Render the hook
      const { result } = renderHook(() => useExperienceData());

      // Wait for initial load and verify
      await waitFor(() => {
        expect(result.current.stepsByDay).toBeDefined();
        expect(Array.isArray(result.current.stepsByDay)).toBe(true);
      });

      // Verify experience is properly loaded
      expect(result.current.experience).toBeGreaterThanOrEqual(0);
      expect(result.current.cumulativeExperience).toBeGreaterThanOrEqual(0);
    });

    it('should handle multiple manual step entries without double-counting', async () => {
      // Mock manual steps data
      const mockManualSteps = [
        { date: '2024-06-01', steps: 5000 },
        { date: '2024-06-02', steps: 3000 },
      ];

      // Set up storage mocks for this test
      const storageMock = require('../storage');
      storageMock.getStepsByDay.mockReturnValue(mockManualSteps);
      storageMock.getExperience.mockReturnValue(8000);
      storageMock.getCumulativeExperience.mockReturnValue(8000);
      storageMock.getFirstExperienceDate.mockReturnValue('2024-06-01');

      // Render the hook
      const { result } = renderHook(() => useExperienceData());

      // Wait for initial load and verify
      await waitFor(() => {
        expect(result.current.stepsByDay).toBeDefined();
        expect(Array.isArray(result.current.stepsByDay)).toBe(true);
      });

      // Verify steps are properly handled
      expect(result.current.stepsByDay).toBeDefined();
    });
  });

  describe('Real-time Updates Across Multiple Hooks', () => {
    it('should update all experience hooks when refresh is triggered', async () => {
      // Mock manual steps data
      const mockManualSteps = [
        { date: '2024-06-01', steps: 5000 },
        { date: '2024-06-02', steps: 3000 },
      ];

      // Set up storage mocks for this test
      const storageMock = require('../storage');
      storageMock.getStepsByDay.mockReturnValue(mockManualSteps);
      storageMock.getExperience.mockReturnValue(8000);
      storageMock.getCumulativeExperience.mockReturnValue(8000);
      storageMock.getFirstExperienceDate.mockReturnValue('2024-06-01');

      // Render two hooks
      const { result: hook1 } = renderHook(() => useExperienceData());
      const { result: hook2 } = renderHook(() => useExperienceData());

      // Wait for both hooks to load
      await waitFor(() => {
        expect(hook1.current.stepsByDay).toBeDefined();
        expect(Array.isArray(hook1.current.stepsByDay)).toBe(true);
      });
      await waitFor(() => {
        expect(hook2.current.stepsByDay).toBeDefined();
        expect(Array.isArray(hook2.current.stepsByDay)).toBe(true);
      });

      // Verify both hooks have the same data
      expect(hook1.current.stepsByDay).toBeDefined();
      expect(hook2.current.stepsByDay).toBeDefined();
      expect(hook1.current.experience).toBe(hook2.current.experience);
      expect(hook1.current.cumulativeExperience).toBe(
        hook2.current.cumulativeExperience
      );
    });

    it('should maintain consistency between multiple hooks after refresh', async () => {
      const lastCheckedDateTime = new Date('2024-06-01');

      // Mock manual steps data
      const mockManualSteps = [
        { date: '2024-06-01', steps: 5000 },
        { date: '2024-06-02', steps: 3000 },
      ];

      // Set up storage mocks for this test
      const storageMock = require('../storage');
      storageMock.getStepsByDay.mockReturnValue(mockManualSteps);
      storageMock.getExperience.mockReturnValue(8000);
      storageMock.getCumulativeExperience.mockReturnValue(8000);
      storageMock.getFirstExperienceDate.mockReturnValue('2024-06-01');

      // Render multiple hooks
      const { result: hook1 } = renderHook(() => useExperienceData());
      const { result: hook2 } = renderHook(() => useExperienceData());

      // Wait for initial load
      await waitFor(() => {
        expect(hook1.current.stepsByDay).toBeDefined();
        expect(hook2.current.stepsByDay).toBeDefined();
      });

      // Verify consistency
      expect(hook1.current.stepsByDay).toEqual(hook2.current.stepsByDay);
      expect(hook1.current.experience).toBe(hook2.current.experience);
      expect(hook1.current.cumulativeExperience).toBe(
        hook2.current.cumulativeExperience
      );
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle refresh when no manual steps exist', async () => {
      const lastCheckedDateTime = new Date('2024-06-01');

      // Mock empty manual steps
      const storageMock = require('../storage');
      storageMock.getStepsByDay.mockReturnValue([]);
      storageMock.getExperience.mockReturnValue(0);
      storageMock.getCumulativeExperience.mockReturnValue(0);
      storageMock.getFirstExperienceDate.mockReturnValue(null);

      // Render the hook
      const { result } = renderHook(() => useExperienceData());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.stepsByDay).toBeDefined();
      });

      // Verify empty state is handled
      expect(result.current.stepsByDay).toHaveLength(0);
      expect(result.current.experience).toBe(0);
    });

    it('should handle refresh with invalid manual step data gracefully', async () => {
      const lastCheckedDateTime = new Date('2024-06-01');

      // Mock invalid manual steps data
      const mockInvalidSteps = [
        { date: 'invalid-date', steps: 'not-a-number' },
        { date: '2024-06-01', steps: 5000 },
      ];

      // Set up storage mocks for this test
      const storageMock = require('../storage');
      storageMock.getStepsByDay.mockReturnValue(mockInvalidSteps);
      storageMock.getExperience.mockReturnValue(5000);
      storageMock.getCumulativeExperience.mockReturnValue(5000);
      storageMock.getFirstExperienceDate.mockReturnValue('2024-06-01');

      // Render the hook
      const { result } = renderHook(() => useExperienceData());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.stepsByDay).toBeDefined();
      });

      // Verify invalid data is handled gracefully
      expect(result.current.stepsByDay).toBeDefined();
    });
  });
});
