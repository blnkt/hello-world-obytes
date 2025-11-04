# PRD: Avatar Collection Unlock System

## Introduction/Overview

Currently, character avatars use a single default appearance (head.png, torso.png, legs.png) with no customization options. This feature implements a collection-based system for unlocking new avatar parts (heads, torsos, legs) through gameplay, similar to the existing region unlock system but separate and focused on character customization.

**Problem Solved:** Players have no way to customize their character's appearance despite collecting items throughout their runs. The game lacks a cosmetic progression system that allows players to visually express their achievements and collection progress.

**Goal:** Implement a collection-based avatar unlock system where players collect items from avatar-specific collection sets to unlock new head, torso, and leg options, allowing for mix-and-match customization of their character appearance.

## Goals

1. Create avatar-specific collection sets separate from region unlock sets
2. Implement collection sets for unlocking individual avatar parts (heads, torsos, legs)
3. Allow players to mix and match unlocked avatar parts from different sets
4. Integrate avatar customization UI with existing character sheet
5. Use placeholder assets initially (to be replaced with final art later)
6. Maintain the current default avatar as the starting appearance
7. Create a separate AvatarCollectionManager for avatar-specific collections

## User Stories

1. **As a player**, I want to unlock new avatar heads by completing collection sets, so I can customize my character's appearance based on my gameplay achievements.
2. **As a player**, I want to unlock new avatar torsos and legs through collection, so I can create a unique character look.
3. **As a player**, I want to mix and match unlocked avatar parts from different sets, so I can create my preferred character appearance.
4. **As a player**, I want to see my unlocked avatar parts on my character sheet, so I know what I've earned.
5. **As a player**, I want a separate customization screen to change my avatar, so I can easily switch between unlocked parts.
6. **As a player**, I want to see my progress toward unlocking new avatar parts, so I know how close I am to earning new customization options.

## Functional Requirements

### Avatar Collection System

1. The system must create avatar-specific collection sets separate from region unlock sets
2. Each avatar part (head, torso, legs) must have its own collection sets (e.g., "Warrior Helmet Set", "Mage Robe Set", "Ranger Boots Set")
3. The system must start with 3-4 collection sets per category (head/torso/legs), designed to be expandable later
4. Each collection set must contain items that players can collect during runs
5. Completing a collection set must unlock the corresponding avatar part
6. Avatar collection sets must use the same item collection mechanics as region unlock sets (items collected during runs, tracked in CollectionManager)

### Avatar Unlock System

7. The system must track which avatar parts are unlocked for each player
8. The system must automatically unlock avatar parts when their collection set is completed
9. Players must be able to equip any unlocked avatar part, regardless of which set it came from (mix and match)
10. The current default avatar (head.png, torso.png, legs.png) must remain unlocked by default
11. Unlocked avatar parts must persist across app sessions
12. The system must support multiple unlocked options per category (multiple heads, multiple torsos, multiple legs)

### Avatar Customization

13. Players must be able to view their current avatar on the character sheet
14. Players must be able to access a separate avatar customization screen
15. The customization screen must display all unlocked avatar parts organized by category (heads, torsos, legs)
16. Players must be able to select and equip any unlocked part from any category
17. The customization screen must show locked avatar parts with progress indicators (e.g., "3/5 items collected")
18. Equipped avatar parts must be saved and persist across sessions
19. The character sheet must display the currently equipped avatar parts

### Collection Management

20. The system must create a separate AvatarCollectionManager for managing avatar-specific collections
21. AvatarCollectionManager must integrate with the existing CollectionManager to track collected items
22. Avatar collection sets must be separate from region unlock sets but use the same underlying item tracking
23. The system must display avatar collection progress in the collections UI
24. Avatar collection sets must be visible alongside region unlock sets in the collection overview

### Visual Assets

25. The system must use placeholder assets initially (to be replaced with final art later)
26. Placeholder assets must follow a consistent naming convention (e.g., `head_warrior_placeholder.png`)
27. The system must support easy asset replacement when final art is available
28. Avatar part assets must be organized by category in the assets folder

