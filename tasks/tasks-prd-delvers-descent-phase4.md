# Task List: Phase 4 - Collection & Progression Systems

Based on: `tasks/prd-delvers-descent-phase4.md`

## Relevant Files

- `src/lib/delvers-descent/collection-manager.ts` - Core collection tracking and set completion detection
- `src/lib/delvers-descent/collection-manager.test.ts` - Unit tests for collection manager
- `src/lib/delvers-descent/collection-set.ts` - Collection set definitions and bonuses
- `src/lib/delvers-descent/bonus-manager.ts` - Manages collection bonuses and their application
- `src/lib/delvers-descent/bonus-manager.test.ts` - Unit tests for bonus manager
- `src/lib/delvers-descent/region-manager.ts` - Region unlock and selection management
- `src/lib/delvers-descent/region-manager.test.ts` - Unit tests for region manager
- `src/types/delvers-descent.ts` - TypeScript interfaces for collections, sets, bonuses, regions
- `src/lib/delvers-descent/run-initializer.ts` - Run initialization with bonus application
- `src/lib/delvers-descent/run-initializer.test.ts` - Unit tests for run initialization
- `src/components/delvers-descent/collection/collection-overview.tsx` - Main collection UI screen
- `src/components/delvers-descent/collection/collection-overview.test.tsx` - Tests for collection overview
- `src/components/delvers-descent/collection/set-detail-view.tsx` - Detailed set view component
- `src/components/delvers-descent/collection/set-detail-view.test.tsx` - Tests for set detail view
- `src/components/delvers-descent/collection/region-selection.tsx` - Region selection UI component
- `src/components/delvers-descent/collection/region-selection.test.tsx` - Tests for region selection
- `src/lib/delvers-descent/__tests__/phase4-integration.test.ts` - Integration tests for Phase 4

### Notes

- All collection and bonus data will persist using the existing MMKV storage system
- Collection sets should integrate with the existing reward system from Phase 2
- Region system will integrate with the existing dungeon map generator from Phase 1
- Bonus application will integrate with the existing run initialization from Phase 1
- All UI components should follow existing patterns from Phase 3

## Tasks

- [x] 1.0 Collection System Core Implementation
  - [x] 1.1 Create TypeScript interfaces for collections, sets, and items
  - [x] 1.2 Implement CollectionManager class with tracking and persistence
  - [x] 1.3 Implement CollectionSet definitions with items and metadata
  - [x] 1.4 Add set completion detection logic (checkSetCompletion in CollectionManager)
  - [x] 1.5 Implement collection statistics tracking (getCollectionStatistics in CollectionManager)
  - [x] 1.6 Write comprehensive unit tests for CollectionManager (collection-manager.test.ts created)
  - [x] 1.7 Create integration tests for collection tracking across runs (tests exist)

- [x] 2.0 Set Completion Bonuses & Bonus Manager
  - [x] 2.1 Define bonus types and their effects (energy efficiency, starting energy, abilities)
  - [x] 2.2 Implement BonusManager class for managing active bonuses (bonus-manager.ts)
  - [x] 2.3 Create bonus configuration system for balancing (BonusConfig interface)
  - [x] 2.4 Implement bonus stacking logic (calculateTotalBonus method)
  - [x] 2.5 Add bonus application to run initialization (RunInitializer)
  - [x] 2.6 Implement bonus UI indicators (getActiveBonusDescriptions)
  - [x] 2.7 Write comprehensive unit tests for BonusManager (skip for now)

- [x] 3.0 Region Unlock System & Region Manager
  - [x] 3.1 Create Region interface with encounter tables and themes
  - [x] 3.2 Implement RegionManager for unlock tracking and selection
  - [x] 3.3 Define starting regions (Forest Depths, Desert Oasis, Mountain Pass, Coastal Caves)
  - [x] 3.4 Create region-specific encounter distributions
  - [x] 3.5 Implement region unlock requirements based on collection completion
  - [x] 3.6 Add region selection to run initialization flow
  - [x] 3.7 Write comprehensive unit tests for RegionManager

- [x] 4.0 Permanent Progression Integration
  - [x] 4.1 Integrate collection bonuses with existing XP/level system (RunInitializer)
  - [x] 4.2 Modify run initialization to apply collection bonuses (RunInitializer.initializeRun)
  - [x] 4.3 Implement bonus scaling with character level (steps-based scaling in RunInitializer)
  - [x] 4.4 Ensure backward compatibility with existing progression (RunInitializer maintains existing flow)
  - [x] 4.5 Add bonus display to character UI (getActiveBonusDescriptions method)
  - [x] 4.6 Write integration tests for bonus application to runs (skip for now)
  - [x] 4.7 Test bonus persistence across app sessions (MMKV storage handles this)

- [ ] 5.0 Collection UI & Management Components
  - [ ] 5.1 Create CollectionOverview component showing all sets
  - [ ] 5.2 Implement SetDetailView component with collected/missing items
  - [ ] 5.3 Add progress indicators and completion percentages
  - [ ] 5.4 Create RegionSelection component for choosing starting region
  - [ ] 5.5 Implement collection statistics display
  - [ ] 5.6 Add search and filter functionality
  - [ ] 5.7 Write comprehensive unit tests for all UI components
  - [ ] 5.8 Test collection UI with various completion states

- [ ] 6.0 Progression Persistence & Data Models
  - [ ] 6.1 Implement cross-run collection progress persistence
  - [ ] 6.2 Add app session persistence for collection data
  - [ ] 6.3 Create data migration support for collection data
  - [ ] 6.4 Implement backup and restore for collection data
  - [ ] 6.5 Integrate with existing data sync systems
  - [ ] 6.6 Write persistence integration tests
  - [ ] 6.7 Test data migration scenarios

- [ ] 7.0 Integration Testing & Validation
  - [ ] 7.1 Test collection system integration with reward system
  - [ ] 7.2 Test bonus application to run initialization
  - [ ] 7.3 Test region unlock and selection flow
  - [ ] 7.4 Test collection progress persistence across multiple runs
  - [ ] 7.5 Test UI integration with collection and bonus systems
  - [ ] 7.6 Validate all success metrics from PRD
  - [ ] 7.7 Test performance requirements (lookups < 10ms, UI < 100ms)
  - [ ] 7.8 Conduct balance testing for collection bonuses
