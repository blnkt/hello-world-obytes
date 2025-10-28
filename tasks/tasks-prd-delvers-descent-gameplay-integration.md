# Task List: Delver's Descent Gameplay Integration

Based on: `tasks/prd-delvers-descent-gameplay-integration.md`

## Relevant Files

### Run Management

- `src/app/(app)/run-queue.tsx` - Run queue screen displaying queued runs from HealthKit
- `src/components/delvers-descent/run-queue/run-queue-screen.tsx` - Main run queue list component
- `src/components/delvers-descent/run-queue/run-card.tsx` - Individual run card UI
- `src/components/delvers-descent/run-queue/__tests__/run-card.test.tsx` - Tests for run card
- `src/app/(app)/active-run.tsx` - Active run screen managing gameplay session

### Interactive Map

- `src/app/(app)/active-run.tsx` - Active run screen with interactive map
- `src/components/delvers-descent/active-run/interactive-dungeon-map.tsx` - Interactive map component
- `src/components/delvers-descent/active-run/run-status-panel.tsx` - Energy, return cost, safety margin display
- `src/components/delvers-descent/active-run/navigation-controls.tsx` - Continue/cash out buttons

### Encounter Integration

- `src/lib/delvers-descent/encounter-router.ts` - Routes encounters to correct screens
- `src/components/delvers-descent/active-run/encounter-handler.tsx` - Handles encounter transitions

### Decision-Making UI

- `src/components/delvers-descent/active-run/cash-out-modal.tsx` - Cash out confirmation
- `src/components/delvers-descent/active-run/risk-warning-modal.tsx` - Risk warnings (may already exist)
- `src/app/(app)/bust-screen.tsx` - Bust screen with consequences

### Progression

- `src/app/(app)/collections.tsx` - Collections screen
- `src/app/(app)/achievements.tsx` - Achievements screen
- `src/app/(app)/run-history.tsx` - Run history screen

### App Integration

- `src/app/(app)/index.tsx` - Update home screen with Delver's Descent card
- `src/app/(app)/_layout.tsx` - Add navigation tabs for Delver's Descent
- `src/components/home/delvers-descent-card.tsx` - Home screen card for Delver's Descent

## Tasks

- [ ] 1.0 Run Management System
  - [x] 1.1 Create run queue screen (`src/app/(app)/run-queue.tsx`)
  - [x] 1.2 Create run card component with date, steps, energy display
  - [x] 1.3 Implement run queue logic to fetch and display queued runs
  - [x] 1.4 Add "Start Run" button functionality to initialize active run
  - [x] 1.5 Implement active run state management and tracking
  - [x] 1.6 Add run status labels (queued, active, completed, busted)
  - [ ] 1.7 Create tests for run queue screen and components
  - [ ] 1.8 Add loading states and error handling

- [ ] 2.0 Interactive Map Experience
  - [ ] 2.1 Create active run screen layout and structure
  - [ ] 2.2 Make dungeon map nodes touch-interactive (tap to select)
  - [ ] 2.3 Implement node state management (current, visited, available, unrevealed)
  - [ ] 2.4 Add visual state indication for different node types
  - [ ] 2.5 Create run status panel component (energy, return cost, safety margin)
  - [ ] 2.6 Implement safety margin indicator (green/yellow/red)
  - [ ] 2.7 Add depth progression display
  - [ ] 2.8 Create navigation controls (Continue vs Cash Out buttons)
  - [ ] 2.9 Add smooth transitions between map states
  - [ ] 2.10 Create tests for interactive map functionality

- [ ] 3.0 Encounter Flow Integration
  - [ ] 3.1 Create encounter router to route node types to encounter screens
  - [ ] 3.2 Implement node click handler to trigger encounter transitions
  - [ ] 3.3 Integrate existing encounter screens with active run
  - [ ] 3.4 Implement encounter state management (progress, completion, outcomes)
  - [ ] 3.5 Add "Return to Map" button to all encounter screens
  - [ ] 3.6 Handle encounter outcomes (rewards, items, energy used)
  - [ ] 3.7 Update run state after encounter completion
  - [ ] 3.8 Implement failure handling and consequences
  - [ ] 3.9 Create tests for encounter flow integration

- [ ] 4.0 Decision-Making UI
  - [ ] 4.1 Create cash out button with confirmation modal
  - [ ] 4.2 Implement cash out confirmation with reward summary
  - [ ] 4.3 Create continue button with conditional risk warning
  - [ ] 4.4 Implement risk warning modal for dangerous energy levels
  - [ ] 4.5 Add safety margin display to decision-making UI
  - [ ] 4.6 Create bust screen component
  - [ ] 4.7 Implement bust handling (XP preserved, items lost)
  - [ ] 4.8 Add return to run queue from bust screen
  - [ ] 4.9 Create tests for decision-making UI

- [ ] 5.0 Progression & Collections
  - [ ] 5.1 Create collections screen integrating CollectionOverview component
  - [ ] 5.2 Add completed sets and active bonuses display
  - [ ] 5.3 Create achievements screen integrating AchievementList component
  - [ ] 5.4 Display achievement progress and unlocked achievements
  - [ ] 5.5 Create run history screen
  - [ ] 5.6 Display completed runs with depth reached and rewards
  - [ ] 5.7 Display busted runs with failure reasons
  - [ ] 5.8 Add navigation between progression screens

- [ ] 6.0 App Integration & Navigation
  - [ ] 6.1 Create Delver's Descent home card component
  - [ ] 6.2 Add Delver's Descent card to home screen with quick stats
  - [ ] 6.3 Update tab navigation to include Delver's Descent screens
  - [ ] 6.4 Integrate HealthKit data for run queue generation
  - [ ] 6.5 Add character display to dungeon screens (level, name, XP)
  - [ ] 6.6 Implement smooth navigation transitions
  - [ ] 6.7 Add loading states for data fetching
  - [ ] 6.8 Ensure backward compatibility with existing functionality
  - [ ] 6.9 Create integration tests for full gameplay loop
