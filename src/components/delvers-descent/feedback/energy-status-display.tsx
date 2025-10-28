/**
 * Energy Status Display
 * UI component for displaying energy status with safety margins
 */

import { Text, View } from 'react-native';

import type { EnergyStatusData } from '@/lib/delvers-descent/energy-status-feedback';

interface EnergyStatusDisplayProps {
  status: EnergyStatusData;
}

export function EnergyStatusDisplay({ status }: EnergyStatusDisplayProps) {
  const getStatusColor = () => {
    switch (status.status) {
      case 'healthy':
        return 'text-green-500';
      case 'low':
        return 'text-yellow-500';
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <View className="rounded-lg bg-gray-100 p-4">
      <Text className={`text-lg font-semibold ${getStatusColor()}`}>
        Energy Status
      </Text>
      <Text className="mt-2 text-gray-700">{status.message}</Text>
    </View>
  );
}
