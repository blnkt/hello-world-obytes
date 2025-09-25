import React from 'react';
import { View } from 'react-native';

import { Button } from './button';
import { Text } from './text';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    error?: Error;
    errorInfo?: React.ErrorInfo;
    resetError: () => void;
  }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  componentName?: string;
}

const DefaultErrorFallback = ({
  error,
  errorInfo,
  resetError,
}: {
  error?: Error;
  errorInfo?: React.ErrorInfo;
  resetError: () => void;
}) => (
  <View className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
    <Text className="mb-2 font-semibold text-red-800 dark:text-red-200">
      Something went wrong
    </Text>
    <Text className="mb-3 text-sm text-red-700 dark:text-red-300">
      {error?.message || 'An unexpected error occurred'}
    </Text>
    {__DEV__ && errorInfo && (
      <View className="mb-3 rounded border border-red-300 bg-red-100 p-2 dark:border-red-700 dark:bg-red-900/30">
        <Text className="font-mono text-xs text-red-800 dark:text-red-200">
          {errorInfo.componentStack}
        </Text>
      </View>
    )}
    <Button
      variant="outline"
      label="Try Again"
      onPress={resetError}
      size="sm"
    />
  </View>
);

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      `ErrorBoundary caught an error${this.props.componentName ? ` in ${this.props.componentName}` : ''}:`,
      error,
      errorInfo
    );

    this.props.onError?.(error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to handle errors
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    console.error('useErrorHandler caught an error:', error);
    setError(error);
  }, []);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, resetError };
};

// Specialized error boundary for manual entry components
export const ManualEntryErrorBoundary = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const ManualEntryErrorFallback = ({
    error: _error,
    resetError,
  }: {
    error?: Error;
    resetError: () => void;
  }) => (
    <View className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
      <Text className="mb-2 font-semibold text-orange-800 dark:text-orange-200">
        Manual Entry Error
      </Text>
      <Text className="mb-3 text-sm text-orange-700 dark:text-orange-300">
        Failed to process manual step entry
      </Text>
      <Text className="mb-3 text-xs text-orange-600 dark:text-orange-400">
        You can still use HealthKit for automatic step tracking, or try manual
        entry again.
      </Text>
      <Button
        variant="outline"
        label="Retry Manual Entry"
        onPress={resetError}
        size="sm"
      />
    </View>
  );

  return (
    <ErrorBoundary
      componentName="ManualEntry"
      fallback={ManualEntryErrorFallback}
    >
      {children}
    </ErrorBoundary>
  );
};

// Specialized error boundary for storage operations
export const StorageErrorBoundary = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const StorageErrorFallback = ({
    error: _error,
    resetError,
  }: {
    error?: Error;
    resetError: () => void;
  }) => (
    <View className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
      <Text className="mb-2 font-semibold text-red-800 dark:text-red-200">
        Storage Error
      </Text>
      <Text className="mb-3 text-sm text-red-700 dark:text-red-300">
        Failed to save or load data
      </Text>
      <Text className="mb-3 text-xs text-red-600 dark:text-red-400">
        Your step data may not be saved. Please try again or restart the app.
      </Text>
      <Button variant="outline" label="Retry" onPress={resetError} size="sm" />
    </View>
  );

  return (
    <ErrorBoundary componentName="Storage" fallback={StorageErrorFallback}>
      {children}
    </ErrorBoundary>
  );
};

// Specialized error boundary for HealthKit operations
export const HealthKitErrorBoundary = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const HealthKitErrorFallback = ({
    error: _error,
    resetError,
  }: {
    error?: Error;
    resetError: () => void;
  }) => (
    <View className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
      <Text className="mb-2 font-semibold text-blue-800 dark:text-blue-200">
        HealthKit Error
      </Text>
      <Text className="mb-3 text-sm text-blue-700 dark:text-blue-300">
        HealthKit is experiencing issues
      </Text>
      <Text className="mb-3 text-xs text-blue-600 dark:text-blue-400">
        You can still track your steps manually. HealthKit will be retried
        automatically.
      </Text>
      <Button
        variant="outline"
        label="Retry HealthKit"
        onPress={resetError}
        size="sm"
      />
    </View>
  );

  return (
    <ErrorBoundary componentName="HealthKit" fallback={HealthKitErrorFallback}>
      {children}
    </ErrorBoundary>
  );
};
