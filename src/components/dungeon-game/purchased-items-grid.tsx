import React from 'react';
import { ScrollView, Text, View } from 'react-native';

// Define shop items for display
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

export interface PurchasedItem {
  id: string;
  quantity: number;
}

interface PurchasedItemsGridProps {
  purchasedItems: PurchasedItem[];
  title?: string;
  className?: string;
}

export function PurchasedItemsGrid({
  purchasedItems,
  title = '🎒 Inventory',
  className = 'mx-4 mt-3 rounded-lg bg-[#F5F0E8] p-4',
}: PurchasedItemsGridProps) {
  if (purchasedItems.length === 0) {
    return null;
  }

  const purchasedItemsData = purchasedItems
    .map((item) => {
      const shopItem = SHOP_ITEMS.find((shopItem) => shopItem.id === item.id);
      return shopItem ? { ...shopItem, quantity: item.quantity } : null;
    })
    .filter(Boolean);

  return (
    <View className={className}>
      <Text className="mb-3 text-center text-sm font-semibold text-[#6B5F57]">
        {title}
      </Text>
      <ScrollView
        horizontal={false}
        showsVerticalScrollIndicator={false}
        className="max-h-32"
      >
        <View className="flex-row flex-wrap justify-between">
          {purchasedItemsData.map((item, index) => (
            <View
              key={item?.id || index}
              className="mb-2 w-[22%] items-center rounded-lg bg-white/60 p-2"
            >
              <View className="relative">
                <Text className="text-lg">{item?.icon}</Text>
                {item && item.quantity > 1 && (
                  <View className="absolute -right-1 -top-1 size-5 items-center justify-center rounded-full bg-red-500">
                    <Text className="text-xs font-bold text-white">
                      {item.quantity}
                    </Text>
                  </View>
                )}
              </View>
              <Text className="text-center text-xs font-medium text-[#6B5F57]">
                {item?.name}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
