# Tasks: Grouping-Based Map Generation

Based on `prd-grouping-based-map-generation.md`

## Relevant Files

- `src/types/delvers-descent.ts` - Add EncounterGrouping type, ENCOUNTER_GROUPINGS mapping, and helper functions
- `src/types/delvers-descent.test.ts` - Unit tests for encounter grouping types and helpers
- `src/lib/delvers-descent/balance-config.ts` - Add grouping distribution configuration and depth constraints
- `src/lib/delvers-descent/balance-config.test.ts` - Unit tests for grouping configuration structure and validation
- `src/lib/delvers-descent/map-generator.ts` - Refactor to use grouping-based selection algorithm
- `src/lib/delvers-descent/map-generator-optimized.ts` - Refactor optimized generator to use grouping-based selection
- `src/lib/delvers-descent/map-generator.test.ts` - Unit tests for grouping-based map generation
- `src/lib/delvers-descent/map-generator-optimized.test.ts` - Unit tests for optimized grouping-based generation
- `src/lib/delvers-descent/__tests__/map-generator-grouping.test.ts` - Integration tests for grouping logic

### Notes

- Unit tests should be placed alongside the code files they are testing
- Use `pnpm test [optional/path/to/test/file]` to run tests
- Follow TDD workflow: write tests first, then implement functionality

## Tasks

- [x] 1.0 Define Encounter Groupings Types and Mappings
  - [x] 1.1 Add `EncounterGrouping` type definition to `src/types/delvers-descent.ts` with values: `'minigame' | 'loot' | 'recovery_and_navigation' | 'passive'`
  - [x] 1.2 Create `ENCOUNTER_GROUPINGS` constant mapping `EncounterGrouping` to `EncounterType[]` arrays
  - [x] 1.3 Create `ALL_ENCOUNTER_GROUPINGS` array containing all grouping type values
  - [x] 1.4 Create helper function `getEncounterGrouping(encounterType: EncounterType): EncounterGrouping | null` that returns the grouping for a given encounter type
  - [x] 1.5 Create helper function `getEncountersInGrouping(grouping: EncounterGrouping): EncounterType[]` that returns all encounters in a grouping
  - [x] 1.6 Add unit tests in `src/types/delvers-descent.test.ts` for grouping type definitions and helper functions
  - [x] 1.7 Verify all 11 encounter types are mapped to exactly one grouping

- [x] 2.0 Add Grouping Distribution Configuration to Balance Config
  - [x] 2.1 Add `EncounterGroupingDistribution` interface to `balance-config.ts` with properties: `minigame`, `loot`, `recovery_and_navigation`, `passive` (all numbers)
  - [x] 2.2 Add `DepthConstraint` interface with `minDepth?: number` and `maxDepth?: number` properties
  - [x] 2.3 Add `GroupingBalanceConfig` interface containing `encounterGroupingDistribution` and `depthConstraints` (Record<EncounterGrouping, DepthConstraint>)
  - [x] 2.4 Add `grouping` property to `GameBalanceConfig` interface with type `GroupingBalanceConfig`
  - [x] 2.5 Add default grouping distribution to `DEFAULT_BALANCE_CONFIG`: minigame: 0.30, loot: 0.40, recovery_and_navigation: 0.20, passive: 0.10
  - [x] 2.6 Add default depth constraints: `recovery_and_navigation: { minDepth: 11 }`
  - [x] 2.7 Add validation function `validateGroupingDistribution(dist: EncounterGroupingDistribution): boolean` that checks if values sum to 1.0 (within tolerance)
  - [x] 2.8 Add unit tests for configuration structure and validation

- [x] 3.0 Implement Depth Constraint System
  - [x] 3.1 Create function `filterGroupingsByDepth(groupings: EncounterGrouping[], depth: number, constraints: Record<EncounterGrouping, DepthConstraint>): EncounterGrouping[]` that filters out groupings unavailable at given depth
  - [x] 3.2 Create function `redistributeGroupingWeights(weights: EncounterGroupingDistribution, availableGroupings: EncounterGrouping[]): EncounterGroupingDistribution` that proportionally redistributes weights when groupings are filtered out
  - [x] 3.3 Create function `getAvailableGroupingsForDepth(depth: number, config: GroupingBalanceConfig): { groupings: EncounterGrouping[], weights: EncounterGroupingDistribution }` that combines filtering and redistribution
  - [x] 3.4 Add unit tests for depth constraint filtering logic
  - [x] 3.5 Add unit tests for weight redistribution (verify weights still sum to 1.0 after redistribution)
  - [x] 3.6 Add unit tests verifying recovery_and_navigation is filtered out for depths 1-10

- [ ] 4.0 Refactor Map Generator to Use Grouping-Based Selection
  - [x] 4.1 Create helper method `selectGrouping(availableGroupings: EncounterGrouping[], weights: EncounterGroupingDistribution, excludeGroupings: EncounterGrouping[]): EncounterGrouping | null` that selects a grouping using weighted random, excluding already selected groupings
  - [x] 4.2 Create helper method `selectEncounterFromGrouping(grouping: EncounterGrouping, excludeEncounters: EncounterType[]): EncounterType | null` that selects an encounter from a grouping using equal probability, excluding already selected encounters
  - [x] 4.3 Update `getWeightsForRegion()` method (or create `getGroupingWeightsForDepth()`) to return grouping weights instead of encounter weights, applying depth constraints
  - [x] 4.4 Refactor `generateDepthLevel()` in `DungeonMapGenerator` to:
    - [x] 4.4.1 Get available groupings and weights for the depth (applying constraints)
    - [x] 4.4.2 Initialize arrays to track selected groupings and encounters
    - [x] 4.4.3 For each node position (2-3 nodes):
      - [x] Filter available groupings to exclude already selected groupings
      - [x] If no groupings available, use minigame as fallback
      - [x] Select grouping using weighted random
      - [x] Filter encounters in selected grouping to exclude already selected encounters
      - [x] Select encounter using equal probability random
      - [x] Add to selected arrays
    - [x] 4.4.4 Return nodes with selected encounters
  - [x] 4.5 Apply same refactoring to `generateDepthLevel()` in `DungeonMapGeneratorOptimized`
  - [ ] 4.6 Remove or deprecate old encounter-based weight logic (keep for backward compatibility but don't use)
  - [x] 4.7 Ensure fallback behavior works correctly when constraints prevent filling all slots

- [ ] 5.0 Add Comprehensive Tests for Grouping-Based Map Generation
  - [ ] 5.1 Add tests in `map-generator.test.ts` verifying no duplicate encounters within a depth level
  - [ ] 5.2 Add tests in `map-generator.test.ts` verifying no duplicate groupings within a depth level
  - [ ] 5.3 Add tests verifying depth constraints are applied correctly (recovery_and_navigation excluded from depths 1-10)
  - [ ] 5.4 Add tests verifying grouping distribution matches configured distribution (within acceptable variance)
  - [ ] 5.5 Add tests for fallback behavior when constraints prevent filling all slots
  - [ ] 5.6 Add tests verifying weight redistribution works correctly when groupings are filtered
  - [ ] 5.7 Add integration tests in `__tests__/map-generator-grouping.test.ts` for full depth level generation with various scenarios
  - [ ] 5.8 Add performance tests verifying map generation still completes in <50ms
  - [ ] 5.9 Add tests for `DungeonMapGeneratorOptimized` with same test cases
  - [ ] 5.10 Verify test coverage is >90% for new grouping logic
