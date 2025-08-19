import React from 'react';
import { TextInput, View } from 'react-native';

import { Text } from './text';

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  maxLength?: number;
  className?: string;
}

export function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  maxLength,
  className = '',
}: FormInputProps) {
  return (
    <View className={className}>
      <Text className="mb-1 text-sm font-medium">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        maxLength={maxLength}
        className="rounded-md border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
      />
    </View>
  );
}
