import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import {
  ErrorBoundary,
  HealthKitErrorBoundary,
  ManualEntryErrorBoundary,
  StorageErrorBoundary,
  useErrorHandler,
} from './error-boundary';

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <Text>Success</Text>;
};

// Component that throws an error on button press
const ThrowErrorOnPress = () => {
  const [shouldThrow, setShouldThrow] = React.useState(false);

  if (shouldThrow) {
    throw new Error('Button press error');
  }

  return (
    <TouchableOpacity onPress={() => setShouldThrow(true)}>
      <Text>Throw Error</Text>
    </TouchableOpacity>
  );
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Success')).toBeTruthy();
  });

  it('should render fallback when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByText('Test error')).toBeTruthy();
    expect(screen.getByText('Try Again')).toBeTruthy();
  });

  it('should call onError callback when error occurs', () => {
    const onError = jest.fn();
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('should reset error when reset button is pressed', () => {
    render(
      <ErrorBoundary>
        <ThrowErrorOnPress />
      </ErrorBoundary>
    );

    // Initially render the component
    expect(screen.getByText('Throw Error')).toBeTruthy();

    // Trigger error
    fireEvent.press(screen.getByText('Throw Error'));

    // Should show error fallback
    expect(screen.getByText('Something went wrong')).toBeTruthy();

    // Reset error
    fireEvent.press(screen.getByText('Try Again'));

    // Should render the component again
    expect(screen.getByText('Throw Error')).toBeTruthy();
  });

  it('should show component stack in development mode', () => {
    const originalDev = __DEV__;
    // @ts-ignore
    global.__DEV__ = true;

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeTruthy();
    // Component stack should be visible in dev mode
    expect(screen.getByText(/shouldThrow/)).toBeTruthy();

    // @ts-ignore
    global.__DEV__ = originalDev;
  });

  it('should not show component stack in production mode', () => {
    const originalDev = __DEV__;
    // @ts-ignore
    global.__DEV__ = false;

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeTruthy();
    // Component stack should not be visible in production
    expect(screen.queryByText(/ThrowError/)).toBeNull();

    // @ts-ignore
    global.__DEV__ = originalDev;
  });
});

describe('ManualEntryErrorBoundary', () => {
  it('should render manual entry specific error message', () => {
    render(
      <ManualEntryErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ManualEntryErrorBoundary>
    );

    expect(screen.getByText('Manual Entry Error')).toBeTruthy();
    expect(
      screen.getByText('Failed to process manual step entry')
    ).toBeTruthy();
    expect(
      screen.getByText(
        'You can still use HealthKit for automatic step tracking, or try manual entry again.'
      )
    ).toBeTruthy();
    expect(screen.getByText('Retry Manual Entry')).toBeTruthy();
  });
});

describe('StorageErrorBoundary', () => {
  it('should render storage specific error message', () => {
    render(
      <StorageErrorBoundary>
        <ThrowError shouldThrow={true} />
      </StorageErrorBoundary>
    );

    expect(screen.getByText('Storage Error')).toBeTruthy();
    expect(screen.getByText('Failed to save or load data')).toBeTruthy();
    expect(
      screen.getByText(
        'Your step data may not be saved. Please try again or restart the app.'
      )
    ).toBeTruthy();
    expect(screen.getByText('Retry')).toBeTruthy();
  });
});

describe('HealthKitErrorBoundary', () => {
  it('should render HealthKit specific error message', () => {
    render(
      <HealthKitErrorBoundary>
        <ThrowError shouldThrow={true} />
      </HealthKitErrorBoundary>
    );

    expect(screen.getByText('HealthKit Error')).toBeTruthy();
    expect(screen.getByText('HealthKit is experiencing issues')).toBeTruthy();
    expect(
      screen.getByText(
        'You can still track your steps manually. HealthKit will be retried automatically.'
      )
    ).toBeTruthy();
    expect(screen.getByText('Retry HealthKit')).toBeTruthy();
  });
});

describe('useErrorHandler', () => {
  it('should handle errors and provide reset functionality', () => {
    const TestComponent = () => {
      const { error, handleError, resetError } = useErrorHandler();

      if (error) {
        return (
          <View>
            <Text>Error: {error.message}</Text>
            <TouchableOpacity onPress={resetError}>
              <Text>Reset</Text>
            </TouchableOpacity>
          </View>
        );
      }

      return (
        <TouchableOpacity onPress={() => handleError(new Error('Test error'))}>
          <Text>Throw Error</Text>
        </TouchableOpacity>
      );
    };

    render(<TestComponent />);

    // Initially no error
    expect(screen.getByText('Throw Error')).toBeTruthy();

    // Trigger error
    fireEvent.press(screen.getByText('Throw Error'));

    // Should show error
    expect(screen.getByText('Error: Test error')).toBeTruthy();
    expect(screen.getByText('Reset')).toBeTruthy();

    // Reset error
    fireEvent.press(screen.getByText('Reset'));

    // Should show original button again
    expect(screen.getByText('Throw Error')).toBeTruthy();
  });
});
