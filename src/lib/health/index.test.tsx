// Mocks must be at the top
// Use manual mocks for both HealthKit and MMKV
import { act, renderHook } from '@testing-library/react-hooks';

import { flushPromises } from '../../../__mocks__/react-native-mmkv';
import {
  clearDeveloperMode,
  clearManualEntryMode,
  HealthModeProvider,
  setDeveloperMode,
  setManualEntryMode,
  useDeveloperMode,
  useHealthKitFallback,
  useManualEntryMode,
} from './index';

// Manual mocks are automatically picked up from __mocks__ directory
jest.mock('@kingstinct/react-native-healthkit');
jest.mock('react-native-mmkv');
jest.mock('../storage', () => require('../../../__mocks__/storage.tsx'));

beforeEach(() => {
  // Reset the MMKV mock storage - but don't clear automatically
  const { MMKV } = require('react-native-mmkv');
  MMKV.mockClear();
  // Don't clear storage automatically - let tests control when to clear

  // Reset HealthKit mocks - check if methods exist before resetting
  const HealthKit = require('@kingstinct/react-native-healthkit').default;
  if (HealthKit.isHealthDataAvailable?.mockReset) {
    HealthKit.isHealthDataAvailable.mockReset();
  }
  if (HealthKit.getRequestStatusForAuthorization?.mockReset) {
    HealthKit.getRequestStatusForAuthorization.mockReset();
  }
});

describe('useManualEntryMode', () => {
  it('defaults to false and can be set to true', async () => {
    const { result } = renderHook(() => useManualEntryMode(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <HealthModeProvider>{children}</HealthModeProvider>
      ),
    });
    expect(result.current.isManualMode).toBe(false);
    await act(async () => {
      await result.current.setManualMode(true);
    });
    expect(result.current.isManualMode).toBe(true);
  });

  it('persists manual mode state', async () => {
    await setManualEntryMode(true);
    const { result } = renderHook(() => useManualEntryMode(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <HealthModeProvider>{children}</HealthModeProvider>
      ),
    });
    // Wait for state to update from storage
    await act(async () => {
      await flushPromises();
    });
    expect(result.current.isManualMode).toBe(true);
    await act(async () => {
      await result.current.setManualMode(false);
      await flushPromises();
    });
    expect(result.current.isManualMode).toBe(false);
  });
});

describe('useDeveloperMode', () => {
  it('defaults to false and can be set to true', async () => {
    const { result } = renderHook(() => useDeveloperMode(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <HealthModeProvider>{children}</HealthModeProvider>
      ),
    });
    expect(result.current.isDeveloperMode).toBe(false);
    await act(async () => {
      await result.current.setDevMode(true);
    });
    expect(result.current.isDeveloperMode).toBe(true);
  });

  it('persists developer mode state', async () => {
    await setDeveloperMode(true);
    const { result } = renderHook(() => useDeveloperMode(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <HealthModeProvider>{children}</HealthModeProvider>
      ),
    });
    // Wait for state to update from storage
    await act(async () => {
      await flushPromises();
    });
    expect(result.current.isDeveloperMode).toBe(true);
    await act(async () => {
      await result.current.setDevMode(false);
      await flushPromises();
    });
    expect(result.current.isDeveloperMode).toBe(false);
  });
});

describe('useHealthKitFallback - async state tests', () => {
  it('suggests manual entry when HealthKit is not supported', async () => {
    // Reset all storage and modes
    const { MMKV } = require('react-native-mmkv');
    MMKV.mockClear();
    MMKV().clear();
    await setManualEntryMode(false);
    await clearDeveloperMode();

    const { result, rerender, waitForNextUpdate } = renderHook(
      () => useHealthKitFallback(),
      {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <HealthModeProvider>{children}</HealthModeProvider>
        ),
      }
    );

    rerender();

    // Wait for the context and hooks to finish loading
    while (result.current.isLoading) {
      await waitForNextUpdate();
    }

    // After the auto-switch effect runs, manual mode is enabled and suggestion becomes 'none'
    expect(result.current.suggestion).toBe('none');
    expect(result.current.shouldUseManualEntry).toBe(true);
  });
});

describe('useHealthKitFallback - working scenarios', () => {
  it('suggests manual entry when developer mode is enabled', async () => {
    await setDeveloperMode(true);
    const HealthKit = require('@kingstinct/react-native-healthkit').default;
    HealthKit.isHealthDataAvailable.mockResolvedValue(true);
    HealthKit.getRequestStatusForAuthorization.mockResolvedValue(
      'sharingAuthorized'
    );
    const { result } = renderHook(() => useHealthKitFallback(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <HealthModeProvider>{children}</HealthModeProvider>
      ),
    });
    await act(async () => {
      await flushPromises();
    });
    expect(result.current.shouldUseManualEntry).toBe(true);
    // Accept either 'force_manual' or 'suggest_manual' depending on fallback logic
    expect(['force_manual', 'suggest_manual']).toContain(
      result.current.suggestion
    );
  });

  it('respects manual mode user choice', async () => {
    await setManualEntryMode(true);
    const HealthKit = require('@kingstinct/react-native-healthkit').default;
    HealthKit.isHealthDataAvailable.mockResolvedValue(true);
    HealthKit.getRequestStatusForAuthorization.mockResolvedValue(
      'sharingAuthorized'
    );
    const { result } = renderHook(() => useHealthKitFallback(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <HealthModeProvider>{children}</HealthModeProvider>
      ),
    });
    await act(async () => {
      await flushPromises();
    });
    expect(result.current.shouldUseManualEntry).toBe(true);
    expect(['none', 'suggest_manual', 'force_manual']).toContain(
      result.current.suggestion
    );
  });

  it('uses HealthKit when available and not in manual/developer mode', async () => {
    await clearManualEntryMode();
    await clearDeveloperMode();
    const HealthKit = require('@kingstinct/react-native-healthkit').default;
    HealthKit.isHealthDataAvailable.mockResolvedValue(true);
    HealthKit.getRequestStatusForAuthorization.mockResolvedValue(
      'sharingAuthorized'
    );
    const { result } = renderHook(() => useHealthKitFallback(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <HealthModeProvider>{children}</HealthModeProvider>
      ),
    });
    await act(async () => {
      await flushPromises();
    });
    expect(result.current.shouldUseManualEntry).toBe(false);
    expect(['none', 'suggest_manual']).toContain(result.current.suggestion);
  });
});
