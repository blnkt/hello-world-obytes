# Testing Guidelines

This document provides comprehensive guidelines for testing React Native components and applications using our centralized mock system and best practices.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Centralized Mock System](#centralized-mock-system)
- [Test Structure](#test-structure)
- [Mock Usage Patterns](#mock-usage-patterns)
- [Component Testing](#component-testing)
- [Hook Testing](#hook-testing)
- [Integration Testing](#integration-testing)
- [Performance Testing](#performance-testing)
- [Accessibility Testing](#accessibility-testing)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

## Testing Philosophy

### Test-Driven Development (TDD)

We follow the **Red, Green, Refactor** cycle:

1. **Red**: Write a failing test
2. **Green**: Write minimal code to make the test pass
3. **Refactor**: Improve the code while keeping tests green

### Testing Pyramid

```
    /\
   /  \     E2E Tests (Few)
  /____\
 /      \   Integration Tests (Some)
/________\
            Unit Tests (Many)
```

- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test how components work together
- **E2E Tests**: Test complete user workflows

## Centralized Mock System

### Overview

Our centralized mock system provides:

- **Consistent interfaces** across all mocks
- **Type safety** with TypeScript
- **Factory functions** for easy test data creation
- **Scenario methods** for common test setups
- **Lifecycle management** for proper test isolation

### Mock Files Structure

```
__mocks__/
├── README.md                    # Complete documentation
├── types.ts                     # Centralized TypeScript interfaces
├── helpers.ts                   # Common helper functions
├── dungeon-game-persistence.ts  # Dungeon game persistence mock
├── health-hooks.ts              # Health-related hooks mock
├── storage-functions.ts         # Storage functions mock
└── [module-name].ts             # Other module-specific mocks
```

### Available Mocks

1. **Dungeon Game Persistence** (`createDungeonGamePersistenceMock`)
2. **Health Hooks** (`createHealthHooksMock`)
3. **Storage Functions** (`createStorageFunctionsMock`)

## Test Structure

### File Organization

Place test files alongside the code they test:

```
src/components/ui/
├── button.tsx
├── button.test.tsx
├── input.tsx
└── input.test.tsx
```

### Test File Structure

```typescript
// 1. Imports
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';

import { createHealthHooksMock } from '../../../__mocks__/health-hooks';
import { MyComponent } from './my-component';

// 2. Mock setup
jest.mock('../../../lib/health', () => {
  const healthMock = require('../../../__mocks__/health-hooks').createHealthHooksMock();
  return {
    useExperienceData: healthMock.useExperienceData,
    useManualEntryMode: healthMock.useManualEntryMode,
  };
});

// 3. Test suite
describe('MyComponent', () => {
  const healthMock = createHealthHooksMock();

  beforeEach(() => {
    healthMock.reset();
    healthMock.setupSuccessScenario();
  });

  afterEach(() => {
    healthMock.clear();
  });

  describe('rendering', () => {
    it('should render correctly with default props', () => {
      render(<MyComponent />);
      expect(screen.getByText('Expected Text')).toBeOnTheScreen();
    });
  });

  describe('interactions', () => {
    it('should handle button press', () => {
      const mockOnPress = jest.fn();
      render(<MyComponent onPress={mockOnPress} />);

      fireEvent.press(screen.getByText('Button'));

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('error handling', () => {
    it('should display error message when data fails to load', () => {
      healthMock.setupErrorScenario('Network error');

      render(<MyComponent />);

      expect(screen.getByText('Network error')).toBeOnTheScreen();
    });
  });
});
```

## Mock Usage Patterns

### 1. Basic Mock Setup

```typescript
import { createHealthHooksMock } from '../../../__mocks__/health-hooks';

// Create mock instance
const healthMock = createHealthHooksMock();

// Setup in jest.mock()
jest.mock('../../../lib/health', () => {
  const healthMock =
    require('../../../__mocks__/health-hooks').createHealthHooksMock();
  return {
    useExperienceData: healthMock.useExperienceData,
    useManualEntryMode: healthMock.useManualEntryMode,
  };
});
```

### 2. Scenario-Based Testing

```typescript
describe('Component Scenarios', () => {
  const healthMock = createHealthHooksMock();

  beforeEach(() => {
    healthMock.reset();
  });

  it('should handle success scenario', () => {
    healthMock.setupSuccessScenario();

    render(<MyComponent />);

    expect(screen.getByText('Data loaded successfully')).toBeOnTheScreen();
  });

  it('should handle error scenario', () => {
    healthMock.setupErrorScenario('Failed to load data');

    render(<MyComponent />);

    expect(screen.getByText('Failed to load data')).toBeOnTheScreen();
  });

  it('should handle manual mode scenario', () => {
    healthMock.setupManualModeScenario();

    render(<MyComponent />);

    expect(screen.getByText('Manual entry mode enabled')).toBeOnTheScreen();
  });
});
```

### 3. Custom Data Creation

```typescript
it('should display custom experience data', () => {
  const customData = healthMock.createMockExperienceData({
    experience: 1500,
    cumulativeExperience: 5000,
    isLoading: false,
  });

  healthMock.useExperienceData.mockReturnValue(customData);

  render(<MyComponent />);

  expect(screen.getByText('1500 XP')).toBeOnTheScreen();
});
```

### 4. Lifecycle Management

```typescript
describe('Component Lifecycle', () => {
  const healthMock = createHealthHooksMock();

  beforeEach(() => {
    // Reset all mocks to initial state
    healthMock.reset();

    // Setup default scenario
    healthMock.setupSuccessScenario();
  });

  afterEach(() => {
    // Clear all mock calls
    healthMock.clear();
  });

  afterAll(() => {
    // Restore original implementations
    healthMock.restore();
  });
});
```

## Component Testing

### 1. Rendering Tests

```typescript
describe('Component Rendering', () => {
  it('should render with required props', () => {
    render(<Button title="Click me" onPress={jest.fn()} />);

    expect(screen.getByText('Click me')).toBeOnTheScreen();
  });

  it('should render with optional props', () => {
    render(
      <Button
        title="Click me"
        onPress={jest.fn()}
        disabled={true}
        variant="secondary"
      />
    );

    const button = screen.getByText('Click me');
    expect(button).toBeOnTheScreen();
    expect(button).toBeDisabled();
  });

  it('should render different variants', () => {
    const { rerender } = render(
      <Button title="Primary" onPress={jest.fn()} variant="primary" />
    );
    expect(screen.getByText('Primary')).toBeOnTheScreen();

    rerender(<Button title="Secondary" onPress={jest.fn()} variant="secondary" />);
    expect(screen.getByText('Secondary')).toBeOnTheScreen();
  });
});
```

### 2. Interaction Tests

```typescript
describe('Component Interactions', () => {
  it('should call onPress when button is pressed', () => {
    const mockOnPress = jest.fn();
    render(<Button title="Click me" onPress={mockOnPress} />);

    fireEvent.press(screen.getByText('Click me'));

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should not call onPress when button is disabled', () => {
    const mockOnPress = jest.fn();
    render(<Button title="Click me" onPress={mockOnPress} disabled={true} />);

    fireEvent.press(screen.getByText('Click me'));

    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should handle multiple rapid presses', () => {
    const mockOnPress = jest.fn();
    render(<Button title="Click me" onPress={mockOnPress} />);

    const button = screen.getByText('Click me');
    fireEvent.press(button);
    fireEvent.press(button);
    fireEvent.press(button);

    expect(mockOnPress).toHaveBeenCalledTimes(3);
  });
});
```

### 3. State Management Tests

```typescript
describe('Component State', () => {
  it('should update state when props change', () => {
    const { rerender } = render(<Counter initialCount={0} />);

    expect(screen.getByText('Count: 0')).toBeOnTheScreen();

    rerender(<Counter initialCount={5} />);

    expect(screen.getByText('Count: 5')).toBeOnTheScreen();
  });

  it('should handle internal state changes', () => {
    render(<Counter initialCount={0} />);

    fireEvent.press(screen.getByText('Increment'));

    expect(screen.getByText('Count: 1')).toBeOnTheScreen();
  });
});
```

## Hook Testing

### 1. Custom Hook Testing

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { createHealthHooksMock } from '../../../__mocks__/health-hooks';
import { useHealthData } from '../use-health-data';

describe('useHealthData', () => {
  const healthMock = createHealthHooksMock();

  beforeEach(() => {
    healthMock.reset();
    healthMock.setupSuccessScenario();
  });

  it('should return health data', () => {
    const { result } = renderHook(() => useHealthData());

    expect(result.current.experience).toBe(1000);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle loading state', () => {
    const loadingData = healthMock.createMockExperienceData({
      isLoading: true,
    });
    healthMock.useExperienceData.mockReturnValue(loadingData);

    const { result } = renderHook(() => useHealthData());

    expect(result.current.isLoading).toBe(true);
  });

  it('should handle error state', () => {
    healthMock.setupErrorScenario('Network error');

    const { result } = renderHook(() => useHealthData());

    expect(result.current.error).toBe('Network error');
    expect(result.current.experience).toBe(0);
  });
});
```

### 2. Hook with Effects

```typescript
describe('useHealthData with effects', () => {
  const healthMock = createHealthHooksMock();

  beforeEach(() => {
    healthMock.reset();
  });

  it('should fetch data on mount', () => {
    renderHook(() => useHealthData());

    expect(healthMock.useExperienceData).toHaveBeenCalledTimes(1);
  });

  it('should refetch data when refresh is called', async () => {
    const { result } = renderHook(() => useHealthData());

    await act(async () => {
      await result.current.refresh();
    });

    expect(healthMock.useExperienceData).toHaveBeenCalledTimes(2);
  });
});
```

## Integration Testing

### 1. Component Integration

```typescript
describe('Component Integration', () => {
  const healthMock = createHealthHooksMock();
  const storageMock = createStorageFunctionsMock();

  beforeEach(() => {
    healthMock.reset();
    storageMock.reset();

    healthMock.setupSuccessScenario();
    storageMock.setupSuccessScenario();
  });

  it('should work with multiple hooks', () => {
    render(<HealthDashboard />);

    expect(screen.getByText('Experience: 1000')).toBeOnTheScreen();
    expect(screen.getByText('Currency: 500')).toBeOnTheScreen();
  });

  it('should handle cross-component state updates', () => {
    render(
      <>
        <HealthDisplay />
        <HealthControls />
      </>
    );

    fireEvent.press(screen.getByText('Refresh Data'));

    expect(screen.getByText('Data refreshed')).toBeOnTheScreen();
  });
});
```

### 2. Navigation Testing

```typescript
import { NavigationContainer } from '@react-navigation/native';

describe('Navigation Integration', () => {
  it('should navigate between screens', () => {
    render(
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    );

    fireEvent.press(screen.getByText('Go to Settings'));

    expect(screen.getByText('Settings Screen')).toBeOnTheScreen();
  });
});
```

## Performance Testing

### 1. Render Performance

```typescript
describe('Performance', () => {
  it('should render large lists efficiently', () => {
    const largeData = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
    }));

    const startTime = performance.now();
    render(<LargeList data={largeData} />);
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(100); // Should render in < 100ms
  });

  it('should not re-render unnecessarily', () => {
    const renderSpy = jest.fn();

    const TestComponent = () => {
      renderSpy();
      return <Text>Test</Text>;
    };

    const { rerender } = render(<TestComponent />);

    expect(renderSpy).toHaveBeenCalledTimes(1);

    rerender(<TestComponent />);

    expect(renderSpy).toHaveBeenCalledTimes(1); // Should not re-render with same props
  });
});
```

### 2. Memory Usage

```typescript
describe('Memory Management', () => {
  it('should clean up resources on unmount', () => {
    const cleanupSpy = jest.fn();

    const TestComponent = () => {
      useEffect(() => {
        return cleanupSpy;
      }, []);

      return <Text>Test</Text>;
    };

    const { unmount } = render(<TestComponent />);

    unmount();

    expect(cleanupSpy).toHaveBeenCalled();
  });
});
```

## Accessibility Testing

### 1. Screen Reader Support

```typescript
describe('Accessibility', () => {
  it('should have proper accessibility labels', () => {
    render(<Button title="Save" onPress={jest.fn()} />);

    const button = screen.getByText('Save');
    expect(button).toHaveAccessibilityRole('button');
    expect(button).toHaveAccessibilityLabel('Save');
  });

  it('should support accessibility hints', () => {
    render(
      <Button
        title="Delete"
        onPress={jest.fn()}
        accessibilityHint="Double tap to delete item"
      />
    );

    const button = screen.getByText('Delete');
    expect(button).toHaveAccessibilityHint('Double tap to delete item');
  });
});
```

### 2. Keyboard Navigation

```typescript
describe('Keyboard Navigation', () => {
  it('should handle keyboard events', () => {
    render(<TextInput placeholder="Enter text" />);

    const input = screen.getByPlaceholderText('Enter text');

    fireEvent.changeText(input, 'Hello World');

    expect(input).toHaveDisplayValue('Hello World');
  });
});
```

## Best Practices

### 1. Test Organization

- **Group related tests** using `describe` blocks
- **Use descriptive test names** that explain the expected behavior
- **Follow the Arrange-Act-Assert pattern**
- **Keep tests focused** on a single behavior

### 2. Mock Management

- **Always reset mocks** between tests
- **Use scenario methods** for common setups
- **Create custom data** only when needed
- **Verify mock interactions** when testing side effects

### 3. Test Data

- **Use factory functions** for creating test data
- **Keep test data minimal** but realistic
- **Avoid hardcoded values** in tests
- **Use meaningful test data** that represents real scenarios

### 4. Assertions

- **Use specific assertions** over generic ones
- **Test both positive and negative cases**
- **Verify error conditions** and edge cases
- **Check accessibility properties** when relevant

## Common Patterns

### 1. Testing Async Operations

```typescript
it('should handle async operations', async () => {
  const mockAsyncFunction = jest.fn().mockResolvedValue('success');

  render(<AsyncComponent onAsyncAction={mockAsyncFunction} />);

  fireEvent.press(screen.getByText('Start Action'));

  await waitFor(() => {
    expect(screen.getByText('Action completed')).toBeOnTheScreen();
  });

  expect(mockAsyncFunction).toHaveBeenCalledTimes(1);
});
```

### 2. Testing Error Boundaries

```typescript
it('should catch and display errors', () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };

  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(screen.getByText('Something went wrong')).toBeOnTheScreen();
});
```

### 3. Testing Context Providers

```typescript
it('should provide context values', () => {
  const TestConsumer = () => {
    const value = useContext(MyContext);
    return <Text>{value}</Text>;
  };

  render(
    <MyContextProvider value="test value">
      <TestConsumer />
    </MyContextProvider>
  );

  expect(screen.getByText('test value')).toBeOnTheScreen();
});
```

## Troubleshooting

### Common Issues

#### 1. Mock Not Working

**Problem**: Mock functions not being called or returning unexpected values.

**Solution**:

```typescript
// Ensure mock is properly set up
jest.mock('../lib/health', () => {
  const healthMock =
    require('../../__mocks__/health-hooks').createHealthHooksMock();
  return {
    useExperienceData: healthMock.useExperienceData,
  };
});

// Reset mock between tests
beforeEach(() => {
  healthMock.reset();
});
```

#### 2. Test Isolation Issues

**Problem**: Tests affecting each other due to shared state.

**Solution**:

```typescript
beforeEach(() => {
  // Reset all mocks
  healthMock.reset();
  storageMock.reset();

  // Clear any global state
  jest.clearAllMocks();
});
```

#### 3. Async Test Failures

**Problem**: Tests failing due to timing issues with async operations.

**Solution**:

```typescript
it('should handle async operations', async () => {
  render(<AsyncComponent />);

  // Use waitFor for async operations
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeOnTheScreen();
  });
});
```

#### 4. TypeScript Errors in Tests

**Problem**: TypeScript errors in test files.

**Solution**:

```typescript
// Use proper typing for mocks
const mockFunction = jest.fn() as jest.MockedFunction<(value: string) => void>;

// Use type assertions when necessary
const element = screen.getByText('Button') as HTMLElement;
```

### Debugging Tips

1. **Use `screen.debug()`** to see the current DOM state
2. **Add `console.log`** statements to understand test flow
3. **Use `--verbose` flag** when running tests for more output
4. **Check mock call history** with `mockFunction.mock.calls`
5. **Verify mock return values** with `mockFunction.mock.results`

This comprehensive testing guide ensures consistent, reliable, and maintainable tests across the project.
