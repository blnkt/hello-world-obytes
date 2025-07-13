import React from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useCurrencySystem } from '../../lib/health';
import {
  addPurchasedItem,
  useLastCheckedDate,
  usePurchasedItems,
} from '../../lib/storage';

// Define shop items
const SHOP_ITEMS = [
  {
    id: 'potion-energy',
    name: 'Potion of Energy',
    description: 'Restores your energy and motivation',
    price: 100,
    icon: '🏅',
  },
  {
    id: 'wooden-sword',
    name: 'Wooden Sword',
    description: 'A basic weapon for your adventures',
    price: 250,
    icon: '🗡️',
  },
  {
    id: 'shield',
    name: 'Shield',
    description: 'Protects you from harm',
    price: 300,
    icon: '🛡️',
  },
];

const ShopItem = ({
  item,
  onPurchase,
  canAfford,
}: {
  item: (typeof SHOP_ITEMS)[0];
  onPurchase: (item: (typeof SHOP_ITEMS)[0]) => void;
  canAfford: boolean;
}) => (
  <View className="mb-3 rounded-lg bg-white/20 p-4">
    <View className="flex-row items-center justify-between">
      <View className="flex-1">
        <View className="mb-1 flex-row items-center">
          <Text className="mr-2 text-lg">{item.icon}</Text>
          <Text className="text-base font-semibold text-white">
            {item.name}
          </Text>
        </View>
        <Text className="mb-2 text-sm text-white/80">{item.description}</Text>
        <Text className="text-sm font-semibold text-yellow-300">
          {item.price} coins
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => onPurchase(item)}
        disabled={!canAfford}
        className={`rounded-lg px-4 py-2 ${
          canAfford
            ? 'bg-green-500 active:bg-green-600'
            : 'bg-gray-500 opacity-50'
        }`}
      >
        <Text className="text-sm font-semibold text-white">
          {canAfford ? 'Buy' : "Can't Afford"}
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

const handlePurchase = async (
  item: (typeof SHOP_ITEMS)[0],
  spend: (amount: number) => Promise<boolean>,
  addPurchasedItem: (itemId: string) => Promise<void>
) => {
  const success = await spend(item.price);

  if (success) {
    await addPurchasedItem(item.id);
    Alert.alert(
      'Purchase Successful!',
      `You bought ${item.name} for ${item.price} coins!`,
      [{ text: 'OK' }]
    );
  } else {
    Alert.alert(
      'Purchase Failed',
      "You don't have enough coins for this item.",
      [{ text: 'OK' }]
    );
  }
};

const PurchasedItemsSection = ({
  purchasedItems,
}: {
  purchasedItems: string[];
}) => {
  if (purchasedItems.length === 0) return null;

  return (
    <View className="rounded-xl bg-green-500/20 p-4">
      <Text className="mb-2 text-center font-semibold text-green-300">
        🎉 Purchased Items
      </Text>
      {purchasedItems.map((itemId) => {
        const item = SHOP_ITEMS.find((i) => i.id === itemId);
        return (
          <Text key={itemId} className="text-center text-sm text-green-200">
            {item?.icon} {item?.name}
          </Text>
        );
      })}
    </View>
  );
};

const ShopScreen = () => {
  const [lastCheckedDate] = useLastCheckedDate();
  const lastCheckedDateTime = lastCheckedDate
    ? new Date(lastCheckedDate)
    : (() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
      })();
  const { currency, spend } = useCurrencySystem(lastCheckedDateTime);
  const [purchasedItems] = usePurchasedItems();

  const onPurchase = (item: (typeof SHOP_ITEMS)[0]) => {
    handlePurchase(item, spend, addPurchasedItem);
  };

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
          <Text className="mb-4 text-center text-lg font-semibold text-white">
            Available Items
          </Text>
          {SHOP_ITEMS.map((item) => (
            <ShopItem
              key={item.id}
              item={item}
              onPurchase={onPurchase}
              canAfford={currency >= item.price}
            />
          ))}
        </View>

        <PurchasedItemsSection purchasedItems={purchasedItems} />
      </View>
    </ScrollView>
  );
};

export default ShopScreen;
