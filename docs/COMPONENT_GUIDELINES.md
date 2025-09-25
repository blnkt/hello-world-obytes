# Component Usage Guidelines

This document provides comprehensive guidelines for creating, maintaining, and using components in this React Native project.

## Table of Contents

- [Component Architecture](#component-architecture)
- [Component Creation Guidelines](#component-creation-guidelines)
- [TypeScript Standards](#typescript-standards)
- [Styling Guidelines](#styling-guidelines)
- [Testing Requirements](#testing-requirements)
- [Performance Considerations](#performance-considerations)
- [Error Handling](#error-handling)
- [Accessibility Guidelines](#accessibility-guidelines)
- [Component Patterns](#component-patterns)
- [Best Practices](#best-practices)

## Component Architecture

### File Structure

```
src/components/
├── ui/                    # Reusable UI components
│   ├── button.tsx
│   ├── input.tsx
│   ├── modal.tsx
│   └── __tests__/         # Component tests
├── feature/               # Feature-specific components
│   ├── dungeon-game/
│   ├── health/
│   └── settings/
└── layout/                # Layout components
    ├── header.tsx
    └── footer.tsx
```

### Component Categories

1. **UI Components**: Reusable, generic components (`src/components/ui/`)
2. **Feature Components**: Business logic specific components (`src/components/feature/`)
3. **Layout Components**: Structural components (`src/components/layout/`)

## Component Creation Guidelines

### 1. File Naming Convention

- Use **kebab-case** for all component files
- Use **PascalCase** for component names
- Include `.tsx` extension for React components

```typescript
// ✅ Good
src / components / ui / button - group.tsx;
src / components / feature / dungeon - game / game - grid.tsx;

// ❌ Bad
src / components / ui / ButtonGroup.tsx;
src / components / feature / dungeon - game / gameGrid.tsx;
```

### 2. Component Structure

Follow this standard structure for all components:

```typescript
// 1. Imports (sorted by eslint-plugin-simple-import-sort)
import React from 'react';
import { View, Text } from 'react-native';

import { Button } from '@/components/ui/button';
import { colors } from '@/components/ui/colors';

// 2. Type definitions
interface ComponentProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

// 3. Component implementation
export function MyComponent({ title, onPress, disabled = false }: ComponentProps): JSX.Element {
  // Component logic here
  return (
    <View>
      <Text>{title}</Text>
      <Button onPress={onPress} disabled={disabled} />
    </View>
  );
}
```

### 3. Props Interface Guidelines

- **Always define explicit interfaces** for component props
- **Use descriptive names** for props
- **Provide default values** for optional props
- **Use union types** for limited options

```typescript
// ✅ Good
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
}

// ❌ Bad
interface ButtonProps {
  title: any;
  onPress: any;
  variant: any;
}
```

## TypeScript Standards

### 1. Explicit Types

All functions must have explicit parameter and return types:

```typescript
// ✅ Good
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ Bad
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

### 2. Interface Definitions

- Use proper interfaces instead of `any` types
- Define interfaces for complex data structures
- Use generic types for reusable components

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
  preferences: UserPreferences;
}

interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
}

// ❌ Bad
interface User {
  id: any;
  name: any;
  preferences: any;
}
```

### 3. Generic Components

Use generic types for reusable components:

```typescript
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => JSX.Element;
  keyExtractor: (item: T) => string;
}

export function List<T>({ items, renderItem, keyExtractor }: ListProps<T>): JSX.Element {
  return (
    <FlatList
      data={items}
      renderItem={({ item, index }) => renderItem(item, index)}
      keyExtractor={keyExtractor}
    />
  );
}
```

## Styling Guidelines

### 1. No Inline Styles

Avoid inline styles. Use styled components or style objects:

```typescript
// ✅ Good
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
});

// ❌ Bad
<View style={{ flex: 1, padding: 16, backgroundColor: '#fff' }}>
```

### 2. Use Design System Colors

Always use colors from the centralized color system:

```typescript
import { colors } from '@/components/ui/colors';

// ✅ Good
backgroundColor: colors.background;
color: colors.text.primary;

// ❌ Bad
backgroundColor: '#ffffff';
color: '#000000';
```

### 3. Responsive Design

Use responsive utilities for different screen sizes:

```typescript
import { useWindowDimensions } from 'react-native';

export function ResponsiveComponent(): JSX.Element {
  const { width } = useWindowDimensions();
  const isTablet = width > 768;

  return (
    <View style={[styles.container, isTablet && styles.tabletContainer]}>
      {/* Component content */}
    </View>
  );
}
```

## Testing Requirements

### 1. Test File Location

Place test files alongside components:

```
src/components/ui/
├── button.tsx
├── button.test.tsx
├── input.tsx
└── input.test.tsx
```

### 2. Use Centralized Mocks

Always use the centralized mock system for testing:

```typescript
import { createHealthHooksMock } from '../../../__mocks__/health-hooks';

describe('HealthComponent', () => {
  const healthMock = createHealthHooksMock();

  beforeEach(() => {
    healthMock.reset();
    healthMock.setupSuccessScenario();
  });

  it('should render health data correctly', () => {
    const testData = healthMock.createMockExperienceData({ experience: 100 });
    healthMock.useExperienceData.mockReturnValue(testData);

    // Test implementation
  });
});
```

### 3. Test Coverage Requirements

- Maintain **80%+ code coverage**
- Test all public methods and props
- Test error conditions and edge cases
- Test accessibility features

## Performance Considerations

### 1. Memoization

Use `React.memo` for components that receive stable props:

```typescript
interface ExpensiveComponentProps {
  data: ComplexData[];
  onUpdate: (id: string) => void;
}

export const ExpensiveComponent = React.memo<ExpensiveComponentProps>(
  ({ data, onUpdate }) => {
    // Expensive rendering logic
    return <ComplexVisualization data={data} onUpdate={onUpdate} />;
  }
);
```

### 2. Callback Optimization

Use `useCallback` for event handlers passed to child components:

```typescript
export function ParentComponent(): JSX.Element {
  const [count, setCount] = useState(0);

  const handleIncrement = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  return <ChildComponent onIncrement={handleIncrement} />;
}
```

### 3. Lazy Loading

Use dynamic imports for large components:

```typescript
const HeavyComponent = lazy(() => import('./HeavyComponent'));

export function App(): JSX.Element {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

## Error Handling

### 1. Error Boundaries

Implement error boundaries for all major features:

```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
}

export class ComponentErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { hasError: boolean; error?: Error }
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} />;
    }

    return this.props.children;
  }
}
```

### 2. Graceful Degradation

Handle missing data gracefully:

```typescript
interface DataDisplayProps {
  data?: UserData | null;
}

export function DataDisplay({ data }: DataDisplayProps): JSX.Element {
  if (!data) {
    return <EmptyState message="No data available" />;
  }

  if (data.isLoading) {
    return <LoadingSpinner />;
  }

  if (data.error) {
    return <ErrorMessage error={data.error} />;
  }

  return <DataContent data={data} />;
}
```

## Accessibility Guidelines

### 1. Screen Reader Support

Provide proper accessibility labels:

```typescript
export function AccessibleButton({ title, onPress }: ButtonProps): JSX.Element {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint="Double tap to activate"
    >
      <Text>{title}</Text>
    </TouchableOpacity>
  );
}
```

### 2. Color Contrast

Ensure sufficient color contrast:

```typescript
// Use colors from the design system that meet WCAG guidelines
import { colors } from '@/components/ui/colors';

const styles = StyleSheet.create({
  text: {
    color: colors.text.primary, // Meets WCAG AA contrast requirements
  },
});
```

### 3. Focus Management

Handle focus for keyboard navigation:

```typescript
export function FormInput({ label, ...props }: InputProps): JSX.Element {
  const inputRef = useRef<TextInput>(null);

  return (
    <View>
      <Text accessibilityRole="label">{label}</Text>
      <TextInput
        ref={inputRef}
        accessibilityLabel={label}
        {...props}
      />
    </View>
  );
}
```

## Component Patterns

### 1. Compound Components

Use compound components for complex UI patterns:

```typescript
interface ModalProps {
  children: React.ReactNode;
  isVisible: boolean;
}

interface ModalSubComponents {
  Header: typeof ModalHeader;
  Body: typeof ModalBody;
  Footer: typeof ModalFooter;
}

export const Modal: React.FC<ModalProps> & ModalSubComponents = ({ children, isVisible }) => {
  return isVisible ? <ModalContainer>{children}</ModalContainer> : null;
};

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

// Usage
<Modal isVisible={true}>
  <Modal.Header title="Settings" />
  <Modal.Body>
    <SettingsForm />
  </Modal.Body>
  <Modal.Footer>
    <Button title="Save" />
  </Modal.Footer>
</Modal>
```

### 2. Render Props Pattern

Use render props for flexible component composition:

```typescript
interface DataFetcherProps<T> {
  url: string;
  children: (data: {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
  }) => JSX.Element;
}

export function DataFetcher<T>({
  url,
  children,
}: DataFetcherProps<T>): JSX.Element {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetch(url);
      const json = await result.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return children({ data, loading, error, refetch: fetchData });
}
```

### 3. Custom Hooks

Extract reusable logic into custom hooks:

```typescript
interface UseApiOptions<T> {
  url: string;
  initialData?: T;
}

export function useApi<T>({ url, initialData }: UseApiOptions<T>) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(url);
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  return { data, loading, error, refetch: fetchData };
}
```

## Best Practices

### 1. Component Size

- Keep components focused and single-purpose
- Split large components into smaller, reusable pieces
- Maximum 70 lines per function (enforced by linting)

### 2. Props Design

- Use object parameters for functions with more than 3 parameters
- Provide sensible defaults for optional props
- Use union types for limited options

### 3. State Management

- Use local state for component-specific data
- Use context for shared state across components
- Use external state management for complex application state

### 4. Performance

- Use `React.memo` for expensive components
- Use `useCallback` and `useMemo` appropriately
- Avoid unnecessary re-renders

### 5. Documentation

- Add JSDoc comments for complex components
- Document prop interfaces clearly
- Provide usage examples in component files

### 6. Testing

- Write tests for all public methods
- Test error conditions and edge cases
- Use centralized mocks for external dependencies

## Migration Guide

### From Class Components to Functional Components

**Before:**

```typescript
class MyComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { count: 0 };
  }

  handleClick = () => {
    this.setState({ count: this.state.count + 1 });
  }

  render() {
    return <Button onPress={this.handleClick} title={`Count: ${this.state.count}`} />;
  }
}
```

**After:**

```typescript
export function MyComponent({ initialCount = 0 }: { initialCount?: number }): JSX.Element {
  const [count, setCount] = useState(initialCount);

  const handleClick = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  return <Button onPress={handleClick} title={`Count: ${count}`} />;
}
```

### From Inline Styles to StyleSheet

**Before:**

```typescript
<View style={{ flex: 1, padding: 16, backgroundColor: '#fff' }}>
```

**After:**

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
});

<View style={styles.container}>
```

This comprehensive guide ensures consistent, maintainable, and high-quality component development across the project.
