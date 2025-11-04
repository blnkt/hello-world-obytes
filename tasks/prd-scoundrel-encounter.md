# PRD: Scoundrel Encounter Type

## Introduction/Overview

This feature implements a new encounter type based on the solo card game "Scoundrel". Players navigate through a dungeon with fixed life points, facing monsters and collecting cards. The encounter ends when the player's life reaches 0 (failure) or they complete the entire dungeon (success). Rewards (XP and items) are determined by the player's final score, which is calculated differently based on whether they succeeded or failed. Failure results in item loss and additional energy drain based on how badly they failed.

**Problem Solved:** The game currently lacks a strategic, risk/reward encounter type that offers variable rewards based on player performance. This adds depth and replayability by rewarding skilled play with better rewards while penalizing failure appropriately.

**Goal:** Implement a Scoundrel-based encounter that provides a unique gameplay experience with score-based rewards, strategic decision-making, and meaningful failure consequences.

## Goals

1. Create a new `scoundrel` encounter type that integrates with the existing encounter system
2. Implement a simplified card game mechanic (abstracted, no actual card UI)
3. Implement a dungeon navigation system with monsters and cards
4. Calculate scores based on completion method (success vs failure)
5. Provide tiered rewards (XP and items) based on final score
6. Implement failure consequences (item theft and energy loss) based on failure severity
7. Make the encounter appear at a lower frequency (5% chance) compared to other encounters

## User Stories

1. **As a player**, I want to encounter a Scoundrel-style dungeon challenge, so I can experience a unique strategic gameplay encounter.
2. **As a player**, I want my final score to determine my rewards, so skilled play is rewarded with better XP and items.
3. **As a player**, I want to see my life points and understand when I'm at risk of failure, so I can make strategic decisions.
4. **As a player**, I want to complete the dungeon successfully by managing my life, so I can earn positive rewards.
5. **As a player**, I want to understand that failure results in item loss and energy drain, so I can weigh the risks of pushing too far.
6. **As a player**, I want the encounter to feel rare and special, so it remains exciting when it appears.

## Functional Requirements

### Encounter Basics

1. The system must create a new `scoundrel` encounter type
2. The encounter must use a fixed starting life amount (same for all players, default: 10 HP)
3. The encounter must integrate with the existing encounter system (`EncounterType`, `EncounterResolver`, etc.)
4. The encounter must appear at 5% frequency in map generation (rarer than other encounters)
5. The encounter must have an energy cost calculated like other encounters

### Dungeon and Gameplay

6. The system must create a dungeon structure with monsters and cards
7. The system must track player's current life points throughout the encounter
8. The system must allow players to navigate through the dungeon (abstracted card play)
9. The system must track which monsters remain in the dungeon
10. The system must track the last card played (for health potion scoring bonus)
11. The encounter must end when player's life reaches 0 OR when they complete the entire dungeon
12. The system must support simplified card mechanics (abstracted, no actual card UI)

### Scoring System

13. The system must calculate score differently based on completion method:
    - **Failure (life = 0)**: Find all remaining monsters in dungeon, subtract their values from life → negative score
    - **Success (completed dungeon)**: Score = positive remaining life
    - **Success with health potion bonus**: If life = 20 and last card was health potion, score = life + potion value
14. The system must track remaining monsters and their values for failure scoring
15. The system must identify health potion cards for bonus scoring

### Rewards System

16. The system must provide tiered rewards based on final score thresholds (e.g., 0-10 = tier 1, 11-20 = tier 2, 21+ = tier 3)
17. The system must award XP based on tiered amounts (e.g., 0-10 = 50 XP, 11-20 = 100 XP, 21+ = 200 XP)
18. The system must award items based on tiered thresholds (e.g., 0-10 = 1 item, 11-20 = 2 items, 21+ = 3 items)
19. The system must use the same reward processing as other encounters (`RewardCalculator`)
20. The system must integrate with the collection system the same way as other encounters

### Failure Consequences

21. The system must define failure as life reaching 0 (regardless of score)
22. The system must steal items from the player's run inventory on failure
23. The system must calculate number of items stolen based on score (lower score = more items stolen)
24. The system must calculate additional energy loss based on failure severity (based on negative score or remaining life)
25. The system must apply energy loss in addition to the encounter's energy cost

### Success Definition

