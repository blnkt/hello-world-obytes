## Relevant Files

- `src/lib/delvers-descent/encounter-resolver.ts` - Core encounter resolution engine and state management ✅
- `src/lib/delvers-descent/encounter-resolver.test.ts` - Unit tests for encounter resolver ✅
- `src/lib/delvers-descent/puzzle-chamber-encounter.ts` - Puzzle Chamber encounter logic with limited tile reveals
- `src/lib/delvers-descent/puzzle-chamber-encounter.test.ts` - Unit tests for Puzzle Chamber encounter
- `src/lib/delvers-descent/trade-opportunity-encounter.ts` - Trade Opportunity encounter logic and mechanics
- `src/lib/delvers-descent/trade-opportunity-encounter.test.ts` - Unit tests for Trade Opportunity encounter
- `src/lib/delvers-descent/discovery-site-encounter.ts` - Discovery Site encounter logic and branching choices
- `src/lib/delvers-descent/discovery-site-encounter.test.ts` - Unit tests for Discovery Site encounter
- `src/lib/delvers-descent/reward-calculator.ts` - Depth-based reward calculation and scaling system
- `src/lib/delvers-descent/reward-calculator.test.ts` - Unit tests for reward calculator
- `src/lib/delvers-descent/failure-consequence-manager.ts` - Failure consequence handling and severity system
- `src/lib/delvers-descent/failure-consequence-manager.test.ts` - Unit tests for failure consequence manager
- `src/types/delvers-descent.ts` - Extend existing types with encounter-specific interfaces
- `src/types/delvers-descent.test.ts` - Update tests for new encounter types
- `src/components/delvers-descent/encounters/encounter-screen.tsx` - Main encounter screen component
- `src/components/delvers-descent/encounters/encounter-screen.test.tsx` - Unit tests for encounter screen
- `src/components/delvers-descent/encounters/puzzle-chamber-screen.tsx` - Puzzle Chamber encounter UI
- `src/components/delvers-descent/encounters/puzzle-chamber-screen.test.tsx` - Unit tests for Puzzle Chamber screen
- `src/components/delvers-descent/encounters/trade-opportunity-screen.tsx` - Trade Opportunity encounter UI
- `src/components/delvers-descent/encounters/trade-opportunity-screen.test.tsx` - Unit tests for Trade Opportunity screen
- `src/components/delvers-descent/encounters/discovery-site-screen.tsx` - Discovery Site encounter UI
- `src/components/delvers-descent/encounters/discovery-site-screen.test.tsx` - Unit tests for Discovery Site screen
- `src/components/delvers-descent/hooks/use-encounter-resolver.tsx` - React hook for encounter resolution
- `src/components/delvers-descent/hooks/use-encounter-resolver.test.tsx` - Unit tests for encounter resolver hook
- `src/lib/delvers-descent/__tests__/encounter-integration.test.ts` - Integration tests for encounter system

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `encounter-resolver.ts` and `encounter-resolver.test.ts` in the same directory).
- Use `pnpm test [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [ ] 1.0 Encounter Resolution Framework
  - [x] 1.1 Create core EncounterResolver class with state management
  - [x] 1.2 Implement encounter type detection and routing logic
  - [x] 1.3 Add encounter progress tracking and persistence
  - [x] 1.4 Create encounter outcome processing system
  - [x] 1.5 Implement encounter state transitions (start, progress, complete, fail)
  - [ ] 1.6 Add comprehensive unit tests for encounter resolver

- [ ] 2.0 Puzzle Chamber Integration
  - [ ] 2.1 Analyze existing dungeon game mechanics and tile distribution
  - [ ] 2.2 Create PuzzleChamberEncounter class with limited tile reveals (8-12 reveals)
  - [ ] 2.3 Implement exit discovery goal with ~80-85% success probability
  - [ ] 2.4 Adapt existing tile types (treasure, trap, exit, bonus, neutral) for encounter context
  - [ ] 2.5 Create depth-based reward scaling for Puzzle Chamber rewards
  - [ ] 2.6 Implement failure handling when tile reveals are exhausted
  - [ ] 2.7 Add comprehensive unit tests for Puzzle Chamber encounter

- [ ] 3.0 Trade Opportunity Encounters
  - [ ] 3.1 Create TradeOpportunityEncounter class with resource trading mechanics
  - [ ] 3.2 Implement decision-based gameplay with A/B/C choice options
  - [ ] 3.3 Create arbitrage opportunities with price differences between trade posts
  - [ ] 3.4 Implement collection set item rewards (trade goods)
  - [ ] 3.5 Add depth-based inventory scaling (better goods at deeper depths)
  - [ ] 3.6 Implement failure consequences for bad trades (lost resources/energy)
  - [ ] 3.7 Add comprehensive unit tests for Trade Opportunity encounter

- [ ] 4.0 Discovery Site Encounters
  - [ ] 4.1 Create DiscoverySiteEncounter class with exploration mechanics
  - [ ] 4.2 Implement branching choice system with multiple paths
  - [ ] 4.3 Create lore collection system for regional history and world-building
  - [ ] 4.4 Implement map information rewards (intel about deeper paths/shortcuts)
  - [ ] 4.5 Add regional discovery items for collection sets
  - [ ] 4.6 Implement risk/reward decision mechanics with varying failure consequences
  - [ ] 4.7 Add comprehensive unit tests for Discovery Site encounter

- [ ] 5.0 Reward and Failure Systems
  - [ ] 5.1 Create RewardCalculator class with depth-based scaling (base × (1 + depth × 0.2))
  - [ ] 5.2 Implement encounter type multipliers for different base reward values
  - [ ] 5.3 Create collection set integration for trade goods, discoveries, and legendaries
  - [ ] 5.4 Implement variable reward system with random variation within depth ranges
  - [ ] 5.5 Create FailureConsequenceManager with multiple failure types
  - [ ] 5.6 Implement energy loss, item loss risk, and forced retreat consequences
  - [ ] 5.7 Add encounter lockout and cascading failure severity systems
  - [ ] 5.8 Add comprehensive unit tests for reward and failure systems

- [ ] 6.0 Encounter UI Integration
  - [ ] 6.1 Create main EncounterScreen component with encounter type routing
  - [ ] 6.2 Implement PuzzleChamberScreen with limited tile reveal UI
  - [ ] 6.3 Create TradeOpportunityScreen with resource trading interface
  - [ ] 6.4 Implement DiscoverySiteScreen with branching choice interface
  - [ ] 6.5 Add smooth transitions between map view and encounter screens
  - [ ] 6.6 Implement return to map functionality after encounter completion
  - [ ] 6.7 Create useEncounterResolver React hook for UI integration
  - [ ] 6.8 Add comprehensive unit tests for all encounter UI components
  - [ ] 6.9 Create integration tests for complete encounter system workflow
