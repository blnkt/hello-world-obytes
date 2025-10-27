import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import type { Shortcut } from '@/types/delvers-descent';

export interface ShortcutVisualizationProps {
  shortcuts: Shortcut[];
}

/**
 * ShortcutVisualization - Visual shortcut indicators
 *
 * Displays discovered shortcuts with their depth range, energy savings,
 * and permanence status.
 */
export const ShortcutVisualization: React.FC<ShortcutVisualizationProps> = ({
  shortcuts,
}) => {
  if (shortcuts.length === 0) {
    return (
      <View testID="shortcut-visualization" className="rounded-lg bg-white p-4">
        <Text className="text-center text-sm text-gray-600">
          No shortcuts discovered yet
        </Text>
      </View>
    );
  }

  return (
    <ScrollView testID="shortcut-visualization" className="gap-3">
      {shortcuts.map((shortcut) => {
        const depthRange = Math.abs(shortcut.toDepth - shortcut.fromDepth);
        const isHighSaving = shortcut.energyReduction >= 15;

        return (
          <View
            key={shortcut.id}
            className={`rounded-lg border-2 p-3 ${
              isHighSaving
                ? 'border-green-400 bg-green-50'
                : 'border-blue-300 bg-blue-50'
            }`}
          >
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-gray-700">
                Shortcut to Depth {shortcut.toDepth}
              </Text>
              {shortcut.isPermanent && (
                <View className="rounded-full bg-purple-500 px-2 py-1">
                  <Text className="text-xs font-semibold text-white">
                    Permanent
                  </Text>
                </View>
              )}
            </View>

            <View className="flex-row items-center gap-4">
              <View className="flex-1">
                <Text className="text-xs text-gray-600">
                  From Depth {shortcut.fromDepth} → {shortcut.toDepth}
                </Text>
                <Text className="text-xs text-gray-500">
                  Range: {depthRange} levels
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-sm font-semibold text-green-600">
                  -{shortcut.energyReduction}
                </Text>
                <Text className="text-xs text-gray-600">energy</Text>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};
