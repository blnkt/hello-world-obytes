# PRD: Delver's Descent Phase 4 - Collection & Progression Systems

## Introduction/Overview

Phase 4 implements the collection and progression systems that provide long-term goals and permanent character advancement in Delver's Descent. This phase builds on the completed push-your-luck mechanics from Phase 3 to create meaningful progression through collection sets, region unlocks, and permanent bonuses that enhance future runs.

**Problem Solved:** Players can complete runs and collect items, but lack long-term progression goals and permanent character advancement. The game needs collection sets with completion bonuses, region unlocks, and permanent progression integration to provide meaningful advancement beyond individual runs.

**Goal:** Implement comprehensive collection and progression systems including trade goods sets, regional discoveries, legendary treasures, region unlocks, permanent bonuses, and integration with existing character progression to create long-term engagement and advancement goals.

## Goals

1. **Collection System Implementation**: Create comprehensive collection sets for trade goods, regional discoveries, and legendary treasures
2. **Set Completion Bonuses**: Implement permanent bonuses for completed collection sets (energy efficiency, starting bonuses, region unlocks)
3. **Region Unlock System**: Create new starting regions with different encounter tables and thematic elements
4. **Permanent Progression Integration**: Integrate collection bonuses with existing character XP and level systems
5. **Collection UI & Management**: Create comprehensive UI for viewing, tracking, and managing collections
6. **Progression Persistence**: Ensure all progression persists across runs and app sessions
7. **Balance & Scaling**: Create balanced progression curves that enhance but don't trivialize gameplay

## User Stories

1. **As a player**, I want to collect trade goods that belong to specific sets so I can work toward set completion bonuses.
2. **As a player**, I want to discover regional artifacts and lore so I can unlock new starting regions with different themes.
3. **As a player**, I want to find legendary treasures so I can gain powerful permanent abilities for future runs.
4. **As a player**, I want to see my collection progress clearly so I know what I'm still missing.
5. **As a player**, I want completed sets to grant permanent bonuses so my collection efforts feel meaningful.
6. **As a player**, I want to unlock new starting regions so I can experience different encounter types and themes.
7. **As a player**, I want collection bonuses to enhance my runs without making them too easy.
8. **As a player**, I want my collection progress to persist across all runs so I can build toward long-term goals.

## Functional Requirements

### Collection System Core

