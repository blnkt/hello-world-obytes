# Tasks: Codebase Cleanup & Refactoring

## Relevant Files

- `src/components/buttons.tsx` - ✅ Demo component removed
- `src/components/colors.tsx` - ✅ Demo component removed
- `src/components/inputs.tsx` - ✅ Demo component removed
- `src/components/typography.tsx` - ✅ Demo component removed
- `src/components/title.tsx` - ✅ Demo component removed
- `src/app/(app)/style.tsx` - ✅ Demo screen removed
- `src/components/character/utils.ts` - Contains utility functions (actually used, kept)
- `src/components/__tests__/demo-components-cleanup.test.tsx` - Test file to verify demo components removal
- `src/components/ui/colors.tsx` - ✅ Color system converted to TypeScript with proper interfaces
- `src/lib/storage.tsx` - Storage utilities requiring type safety improvements
- `src/components/history/` - History components requiring type safety improvements
- `src/components/character/` - Character components requiring type safety improvements
- `src/api/` - API utilities requiring type safety improvements
- `__mocks__/dungeon-game-persistence.ts` - New centralized mock for dungeon game persistence
- `__mocks__/health-hooks.ts` - New centralized mock for health-related hooks
- `__mocks__/storage-functions.ts` - New centralized mock for storage functions
- `package.json` - Dependencies to be removed and updated
- `README.md` - Documentation to be updated with new guidelines

### Notes

- Unit tests should typically be placed alongside the code files they are testing
- Use `pnpm test [optional/path/to/test/file]` to run tests
- All work must be done on the `feature/prd-codebase-cleanup` branch
- Breaking changes are acceptable for significant code quality improvements

## Tasks

- [ ] 1.0 Remove Demo Components and Unused Dependencies

  - [x] 1.1 Delete demo component files: buttons.tsx, colors.tsx, inputs.tsx, typography.tsx, title.tsx
  - [x] 1.2 Delete demo screen file: src/app/(app)/style.tsx
  - [x] 1.3 Remove unused utility file: src/components/character/utils.ts (actually used - kept)
  - [x] 1.4 Remove unused npm dependencies: @hookform/resolvers, expo-dev-client, expo-font, expo-status-bar, expo-system-ui, react-error-boundary
  - [x] 1.5 Update package.json to remove unused dependencies
  - [x] 1.6 Run pnpm install to clean up lock file
  - [x] 1.7 Verify no broken imports after demo component removal

- [x] 2.0 Consolidate Color Systems and Utility Functions

  - [x] 2.1 Convert src/components/ui/colors.js to TypeScript (.tsx)
  - [x] 2.2 Audit all color definitions across the codebase for duplicates
  - [x] 2.3 Remove duplicate color definitions and consolidate into single system
  - [x] 2.4 Update all component imports to use consolidated color system
  - [x] 2.5 Identify and merge duplicate utility functions across codebase
  - [x] 2.6 Create single source of truth for common utilities
  - [x] 2.7 Update all imports to use consolidated utilities
  - [x] 2.8 Verify color consistency and accessibility compliance

- [x] 3.0 Improve Type Safety Across Codebase

  - [x] 3.1 Create proper interfaces for data structures in src/lib/storage.tsx
  - [x] 3.2 Replace any[] types in history components with proper interfaces
  - [x] 3.3 Replace any types in character components with proper interfaces
  - [x] 3.4 Replace any types in API utilities with proper types
  - [x] 3.5 Add explicit return types to all functions missing them
  - [ ] 3.6 Add explicit parameter types to all functions missing them
  - [ ] 3.7 Add generic types where appropriate for reusable functions
  - [ ] 3.8 Run TypeScript compiler to verify no type errors

- [ ] 4.0 Consolidate Test Mocks and Standardize Patterns

  - [ ] 4.1 Create **mocks**/dungeon-game-persistence.ts with centralized mock implementation
  - [ ] 4.2 Create **mocks**/health-hooks.ts with standardized health hook mocks
  - [ ] 4.3 Create **mocks**/storage-functions.ts with centralized storage mocks
  - [ ] 4.4 Add TypeScript interfaces for all mock implementations
  - [ ] 4.5 Include helper functions for common mock scenarios (setup, teardown, reset)
  - [ ] 4.6 Update all test files to import from centralized mocks
  - [ ] 4.7 Define standard mock structure and naming conventions
  - [ ] 4.8 Create mock factory functions for complex objects
  - [ ] 4.9 Add documentation for mock usage patterns
  - [ ] 4.10 Verify all tests pass with centralized mocks

- [ ] 5.0 Update Documentation and Measure Performance Improvements
  - [ ] 5.1 Update README.md with new development guidelines
  - [ ] 5.2 Document new error handling patterns and usage examples
  - [ ] 5.3 Create component usage guidelines for future development
  - [ ] 5.4 Update testing guidelines with new mock patterns
  - [ ] 5.5 Measure bundle size reduction and document improvements
  - [ ] 5.6 Measure build time improvements and document gains
  - [ ] 5.7 Create performance monitoring guidelines
  - [ ] 5.8 Document all breaking changes and migration guides
  - [ ] 5.9 Verify all success metrics from PRD are achieved
