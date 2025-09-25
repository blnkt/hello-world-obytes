# Task List: Character System Simplification

## Relevant Files

- `src/types/character.ts` - Contains Character type definition and FITNESS_CLASSES constant to be removed
- `src/types/character.test.ts` - Unit tests for character types and utilities
- `src/components/character/character-sheet.tsx` - Main character sheet component that uses FitnessClassFields
- `src/components/character/character-sheet.test.tsx` - Unit tests for character sheet component
- `src/components/character/character-form.tsx` - Character creation form with class selection
- `src/components/character/character-form.test.tsx` - Unit tests for character form component
- `src/components/character/fitness-background-class-fields.tsx` - Component to be completely removed
- `src/components/character/fitness-background-class-fields.test.tsx` - Unit tests for fitness class fields
- `src/components/character/class-info.tsx` - Component to be completely removed
- `src/components/character/class-info.test.tsx` - Unit tests for class info component
- `src/components/character/attributes-section.tsx` - May need updates to remove class attribute references
- `src/components/character/attributes-section.test.tsx` - Unit tests for attributes section
- `src/components/character/utils.ts` - Contains class-related utility functions to be removed
- `src/components/character/utils.test.ts` - Unit tests for character utilities
- `src/app/character-creation.tsx` - Character creation screen that uses character form
- `src/app/character-creation.test.tsx` - Unit tests for character creation screen
- `src/app/(app)/character-sheet.tsx` - Character sheet screen wrapper
- `src/app/(app)/character-sheet.test.tsx` - Unit tests for character sheet screen
- `src/lib/character-migration.ts` - New file for data migration utility
- `src/lib/character-migration.test.ts` - Unit tests for migration utility

### Notes

- Unit tests should typically be placed alongside the code files they are testing
- Use `pnpm test [optional/path/to/test/file]` to run tests
- All class-related components and utilities will be completely removed
- Data migration will be a one-time process to clean existing character data

## Tasks

- [x] 1.0 Update Character Type Definition and Remove Class Constants
  - [x] 1.1 Remove `class` field from Character type definition in `src/types/character.ts`
  - [x] 1.2 Remove `classAttributes` object from Character type definition
  - [x] 1.3 Remove `FITNESS_CLASSES` constant and all class data
  - [x] 1.4 Remove `getStartingAttributes` function
  - [x] 1.5 Update Character type exports and imports across the codebase
  - [x] 1.6 Update unit tests for Character type changes

- [x] 2.0 Remove Class-Related Components and Utilities
  - [x] 2.1 Delete `src/components/character/fitness-background-class-fields.tsx` component
  - [x] 2.2 Delete `src/components/character/fitness-background-class-fields.test.tsx` tests
  - [x] 2.3 Delete `src/components/character/class-info.tsx` component
  - [x] 2.4 Delete `src/components/character/class-info.test.tsx` tests
  - [x] 2.5 Remove class-related utility functions from `src/components/character/utils.ts`
  - [x] 2.6 Update `src/components/character/utils.test.ts` to remove class-related tests
  - [x] 2.7 Remove all imports and references to deleted components

- [x] 3.0 Update Character Creation Flow
  - [x] 3.1 Remove FitnessClassFields import and usage from `src/components/character/character-form.tsx`
  - [x] 3.2 Remove `selectedClass` and `setSelectedClass` props from CharacterForm component
  - [x] 3.3 Simplify CharacterForm to only include name input field
  - [x] 3.4 Update character creation form UI text and descriptions
  - [x] 3.5 Update `src/app/character-creation.tsx` to remove class selection state
  - [x] 3.6 Update character creation tests to reflect simplified form
  - [x] 3.7 Test character creation flow end-to-end

- [x] 4.0 Update Character Sheet Display
  - [x] 4.1 Remove FitnessClassFields import and usage from `src/components/character/character-sheet.tsx`
  - [x] 4.2 Remove class-related props from CharacterSheet component
  - [x] 4.3 Update character sheet layout to remove class information sections
  - [x] 4.4 Update `src/components/character/attributes-section.tsx` to remove class attribute references
  - [x] 4.5 Update character sheet screen wrapper in `src/app/(app)/character-sheet.tsx`
  - [x] 4.6 Update character sheet tests to remove class-related functionality
  - [x] 4.7 Test character sheet display and editing functionality

- [ ] 5.0 Implement Data Migration and Cleanup
  - [ ] 5.1 Create `src/lib/character-migration.ts` utility for data migration
  - [ ] 5.2 Implement migration function to remove class and classAttributes from existing data
  - [ ] 5.3 Preserve character name, level, and experience during migration
  - [ ] 5.4 Add migration utility tests in `src/lib/character-migration.test.ts`
  - [ ] 5.5 Integrate migration into app startup or character loading
  - [ ] 5.6 Test migration with existing character data
  - [ ] 5.7 Remove any remaining references to class functionality in the codebase
  - [ ] 5.8 Run full test suite to ensure no broken references
