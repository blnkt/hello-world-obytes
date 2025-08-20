import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { useItemEffects } from '@/lib/item-effects';
import { consumeItem } from '@/lib/storage';

// Define shop items for display
const SHOP_ITEMS = [
  {
    id: 'potion-energy',
    name: 'Potion of Energy',
    description: 'Gives 2 bonus turns for 3 minutes',
    price: 100,
    icon: '🏅',
  },
  {
    id: 'wooden-sword',
    name: 'Wooden Sword',
    description: 'Reduces turn cost by 50% for 3 minutes',
    price: 250,
    icon: '🗡️',
  },
  {
    id: 'shield',
    name: 'Shield',
    description: 'Provides trap immunity for 3 minutes',
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
  showActiveEffects?: boolean;
  onItemActivated?: (itemId: string) => void;
}

// Separate component for active effects display
function ActiveEffectsSection({
  activeEffects,
  formatRemainingTime,
}: {
  activeEffects: any[];
  formatRemainingTime: (effect: any) => string;
}) {
  if (activeEffects.length === 0) return null;

  return (
    <View className="mb-3">
      <Text className="mb-2 text-center text-xs font-medium text-[#6B5F57]">
        ⚡ Active Effects
      </Text>
      <View className="flex-row flex-wrap justify-start">
        {activeEffects.map((effect) => (
          <View
            key={effect.id}
            className="mb-2 mr-2 w-16 items-center rounded-lg bg-blue-100 p-2"
          >
            <View className="relative">
              <Text className="text-lg">{effect.itemIcon}</Text>
              <View className="absolute -right-1 -top-1 size-5 items-center justify-center rounded-full bg-blue-500">
                <Text className="text-xs font-bold text-white">
                  {formatRemainingTime(effect).split(':')[0]}
                </Text>
              </View>
            </View>
            <Text className="text-center text-xs font-medium text-blue-700">
              {effect.itemName}
            </Text>
            <Text className="text-center text-xs text-blue-600">
              {formatRemainingTime(effect)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// Separate component for purchased items display
function PurchasedItemsSection({
  items,
  onItemActivation,
}: {
  items: any[];
  onItemActivation: (
    itemId: string,
    itemName: string,
    itemIcon: string
  ) => void;
}) {
  if (items.length === 0) return null;

  return (
    <ScrollView
      horizontal={false}
      showsVerticalScrollIndicator={false}
      className="max-h-32"
    >
      <View className="flex-row flex-wrap justify-between">
        {items.map((item, index) => (
          <Pressable
            key={`${item?.id}-${index}`}
            onPress={() => onItemActivation(item!.id, item!.name, item!.icon)}
            className="mb-2 w-[22%] items-center rounded-lg bg-white/60 p-2 active:bg-white/80"
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
            <Text className="text-center text-xs text-blue-600">
              Tap to use
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

export function PurchasedItemsGrid({
  purchasedItems,
  title = '🎒 Inventory',
  className = 'mx-4 mt-3 rounded-lg bg-[#F5F0E8] p-4',
  showActiveEffects = false,
  onItemActivated,
}: PurchasedItemsGridProps) {
  // All hooks must be called at the top level, unconditionally
  const { activeEffects, activateItemEffect, formatRemainingTime } =
    useItemEffects();

  // Prepare data
  const purchasedItemsData = React.useMemo(() => {
    return purchasedItems
      .map((item) => {
        const shopItem = SHOP_ITEMS.find((item) => item.id === item.id);
        return shopItem ? { ...shopItem, quantity: item.quantity } : null;
      })
      .filter(Boolean);
  }, [purchasedItems]);

  // Create item activation handler
  const handleItemActivation = React.useCallback(
    async (itemId: string, itemName: string, itemIcon: string) => {
      const success = await consumeItem(itemId);
      if (success) {
        activateItemEffect(itemId, itemName, itemIcon);
        if (onItemActivated) {
          onItemActivated(itemId);
        }
      }
    },
    [consumeItem, activateItemEffect, onItemActivated]
  );

  // Early return after all hooks have been called
  if (
    purchasedItems.length === 0 &&
    (!showActiveEffects || activeEffects.length === 0)
  ) {
    return null;
  }

  return (
    <View className={className}>
      <Text className="mb-3 text-center text-sm font-semibold text-[#6B5F57]">
        {title}
      </Text>

      {/* Active Effects Section */}
      {showActiveEffects && (
        <ActiveEffectsSection
          activeEffects={activeEffects}
          formatRemainingTime={formatRemainingTime}
        />
      )}

      {/* Purchased Items Section */}
      <PurchasedItemsSection
        items={purchasedItemsData}
        onItemActivation={handleItemActivation}
      />
    </View>
  );
}
