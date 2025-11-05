# Tasks: Scoundrel Encounter Type

## Relevant Files

- `src/types/delvers-descent.ts` - Type definitions, needs `scoundrel` added to `EncounterType` union
- `src/types/delvers-descent.test.ts` - Unit tests for type definitions
- `src/lib/delvers-descent/scoundrel-encounter.ts` - New file for ScoundrelEncounter class
- `src/lib/delvers-descent/scoundrel-encounter.test.ts` - Unit tests for ScoundrelEncounter
- `src/lib/delvers-descent/encounter-resolver.ts` - EncounterResolver, needs scoundrel support
- `src/lib/delvers-descent/encounter-resolver.test.ts` - Unit tests for EncounterResolver
- `src/lib/delvers-descent/encounter-loader-optimized.ts` - EncounterLoaderOptimized, needs scoundrel support
- `src/lib/delvers-descent/encounter-router.ts` - Encounter routing, needs scoundrel route
- `src/lib/delvers-descent/reward-calculator.ts` - RewardCalculator for reward processing
- `src/lib/delvers-descent/balance-config.ts` - Balance configuration, needs scoundrel multiplier
- `src/lib/delvers-descent/map-generator-optimized.ts` - Map generator, needs scoundrel in distribution
- `src/lib/delvers-descent/map-generator.ts` - Alternative map generator (if used)
- `src/lib/delvers-descent/run-state-manager.ts` - RunStateManager for inventory access
- `src/components/delvers-descent/encounters/scoundrel-screen.tsx` - New UI component for Scoundrel encounter
- `src/components/delvers-descent/encounters/scoundrel-screen.test.tsx` - Unit tests for ScoundrelScreen
- `src/components/delvers-descent/encounters/encounter-screen.tsx` - EncounterScreen, needs scoundrel routing
- `src/components/delvers-descent/hooks/use-encounter-resolver.tsx` - Hook for encounter resolution

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `pnpm test [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [x] 1.0 Add Scoundrel Encounter Type to System
  - [x] 1.1 Add `'scoundrel'` to `EncounterType` union type in `src/types/delvers-descent.ts`
  - [x] 1.2 Add `'scoundrel'` to `ENCOUNTER_TYPES` constant array
  - [x] 1.3 Update `isValidEncounterType` function to include `'scoundrel'`
  - [x] 1.4 Add `'scoundrel'` to `EncounterRoute` type in `src/lib/delvers-descent/encounter-router.ts`
  - [x] 1.5 Add `'scoundrel'` route mapping in `getEncounterRoute` function
  - [x] 1.6 Add `'scoundrel'` to `isEncounterSupported` function
  - [x] 1.7 Add `'scoundrel'` to `supportedEncounterTypes` array in `EncounterResolver`
  - [x] 1.8 Add `'scoundrel'` to `supportedEncounterTypes` array in `EncounterLoaderOptimized`
  - [x] 1.9 Add `scoundrel` multiplier to `encounterTypeMultipliers` in `EncounterResolver` (suggest 1.2x)
  - [x] 1.10 Add `scoundrel` multiplier to `encounterTypeMultipliers` in `EncounterLoaderOptimized`
  - [x] 1.11 Update `balance-config.ts` to include `scoundrel` in `typeMultipliers` (default: 1.2)
  - [x] 1.12 Write unit tests for type definitions and validation
  - [x] 1.13 Write unit tests for encounter routing

- [ ] 2.0 Create ScoundrelEncounter Class and Core Mechanics
  - [ ] 2.1 Create `src/lib/delvers-descent/scoundrel-encounter.ts` file
  - [ ] 2.2 Define `ScoundrelConfig` interface with startingLife (default: 10), dungeonSize, and depth
  - [ ] 2.3 Define `ScoundrelState` interface with encounterId, encounterType, config, currentLife, currentRoom, isResolved, outcome
  - [ ] 2.4 Define `DungeonRoom` interface with id, roomNumber, monsters, cards, isCompleted
  - [ ] 2.5 Define `Monster` interface with id, name, value (for scoring), lifeDamage
  - [ ] 2.6 Define `Card` interface with id, name, type ('monster' | 'health_potion' | 'treasure' | 'trap'), effect
  - [ ] 2.7 Define `AdvancedEncounterOutcome` interface (reuse from risk-event-encounter.ts)
  - [ ] 2.8 Implement `ScoundrelEncounter` class with constructor taking encounterId and config
  - [ ] 2.9 Implement `getState()` method returning current state
  - [ ] 2.10 Implement `initializeDungeon()` method to create dungeon structure
  - [ ] 2.11 Implement `getCurrentLife()` method returning current life points
  - [ ] 2.12 Implement `getMaxLife()` method returning starting life (10)
  - [ ] 2.13 Implement `isEncounterComplete()` method checking if life = 0 OR dungeon completed
  - [ ] 2.14 Implement `getRemainingMonsters()` method returning monsters not yet encountered
  - [ ] 2.15 Write unit tests for ScoundrelEncounter initialization and state management

- [ ] 3.0 Implement Dungeon Structure and Gameplay
  - [ ] 3.1 Implement `generateDungeon()` method creating 5-10 rooms based on config
  - [ ] 3.2 Implement `generateMonsters()` method creating monsters with values and life damage
  - [ ] 3.3 Implement `generateCards()` method creating abstracted cards (monsters, health potions, treasures, traps)
  - [ ] 3.4 Implement `selectCard(cardId: string)` method for player card selection
  - [ ] 3.5 Implement `processCard(card: Card)` method updating life and game state
  - [ ] 3.6 Implement `advanceRoom()` method moving to next room in dungeon
  - [ ] 3.7 Implement `getCurrentRoom()` method returning current room info
  - [ ] 3.8 Implement `getDungeonProgress()` method returning current room / total rooms
  - [ ] 3.9 Implement `getAvailableCards()` method returning cards available in current room
  - [ ] 3.10 Implement `trackLastCard()` method storing last card played (for health potion bonus)
  - [ ] 3.11 Implement `getLastCard()` method returning last card played
  - [ ] 3.12 Write unit tests for dungeon generation
  - [ ] 3.13 Write unit tests for card selection and processing
  - [ ] 3.14 Write unit tests for room advancement

- [ ] 4.0 Implement Scoring System
  - [ ] 4.1 Implement `calculateScore()` method with scoring logic
  - [ ] 4.2 Implement failure scoring: if life = 0, sum remaining monster values, subtract from life → negative score
  - [ ] 4.3 Implement success scoring: if dungeon completed, score = remaining life
  - [ ] 4.4 Implement health potion bonus: if life = 20 and last card was health potion, score = life + potion value
  - [ ] 4.5 Implement `getRemainingMonsterValues()` helper method summing values of unencountered monsters
  - [ ] 4.6 Implement `isHealthPotion(card: Card)` helper method checking if card is health potion
  - [ ] 4.7 Implement `getHealthPotionValue(card: Card)` helper method extracting potion value
  - [ ] 4.8 Ensure score calculation handles edge cases (life exactly 0, life exactly 20, no remaining monsters)
  - [ ] 4.9 Write unit tests for failure scoring (life = 0 scenario)
  - [ ] 4.10 Write unit tests for success scoring (dungeon completed scenario)
  - [ ] 4.11 Write unit tests for health potion bonus scoring
  - [ ] 4.12 Write unit tests for edge cases in scoring

- [ ] 5.0 Implement Tiered Rewards System
  - [ ] 5.1 Define reward tier thresholds (e.g., 0-10 = tier 1, 11-20 = tier 2, 21+ = tier 3)
  - [ ] 5.2 Define XP amounts per tier (e.g., tier 1 = 50 XP, tier 2 = 100 XP, tier 3 = 200 XP)
  - [ ] 5.3 Define item counts per tier (e.g., tier 1 = 1 item, tier 2 = 2 items, tier 3 = 3 items)
  - [ ] 5.4 Implement `getRewardTier(score: number)` method determining tier from score
  - [ ] 5.5 Implement `calculateRewardXP(tier: number)` method returning XP for tier
  - [ ] 5.6 Implement `calculateRewardItemCount(tier: number)` method returning item count for tier
  - [ ] 5.7 Implement `generateRewards(score: number)` method creating EncounterReward with XP and items
  - [ ] 5.8 Integrate with `RewardCalculator.processEncounterRewards()` for item value scaling
  - [ ] 5.9 Ensure rewards use existing collection item generation (trade_goods, discoveries, legendaries)
  - [ ] 5.10 Implement `resolve()` method that calculates score and generates rewards
  - [ ] 5.11 Ensure `resolve()` returns `AdvancedEncounterOutcome` with success/failure type
  - [ ] 5.12 Write unit tests for tier calculation
  - [ ] 5.13 Write unit tests for reward generation per tier
  - [ ] 5.14 Write unit tests for reward integration with RewardCalculator

- [ ] 6.0 Implement Failure Consequences (Item Theft and Energy Loss)
  - [ ] 6.1 Implement `calculateItemsToSteal(score: number)` method (lower score = more items)
  - [ ] 6.2 Implement `stealItemsFromInventory(runInventory: CollectedItem[], count: number)` method
  - [ ] 6.3 Ensure item theft is random from current run inventory
  - [ ] 6.4 Implement `calculateEnergyLoss(score: number, remainingLife: number)` method
  - [ ] 6.5 Ensure energy loss scales with failure severity (negative score magnitude or life deficit)
  - [ ] 6.6 Implement `applyFailureConsequences()` method combining item theft and energy loss
  - [ ] 6.7 Integrate with `RunStateManager` to access current run inventory
  - [ ] 6.8 Ensure consequences are returned in `AdvancedEncounterOutcome.consequence` on failure
  - [ ] 6.9 Update `resolve()` method to apply failure consequences when life = 0
  - [ ] 6.10 Ensure failure consequences message describes items stolen and energy lost
  - [ ] 6.11 Update `active-run.tsx` to handle scoundrel failure consequences (item theft and energy loss)
  - [ ] 6.12 Ensure stolen items are removed from run inventory when failure occurs
  - [ ] 6.13 Ensure additional energy loss is applied to run state when failure occurs
  - [ ] 6.14 Write unit tests for item theft calculation
  - [ ] 6.15 Write unit tests for energy loss calculation
  - [ ] 6.16 Write unit tests for failure consequences integration
  - [ ] 6.17 Write integration tests with RunStateManager

- [ ] 7.0 Create Scoundrel Encounter UI Screen
  - [ ] 7.1 Create `src/components/delvers-descent/encounters/scoundrel-screen.tsx` file
  - [ ] 7.2 Define `ScoundrelScreenProps` interface with encounter, onComplete, onReturn
  - [ ] 7.3 Implement life display component showing "Life: X/10" with visual indicator
  - [ ] 7.4 Implement dungeon progress display showing "Room X/Y"
  - [ ] 7.5 Implement current score display (for success scenarios)
  - [ ] 7.6 Implement remaining monsters display showing list with values (for failure scenarios)
  - [ ] 7.7 Implement last card display showing last card played (especially health potion)
  - [ ] 7.8 Implement reward preview showing potential tier based on current score
  - [ ] 7.9 Implement failure warning when life ≤ 2 (e.g., "Life: 1/10 - Risk of Failure!")
  - [ ] 7.10 Implement card selection UI (abstracted, not actual cards - choices/actions)
  - [ ] 7.11 Implement room navigation UI showing available cards/choices
  - [ ] 7.12 Implement outcome display showing success/failure, score, rewards, consequences
  - [ ] 7.13 Add "Continue" button to proceed after outcome
  - [ ] 7.14 Add "Return to Map" button to exit encounter
  - [ ] 7.15 Integrate with encounter state management
  - [ ] 7.16 Write unit tests for ScoundrelScreen component
  - [ ] 7.17 Write unit tests for UI state management

- [ ] 8.0 Integrate Scoundrel into Map Generation
  - [ ] 8.1 Update `DungeonMapGeneratorOptimized.encounterTypes` array to include `'scoundrel'`
  - [ ] 8.2 Update `encounterWeights` initialization to include scoundrel with 0.05 weight (5%)
  - [ ] 8.3 Update `DEFAULT_BALANCE_CONFIG.encounter.encounterDistribution` to include scoundrel: 0.05
  - [ ] 8.4 Adjust other encounter weights proportionally to maintain total = 1.0
  - [ ] 8.5 Update region-specific encounter distributions if they exist
  - [ ] 8.6 Update `encounter-screen.tsx` to include scoundrel in `advancedTypes` array
  - [ ] 8.7 Add scoundrel case to `renderAdvancedEncounter` function
  - [ ] 8.8 Add scoundrel import to `encounter-screen.tsx` (import ScoundrelEncounter)
  - [ ] 8.9 Add scoundrel case to `createBasicEncounter` function (or create separate function)
  - [ ] 8.10 Add scoundrel case to `useAdvancedEncounter` hook to instantiate ScoundrelEncounter
  - [ ] 8.11 Create `ScoundrelEncounter.createScoundrelConfig()` static method for config generation
  - [ ] 8.12 Ensure scoundrel encounters are generated with correct energy costs
  - [ ] 8.13 Write unit tests for map generation with scoundrel encounters
  - [ ] 8.14 Write integration tests verifying 5% frequency in generated maps
  - [ ] 8.15 Write integration tests for encounter routing and screen display
