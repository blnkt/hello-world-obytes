import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { useCurrencySystem } from '../../lib/health';
import { useLastCheckedDate } from '../../lib/storage';

const ShopScreen = () => {
  const [lastCheckedDate] = useLastCheckedDate();
  const lastCheckedDateTime = lastCheckedDate
    ? new Date(lastCheckedDate)
    : (() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
      })();
  const { currency } = useCurrencySystem(lastCheckedDateTime);

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="p-4">
        <Text className="mb-4 text-center text-2xl font-bold text-gray-900 dark:text-white">
          🛒 Shop
        </Text>
        <View className="mb-6 flex-row items-center justify-center">
          <Text className="mr-1 text-lg font-bold text-yellow-500">
            {currency}
          </Text>
          <Text className="text-base text-yellow-400">💰</Text>
        </View>
        <View className="mb-4 rounded-xl bg-white/10 p-4">
          <Text className="mb-2 text-center text-white/80">
            Shop Items (coming soon):
          </Text>
          <View className="mb-2 rounded bg-white/20 p-3">
            <Text className="text-white/80">
              🏅 Potion of Energy (100 coins)
            </Text>
          </View>
          <View className="mb-2 rounded bg-white/20 p-3">
            <Text className="text-white/80">🗡️ Wooden Sword (250 coins)</Text>
          </View>
          <View className="mb-2 rounded bg-white/20 p-3">
            <Text className="text-white/80">🛡️ Shield (300 coins)</Text>
          </View>
          <Text className="mt-2 text-center text-xs text-white/60">
            More items and purchasing coming soon!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default ShopScreen;
