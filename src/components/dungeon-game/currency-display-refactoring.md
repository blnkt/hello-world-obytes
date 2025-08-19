# Currency Display Component Refactoring

## Overview

The `CurrencyDisplay` component has been refactored from a single large function (147 lines) into smaller, focused components that follow the repository's function length rules (max 70 lines per function).

## Refactored Components

### 1. InfoRow Component

**Purpose**: Displays label-value pairs in a consistent layout
**Reusability**: High - Can be used anywhere you need to show key-value information
**Props**:

- `label`: The label text
- `value`: The value to display
- `valueClassName`: Optional custom styling for the value

**Usage Examples**:

```tsx
// Basic usage
<InfoRow label="Current Balance:" value="5000 steps" />

// With custom styling
<InfoRow
  label="Available Turns:"
  value={3}
  valueClassName="text-xl font-bold text-green-600"
/>
```

### 2. StatusCard Component

**Purpose**: Displays colored status indicators with consistent styling
**Reusability**: High - Can be used for any status, warning, or error messages
**Props**:

- `type`: 'error' | 'warning' | 'success'
- `title`: Main status message
- `subtitle`: Additional context
- `accessibilityLabel`: Screen reader text

**Usage Examples**:

```tsx
// Error state
<StatusCard
  type="error"
  title="Connection failed"
  subtitle="Please check your internet connection"
  accessibilityLabel="Connection error message"
/>

// Success state
<StatusCard
  type="success"
  title="Upload complete"
  subtitle="File has been successfully uploaded"
  accessibilityLabel="Upload success message"
/>
```

### 3. SectionHeader Component

**Purpose**: Creates consistent section headers with optional icons
**Reusability**: High - Can be used for any section that needs a title and icon
**Props**:

- `title`: Section title
- `icon`: Icon to display (emoji or text)
- `iconAccessibilityLabel`: Screen reader text for the icon

**Usage Examples**:

```tsx
<SectionHeader
  title="Game Statistics"
  icon="📊"
  iconAccessibilityLabel="Statistics icon"
/>
```

### 4. InfoSection Component

**Purpose**: Groups related information with consistent spacing
**Reusability**: High - Can be used to group any related UI elements
**Props**:

- `children`: React nodes to render
- `className`: Optional custom styling

**Usage Examples**:

```tsx
<InfoSection>
  <InfoRow label="Score:" value={1500} />
  <InfoRow label="Level:" value={5} />
  <InfoRow label="Time:" value="02:30" />
</InfoSection>
```

## Opportunities for Reusable Components Across Codebase

### 1. InfoRow Component

**Potential Use Cases**:

- Settings screens (theme selection, language options)
- Character sheet (attributes, stats)
- Game status displays (health, mana, experience)
- Profile information (username, email, preferences)
- Form fields with labels and values

**Files that could benefit**:

- `src/components/settings/item.tsx`
- `src/components/character/attributes-section.tsx`
- `src/components/character/character-sheet.tsx`
- `src/components/dungeon-game/status-bar.tsx`

### 2. StatusCard Component

**Potential Use Cases**:

- Form validation messages
- API response notifications
- Game state indicators
- Health/status warnings
- Achievement notifications

**Files that could benefit**:

- `src/components/settings/healthkit-sync-section.tsx`
- `src/components/scenario-outcome.tsx`
- `src/components/dungeon-game/game-modals.tsx`
- Any component that shows user feedback

### 3. SectionHeader Component

**Potential Use Cases**:

- Settings sections
- Character creation steps
- Game tutorial sections
- Scenario information headers
- Form section dividers

**Files that could benefit**:

- `src/components/settings/items-container.tsx`
- `src/components/character/character-customization.tsx`
- `src/components/scenario-header.tsx`
- `src/components/history/scenario-grid.tsx`

### 4. InfoSection Component

**Potential Use Cases**:

- Grouping form fields
- Organizing related data
- Creating consistent spacing patterns
- Building complex layouts

**Files that could benefit**:

- `src/components/character/character-form.tsx`
- `src/components/settings/manual-entry-section.tsx`
- `src/components/history/scenario-timeline.tsx`

## Benefits of This Refactoring

### 1. **Maintainability**

- Each component has a single responsibility
- Easier to test individual components
- Simpler to modify specific functionality

### 2. **Reusability**

- Components can be used across different parts of the app
- Consistent UI patterns throughout the application
- Reduced code duplication

### 3. **Accessibility**

- Consistent accessibility patterns
- Easier to maintain screen reader support
- Standardized ARIA roles and labels

### 4. **Performance**

- Smaller components are easier to optimize
- Better tree-shaking opportunities
- Reduced re-render scope

### 5. **Developer Experience**

- Clear component interfaces
- Self-documenting code
- Easier onboarding for new developers

## Next Steps for Component Reusability

1. **Extract to Shared Components**: Move these components to `src/components/ui/` for global use
2. **Create Component Library**: Build a comprehensive set of reusable UI components
3. **Update Existing Components**: Gradually refactor other components to use these patterns
4. **Documentation**: Create Storybook or similar documentation for the component library
5. **Testing**: Ensure all reusable components have comprehensive test coverage

## Function Length Compliance

All functions now comply with the repository's 70-line limit:

- `InfoRow`: 21 lines
- `StatusCard`: 51 lines
- `SectionHeader`: 25 lines
- `InfoSection`: 8 lines
- `CurrencyDisplay`: 65 lines
- Utility functions: 15-20 lines each
