import * as React from 'react';

import { Pressable, Text, View } from '@/components/ui';
import { ArrowRight } from '@/components/ui/icons';
import type { TxKeyPath } from '@/lib/i18n/utils';

type ItemProps = {
  text: TxKeyPath;
  value?: string;
  onPress?: () => void;
  icon?: React.ReactNode;
};

export const Item = ({ text, value, icon, onPress }: ItemProps) => {
  const isPressable = onPress !== undefined;
  return (
    <Pressable
      onPress={onPress}
      pointerEvents={isPressable ? 'auto' : 'none'}
      className="flex-1 flex-row items-center justify-between px-4 py-2"
    >
      <View className="flex-row items-center">
        {icon && <View className="pr-2">{icon}</View>}
        <Text tx={text} />
      </View>
      <View className="flex-row items-center">
        <Text className="text-neutral-600 dark:text-white">{value}</Text>
        {isPressable && (
          <View className="pl-2">
            <ArrowRight />
          </View>
        )}
      </View>
    </Pressable>
  );
};
