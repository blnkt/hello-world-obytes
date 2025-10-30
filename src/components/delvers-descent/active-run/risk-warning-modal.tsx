import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

export interface RiskWarning {
  type: 'safe' | 'caution' | 'danger' | 'critical';
  message: string;
  severity: number;
}

export interface RiskWarningModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Warning to display */
  warning: RiskWarning;
  /** Callback when user confirms */
  onConfirm: () => void;
  /** Callback when user cancels */
  onCancel: () => void;
}

const getWarningStyles = (
  warningType: 'safe' | 'caution' | 'danger' | 'critical'
): {
  bgColor: string;
  borderColor: string;
  textColor: string;
  icon: string;
  confirmButtonColor: string;
} => {
  switch (warningType) {
    case 'safe':
      return {
        bgColor: 'bg-green-50 dark:bg-green-900',
        borderColor: 'border-green-500',
        textColor: 'text-green-700 dark:text-green-300',
        icon: '✓',
        confirmButtonColor: 'bg-green-500',
      };
    case 'caution':
      return {
        bgColor: 'bg-yellow-50 dark:bg-yellow-900',
        borderColor: 'border-yellow-500',
        textColor: 'text-yellow-700 dark:text-yellow-300',
        icon: '⚠️',
        confirmButtonColor: 'bg-yellow-500',
      };
    case 'danger':
      return {
        bgColor: 'bg-orange-50 dark:bg-orange-900',
        borderColor: 'border-orange-500',
        textColor: 'text-orange-700 dark:text-orange-300',
        icon: '⚠️',
        confirmButtonColor: 'bg-orange-500',
      };
    case 'critical':
      return {
        bgColor: 'bg-red-50 dark:bg-red-900',
        borderColor: 'border-red-500',
        textColor: 'text-red-700 dark:text-red-300',
        icon: '⚠️',
        confirmButtonColor: 'bg-red-500',
      };
  }
};

export const RiskWarningModal: React.FC<RiskWarningModalProps> = ({
  visible,
  warning,
  onConfirm,
  onCancel,
}) => {
  const warningStyles = getWarningStyles(warning.type);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View className="flex-1 items-center justify-center bg-black/50 p-4">
        <View
          className={`w-full max-w-md rounded-2xl border-2 ${warningStyles.bgColor} ${warningStyles.borderColor}`}
        >
          <View className="p-6">
            <View className="items-center">
              <View className="mb-4 size-16 items-center justify-center">
                <Text className="text-5xl">{warningStyles.icon}</Text>
              </View>
              <Text
                className={`mb-4 text-center text-xl font-bold ${warningStyles.textColor}`}
              >
                {warning.type.toUpperCase()} WARNING
              </Text>
              <Text className={`text-center ${warningStyles.textColor}`}>
                {warning.message}
              </Text>
              {warning.severity > 0 && (
                <View className="mt-4 rounded-lg bg-white/50 p-3 dark:bg-gray-800/50">
                  <Text className="text-center text-sm text-gray-600 dark:text-gray-300">
                    Severity: {warning.severity}/10
                  </Text>
                </View>
              )}
            </View>

            <View className="mt-6 flex-row gap-3">
              <Pressable
                onPress={onCancel}
                className="flex-1 rounded-lg border-2 border-gray-300 bg-white py-3 dark:border-gray-600 dark:bg-gray-700"
                testID="cancel-risk-warning"
              >
                <Text className="text-center font-semibold text-gray-700 dark:text-gray-200">
                  Go Back
                </Text>
              </Pressable>
              <Pressable
                onPress={onConfirm}
                className={`flex-1 rounded-lg py-3 ${warningStyles.confirmButtonColor}`}
                testID="confirm-risk-warning"
              >
                <Text className="text-center font-semibold text-white">
                  Continue Anyway
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
