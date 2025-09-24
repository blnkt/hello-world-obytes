import * as React from 'react';
import type {
  NativeSyntheticEvent,
  TextInputFocusEventData,
  TextInputProps,
  TextInputSubmitEditingEventData,
} from 'react-native';
import { TextInput, View } from 'react-native';

import { validateStepCount } from '@/lib/utils';

import colors from './colors';
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
  // Using centralized validateStepCount utility
  const validate = React.useCallback(
    (val: string) => validateStepCount(val),
    []
  );

  return { validate };
};

const blurHandler = (
  e: any,
  params: {
    value: string;
    validate: (val: string) => string | undefined;
    setError: (error: string | undefined) => void;
    onBlur?: (e: any) => void;
  }
) => {
  const { value, validate, setError, onBlur } = params;

  try {
    const validationError = validate(value);
    setError(validationError);
    onBlur?.(e);
  } catch (validationError) {
    console.error('Validation error in manual step entry:', validationError);
    setError('Invalid step count format');
    onBlur?.(e);
  }
};

const changeTextHandler = (
  text: string,
  params: {
    onChangeText?: (text: string) => void;
    setError: (error: string | undefined) => void;
    error?: string;
  }
) => {
  const { onChangeText, setError, error } = params;

  try {
    const numericText = text.replace(/[^0-9]/g, '');
    onChangeText?.(numericText);
    if (error) setError(undefined); // clear error on change
  } catch (changeError) {
    console.error('Error handling text change:', changeError);
    setError('Failed to process input');
  }
};

const submitEditingHandler = (
  e: any,
  params: {
    value: string;
    validate: (val: string) => string | undefined;
    setError: (error: string | undefined) => void;
    onSubmitEditing?: (e: any) => void;
  }
) => {
  const { value, validate, setError, onSubmitEditing } = params;

  try {
    const validationError = validate(value);
    if (validationError) {
      setError(validationError);
      return;
    }
    onSubmitEditing?.(e);
  } catch (submitError) {
    console.error('Error handling submit:', submitError);
    setError('Failed to submit step count');
  }
};

const Label = ({ testID, label }: { testID?: string; label: string }) => {
  return (
    <Text
      testID={testID ? `${testID}-label` : undefined}
      className="text-grey-100 mb-1 text-lg dark:text-neutral-100"
    >
      {label}
    </Text>
  );
};

const LoadingMessage = ({ testID }: { testID?: string }) => {
  return (
    <Text
      testID={testID ? `${testID}-loading` : undefined}
      className="mt-1 text-sm text-neutral-500 dark:text-neutral-400"
    >
      Processing...
    </Text>
  );
};

const ErrorMessage = ({
  testID,
  error,
}: {
  testID?: string;
  error: string;
}) => {
  return (
    <Text
      testID={testID ? `${testID}-error` : undefined}
      className="text-sm text-danger-400 dark:text-danger-600"
    >
      {error}
    </Text>
  );
};

const ManualStepEntryComponent = React.forwardRef<
  TextInput,
  ManualStepEntryProps
>((props, ref) => {
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
    (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      blurHandler(e, { value, validate, setError, onBlur });
    },
    [value, validate, setError, onBlur]
  );
  const handleChangeText = React.useCallback(
    (text: string) => {
      changeTextHandler(text, { onChangeText, setError, error });
    },
    [onChangeText, setError, error]
  );
  const handleSubmitEditing = React.useCallback(
    (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) =>
      submitEditingHandler(e, {
        value,
        validate,
        setError,
        onSubmitEditing: props.onSubmitEditing,
      }),
    [value, validate, setError, props.onSubmitEditing]
  );

  return (
    <View className="mb-2">
      {label && <Label testID={testID} label={label} />}
      <TextInput
        testID={testID}
        ref={ref}
        placeholder="Enter your step count"
        placeholderTextColor={colors.charcoal[400]}
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
      {loading && <LoadingMessage testID={testID} />}
      {error && <ErrorMessage testID={testID} error={error} />}
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
