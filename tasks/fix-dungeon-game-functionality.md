# Fix Dungeon Game Functionality - Task List

## Overview

The migration to GameStateProvider has broken several core dungeon game features that were previously working. This task list systematically addresses the missing functionality to restore a fully playable game experience.

## Critical Issues Identified

1. **Turn Management System** - Completely broken (no turn counting, no game over)
2. **Game State Transitions** - Partially broken (win/lose conditions don't work properly)
3. **Tile Effects System** - Partially broken (trap/treasure effects don't manage turns)
4. **Currency Integration** - Partially broken (no turn validation, no minimum playability check)
5. **Level Progression** - Completely missing (stuck at level 1)

## Relevant Files

- `src/components/dungeon-game/providers/game-state-provider.tsx` - Core state management that needs turn logic fixes
- `src/components/dungeon-game/game-grid.tsx` - Tile interaction logic that needs turn management
- `src/components/dungeon-game/dungeon-game.tsx` - Main game component that needs level progression
- `src/components/dungeon-game/utils/game-utils.tsx` - Game utilities that may need updates
- `src/types/dungeon-game.ts` - Type definitions that may need updates for turn management

## Tasks

### 1.0 Fix Turn Management System

- [ ] 1.1 Add turn counting logic to GameStateProvider
- [ ] 1.2 Implement turn validation before tile reveal
- [ ] 1.3 Add game over trigger when out of turns
- [ ] 1.4 Fix turn display in game header
- [ ] 1.5 Add turn cost enforcement (100 currency per turn)

### 2.0 Restore Game State Transitions

- [ ] 2.1 Fix win condition logic (exit tile revealed)
- [ ] 2.2 Fix game over condition (no turns remaining)
- [ ] 2.3 Implement proper state transitions between Active/Win/Game Over
- [ ] 2.4 Add state validation to prevent invalid transitions
- [ ] 2.5 Fix game over modal display

### 3.0 Fix Tile Effects System

- [ ] 3.1 Implement trap tile effect (lose 1 additional turn)
- [ ] 3.2 Implement treasure tile effect (gain 1 free turn)
- [ ] 3.3 Fix bonus reveal tile effect (auto-reveal with turn management)
- [ ] 3.4 Add proper turn cost for bonus reveals
- [ ] 3.5 Ensure tile effects don't break turn counting

### 4.0 Fix Currency Integration

- [ ] 4.1 Add minimum playability check (100 steps minimum)
- [ ] 4.2 Implement turn validation before game start
- [ ] 4.3 Fix currency display to show accurate available turns
- [ ] 4.4 Add currency validation in tile interactions
- [ ] 4.5 Prevent game start with insufficient currency

### 5.0 Implement Level Progression

- [ ] 5.1 Add level increment logic in completeLevel function
- [ ] 5.2 Implement next level button functionality
- [ ] 5.3 Add difficulty scaling for higher levels
- [ ] 5.4 Reset game state properly for new levels
- [ ] 5.5 Update level display and progression tracking

### 6.0 Testing and Validation

- [ ] 6.1 Test turn management with various scenarios
- [ ] 6.2 Validate game state transitions work correctly
- [ ] 6.3 Test tile effects with proper turn counting
- [ ] 6.4 Verify currency integration and validation
- [ ] 6.5 Test level progression and difficulty scaling
- [ ] 6.6 Ensure all existing tests still pass

## Implementation Notes

### Turn Management Priority

The turn management system is the **highest priority** as it blocks all other gameplay. Without working turns, the game is unplayable.

### State Management Approach

- Keep turn counting in GameStateProvider
- Validate turns before any tile interaction
- Trigger game over immediately when turns run out
- Ensure tile effects properly modify turn count

### Testing Strategy

- Test each fix individually before moving to next
- Verify existing functionality isn't broken
- Add new tests for restored features
- Test edge cases (0 turns, negative currency, etc.)

## Success Criteria

The dungeon game is considered fixed when:

1. **Turns are properly counted** and displayed
2. **Game over triggers** when out of turns
3. **Win conditions work** when exit tile is found
4. **Tile effects function** with proper turn management
5. **Currency validation** prevents invalid gameplay
6. **Level progression** allows advancing through multiple levels
7. **All existing tests pass** without regression

## Risk Assessment

- **Low Risk**: Fixing turn counting and display
- **Medium Risk**: Restoring tile effects with turn management
- **Medium Risk**: Implementing level progression
- **High Risk**: Ensuring no regression in existing functionality

## Next Steps

1. Start with Task 1.0 (Turn Management) as it's blocking everything else
2. Test each fix thoroughly before proceeding
3. Maintain existing test coverage
4. Document any breaking changes or new behavior
