import React from 'react';
import { View } from 'react-native';

import { Button } from './button';
import { Text } from './text';

interface BaseCardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  testID?: string;
}

interface InfoCardProps extends BaseCardProps {
  variant: 'info';
}

interface ClassCardProps extends BaseCardProps {
  variant: 'class';
  variantStyle?: 'compact' | 'detailed';
}

interface ToggleCardProps extends BaseCardProps {
  variant: 'toggle';
  buttonLabel: string;
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

interface FormSectionProps extends BaseCardProps {
  variant: 'form';
}

type CardProps =
  | InfoCardProps
  | ClassCardProps
  | ToggleCardProps
  | FormSectionProps;

// Helper functions for variant-specific styling
const getVariantClasses = (variant: string, variantStyle?: string) => {
  const baseClasses =
    'rounded-md border border-neutral-200 p-3 dark:border-neutral-700';

  switch (variant) {
    case 'info':
      return `${baseClasses} bg-white`;
    case 'class':
      const isCompact = variantStyle === 'compact';
      return isCompact
        ? 'mt-2 rounded-md bg-purple-50 p-3 dark:bg-purple-900'
        : 'rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800';
    case 'toggle':
      return `${baseClasses} flex-row items-center justify-between`;
    case 'form':
      return `${baseClasses} bg-white`;
    default:
      return baseClasses;
  }
};

const getTitleClasses = (variant: string, variantStyle?: string) => {
  switch (variant) {
    case 'class':
      const isCompact = variantStyle === 'compact';
      return `font-bold text-gray-800 dark:text-gray-200 ${
        isCompact ? 'text-sm' : 'mb-2 text-xl'
      }`;
    case 'form':
      return 'mb-3 font-medium';
    default:
      return 'font-medium';
  }
};

const getDescriptionClasses = (variant: string, variantStyle?: string) => {
  switch (variant) {
    case 'class':
      const isCompact = variantStyle === 'compact';
      return `text-gray-600 dark:text-gray-400 ${
        isCompact ? 'text-sm' : 'mb-4 text-base'
      }`;
    default:
      return 'text-sm text-neutral-600 dark:text-neutral-400';
  }
};

// Variant-specific render functions
const renderToggleCard = (props: ToggleCardProps, className: string) => {
  const {
    title,
    description,
    buttonLabel,
    onPress,
    disabled,
    isLoading,
    testID,
  } = props;
  const variantClasses = getVariantClasses('toggle');
  const titleClasses = getTitleClasses('toggle');
  const descriptionClasses = getDescriptionClasses('toggle');

  return (
    <View className={`${variantClasses} ${className}`} testID={testID}>
      <View className="flex-1">
        <Text className={titleClasses}>{title}</Text>
        {description && (
          <Text className={descriptionClasses}>{description}</Text>
        )}
      </View>
      <Button
        variant="outline"
        label={buttonLabel}
        onPress={onPress}
        disabled={disabled || isLoading}
        size="sm"
        testID={`${testID}-button`}
      />
    </View>
  );
};

const renderFormSection = (props: FormSectionProps, className: string) => {
  const { title, children, testID } = props;
  const variantClasses = getVariantClasses('form');
  const titleClasses = getTitleClasses('form');

  return (
    <View className={`${variantClasses} ${className}`} testID={testID}>
      <Text className={titleClasses}>{title}</Text>
      <View className="space-y-3">{children}</View>
    </View>
  );
};

const renderStandardCard = (
  props: InfoCardProps | ClassCardProps,
  className: string
) => {
  const { title, description, children, testID } = props;
  const variant = props.variant;
  const variantStyle = (props as ClassCardProps).variantStyle;

  const variantClasses = getVariantClasses(variant, variantStyle);
  const titleClasses = getTitleClasses(variant, variantStyle);
  const descriptionClasses = getDescriptionClasses(variant, variantStyle);

  return (
    <View className={`${variantClasses} ${className}`} testID={testID}>
      <Text className={titleClasses}>{title}</Text>
      {description && <Text className={descriptionClasses}>{description}</Text>}
      {children}
    </View>
  );
};

export function Card(props: CardProps) {
  const { className = '', variant } = props;

  // Render toggle card layout
  if (variant === 'toggle') {
    return renderToggleCard(props as ToggleCardProps, className);
  }

  // Render form section layout
  if (variant === 'form') {
    return renderFormSection(props as FormSectionProps, className);
  }

  // Render standard card layout (info, class)
  return renderStandardCard(props as InfoCardProps | ClassCardProps, className);
}

// Convenience exports for backward compatibility
export const InfoCard = (props: Omit<InfoCardProps, 'variant'>) => (
  <Card {...props} variant="info" />
);

export const ClassCard = (props: Omit<ClassCardProps, 'variant'>) => (
  <Card {...props} variant="class" />
);

export const ToggleCard = (props: Omit<ToggleCardProps, 'variant'>) => (
  <Card {...props} variant="toggle" />
);

export const FormSection = (props: Omit<FormSectionProps, 'variant'>) => (
  <Card {...props} variant="form" />
);
