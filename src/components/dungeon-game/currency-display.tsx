import React from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui';
import colors from '@/components/ui/colors';

// Reusable InfoRow component for label-value pairs
interface InfoRowProps {
  label: string;
  value: string | number;
  valueClassName?: string;
}

function InfoRow({
  label,
  value,
  valueClassName = `text-lg font-semibold text-[${colors.charcoal[600]}]`,
}: InfoRowProps) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className={`text-[ text-sm${colors.charcoal[500]}]`}>{label}</Text>
      <Text className={valueClassName}>{value}</Text>
    </View>
  );
}

// Reusable StatusCard component for colored status indicators
interface StatusCardProps {
  type: 'error' | 'warning' | 'success';
  title: string;
  subtitle: string;
  accessibilityLabel: string;
}

function StatusCard({
  type,
  title,
  subtitle,
  accessibilityLabel,
}: StatusCardProps) {
  const getStatusStyles = () => {
    switch (type) {
      case 'error':
        return {
          container: 'rounded-lg bg-red-100 p-3 dark:bg-red-900/20',
          title:
            'text-center text-sm font-medium text-red-800 dark:text-red-200',
          subtitle: 'text-center text-xs text-red-600 dark:text-red-300',
        };
      case 'warning':
        return {
          container: 'rounded-lg bg-yellow-100 p-3 dark:bg-yellow-900/20',
          title:
            'text-center text-sm font-medium text-yellow-800 dark:text-yellow-200',
          subtitle: 'text-center text-xs text-yellow-600 dark:text-yellow-300',
        };
      case 'success':
        return {
          container: 'rounded-lg bg-green-100 p-3 dark:bg-green-900/20',
          title:
            'text-center text-sm font-medium text-green-800 dark:text-green-200',
          subtitle: 'text-center text-xs text-green-600 dark:text-green-300',
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <View
      className={styles.container}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="alert"
    >
      <Text className={styles.title}>{title}</Text>
      <Text className={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

// Reusable SectionHeader component for headers with icons
interface SectionHeaderProps {
  title: string;
  icon: string;
  iconAccessibilityLabel: string;
}

function SectionHeader({
  title,
  icon,
  iconAccessibilityLabel,
}: SectionHeaderProps) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <Text
        className={`text-[ text-lg font-bold${colors.charcoal[600]}]`}
        accessibilityRole="header"
      >
        {title}
      </Text>
      <Text className="text-2xl" accessibilityLabel={iconAccessibilityLabel}>
        {icon}
      </Text>
    </View>
  );
}

// Reusable InfoSection component for grouped information
interface InfoSectionProps {
  children: React.ReactNode;
  className?: string;
}

function InfoSection({
  children,
  className = 'mb-3 space-y-2',
}: InfoSectionProps) {
  return <View className={className}>{children}</View>;
}

const getTurnStatusColor = (availableTurns: number) => {
  if (availableTurns < 1) {
    return `text-[${colors.danger[500]}]`;
  }
  if (availableTurns < 3) {
    return `text-[${colors.warning[400]}]`;
  }
  return `text-[${colors.success[400]}]`;
};

const getStatusIcon = (availableTurns: number) => {
  if (availableTurns < 1) {
    return '⚠️';
  }
  if (availableTurns < 3) {
    return '⚡';
  }
  return '💰';
};

interface CurrencyDisplayProps {
  currency: number;
  availableTurns: number;
  turnCost: number;
}

export default function CurrencyDisplay({
  currency,
  availableTurns,
  turnCost,
}: CurrencyDisplayProps) {
  const statusIcon = getStatusIcon(availableTurns);
  const turnStatusColor = getTurnStatusColor(availableTurns);

  return (
    <View
      className={`border-[ rounded-lg border${colors.neutral[200]}] bg-[${colors.neutral[50]}] p-4`}
      accessible={true}
      accessibilityLabel={`Currency and Turns - ${availableTurns} turns available`}
      accessibilityRole="summary"
    >
      <SectionHeader
        title="Currency & Turns"
        icon={statusIcon}
        iconAccessibilityLabel={`Status icon: ${statusIcon}`}
      />

      <InfoSection>
        <InfoRow label="Current Balance:" value={`${currency} steps`} />
        <InfoRow label="Turn Cost:" value={`${turnCost} steps`} />
      </InfoSection>

      <InfoSection className="mb-3">
        <InfoRow
          label="Available Turns:"
          value={availableTurns}
          valueClassName={`text-xl font-bold ${turnStatusColor}`}
        />
      </InfoSection>

      {availableTurns < 1 && (
        <StatusCard
          type="error"
          title="Insufficient currency to play"
          subtitle={`Need at least ${turnCost} steps`}
          accessibilityLabel="Insufficient currency warning"
        />
      )}

      {availableTurns >= 1 && availableTurns < 3 && (
        <StatusCard
          type="warning"
          title="Low currency warning"
          subtitle={`Only ${availableTurns} turns remaining`}
          accessibilityLabel="Low currency warning"
        />
      )}

      {availableTurns >= 3 && (
        <StatusCard
          type="success"
          title="Ready to play"
          subtitle={`${availableTurns} turns available`}
          accessibilityLabel="Ready to play status"
        />
      )}
    </View>
  );
}
