# PRD: Dungeon Game State Persistence

## Introduction/Overview

The dungeon game currently loses all progress when users navigate away from the game screen or close the app. This creates a frustrating user experience where players must restart from the beginning every time they leave the game. The goal is to implement comprehensive state persistence that allows players to seamlessly resume their game exactly where they left off, whether navigating between screens or reopening the app.

## Goals

1. **Prevent Data Loss**: Ensure no game progress is lost during navigation between screens
2. **Enable App Restart Recovery**: Allow players to resume games after closing and reopening the app
3. **Seamless User Experience**: Provide a choice between resuming previous game or starting fresh
4. **Maintain Game Integrity**: Preserve all necessary game state data for exact game resumption
5. **Integrate with Existing Systems**: Leverage the current MMKV storage infrastructure

## User Stories

1. **As a player**, I want to navigate away from the dungeon game to check other app features, so that I can return and continue my game without losing progress.

2. **As a player**, I want to close the app during a dungeon game session, so that when I reopen it later, I can resume exactly where I left off.

3. **As a player**, I want to choose between resuming my previous game or starting fresh when I return to the dungeon game, so that I have control over my gaming experience.

4. **As a player**, I want my game achievements and statistics to persist across sessions, so that I can track my long-term progress.

5. **As a player**, I want my active item effects and their remaining duration to persist, so that I don't lose valuable buffs when navigating away.

## Functional Requirements

### Core Persistence Requirements

1. **Game State Persistence**: The system must persist the current game state ('Active', 'Win', 'Game Over') across navigation and app restarts.

2. **Level Progression**: The system must persist the current level number and level completion status.

3. **Grid State Persistence**: The system must persist which tiles have been revealed and their types (treasure, trap, exit, bonus, neutral).

4. **Turn Tracking**: The system must persist the number of turns used in the current level.

5. **Game Progress Data**: The system must persist achievement progress and game statistics (total games played, win rate, etc.).

6. **Item Effects Persistence**: The system must persist active item effects and their remaining duration timers.

### User Experience Requirements

7. **Resume Choice Prompt**: When returning to the dungeon game, the system must present users with a choice between resuming their previous game or starting a new game.

8. **Auto-Save System**: The system must implement a single auto-save slot that automatically saves game state at key checkpoints.

9. **Hybrid Auto-Save System**: The system must implement a hybrid approach that saves:
   - **Real-time during gameplay**: After every tile reveal, turn spent, and game state change
   - **Checkpoint saves**: When starting a new game, proceeding to next level, completing a level, or game over

### Technical Requirements

10. **MMKV Integration**: The system must integrate with the existing MMKV storage system used for currency and experience.

11. **Data Validation**: The system must validate saved data integrity and gracefully handle corrupted or incompatible save data.

12. **Performance**: The system must load saved game state within 2 seconds to maintain responsive user experience.

13. **Error Handling**: The system must gracefully handle storage failures and provide fallback behavior.

## Non-Goals (Out of Scope)

- **Multiple Save Slots**: This feature will not include multiple save files or save slot management.
- **Cloud Synchronization**: Data will only be stored locally on the device.
- **Cross-Device Persistence**: Game progress will not sync across different devices or accounts.
- **Real-time Auto-Save**: The system will continuously save during active gameplay to ensure no progress is lost.
- **Shop Purchase History**: Detailed shop transaction history will not be persisted (inventory items are already persisted).

## Design Considerations

### User Interface

- **Resume Prompt Modal**: A clean, non-intrusive modal that appears when returning to the dungeon game with existing save data
- **Save Status Indicator**: Subtle visual indicator showing when game state is being saved
- **Error Recovery UI**: Clear messaging if save data is corrupted or incompatible

### Data Structure

- **Save File Format**: JSON-based structure stored in MMKV with versioning for future compatibility
- **Incremental Updates**: Save only changed data to minimize storage operations
- **Compression**: Consider data compression for larger save files if needed

## Technical Considerations

### Storage Strategy

- **Integration Point**: Extend the existing `useCurrencySystem` and storage infrastructure
- **Save Frequency**: Real-time saving during gameplay + checkpoint saves for major events
- **Data Serialization**: Use JSON serialization for complex game state objects
- **Version Management**: Include version field in save data for future compatibility
- **Performance Optimization**: Leverage MMKV's fast write capabilities for real-time saves

### State Management

- **React State + Real-time Storage**: Keep active game state in React state for performance, persist to storage immediately after each change
- **Hook Integration**: Create custom hooks for save/load operations that integrate with existing game state
- **Memory Management**: Clear unnecessary data from memory after successful persistence
- **Save Triggers**: Automatically save after tile reveals, turn updates, and game state changes

### Error Handling

- **Corrupted Data Recovery**: Detect and discard invalid save data, prompt user to start fresh
- **Storage Failures**: Gracefully handle storage errors without crashing the game
- **Version Incompatibility**: Clear incompatible save data and prompt for new game

## Success Metrics

1. **Data Loss Prevention**: 100% of game progress is preserved during navigation and app restarts
2. **User Experience**: Players can successfully resume games within 2 seconds of returning to the dungeon screen
3. **System Reliability**: Save/load operations succeed 99%+ of the time
4. **Performance**: Game state loading adds less than 500ms to initial game screen load time
5. **Real-time Persistence**: Game state is saved immediately after each meaningful action (tile reveal, turn spent)

## Open Questions

1. **Save Data Size**: What is the expected size of save data, and are there any storage limits we need to consider?
2. **Save Frequency**: Real-time saving is confirmed - save immediately after each tile reveal, turn spent, and state change
3. **Data Cleanup**: How long should we retain save data for abandoned games?
4. **Testing Strategy**: How should we test persistence across app restarts and navigation scenarios?
5. **Performance Monitoring**: How do we measure and ensure real-time saves don't impact gameplay smoothness?

## Implementation Phases

### Phase 1: Basic Persistence (Must-Have)

- Core game state persistence (level, game state, grid state, turns)
- Real-time auto-save during gameplay (tile reveals, turns, state changes)
- Checkpoint saves for major events (new game, level completion, game over)
- Basic save/load functionality
- Resume choice prompt
- Integration with existing MMKV storage

### Phase 2: Enhanced Persistence (Future)

- Achievement and statistics persistence
- Item effects persistence with duration tracking
- Advanced error handling and recovery
- Performance optimizations

## Dependencies

- Existing MMKV storage infrastructure
- Current game state management in `useGameGridState` hook
- Existing currency and experience persistence systems
- React Native MMKV library

## Risk Assessment

- **Low Risk**: Basic state persistence using existing storage infrastructure
- **Medium Risk**: Complex state serialization and validation
- **High Risk**: Performance impact of large save data on game loading

## Success Criteria

The feature is considered successful when:

1. Players can navigate away from the dungeon game and return without losing progress
2. Players can close and reopen the app while maintaining game state
3. The resume/new game choice works reliably
4. No performance degradation is introduced to the game experience
5. All existing functionality continues to work as expected
