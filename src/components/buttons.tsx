/**
 * DEMO COMPONENT - CAN BE SAFELY DELETED
 *
 * This component is only used in the demo style screen.
 * It showcases button variants and can be removed along with:
 * - src/app/(app)/style.tsx
 * - src/components/colors.tsx
 * - src/components/inputs.tsx
 * - src/components/typography.tsx
 */
import React from 'react';

import { Button, View } from '@/components/ui';

import { Title } from './title';

export const Buttons = () => {
  return (
    <>
      <Title text="Buttons" />
      <View className="space-y-4">
        <Button label="Primary" />
        <Button label="Secondary" variant="outline" />
        <Button label="Danger" variant="destructive" />
        <Button label="Disabled" disabled />
        <Button label="Loading" loading />
        <Button label="Small" size="sm" />
        <Button label="Large" size="lg" />
        <Button label="Full Width" fullWidth />
      </View>
    </>
  );
};
