import React, { useCallback, useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/ui';
import { getAvatarImageSource } from '@/lib/avatar-assets';
import type { AvatarCollectionManager } from '@/lib/delvers-descent/avatar-collection-manager';
import {
  getAvatarCollectionSetByPartId,
  getAvatarSetsByPartType,
} from '@/lib/delvers-descent/avatar-collection-sets';
import type { CollectionManager } from '@/lib/delvers-descent/collection-manager';
import { setCharacter } from '@/lib/storage';
import type { AvatarPartType, EquippedAvatarParts } from '@/types/avatar';
import type { Character } from '@/types/character';

export type AvatarCustomizationProps = {
  character: Character;
  avatarCollectionManager: AvatarCollectionManager;
  onSave?: (equippedParts: EquippedAvatarParts) => void;
  onCancel?: () => void;
};

type TabType = 'head' | 'torso' | 'legs';

const PART_TYPE_DISPLAY_NAMES: Record<AvatarPartType, string> = {
  head: 'Heads',
  torso: 'Torsos',
  legs: 'Legs',
};

const DEFAULT_PART_NAMES: Record<string, string> = {
  default_head: 'Default Head',
  default_torso: 'Default Torso',
  default_legs: 'Default Legs',
};

function getPartName(partId: string): string {
  if (DEFAULT_PART_NAMES[partId]) {
    return DEFAULT_PART_NAMES[partId];
  }

  const set = getAvatarCollectionSetByPartId(partId);
  if (set) {
    return set.name.replace(' Set', '');
  }

  return partId;
}

function getPartProgress(
  partId: string,
  collectionProgress: Map<string, number>
): { collected: number; total: number } {
  const set = getAvatarCollectionSetByPartId(partId);
  if (!set) {
    return { collected: 0, total: 0 };
  }

  const collected = collectionProgress.get(set.id) || 0;
  return { collected, total: set.items.length };
}

type PartButtonProps = {
  partType: AvatarPartType;
  partId: string;
  isUnlocked: boolean;
  isSelected: boolean;
  isCurrentlyEquipped: boolean;
  onSelect: (partType: AvatarPartType, partId: string) => void;
  collectionProgress: Map<string, number>;
};

const PartButton: React.FC<PartButtonProps> = ({
  partType,
  partId,
  isUnlocked,
  isSelected,
  isCurrentlyEquipped,
  onSelect,
  collectionProgress,
}) => {
  const partName = getPartName(partId);
  const progress = getPartProgress(partId, collectionProgress);

  // Default parts are always unlocked, even if not in the list yet
  const isDefaultPart = partId.startsWith('default_');
  const canInteract = isUnlocked || isDefaultPart;

  return (
    <Pressable
      testID={`part-${partId}`}
      onPress={() => canInteract && onSelect(partType, partId)}
      disabled={!canInteract}
      className={`mb-2 rounded-lg border-2 p-4 ${
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
          : canInteract
            ? 'border-gray-300 bg-white dark:bg-gray-800'
            : 'border-gray-200 bg-gray-100 dark:bg-gray-700'
      } ${!canInteract ? 'opacity-60' : ''}`}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text
            className={`text-base font-semibold ${
              canInteract
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {partName}
          </Text>
          {isCurrentlyEquipped && (
            <Text className="mt-1 text-xs text-green-600 dark:text-green-400">
              Currently Equipped
            </Text>
          )}
          {!canInteract && (
            <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {progress.collected}/{progress.total} items collected
            </Text>
          )}
        </View>
        {isSelected && (
          <Text className="ml-2 text-blue-600 dark:text-blue-400">✓</Text>
        )}
      </View>
    </Pressable>
  );
};

type TabContentProps = {
  activeTab: TabType;
  unlockedParts: {
    head: string[];
    torso: string[];
    legs: string[];
  };
  selectedParts: EquippedAvatarParts;
  character: Character;
  onPartSelect: (partType: AvatarPartType, partId: string) => void;
  collectionProgress: Map<string, number>;
};

function getAllPartsForTab(activeTab: TabType): Set<string> {
  const sets = getAvatarSetsByPartType(activeTab);
  const allParts = new Set<string>();
  sets.forEach((set) => {
    if (set.avatarPartId) {
      allParts.add(set.avatarPartId);
    }
  });

  if (activeTab === 'head') {
    allParts.add('default_head');
  } else if (activeTab === 'torso') {
    allParts.add('default_torso');
  } else if (activeTab === 'legs') {
    allParts.add('default_legs');
  }

  return allParts;
}

function isPartSelected(
  activeTab: TabType,
  partId: string,
  selectedParts: EquippedAvatarParts
): boolean {
  return (
    (activeTab === 'head' && selectedParts.headId === partId) ||
    (activeTab === 'torso' && selectedParts.torsoId === partId) ||
    (activeTab === 'legs' && selectedParts.legsId === partId)
  );
}

function isPartCurrentlyEquipped(
  activeTab: TabType,
  partId: string,
  character: Character
): boolean {
  return (
    (activeTab === 'head' &&
      character.equippedAvatarParts?.headId === partId) ||
    (activeTab === 'torso' &&
      character.equippedAvatarParts?.torsoId === partId) ||
    (activeTab === 'legs' && character.equippedAvatarParts?.legsId === partId)
  );
}

const TabContent: React.FC<TabContentProps> = ({
  activeTab,
  unlockedParts,
  selectedParts,
  character,
  onPartSelect,
  collectionProgress,
}) => {
  const unlockedForTab = unlockedParts[activeTab] || [];
  const allParts = getAllPartsForTab(activeTab);

  return (
    <View className="py-4">
      {Array.from(allParts).map((partId) => {
        const isUnlocked = unlockedForTab.includes(partId);
        const isSelected = isPartSelected(activeTab, partId, selectedParts);
        const isCurrentlyEquipped = isPartCurrentlyEquipped(
          activeTab,
          partId,
          character
        );

        return (
          <PartButton
            key={partId}
            partType={activeTab}
            partId={partId}
            isUnlocked={isUnlocked}
            isSelected={isSelected}
            isCurrentlyEquipped={isCurrentlyEquipped}
            onSelect={onPartSelect}
            collectionProgress={collectionProgress}
          />
        );
      })}
    </View>
  );
};

type CustomizationHeaderProps = {
  selectedParts: EquippedAvatarParts;
  character: Character;
};

const CustomizationHeader: React.FC<CustomizationHeaderProps> = ({
  selectedParts,
  character,
}) => {
  // Get equipped avatar parts from character, or use defaults
  const equippedParts = selectedParts || {
    headId: 'default_head',
    torsoId: 'default_torso',
    legsId: 'default_legs',
  };

  // Get image sources for each part
  const headSource = getAvatarImageSource(equippedParts.headId, 'head');
  const torsoSource = getAvatarImageSource(equippedParts.torsoId, 'torso');
  const legsSource = getAvatarImageSource(equippedParts.legsId, 'legs');

  return (
    <>
      <View className="border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <Text className="text-xl font-bold text-gray-900 dark:text-white">
          Avatar Customization
        </Text>
      </View>

      <View className="items-center border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <View
          testID="avatar-preview"
          style={{ height: 180, width: '100%', maxWidth: 200 }}
        >
          <View className="size-full items-center justify-center">
            {/* Character body parts stacked vertically */}
            <View className="size-full">
              {/* Head */}
              <Image
                source={headSource}
                className="h-1/3 w-full"
                resizeMode="contain"
                testID="avatar-head"
              />

              {/* Torso */}
              <Image
                source={torsoSource}
                className="h-1/3 w-full"
                resizeMode="contain"
                testID="avatar-torso"
              />

              {/* Legs */}
              <Image
                source={legsSource}
                className="h-1/3 w-full"
                resizeMode="contain"
                testID="avatar-legs"
              />
            </View>
          </View>
        </View>
      </View>
    </>
  );
};

type TabBarProps = {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
};

const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <View className="flex-row border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      {(['head', 'torso', 'legs'] as TabType[]).map((tab) => (
        <Pressable
          key={tab}
          onPress={() => onTabChange(tab)}
          className={`flex-1 border-b-2 px-4 py-3 ${
            activeTab === tab ? 'border-blue-500' : 'border-transparent'
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              activeTab === tab
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {PART_TYPE_DISPLAY_NAMES[tab]}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

type ActionButtonsProps = {
  onCancel: () => void;
  onEquip: () => void;
};

const ActionButtons: React.FC<ActionButtonsProps> = ({ onCancel, onEquip }) => {
  return (
    <View className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <View className="flex-row space-x-4">
        <View className="flex-1">
          <Button label="Cancel" variant="outline" onPress={onCancel} />
        </View>
        <View className="flex-1">
          <Button label="Equip" variant="default" onPress={onEquip} />
        </View>
      </View>
    </View>
  );
};

type DevUnlockButtonProps = {
  avatarCollectionManager: AvatarCollectionManager;
  onUnlock: () => void;
};

const DevUnlockButton: React.FC<DevUnlockButtonProps> = ({
  avatarCollectionManager,
  onUnlock,
}) => {
  if (!__DEV__) {
    return null;
  }

  const handleUnlockAll = async () => {
    // Unlock one part from each category for testing
    await avatarCollectionManager.unlockAvatarPart('head_warrior_helmet');
    await avatarCollectionManager.unlockAvatarPart('torso_warrior_armor');
    await avatarCollectionManager.unlockAvatarPart('legs_warrior_boots');
    onUnlock();
  };

  return (
    <View className="border-t border-gray-200 bg-yellow-50 p-2 dark:border-gray-700 dark:bg-yellow-900">
      <Button
        label="[DEV] Unlock Test Parts"
        variant="outline"
        onPress={handleUnlockAll}
        className="border-yellow-500"
      />
    </View>
  );
};

function buildProgressMap(
  activeTab: TabType,
  progress: { partialSets?: { setId: string; collected: number }[] } | null
): Map<string, number> {
  const progressMap = new Map<string, number>();
  const sets = getAvatarSetsByPartType(activeTab);

  for (const set of sets) {
    const setProgress = progress?.partialSets?.find(
      (p: { setId: string }) => p.setId === set.id
    );
    if (setProgress) {
      progressMap.set(set.id, setProgress.collected);
    } else {
      progressMap.set(set.id, 0);
    }
  }

  return progressMap;
}

async function saveEquippedParts({
  character,
  selectedParts,
  avatarCollectionManager,
  onSave,
}: {
  character: Character;
  selectedParts: EquippedAvatarParts;
  avatarCollectionManager: AvatarCollectionManager;
  onSave?: (equippedParts: EquippedAvatarParts) => void;
}): Promise<void> {
  const updatedCharacter: Character = {
    ...character,
    equippedAvatarParts: selectedParts,
  };

  await setCharacter(updatedCharacter);

  await avatarCollectionManager.equipAvatarPart('head', selectedParts.headId);
  await avatarCollectionManager.equipAvatarPart('torso', selectedParts.torsoId);
  await avatarCollectionManager.equipAvatarPart('legs', selectedParts.legsId);

  if (onSave) {
    onSave(selectedParts);
  }
}

type CustomizationContentProps = {
  activeTab: TabType;
  selectedParts: EquippedAvatarParts;
  character: Character;
  unlockedParts: {
    head: string[];
    torso: string[];
    legs: string[];
  };
  collectionProgress: Map<string, number>;
  avatarCollectionManager: AvatarCollectionManager;
  onTabChange: (tab: TabType) => void;
  onPartSelect: (partType: AvatarPartType, partId: string) => void;
  onCancel: () => void;
  onEquip: () => void;
  onRefresh: () => void;
};

const CustomizationContent: React.FC<CustomizationContentProps> = ({
  activeTab,
  selectedParts,
  character,
  unlockedParts,
  collectionProgress,
  avatarCollectionManager,
  onTabChange,
  onPartSelect,
  onCancel,
  onEquip,
  onRefresh,
}) => {
  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <CustomizationHeader
        selectedParts={selectedParts}
        character={character}
      />
      <TabBar activeTab={activeTab} onTabChange={onTabChange} />
      <ScrollView className="flex-1 px-4">
        <TabContent
          activeTab={activeTab}
          unlockedParts={unlockedParts}
          selectedParts={selectedParts}
          character={character}
          onPartSelect={onPartSelect}
          collectionProgress={collectionProgress}
        />
      </ScrollView>
      <DevUnlockButton
        avatarCollectionManager={avatarCollectionManager}
        onUnlock={onRefresh}
      />
      <ActionButtons onCancel={onCancel} onEquip={onEquip} />
    </View>
  );
};

function getInitialSelectedParts(character: Character): EquippedAvatarParts {
  return (
    character.equippedAvatarParts || {
      headId: 'default_head',
      torsoId: 'default_torso',
      legsId: 'default_legs',
    }
  );
}

export const AvatarCustomization: React.FC<AvatarCustomizationProps> = ({
  character,
  avatarCollectionManager,
  onSave,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('head');
  const [unlockedParts, setUnlockedParts] = useState({
    head: ['default_head'],
    torso: ['default_torso'],
    legs: ['default_legs'],
  });
  const [selectedParts, setSelectedParts] = useState<EquippedAvatarParts>(
    getInitialSelectedParts(character)
  );
  const [collectionProgress, setCollectionProgress] = useState<
    Map<string, number>
  >(new Map());

  const loadData = useCallback(async () => {
    const unlocked = await avatarCollectionManager.getUnlockedAvatarParts();
    setUnlockedParts(unlocked);

    const collectionManager = (avatarCollectionManager as any)
      .collectionManager as CollectionManager;
    const progress = await collectionManager.getCollectionProgress();
    const progressMap = buildProgressMap(activeTab, progress);
    setCollectionProgress(progressMap);
  }, [activeTab, avatarCollectionManager]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePartSelect = useCallback(
    (partType: AvatarPartType, partId: string) => {
      setSelectedParts((prev) => ({
        ...prev,
        [`${partType}Id`]: partId,
      }));
    },
    []
  );

  const handleEquip = useCallback(async () => {
    await saveEquippedParts({
      character,
      selectedParts,
      avatarCollectionManager,
      onSave,
    });
  }, [character, selectedParts, avatarCollectionManager, onSave]);

  return (
    <CustomizationContent
      activeTab={activeTab}
      selectedParts={selectedParts}
      character={character}
      unlockedParts={unlockedParts}
      collectionProgress={collectionProgress}
      avatarCollectionManager={avatarCollectionManager}
      onTabChange={setActiveTab}
      onPartSelect={handlePartSelect}
      onCancel={onCancel || (() => {})}
      onEquip={handleEquip}
      onRefresh={loadData}
    />
  );
};
