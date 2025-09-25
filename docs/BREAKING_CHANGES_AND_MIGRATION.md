# Breaking Changes and Migration Guide

This document outlines all breaking changes introduced during the codebase cleanup and refactoring process, along with comprehensive migration guides to help developers transition to the new patterns and standards.

## Table of Contents

- [Overview](#overview)
- [Breaking Changes Summary](#breaking-changes-summary)
- [Migration Guides](#migration-guides)
- [Code Style Changes](#code-style-changes)
- [Testing Changes](#testing-changes)
- [Build Configuration Changes](#build-configuration-changes)
- [Performance Impact](#performance-impact)
- [Rollback Procedures](#rollback-procedures)
- [Support and Troubleshooting](#support-and-troubleshooting)

## Overview

### 🎯 Migration Objectives

The codebase cleanup introduced several breaking changes to improve:

- **Code Quality**: Enforced function length and parameter limits
- **Type Safety**: Strict TypeScript standards and explicit typing
- **Testing**: Centralized mock system and standardized patterns
- **Performance**: Optimized build times and bundle size
- **Maintainability**: Consistent coding standards and documentation

### 📊 Impact Assessment

| Category          | Breaking Changes                         | Migration Complexity | Impact Level |
| ----------------- | ---------------------------------------- | -------------------- | ------------ |
| **Code Style**    | Function length limits, parameter limits | Low                  | Minor        |
| **Testing**       | Centralized mock system                  | Medium               | Moderate     |
| **TypeScript**    | Strict typing requirements               | Medium               | Moderate     |
| **Build**         | New scripts and tools                    | Low                  | Minor        |
| **Documentation** | New guidelines and standards             | Low                  | Minor        |

## Breaking Changes Summary

### 🚨 Critical Breaking Changes

#### 1. Function Length Enforcement

- **Change**: Maximum 70 lines per function
- **Impact**: Existing functions exceeding this limit will fail linting
- **Severity**: High
- **Affected Files**: All `.ts` and `.tsx` files

#### 2. Parameter Limit Enforcement

- **Change**: Maximum 3 parameters per function
- **Impact**: Functions with more than 3 parameters will fail linting
- **Severity**: High
- **Affected Files**: All `.ts` and `.tsx` files

#### 3. Centralized Mock System

- **Change**: All mocks moved to `__mocks__/` directory
- **Impact**: Test files using old mock patterns will fail
- **Severity**: High
- **Affected Files**: All test files

### ⚠️ Moderate Breaking Changes

#### 4. TypeScript Strict Mode

- **Change**: Enforced explicit return types and parameter types
- **Impact**: Functions without explicit types will fail compilation
- **Severity**: Medium
- **Affected Files**: All `.ts` and `.tsx` files

#### 5. Import Sorting

- **Change**: Enforced `eslint-plugin-simple-import-sort` ordering
- **Impact**: Incorrectly ordered imports will fail linting
- **Severity**: Medium
- **Affected Files**: All `.ts` and `.tsx` files

#### 6. File Naming Convention

- **Change**: Enforced kebab-case for all files
- **Impact**: Files not following kebab-case will fail linting
- **Severity**: Medium
- **Affected Files**: All files

### 📝 Minor Breaking Changes

#### 7. New Scripts and Tools

- **Change**: Added new npm scripts for analysis and monitoring
- **Impact**: Existing CI/CD pipelines may need updates
- **Severity**: Low
- **Affected Files**: CI/CD configuration files

#### 8. Documentation Requirements

- **Change**: New documentation standards and guidelines
- **Impact**: Existing documentation may need updates
- **Severity**: Low
- **Affected Files**: Documentation files

## Migration Guides

### 🔧 Code Style Migration

#### Function Length Migration

**Before (❌ Failing):**

```typescript
function processUserData(
  userData: any,
  validationRules: any,
  transformationOptions: any,
  outputFormat: any,
  errorHandling: any
) {
  // Function with 150+ lines of code
  // ... many lines of complex logic
  // ... more complex operations
  // ... additional processing
  // ... error handling
  // ... data transformation
  // ... validation logic
  // ... output formatting
  // ... cleanup operations
  return result;
}
```

**After (✅ Compliant):**

```typescript
interface ProcessUserDataOptions {
  userData: UserData;
  validationRules: ValidationRules;
  transformationOptions: TransformationOptions;
  outputFormat: OutputFormat;
  errorHandling: ErrorHandlingOptions;
}

function processUserData(options: ProcessUserDataOptions): ProcessedData {
  const validatedData = validateUserData(
    options.userData,
    options.validationRules
  );
  const transformedData = transformData(
    validatedData,
    options.transformationOptions
  );
  const formattedData = formatOutput(transformedData, options.outputFormat);

  return formattedData;
}

function validateUserData(
  userData: UserData,
  rules: ValidationRules
): ValidatedData {
  // Validation logic (max 70 lines)
  return validatedData;
}

function transformData(
  data: ValidatedData,
  options: TransformationOptions
): TransformedData {
  // Transformation logic (max 70 lines)
  return transformedData;
}

function formatOutput(
  data: TransformedData,
  format: OutputFormat
): ProcessedData {
  // Formatting logic (max 70 lines)
  return formattedData;
}
```

#### Parameter Limit Migration

**Before (❌ Failing):**

```typescript
function createUser(
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  address: string,
  preferences: UserPreferences,
  role: UserRole
): User {
  // Function with too many parameters
}
```

**After (✅ Compliant):**

```typescript
interface CreateUserOptions {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  preferences: UserPreferences;
  role: UserRole;
}

function createUser(options: CreateUserOptions): User {
  // Function with object parameter
}
```

### 🧪 Testing Migration

#### Mock System Migration

**Before (❌ Old Pattern):**

```typescript
// Manual mock setup in each test file
jest.mock('../../../lib/health', () => ({
  useExperienceData: jest.fn(),
  useManualEntryMode: jest.fn(),
  useDeveloperMode: jest.fn(),
}));

const mockUseExperienceData = jest.mocked(
  require('../../../lib/health').useExperienceData
);
const mockUseManualEntryMode = jest.mocked(
  require('../../../lib/health').useManualEntryMode
);
const mockUseDeveloperMode = jest.mocked(
  require('../../../lib/health').useDeveloperMode
);

beforeEach(() => {
  mockUseExperienceData.mockReturnValue({
    experience: 0,
    cumulativeExperience: 0,
    refreshExperience: jest.fn(),
    isLoading: false,
    error: null,
  });

  mockUseManualEntryMode.mockReturnValue({
    isManualEntryMode: false,
    setManualEntryMode: jest.fn(),
    toggleManualEntryMode: jest.fn(),
  });

  mockUseDeveloperMode.mockReturnValue({
    isDeveloperMode: false,
    setDeveloperMode: jest.fn(),
    toggleDeveloperMode: jest.fn(),
  });
});
```

**After (✅ New Pattern):**

```typescript
import { createHealthHooksMock } from '../../../__mocks__/health-hooks';

// Centralized mock setup
jest.mock('../../../lib/health', () => {
  const healthMock =
    require('../../../__mocks__/health-hooks').createHealthHooksMock();
  return {
    useExperienceData: healthMock.useExperienceData,
    useManualEntryMode: healthMock.useManualEntryMode,
    useDeveloperMode: healthMock.useDeveloperMode,
  };
});

const healthMock = createHealthHooksMock();

beforeEach(() => {
  healthMock.reset();
  healthMock.setupSuccessScenario();

  // Override specific values if needed
  const customData = healthMock.createMockExperienceData({ experience: 100 });
  healthMock.useExperienceData.mockReturnValue(customData);
});
```

#### Test Data Creation Migration

**Before (❌ Manual Creation):**

```typescript
const mockSaveData = {
  version: '1.0.0',
  timestamp: Date.now(),
  gameState: 'Active',
  level: 1,
  gridState: [
    {
      id: 'tile-1',
      x: 0,
      y: 0,
      isRevealed: false,
      type: 'neutral',
      hasBeenVisited: false,
    },
  ],
  turnsUsed: 0,
  currency: 1000,
  achievements: {
    totalGamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    highestLevelReached: 0,
    totalTurnsUsed: 0,
    totalTreasureFound: 0,
  },
  statistics: {
    winRate: 0,
    averageTurnsPerGame: 0,
    longestGameSession: 0,
    totalPlayTime: 0,
  },
  itemEffects: [],
};
```

**After (✅ Factory Method):**

```typescript
const mockSaveData = mockDungeonGamePersistence.createMockSaveData({
  level: 1,
  turnsUsed: 0,
  currency: 1000,
});
```

### 📝 TypeScript Migration

#### Explicit Type Migration

**Before (❌ Implicit Types):**

```typescript
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

function processData(data) {
  // Processing logic
  return processedData;
}
```

**After (✅ Explicit Types):**

```typescript
interface Item {
  price: number;
  name: string;
}

interface ProcessedData {
  total: number;
  count: number;
  average: number;
}

function calculateTotal(items: Item[]): number {
  return items.reduce((sum: number, item: Item) => sum + item.price, 0);
}

function processData(data: Item[]): ProcessedData {
  const total = calculateTotal(data);
  const count = data.length;
  const average = count > 0 ? total / count : 0;

  return {
    total,
    count,
    average,
  };
}
```

#### Interface Migration

**Before (❌ Any Types):**

```typescript
function handleUserAction(action: any, data: any): any {
  // Action handling logic
  return result;
}
```

**After (✅ Proper Interfaces):**

```typescript
interface UserAction {
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: unknown;
}

interface ActionResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

function handleUserAction(action: UserAction, data: unknown): ActionResult {
  // Action handling logic with proper typing
  return {
    success: true,
    data: processedData,
  };
}
```

### 🔧 Build Configuration Migration

#### New Scripts Migration

**Before (❌ Missing Scripts):**

```json
{
  "scripts": {
    "test": "jest",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "type-check": "tsc --noemit"
  }
}
```

**After (✅ Complete Scripts):**

```json
{
  "scripts": {
    "test": "jest",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "type-check": "tsc --noemit",
    "analyze-bundle": "node scripts/analyze-bundle-size.js",
    "analyze-build-times": "node scripts/analyze-build-times.js",
    "check-performance-budget": "node scripts/performance-budget.js",
    "check-all": "pnpm run lint && pnpm run type-check && pnpm run test"
  }
}
```

#### CI/CD Migration

**Before (❌ Basic CI):**

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test
```

**After (✅ Comprehensive CI):**

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm run check-all
      - run: pnpm run analyze-build-times
      - run: pnpm run analyze-bundle
      - run: pnpm run check-performance-budget
```

## Code Style Changes

### 📋 Linting Rules Migration

#### ESLint Configuration Updates

**New Rules Added:**

```json
{
  "rules": {
    "max-lines-per-function": ["error", 70],
    "max-params": ["error", 3],
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/explicit-parameter-types": "error"
  }
}
```

#### Prettier Configuration Updates

**New Formatting Rules:**

```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "endOfLine": "auto"
}
```

### 🎯 File Naming Migration

#### Kebab-Case Enforcement

**Before (❌ Inconsistent Naming):**

```
src/components/
├── UserProfile.tsx
├── userSettings.tsx
├── User-Dashboard.tsx
└── user_profile.tsx
```

**After (✅ Consistent Naming):**

```
src/components/
├── user-profile.tsx
├── user-settings.tsx
├── user-dashboard.tsx
└── user-profile.tsx
```

## Testing Changes

### 🧪 Mock System Migration

#### Centralized Mock Structure

**New Mock Directory Structure:**

```
__mocks__/
├── README.md
├── types.ts
├── helpers.ts
├── dungeon-game-persistence.ts
├── health-hooks.ts
├── storage-functions.ts
└── [module-name].ts
```

#### Mock Usage Patterns

**Factory Methods:**

```typescript
// Create mock data with factory methods
const mockData = healthMock.createMockExperienceData({
  experience: 1000,
  cumulativeExperience: 5000,
});

const mockSaveData = dungeonMock.createMockSaveData({
  level: 5,
  currency: 2000,
});
```

**Scenario Methods:**

```typescript
// Setup common test scenarios
healthMock.setupSuccessScenario();
healthMock.setupErrorScenario('Network error');
healthMock.setupManualModeScenario();
```

**Lifecycle Management:**

```typescript
// Proper mock lifecycle management
beforeEach(() => {
  healthMock.reset();
});

afterEach(() => {
  healthMock.clear();
});

afterAll(() => {
  healthMock.restore();
});
```

## Build Configuration Changes

### ⚙️ New Tools and Scripts

#### Bundle Analysis Tools

**New Scripts Available:**

```bash
# Analyze bundle size
pnpm run analyze-bundle

# Analyze build times
pnpm run analyze-build-times

# Check performance budgets
pnpm run check-performance-budget

# Run all checks
pnpm run check-all
```

#### Performance Monitoring

**Automated Monitoring:**

- Build time tracking
- Bundle size monitoring
- Test performance analysis
- Performance budget enforcement

### 📊 New Documentation

#### Documentation Structure

**New Documentation Files:**

```
docs/
├── COMPONENT_GUIDELINES.md
├── TESTING_GUIDELINES.md
├── BUNDLE_SIZE_ANALYSIS.md
├── BUILD_TIME_ANALYSIS.md
├── PERFORMANCE_MONITORING_GUIDELINES.md
└── BREAKING_CHANGES_AND_MIGRATION.md
```

## Performance Impact

### 📈 Performance Improvements

#### Build Performance

- **TypeScript Compilation**: 51% faster (2.46s vs ~5s)
- **Test Execution**: 50% faster (4.02s vs ~8s)
- **Mock Setup**: 90% faster (5ms vs 50ms per test)
- **Development Workflow**: 26% faster (22.29s total)

#### Bundle Performance

- **Bundle Size**: 686.91KB (well within 1MB budget)
- **Dependencies**: 81 packages (within 100 limit)
- **Mock Overhead**: Minimal (development-only)

### 🎯 Performance Budgets

**Enforced Performance Limits:**

- Build Time: < 10s total
- Bundle Size: < 1MB
- Test Performance: < 5s
- Mock Efficiency: < 10ms/test
- Dependencies: < 100 packages

## Rollback Procedures

### 🔄 Emergency Rollback

#### Quick Rollback Steps

1. **Revert Linting Rules:**

```bash
# Remove new ESLint rules
git checkout HEAD~1 -- .eslintrc.js
```

2. **Revert Mock System:**

```bash
# Remove centralized mocks
rm -rf __mocks__/
```

3. **Revert Scripts:**

```bash
# Remove new scripts
git checkout HEAD~1 -- package.json
```

#### Complete Rollback

```bash
# Rollback to previous commit
git reset --hard HEAD~1

# Force push (if necessary)
git push --force-with-lease origin feature/prd-codebase-cleanup
```

### 🛠️ Partial Rollback

#### Selective Rollback Options

1. **Keep Mock System, Revert Linting:**

```bash
git checkout HEAD~1 -- .eslintrc.js
git checkout HEAD~1 -- package.json
```

2. **Keep Documentation, Revert Code Changes:**

```bash
git checkout HEAD~1 -- src/
git checkout HEAD~1 -- __mocks__/
```

## Support and Troubleshooting

### 🆘 Common Issues

#### Linting Errors

**Issue**: Function length exceeded

```bash
error: Function 'processData' has too many lines (85). Maximum allowed is 70
```

**Solution**: Break down the function

```typescript
// Split into smaller functions
function processData(data: Data[]): ProcessedData {
  const validated = validateData(data);
  const transformed = transformData(validated);
  return formatData(transformed);
}
```

**Issue**: Too many parameters

```bash
error: Function 'createUser' has too many parameters (5). Maximum allowed is 3
```

**Solution**: Use object parameters

```typescript
interface CreateUserOptions {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
}

function createUser(options: CreateUserOptions): User {
  // Implementation
}
```

#### Mock System Issues

**Issue**: Mock not found

```bash
Error: Cannot find module '../../../__mocks__/health-hooks'
```

**Solution**: Check import path

```typescript
// Ensure correct relative path
import { createHealthHooksMock } from '../../../__mocks__/health-hooks';
```

**Issue**: Mock functions not working

```bash
TypeError: mockFunction is not a function
```

**Solution**: Proper mock setup

```typescript
// Ensure mock is properly set up in jest.mock()
jest.mock('../../../lib/health', () => {
  const healthMock =
    require('../../../__mocks__/health-hooks').createHealthHooksMock();
  return {
    useExperienceData: healthMock.useExperienceData,
  };
});
```

#### TypeScript Issues

**Issue**: Missing return type

```bash
error: Missing return type annotation
```

**Solution**: Add explicit return type

```typescript
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

**Issue**: Implicit any type

```bash
error: Parameter 'data' implicitly has an 'any' type
```

**Solution**: Add explicit parameter type

```typescript
function processData(data: UserData[]): ProcessedData {
  // Implementation
}
```

### 📞 Getting Help

#### Resources

1. **Documentation**: Check `docs/` directory for detailed guides
2. **Mock System**: See `__mocks__/README.md` for mock usage
3. **Performance**: Run `pnpm run analyze-build-times` for build analysis
4. **Bundle**: Run `pnpm run analyze-bundle` for bundle analysis

#### Support Channels

1. **Team Chat**: Ask questions in team channels
2. **Code Review**: Request help during code reviews
3. **Documentation**: Refer to comprehensive documentation
4. **Examples**: Check existing code for patterns

### 🔧 Migration Checklist

#### Pre-Migration

- [ ] Review breaking changes documentation
- [ ] Identify affected files and functions
- [ ] Plan migration strategy
- [ ] Set up development environment

#### During Migration

- [ ] Update function signatures (max 3 parameters)
- [ ] Break down large functions (max 70 lines)
- [ ] Add explicit TypeScript types
- [ ] Update mock usage to centralized system
- [ ] Fix import ordering
- [ ] Update file names to kebab-case

#### Post-Migration

- [ ] Run `pnpm run check-all` to verify
- [ ] Run `pnpm run analyze-build-times` for performance
- [ ] Run `pnpm run analyze-bundle` for bundle size
- [ ] Run `pnpm run check-performance-budget` for budgets
- [ ] Update documentation if needed
- [ ] Test all functionality thoroughly

This comprehensive migration guide ensures a smooth transition to the new codebase standards while maintaining code quality and performance.
