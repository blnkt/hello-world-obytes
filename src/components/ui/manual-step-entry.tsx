/* eslint-disable max-lines-per-function */
import * as React from 'react';
import type { TextInputProps } from 'react-native';
import { TextInput, View } from 'react-native';

import { ManualEntryErrorBoundary, Text } from './index';

export interface ManualStepEntryProps
  extends Omit<TextInputProps, 'onChangeText'> {
  label?: string;
  disabled?: boolean;
  error?: string;
  loading?: boolean;
  onChangeText?: (text: string) => void;
}

const useValidation = () => {
  const validate = React.useCallback((val: string) => {
    if (!val || val.trim() === '') {
      return 'Step count is required';
    }
    if (!/^[0-9]+$/.test(val)) {
      if (/\./.test(val)) return 'Step count must be a whole number';
      return 'Step count must be a positive number';
    }
    const num = Number(val);
    if (num < 1) return 'Step count must be at least 1 step';
    if (num > 100000)
      return 'Step count exceeds maximum daily limit of 100,000 steps';
    return undefined;
  }, []);

  return { validate };
};

const ManualStepEntryComponent = React.forwardRef<
  TextInput,
  ManualStepEntryProps
>((props, ref) => {
  // eslint-disable-next-line max-lines-per-function
  const {
    label = 'Step Count',
    error: errorProp,
    testID,
    disabled = false,
    loading = false,
    onChangeText,
    onFocus,
    onBlur,
    value = '',
    ...inputProps
  } = props;

  const [error, setError] = React.useState<string | undefined>(errorProp);
  const { validate } = useValidation();

  React.useEffect(() => {
    setError(errorProp);
  }, [errorProp]);

  const handleBlur = React.useCallback(
    (e: any) => {
      try {
        const validationError = validate(value as string);
        setError(validationError);
        onBlur?.(e);
      } catch (validationError) {
        console.error(
          'Validation error in manual step entry:',
          validationError
        );
        setError('Invalid step count format');
        onBlur?.(e);
      }
    },
    [onBlur, validate, value]
  );

  const handleChangeText = React.useCallback(
    (text: string) => {
      try {
        // Only allow positive numeric input
        const numericText = text.replace(/[^0-9]/g, '');
        onChangeText?.(numericText);
        if (error) setError(undefined); // clear error on change
      } catch (changeError) {
        console.error('Error handling text change:', changeError);
        setError('Failed to process input');
      }
    },
    [onChangeText, error]
  );

  const handleSubmitEditing = React.useCallback(
    (e: any) => {
      try {
        const validationError = validate(value as string);
        if (validationError) {
          setError(validationError);
          return;
        }
        if (props.onSubmitEditing) {
          props.onSubmitEditing(e);
        }
      } catch (submitError) {
        console.error('Error handling submit:', submitError);
        setError('Failed to submit step count');
      }
    },
    [validate, value, props, setError]
  );

  return (
    <View className="mb-2">
      {label && (
        <Text
          testID={testID ? `${testID}-label` : undefined}
          className="text-grey-100 mb-1 text-lg dark:text-neutral-100"
        >
          {label}
        </Text>
      )}
      <TextInput
        testID={testID}
        ref={ref}
        placeholder="Enter your step count"
        placeholderTextColor="#9CA3AF"
        className="mt-0 rounded-xl border-[0.5px] border-neutral-300 bg-neutral-100 px-4 py-3 font-inter text-base font-medium leading-5 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
        keyboardType="numeric"
        editable={!disabled && !loading}
        onFocus={onFocus}
        onBlur={handleBlur}
        onChangeText={handleChangeText}
        value={value as string}
        onSubmitEditing={handleSubmitEditing}
        {...inputProps}
      />
      {loading && (
        <Text
          testID={testID ? `${testID}-loading` : undefined}
          className="mt-1 text-sm text-neutral-500 dark:text-neutral-400"
        >
          Processing...
        </Text>
      )}
      {error && (
        <Text
          testID={testID ? `${testID}-error` : undefined}
          className="text-sm text-danger-400 dark:text-danger-600"
        >
          {error}
        </Text>
      )}
    </View>
  );
});

export const ManualStepEntry = React.forwardRef<
  TextInput,
  ManualStepEntryProps
>((props, ref) => {
  return (
    <ManualEntryErrorBoundary>
      <ManualStepEntryComponent {...props} ref={ref} />
    </ManualEntryErrorBoundary>
  );
});
