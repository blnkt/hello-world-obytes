import React, { useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { Button, Text, View } from '@/components/ui';
import {
  useExperienceData,
  useHealthKit,
  useHealthKitFallback,
} from '@/lib/health';

const getStatusInfo = (fallback: any, healthKit: any) => {
  if (fallback.isLoading) {
    return {
      icon: '⏳',
      label: 'Checking HealthKit...',
      description: 'Verifying HealthKit availability and permissions',
      color: 'bg-gray-100 border-gray-300 text-gray-800',
      dotColor: 'bg-gray-500',
    };
  }

  if (fallback.shouldUseManualEntry) {
    if (fallback.suggestion === 'force_manual') {
      return {
        icon: '📱',
        label: 'Manual Mode Only',
        description: 'HealthKit not supported on this device',
        color: 'bg-yellow-100 border-yellow-300 text-yellow-800',
        dotColor: 'bg-yellow-500',
      };
    } else if (fallback.suggestion === 'suggest_manual') {
      return {
        icon: '⚠️',
        label: 'HealthKit Unavailable',
        description: fallback.reason,
        color: 'bg-orange-100 border-orange-300 text-orange-800',
        dotColor: 'bg-orange-500',
      };
    }
  }

  if (healthKit.isAvailable && healthKit.hasRequestedAuthorization) {
    return {
      icon: '✅',
      label: 'HealthKit Active',
      description: 'HealthKit is available and authorized',
      color: 'bg-green-100 border-green-300 text-green-800',
      dotColor: 'bg-green-500',
    };
  }

  if (healthKit.isAvailable && healthKit.hasRequestedAuthorization === false) {
    return {
      icon: '🔒',
      label: 'Permission Required',
      description: 'HealthKit access needs to be granted',
      color: 'bg-blue-100 border-blue-300 text-blue-800',
      dotColor: 'bg-blue-500',
    };
  }

  return {
    icon: '❌',
    label: 'HealthKit Unavailable',
    description: 'HealthKit is not supported on this device',
    color: 'bg-red-100 border-red-300 text-red-800',
    dotColor: 'bg-red-500',
  };
};

const handleSyncLogic = async (params: {
  fallback: any;
  healthKit: any;
  refreshExperience: () => Promise<void>;
  setIsSyncing: (value: boolean) => void;
}) => {
  const { fallback, healthKit, refreshExperience, setIsSyncing } = params;

  if (fallback.shouldUseManualEntry && fallback.suggestion === 'force_manual') {
    Alert.alert(
      'HealthKit Not Supported',
      'This device does not support HealthKit. You can continue using manual step entry.',
      [{ text: 'OK' }]
    );
    return;
  }

  if (healthKit.isAvailable && healthKit.hasRequestedAuthorization === false) {
    Alert.alert(
      'HealthKit Permission Required',
      'To sync with HealthKit, you need to grant this app permission to access your health data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Grant Permission',
          onPress: () => healthKit.requestAuthorization(),
        },
      ]
    );
    return;
  }

  try {
    setIsSyncing(true);
    await refreshExperience();

    Alert.alert(
      'Sync Complete',
      'HealthKit data has been synchronized with your local storage.'
    );
  } catch (error) {
    Alert.alert(
      'Sync Failed',
      'There was an error syncing HealthKit data. Please try again.'
    );
  } finally {
    setIsSyncing(false);
  }
};

// Status display component
const StatusDisplay = ({ statusInfo }: { statusInfo: any }) => (
  <View
    className={`rounded-lg border-2 p-4 ${statusInfo.color} dark:border-neutral-600 dark:bg-neutral-800`}
  >
    <View className="flex-row items-center space-x-3">
      <Text className="text-2xl">{statusInfo.icon}</Text>
      <View className="flex-1">
        <View className="flex-row items-center space-x-2">
          <View className={`size-3 rounded-full ${statusInfo.dotColor}`} />
          <Text className="font-semibold">{statusInfo.label}</Text>
        </View>
        <Text className="text-sm opacity-80">{statusInfo.description}</Text>
      </View>
    </View>
  </View>
);

// Sync button component
const SyncButton = ({
  isSyncing,
  onPress,
  disabled,
}: {
  isSyncing: boolean;
  onPress: () => void;
  disabled: boolean;
}) => (
  <Button
    fullWidth
    label={isSyncing ? 'Syncing...' : 'Sync HealthKit Data'}
    onPress={onPress}
    disabled={disabled}
    size="sm"
  />
);

const HealthKitSyncSection = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const { refreshExperience } = useExperienceData();
  const healthKit = useHealthKit();
  const fallback = useHealthKitFallback();

  const handleSync = () => {
    handleSyncLogic({ fallback, healthKit, refreshExperience, setIsSyncing });
  };

  const statusInfo = useMemo(
    () => getStatusInfo(fallback, healthKit),
    [
      fallback.isLoading,
      fallback.shouldUseManualEntry,
      fallback.suggestion,
      fallback.reason,
      healthKit.isAvailable,
      healthKit.hasRequestedAuthorization,
      fallback,
      healthKit,
    ]
  );

  return (
    <View className="space-y-4">
      <Text className="text-lg font-semibold">HealthKit Sync</Text>
      <StatusDisplay statusInfo={statusInfo} />
      <SyncButton
        isSyncing={isSyncing}
        onPress={handleSync}
        disabled={
          isSyncing || (fallback.shouldUseManualEntry && !healthKit.isAvailable)
        }
      />
      {fallback.shouldUseManualEntry && (
        <Text className="text-sm text-gray-600 dark:text-gray-400">
          Note: Manual step entry mode is currently active. HealthKit sync may
          be limited.
        </Text>
      )}
    </View>
  );
};

export default HealthKitSyncSection;
