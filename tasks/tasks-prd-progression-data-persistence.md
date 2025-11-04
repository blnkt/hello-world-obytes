# Tasks: Progression Data Persistence Refactor

## Relevant Files

- `src/lib/delvers-descent/progression-manager.ts` - New file: Manages progression data persistence and retrieval
- `src/lib/delvers-descent/progression-manager.test.ts` - Unit tests for progression manager
- `src/types/delvers-descent.ts` - Add `ProgressionData` interface
- `src/app/(app)/active-run.tsx` - Update cash out flow to persist progression data
- `src/app/(app)/bust-screen.tsx` - Update bust flow to persist progression data
- `src/lib/delvers-descent/run-queue.ts` - Update to remove completed/busted runs after processing
- `src/lib/delvers-descent/run-queue.test.ts` - Update tests for run removal behavior
- `src/components/home/delvers-descent-card.tsx` - Update to read progression data instead of run statistics
- `src/app/(app)/run-history.tsx` - May need updates if it relies on archived runs (check usage)

### Notes

- Unit tests should be placed alongside the code files they are testing
- Use `pnpm test [optional/path/to/test/file]` to run tests
- Progression data should be persisted immediately when runs complete/bust
- Region unlocks are already handled by `RegionManager`, no changes needed

## Tasks

- [x] 1.0 Create Progression Data Types and Manager
  - [x] 1.1 Add `ProgressionData` interface to `src/types/delvers-descent.ts` with fields: `allTimeDeepestDepth`, `totalRunsCompleted`, `totalRunsBusted`, `totalRunsAttempted`
  - [x] 1.2 Create `src/lib/delvers-descent/progression-manager.ts` with `ProgressionManager` class
  - [x] 1.3 Implement `loadState()` method to load progression data from storage
  - [x] 1.4 Implement `saveState()` method to persist progression data to storage
  - [x] 1.5 Implement `updateDeepestDepth(depth: number)` method to update if depth exceeds current record
  - [x] 1.6 Implement `incrementCompletedRuns()` method to increment completed count
  - [x] 1.7 Implement `incrementBustedRuns()` method to increment busted count
  - [x] 1.8 Implement `getProgressionData()` method to return current progression data
  - [x] 1.9 Implement `processRunCompletion(depth: number)` method that updates depth and increments completed count
  - [x] 1.10 Implement `processRunBust(depth: number)` method that updates depth and increments busted count
  - [x] 1.11 Create singleton pattern for `ProgressionManager` (similar to `RunQueueManager`)

- [x] 2.0 Write Tests for Progression Manager
  - [x] 2.1 Create `src/lib/delvers-descent/progression-manager.test.ts`
  - [x] 2.2 Test initial state (all zeros)
  - [x] 2.3 Test `updateDeepestDepth()` updates when depth is greater
  - [x] 2.4 Test `updateDeepestDepth()` does not update when depth is less
  - [x] 2.5 Test `incrementCompletedRuns()` increments count
  - [x] 2.6 Test `incrementBustedRuns()` increments count
  - [x] 2.7 Test `processRunCompletion()` updates both depth and completed count
  - [x] 2.8 Test `processRunBust()` updates depth (if applicable) and busted count
  - [x] 2.9 Test persistence across app restarts (simulate storage save/load)
  - [x] 2.10 Test `totalRunsAttempted` is calculated correctly (completed + busted)

- [x] 3.0 Integrate Progression Manager into Run Completion Flow
  - [x] 3.1 Update `src/app/(app)/active-run.tsx` `useCashOutFlow` hook
  - [x] 3.2 Import `ProgressionManager` in cash out flow
  - [x] 3.3 Call `progressionManager.processRunCompletion(depth)` before updating run status
  - [x] 3.4 Verify progression data is saved before run is removed from queue
  - [x] 3.5 Update tests in `src/app/(app)/__tests__/gameplay-loop-integration.test.tsx` if needed

- [x] 4.0 Integrate Progression Manager into Run Bust Flow
  - [x] 4.1 Update `src/app/(app)/bust-screen.tsx` bust flow
  - [x] 4.2 Import `ProgressionManager` in bust flow
  - [x] 4.3 Call `progressionManager.processRunBust(depth)` before updating run status
  - [x] 4.4 Verify progression data is saved before run is removed from queue
  - [x] 4.5 Update bust screen tests if needed

- [x] 5.0 Remove Run Archiving from Run Queue
  - [x] 5.1 Update `src/lib/delvers-descent/run-queue.ts` `updateRunStatus()` method
  - [x] 5.2 When status is set to 'completed' or 'busted', remove run from `runs` array instead of keeping it
  - [x] 5.3 Ensure run is removed only after progression data is processed (verify order of operations)
  - [x] 5.4 Update `getRunStatistics()` to use progression data instead of calculating from runs array
  - [x] 5.5 Update `getCompletedRuns()` to return empty array (no longer tracking)
  - [x] 5.6 Update `getBustedRuns()` to return empty array (no longer tracking)
  - [x] 5.7 Update tests in `src/lib/delvers-descent/run-queue.test.ts` to reflect new behavior

- [x] 6.0 Update UI Components to Use Progression Data
  - [x] 6.1 Update `src/components/home/delvers-descent-card.tsx` to read from `ProgressionManager`
  - [x] 6.2 Replace `getCompletedRuns()` calls with `progressionManager.getProgressionData().totalRunsCompleted`
  - [x] 6.3 Update any other UI components that display run statistics
  - [x] 6.4 Check `src/app/(app)/run-history.tsx` - if it only displays archived runs, it may need to show "No history available" message or be updated
  - [x] 6.5 Update tests for UI components that use run statistics

- [x] 7.0 Verify Integration and Cleanup
  - [x] 7.1 Run full test suite to ensure no regressions
  - [x] 7.2 Verify progression data persists correctly in manual testing (instructions created in `tasks/manual-testing-progression-data.md`)
  - [x] 7.3 Verify completed/busted runs are removed from queue
  - [x] 7.4 Verify region unlocks still work (no changes needed, but verify)
  - [x] 7.5 Verify shortcuts still work (no changes needed, but verify)
  - [x] 7.6 Verify collections still work (no changes needed, but verify)
  - [x] 7.7 Remove any dead code related to run archiving if found
