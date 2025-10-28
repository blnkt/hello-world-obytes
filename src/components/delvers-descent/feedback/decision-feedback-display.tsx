/**
 * Decision Feedback Display
 * UI component for displaying decision feedback to players
 */

import { Text, View } from 'react-native';

import type { DecisionFeedback } from '@/lib/delvers-descent/decision-feedback';

interface DecisionFeedbackDisplayProps {
  feedback: DecisionFeedback;
}

export function DecisionFeedbackDisplay({
  feedback,
}: DecisionFeedbackDisplayProps) {
  const getColor = () => {
    switch (feedback.type) {
      case 'positive':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'danger':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <View className="rounded-lg bg-gray-100 p-4">
      <Text className={`text-lg font-semibold ${getColor()}`}>
        {feedback.message}
      </Text>
    </View>
  );
}
