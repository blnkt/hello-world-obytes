/**
 * DEMO COMPONENT - CAN BE SAFELY DELETED
 *
 * This component is only used in the demo style screen.
 * It showcases color variants and can be removed along with:
 * - src/app/(app)/style.tsx
 * - src/components/buttons.tsx
 * - src/components/inputs.tsx
 * - src/components/typography.tsx
 */
import React from 'react';

import { Text, View } from '@/components/ui';
import colors from '@/components/ui/colors';

import { Title } from './title';

type ColorName = keyof typeof colors;

export const Colors = () => {
  return (
    <>
      <Title text="Colors" />
      {(Object.keys(colors) as ColorName[]).map((name) => {
        if (typeof colors[name] === 'string') return null;
        return (
          <View key={name} className="mb-4">
            <Text className="mb-2 text-lg font-semibold">{name}</Text>
            <View className="flex-row flex-wrap">
              {Object.entries(colors[name]).map(([key, value]) => {
                return (
                  <View
                    key={`${colors[name]}-${key}`}
                    className="mb-2 mr-2 items-center"
                  >
                    <View
                      className="size-8 rounded"
                      style={{ backgroundColor: value }}
                    />
                    <Text className="mt-1 text-xs">{key}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
    </>
  );
};
