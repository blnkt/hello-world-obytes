import * as React from 'react';
import { Modal, View } from 'react-native';

import { Button } from './button';
import { Text } from './text';

export interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="mx-4 max-w-sm rounded-xl bg-white p-6 dark:bg-neutral-800">
          <Text className="mb-2 text-center text-xl font-bold dark:text-white">
            {title}
          </Text>
          <Text className="mb-6 text-center text-base text-neutral-600 dark:text-neutral-300">
            {message}
          </Text>
          <View className="flex-row space-x-3">
            <Button variant="outline" onPress={onCancel} className="flex-1">
              <Text>{cancelText}</Text>
            </Button>
            <Button onPress={onConfirm} className="flex-1">
              <Text>{confirmText}</Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};