### Integration Points

29. Avatar unlocks must integrate with the existing collection system for item tracking
30. Avatar customization must integrate with the character sheet display
31. Avatar unlocks must be separate from region unlocks (different collection sets, different manager)
32. The system must not interfere with existing region unlock functionality

## Non-Goals (Out of Scope)

- Creating final avatar art assets (using placeholders initially)
- Avatar parts providing gameplay bonuses (cosmetic only)
- Avatar parts being tied to character level or XP (only collection-based)
- Avatar parts being purchasable or available through other means (only through collection)
- Changing the existing character progression system
- Modifying the default avatar appearance
- Avatar animation or dynamic parts
- Avatar color customization (only part selection)

## Design Considerations

### UI/UX Requirements

- **Character Sheet**: Display current equipped avatar parts (head, torso, legs)
- **Avatar Customization Screen**: Separate screen accessible from character sheet with:
  - Grid/list view of unlocked parts per category
  - Preview of selected parts
  - Progress indicators for locked parts
  - "Equip" button to apply selected parts
- **Collection Overview**: Show avatar collection sets alongside region unlock sets
- **Visual Consistency**: Follow existing UI patterns from collection and character screens

### Integration Points

- **CollectionManager**: Avatar items will be collected through the same encounter system
- **AvatarCollectionManager**: New manager for tracking avatar-specific unlocks and equipped parts
- **Character Sheet**: Display and navigation to customization screen
- **Collection Sets**: Define avatar-specific sets in collection-sets.ts or separate file

### Technical Considerations

- **Storage**: Avatar unlocks and equipped parts must persist using the existing storage system
- **Asset Management**: Placeholder assets should be easily replaceable
- **Performance**: Avatar rendering should not impact performance (simple image components)
- **Extensibility**: System should easily support adding more avatar parts in the future

## Technical Considerations

### Dependencies

- **AvatarCollectionManager**: New manager class for avatar-specific collection tracking and unlock management
- **CollectionManager**: Existing collection tracking (avatar items will be collected here)
- **Character Storage**: Extend character storage to include equipped avatar parts
- **Asset System**: Placeholder image assets for avatar parts

### Implementation Notes

- Avatar collection sets should be defined similarly to region unlock sets but in a separate category
- AvatarCollectionManager should track which parts are unlocked and which are equipped
- Character type should be extended to include equipped avatar part IDs
- Avatar component should dynamically load images based on equipped parts
- Placeholder assets should use clear naming: `avatar_head_[setname]_placeholder.png`

### Performance Considerations

- Avatar image loading should be efficient (no unnecessary re-renders)
- Collection progress calculation should be cached when possible

## Success Metrics

1. **Functionality**: 100% of avatar collection sets successfully unlock their corresponding avatar parts
2. **Integration**: Avatar unlocks work alongside region unlocks without conflicts
3. **User Experience**: Players can view and customize their avatar from the character sheet
4. **Persistence**: Equipped avatar parts persist across app sessions
5. **Collection Progress**: Players can see progress toward unlocking avatar parts
6. **Stability**: No regressions in existing collection or character systems

## Open Questions

All questions have been resolved:

1. **Avatar Part Quantity**: Start with 3-4 collection sets per category (heads, torsos, legs), designed to be expandable later
2. **Collection Set Structure**: Each avatar part has its own collection set (e.g., "Warrior Helmet Set" unlocks one head)
3. **Collection Set Categories**: New avatar-specific collection sets separate from region unlock sets
4. **Default Avatar**: Keep current default (head.png, torso.png, legs.png) and unlock new parts
5. **Avatar Selection**: Players can equip any unlocked part from any set (mix and match)
6. **Visual Assets**: Placeholder assets initially, to be replaced later
7. **Integration**: Separate AvatarCollectionManager for avatar-specific collections
8. **UI/Display**: Both: view on character sheet, customize in separate screen