- [ ] **Trade Goods Sets**: 5-7 items per set with thematic coherence (Silk Road, Spice Trade, Gem Merchant, Exotic Goods)
- [ ] **Regional Discovery Sets**: Location-based collections (Ancient Temple, Lost City, Dragon's Lair, Crystal Caverns)
- [ ] **Legendary Treasure Sets**: Rare, high-value collections (Dragon's Hoard, Phoenix Crown, Titan's Relics)
- [ ] **Collection Tracking**: Persistent tracking of collected items across all runs
- [ ] **Set Completion Detection**: Automatic detection when sets are completed
- [ ] **Collection Statistics**: Track total items collected, sets completed, completion rates

### Set Completion Bonuses

- [ ] **Energy Efficiency Bonuses**: +10% energy efficiency for trade goods set completions
- [ ] **Starting Energy Bonuses**: +20% starting energy for regional discovery completions
- [ ] **Region Unlocks**: Unlock new starting regions for legendary treasure completions
- [ ] **Permanent Abilities**: Special abilities for completing multiple sets (extra shortcut chance, better encounter odds)
- [ ] **Bonus Stacking**: Multiple completed sets provide cumulative benefits
- [ ] **Bonus Configuration**: Configurable bonus values for balancing

### Region Unlock System

- [ ] **New Starting Regions**: Forest Depths, Desert Oasis, Mountain Pass, Coastal Caves
- [ ] **Region-Specific Encounters**: Different encounter type distributions per region
- [ ] **Thematic Elements**: Unique visual and narrative elements per region
- [ ] **Region Progression**: Unlock regions through collection completion
- [ ] **Region Selection**: Choose starting region at run beginning
- [ ] **Region Bonuses**: Each region provides unique starting bonuses

### Permanent Progression Integration

- [ ] **Character Level Integration**: Collection bonuses integrate with existing XP/level system
- [ ] **Starting Bonus System**: Collection bonuses apply to run initialization
- [ ] **Progression Scaling**: Bonuses scale appropriately with character level
- [ ] **Legacy Support**: Existing character progression remains unchanged
- [ ] **Bonus Application**: Automatic application of bonuses to new runs
- [ ] **Bonus Display**: Clear indication of active bonuses in UI

### Collection UI & Management

- [ ] **Collection Overview**: Main screen showing all collection sets and progress
- [ ] **Set Detail Views**: Detailed view of each set with collected/missing items
- [ ] **Progress Indicators**: Visual progress bars and completion percentages
- [ ] **Bonus Display**: Clear display of completed set bonuses and their effects
- [ ] **Region Selection**: UI for choosing starting region with region information
- [ ] **Collection Statistics**: Overall collection statistics and achievements
- [ ] **Search and Filter**: Ability to search and filter collections

### Progression Persistence

- [ ] **Cross-Run Persistence**: Collection progress persists across all runs
- [ ] **App Session Persistence**: Collection data persists across app restarts
- [ ] **Data Migration**: Support for migrating collection data between app versions
- [ ] **Backup and Restore**: Collection data backup and restore functionality
- [ ] **Sync Integration**: Integration with existing data sync systems

## Non-Goals (Out of Scope)

- Visual polish and animations (Phase 5)
- Advanced balancing and tuning (Phase 5)
- Tutorial/onboarding flow (Phase 6)
- Achievement system (Phase 5)
- Performance optimization beyond basic requirements (Phase 6)
- New encounter types (Phase 3 complete)

## Technical Considerations

**Integration Points:**

- Existing character XP/level system → Collection bonus integration
- Existing run initialization → Starting bonus application
- Existing encounter system → Region-specific encounter tables
- Existing reward system → Collection item generation
- Existing UI framework → Collection management screens

**Performance:**

- Collection lookups must complete within 10ms
- Set completion detection should not impact run performance
- Collection UI should load within 100ms
- Bonus application should not delay run initialization

**Data Persistence:**

- Collection progress persists across all runs
- Set completion bonuses persist permanently
- Region unlocks persist across app sessions
- Bonus configurations persist for balancing

**Data Models:**

- CollectionSet interface with items, completion status, bonuses
- Region interface with encounter tables, themes, unlock requirements
- CollectionBonus interface with type, value, and application logic
- CollectionProgress interface with tracking and statistics

## Success Metrics

1. **Engagement**: 60%+ of players complete at least one collection set within 2 weeks
2. **Progression**: 40%+ of players unlock at least one new region within 1 month
3. **Retention**: Collection completion correlates with 30-day retention
4. **Balance**: Collection bonuses enhance runs without trivializing difficulty
5. **UI Usability**: 90%+ of players can navigate collection screens without confusion
6. **Performance**: All collection operations complete within specified time limits

## Open Questions

1. **Set Sizes**: Should collection sets be 5-7 items or larger for longer-term goals?
2. **Bonus Scaling**: How should collection bonuses scale with character level?
3. **Region Themes**: What specific themes and encounter distributions should each region have?
4. **Legendary Rarity**: How rare should legendary treasures be to maintain excitement?
5. **Bonus Stacking**: Should multiple completed sets provide linear or diminishing returns?
6. **Region Unlock Requirements**: Should regions require single set completion or multiple sets?

## Implementation Notes

- Start with collection tracking and set completion detection
- Implement basic collection UI before adding complex features
- Focus on integration with existing character progression system
- Ensure collection bonuses enhance rather than replace existing progression
- Prepare interfaces for Phase 5 polish and balancing
- Maintain backward compatibility with existing progression systems
