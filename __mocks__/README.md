# Mock Structure and Naming Conventions

This document defines the standard structure and naming conventions for all mocks in this project.

## Overview

All mocks follow a centralized pattern that provides:

- Consistent interfaces and naming
- Type safety with TypeScript
- Reusable factory functions
- Common lifecycle methods (setup, teardown, reset)
- Scenario-based testing support

## File Structure

```
__mocks__/
├── README.md                    # This documentation
├── types.ts                     # Centralized TypeScript interfaces
├── helpers.ts                   # Common helper functions
├── dungeon-game-persistence.ts  # Dungeon game persistence mock
├── health-hooks.ts              # Health-related hooks mock
├── storage-functions.ts         # Storage functions mock
└── [module-name].ts             # Other module-specific mocks
```

## Naming Conventions

### File Names

- Use kebab-case for file names: `module-name.ts`
- Match the original module name where possible
- Add descriptive suffixes for clarity (e.g., `-persistence`, `-hooks`, `-functions`)

### Function Names

- **Factory Functions**: `create[ModuleName]Mock()`
  - Example: `createHealthHooksMock()`, `createDungeonGamePersistenceMock()`
- **Factory Data Functions**: `createMock[DataType]()` (within mock object)
  - Example: `createMockSaveData()`, `createMockExperienceData()`
- **Scenario Functions**: `setup[Scenario]Scenario()`
  - Example: `setupSuccessScenario()`, `setupErrorScenario()`
- **Lifecycle Functions**: `reset()`, `clear()`, `restore()`
- **Helper Functions**: Use descriptive names with mock prefix where appropriate

### Interface Names

- **Mock Interfaces**: `[ModuleName]Mock`
  - Example: `HealthHooksMock`, `DungeonGamePersistenceMock`
- **Options Interfaces**: `[ModuleName]MockOptions`
  - Example: `HealthHooksMockOptions`
- **Data Interfaces**: Match original source types
  - Example: `DungeonGameSaveData`, `ExperienceDataReturn`

### Variable Names

- **Mock Instances**: `[moduleName]Mock` or `mock[ModuleName]`
  - Example: `healthMock`, `mockDungeonGamePersistence`
- **Test Data**: `mock[DataType]` or `default[DataType]`
  - Example: `mockSaveData`, `defaultExperienceData`

## Standard Mock Structure

Every mock module should follow this structure:

```typescript
// Import types from centralized types file
import type { ModuleMock, ModuleMockOptions } from './types';

// Global mock instance tracking
let currentMock: ModuleMock | null = null;

// Helper functions for creating default mock data
function createDefaultMock[DataType](overrides: Partial<DataType> = {}): DataType {
  return {
    // Default values
    ...overrides,
  };
}

// Helper functions for creating mock functions
function createDefaultMockFunctions() {
  // Return object with jest.fn() mocks
}

// Helper functions for creating base mock methods
function createBaseMockMethods() {
  return {
    reset: () => { /* reset logic */ },
    clear: () => { /* clear logic */ },
    restore: () => { /* restore logic */ },
  };
}

// Helper functions for creating factory methods
function createFactoryMethods() {
  return {
    createMock[DataType]: (overrides = {}) => createDefaultMock[DataType](overrides),
    // ... other factory methods
  };
}

// Helper functions for creating scenario methods
function createScenarioMethods(mock: ModuleMock) {
  return {
    setupSuccessScenario: () => { /* setup success */ },
    setupErrorScenario: (errorMessage?: string) => { /* setup error */ },
    // ... other scenarios
  };
}

// Main factory function
export function create[ModuleName]Mock(
  options: ModuleMockOptions = {}
): ModuleMock {
  // Implementation
}

// Global reset function
export function reset[ModuleName]Mock(): void {
  // Implementation
}

// Global setup function
export function setup[ModuleName]Mock(): void {
  // Implementation
}
```

## Interface Standards

### Base Mock Interface

All mocks must implement the `BaseMock` interface:

```typescript
interface BaseMock {
  reset: () => void;
  clear: () => void;
  restore: () => void;
}
```

### Mock Methods

- **Mock Functions**: Use `jest.MockedFunction<T>` for proper typing
- **Factory Methods**: Return properly typed mock data with overrides support
- **Scenario Methods**: Configure mock for specific test scenarios

### Options Interface

Every mock should have an options interface:

```typescript
interface ModuleMockOptions extends BaseMockOptions {
  // Optional overrides for each mock function
  [functionName]?: jest.MockedFunction<OriginalType>;
}
```

## Scenario Standards

### Required Scenarios

Every mock should support these scenarios:

- `setupSuccessScenario()` - Configure for successful operations
- `setupErrorScenario(errorMessage?)` - Configure for error conditions

### Module-Specific Scenarios

Add scenarios relevant to the module:

- `setupNoDataScenario()` - For data-related mocks
- `setupManualModeScenario()` - For mode-based mocks
- `setupPopulatedDataScenario()` - For data collections

## Usage Patterns

### In Test Files

1. **Import and Create Mock**:

```typescript
import { createModuleMock } from '../../__mocks__/module-name';

const moduleMock = createModuleMock();
```

2. **Use in jest.mock()**:

