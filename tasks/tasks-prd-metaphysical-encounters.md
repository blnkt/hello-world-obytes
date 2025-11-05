# Tasks: Metaphysical Encounters Implementation

Based on PRD: `prd-metaphysical-encounters.md`

## Relevant Files

- `src/types/delvers-descent.ts` - Type definitions for new encounter types and RunState extensions
- `src/lib/delvers-descent/encounter-router.ts` - Routing logic for new encounter types
- `src/lib/delvers-descent/encounter-resolver.ts` - Encounter resolver support for new types
- `src/lib/delvers-descent/luck-shrine-encounter.ts` - Luck Shrine encounter logic implementation
- `src/lib/delvers-descent/luck-shrine-encounter.test.ts` - Unit tests for Luck Shrine
- `src/lib/delvers-descent/energy-nexus-encounter.ts` - Energy Nexus encounter logic implementation
- `src/lib/delvers-descent/energy-nexus-encounter.test.ts` - Unit tests for Energy Nexus
- `src/lib/delvers-descent/time-distortion-encounter.ts` - Time Distortion encounter logic implementation
- `src/lib/delvers-descent/time-distortion-encounter.test.ts` - Unit tests for Time Distortion
- `src/lib/delvers-descent/fate-weaver-encounter.ts` - Fate Weaver encounter logic implementation
- `src/lib/delvers-descent/fate-weaver-encounter.test.ts` - Unit tests for Fate Weaver
- `src/lib/delvers-descent/map-generator.ts` - Map generation with probability modification support
- `src/lib/delvers-descent/map-generator-optimized.ts` - Optimized map generation with probability modification
- `src/lib/delvers-descent/balance-config.ts` - Balance configuration including new encounter distributions
- `src/lib/delvers-descent/regions.ts` - Regional encounter distributions updated
- `src/components/delvers-descent/encounters/advanced/luck-shrine-screen.tsx` - Luck Shrine UI component
- `src/components/delvers-descent/encounters/advanced/luck-shrine-screen.test.tsx` - UI tests for Luck Shrine
- `src/components/delvers-descent/encounters/advanced/energy-nexus-screen.tsx` - Energy Nexus UI component
- `src/components/delvers-descent/encounters/advanced/energy-nexus-screen.test.tsx` - UI tests for Energy Nexus
- `src/components/delvers-descent/encounters/advanced/time-distortion-screen.tsx` - Time Distortion UI component
- `src/components/delvers-descent/encounters/advanced/time-distortion-screen.test.tsx` - UI tests for Time Distortion
- `src/components/delvers-descent/encounters/advanced/fate-weaver-screen.tsx` - Fate Weaver UI component
- `src/components/delvers-descent/encounters/advanced/fate-weaver-screen.test.tsx` - UI tests for Fate Weaver

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `pnpm test [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [ ] 1.0 Foundation and Infrastructure Setup
  - [x] 1.1 Add four new encounter types (`luck_shrine`, `energy_nexus`, `time_distortion`, `fate_weaver`) to the `EncounterType` union type in `src/types/delvers-descent.ts`
  - [x] 1.2 Add `luckBoostActive?: { remainingEncounters: number; multiplierBonus: number }` field to `RunState` interface in `src/types/delvers-descent.ts`
  - [x] 1.3 Add `modifiedEncounterProbabilities?: Record<EncounterType, number>` field to `RunState` interface
  - [x] 1.4 Add `timeDistortionHistory?: Array<{ type: 'rewind' | 'skip'; timestamp: number }>` field to `RunState` interface
  - [x] 1.5 Update `ENCOUNTER_TYPES` constant array to include the four new encounter types
  - [x] 1.6 Update `isValidEncounterType` type guard function to include new encounter types
  - [x] 1.7 Add routing entries for all four new encounter types in `src/lib/delvers-descent/encounter-router.ts`
  - [x] 1.8 Update `getEncounterRoute` function to return routes for new encounter types
  - [x] 1.9 Update `isEncounterSupported` function to include new encounter types
  - [x] 1.10 Add new encounter types to `supportedEncounterTypes` array in `EncounterResolver` class
  - [x] 1.11 Add new encounter types to encounter type lists in `DungeonMapGenerator` class
  - [x] 1.12 Add new encounter types to encounter type lists in `DungeonMapGeneratorOptimized` class
  - [x] 1.13 Write unit tests for type definitions and type guards
  - [x] 1.14 Write unit tests for encounter router with new types

- [ ] 2.0 Luck Shrine Encounter Implementation
  - [ ] 2.1 Create `src/lib/delvers-descent/luck-shrine-encounter.ts` with `LuckShrineEncounter` class
  - [ ] 2.2 Define `LuckShrineState` interface with encounter ID, config, and outcome fields
  - [ ] 2.3 Define `LuckShrineConfig` interface with multiplier bonus and duration (2-3 encounters)
  - [ ] 2.4 Implement constructor that accepts encounter ID and depth, generates config with fixed multiplier bonus
  - [ ] 2.5 Implement `getState()` method to return current state
  - [ ] 2.6 Implement `activate()` method that sets luck boost in run state and returns `AdvancedEncounterOutcome`
  - [ ] 2.7 Calculate fixed energy cost based on depth and encounter type modifier
  - [ ] 2.8 Create `src/components/delvers-descent/encounters/advanced/luck-shrine-screen.tsx` UI component
  - [ ] 2.9 Display current reward multiplier and boosted multiplier in UI
  - [ ] 2.10 Display how many encounters the boost will last (2-3)
  - [ ] 2.11 Add "Activate Shrine" button that calls onComplete with outcome
  - [ ] 2.12 Style UI to match existing advanced encounter screens with appropriate visual theme
  - [ ] 2.13 Write unit tests for `LuckShrineEncounter` class covering activation, state management, and edge cases
  - [ ] 2.14 Write UI tests for `luck-shrine-screen.tsx` component

- [ ] 3.0 Energy Nexus Encounter Implementation
  - [ ] 3.1 Create `src/lib/delvers-descent/energy-nexus-encounter.ts` with `EnergyNexusEncounter` class
  - [ ] 3.2 Define `EnergyNexusState` interface with encounter ID, config, conversion direction, and outcome fields
  - [ ] 3.3 Define `EnergyNexusConfig` interface with fixed conversion rate (e.g., 1 item value = 10 energy)
  - [ ] 3.4 Implement constructor that accepts encounter ID and depth, generates config with conversion rate
  - [ ] 3.5 Implement `getState()` method to return current state
  - [ ] 3.6 Implement `selectConversionDirection()` method to choose items→energy or energy→items
  - [ ] 3.7 Implement `validateConversion()` method to check if player has sufficient resources
  - [ ] 3.8 Implement `convertItemsToEnergy()` method that calculates energy from item values and validates
  - [ ] 3.9 Implement `convertEnergyToItems()` method that calculates items from energy and validates
  - [ ] 3.10 Implement `executeConversion()` method that performs conversion and returns outcome (limit to 1 conversion)
  - [ ] 3.11 Calculate energy cost based on depth and encounter type modifier
  - [ ] 3.12 Create `src/components/delvers-descent/encounters/advanced/energy-nexus-screen.tsx` UI component
  - [ ] 3.13 Display current energy and inventory in UI
  - [ ] 3.14 Display conversion rate clearly
  - [ ] 3.15 Add "Convert Items → Energy" button (disabled if insufficient items)
  - [ ] 3.16 Add "Convert Energy → Items" button (disabled if insufficient energy)
  - [ ] 3.17 Show preview of what player will receive after conversion
  - [ ] 3.18 Style UI to match existing advanced encounter screens
  - [ ] 3.19 Write unit tests for `EnergyNexusEncounter` class covering both conversion directions, validation, and limits
  - [ ] 3.20 Write UI tests for `energy-nexus-screen.tsx` component

- [ ] 4.0 Time Distortion Encounter Implementation
  - [ ] 4.1 Create `src/lib/delvers-descent/time-distortion-encounter.ts` with `TimeDistortionEncounter` class
  - [ ] 4.2 Define `TimeDistortionState` interface with encounter ID, config, selected action, and outcome fields
  - [ ] 4.3 Define `TimeDistortionConfig` interface with rewind and skip costs, risks, and side effect probabilities
  - [ ] 4.4 Implement constructor that accepts encounter ID, depth, and current run state snapshot
  - [ ] 4.5 Implement `getState()` method to return current state
  - [ ] 4.6 Implement `selectAction()` method to choose 'rewind' or 'skip'
  - [ ] 4.7 Implement `executeRewind()` method that restores previous encounter state (energy, inventory, position)
  - [ ] 4.8 Implement `executeSkip()` method that advances player 1-2 encounters forward (random or configurable)
  - [ ] 4.9 Implement `generateRandomSideEffect()` method that generates negative side effects with probabilities
  - [ ] 4.10 Implement `checkBustCondition()` method that evaluates if action causes bust
  - [ ] 4.11 Implement `execute()` method that performs selected action, applies side effects, and returns outcome
  - [ ] 4.12 Calculate high energy costs for both options based on depth
  - [ ] 4.13 Create `src/components/delvers-descent/encounters/advanced/time-distortion-screen.tsx` UI component
  - [ ] 4.14 Display two options: "Rewind" and "Skip" with their energy costs
  - [ ] 4.15 Display prominent risk warnings for each option
  - [ ] 4.16 Show potential negative side effects for each option
  - [ ] 4.17 Add confirmation dialog before executing risky actions
  - [ ] 4.18 Style UI to match existing advanced encounter screens with high-risk visual indicators
  - [ ] 4.19 Write unit tests for `TimeDistortionEncounter` class covering rewind, skip, side effects, and bust conditions
  - [ ] 4.20 Write UI tests for `time-distortion-screen.tsx` component

- [ ] 5.0 Fate Weaver Encounter Implementation
  - [ ] 5.1 Create `src/lib/delvers-descent/fate-weaver-encounter.ts` with `FateWeaverEncounter` class
  - [ ] 5.2 Define `FateWeaverState` interface with encounter ID, config, selected types, probability changes, and outcome fields
  - [ ] 5.3 Define `FateWeaverConfig` interface with selected encounter types (3 random), probability change amount (±10%)
  - [ ] 5.4 Implement constructor that accepts encounter ID, depth, and current region's encounter distribution
  - [ ] 5.5 Implement `getState()` method to return current state
  - [ ] 5.6 Implement `selectEncounterTypes()` method that randomly selects 3 encounter types from available regional types
  - [ ] 5.7 Implement `modifyProbability()` method that allows increase or decrease for each of the 3 types
  - [ ] 5.8 Implement `calculateNewDistribution()` method that applies probability changes and normalizes to 100%
  - [ ] 5.9 Implement `execute()` method that saves modified probabilities to run state and returns outcome
  - [ ] 5.10 Ensure probability changes persist for rest of run (stored in run state)
  - [ ] 5.11 Calculate energy cost based on depth and encounter type modifier
  - [ ] 5.12 Create `src/components/delvers-descent/encounters/advanced/fate-weaver-screen.tsx` UI component
  - [ ] 5.13 Display the 3 randomly selected encounter types
  - [ ] 5.14 Display current probability distribution (before changes) for all encounter types
  - [ ] 5.15 Display modified probability distribution (after changes) preview
  - [ ] 5.16 Add controls to choose increase or decrease for each of the 3 selected types
  - [ ] 5.17 Add confirmation button to apply changes
  - [ ] 5.18 Style UI to match existing advanced encounter screens with mystical theme
  - [ ] 5.19 Write unit tests for `FateWeaverEncounter` class covering type selection, probability modification, and normalization
  - [ ] 5.20 Write UI tests for `fate-weaver-screen.tsx` component

- [ ] 6.0 Integration and Balance Configuration
  - [ ] 6.1 Update `calculateFinalReward()` method in `RewardCalculator` to check for active luck boost in run state
  - [ ] 6.2 Apply luck boost multiplier to reward calculations when `luckBoostActive` exists
  - [ ] 6.3 Implement luck boost decay logic that reduces `remainingEncounters` after each encounter completion
  - [ ] 6.4 Remove luck boost from run state when `remainingEncounters` reaches 0
  - [ ] 6.5 Update `DungeonMapGenerator.generateEncounterType()` to check for `modifiedEncounterProbabilities` in run state
  - [ ] 6.6 Use modified probabilities if they exist, otherwise use default regional distribution
  - [ ] 6.7 Normalize modified probabilities to ensure they sum to 100% (handle edge cases)
  - [ ] 6.8 Update `DungeonMapGeneratorOptimized.generateEncounterType()` with same probability modification logic
  - [ ] 6.9 Add encounter distributions for new types in `DEFAULT_BALANCE_CONFIG.encounter.encounterDistribution`
  - [ ] 6.10 Update all regional encounter distributions in `balance-config.ts` to include new encounter types
  - [ ] 6.11 Update `FOREST_DEPTHS` region encounter distribution to include new types
  - [ ] 6.12 Update `DESERT_OASIS` region encounter distribution to include new types
  - [ ] 6.13 Update `MOUNTAIN_PASS` region encounter distribution to include new types
  - [ ] 6.14 Update `COASTAL_CAVES` region encounter distribution to include new types
  - [ ] 6.15 Update `DRAGONS_LAIR` region encounter distribution to include new types
  - [ ] 6.16 Add energy cost type modifiers for new encounter types in `EnergyBalanceConfig.typeModifiers`
  - [ ] 6.17 Ensure new encounter types have no reward multipliers (they provide utility, not direct rewards)
  - [ ] 6.18 Integrate all four new encounter screens into the encounter routing system in `encounter-screen.tsx`
  - [ ] 6.19 Test that luck boost applies correctly to subsequent encounters
  - [ ] 6.20 Test that modified encounter probabilities affect map generation
  - [ ] 6.21 Test that run state properly persists and restores all new state fields
  - [ ] 6.22 Write integration tests for luck boost reward calculation
  - [ ] 6.23 Write integration tests for probability modification in map generation
  - [ ] 6.24 Write end-to-end tests for complete encounter flows
