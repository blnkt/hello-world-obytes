<h1 align="center">
  <img alt="logo" src="./assets/icon.png" width="124px" style="border-radius:10px"/><br/>
Mobile App </h1>

> This Project is based on [Obytes starter](https://starter.obytes.com)

## Requirements

- [React Native dev environment ](https://reactnative.dev/docs/environment-setup)
- [Node.js LTS release](https://nodejs.org/en/)
- [Git](https://git-scm.com/)
- [Watchman](https://facebook.github.io/watchman/docs/install#buildinstall), required only for macOS or Linux users
- [Pnpm](https://pnpm.io/installation)
- [Cursor](https://www.cursor.com/) or [VS Code Editor](https://code.visualstudio.com/download) ⚠️ Make sure to install all recommended extension from `.vscode/extensions.json`

## 👋 Quick start

Clone the repo to your machine and install deps :

```sh
git clone https://github.com/user/repo-name

cd ./repo-name

pnpm install
```

To run the app on ios

```sh
pnpm ios
```

To run the app on Android

```sh
pnpm android
```

## ✍️ Documentation

- [Rules and Conventions](https://starter.obytes.com/getting-started/rules-and-conventions/)
- [Project structure](https://starter.obytes.com/getting-started/project-structure)
- [Environment vars and config](https://starter.obytes.com/getting-started/environment-vars-config)
- [UI and Theming](https://starter.obytes.com/ui-and-theme/ui-theming)
- [Components](https://starter.obytes.com/ui-and-theme/components)
- [Forms](https://starter.obytes.com/ui-and-theme/Forms)
- [Data fetching](https://starter.obytes.com/guides/data-fetching)
- [Contribute to starter](https://starter.obytes.com/how-to-contribute/)

## 🏗️ Development Guidelines

### Type Safety Standards

This project enforces strict TypeScript standards for improved code quality and developer experience:

- **Explicit Types**: All functions must have explicit parameter and return types
- **Interface Definitions**: Use proper interfaces instead of `any` types
- **Generic Types**: Utilize generic types for reusable functions
- **Type Validation**: Run `pnpm type-check` to verify no type errors

### Testing Standards

#### Centralized Mock System

The project uses a centralized mock system for consistent and maintainable testing:

- **Mock Location**: All mocks are located in `__mocks__/` directory
- **Factory Functions**: Use `createMock*Data()` methods for test data creation
- **Scenario Methods**: Use `setupSuccessScenario()`, `setupErrorScenario()` for common test setups
- **Lifecycle Management**: Always use `reset()`, `clear()`, `restore()` methods between tests

#### Mock Usage Example

```typescript
import { createHealthHooksMock } from '../../__mocks__/health-hooks';

// Create mock instance
const healthMock = createHealthHooksMock();

// Setup test scenario
beforeEach(() => {
  healthMock.reset();
  healthMock.setupSuccessScenario();
});

// Create test data
const testData = healthMock.createMockExperienceData({ experience: 100 });
```

For detailed mock documentation, see [`__mocks__/README.md`](./__mocks__/README.md).

### Code Quality Standards

#### Function Guidelines

- **Maximum Length**: Functions must not exceed 70 lines
- **Parameter Limit**: Maximum 3 parameters per function (use object parameters for more)
- **Naming Convention**: Use kebab-case for all files
- **Import Sorting**: Follow `eslint-plugin-simple-import-sort` ordering

#### Component Standards

- **No Inline Styles**: Avoid inline styles, use styled components or style objects
- **Destructuring**: Destructuring assignment is allowed
- **Default Props**: Not required for React components
- **Error Boundaries**: Implement error boundaries for all major features

### Performance Guidelines

#### Bundle Optimization

- **Tree Shaking**: Import only necessary functions from libraries
- **Code Splitting**: Use dynamic imports for large components
- **Asset Optimization**: Optimize images and assets for mobile

#### Build Performance

- **TypeScript**: Use incremental compilation for faster builds
- **Caching**: Leverage build caches for faster subsequent builds
- **Parallel Processing**: Use parallel test execution where possible

### Development Workflow

#### Branch Management

- **Feature Branches**: All development must be done on feature branches
- **Conventional Commits**: Use conventional commit format for all commits
- **Pull Requests**: All changes must go through pull request review

#### Testing Workflow

- **Test-Driven Development**: Write tests before implementing features
- **Coverage Requirements**: Maintain 80%+ code coverage
- **Mock Usage**: Use centralized mocks for all external dependencies

#### Code Review Checklist

- [ ] TypeScript types are explicit and correct
- [ ] Tests use centralized mock system
- [ ] Functions follow length and parameter guidelines
- [ ] Error handling is implemented appropriately
- [ ] Performance implications are considered

### Troubleshooting

#### Common Issues

**TypeScript Errors**

- Run `pnpm type-check` to identify type issues
- Ensure all functions have explicit return types
- Use proper interfaces instead of `any` types

**Test Failures**

- Check mock setup and lifecycle management
- Verify centralized mock usage
- Ensure proper test isolation

**Build Issues**

- Clear build cache: `pnpm clean`
- Reinstall dependencies: `pnpm install`
- Check for breaking changes in dependencies

### Migration Guide

#### From Manual Mocks to Centralized Mocks

**Before:**

```typescript
jest.mock('../lib/health', () => ({
  useExperienceData: jest.fn(),
}));
```

**After:**

```typescript
jest.mock('../lib/health', () => {
  const healthMock =
    require('../../__mocks__/health-hooks').createHealthHooksMock();
  return {
    useExperienceData: healthMock.useExperienceData,
  };
});
```

For complete migration guide, see [`__mocks__/README.md`](./__mocks__/README.md).
