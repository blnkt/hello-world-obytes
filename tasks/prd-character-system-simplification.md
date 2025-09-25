# Product Requirements Document: Character System Simplification

## Introduction/Overview

This PRD outlines the simplification of the character system by removing the complex fitness class and class attributes functionality. The current system includes 5 different fitness classes (Cardio Crusher, Strength Seeker, Flexibility Fanatic, Weight Loss Warrior, General Fitness) with unique attributes, XP bonuses/penalties, and special abilities. This complexity is too much for the early prototype phase and should be removed to focus on core gameplay mechanics.

**Problem:** The current character class system adds unnecessary complexity to the early prototype, making it harder to iterate on core features and potentially confusing users with too many choices.

**Goal:** Simplify the character system to focus on basic character progression (name, level, experience) without class-based complexity.

## Goals

1. **Reduce Complexity:** Remove fitness class selection and class-specific attributes from the character system
2. **Simplify Character Creation:** Streamline the character creation flow to focus on essential elements
3. **Unified XP System:** Implement flat XP gain without class-based bonuses or penalties
4. **Clean Data Model:** Remove class-related fields from the Character type definition
5. **Reset User Experience:** Provide a clean slate for users by resetting character data

## User Stories

### As a new user:

- I want to create a character quickly without being overwhelmed by class choices
- I want to understand my character's progression without complex attribute calculations
- I want a simple, clear character sheet that shows my basic stats

### As an existing user:

- I want my character data to be reset to a clean, simplified state
- I want to continue my fitness journey without losing my core progress (name, level, experience)

### As a developer:

- I want a simpler codebase that's easier to maintain and iterate on
- I want to focus on core gameplay mechanics without class system complexity

## Functional Requirements

### 1. Character Type Simplification

1.1. Remove `class` field from Character type definition
1.2. Remove `classAttributes` object from Character type definition
1.3. Keep core fields: `name`, `level`, `experience`, `skills`, `equipment`, `abilities`, `notes`

### 2. Character Creation Flow

2.1. Remove class selection from character creation screen
2.2. Remove `FitnessClassFields` component from character creation
2.3. Simplify character creation to only include name input
2.4. Remove class-related validation and logic

### 3. Character Sheet Simplification

3.1. Remove `FitnessClassFields` component from character sheet
3.2. Remove class information display
3.3. Remove class-specific attribute displays
3.4. Keep name editing, level/experience display, and basic character info

### 4. XP and Leveling System

4.1. Remove all class-based XP multipliers and bonuses
4.2. Implement flat XP gain for all activities
4.3. Remove class-specific special abilities
4.4. Keep existing level progression system (FITNESS_LEVELS)

### 5. Data Migration

5.1. Reset all existing character data to simplified format
5.2. Preserve character name, level, and experience where possible
5.3. Remove class and classAttributes from stored character data
5.4. Provide migration utility to clean existing data

### 6. Code Cleanup

6.1. Remove `FITNESS_CLASSES` constant and related data
6.2. Remove `getStartingAttributes` function
6.3. Remove `FitnessClassFields` component entirely
6.4. Remove `ClassInfo` component and related class display components
6.5. Remove class-related utility functions
6.6. Update all references to removed class functionality

### 7. Testing Updates

7.1. Update character creation tests to remove class selection
7.2. Update character sheet tests to remove class-related functionality
7.3. Update character form tests to reflect simplified structure
7.4. Add tests for data migration functionality

## Non-Goals (Out of Scope)

- **Class System Preservation:** We will not keep any class-related code for future reimplementation
- **Gradual Migration:** We will not provide a gradual transition - this is a complete removal
- **Class Data Backup:** We will not preserve existing class data for potential restoration
- **Alternative Class Systems:** We will not implement any replacement class or specialization system
- **Complex Attribute Systems:** We will not implement any alternative attribute or stat system

## Design Considerations

### UI/UX Changes

- **Character Creation:** Simplified to single name input field
- **Character Sheet:** Cleaner layout without class information sections
- **Navigation:** No changes to overall app navigation structure

### Data Structure Changes

```typescript
// Before
type Character = {
  name: string;
  class: string; // REMOVE
  level: number;
  experience: number;
  classAttributes: {
    // REMOVE
    might: number;
    speed: number;
    fortitude: number;
  };
  skills: string[];
  equipment: string[];
  abilities: string[];
  notes?: string;
};

// After
type Character = {
  name: string;
  level: number;
  experience: number;
  skills: string[];
  equipment: string[];
  abilities: string[];
  notes?: string;
};
```

## Technical Considerations

### Dependencies to Remove

- `FitnessClassFields` component and all its dependencies
- `ClassInfo` component and related class display components
- `FITNESS_CLASSES` constant and `getStartingAttributes` function
- Class-related utility functions in `utils.ts`

### Files to Modify

- `src/types/character.ts` - Remove class-related types and constants
- `src/components/character/character-sheet.tsx` - Remove FitnessClassFields
- `src/components/character/character-form.tsx` - Remove class selection
- `src/app/character-creation.tsx` - Simplify creation flow
- `src/app/(app)/character-sheet.tsx` - Update character sheet screen
- All test files related to character functionality

### Migration Strategy

- Create a one-time migration script to reset character data
- Remove class-related fields from stored character data
- Preserve core character information (name, level, experience)

## Success Metrics

1. **Code Reduction:** Reduce character-related code by approximately 40-50%
2. **Simplified User Flow:** Character creation takes less than 30 seconds
3. **Clean Data Model:** Character type has fewer than 8 fields
4. **Zero Class References:** No remaining references to class functionality in codebase
5. **Successful Migration:** All existing character data successfully migrated to simplified format

## Open Questions

1. **Experience Preservation:** Should we preserve the exact experience values from existing characters, or reset to level-appropriate values?
2. **Skills/Equipment:** Should we keep existing skills and equipment arrays, or reset them to empty?
3. **Migration Timing:** Should this migration happen automatically on app startup, or require user confirmation?
4. **Rollback Plan:** Do we need any rollback mechanism if the migration fails?

## Implementation Priority

1. **High Priority:** Character type definition changes and data migration
2. **High Priority:** Remove FitnessClassFields from character creation and sheet
3. **Medium Priority:** Code cleanup and removal of unused components
4. **Medium Priority:** Update tests to reflect simplified structure
5. **Low Priority:** UI polish and layout adjustments

---

**Next Steps:** After creating this PRD, use the task generation workflow to create detailed implementation tasks.
