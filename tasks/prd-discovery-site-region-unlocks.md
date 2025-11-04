# PRD: Discovery Site Region Unlock Integration

## Introduction/Overview

Currently, discovery site encounters provide lore, map intelligence, and regional collection items, but they don't contribute to unlocking new regions. This feature updates discovery sites to be a primary means of unlocking regions by providing collection items that contribute to region unlock requirements. Additionally, discovery sites will no longer appear on the map once all regions are unlocked, maintaining game progression balance.

**Problem Solved:** Players currently unlock regions through general collection across all encounters, but discovery sites (which are themed around exploration and discovery) don't actively contribute to region progression. This creates a disconnect between the encounter's theme and its mechanical purpose.

**Goal:** Transform discovery sites into a meaningful region unlock mechanism by having them provide collection items that contribute to region unlock requirements, and prevent discovery sites from appearing once all regions are unlocked.

## Goals

1. Discovery sites provide collection items from sets required for region unlocks (silk_road_set, spice_trade_set, ancient_temple_set, dragons_hoard_set)
2. Discovery sites contribute to the existing collection-based unlock system without replacing it
3. Discovery sites are excluded from map generation when all regions are unlocked
4. Players receive clear visual feedback about region unlock progress when using discovery sites
5. When a region is unlocked (either during or after a discovery site encounter), show a notification

## User Stories

1. **As a player**, I want discovery sites to provide collection items that help unlock regions, so that exploration feels meaningful and directly contributes to progression.
2. **As a player**, I want to see my region unlock progress when exploring discovery sites, so I know how close I am to unlocking new regions.
3. **As a player**, I want to be notified when I unlock a region from discovery site exploration, so I feel rewarded for my exploration efforts.
4. **As a player**, I want discovery sites to stop appearing once I've unlocked all regions, so the game doesn't show me irrelevant content.
5. **As a player**, I want discovery sites to randomly select which region-unlock items they provide, so there's variety in what I collect.

## Functional Requirements

### Discovery Site Item Generation

1. Discovery sites must provide collection items from region unlock sets (silk_road_set, spice_trade_set, ancient_temple_set, dragons_hoard_set) instead of the current regional sets (ancient_ruins_set, crystal_caverns_set, etc.)
2. Discovery sites must randomly select which region unlock set to provide items from (from available sets that haven't unlocked their regions yet)
3. If all regions are unlocked, discovery sites should not appear (handled in map generation)
4. Discovery site rewards must be integrated with the existing CollectionManager to track items and detect set completions
5. Discovery site items must contribute to the `totalItemsCollected` count used in region unlock requirements

### Region Unlock Integration

6. Discovery sites must integrate with RegionManager to check unlock requirements
7. When a discovery site encounter completes successfully, the system must check if any new regions can be unlocked
8. If a region becomes unlockable after a discovery site encounter, the system must automatically unlock it (or prompt the player if multiple regions become available)
9. When multiple regions become available, the system must randomly select one to unlock
10. The system must check all regions for unlock eligibility, not just check one at a time

### Map Generation Updates

11. Map generation must check if all regions are unlocked before generating discovery site encounters
12. If all regions are unlocked, discovery_site must be excluded from encounter type distribution
13. The encounter distribution weights must be recalculated when discovery_site is excluded to maintain proper balance
14. This check must be performed during map generation, not during encounter initialization

### Visual Feedback

15. Discovery site UI must display which region unlock sets are available to collect from
16. Discovery site UI must show progress toward unlocking regions (e.g., "2/5 items collected for Desert Oasis unlock")
17. When a region is unlocked during or after a discovery site encounter, the system must display a notification
18. The notification must indicate which region was unlocked and any relevant details (starting bonuses, theme, etc.)
19. Discovery site UI should show which regions are already unlocked to avoid confusion

### Backward Compatibility

20. Existing discovery site encounters in progress must continue to work without errors
21. Players who already have collected items must see their progress reflected correctly
22. The change from regional sets to region unlock sets must not break existing collection tracking

## Non-Goals (Out of Scope)

- Removing the existing collection-based unlock system (discovery sites will contribute to it, not replace it)
- Changing how other encounter types (puzzle_chamber, risk_event, etc.) provide collection items
- Adding new region unlock requirements or changing existing unlock requirements
- Changing the region unlock UI outside of discovery site encounters
- Making discovery sites the only way to unlock regions (they contribute alongside other methods)
- Adding new collection sets specifically for discovery sites
- Changing discovery site encounter mechanics beyond item generation

## Design Considerations

### UI/UX Requirements

- **Discovery Site Screen**: Add a section showing region unlock progress relevant to the items being offered
- **Region Unlock Notification**: Use an existing notification/toast system or create a modal-style notification that appears after encounter completion
- **Progress Indicators**: Show visual progress bars or item counts for each region that's not yet unlocked
- **Visual Consistency**: Follow existing UI patterns from the collection screen and region selection screen

### Integration Points

- **CollectionManager**: Discovery sites will call `addCollectedItem()` with items from region unlock sets
- **RegionManager**: Discovery sites will check `canUnlockRegion()` and call `unlockRegion()` when requirements are met
- **MapGenerator**: Must integrate with RegionManager to check unlock status before generating discovery sites
- **Encounter Screen**: Must display region unlock progress and handle unlock notifications

## Technical Considerations

### Dependencies

- **RegionManager**: Must be accessible to both DiscoverySiteEncounter and MapGenerator
- **CollectionManager**: Must be accessible to DiscoverySiteEncounter for tracking collected items
- **Collection Sets**: Must access collection set definitions to determine which items to generate
- **Map Generation**: Must integrate unlock status checking into the encounter distribution logic

### Implementation Notes

- Discovery sites currently generate items with hardcoded regional sets (ancient_ruins_set, crystal_caverns_set, etc.). These need to be replaced with region unlock sets.
- Map generation uses encounter distribution weights. When discovery_site is excluded, weights must be normalized to maintain balance.
- Region unlock checking should happen after item collection is processed, as set completion may trigger unlocks.
- The random region selection when multiple become available should use the RegionManager's existing unlock logic.

### Performance Considerations

- Region unlock status checking should be cached or checked once per map generation, not per node
- Collection progress checking should be efficient as it will be called during encounter completion

## Success Metrics

1. **Functionality**: 100% of discovery sites provide items from region unlock sets
2. **Integration**: Discovery sites successfully contribute to region unlocks through the existing collection system
3. **Map Generation**: Discovery sites are excluded from map generation when all regions are unlocked
4. **User Experience**: Players can see region unlock progress in discovery site UI
5. **Notifications**: Players receive notifications when regions are unlocked
6. **Stability**: No regressions in existing collection or region unlock functionality

## Open Questions

All questions have been resolved:

1. **Item Source**: Discovery sites will only provide items from sets that haven't unlocked their regions yet. This ensures focused progression and prevents redundant item collection once a region is unlocked.

2. **Multiple Unlocks**: When multiple regions become unlockable simultaneously, the system will randomly select one region to unlock. This matches the user's preference for random selection (from clarifying question #2).

3. **Notification Timing**: The region unlock notification will appear after returning to the map (not during the encounter). This provides a cleaner UX flow and doesn't interrupt the encounter completion experience.

4. **Progress Display**: Discovery sites will only show progress for regions relevant to the current encounter's items (not all unlockable regions). This keeps the UI simpler and more focused on the immediate encounter.
