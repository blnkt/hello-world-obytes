/**
 * Centralized helper functions for common mock scenarios
 *
 * This file provides standardized utilities for setup, teardown, reset,
 * and other common mock operations across all mock implementations.
 */

import type { AnyMock, MockScenario } from './types';

// ============================================================================
// GLOBAL MOCK REGISTRY
// ============================================================================

/**
 * Global registry to track all active mocks
 */
const mockRegistry = new Map<string, AnyMock>();

/**
 * Register a mock in the global registry
 */
export function registerMock(name: string, mock: AnyMock): void {
  mockRegistry.set(name, mock);
}

/**
 * Get a mock from the global registry
 */
export function getMock<T extends AnyMock>(name: string): T | undefined {
  return mockRegistry.get(name) as T | undefined;
}

/**
 * Unregister a mock from the global registry
 */
export function unregisterMock(name: string): boolean {
  return mockRegistry.delete(name);
}

/**
 * Clear all mocks from the registry
 */
export function clearMockRegistry(): void {
  mockRegistry.clear();
}

// ============================================================================
// MOCK LIFECYCLE HELPERS
// ============================================================================

/**
 * Setup a mock with default configuration
 */
export function setupMock<T extends AnyMock>(
  mock: T,
  scenario: MockScenario = 'success'
): T {
  // Apply the specified scenario
  switch (scenario) {
    case 'success':
      if ('setupSuccessScenario' in mock) {
        (mock as any).setupSuccessScenario();
      }
      break;
    case 'error':
      if ('setupErrorScenario' in mock) {
        (mock as any).setupErrorScenario();
      }
      break;
    case 'empty':
      if ('setupEmptyDataScenario' in mock) {
        (mock as any).setupEmptyDataScenario();
      }
      break;
    case 'populated':
      if ('setupPopulatedDataScenario' in mock) {
        (mock as any).setupPopulatedDataScenario();
      }
      break;
    case 'manual':
      if ('setupManualModeScenario' in mock) {
        (mock as any).setupManualModeScenario();
      }
      break;
    case 'developer':
      if ('setupDeveloperModeScenario' in mock) {
        (mock as any).setupDeveloperModeScenario();
      }
      break;
    case 'no-data':
      if ('setupNoDataScenario' in mock) {
        (mock as any).setupNoDataScenario();
      }
      break;
  }

  return mock;
}

/**
 * Teardown a mock by clearing all calls and resetting state
 */
export function teardownMock<T extends AnyMock>(mock: T): T {
  if (mock.clear) {
    mock.clear();
  }
  return mock;
}

/**
 * Reset a mock to its initial state
 */
export function resetMock<T extends AnyMock>(mock: T): T {
  if (mock.reset) {
    mock.reset();
  }
  return mock;
}

/**
 * Restore a mock to its original implementation
 */
