# Product Requirements Document: HealthKit Fallback Mechanism

## Introduction/Overview

This feature implements a fallback mechanism for when HealthKit data is unavailable, allowing users to manually enter step data. The system will seamlessly integrate manual step entries with the existing HealthKit-based experience and currency system, ensuring users can continue their fitness journey regardless of HealthKit availability or permissions.

**Problem:** Users cannot earn experience or currency when HealthKit is unavailable (permissions denied, unsupported device, etc.), breaking the core gamification loop.

**Goal:** Provide a seamless manual step entry system that maintains the same user experience and rewards as HealthKit data.

## Goals

1. **Enable Manual Step Entry:** Allow users to manually input step data when HealthKit is unavailable
2. **Maintain Data Consistency:** Ensure manual entries conform to the same data structure as HealthKit
3. **Seamless Integration:** Manual steps should work identically to HealthKit steps for experience/currency calculation
4. **Developer Flexibility:** Provide developer option to manually enter steps regardless of HealthKit status
5. **User Choice:** Display both HealthKit and manual options, letting users choose their preferred method

## User Stories

1. **As a user with HealthKit permissions denied**, I want to manually enter my step count so that I can continue earning experience and currency in the app.

2. **As a user on a device without HealthKit support**, I want to manually track my steps so that I can participate in the fitness gamification features.

3. **As a developer**, I want to manually enter step data for testing purposes so that I can verify the app's functionality without relying on HealthKit.

4. **As a user**, I want to choose between automatic HealthKit tracking and manual entry so that I can use the method that works best for my situation.

5. **As a user**, I want my manual step entries to work exactly like HealthKit data so that I don't lose any functionality or rewards.

## Functional Requirements

1. **HealthKit Availability Detection:** The system must detect when HealthKit is unavailable (permissions denied, unsupported device) and prompt for manual entry option.

2. **Manual Entry Interface:** The system must provide a dedicated manual entry screen with a simple number input field for step count.

3. **Data Validation:** The system must validate that manually entered step data conforms to the same data structure as HealthKit data before saving.

4. **Storage Integration:** The system must store manual step entries using the same storage mechanisms as HealthKit data (MMKV storage).

5. **Experience/Currency Integration:** The system must process manual step entries through the same experience and currency calculation systems as HealthKit data.

6. **Developer Mode:** The system must provide a developer option to manually enter steps regardless of HealthKit availability status.

7. **User Choice Interface:** The system must display both HealthKit and manual entry options, allowing users to choose their preferred method.

8. **Permanent Storage:** The system must make manual entries permanent and non-editable once saved.

9. **Seamless UI:** The system must integrate manual entries seamlessly without visual distinction from HealthKit data.

10. **Settings Integration:** The system must provide access to manual entry functionality through the settings screen.

## Non-Goals (Out of Scope)

- **Data Editing:** Users cannot edit previously entered manual step data
- **Visual Distinction:** No special visual indicators to distinguish manual from HealthKit data
- **Reduced Rewards:** Manual steps will not have reduced experience or currency rewards
- **Separate Tracking:** Manual steps will not be tracked separately from HealthKit steps
- **Advanced Validation:** No complex validation beyond ensuring data structure compatibility
- **Historical Data Import:** No bulk import of historical step data
- **Third-party Integration:** No integration with other fitness tracking apps or services

## Design Considerations

- **Simple Input:** Use a basic number input field for step entry, avoiding complex UI elements
- **Settings Placement:** Add manual entry option to the existing settings screen for easy access
- **Consistent Styling:** Match the existing app's design language and component library
- **Error Handling:** Provide clear error messages for invalid step entries
- **Loading States:** Show appropriate loading indicators during data processing

## Technical Considerations

- **Data Structure Compatibility:** Manual entries must conform to the existing HealthKit data structure used in `src/lib/health/index.tsx`
- **Storage Integration:** Use existing MMKV storage functions from `src/lib/storage.tsx`
- **Hook Integration:** Integrate with existing health hooks (`useStepCount`, `useStepCountAsExperience`, etc.)
- **Settings Integration:** Extend the existing settings screen (`src/app/(app)/settings.tsx`)
- **Type Safety:** Maintain TypeScript type safety throughout the implementation
- **Error Boundaries:** Implement proper error handling for manual entry failures

## Success Metrics

1. **User Adoption:** 80% of users with HealthKit issues successfully use manual entry
2. **Data Integrity:** 100% of manual entries pass validation and conform to HealthKit data structure
3. **Feature Parity:** Manual entries provide identical experience/currency rewards as HealthKit data
4. **Developer Efficiency:** Developer can test all features without HealthKit dependency
5. **User Satisfaction:** No user complaints about manual entry functionality or integration

## Open Questions

1. **Entry Frequency:** Should users be able to enter steps multiple times per day, or once per day?
2. **Default Values:** Should the manual entry field have a default value (e.g., 0) or be empty?
3. **Input Limits:** What should be the maximum number of steps a user can enter in one day?
4. **Confirmation:** Should users be required to confirm their manual entry before saving?
5. **Backup Strategy:** Should manual entries be backed up or synced with any cloud storage?
