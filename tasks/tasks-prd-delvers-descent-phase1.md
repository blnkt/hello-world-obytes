# Tasks: Delver's Descent Phase 1 - Core Systems

## Relevant Files

- `src/types/delvers-descent.ts` - Core type definitions for runs, nodes, and game state
- `src/types/delvers-descent.test.ts` - Unit tests for type definitions and interfaces
- `src/lib/delvers-descent/run-queue.ts` - Daily runs queue management system
- `src/lib/delvers-descent/run-queue.test.ts` - Unit tests for run queue functionality
- `src/lib/delvers-descent/map-generator.ts` - Spatial dungeon map generation algorithms
- `src/lib/delvers-descent/map-generator.test.ts` - Unit tests for map generation
- `src/lib/delvers-descent/energy-calculator.ts` - Energy cost and return cost calculations
- `src/lib/delvers-descent/energy-calculator.test.ts` - Unit tests for energy calculations
- `src/lib/delvers-descent/run-state-manager.ts` - Run state management and persistence
- `src/lib/delvers-descent/run-state-manager.test.ts` - Unit tests for run state management
- `src/lib/health/index.tsx` - Integration with existing HealthKit system for daily runs
- `src/lib/health/index.test.tsx` - Unit tests for HealthKit integration
- `src/components/delvers-descent/hooks/use-delving-runs.tsx` - React hook for managing delving runs
- `src/components/delvers-descent/hooks/use-delving-runs.test.tsx` - Unit tests for delving runs hook
- `src/components/delvers-descent/hooks/use-run-state.tsx` - React hook for active run state management
- `src/components/delvers-descent/hooks/use-run-state.test.tsx` - Unit tests for run state hook

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `pnpm test [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.
- When reasonable, focus on TDD approach: write tests first, then implement functionality to pass tests.
- Maintain integration with existing HealthKit and character systems.

## Tasks

- [ ] 1.0 Core Type Definitions and Interfaces
  - [ ] 1.1 Create `DelvingRun` interface with id, date, steps, energy calculations, and status
  - [ ] 1.2 Create `DungeonNode` interface with depth, position, type, costs, and connections
  - [ ] 1.3 Create `RunState` interface for tracking active run progress
  - [ ] 1.4 Create `CollectedItem` interface for inventory management
  - [ ] 1.5 Create `Shortcut` interface for depth connections and energy reduction
  - [ ] 1.6 Create `EncounterType` union type for all encounter types
  - [ ] 1.7 Create supporting interfaces for encounter data and risk information
  - [ ] 1.8 Write comprehensive unit tests for all type definitions

- [ ] 2.0 Daily Runs Queue System
  - [ ] 2.1 Create `RunQueueManager` class for managing queued runs
  - [ ] 2.2 Implement `generateRunFromSteps()` method for daily step data
  - [ ] 2.3 Implement `calculateRunEnergy()` with base energy and streak bonuses
  - [ ] 2.4 Implement `addRunToQueue()` and `removeRunFromQueue()` methods
  - [ ] 2.5 Implement `getQueuedRuns()` and `getRunById()` methods
  - [ ] 2.6 Add persistence layer for run queue across app sessions
  - [ ] 2.7 Write comprehensive unit tests for run queue functionality
  - [ ] 2.8 Test edge cases: empty step data, invalid dates, queue limits

- [ ] 3.0 Spatial Map Generation System
  - [ ] 3.1 Create `DungeonMapGenerator` class for creating spatial maps
  - [ ] 3.2 Implement `generateDepthLevel()` for creating 2-3 nodes per depth
  - [ ] 3.3 Implement Fisher-Yates shuffle algorithm for encounter type distribution
  - [ ] 3.4 Implement `assignEnergyCosts()` with depth-based scaling
  - [ ] 3.5 Implement `createNodeConnections()` for linking depths
  - [ ] 3.6 Implement `addShortcuts()` with 5-10% probability per depth
  - [ ] 3.7 Implement `generateFullMap()` for complete dungeon generation
  - [ ] 3.8 Write comprehensive unit tests for map generation algorithms
  - [ ] 3.9 Test map generation edge cases: single depth, maximum depth, invalid parameters

- [ ] 4.0 Energy Calculation System
  - [ ] 4.1 Create `EnergyCalculator` class for energy cost calculations
  - [ ] 4.2 Implement `calculateReturnCost()` with exponential scaling
  - [ ] 4.3 Implement `calculateNodeCost()` with depth-based scaling
  - [ ] 4.4 Implement `calculateSafetyMargin()` for risk assessment
  - [ ] 4.5 Implement `applyShortcutReduction()` for shortcut benefits
  - [ ] 4.6 Implement `canAffordReturn()` for point-of-no-return detection
  - [ ] 4.7 Write comprehensive unit tests for energy calculations
  - [ ] 4.8 Test energy calculation edge cases: zero energy, negative costs, overflow

- [ ] 5.0 Run State Management System
  - [ ] 5.1 Create `RunStateManager` class for active run management
  - [ ] 5.2 Implement `initializeRun()` for starting a new run
  - [ ] 5.3 Implement `moveToNode()` for spatial navigation
  - [ ] 5.4 Implement `addToInventory()` and `removeFromInventory()` methods
  - [ ] 5.5 Implement `updateEnergy()` for energy consumption tracking
  - [ ] 5.6 Implement `completeRun()` and `bustRun()` for run completion
  - [ ] 5.7 Add persistence layer for active run state
  - [ ] 5.8 Write comprehensive unit tests for run state management
  - [ ] 5.9 Test state management edge cases: invalid moves, inventory limits, state corruption

- [ ] 6.0 HealthKit Integration
  - [ ] 6.1 Extend existing HealthKit integration to support daily runs
  - [ ] 6.2 Implement `getDailyStepsForDate()` for retrieving historical step data
  - [ ] 6.3 Implement `calculateStreakBonus()` for 10,000+ step days
  - [ ] 6.4 Integrate run queue generation with existing step tracking
  - [ ] 6.5 Maintain existing XP accumulation while adding energy system
  - [ ] 6.6 Write integration tests for HealthKit daily runs functionality
  - [ ] 6.7 Test integration edge cases: missing data, permission issues, data corruption

- [ ] 7.0 React Hooks for UI Integration
  - [ ] 7.1 Create `useDelvingRuns()` hook for run queue management
  - [ ] 7.2 Create `useRunState()` hook for active run state management
  - [ ] 7.3 Implement `useEnergyCalculator()` hook for energy calculations
  - [ ] 7.4 Implement `useMapGenerator()` hook for map generation
  - [ ] 7.5 Add error handling and loading states to all hooks
  - [ ] 7.6 Write comprehensive unit tests for all React hooks
  - [ ] 7.7 Test hook integration with existing HealthKit and character systems

- [ ] 8.0 Integration Testing and Validation
  - [ ] 8.1 Create end-to-end tests for complete run lifecycle
  - [ ] 8.2 Test integration between all core systems
  - [ ] 8.3 Validate energy calculations match PRD specifications
  - [ ] 8.4 Test map generation produces valid spatial navigation
  - [ ] 8.5 Validate run queue persistence across app restarts
  - [ ] 8.6 Test performance requirements (100ms for calculations)
  - [ ] 8.7 Create integration tests with existing HealthKit system
  - [ ] 8.8 Validate backward compatibility with existing character/XP systems
