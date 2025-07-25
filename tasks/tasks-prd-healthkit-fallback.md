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

  - [ ] 1.1 Enhance `useHealthKitAvailability` hook to detect permission denied scenarios
  - [ ] 1.2 Create `useManualEntryMode` hook to track manual vs HealthKit mode
  - [ ] 1.3 Implement fallback logic to automatically suggest manual entry when HealthKit unavailable
  - [ ] 1.4 Add developer mode flag to bypass HealthKit availability checks
  - [ ] 1.5 Create user choice interface to select between HealthKit and manual modes

- [ ] 2.0 Manual Step Entry Interface and Validation (#133)

  - [ ] 2.1 Create `ManualStepEntry` component with number input field
  - [ ] 2.2 Implement step count validation to ensure data structure compatibility
  - [ ] 2.3 Add input constraints (positive numbers, reasonable daily limits)
  - [ ] 2.4 Create confirmation dialog for manual step entry submission
  - [ ] 2.5 Implement error handling for invalid step entries
  - [ ] 2.6 Add loading states during step entry processing

- [ ] 3.0 Storage Integration for Manual Entries (#134)

  - [ ] 3.1 Extend storage functions to handle manual step entries
  - [ ] 3.2 Create `setManualStepEntry` function in storage.tsx
  - [ ] 3.3 Implement `getManualStepEntry` function for retrieving manual data
  - [ ] 3.4 Add manual entry tracking to prevent duplicate daily entries
  - [ ] 3.5 Create storage migration for existing users to support manual entries
  - [ ] 3.6 Implement data structure validation before storage operations

- [ ] 4.0 Experience and Currency System Integration (#135)

  - [ ] 4.1 Modify `useStepCountAsExperience` to handle manual step data
  - [ ] 4.2 Update `mergeExperienceMMKV` to process manual entries identically to HealthKit
  - [ ] 4.3 Integrate manual steps with streak detection system
  - [ ] 4.4 Ensure manual entries trigger currency conversion correctly
  - [ ] 4.5 Update cumulative experience calculation to include manual entries
  - [ ] 4.6 Test experience/currency parity between HealthKit and manual entries

- [ ] 5.0 Settings Screen Integration and Developer Mode (#136)

  - [ ] 5.1 Add manual entry section to settings screen
  - [ ] 5.2 Implement developer mode toggle in settings
  - [ ] 5.3 Create manual entry history display in settings
  - [ ] 5.4 Add clear manual entries functionality for testing
  - [ ] 5.5 Implement step entry frequency controls (daily vs multiple times)
  - [ ] 5.6 Add visual indicators for current entry mode (HealthKit vs Manual)

- [ ] 6.0 Testing and Error Handling (#137)
  - [ ] 6.1 Write unit tests for manual entry validation logic
  - [ ] 6.2 Create integration tests for manual entry flow
  - [ ] 6.3 Test fallback scenarios when HealthKit is unavailable
  - [ ] 6.4 Implement error boundaries for manual entry failures
  - [ ] 6.5 Add logging for debugging manual entry issues
  - [ ] 6.6 Test data structure compatibility with existing HealthKit hooks
