/**
 * Risk Warning Display
 * UI component for displaying risk warnings
 */

import { Text, View } from 'react-native';
export interface RiskWarning {
  shouldShow: boolean;
  message: string;
  severity: number;
  urgency: number;
}

interface RiskWarningDisplayProps {
  warning: RiskWarning;
}

export function RiskWarningDisplay({ warning }: RiskWarningDisplayProps) {
  if (!warning.shouldShow) {
    return null;
  }

  const getSeverityColor = () => {
    if (warning.severity >= 75) return 'bg-red-500';
    if (warning.severity >= 50) return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  return (
    <View className={`rounded-lg p-4 ${getSeverityColor()}`}>
      <Text className="text-lg font-bold text-white">⚠️ Risk Warning</Text>
      <Text className="mt-2 text-white">{warning.message}</Text>
    </View>
  );
}
