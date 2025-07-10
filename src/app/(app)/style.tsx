/**
 * DEMO SCREEN - CAN BE SAFELY DELETED
 *
 * This is a development/demo screen that showcases UI components.
 * It's not accessible to users (href: null in tab layout).
 *
 * Used components that can also be deleted:
 * - src/components/buttons.tsx
 * - src/components/colors.tsx
 * - src/components/inputs.tsx
 * - src/components/typography.tsx
 */
import * as React from 'react';

import { Buttons } from '@/components/buttons';
import { Colors } from '@/components/colors';
import { Inputs } from '@/components/inputs';
import { Typography } from '@/components/typography';
import { FocusAwareStatusBar, SafeAreaView, ScrollView } from '@/components/ui';

export default function Style() {
  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView className="px-4">
        <SafeAreaView className="flex-1">
          <Typography />
          <Colors />
          <Buttons />
          <Inputs />
        </SafeAreaView>
      </ScrollView>
    </>
  );
}
