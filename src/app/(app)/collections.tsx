import { Stack } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { CollectionOverviewRN } from '@/components/delvers-descent/collection/collection-overview-rn';
import { ProgressionNavigation } from '@/components/delvers-descent/progression/progression-navigation';
import { BonusManager } from '@/lib/delvers-descent/bonus-manager';
import { CollectionManager } from '@/lib/delvers-descent/collection-manager';
import { ALL_COLLECTION_SETS } from '@/lib/delvers-descent/collection-sets';
export default function CollectionsScreen() {
  // Initialize CollectionManager and BonusManager
  const collectionManager = useMemo(
    () => new CollectionManager(ALL_COLLECTION_SETS),
    []
  );

  const bonusManager = useMemo(
    () => new BonusManager(collectionManager),
    [collectionManager]
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Collections',
          headerShown: true,
        }}
      />
      <View className="flex-1 bg-gray-50">
        <ProgressionNavigation currentScreen="collections" />
        <ActiveBonusesSection bonusManager={bonusManager} />
        <CollectionOverviewRN collectionManager={collectionManager} />
      </View>
    </>
  );
}

const ActiveBonusesSection: React.FC<{
  bonusManager: BonusManager;
}> = ({ bonusManager }) => {
  const [activeBonuses, setActiveBonuses] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadBonuses = async () => {
      try {
        const summary = await bonusManager.getBonusSummary();
        setActiveBonuses(summary.activeBonuses);
      } catch (error) {
        console.error('Failed to load active bonuses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBonuses();
  }, [bonusManager]);

  if (loading || activeBonuses.length === 0) {
    return null;
  }

  return (
    <View className="border-b border-gray-200 bg-green-50 p-4">
      <Text className="mb-2 text-lg font-semibold text-gray-800">
        Active Bonuses
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-3">
          {activeBonuses.map((bonus, index) => (
            <View
              key={`${bonus.source}-${index}`}
              className="rounded-lg border border-green-300 bg-white p-3"
            >
              <Text className="text-sm font-semibold text-gray-800">
                {bonus.description}
              </Text>
              <Text className="mt-1 text-xs text-gray-600">
                Type: {bonus.type}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};