26. The system must define success as life > 0 at encounter completion (score doesn't affect success/failure, only rewards)
27. The system must allow players to succeed even with low scores (they still get rewards, just lower tier)

### Integration Points

28. The encounter must integrate with `EncounterResolver` for state management
29. The encounter must integrate with `RewardCalculator` for reward processing
30. The encounter must integrate with `CollectionManager` for item tracking
31. The encounter must integrate with map generation to appear at 5% frequency
32. The encounter must integrate with run state management for inventory access

## Non-Goals (Out of Scope)

- Full card game implementation with actual card UI
- Complex card combinations or deck-building mechanics
- Multiple difficulty levels or life scaling with depth
- Saving progress mid-encounter (encounter must complete in one session)
- Custom card art or visual assets (use placeholder/abstracted visuals)
- Integration with achievement system (may be added later)
- Leaderboards or score tracking across runs
- Modifying the core Scoundrel game rules (simplified adaptation only)

## Design Considerations

### UI/UX Requirements

- **Life Display**: Clear display of current life points (e.g., "Life: 8/10")
- **Dungeon Progress**: Show progress through dungeon (e.g., "Room 3/5")
- **Score Display**: Show current score during encounter (for success scenarios)
- **Monster Tracking**: Display remaining monsters and their values (for failure scenarios)
- **Last Card Display**: Show last card played (especially for health potion bonus)
- **Reward Preview**: Show potential reward tiers based on current score
- **Failure Warning**: Clear warning when life is low (e.g., "Life: 1/10 - Risk of Failure!")

### Gameplay Flow

1. Player encounters Scoundrel node
2. Encounter starts with fixed life (e.g., 10 HP)
3. Player navigates through dungeon rooms
4. Each room presents choices/decisions (abstracted card mechanics)
5. Player's life changes based on decisions
6. Encounter ends when life = 0 (failure) OR dungeon completed (success)
7. Score calculated based on completion method
8. Rewards calculated based on score tier
9. If failure, items stolen and energy lost based on failure severity

### Technical Considerations

- **Simplified Card System**: Cards should be abstracted as choices/actions rather than visual cards
- **Dungeon Generation**: Create a simple dungeon structure (rooms with monsters/cards)
- **State Management**: Track life, dungeon progress, remaining monsters, last card
- **Score Calculation**: Implement logic for both success and failure scoring
- **Reward Tiers**: Define clear tier thresholds and reward amounts
- **Item Theft**: Access run inventory and remove random items on failure
- **Energy Loss**: Calculate and apply additional energy loss on failure

## Technical Considerations

### Dependencies

- **EncounterType**: Add `scoundrel` to `EncounterType` union
- **EncounterResolver**: Extend to handle Scoundrel encounter state
- **RewardCalculator**: Use existing reward processing
- **CollectionManager**: Use existing collection tracking
- **DungeonMapGenerator**: Add Scoundrel to encounter distribution (5% chance)
- **RunStateManager**: Access inventory for item theft on failure

### Implementation Notes

- Create `ScoundrelEncounter` class similar to `RiskEventEncounter` or `HazardEncounter`
- Use abstracted card mechanics (choices/actions rather than actual cards)
- Implement dungeon as a simple room-based structure
- Track monsters as simple objects with values
- Score calculation should handle edge cases (life = 20 + health potion)
- Item theft should be random from current run inventory
- Energy loss should scale with failure severity (negative score magnitude or life deficit)

### Performance Considerations

- Encounter should complete in reasonable time (not too long)
- Dungeon size should be manageable (5-10 rooms)
- State tracking should be efficient
- Score calculation should be fast

## Success Metrics

1. **Functionality**: Scoundrel encounters successfully generate and can be completed
2. **Scoring**: Scores calculate correctly for both success and failure scenarios
3. **Rewards**: Tiered rewards are awarded correctly based on score
4. **Failure Consequences**: Items are stolen and energy is lost appropriately on failure
5. **Integration**: Encounter integrates seamlessly with existing systems
6. **Frequency**: Encounter appears at approximately 5% frequency in map generation
7. **User Experience**: Players understand the encounter mechanics and find it engaging

## Open Questions

All questions have been resolved:

1. **Life/HP System**: Fixed amount (10 HP) same for all players
2. **Scoring System**: Complex scoring based on completion method (life = 0 vs completed, with health potion bonus)
3. **Rewards Based on Score**: Tiered thresholds
4. **XP Rewards**: Tiered XP amounts
5. **Failure Consequences**: Steal items based on score (lower score = more items stolen)
6. **Energy Loss on Failure**: Based on failure severity (negative score or remaining life)
7. **Card Gameplay Mechanics**: Simplified version (abstracted)
8. **Encounter Frequency**: Rarer (5% chance)
9. **Integration**: Uses same reward processing and collection system integration
10. **Success vs Failure**: Success = life > 0 (score only affects rewards, not success/failure)
