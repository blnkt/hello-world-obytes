# PRD: Delver's Descent Gameplay Loop Integration

## Introduction/Overview

This PRD addresses the critical gap between our extensive Phase 1-5 development (backend systems, data models, encounter logic) and the actual playable user experience. We have all the game logic but need to build the UI/UX that connects players to this gameplay loop.

**Problem Solved:** Players have no way to start a run, manage their run queue, navigate the dungeon map interactively, trigger encounters, make cash out decisions, or view their collections and achievements. The extensive backend work from Phases 1-5 exists in isolation without user-facing interfaces.

**Goal:** Create a complete, integrated gameplay experience where players can start runs, navigate spatially, engage with encounters, manage risk/reward decisions, and track progression seamlessly within the existing app structure.

## Goals

1. **Run Management System**: UI for viewing queued runs, starting new runs, and tracking active runs
2. **Spatial Navigation Experience**: Interactive dungeon map with node selection, depth progression, and encounter triggering
3. **Encounter Flow Integration**: Seamless transitions from map nodes to encounter screens and back
4. **Decision-Making Interface**: Clear UI for cash out vs. continue decisions with risk warnings
5. **Progression Dashboard**: Collection tracking, achievement display, and run history
6. **App Integration**: Seamless integration with existing Home screen, navigation, and HealthKit data

## User Stories

1. **As a player**, I want to see my queued runs from my daily step data so I can play runs corresponding to my real-world activity.
2. **As a player**, I want to start a new run from my run queue so I can explore the dungeon with that day's energy.
3. **As a player**, I want to see an interactive dungeon map so I can choose which nodes to explore.
4. **As a player**, I want to click on nodes to trigger encounters so I can engage with different encounter types.
5. **As a player**, I want to complete encounters and return to the map so I can continue my exploration.
6. **As a player**, I want to see my current energy and return cost so I can decide when to cash out.
7. **As a player**, I want to tap a "Cash Out" button when I'm ready so I can safely exit with my collected rewards.
8. **As a player**, I want to see risk warnings when I'm low on energy so I can make informed decisions.
9. **As a player**, I want to view my collected items and sets so I can see my collection progress.
10. **As a player**, I want to see my achievements so I can track my progression milestones.

## Functional Requirements

### Run Management System

- [ ] **Run Queue Screen**: Display list of queued runs from HealthKit daily step data
- [ ] **Run Card UI**: Show run date, step count, energy amount, streak bonuses
- [ ] **Start Run Button**: Allow player to start a queued run, creating an active run session
- [ ] **Active Run Indicator**: Show which run is currently active (if any)
- [ ] **Run History**: Track completed, busted, and abandoned runs
- [ ] **Run Status Labels**: Clear labels for queued, active, completed, busted states

### Spatial Navigation Experience

- [ ] **Interactive Dungeon Map Screen**: Full-screen map with touch-interactive nodes
- [ ] **Node Selection**: Tap nodes to trigger encounters (only available/revealed nodes)
- [ ] **Visual State Indication**: Clear visual distinction between current, visited, available, and unrevealed nodes
- [ ] **Depth Progression Display**: Visual representation of current depth and depth hierarchy
- [ ] **Energy Display**: Prominent display of current energy remaining
- [ ] **Return Cost Display**: Clear indication of cost to return to surface
- [ ] **Safety Margin Indicator**: Visual warning (green/yellow/red) based on energy vs return cost
- [ ] **Navigation Controls**: Continue deeper vs. Return to surface options

### Encounter Flow Integration

- [ ] **Encounter Trigger**: Click node → transition to appropriate encounter screen
- [ ] **Encounter Type Routing**: Route to correct encounter screen based on node type
  - Puzzle Chamber → puzzle_chamber-screen
  - Trade Opportunity → trade-opportunity-screen
  - Discovery Site → discovery-site-screen
  - Risk Event → risk-event-screen
  - Hazard → hazard-screen
  - Rest Site → rest-site-screen
