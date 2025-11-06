# Tasks: Avatar Collection Unlock System

## Relevant Files

- `src/types/avatar.ts` - Avatar-related type definitions (AvatarPart, AvatarPartType, AvatarCollectionSet, EquippedAvatarParts)
- `src/types/avatar.test.ts` - Unit tests for avatar types
- `src/lib/delvers-descent/avatar-collection-sets.ts` - Avatar collection set definitions (12 sets: 4 head, 4 torso, 4 leg)
- `src/lib/delvers-descent/avatar-collection-sets.test.ts` - Unit tests for avatar collection sets
- `src/components/character/character-avatar.tsx` - Updated to dynamically load avatar parts based on equippedAvatarParts
- `src/components/character/character-avatar.test.tsx` - Unit tests for CharacterAvatar component
- `src/components/character/character-sheet.tsx` - Updated with navigation button to avatar customization screen
- `src/types/character.ts` - Character type definition, needs extension to include equipped avatar parts
- `src/types/character.test.ts` - Unit tests for character type extensions
- `src/lib/delvers-descent/avatar-collection-sets.ts` - New file for avatar collection set definitions
- `src/lib/delvers-descent/avatar-collection-manager.ts` - New file for AvatarCollectionManager class
- `src/lib/delvers-descent/avatar-collection-manager.test.ts` - Unit tests for AvatarCollectionManager
- `src/lib/storage.tsx` - Character storage functions, needs updates for avatar parts persistence
- `src/components/character/character-avatar.tsx` - Avatar display component, needs updates for dynamic loading
- `src/components/character/character-avatar.test.tsx` - Unit tests for CharacterAvatar component
- `src/components/character/character-sheet.tsx` - Character sheet component, needs navigation to customization screen
- `src/components/character/avatar-customization.tsx` - New component for avatar customization screen
- `src/components/character/avatar-customization.test.tsx` - Unit tests for avatar customization screen
- `src/app/(app)/avatar-customization.tsx` - New screen route for avatar customization
- `src/components/delvers-descent/collection/collection-overview.tsx` - Collection UI, needs updates to show avatar sets
- `assets/avatar/` - New directory for avatar part images (placeholder assets)
- `src/lib/delvers-descent/collection-manager.ts` - CollectionManager for item tracking (integration point)

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `pnpm test [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [x] 1.0 Define Avatar Collection Sets and Data Structures
  - [x] 1.1 Create `src/types/avatar.ts` with type definitions for AvatarPart, AvatarPartType, and AvatarCollectionSet
  - [x] 1.2 Define AvatarPartType as union type: 'head' | 'torso' | 'legs'
  - [x] 1.3 Create AvatarPart interface with id, name, description, partType, assetPath, and setId fields
  - [x] 1.4 Create AvatarCollectionSet interface extending CollectionSet structure with avatarPartId field
  - [x] 1.5 Create EquippedAvatarParts interface with headId, torsoId, and legsId fields
  - [x] 1.6 Create `src/lib/delvers-descent/avatar-collection-sets.ts` file for avatar set definitions
  - [x] 1.7 Define 3-4 head collection sets (e.g., "Warrior Helmet Set", "Mage Hat Set", "Rogue Hood Set", "Crown Set")
  - [x] 1.8 Define 3-4 torso collection sets (e.g., "Warrior Armor Set", "Mage Robe Set", "Ranger Cloak Set", "Royal Garment Set")
  - [x] 1.9 Define 3-4 leg collection sets (e.g., "Warrior Boots Set", "Mage Sandals Set", "Ranger Leggings Set", "Noble Pants Set")
  - [x] 1.10 Create ALL_AVATAR_COLLECTION_SETS constant array containing all avatar sets
  - [x] 1.11 Add helper functions to get avatar sets by part type (getAvatarSetsByPartType)
  - [x] 1.12 Write unit tests for avatar type definitions
  - [x] 1.13 Write unit tests for avatar collection set definitions

- [x] 2.0 Implement AvatarCollectionManager
  - [x] 2.1 Create `src/lib/delvers-descent/avatar-collection-manager.ts` file
  - [x] 2.2 Implement AvatarCollectionManager class with CollectionManager dependency
  - [x] 2.3 Add storage keys for unlocked avatar parts and equipped avatar parts
  - [x] 2.4 Implement loadState() method to load unlocked and equipped parts from storage
  - [x] 2.5 Implement saveState() method to persist unlocked and equipped parts
  - [x] 2.6 Implement getUnlockedAvatarParts() method returning unlocked part IDs by category
  - [x] 2.7 Implement isAvatarPartUnlocked(partId: string) method
  - [x] 2.8 Implement unlockAvatarPart(partId: string) method
  - [x] 2.9 Implement getEquippedAvatarParts() method returning currently equipped parts
  - [x] 2.10 Implement equipAvatarPart(partType: AvatarPartType, partId: string) method
  - [x] 2.11 Implement checkForAvatarUnlocks() method that checks CollectionManager for completed avatar sets
  - [x] 2.12 Implement automatic unlock detection when collection sets complete
  - [x] 2.13 Ensure default avatar parts ('default_head', 'default_torso', 'default_legs') are unlocked by default
  - [x] 2.14 Write comprehensive unit tests for AvatarCollectionManager
  - [x] 2.15 Write integration tests with CollectionManager

- [x] 3.0 Extend Character Type and Storage for Avatar Parts
  - [x] 3.1 Extend Character type in `src/types/character.ts` to include equippedAvatarParts field (EquippedAvatarParts type)
  - [x] 3.2 Update getCharacter() in `src/lib/storage.tsx` to handle equippedAvatarParts field
  - [x] 3.3 Update setCharacter() to persist equippedAvatarParts
  - [x] 3.4 Ensure default avatar parts are set when creating new character (head: 'default_head', torso: 'default_torso', legs: 'default_legs')
  - [x] 3.5 Update character migration logic if needed to handle avatar parts for existing characters
  - [x] 3.6 Write unit tests for character type extensions
  - [x] 3.7 Write unit tests for character storage with avatar parts
  - [x] 3.8 Write migration tests for existing characters getting default avatar parts

- [x] 4.0 Update CharacterAvatar Component for Dynamic Parts
  - [x] 4.1 Update `src/components/character/character-avatar.tsx` to accept equippedAvatarParts prop
  - [x] 4.2 Create getAvatarImagePath() helper function to resolve image paths from part IDs
  - [x] 4.3 Update Image components to dynamically load images based on equipped parts
  - [x] 4.4 Implement fallback to default images if part ID not found or image fails to load
  - [x] 4.5 Support placeholder asset loading with consistent naming convention
  - [x] 4.6 Update component to use character.equippedAvatarParts if available, otherwise use defaults
  - [x] 4.7 Ensure component handles missing or invalid part IDs gracefully
  - [x] 4.8 Write unit tests for dynamic image loading
  - [x] 4.9 Write unit tests for fallback behavior
  - [x] 4.10 Test component with various equipped part combinations
  - [x] 4.11 Add navigation button/link from character sheet to avatar customization screen

- [x] 5.0 Create Avatar Customization Screen
  - [x] 5.1 Create `src/components/character/avatar-customization.tsx` component
  - [x] 5.2 Create `src/app/(app)/avatar-customization.tsx` screen route
  - [x] 5.3 Add route to app navigation in `src/app/_layout.tsx` or appropriate layout file
  - [x] 5.4 Implement screen layout with category tabs or sections (Heads, Torsos, Legs)
  - [x] 5.5 Display unlocked avatar parts in grid/list view with preview images
  - [x] 5.6 Display locked avatar parts with progress indicators (e.g., "3/5 items collected")
  - [x] 5.7 Implement part selection functionality with visual feedback
  - [x] 5.8 Create preview area showing selected parts combined
  - [x] 5.9 Implement "Equip" button to save selected parts to character
  - [x] 5.10 Add "Cancel" or "Back" button to return without saving
  - [x] 5.11 Integrate with AvatarCollectionManager to get unlocked parts and progress
  - [x] 5.12 Integrate with Character storage to save equipped parts
  - [x] 5.13 Add visual indicators for currently equipped parts
  - [x] 5.14 Write unit tests for AvatarCustomization component
  - [x] 5.15 Write integration tests for customization flow

- [ ] 6.0 Integrate Avatar Collections with Existing Collection System
  - [ ] 6.1 Update CollectionManager or reward generation to include avatar collection set items
  - [ ] 6.2 Ensure avatar items can be collected during runs (same as region unlock items)
  - [ ] 6.3 Update encounter reward generation to potentially provide avatar set items
  - [ ] 6.4 Integrate AvatarCollectionManager.checkForAvatarUnlocks() with CollectionManager.setCompletion detection
  - [ ] 6.5 Update `src/components/delvers-descent/collection/collection-overview.tsx` to display avatar collection sets
  - [ ] 6.6 Add avatar sets section to collection UI alongside region unlock sets
  - [ ] 6.7 Show progress for avatar collection sets (items collected / total items)
  - [ ] 6.8 Display unlocked avatar parts in collection overview
  - [ ] 6.9 Add navigation from collection overview to avatar customization screen
  - [ ] 6.10 Write unit tests for avatar collection integration
  - [ ] 6.11 Write integration tests for avatar unlocks triggered by collection completion

- [ ] 7.0 Create Placeholder Assets and Asset Management
  - [ ] 7.1 Create `assets/avatar/` directory structure
  - [ ] 7.2 Create `assets/avatar/heads/` subdirectory
  - [ ] 7.3 Create `assets/avatar/torsos/` subdirectory
  - [ ] 7.4 Create `assets/avatar/legs/` subdirectory
  - [ ] 7.5 Create placeholder image for default head (or use existing head.png)
  - [ ] 7.6 Create placeholder images for each head collection set (e.g., `head_warrior_placeholder.png`)
  - [ ] 7.7 Create placeholder images for each torso collection set (e.g., `torso_warrior_placeholder.png`)
  - [ ] 7.8 Create placeholder images for each leg collection set (e.g., `legs_warrior_placeholder.png`)
  - [ ] 7.9 Ensure placeholder naming follows convention: `{partType}_{setname}_placeholder.png`
  - [ ] 7.10 Create asset mapping helper function to map part IDs to asset paths
  - [ ] 7.11 Document placeholder asset specifications for future art replacement
  - [ ] 7.12 Test asset loading with all placeholder images
  - [ ] 7.13 Verify assets are included in app bundle
