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
- `__mocks__/dungeon-game-persistence.ts` - ✅ Centralized mock for dungeon game persistence with TypeScript interfaces and helper functions
- `__mocks__/health-hooks.ts` - ✅ Centralized mock for health-related hooks with TypeScript interfaces and scenario support
- `__mocks__/storage-functions.ts` - ✅ Centralized mock for storage functions with TypeScript interfaces and scenario support
- `__mocks__/types.ts` - ✅ Centralized TypeScript interfaces for all mock implementations with comprehensive type definitions
- `__mocks__/helpers.ts` - ✅ Comprehensive mock helper functions for registry, lifecycle, batch operations, scenarios, validation, state tracking, and debugging
- `__mocks__/README.md` - ✅ Complete documentation for mock structure, naming conventions, usage patterns, migration guide, and troubleshooting
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
  - [x] 3.6 Add explicit parameter types to all functions missing them
  - [x] 3.7 Add generic types where appropriate for reusable functions
  - [x] 3.8 Run TypeScript compiler to verify no type errors

- [x] 4.0 Consolidate Test Mocks and Standardize Patterns

  - [x] 4.1 Create **mocks**/dungeon-game-persistence.ts with centralized mock implementation
  - [x] 4.2 Create **mocks**/health-hooks.ts with standardized health hook mocks
  - [x] 4.3 Create **mocks**/storage-functions.ts with centralized storage mocks
  - [x] 4.4 Add TypeScript interfaces for all mock implementations
  - [x] 4.5 Include helper functions for common mock scenarios (setup, teardown, reset)
  - [x] 4.6 Update all test files to import from centralized mocks
  - [x] 4.7 Define standard mock structure and naming conventions
  - [x] 4.8 Create mock factory functions for complex objects
  - [x] 4.9 Add documentation for mock usage patterns
  - [x] 4.10 Verify all tests pass with centralized mocks

- [x] 5.0 Update Documentation and Measure Performance Improvements
  - [x] 5.1 Update README.md with new development guidelines
  - [x] 5.3 Create component usage guidelines for future development
    - [x] 5.4 Update testing guidelines with new mock patterns
  - [x] 5.5 Measure bundle size reduction and document improvements
  - [x] 5.6 Measure build time improvements and document gains
  - [x] 5.7 Create performance monitoring guidelines
  - [ ] 5.8 Document all breaking changes and migration guides
  - [ ] 5.9 Verify all success metrics from PRD are achieved

## Relevant Files

- `README.md` - ✅ Updated with comprehensive development guidelines covering type safety, testing standards, code quality, performance, development workflow, troubleshooting, and migration guide
- `docs/COMPONENT_GUIDELINES.md` - ✅ Complete component usage guidelines covering structure, naming, props, state management, styling, accessibility, error handling, performance, testing, and documentation
- `docs/TESTING_GUIDELINES.md` - ✅ Comprehensive testing guidelines covering centralized mock system, test structure, component testing, hook testing, integration testing, performance testing, accessibility testing, best practices, common patterns, and troubleshooting
- `docs/BUNDLE_SIZE_ANALYSIS.md` - ✅ Complete bundle size analysis with current metrics (686.91 KB), optimization recommendations, performance improvements achieved, monitoring strategies, and future optimization opportunities
- `docs/BUILD_TIME_ANALYSIS.md` - ✅ Comprehensive build time analysis with current metrics (22.29s total), performance improvements achieved (51% faster TypeScript, 50% faster tests), optimization strategies, and monitoring guidelines
- `scripts/analyze-bundle-size.js` - ✅ Bundle analysis script for measuring source code size, dependencies, mock overhead, and generating optimization recommendations
- `scripts/analyze-build-times.js` - ✅ Build time analysis script for measuring TypeScript compilation, linting, testing, and dependency installation performance
- `scripts/performance-budget.js` - ✅ Performance budget checker for validating metrics against defined budgets with violation detection and recommendations
- `__mocks__/README.md` - ✅ Complete documentation for mock structure, naming conventions, usage patterns, migration guide, and troubleshooting
