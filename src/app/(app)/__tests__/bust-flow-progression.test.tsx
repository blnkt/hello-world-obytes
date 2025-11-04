import { useRouter } from 'expo-router';
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import BustScreen from '../bust-screen';
import { getProgressionManager } from '@/lib/delvers-descent/progression-manager';
import { getRunQueueManager } from '@/lib/delvers-descent/run-queue';
import { getRunStateManager } from '@/lib/delvers-descent/run-state-manager';
import { AchievementManager } from '@/lib/delvers-descent/achievement-manager';
import { saveAchievements } from '@/lib/delvers-descent/achievement-persistence';
import { ALL_ACHIEVEMENTS } from '@/lib/delvers-descent/achievement-types';
import type { DelvingRun } from '@/types/delvers-descent';

// Mock dependencies
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('@/lib/delvers-descent/run-queue');
jest.mock('@/lib/delvers-descent/run-state-manager');
jest.mock('@/lib/delvers-descent/progression-manager');
jest.mock('@/lib/delvers-descent/achievement-manager');
jest.mock('@/lib/delvers-descent/achievement-persistence');
jest.mock('@/lib/delvers-descent/achievement-types', () => ({
  ALL_ACHIEVEMENTS: [],
}));

describe('Bust Flow - Progression and Queue Updates', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockConsequence = {
    itemsLost: 5,
    energyLost: 100,
    xpPreserved: true,
    xpAmount: 150,
    message: 'You ran out of energy and could not afford to return safely.',
  };

  let mockRunQueueManager: any;
  let mockRunStateManager: any;
  let mockProgressionManager: any;
  let mockAchievementManager: any;

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    // Setup mock run queue manager
    const activeRun: DelvingRun = {
      id: 'run-123',
      date: '2024-01-15',
      steps: 8000,
      baseEnergy: 8000,
      bonusEnergy: 0,
      totalEnergy: 8000,
      hasStreakBonus: false,
      status: 'active',
    };

    mockRunQueueManager = {
      getRunsByStatus: jest.fn().mockReturnValue([activeRun]),
      updateRunStatus: jest.fn().mockResolvedValue(undefined),
      getQueuedRuns: jest.fn().mockReturnValue([]),
    };

    (getRunQueueManager as jest.Mock).mockReturnValue(mockRunQueueManager);

    // Setup mock run state manager
    mockRunStateManager = {
      bustRun: jest.fn().mockResolvedValue({
        energyLost: 100,
        deepestDepth: 5,
        shortcutsDiscovered: [],
      }),
      getCurrentState: jest.fn().mockReturnValue({
        currentDepth: 5,
        energyRemaining: 0,
      }),
    };

    (getRunStateManager as jest.Mock).mockReturnValue(mockRunStateManager);

    // Setup mock progression manager
    mockProgressionManager = {
      processRunBust: jest.fn().mockResolvedValue(undefined),
      incrementBustedRuns: jest.fn().mockResolvedValue(undefined),
      getProgressionData: jest.fn().mockReturnValue({
        allTimeDeepestDepth: 5,
        totalRunsCompleted: 0,
        totalRunsBusted: 0,
        totalRunsAttempted: 0,
      }),
    };

    (getProgressionManager as jest.Mock).mockReturnValue(
      mockProgressionManager
    );

    // Setup mock achievement manager
    mockAchievementManager = {
      loadSavedState: jest.fn().mockResolvedValue(undefined),
      processEvent: jest.fn(),
    };

    (AchievementManager as jest.Mock).mockImplementation(() => mockAchievementManager);
    (saveAchievements as jest.Mock).mockResolvedValue(undefined);

    // Mock useLocalSearchParams
    const { useLocalSearchParams } = require('expo-router');
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      consequence: JSON.stringify(mockConsequence),
    });
  });

  it('should update run status to busted when acknowledged', async () => {
    const { getByTestId } = render(<BustScreen />);

    const acknowledgeButton = getByTestId('acknowledge-bust');
    fireEvent.press(acknowledgeButton);

    await waitFor(() => {
      expect(mockRunQueueManager.updateRunStatus).toHaveBeenCalledWith(
        'run-123',
        'busted'
      );
    });
  });

  it('should update progression data with deepest depth when busting', async () => {
    const { getByTestId } = render(<BustScreen />);

    const acknowledgeButton = getByTestId('acknowledge-bust');
    fireEvent.press(acknowledgeButton);

    await waitFor(() => {
      expect(mockProgressionManager.processRunBust).toHaveBeenCalledWith(5);
    });
  });

  it('should not double-process bust when run state exists', async () => {
    const { getByTestId } = render(<BustScreen />);

    const acknowledgeButton = getByTestId('acknowledge-bust');
    fireEvent.press(acknowledgeButton);

    await waitFor(() => {
      // Should only process once with the depth from bustRun
      expect(mockProgressionManager.processRunBust).toHaveBeenCalledTimes(1);
      expect(mockProgressionManager.processRunBust).toHaveBeenCalledWith(5);
    });

    // Should not increment separately
    expect(mockProgressionManager.incrementBustedRuns).not.toHaveBeenCalled();
  });

  it('should fallback to incrementBustedRuns if no depth available', async () => {
    mockRunStateManager.bustRun.mockRejectedValue(new Error('No run state'));
    mockRunStateManager.getCurrentState.mockReturnValue(null);

    const { getByTestId } = render(<BustScreen />);

    const acknowledgeButton = getByTestId('acknowledge-bust');
    fireEvent.press(acknowledgeButton);

    await waitFor(() => {
      expect(mockProgressionManager.incrementBustedRuns).toHaveBeenCalled();
    });
  });

  it('should get active run before processing bust', async () => {
    const { getByTestId } = render(<BustScreen />);

    const acknowledgeButton = getByTestId('acknowledge-bust');
    fireEvent.press(acknowledgeButton);

    await waitFor(() => {
      // Should get active runs first
      expect(mockRunQueueManager.getRunsByStatus).toHaveBeenCalledWith('active');
      // Then update the run status
      expect(mockRunQueueManager.updateRunStatus).toHaveBeenCalled();
    });
  });

  it('should navigate to run queue after processing bust', async () => {
    const { getByTestId } = render(<BustScreen />);

    const acknowledgeButton = getByTestId('acknowledge-bust');
    fireEvent.press(acknowledgeButton);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/(app)/run-queue');
    });
  });

  it('should handle case when no active run exists', async () => {
    mockRunQueueManager.getRunsByStatus.mockReturnValue([]);

    const { getByTestId } = render(<BustScreen />);

    const acknowledgeButton = getByTestId('acknowledge-bust');
    fireEvent.press(acknowledgeButton);

    await waitFor(() => {
      // Should still navigate even if no active run
      expect(mockRouter.push).toHaveBeenCalledWith('/(app)/run-queue');
    });

    // Should not try to update run status if no active run
    expect(mockRunQueueManager.updateRunStatus).not.toHaveBeenCalled();
  });

  it('should process achievements when busting', async () => {
    const { getByTestId } = render(<BustScreen />);

    const acknowledgeButton = getByTestId('acknowledge-bust');
    fireEvent.press(acknowledgeButton);

    await waitFor(() => {
      expect(mockAchievementManager.loadSavedState).toHaveBeenCalled();
      expect(mockAchievementManager.processEvent).toHaveBeenCalledWith({
        type: 'depth_reached',
        data: { depth: 5, cashOut: false },
        timestamp: expect.any(Date),
      });
      expect(saveAchievements).toHaveBeenCalled();
    });
  });
});

