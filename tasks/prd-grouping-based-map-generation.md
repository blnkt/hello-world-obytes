# PRD: Grouping-Based Map Generation

## Introduction/Overview

Currently, the dungeon map generator selects encounters individually using weighted probability distributions. This can lead to repetitive or unbalanced depth levels (e.g., multiple puzzle chambers or multiple minigames in the same depth). This feature refactors the map generation system to use encounter groupings, ensuring variety and balance at each depth level while maintaining regional flavor.

**Problem Solved:** The current system can generate depth levels with duplicate encounters or multiple encounters from the same grouping (e.g., two puzzle chambers or two minigames), reducing variety and player engagement. Additionally, the system balances individual encounter types rather than encounter categories, making it harder to ensure a balanced gameplay experience.

**Goal:** Refactor the map generator to select encounters by grouping first, then randomly select a specific encounter from that grouping. This ensures no duplicate encounters or groupings within a single depth level, while maintaining the ability to apply depth-based constraints.

## Goals

1. Define encounter groupings and their member encounters
2. Refactor map generator to use grouping-based selection instead of individual encounter selection
3. Ensure no duplicate encounters within a single depth level
4. Ensure no duplicate groupings within a single depth level
5. Apply depth constraints (e.g., no Recovery and Navigation encounters in first 10 depths)
6. Support configurable grouping distributions in `balance-config.ts`
7. Maintain backward compatibility with existing encounter distribution configs for within-group weighting (currently evenly weighted)
8. Support future weighted selection within groups

## User Stories

1. **As a player**, I want each depth level to have variety, so I don't encounter the same encounter type twice in a row.
2. **As a player**, I want balanced depth levels, so I don't get multiple minigames or multiple loot encounters in the same depth.
3. **As a player**, I want early depths to focus on core gameplay, so recovery and navigation encounters don't appear until I've progressed deeper.
4. **As a developer**, I want grouping distributions to be configurable, so I can tune game balance without code changes.

## Functional Requirements

### FR1: Encounter Groupings Definition

1.1. Define four encounter groupings:

- **Minigame**: `puzzle_chamber`, `scoundrel`
- **Loot**: `discovery_site`, `risk_event`, `hazard`
- **Recovery and Navigation**: `rest_site`, `region_shortcut`, `safe_passage`
- **Passive**: `luck_shrine`, `energy_nexus`, `fate_weaver`

1.2. Create type definitions for encounter groupings in `src/types/delvers-descent.ts`:

- `EncounterGrouping` type with values: `'minigame' | 'loot' | 'recovery_and_navigation' | 'passive'`
- Mapping from `EncounterGrouping` to `EncounterType[]`
- Helper function to get grouping for an encounter type

### FR2: Grouping Distribution Configuration

2.1. Add grouping distribution configuration to `balance-config.ts`:

- Default grouping distribution (percentages that sum to 1.0)
- Structure: `{ minigame: number, loot: number, recovery_and_navigation: number, passive: number }`
- Default values based on current encounter distributions:
  - Minigame: 0.30 (30%)
  - Loot: 0.40 (40%)
  - Recovery and Navigation: 0.20 (20%)
  - Passive: 0.10 (10%)

2.2. Configuration should be accessible via `DEFAULT_BALANCE_CONFIG.grouping.encounterGroupingDistribution`

### FR3: Depth-Based Constraints

3.1. Implement depth constraint system:

- Recovery and Navigation encounters must not appear in depths 1-10
- Constraints should be configurable and extensible for future use

3.2. When generating encounters for depths 1-10:

- Filter out Recovery and Navigation grouping from available groupings
- Redistribute weights proportionally among remaining groupings

### FR4: Map Generator Refactoring

4.1. Modify `DungeonMapGenerator.generateDepthLevel()` to:

- Select groupings first using weighted distribution (equal probability for now, weighted support for future)
- Ensure no duplicate groupings within a single depth level
- For each selected grouping, randomly select a specific encounter (equal probability for now, weighted support for future)
- Ensure no duplicate encounters within a single depth level
- Apply depth constraints before selection

4.2. Modify `DungeonMapGeneratorOptimized.generateDepthLevel()` with the same logic

4.3. Update `getWeightsForRegion()` method (or create equivalent) to:

- Return grouping weights instead of individual encounter weights
- Apply depth constraints
- Filter out unavailable groupings based on depth

### FR5: Fallback Behavior

5.1. If constraints prevent filling 2-3 encounter slots:

- Fill remaining slots with Minigame grouping encounters
- Ensure no duplicates even in fallback scenario

### FR6: Within-Group Selection

6.1. When selecting a specific encounter from a grouping:

- Use equal probability for all encounters in the group (for now)
- Structure code to support weighted selection in the future (using existing `encounterDistribution` configs)

6.2. Ensure no duplicate encounters are selected even when multiple encounters from the same grouping are available

