# PRD: Dungeon Game Feature

## Introduction/Overview

The Dungeon Game is a grid-based puzzle game where players navigate through a 6x5 grid of hidden tiles, revealing them one by one to find the exit while avoiding traps and collecting treasures. Each tile reveal costs 1 turn, and players must strategically manage their turn count to reach the exit before running out of turns.

**Problem Solved:** Provides an engaging, turn-based puzzle experience that challenges players' strategic thinking and risk assessment.

**Goal:** Create an interactive dungeon exploration game with clear win/lose conditions, engaging tile mechanics, and smooth user experience.

## Goals

1. **Core Gameplay**: Implement a fully functional 6x5 grid-based dungeon game with turn management
2. **Tile System**: Create five distinct tile types (exit, trap, treasure, bonus reveal, neutral) with unique behaviors
3. **Game States**: Support active gameplay, win state, and game over state within a single screen
4. **User Experience**: Provide clear visual feedback, intuitive controls, and smooth state transitions
5. **Level Progression**: Support multiple dungeon levels with increasing difficulty

## User Stories

1. **As a player**, I want to see how many turns I have left so I can plan my strategy accordingly.
2. **As a player**, I want to click on tiles to reveal them so I can explore the dungeon and find the exit.
3. **As a player**, I want to see immediate feedback when I reveal a trap so I know I've lost a turn.
4. **As a player**, I want to see immediate feedback when I reveal a treasure so I know I've gained a free turn.
5. **As a player**, I want to see the bonus reveal tile automatically reveal adjacent tiles so I can discover more of the dungeon efficiently.
6. **As a player**, I want to see a win modal when I find the exit so I can choose to continue to the next level or return to the main menu.
7. **As a player**, I want to see a game over modal when I run out of turns so I can return to the main menu and try again.
8. **As a player**, I want to see the current level number so I can track my progress through the dungeon.

## Functional Requirements

1. **Grid System**: The system must display a 6x5 grid of tiles (30 total tiles).
2. **Tile Types**: The system must support five tile types:
   - 1 exit tile (yellow with exit icon)
   - 4 trap tiles (red with skull icon)
   - 4 treasure tiles (teal with star icon)
   - 4 bonus reveal tiles (purple with target/eye icon)
   - 17 neutral tiles (no icon, no effect)
3. **Random Distribution**: The system must randomly distribute all tiles across the grid for each new level.
4. **Tile States**: Each tile must have two visual states: face-down (hidden) and face-up (revealed).
5. **Tile Interaction**: The system must allow players to click on face-down tiles to reveal them.
6. **Turn Management**: The system must deduct 1 turn for each tile reveal and display remaining turns.
7. **Trap Effect**: When a trap tile is revealed, the system must deduct 1 additional turn and display "Trap! Lose 1 turn".
8. **Treasure Effect**: When a treasure tile is revealed, the system must add 1 free turn and display "Treasure! Gain 1 turn".
9. **Bonus Reveal Effect**: When a bonus reveal tile is revealed, the system must automatically reveal one random orthogonally adjacent tile and immediately resolve its effects.
10. **Exit Win Condition**: When the exit tile is revealed, the system must display a win modal with options to continue to next level or return to main menu.
11. **Game Over Condition**: When turns reach 0, the system must display a game over modal and disable grid interaction.
12. **Level Display**: The system must display the current level number prominently on the screen.
13. **Navigation**: The system must provide a home button to return to the main menu.
14. **State Management**: The system must manage game state transitions (active → win → next level, active → game over → main menu).

## Non-Goals (Out of Scope)

1. **Complex Animations**: Tile reveal animations beyond instant state changes
2. **Sound Effects**: Audio feedback for tile reveals or game events
3. **Save/Load**: Persistence of game progress between sessions
4. **Difficulty Balancing**: Advanced algorithms to ensure balanced tile distribution
5. **Multiplayer**: Support for multiple players or competitive gameplay
6. **Custom Grid Sizes**: Configurable grid dimensions beyond 6x5
7. **Tile Customization**: Player-created or modified tile types
8. **Statistics Tracking**: Detailed analytics of player performance

## Design Considerations

**UI Components:**

- Use existing `Text`, `Button`, and `Modal` components from the UI library
- Create new `GameGrid` and `GridTile` components for the core game mechanics
- Implement `StatusBar` and `StatusMessage` components for game state display
- Design tile icons that are clear and visually distinct

**Visual Design:**

- Follow the existing design system with muted earth tones and subtle textures
- Ensure sufficient contrast between tile types for accessibility
- Use consistent spacing and typography from existing components
- Implement clear visual feedback for different tile states

**Layout:**

- Center the game grid on screen with appropriate margins
- Position status information above the grid
- Place action buttons below the grid
- Use modal overlays for win/game over states

## Technical Considerations

**Component Architecture:**

- `DungeonGameScreen` as the main container managing game state
- `GameGrid` as a controlled component receiving tile data and click handlers
- `GridTile` as a presentational component with props for type, state, and click handler
- Custom hooks for game logic (turn management, tile effects, win conditions)

**State Management:**

- Use React state for game state (turns, revealed tiles, current level)
- Implement game logic functions for tile effects and win conditions
- Handle game state transitions through conditional rendering

**Performance:**

- Optimize grid rendering for smooth interactions
- Minimize re-renders by using appropriate React patterns
- Consider memoization for grid tiles if performance becomes an issue

**Icon System:**

- Extend the existing icon library with new tile-specific icons
- Ensure icons are scalable and maintain clarity at different sizes
- Use consistent icon styling that matches the existing design system

## Success Metrics

1. **Functionality**: All tile types work correctly with proper effects
2. **User Experience**: Players can complete a full game session without confusion
3. **Performance**: Grid interactions respond within 100ms
4. **Accessibility**: Game state and tile information are clear to all users
5. **Code Quality**: Components are reusable and follow existing patterns

## Open Questions

1. **Level Progression**: Should the next level increase in difficulty (more traps, fewer treasures)?
2. **Tile Distribution**: Are there any constraints on where the exit tile can be placed?
3. **Bonus Reveal Logic**: What happens if a bonus reveal tile has no unrevealed adjacent tiles?
4. **Game Balance**: Should the initial turn count scale with level number?
5. **Error Handling**: How should the system handle edge cases like invalid tile states?

## Implementation Notes

- Start with a single level implementation before adding level progression
- Use TDD approach with comprehensive test coverage for game logic
- Ensure all components are properly typed with TypeScript
- Follow existing project patterns for component structure and styling
- Integrate with existing navigation and routing systems
