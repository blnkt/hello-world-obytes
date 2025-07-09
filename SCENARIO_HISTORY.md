# Scenario History Feature

This document explains the new scenario history feature that allows users to track and view their visited scenarios.

## Overview

The scenario history feature provides:

- Automatic recording of visited scenarios
- Historical data persistence using MMKV storage
- Filtering by scenario type (merchant/monster)
- Detailed view of scenario outcomes and rewards

## Implementation Details

### Storage Layer

The scenario history is stored using MMKV (react-native-mmkv) with the following structure:

```typescript
type ScenarioHistory = {
  id: string;
  scenarioId: string;
  type: EncounterType;
  title: string;
  description: string;
  reward: string;
  visitedAt: string; // ISO string
  milestone: number;
  outcome?: string; // Optional outcome description
};
```

### Key Files

1. **Storage Utilities** (`src/lib/storage.tsx`)

   - `getScenarioHistory()`: Retrieves all stored scenario history
   - `addScenarioToHistory()`: Adds a new scenario to history
   - `clearScenarioHistory()`: Clears all scenario history

2. **React Hook** (`src/lib/hooks/use-scenario-history.tsx`)

   - `useScenarioHistory()`: Main hook for managing scenario history
   - Provides methods for filtering and querying history

3. **History Screen** (`src/app/(app)/steps-history.tsx`)

   - Displays scenario history with filtering options
   - Shows scenario details, timestamps, and outcomes

4. **Updated Scenario Screen** (`src/app/(app)/scenario.tsx`)
   - Automatically records scenarios when selected
   - Integrates with history storage

## Usage

### Recording Scenarios

Scenarios are automatically recorded when a user selects them in the scenario screen:

```typescript
const { addToHistory } = useScenarioHistory();

const handleScenarioSelect = async (scenarioId: string) => {
  const scenario = scenarios.find((s) => s.id === scenarioId);
  if (scenario) {
    // ... existing logic ...

    // Add to history
    await addToHistory(scenario, milestoneNumber);
  }
};
```

### Viewing History

Users can view their scenario history by navigating to the "Scenarios" tab, which shows:

- All visited scenarios with timestamps
- Filtering by scenario type (All/Merchant/Monster)
- Scenario details including rewards and outcomes
- Milestone information

### Filtering History

The history screen provides filtering capabilities:

```typescript
const { getScenariosByType } = useScenarioHistory();

// Get only merchant scenarios
const merchantScenarios = getScenariosByType('merchant');

// Get only monster scenarios
const monsterScenarios = getScenariosByType('monster');
```

## Data Persistence

Scenario history is persisted locally using MMKV storage and survives app restarts. The data is stored in JSON format and includes:

- Unique scenario identifiers
- Visit timestamps
- Milestone information
- Optional outcome descriptions

## Future Enhancements

Potential improvements for the scenario history feature:

1. **Export/Import**: Allow users to export their scenario history
2. **Statistics**: Add analytics on scenario preferences and patterns
3. **Search**: Implement search functionality for scenario history
4. **Categories**: Add more detailed categorization of scenarios
5. **Achievements**: Track achievements based on scenario completion

## Testing

To test the scenario history feature:

1. Navigate to a scenario screen
2. Select different scenarios
3. Check the "Scenarios" tab to see recorded history
4. Use the filter buttons to view specific scenario types
5. Verify that history persists after app restart

## Technical Notes

- Uses MMKV for efficient local storage
- Implements React hooks for state management
- Follows existing codebase patterns and styling
- Integrates seamlessly with existing scenario system
- Maintains type safety with TypeScript
