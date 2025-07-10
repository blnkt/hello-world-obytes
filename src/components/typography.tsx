/**
 * DEMO COMPONENT - CAN BE SAFELY DELETED
 *
 * This component is only used in the demo style screen.
 * It showcases typography variants and can be removed along with:
 * - src/app/(app)/style.tsx
 * - src/components/buttons.tsx
 * - src/components/colors.tsx
 * - src/components/inputs.tsx
 */
import React from 'react';

import { Text, View } from '@/components/ui';

import { Title } from './title';

export const Typography = () => {
  return (
    <>
      <Title text="Typography" />
      <View className="space-y-4">
        <Text className="text-xs">Text XS</Text>
        <Text className="text-sm">Text SM</Text>
        <Text className="text-base">Text Base</Text>
        <Text className="text-lg">Text LG</Text>
        <Text className="text-xl">Text XL</Text>
        <Text className="text-2xl">Text 2XL</Text>
        <Text className="text-3xl">Text 3XL</Text>
        <Text className="font-bold">Bold Text</Text>
        <Text className="italic">Italic Text</Text>
        <Text className="underline">Underlined Text</Text>
      </View>
    </>
  );
};
