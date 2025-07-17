# Task List: HealthKit Fallback Mechanism

## Relevant Files

- `src/lib/health/index.tsx` - Main health module containing HealthKit integration and hooks
- `src/lib/health/index.test.tsx` - Unit tests for health module functionality
- `src/lib/storage.tsx` - Storage utilities for MMKV data persistence
- `src/lib/storage.test.tsx` - Unit tests for storage functionality
- `src/app/(app)/settings.tsx` - Settings screen to be extended with manual entry option
- `src/app/(app)/settings.test.tsx` - Unit tests for settings screen
- `src/components/ui/input.tsx` - Input component for manual step entry
- `src/components/ui/input.test.tsx` - Unit tests for input component
- `src/components/ui/button.tsx` - Button component for manual entry actions
- `src/components/ui/button.test.tsx` - Unit tests for button component
- `src/types/health.ts` - TypeScript types for health-related data structures
- `src/types/health.test.ts` - Unit tests for health types

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `pnpm test [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [ ] 1.0 HealthKit Availability Detection and Fallback Logic (#132)

  - [x] 1.1 Enhance `useHealthKitAvailability` hook to detect permission denied scenarios
  - [x] 1.2 Create `useManualEntryMode` hook to track manual vs HealthKit mode
  - [x] 1.3 Implement fallback logic to automatically suggest manual entry when HealthKit unavailable
  - [x] 1.4 Add developer mode flag to bypass HealthKit availability checks
  - [x] 1.5 Create user choice interface to select between HealthKit and manual modes

- [ ] 2.0 Manual Step Entry Interface and Validation (#133)

  - [x] 2.1 Create `ManualStepEntry` component with number input field
  - [x] 2.2 Implement step count validation to ensure data structure compatibility
  - [x] 2.3 Add input constraints (positive numbers, reasonable daily limits)
  - [x] 2.4 Create confirmation dialog for manual step entry submission
  - [x] 2.5 Implement error handling for invalid step entries
  - [x] 2.6 Add loading states during step entry processing

- [ ] 3.0 Storage Integration for Manual Entries (#134)

  - [x] 3.1 Extend storage functions to handle manual step entries
  - [x] 3.2 Create `setManualStepEntry` function in storage.tsx
  - [x] 3.3 Implement `getManualStepEntry` function for retrieving manual data
  - [x] 3.4 Add manual entry tracking to prevent duplicate daily entries
  - [x] 3.5 Create storage migration for existing users to support manual entries
  - [x] 3.6 Implement data structure validation before storage operations

- [ ] 4.0 Experience and Currency System Integration (#135)

  - [x] 4.1 Modify `useStepCountAsExperience` to handle manual step data
  - [x] 4.2 Update `mergeExperienceMMKV` to process manual entries identically to HealthKit
  - [x] 4.3 Integrate manual steps with streak detection system
  - [x] 4.4 Ensure manual entries trigger currency conversion identically to HealthKit entries
  - [x] 4.5 Update cumulative experience calculation to include manual entries
  - [x] 4.6 Test experience/currency parity between HealthKit and manual entries

- [ ] 5.0 Settings Screen Integration and Developer Mode (#136)

  - [x] 5.1 Add manual entry section to settings screen
  - [x] 5.2 Implement developer mode toggle in settings
  - [x] 5.3 Create manual entry history display in settings
  - [x] 5.4 Add clear manual entries functionality for testing
  - [x] 5.5 Implement step entry frequency controls (daily vs multiple times)
  - [ ] 5.6 Add visual indicators for current entry mode (HealthKit vs Manual)

- [ ] 6.0 Testing and Error Handling (#137)
  - [ ] 6.1 Write unit tests for manual entry validation logic
  - [ ] 6.2 Create integration tests for manual entry flow
  - [ ] 6.3 Test fallback scenarios when HealthKit is unavailable
  - [ ] 6.4 Implement error boundaries for manual entry failures
  - [ ] 6.5 Add logging for debugging manual entry issues
  - [ ] 6.6 Test data structure compatibility with existing HealthKit hooks

## Subtask 4.6: Experience/Currency Parity Tests ✅ COMPLETED

- [x] Test that manual step entries trigger currency conversion identically to HealthKit entries
- [x] Test that experience calculation is identical between HealthKit and manual entries
- [x] Test that currency calculation is identical between HealthKit and manual entries
- [x] Test mixed scenarios with both HealthKit and manual data
- [x] Optimize HealthKit mock with `__setStepSamples` helper for faster, more reliable testing
- [x] Update all parity tests to use optimized mock
- [x] Verify all existing tests still pass with optimized mock

## Subtask 4.7: Optimize All HealthKit Tests ✅ COMPLETED

- [x] Update all test files using HealthKit to use the new optimized mock
- [x] Verify that `src/lib/health/index.test.tsx` still passes (uses only availability methods)
- [x] Verify that `src/lib/__tests__/healthCore.test.ts` still passes (no HealthKit usage)
- [x] Confirm `src/lib/__tests__/health.manual-steps.test.tsx` uses optimized mock
- [x] Run comprehensive test suite to ensure all tests pass
- [x] Document the optimization benefits (faster test execution, more reliable testing)

## Subtask 4.8: Final Integration Testing
