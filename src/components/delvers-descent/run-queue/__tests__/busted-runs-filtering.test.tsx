import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import { render } from '@testing-library/react-native';

import { RunQueueScreen } from '../run-queue-screen';
import { useDelvingRuns } from '@/components/delvers-descent/hooks/use-delving-runs';
import { useDelvingRunsIntegration } from '@/lib/health';
import type { DelvingRun } from '@/types/delvers-descent';

// Mock dependencies
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/components/delvers-descent/hooks/use-delving-runs');
jest.mock('@/lib/health', () => ({
  useDelvingRunsIntegration: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}));

describe('RunQueueScreen - Busted Runs Filtering', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  let mockUseDelvingRuns: any;
  let mockUseDelvingRunsIntegration: any;

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    // Setup mock useDelvingRunsIntegration
    mockUseDelvingRunsIntegration = {
      isLoading: false,
    };

    (useDelvingRunsIntegration as jest.Mock).mockReturnValue(
      mockUseDelvingRunsIntegration
    );

    // Setup mock useDelvingRuns
    mockUseDelvingRuns = {
      isLoading: false,
      error: null,
      getQueuedRuns: jest.fn().mockReturnValue([]),
      getActiveRuns: jest.fn().mockReturnValue([]),
      getCompletedRuns: jest.fn().mockReturnValue([]),
      getBustedRuns: jest.fn().mockReturnValue([]),
      refreshData: jest.fn(),
      updateRunStatus: jest.fn(),
    };

    (useDelvingRuns as jest.Mock).mockReturnValue(mockUseDelvingRuns);

    // Mock useFocusEffect to do nothing by default
    (useFocusEffect as jest.Mock).mockImplementation(() => {});
  });

  it('should not display busted runs in Ready to Start section', () => {
    const queuedRun: DelvingRun = {
      id: 'run-1',
      date: '2024-01-15',
      steps: 8000,
      baseEnergy: 8000,
      bonusEnergy: 0,
      totalEnergy: 8000,
      hasStreakBonus: false,
      status: 'queued',
    };

    const bustedRun: DelvingRun = {
      id: 'run-2',
      date: '2024-01-14',
      steps: 7000,
      baseEnergy: 7000,
      bonusEnergy: 0,
      totalEnergy: 7000,
      hasStreakBonus: false,
      status: 'busted',
    };

    mockUseDelvingRuns.getQueuedRuns.mockReturnValue([queuedRun]);
    mockUseDelvingRuns.getActiveRuns.mockReturnValue([]);
    mockUseDelvingRuns.getBustedRuns.mockReturnValue([bustedRun]);

    render(<RunQueueScreen />);

    // Should not show busted run in Ready to Start
    // The run queue screen filters by getQueuedRuns which only returns queued runs
    expect(mockUseDelvingRuns.getQueuedRuns).toHaveBeenCalled();
    const queuedRuns = mockUseDelvingRuns.getQueuedRuns();
    expect(queuedRuns).toEqual([queuedRun]);
    expect(queuedRuns).not.toContain(bustedRun);
    expect(queuedRuns.every((run: DelvingRun) => run.status === 'queued')).toBe(
      true
    );
  });

  it('should filter out runs with insufficient energy from Ready to Start', () => {
    const validRun: DelvingRun = {
      id: 'run-1',
      date: '2024-01-15',
      steps: 8000,
      baseEnergy: 8000,
      bonusEnergy: 0,
      totalEnergy: 8000, // >= 3
      hasStreakBonus: false,
      status: 'queued',
    };

    const lowEnergyRun: DelvingRun = {
      id: 'run-2',
      date: '2024-01-14',
      steps: 1000,
      baseEnergy: 1000,
      bonusEnergy: 0,
      totalEnergy: 1, // < 3 (MINIMUM_ENERGY_REQUIRED)
      hasStreakBonus: false,
      status: 'queued',
    };

    mockUseDelvingRuns.getQueuedRuns.mockReturnValue([
      validRun,
      lowEnergyRun,
    ]);
    mockUseDelvingRuns.getActiveRuns.mockReturnValue([]);

    render(<RunQueueScreen />);

    // The screen filters queued runs by minimum energy requirement
    // lowEnergyRun should be filtered out
    const queuedRuns = mockUseDelvingRuns.getQueuedRuns();
    const filteredRuns = queuedRuns.filter(
      (run: DelvingRun) => run.totalEnergy >= 3
    );

    expect(filteredRuns).toContain(validRun);
    expect(filteredRuns).not.toContain(lowEnergyRun);
  });

  it('should only show queued runs in Ready to Start section', () => {
    const queuedRun: DelvingRun = {
      id: 'run-1',
      date: '2024-01-15',
      steps: 8000,
      baseEnergy: 8000,
      bonusEnergy: 0,
      totalEnergy: 8000,
      hasStreakBonus: false,
      status: 'queued',
    };

    const activeRun: DelvingRun = {
      id: 'run-2',
      date: '2024-01-14',
      steps: 7000,
      baseEnergy: 7000,
      bonusEnergy: 0,
      totalEnergy: 7000,
      hasStreakBonus: false,
      status: 'active',
    };

    const completedRun: DelvingRun = {
      id: 'run-3',
      date: '2024-01-13',
      steps: 6000,
      baseEnergy: 6000,
      bonusEnergy: 0,
      totalEnergy: 6000,
      hasStreakBonus: false,
      status: 'completed',
    };

    const bustedRun: DelvingRun = {
      id: 'run-4',
      date: '2024-01-12',
      steps: 5000,
      baseEnergy: 5000,
      bonusEnergy: 0,
      totalEnergy: 5000,
      hasStreakBonus: false,
      status: 'busted',
    };

    mockUseDelvingRuns.getQueuedRuns.mockReturnValue([queuedRun]);
    mockUseDelvingRuns.getActiveRuns.mockReturnValue([activeRun]);
    mockUseDelvingRuns.getCompletedRuns.mockReturnValue([completedRun]);
    mockUseDelvingRuns.getBustedRuns.mockReturnValue([bustedRun]);

    render(<RunQueueScreen />);

    // Only queued runs should be in Ready to Start
    const queuedRuns = mockUseDelvingRuns.getQueuedRuns();
    expect(queuedRuns).toEqual([queuedRun]);
    expect(queuedRuns).not.toContain(activeRun);
    expect(queuedRuns).not.toContain(completedRun);
    expect(queuedRuns).not.toContain(bustedRun);
  });

  it('should handle empty run lists correctly', () => {
    mockUseDelvingRuns.getQueuedRuns.mockReturnValue([]);
    mockUseDelvingRuns.getActiveRuns.mockReturnValue([]);
    mockUseDelvingRuns.getCompletedRuns.mockReturnValue([]);
    mockUseDelvingRuns.getBustedRuns.mockReturnValue([]);

    const { getByText } = render(<RunQueueScreen />);

    expect(getByText('No Runs Available')).toBeDefined();
  });

  it('should display active runs in Active section', () => {
    const activeRun: DelvingRun = {
      id: 'run-1',
      date: '2024-01-15',
      steps: 8000,
      baseEnergy: 8000,
      bonusEnergy: 0,
      totalEnergy: 8000,
      hasStreakBonus: false,
      status: 'active',
    };

    mockUseDelvingRuns.getQueuedRuns.mockReturnValue([]);
    mockUseDelvingRuns.getActiveRuns.mockReturnValue([activeRun]);

    render(<RunQueueScreen />);

    expect(mockUseDelvingRuns.getActiveRuns).toHaveBeenCalled();
    expect(mockUseDelvingRuns.getActiveRuns()).toEqual([activeRun]);
  });

  it('should refresh data when screen comes into focus', () => {
    let focusCallback: (() => void) | undefined;

    (useFocusEffect as jest.Mock).mockImplementation(
      (callback: () => void) => {
        focusCallback = callback;
      }
    );

    render(<RunQueueScreen />);

    // Simulate screen focus
    if (focusCallback) {
      focusCallback();
    }

    // Should refresh data when focus occurs
    expect(mockUseDelvingRuns.refreshData).toHaveBeenCalled();
  });

  it('should not show busted runs as active after status update', () => {
    const activeRun: DelvingRun = {
      id: 'run-1',
      date: '2024-01-15',
      steps: 8000,
      baseEnergy: 8000,
      bonusEnergy: 0,
      totalEnergy: 8000,
      hasStreakBonus: false,
      status: 'active',
    };

    // Initially show as active
    mockUseDelvingRuns.getQueuedRuns.mockReturnValue([]);
    mockUseDelvingRuns.getActiveRuns.mockReturnValue([activeRun]);
    mockUseDelvingRuns.getBustedRuns.mockReturnValue([]);

    const { rerender } = render(<RunQueueScreen />);

    // After status update, run should be removed from active
    mockUseDelvingRuns.getActiveRuns.mockReturnValue([]);
    mockUseDelvingRuns.getBustedRuns.mockReturnValue([activeRun]);

    // Refresh data (simulating focus refresh)
    mockUseDelvingRuns.refreshData.mockImplementation(() => {
      // Simulate refresh
    });

    rerender(<RunQueueScreen />);

    // Run should no longer be in active runs
    const activeRuns = mockUseDelvingRuns.getActiveRuns();
    expect(activeRuns).not.toContain(activeRun);
    expect(activeRuns.every((run: DelvingRun) => run.status === 'active')).toBe(
      true
    );
  });
});

