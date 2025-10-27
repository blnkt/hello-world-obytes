# PRD: Delver's Descent Phase 1 - Core Systems

## Introduction/Overview

Phase 1 establishes the foundational systems for Delver's Descent, transforming the existing turn-based dungeon game into a spatial push-your-luck dungeon crawler. This phase focuses on core mechanics: daily runs queue system, energy economy redesign, spatial navigation map generation, and basic descent/return mechanics.

**Problem Solved:** Replace the existing "100 steps = 1 turn" currency system with a daily runs queue where each day's steps generate energy for that specific day's run, enabling spatial navigation through depth levels with return journey energy management.

**Goal:** Create the core infrastructure for spatial dungeon navigation with energy-based progression, daily run queuing, and the fundamental push-your-luck mechanics that will support all future phases.

## Goals

1. **Daily Runs Queue System**: Implement queuing of runs based on daily step data from HealthKit
2. **Energy Economy Redesign**: Replace turn-based currency with energy pools per run (1 step = 1 energy)
3. **Spatial Navigation**: Create depth-based dungeon map generation with 2-3 nodes per depth level
4. **Return Journey Mechanics**: Implement exponential return cost calculation and energy management
5. **Run State Management**: Track current depth, energy remaining, inventory, and visited nodes
6. **Integration**: Maintain existing HealthKit step tracking while adding new energy system

## User Stories

1. **As a player**, I want to see queued runs based on my daily step data so I can play runs corresponding to my real-world activity.
2. **As a player**, I want each run to have energy based on that specific day's steps so my activity level determines my run potential.
3. **As a player**, I want to navigate through depth levels with multiple node choices so I can make strategic path decisions.
4. **As a player**, I want to see return energy costs so I can decide when to cash out safely vs. push deeper.
5. **As a player**, I want streak bonuses for meeting daily step goals so I'm rewarded for consistent activity.
6. **As a player**, I want to track my current depth and energy remaining so I can make informed decisions about continuing.
7. **As a player**, I want to see my inventory of collected items during a run so I know what I'm risking.

## Functional Requirements

### Core Systems

- [ ] **Daily Runs Queue**: Generate runs from HealthKit daily step data
- [ ] **Energy Calculation**: 1 step = 1 energy unit for that day's run
- [ ] **Streak Bonuses**: 10,000+ step days = +20% bonus energy
- [ ] **Run Status Tracking**: queued, active, completed, busted states
- [ ] **Spatial Map Generation**: Create depth-based dungeon with 2-3 nodes per level
- [ ] **Node Types**: Support encounter types (puzzle_chamber, trade_opportunity, discovery_site, risk_event, hazard, rest_site)
- [ ] **Energy Cost Scaling**: Node costs scale with depth (5-25 energy)
- [ ] **Return Cost Calculation**: Exponential scaling based on depth
- [ ] **Run State Management**: Track depth, energy, inventory, visited nodes
- [ ] **Integration**: Maintain existing HealthKit step tracking and XP accumulation

### Data Models

- [ ] **DelvingRun Interface**: id, date, steps, energy calculations, status
- [ ] **DungeonNode Interface**: depth, position, type, costs, connections
- [ ] **RunState Interface**: current state, inventory, visited nodes
- [ ] **CollectedItem Interface**: type, setId, value, name, description
- [ ] **Shortcut Interface**: depth connections, energy reduction

### Algorithms

- [ ] **Map Generation**: Fisher-Yates shuffle for encounter types per depth
- [ ] **Return Cost Calculation**: Exponential scaling with shortcut support
- [ ] **Energy Management**: Track remaining energy and calculate safety margins
- [ ] **Run Queue Management**: Generate and manage queued runs from step data

## Non-Goals (Out of Scope)

- Encounter resolution mechanics (Phase 2)
- Collection set completion bonuses (Phase 4)
- Region unlocks (Phase 4)
- Visual UI components (Phase 5)
- Advanced balancing (Phase 5)
- Tutorial/onboarding (Phase 6)

## Technical Considerations

**Integration Points:**

- HealthKit daily step data → run energy calculation
- Existing character XP system (unchanged)
- Existing step tracking and storage
- New energy system alongside existing currency system

**Performance:**

- Efficient map generation for unlimited depth
- Minimal memory usage for run state management
- Fast energy cost calculations

**Data Persistence:**

- Run queue persistence across app sessions
- Run state persistence during active runs
- Integration with existing storage system

## Success Metrics

1. **Functionality**: Daily runs generate correctly from step data
2. **Energy System**: 1 step = 1 energy calculation works accurately
3. **Map Generation**: Spatial navigation creates valid depth-based maps
4. **Return Costs**: Exponential scaling provides appropriate risk/reward tension
5. **Integration**: Existing HealthKit and XP systems continue working
6. **Performance**: Map generation and energy calculations complete within 100ms

## Open Questions

1. **Run Queue Limit**: Should there be a maximum number of queued runs?
2. **Map Depth Limit**: Should there be a practical maximum depth for generation?
3. **Energy Precision**: Should energy be integers or allow fractional values?
4. **Run Expiration**: Should old queued runs expire or persist indefinitely?

## Implementation Notes

- Start with core data models and algorithms
- Use TDD approach with comprehensive test coverage
- Maintain backward compatibility with existing systems
- Focus on clean separation between new and existing systems
- Prepare interfaces for future phases (encounters, collections, etc.)