### FR7: Backward Compatibility

7.1. Maintain existing `encounterDistribution` configs in `balance-config.ts`
7.2. These configs will be used for within-group weighting in the future
7.3. For now, ignore these configs and use equal probability within groups

## Non-Goals (Out of Scope)

1. **Weighted within-group selection**: This will be implemented in a future iteration
2. **Weighted grouping selection**: Equal probability for now, weighted support structure for future
3. **Regional grouping distributions**: All regions use the same grouping distribution (answer to Q2: B)
4. **Migration of existing encounter distributions**: Keep them for future use, but don't convert them automatically
5. **Performance optimizations**: Focus on correctness first, optimize if needed later

## Design Considerations

### Encounter Groupings Structure

```typescript
export type EncounterGrouping =
  | 'minigame'
  | 'loot'
  | 'recovery_and_navigation'
  | 'passive';

export const ENCOUNTER_GROUPINGS: Record<EncounterGrouping, EncounterType[]> = {
  minigame: ['puzzle_chamber', 'scoundrel'],
  loot: ['discovery_site', 'risk_event', 'hazard'],
  recovery_and_navigation: ['rest_site', 'region_shortcut', 'safe_passage'],
  passive: ['luck_shrine', 'energy_nexus', 'fate_weaver'],
};
```

### Configuration Structure

Add to `balance-config.ts`:

```typescript
grouping: {
  encounterGroupingDistribution: {
    minigame: 0.30,
    loot: 0.40,
    recovery_and_navigation: 0.20,
    passive: 0.10,
  },
  depthConstraints: {
    recovery_and_navigation: { minDepth: 11 }, // Cannot appear before depth 11
  },
}
```

### Algorithm Pseudocode

```
generateDepthLevel(depth):
  1. nodeCount = random(2, 3)
  2. availableGroupings = getAllGroupings()
  3. Apply depth constraints (filter out unavailable groupings)
  4. Redistribute weights if needed
  5. selectedGroupings = []
  6. selectedEncounters = []

  7. For each position (0 to nodeCount-1):
     a. Filter availableGroupings to exclude already selected groupings
     b. If no groupings available, use minigame as fallback
     c. Select grouping using weighted random
     d. Add to selectedGroupings
     e. Filter encounters in grouping to exclude already selected encounters
     f. Select encounter using equal probability random
     g. Add to selectedEncounters

  8. Return nodes with selectedEncounters
```

## Technical Considerations

1. **File Locations**:
   - Type definitions: `src/types/delvers-descent.ts`
   - Configuration: `src/lib/delvers-descent/balance-config.ts`
   - Implementation: `src/lib/delvers-descent/map-generator.ts` and `map-generator-optimized.ts`

2. **Dependencies**:
   - Existing `DEFAULT_BALANCE_CONFIG` structure
   - Existing `EncounterType` type definitions
   - Existing `DungeonMapGenerator` and `DungeonMapGeneratorOptimized` classes

3. **Testing Requirements**:
   - Unit tests for grouping selection logic
   - Unit tests for depth constraint application
   - Unit tests for duplicate prevention (both groupings and encounters)
   - Integration tests for full depth level generation
   - Tests for fallback behavior

4. **Performance Considerations**:
   - Grouping selection should be O(1) or O(n) where n is number of groupings (4)
   - Within-group selection should be O(m) where m is encounters per group (max 3)
   - Overall algorithm should remain efficient for <50ms map generation target

## Success Metrics

1. **Variety**: No duplicate encounters or groupings within a single depth level (100% compliance)
2. **Constraint Compliance**: Recovery and Navigation encounters never appear in depths 1-10 (100% compliance)
3. **Distribution**: Actual grouping distribution matches configured distribution within acceptable variance (±5%)
4. **Performance**: Map generation time remains under 50ms for full map generation
5. **Test Coverage**: >90% code coverage for new grouping logic

## Open Questions

1. Should we log warnings when fallback behavior is triggered?
2. Should depth constraints be configurable per region in the future?
3. Should we add validation to ensure grouping distributions sum to 1.0?

## Default Grouping Distribution Rationale

Based on current encounter distributions:

- **Minigame (30%)**: Core gameplay encounters that require active player engagement. Slightly reduced from current 33.7% to make room for more loot.
- **Loot (40%)**: Rewards drive player progression and engagement. Increased from current 33.7% to emphasize the reward loop.
- **Recovery and Navigation (20%)**: Important utility encounters. Slightly reduced from current 21.2% since they're excluded from early depths anyway.
- **Passive (10%)**: Utility encounters that should be rare. Slightly reduced from current 11.3% to emphasize active gameplay.

These percentages ensure:

- Balanced depth levels (with 2-3 encounters, we'll see good variety)
- Emphasis on engaging gameplay (minigames + loot = 70%)
- Appropriate utility availability (recovery/navigation + passive = 30%)