export function restoreMock<T extends AnyMock>(mock: T): T {
  if (mock.restore) {
    mock.restore();
  }
  return mock;
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Setup multiple mocks with the same scenario
 */
export function setupMultipleMocks(
  mocks: Record<string, AnyMock>,
  scenario: MockScenario = 'success'
): Record<string, AnyMock> {
  const result: Record<string, AnyMock> = {};

  for (const [name, mock] of Object.entries(mocks)) {
    result[name] = setupMock(mock, scenario);
    registerMock(name, mock);
  }

  return result;
}

/**
 * Teardown multiple mocks
 */
export function teardownMultipleMocks(
  mocks: Record<string, AnyMock>
): Record<string, AnyMock> {
  const result: Record<string, AnyMock> = {};

  for (const [name, mock] of Object.entries(mocks)) {
    result[name] = teardownMock(mock);
    unregisterMock(name);
  }

  return result;
}

/**
 * Reset multiple mocks
 */
export function resetMultipleMocks(
  mocks: Record<string, AnyMock>
): Record<string, AnyMock> {
  const result: Record<string, AnyMock> = {};

  for (const [name, mock] of Object.entries(mocks)) {
    result[name] = resetMock(mock);
  }

  return result;
}

/**
 * Restore multiple mocks
 */
export function restoreMultipleMocks(
  mocks: Record<string, AnyMock>
): Record<string, AnyMock> {
  const result: Record<string, AnyMock> = {};

  for (const [name, mock] of Object.entries(mocks)) {
    result[name] = restoreMock(mock);
  }

  return result;
}

// ============================================================================
// TEST SCENARIO HELPERS
// ============================================================================

/**
 * Create a test scenario with multiple mocks
 */
export function createTestScenario(config: {
  mocks: Record<string, AnyMock>;
  scenario: MockScenario;
  setup?: (mocks: Record<string, AnyMock>) => void;
  teardown?: (mocks: Record<string, AnyMock>) => void;
}) {
  const { mocks, scenario, setup, teardown } = config;

  return {
    /**
     * Setup the test scenario
     */
    setup: () => {
      const setupMocks = setupMultipleMocks(mocks, scenario);
      if (setup) {
        setup(setupMocks);
      }
      return setupMocks;
    },

    /**
     * Teardown the test scenario
     */
    teardown: () => {
      if (teardown) {
        teardown(mocks);
      }
      return teardownMultipleMocks(mocks);
    },

    /**
     * Reset the test scenario
     */
    reset: () => {
      return resetMultipleMocks(mocks);
    },

    /**
     * Restore the test scenario
     */
    restore: () => {
      return restoreMultipleMocks(mocks);
    },
  };
}

// ============================================================================
// MOCK VALIDATION HELPERS
// ============================================================================

/**
 * Validate that a mock is properly configured
 */
export function validateMock<T extends AnyMock>(mock: T): boolean {
  if (!mock) {
    console.warn('Mock is null or undefined');
    return false;
  }

  if (typeof mock.reset !== 'function') {
    console.warn('Mock missing reset method');
    return false;
  }

  if (typeof mock.clear !== 'function') {
    console.warn('Mock missing clear method');
    return false;
  }

  if (typeof mock.restore !== 'function') {
    console.warn('Mock missing restore method');
    return false;
  }

  return true;
}

/**
 * Validate multiple mocks
 */
export function validateMultipleMocks(
  mocks: Record<string, AnyMock>
): Record<string, boolean> {
  const results: Record<string, boolean> = {};

  for (const [name, mock] of Object.entries(mocks)) {
    results[name] = validateMock(mock);
  }

  return results;
}

// ============================================================================
// MOCK STATE HELPERS
// ============================================================================

/**
 * Get the current state of all registered mocks
 */
export function getMockRegistryState(): Record<string, any> {
  const state: Record<string, any> = {};

  for (const [name, mock] of mockRegistry.entries()) {
    state[name] = {
      registered: true,
      hasReset: typeof mock.reset === 'function',
      hasClear: typeof mock.clear === 'function',
      hasRestore: typeof mock.restore === 'function',
    };
  }

  return state;
}

/**
 * Check if any mocks are currently registered
 */
export function hasActiveMocks(): boolean {
  return mockRegistry.size > 0;
}

/**
 * Get the count of registered mocks
 */
export function getMockCount(): number {
  return mockRegistry.size;
}

// ============================================================================
// UTILITY HELPERS
// ============================================================================

/**
 * Create a mock with automatic registration
 */
export function createAndRegisterMock<T extends AnyMock>(
  name: string,
  factory: () => T,
  scenario: MockScenario = 'success'
): T {
  const mock = factory();
  const configuredMock = setupMock(mock, scenario);
  registerMock(name, configuredMock);
  return configuredMock;
}

/**
 * Create multiple mocks with automatic registration
 */
export function createAndRegisterMultipleMocks<T extends AnyMock>(
  config: Record<string, () => T>,
  scenario: MockScenario = 'success'
): Record<string, T> {
  const mocks: Record<string, T> = {};

  for (const [name, factory] of Object.entries(config)) {
    mocks[name] = createAndRegisterMock(name, factory, scenario);
  }

  return mocks;
}

/**
 * Cleanup all mocks (teardown and unregister)
 */
export function cleanupAllMocks(): void {
  for (const [name, mock] of mockRegistry.entries()) {
    teardownMock(mock);
    unregisterMock(name);
  }
}

/**
 * Reset all mocks
 */
export function resetAllMocks(): void {
  for (const mock of mockRegistry.values()) {
    resetMock(mock);
  }
}

/**
 * Restore all mocks
 */
export function restoreAllMocks(): void {
  for (const mock of mockRegistry.values()) {
    restoreMock(mock);
  }
}

// ============================================================================
// JEST INTEGRATION HELPERS
// ============================================================================

/**
 * Setup Jest mocks for a module
 */
export function setupJestMock(
  moduleName: string,
  mockImplementation: any
): void {
  jest.mock(moduleName, () => mockImplementation);
}

/**
 * Clear all Jest mocks
 */
export function clearAllJestMocks(): void {
  jest.clearAllMocks();
}

/**
 * Reset all Jest mocks
 */
export function resetAllJestMocks(): void {
  jest.resetAllMocks();
}

/**
 * Restore all Jest mocks
 */
export function restoreAllJestMocks(): void {
  jest.restoreAllMocks();
}

// ============================================================================
// DEBUGGING HELPERS
// ============================================================================

/**
 * Log the current state of all mocks
 */
export function logMockState(): void {
  console.log('Mock Registry State:', getMockRegistryState());
  console.log('Active Mocks Count:', getMockCount());
}

/**
 * Create a mock debugger
 */
export function createMockDebugger(mock: AnyMock) {
  return {
    logCalls: () => {
      console.log(
        'Mock function calls:',
        Object.keys(mock).filter((key) =>
          jest.isMockFunction((mock as any)[key])
        )
      );
    },
    logState: () => {
      console.log('Mock state:', {
        hasReset: typeof mock.reset === 'function',
        hasClear: typeof mock.clear === 'function',
        hasRestore: typeof mock.restore === 'function',
      });
    },
    validate: () => validateMock(mock),
  };
}
