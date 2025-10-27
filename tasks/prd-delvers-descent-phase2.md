# PRD: Delver's Descent Phase 2 - Encounter Resolution System

## Introduction/Overview

Phase 2 implements the encounter resolution system for Delver's Descent, transforming the spatial navigation foundation from Phase 1 into an interactive dungeon crawling experience. This phase focuses on creating engaging encounter mechanics that provide meaningful choices, strategic depth, and variable rewards based on depth progression.

**Problem Solved:** Players can navigate the spatial dungeon map but cannot interact with nodes or resolve encounters. The existing dungeon game exists in isolation and needs to be integrated as one encounter type within the larger Delver's Descent system.

**Goal:** Create a comprehensive encounter resolution system that provides multiple encounter types with different mechanics, rewards, and failure consequences, while repurposing the existing dungeon game as a Puzzle Chamber encounter with limited tile reveals.

## Goals

1. **Encounter Resolution System**: Implement a unified system for resolving different encounter types
2. **Puzzle Chamber Integration**: Repurpose existing dungeon game with limited tile reveals (no energy cost per tile)
3. **Multiple Encounter Types**: Create Trade Opportunity and Discovery Site encounters with different mechanics
4. **Variable Reward System**: Implement depth-based and encounter-type-based reward scaling
5. **Failure Consequence System**: Create multiple failure types with different consequences
6. **Encounter UI Integration**: Design separate encounter screens that integrate with spatial navigation

## User Stories

1. **As a player**, I want to interact with nodes on the dungeon map so I can engage with different encounter types.
2. **As a player**, I want to play the puzzle chamber encounter with limited tile reveals so I have a strategic challenge with good success odds.
3. **As a player**, I want to encounter trade opportunities so I can make strategic decisions about buying/selling resources.
4. **As a player**, I want to explore discovery sites so I can find lore, regional discoveries, and map information.
5. **As a player**, I want rewards to scale with depth level so deeper exploration feels more rewarding.
6. **As a player**, I want different failure consequences so encounters feel meaningful and risky.
7. **As a player**, I want to return to the map after encounters so I can continue my spatial navigation.

## Functional Requirements

### Core Encounter System

- [ ] **Encounter Resolution Engine**: Unified system for handling all encounter types
- [ ] **Encounter State Management**: Track encounter progress, choices, and outcomes
- [ ] **Encounter UI Framework**: Modal/screen system for encounter interactions
- [ ] **Return to Map Integration**: Seamless transition between encounters and spatial navigation
- [ ] **Encounter Outcome Processing**: Handle rewards, failures, and state updates

### Puzzle Chamber Encounter (Repurposed Dungeon Game)

- [ ] **Limited Tile Reveals**: Player gets 8-12 tile reveals (no energy cost per reveal)
- [ ] **Exit Discovery Goal**: Primary objective is to find the exit tile
- [ ] **Success Probability**: ~80-85% chance of finding exit with optimal play
- [ ] **Tile Type Preservation**: Keep existing tile types (treasure, trap, exit, bonus, neutral)
- [ ] **Reward Scaling**: Rewards increase with depth level (base + depth multiplier)
- [ ] **Failure Handling**: Run out of reveals = encounter failure, lose encounter rewards

### Trade Opportunity Encounter

- [ ] **Resource Trading**: Buy/sell/trade resources with NPCs
- [ ] **Decision-Based Gameplay**: Simple A/B/C choice mechanics
- [ ] **Arbitrage Opportunities**: Price differences between different trade posts
- [ ] **Collection Set Items**: Trade goods that contribute to collection sets
- [ ] **Depth-Based Inventory**: Better trade goods available at deeper depths
- [ ] **Failure Consequences**: Bad trades can result in lost resources or energy

### Discovery Site Encounter

- [ ] **Exploration Choices**: Multiple branching paths with different outcomes
- [ ] **Lore Collection**: Discover regional history and world-building elements
- [ ] **Map Information**: Gain intel about deeper paths or shortcuts
- [ ] **Regional Discoveries**: Items that contribute to regional collection sets
- [ ] **Risk/Reward Decisions**: Some choices have higher rewards but higher failure risk
- [ ] **Failure Consequences**: Failed exploration can trigger hazards or forced retreat

### Reward System

- [ ] **Depth Scaling**: Base rewards × (1 + depth × 0.2) for all encounter types
- [ ] **Encounter Type Multipliers**: Different base reward values per encounter type
- [ ] **Collection Set Integration**: Rewards contribute to trade goods, discoveries, and legendaries
- [ ] **Variable Rewards**: Random variation within depth-based ranges

### Failure Consequence System

- [ ] **Energy Loss**: Failed encounters cost additional energy (5-15 energy)
- [ ] **Item Loss Risk**: Failed encounters have chance to lose collected items
- [ ] **Forced Retreat**: Critical failures force player back one depth level
- [ ] **Encounter Lockout**: Failed encounters may become unavailable for remainder of run
- [ ] **Cascading Failures**: Multiple failures increase severity of consequences

## Non-Goals (Out of Scope)

- Risk Event encounters (Phase 3)
- Hazard encounters (Phase 3)
- Rest Site encounters (Phase 3)
- Collection set completion bonuses (Phase 4)
- Advanced encounter balancing (Phase 5)
- Visual polish and animations (Phase 5)

## Technical Considerations

**Integration Points:**

- Existing dungeon game components → Puzzle Chamber encounter
- Delver's Descent run state → Encounter progress tracking
- Collection system interfaces → Reward processing
- Energy management → Failure consequence handling

**Performance:**

- Encounter screens should load quickly (<200ms)
- Smooth transitions between map and encounter views
- Efficient state management for encounter progress

**Data Persistence:**

- Encounter progress persists during active runs
- Failed encounter states reset between runs
- Reward collection integrates with existing storage

## Success Metrics

1. **Engagement**: Players complete 90%+ of started encounters
2. **Puzzle Chamber Success**: 80-85% success rate for finding exit tile
3. **Encounter Variety**: Players engage with all encounter types roughly equally
4. **Reward Satisfaction**: Rewards feel appropriately scaled to depth and effort
5. **Failure Balance**: 15-25% encounter failure rate maintains tension without frustration
6. **Performance**: Encounter transitions complete within 200ms

## Open Questions

1. **Tile Reveal Count**: Should tile reveals be fixed (10) or variable based on depth?
2. **Trade Post Inventory**: How many different trade goods should be available per encounter?
3. **Discovery Site Complexity**: How many branching choices should discovery sites have?
4. **Failure Severity**: What percentage of encounters should have severe failure consequences?
5. **Encounter Frequency**: Should certain encounter types be more common at specific depths?

## Implementation Notes

- Start with Puzzle Chamber integration (highest priority)
- Use existing dungeon game components as foundation
- Create reusable encounter UI framework for all encounter types
- Implement depth-based reward scaling early for testing
- Focus on smooth map ↔ encounter transitions
- Prepare interfaces for Phase 3 encounter types
