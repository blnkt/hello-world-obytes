import React from 'react';
import { Modal, View } from 'react-native';

import { Button, Text } from '@/components/ui';

interface WinModalProps {
  visible: boolean;
  level: number;
  onNextLevel: () => void;
  onMainMenu: () => void;
}

interface GameOverModalProps {
  visible: boolean;
  level: number;
  turnsUsed: number;
  onMainMenu: () => void;
  onRetry: () => void;
}

export function WinModal({
  visible,
  level,
  onNextLevel,
  onMainMenu,
}: WinModalProps) {
  return (
    <Modal visible={visible} animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/50 p-4">
        <View className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
          {/* Header */}
          <View className="mb-6 items-center">
            <Text className="mb-2 text-6xl">🎉</Text>
            <Text className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              Level {level} Complete!
            </Text>
            <Text className="text-center text-gray-600 dark:text-gray-300">
              Congratulations! You found the exit and completed this level.
            </Text>
          </View>

          {/* Stats */}
          <View className="mb-6 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
            <Text className="text-center text-sm font-medium text-green-800 dark:text-green-200">
              Level {level} Mastered
            </Text>
            <Text className="text-center text-xs text-green-600 dark:text-green-300">
              Ready for the next challenge!
            </Text>
          </View>

          {/* Actions */}
          <View className="space-y-3">
            <Button
              label="Next Level"
              onPress={onNextLevel}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            />
            <Button
              label="Main Menu"
              onPress={onMainMenu}
              variant="outline"
              size="lg"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function GameOverModal({
  visible,
  level,
  turnsUsed,
  onMainMenu,
  onRetry,
}: GameOverModalProps) {
  return (
    <Modal visible={visible} animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/50 p-4">
        <View className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
          {/* Header */}
          <View className="mb-6 items-center">
            <Text className="mb-2 text-6xl">💀</Text>
            <Text className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              Game Over
            </Text>
            <Text className="text-center text-gray-600 dark:text-gray-300">
              You ran out of turns on Level {level}.
            </Text>
          </View>

          {/* Stats */}
          <View className="mb-6 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
            <Text className="text-center text-sm font-medium text-red-800 dark:text-red-200">
              Level {level} Failed
            </Text>
            <Text className="text-center text-xs text-red-600 dark:text-red-300">
              Turns used: {turnsUsed}
            </Text>
          </View>

          {/* Actions */}
          <View className="space-y-3">
            <Button
              label="Try Again"
              onPress={onRetry}
              size="lg"
              className="bg-orange-600 hover:bg-orange-700"
            />
            <Button
              label="Main Menu"
              onPress={onMainMenu}
              variant="outline"
              size="lg"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
