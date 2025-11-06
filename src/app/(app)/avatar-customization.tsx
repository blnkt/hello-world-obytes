import { useRouter } from 'expo-router';
import React from 'react';

import { AvatarCustomization } from '../../components/character/avatar-customization';
import { AvatarCollectionManager } from '../../lib/delvers-descent/avatar-collection-manager';
import { ALL_AVATAR_COLLECTION_SETS } from '../../lib/delvers-descent/avatar-collection-sets';
import { CollectionManager } from '../../lib/delvers-descent/collection-manager';
import { useCharacter } from '../../lib/storage';
import type { EquippedAvatarParts } from '../../types/avatar';

const collectionManager = new CollectionManager(ALL_AVATAR_COLLECTION_SETS);
const avatarCollectionManager = new AvatarCollectionManager(collectionManager);

export default function AvatarCustomizationScreen() {
  const router = useRouter();
  const [character] = useCharacter();

  const handleSave = async (_equippedParts: EquippedAvatarParts) => {
    // Character is already saved by AvatarCustomization component
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  if (!character) {
    return null; // Or show a loading/error state
  }

  return (
    <AvatarCustomization
      character={character}
      avatarCollectionManager={avatarCollectionManager}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
