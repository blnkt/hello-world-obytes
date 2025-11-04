# PRD: Progression Data Persistence Refactor

## Introduction/Overview

Currently, the game archives all completed runs, storing full run metadata for historical browsing. This creates unnecessary storage overhead and complexity. Instead, we should persist only essential progression data that affects future gameplay and player advancement.

This refactor will:

- Persist core progression metrics (all-time deepest depth, run statistics)
- Stop archiving individual run records
- Maintain region unlock state (already persisted)
- Ensure all progression data is properly saved when runs complete or bust

## Goals

1. **Persist Essential Progression Data**: Save only data that affects future gameplay or player progression
2. **Reduce Storage Overhead**: Eliminate unnecessary run archives
3. **Maintain Game Statistics**: Keep aggregate statistics for display and achievements
4. **Preserve Player Progress**: Ensure all meaningful progression is never lost

## User Stories

1. **As a player**, I want my deepest depth reached to be remembered across all runs, so I can see my personal best and track improvement.
2. **As a player**, I want my run statistics (completed/busted counts) to persist, so I can see my overall performance.
3. **As a player**, I want unlocked regions to remain unlocked, so I don't lose access to content I've earned.
4. **As a developer**, I want to reduce storage overhead by not archiving individual runs, while preserving all meaningful progression data.

## Functional Requirements

### 1. Progression Data Storage

1.1. The system must persist all-time deepest depth reached across all runs
1.2. The system must persist total runs completed (count)
1.3. The system must persist total runs busted (count)
1.4. The system must persist total runs attempted (completed + busted)
1.5. The system must persist region unlock state (already implemented via RegionManager)
1.6. The system must update progression data when a run completes successfully
1.7. The system must update progression data when a run busts

### 2. Run Archiving Removal

2.1. The system must NOT archive individual run records after completion
2.2. The system must NOT archive individual run records after busting
2.3. The system must remove completed/busted runs from the run queue after processing progression data
2.4. The system must preserve active and queued runs (these are still needed for gameplay)

### 3. Data Persistence

3.1. All progression data must be persisted to storage immediately upon run completion/bust
3.2. Progression data must survive app restarts
3.3. Progression data must be accessible for UI display and achievements

### 4. Integration Points

4.1. Run completion flow must update progression data before removing run
4.2. Run bust flow must update progression data before removing run
4.3. Achievement system must be able to read progression data
4.4. UI components must be able to read progression data for display

## Non-Goals (Out of Scope)

1. **Run History UI**: Removing the run history screen is out of scope (can be done later)
2. **Migration of Existing Data**: Converting existing archived runs to progression data is out of scope
3. **Export/Import**: Data export/import functionality is out of scope
4. **Analytics**: Detailed analytics on run patterns is out of scope

## Technical Considerations

1. **Storage Location**: Use existing storage system (`src/lib/storage.tsx`)
2. **Storage Key**: Use a dedicated key like `delvers_descent_progression`
3. **Data Structure**: Create a `ProgressionData` interface/type
4. **Integration Points**:
   - `src/app/(app)/active-run.tsx` - Cash out flow
   - `src/app/(app)/bust-screen.tsx` - Bust flow
   - `src/lib/delvers-descent/run-queue.ts` - Run status updates
5. **Region Unlocks**: Already handled by `RegionManager`, no changes needed
6. **Shortcuts**: Already handled by `ShortcutManager`, no changes needed
7. **Collections**: Already handled by `CollectionManager`, no changes needed

## Success Metrics

1. All progression data persists correctly after app restart
2. Deepest depth reached updates correctly on successful runs
3. Run statistics increment correctly on completion/bust
4. No individual run records are archived after completion/bust
5. All existing functionality (collections, shortcuts, regions) continues to work

## Open Questions

None - requirements are clear and implementation is straightforward.