- [ ] **Encounter Progress**: State management for encounter completion, rewards, failures
- [ ] **Return to Map**: Button to return to map after encounter completion
- [ ] **Encounter Outcomes**: Display rewards, items gained, energy used
- [ ] **Failure Handling**: Show failure consequences and continue/retry options

### Decision-Making Interface

- [ ] **Cash Out Button**: Prominent button to cash out with current rewards
- [ ] **Continue Button**: Button to proceed deeper (with or without risk warning)
- [ ] **Risk Warning Modal**: Popup warning when energy is dangerously low
  - Show current energy vs return cost
  - Display safety margin
  - Confirm intent to continue
- [ ] **Cash Out Confirmation**: Modal showing reward summary before cashing out
- [ ] **Bust Screen**: Screen displayed when player runs out of energy
  - Show that XP is preserved
  - Show items lost
  - Return to run queue option

### Progression Dashboard

- [ ] **Collections Tab/Screen**: View collection sets, progress, and bonuses
  - Integration with existing CollectionOverview component
  - Show completed sets with active bonuses
  - Display missing items
- [ ] **Achievements Tab/Screen**: View achievement progress
  - Integration with existing AchievementList component
  - Show unlocked achievements
  - Progress bars for in-progress achievements
- [ ] **Run History Screen**: View past runs
  - Completed runs with final depth reached
  - Busted runs with failure reason
  - Rewards earned per run

### App Integration

- [ ] **Home Screen Integration**: Add "Start Delver's Descent" card to home screen
  - Show next available run
  - Quick stats (total runs, best depth, sets completed)
  - Link to run queue
- [ ] **Navigation Updates**: Add Delver's Descent to main tab navigation
  - New tab or integrate into existing structure
- [ ] **HealthKit Integration**: Pull daily step data for run queue generation
- [ ] **Character Integration**: Display character level, name, XP on dungeon screens

## Non-Goals (Out of Scope)

- New encounter types (already implemented)
- Additional collection sets (already implemented)
- New achievement types (already implemented)
- Tutorial/onboarding flow (future phase)
- Advanced analytics/reporting (future phase)
- Social features (future phase)

## Technical Considerations

**Integration Points:**

- RunQueueManager (Phase 1) → Run queue UI
- DungeonMapGenerator (Phase 1) → Interactive map
- EncounterResolver (Phase 2) → Encounter flow
- Push-your-luck mechanics (Phase 3) → Decision UI
- CollectionManager (Phase 4) → Collections screen
- AchievementManager (Phase 5) → Achievements screen
- Existing Home/Character screens → App integration

**Performance:**

- Map rendering should maintain 60 FPS
- Encounter transitions should be <200ms
- Run queue load should be <500ms

**Data Flow:**

- Home screen → Check for queued runs
- Run Queue → Select run → Start run → Generate map
- Active Run → Navigate map → Trigger encounter → Complete encounter → Return to map
- Active Run → Cash out/Bust → Return to queue/home
- Collections/Achievements → View persistent data

## Success Metrics

1. **Usability**: Player can complete full gameplay loop (start run → explore → cash out) in <5 minutes
2. **Clarity**: 90%+ of players understand how to start runs and navigate map
3. **Engagement**: Players complete >80% of started runs
4. **Integration**: Seamless transitions between all screens (<200ms transitions)
5. **Error Rate**: <5% of users encounter errors during normal play

## Open Questions

1. **Tab Structure**: Should Delver's Descent be its own tab or integrated into existing structure?
2. **Run Queue Limit**: How many runs should be displayed at once?
3. **Map Display Mode**: Full-screen immersive or panel-based?
4. **Encounter Skipping**: Can players skip encounters or must they complete them?
5. **Mobile Optimization**: How to handle small screen sizes for complex maps?
6. **Loading States**: What loading indicators needed for map generation, encounter loading?

## Implementation Notes

- Start with run queue UI and run start flow (highest priority)
- Build interactive map next (core gameplay)
- Integrate encounter screens one by one
- Add decision-making UI after map is working
- Integrate collections and achievements at the end
- Test each integration point thoroughly before moving to next
- Maintain existing app functionality throughout integration
