# Task List: Dungeon Game Feature Implementation

## Relevant Files

- `src/app/(app)/dungeon-game.tsx` - Main dungeon game screen component that manages game state and renders the game interface. ✅ **CREATED**
- `src/app/(app)/dungeon-game.test.tsx` - Unit tests for the main dungeon game component. ✅ **CREATED**
- `src/components/dungeon-game/game-grid.tsx` - Grid component that renders the 6x5 tile layout and handles tile interactions. ✅ **CREATED**
- `src/components/dungeon-game/game-grid.test.tsx` - Unit tests for the game grid component. ✅ **CREATED**
- `src/components/dungeon-game/grid-tile.tsx` - Individual tile component that displays tile states and handles click events. ✅ **CREATED**
- `src/components/dungeon-game/grid-tile.test.tsx` - Unit tests for the grid tile component. ✅ **CREATED**
- `src/components/dungeon-game/currency-display.tsx` - Component that shows current currency and available turns.
- `src/components/dungeon-game/currency-display.test.tsx` - Unit tests for the currency display component.
- `src/components/dungeon-game/status-bar.tsx` - Component that displays game status, level, and turn information.
- `src/components/dungeon-game/status-bar.test.tsx` - Unit tests for the status bar component.
- `src/components/dungeon-game/game-modals.tsx` - Win and game over modal components.
- `src/components/dungeon-game/game-modals.test.tsx` - Unit tests for the game modals.
- `src/lib/dungeon-game/game-logic.ts` - Core game logic functions for tile effects, win conditions, and turn management.
- `src/lib/dungeon-game/game-logic.test.ts` - Unit tests for the game logic functions.
- `src/lib/dungeon-game/types.ts` - TypeScript type definitions for game entities and state.
- `src/components/ui/icons/` - New tile-specific icons (exit, skull, star, target/eye) to extend the existing icon library.

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `pnpm test [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [x] 1.0 Core Game Infrastructure

  - [x] 1.1 Create main dungeon game screen component with basic navigation
  - [x] 1.2 Set up game state management (level, turns, revealed tiles, game state)
  - [x] 1.3 Implement basic routing and navigation integration
  - [x] 1.4 Add home button and return to main menu functionality
  - [x] 1.5 Set up basic game state transitions (active, win, game over)

- [ ] 2.0 Grid System and Tile Components

  - [x] 2.1 Create GameGrid component with 6x5 grid layout
  - [x] 2.2 Implement GridTile component with face-down and face-up states
  - [x] 2.3 Add tile click handling and reveal functionality
  - [x] 2.4 Implement tile type display (exit, trap, treasure, bonus reveal, neutral)
  - [x] 2.5 Add visual styling and tile state transitions
  - [x] 2.6 Implement random tile distribution algorithm for level generation

- [ ] 3.0 Game Logic and Mechanics

  - [x] 3.1 Implement turn management system (deduct turns on tile reveal)
  - [x] 3.2 Add trap tile effect (lose 1 additional turn)
  - [x] 3.3 Add treasure tile effect (gain 1 free turn)
  - [x] 3.4 Implement bonus reveal tile effect (auto-reveal adjacent tiles)
  - [x] 3.5 Add win condition logic (exit tile revealed)
  - [ ] 3.6 Implement game over condition (no turns remaining)

  - [ ] 3.7 Add level progression system and difficulty scaling

- [ ] 4.0 Currency Integration

  - [ ] 4.1 Integrate with useCurrencySystem() hook for real-time currency data
  - [ ] 4.2 Implement turn calculation: Math.floor(currentCurrency / 100)
  - [ ] 4.3 Add real-time currency updates as turns are spent
  - [ ] 4.4 Implement minimum playability check (100 steps minimum)

  - [ ] 4.5 Add currency display showing current balance and turn cost
  - [ ] 4.6 Implement economic feedback and turn cost indicators

- [ ] 5.0 User Interface and Experience

  - [ ] 5.1 Create StatusBar component for game information display
  - [ ] 5.2 Implement CurrencyDisplay component with turn count and currency
  - [ ] 5.3 Add win modal with next level and main menu options
  - [ ] 5.4 Implement game over modal with return to main menu option
  - [ ] 5.5 Add visual feedback for tile effects (trap, treasure, bonus reveal)
  - [ ] 5.6 Implement smooth state transitions and loading states
  - [ ] 5.7 Add accessibility features and clear visual feedback

- [ ] 6.0 Testing and Quality Assurance
  - [ ] 6.1 Write comprehensive unit tests for all game logic functions
  - [ ] 6.2 Test grid component rendering and tile interactions
  - [ ] 6.3 Verify currency integration and real-time updates
  - [ ] 6.4 Test game state transitions and win/lose conditions
  - [ ] 6.5 Validate tile distribution randomness and game balance
  - [ ] 6.6 Test edge cases and error handling
  - [ ] 6.7 Ensure performance meets 100ms interaction requirement