```typescript
jest.mock('../module', () => {
  const mock = require('../../__mocks__/module-name').createModuleMock();
  return {
    function1: mock.function1,
    function2: mock.function2,
  };
});
```

3. **Setup Scenarios**:

```typescript
beforeEach(() => {
  moduleMock.setupSuccessScenario();
});
```

4. **Create Test Data**:

```typescript
const testData = moduleMock.createMockDataType({
  property: 'override value',
});
```

## Best Practices

### Mock Creation

1. Always provide default implementations that work
2. Make overrides optional and partial
3. Use factory functions for data creation
4. Implement all required lifecycle methods

### Type Safety

1. Use strict TypeScript interfaces
2. Import types from centralized `types.ts`
3. Ensure mock functions match original signatures
4. Use `jest.MockedFunction<T>` for function types

### Testing

1. Reset mocks between tests using lifecycle methods
2. Use scenario methods for common configurations
3. Prefer factory methods over manual data creation
4. Keep mock data minimal but realistic

### Organization

1. Group related functionality in helper functions
2. Keep files focused on single modules
3. Use consistent error messages and scenarios
4. Document complex mock behaviors

## Examples

### Creating a Simple Mock

```typescript
const storageMock = createStorageFunctionsMock({
  getCurrency: jest.fn().mockReturnValue(1000),
});

storageMock.setupSuccessScenario();
const character = storageMock.createMockCharacter({ level: 5 });
```

### Using in Tests

```typescript
describe('Component', () => {
  const mock = createHealthHooksMock();

  beforeEach(() => {
    mock.reset();
    mock.setupSuccessScenario();
  });

  it('should work with mock data', () => {
    const data = mock.createMockExperienceData({ experience: 100 });
    mock.useExperienceData.mockReturnValue(data);

    // Test implementation
  });
});
```

## Migration Guide

### From Manual Mocks to Centralized Mocks

**Before (Manual Mock):**

```typescript
// Manual mock setup
jest.mock('../lib/health', () => ({
  useExperienceData: jest.fn(),
  useManualEntryMode: jest.fn(),
}));

const mockUseExperienceData = jest.mocked(
  require('../lib/health').useExperienceData
);
const mockUseManualEntryMode = jest.mocked(
  require('../lib/health').useManualEntryMode
);

beforeEach(() => {
  mockUseExperienceData.mockReturnValue({
    experience: 0,
    cumulativeExperience: 0,
    refreshExperience: jest.fn(),
    isLoading: false,
    error: null,
  });
  mockUseManualEntryMode.mockReturnValue({
    isManualEntryMode: false,
    setManualEntryMode: jest.fn(),
    toggleManualEntryMode: jest.fn(),
  });
});
```

**After (Centralized Mock):**

```typescript
// Centralized mock setup
import { createHealthHooksMock } from '../../__mocks__/health-hooks';

jest.mock('../lib/health', () => {
  const healthMock =
    require('../../__mocks__/health-hooks').createHealthHooksMock();
  return {
    useExperienceData: healthMock.useExperienceData,
    useManualEntryMode: healthMock.useManualEntryMode,
  };
});

const healthMock = createHealthHooksMock();

beforeEach(() => {
  healthMock.reset();
  healthMock.setupSuccessScenario();

  // Override specific values if needed
  const customData = healthMock.createMockExperienceData({ experience: 100 });
  healthMock.useExperienceData.mockReturnValue(customData);
});
```

### Common Migration Patterns

1. **Replace Manual Data Creation:**

```typescript
// Before
const mockSaveData = {
  version: '1.0.0',
  timestamp: Date.now(),
  gameState: 'Active',
  level: 1,
  // ... many more properties
};

// After
const mockSaveData = mockDungeonGamePersistence.createMockSaveData({
  level: 1, // Only override what you need
});
```

2. **Replace Manual Scenario Setup:**

```typescript
// Before
beforeEach(() => {
  mockFunction1.mockReturnValue(successValue);
  mockFunction2.mockResolvedValue({ success: true });
  mockFunction3.mockReturnValue(true);
});

// After
beforeEach(() => {
  mock.setupSuccessScenario();
});
```

3. **Replace Manual Error Handling:**

```typescript
// Before
mockFunction.mockRejectedValue(new Error('Test error'));

// After
mock.setupErrorScenario('Test error');
```

## Troubleshooting

### Common Issues and Solutions

1. **Mock not found in jest.mock()**
   - Ensure the path to the mock file is correct
   - Use `require()` inside jest.mock() for dynamic imports

2. **TypeScript errors with mock types**
   - Import types from `__mocks__/types.ts`
   - Use `jest.MockedFunction<T>` for function types

3. **Mock functions not being called**
   - Check that you're using the correct mock instance
   - Ensure mock is properly set up in jest.mock()

4. **Inconsistent test behavior**
   - Always reset mocks between tests
   - Use scenario methods for consistent setup

### Performance Considerations

1. **Mock Creation**: Create mocks once and reuse them
2. **Data Generation**: Use factory methods instead of manual creation
3. **Cleanup**: Use `clear()` or `reset()` appropriately between tests

This structure ensures consistency, maintainability, and ease of use across all mocks in the project.
