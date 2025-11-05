# Tasks: Discovery Site Region Unlock Integration

## Relevant Files

- `src/lib/delvers-descent/discovery-site-encounter.ts` - Main discovery site encounter logic, needs updates to generate region unlock set items and integrate region unlock checking
- `src/lib/delvers-descent/discovery-site-encounter.test.ts` - Unit tests for DiscoverySiteEncounter
- `src/lib/delvers-descent/region-manager.ts` - Region unlock and selection management, will be used for checking unlock status
- `src/lib/delvers-descent/collection-manager.ts` - Collection tracking, will be used to check collection progress
- `src/lib/delvers-descent/collection-sets.ts` - Collection set definitions, contains region unlock sets (silk_road_set, spice_trade_set, ancient_temple_set, dragons_hoard_set)
- `src/lib/delvers-descent/map-generator.ts` - Map generation logic, needs updates to exclude discovery sites when all regions unlocked
- `src/lib/delvers-descent/map-generator-optimized.ts` - Optimized map generation, needs same updates as map-generator.ts
- `src/lib/delvers-descent/map-generator.test.ts` - Unit tests for map generation
- `src/components/delvers-descent/encounters/discovery-site-screen.tsx` - Discovery site UI component, needs region unlock progress display
- `src/components/delvers-descent/encounters/discovery-site-screen.test.tsx` - Unit tests for discovery site screen
- `src/components/delvers-descent/region-unlock-notification.tsx` - New component for region unlock notifications
- `src/components/delvers-descent/region-unlock-notification.test.tsx` - Unit tests for region unlock notification
- `src/app/(app)/active-run.tsx` - Active run handler, needs integration to show notifications after encounter completion
- `src/lib/delvers-descent/regions.ts` - Region definitions with unlock requirements

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `pnpm test [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [ ] 1.0 Update DiscoverySiteEncounter to Generate Region Unlock Set Items
  - [x] 1.1 Add RegionManager and CollectionManager dependencies to DiscoverySiteEncounter constructor
  - [x] 1.2 Create helper method to get available region unlock sets (silk_road_set, spice_trade_set, ancient_temple_set, dragons_hoard_set) that haven't unlocked their regions yet
  - [x] 1.3 Update generateRegionalDiscoveries to randomly select from available region unlock sets instead of hardcoded regional sets
  - [x] 1.4 Update createDiscoveryReward to use actual collection set items from collection-sets.ts instead of hardcoded regional items
  - [x] 1.5 Update createDiscoveryReward to randomly select items from the chosen collection set's items array
  - [x] 1.6 Remove hardcoded regional sets (ancient_ruins_set, crystal_caverns_set, shadow_realm_set, ethereal_plains_set) and related mappings
  - [x] 1.7 Update getRegionalCollectionSets to return region unlock sets instead of regional sets
  - [x] 1.8 Write unit tests for region unlock set selection logic
  - [x] 1.9 Write unit tests verifying items are generated from correct collection sets

- [ ] 2.0 Integrate Region Unlock Checking and Automatic Unlocking
  - [x] 2.1 Add method to check all regions for unlock eligibility after encounter completion
  - [x] 2.2 Add method to automatically unlock regions when requirements are met
  - [x] 2.3 Implement random selection logic when multiple regions become unlockable simultaneously
  - [x] 2.4 Update processExplorationDecision to check for region unlocks after item collection
  - [x] 2.5 Add return value to processExplorationDecision indicating which region was unlocked (if any)
  - [x] 2.6 Ensure unlock checking happens after CollectionManager processes items (to detect set completions)
  - [x] 2.7 Write unit tests for region unlock checking logic
  - [x] 2.8 Write unit tests for automatic unlocking when requirements are met
  - [x] 2.9 Write unit tests for random selection when multiple regions become available

- [ ] 3.0 Update Map Generation to Exclude Discovery Sites When All Regions Unlocked
  - [x] 3.1 Add RegionManager dependency to DungeonMapGenerator constructor (optional parameter)
  - [x] 3.2 Create helper method to check if all regions are unlocked
  - [x] 3.3 Update getWeightsForRegion to exclude discovery_site from encounter weights when all regions are unlocked
  - [x] 3.4 Ensure encounter weights are recalculated/normalized after excluding discovery_site to maintain balance
  - [x] 3.5 Apply same changes to DungeonMapGeneratorOptimized class
  - [x] 3.6 Write unit tests verifying discovery_site is excluded when all regions unlocked
  - [x] 3.7 Write unit tests verifying encounter weights are properly normalized after exclusion
  - [x] 3.8 Write integration tests for map generation with all regions unlocked scenario

- [x] 4.0 Add Region Unlock Progress UI to Discovery Site Screen
  - [x] 4.1 Create helper function to get region unlock progress for a given collection set
  - [x] 4.2 Add RegionManager and CollectionManager to DiscoverySiteScreen component props or context
  - [x] 4.3 Create RegionUnlockProgress component to display progress for relevant regions
  - [x] 4.4 Display which region unlock set items are being offered in the current encounter
  - [x] 4.5 Show progress indicators (e.g., "2/5 items collected for Desert Oasis unlock") for relevant regions
  - [x] 4.6 Display which regions are already unlocked to avoid confusion
  - [x] 4.7 Integrate RegionUnlockProgress component into DiscoveryContent
  - [x] 4.8 Write unit tests for RegionUnlockProgress component
  - [x] 4.9 Write integration tests for discovery site screen with progress display

- [x] 5.0 Implement Region Unlock Notification System
  - [x] 5.1 Create RegionUnlockNotification component to display unlock notifications
  - [x] 5.2 Component should display region name, description, starting bonuses, and theme information
  - [x] 5.3 Add state management in DiscoverySiteScreen to track unlocked region
  - [x] 5.4 Update DiscoverySiteScreen to receive unlocked region information from encounter
  - [x] 5.5 Integrate notification display in active-run.tsx after returning to map (after encounter completion)
  - [x] 5.6 Ensure notification appears after returning to map, not during encounter (per PRD requirement)
  - [x] 5.7 Add proper styling and animations for notification display
  - [x] 5.8 Write unit tests for RegionUnlockNotification component
  - [x] 5.9 Write integration tests for notification display flow
