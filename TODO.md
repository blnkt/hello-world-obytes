# TODO List

This document consolidates all TODOs from the codebase, organized by development phases and categories.

## Phase 1 - Core Functionality & Stability

### Health System

- [ ] **Fix unused merge functions** - Implement `mergeStepsByDayMMKV` in the main hook (`mergeExperienceMMKV` implemented)

  - **File**: `src/lib/health/index.tsx:27`
  - **Priority**: High
  - **Description**: Complete the step data management system

- [ ] **Add data validation** - Validate step data before saving to prevent corrupted data

  - **File**: `src/lib/health/index.tsx:32`
  - **Priority**: High
  - **Description**: Implement validation for HealthKit data before storage

- [ ] **Implement data recovery** - Add fallback mechanisms when HealthKit data is unavailable

  - **File**: `src/lib/health/index.tsx:33`
  - **Priority**: High
  - **Description**: Handle cases where HealthKit is not accessible

- [ ] **Optimize data storage** - Improve MMKV usage and data structure

  - **File**: `src/lib/health/index.tsx:34`
  - **Priority**: Medium
  - **Description**: Review and optimize current storage implementation

- [ ] **Add offline support** - Cache step data locally when HealthKit is not available

  - **File**: `src/lib/health/index.tsx:35`
  - **Priority**: Medium
  - **Description**: Implement local caching for offline functionality

- [ ] **Implement mergeStepsByDayMMKV function** - Better step data management
  - **File**: `src/lib/health/index.tsx:220`
  - **Priority**: High
  - **Description**: Complete the step data merging functionality

### Testing

- [ ] **Add comprehensive tests** - Unit and integration tests for all features
  - **File**: `src/lib/health/index.tsx:173`
  - **Priority**: High
  - **Description**: Expand test coverage for health system and other core features

### UI/UX

- [ ] **Update cover images** - Should be updated to simple images

  - **File**: `src/components/cover.tsx:4`
  - **Priority**: Low
  - **Description**: Replace current cover implementation with simpler image approach

- [ ] **Fix button test styling** - Should be fixed to use haveStyle instead of comparing the class name
  - **File**: `src/components/ui/button.test.tsx:83`
  - **Priority**: Low
  - **Description**: Improve test reliability by using proper style assertions

## Phase 2 - Feature Expansion

### Scenario System

- [ ] **Expand scenario variety** - Add more merchant and monster encounters

  - **File**: `src/lib/scenario.ts:2`
  - **Priority**: Medium
  - **Description**: Increase variety of encounters and scenarios

- [ ] **Add scenario outcomes** - Implement actual rewards and consequences
  - **File**: `src/lib/scenario.ts:3`
  - **Priority**: Medium
  - **Description**: Implement meaningful outcomes for scenario choices

## Phase 3 - Advanced Features

### Inventory & Quest Systems

- [ ] **Add inventory system** - Let players collect and use items from scenarios

  - **File**: `src/types/character.ts:16`
  - **Priority**: Medium
  - **Description**: Implement item collection and management system

- [ ] **Create quest system** - Add daily/weekly quests with rewards
  - **File**: `src/types/character.ts:17`
  - **Priority**: Medium
  - **Description**: Implement quest-based progression system

### Performance Optimization

- [ ] **Optimize data fetching** - Reduce API calls by implementing smarter caching
  - **File**: `src/lib/health/index.tsx:36`
  - **Priority**: Medium
  - **Description**: Implement intelligent caching to reduce HealthKit API calls

## Phase 4 - Polish & Enhancement

### UI/UX Improvements

- [ ] **Add animations** - Smooth transitions between screens and interactions

  - **File**: `src/app/(app)/_layout.tsx:10`
  - **Priority**: Low
  - **Description**: Implement smooth animations for better user experience

- [ ] **Add character portraits** - Visual representation of characters

  - **File**: `src/app/(app)/_layout.tsx:11`
  - **Priority**: Low
  - **Description**: Add visual character representation

- [ ] **Implement particle effects** - Visual effects for level-ups and achievements
  - **File**: `src/app/(app)/_layout.tsx:12`
  - **Priority**: Low
  - **Description**: Add visual feedback for achievements

### Code Quality

- [ ] **Refactor duplicate code** - Consolidate similar functionality
  - **File**: `src/lib/health/index.tsx:174`
  - **Priority**: Medium
  - **Description**: Identify and consolidate duplicate code patterns

## Configuration & Deployment

### Environment Setup

- [ ] **Replace environment values** - Replace placeholder values with actual configuration
  - **File**: `env.js:34`
  - **Priority**: Medium
  - **Description**: Update environment configuration with actual values

### iOS Configuration

- [ ] **Enable iOS builds** - Set IOS as true when iOS account is ready
  - **File**: `.github/workflows/eas-build-qa.yml:45`
  - **Priority**: Medium
  - **Description**: Enable iOS build pipeline when account is configured

### GitHub Actions

- [ ] **Handle auto-submit** - Implement auto-submit functionality for builds
  - **File**: `.github/actions/eas-build/action.yml:34`
  - **Priority**: Low
  - **Description**: Complete auto-submit implementation for build automation

## Internationalization

### Language Support

- [ ] **Configure default language** - Set default language if not supporting multiple languages
  - **File**: `src/lib/i18n/index.tsx:11`
  - **Priority**: Low
  - **Description**: Optimize language configuration for single-language apps

## Notes

- **Priority Levels**: High (Critical functionality), Medium (Important features), Low (Nice-to-have)
- **File References**: Each TODO includes the specific file and line number for easy location
- **Phase Organization**: TODOs are organized by development phases to help with planning
- **Context Preservation**: Original context and descriptions are maintained for clarity

## Recommendations

1. **Keep TODOs close to code** for implementation-specific details
2. **Use this consolidated list** for project planning and progress tracking
3. **Update both locations** when adding new TODOs
4. **Consider using issue tracking** for more complex features that span multiple files
5. **Regular review** of this list during sprint planning sessions
