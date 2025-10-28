# Animation System Implementation Task List

## Relevant Files

- `src/components/delvers-descent/animations/encounter-interactions.tsx` - Component handling all encounter interaction animations (tile reveals, button presses, selections).
- `src/components/delvers-descent/animations/encounter-interactions.test.tsx` - Unit tests for encounter interaction animations.
- `src/components/delvers-descent/animations/energy-feedback.tsx` - Component for energy depletion animations with numerical display.
- `src/components/delvers-descent/animations/energy-feedback.test.tsx` - Unit tests for energy feedback animations.
- `src/components/delvers-descent/animations/reward-collection.tsx` - Component for sequential reward collection animations.
- `src/components/delvers-descent/animations/reward-collection.test.tsx` - Unit tests for reward collection animations.
- `src/components/delvers-descent/animations/achievement-banner.tsx` - Non-blocking achievement unlock banner component.
- `src/components/delvers-descent/animations/achievement-banner.test.tsx` - Unit tests for achievement banner.
- `src/components/delvers-descent/animations/map-navigation.tsx` - Component handling map slide/pan transitions and node animations.
- `src/components/delvers-descent/animations/map-navigation.test.tsx` - Unit tests for map navigation animations.
- `src/components/delvers-descent/animations/animation-utils.ts` - Utility functions for consistent timing, easing, and animation configurations.
- `src/components/delvers-descent/animations/animation-utils.test.ts` - Unit tests for animation utilities.
- `src/components/ui/button-animation.tsx` - Reusable button animation component for all interactive buttons.
- `src/components/ui/button-animation.test.tsx` - Unit tests for button animation component.
- `src/lib/animation-config.ts` - Centralized animation configuration (durations, easing curves, etc.).
- `src/lib/animation-config.test.ts` - Unit tests for animation configuration.

### Notes

- All animations should use React Native Reanimated 3 for performance
- Animation components should be reusable and composable
- Tests should verify animation behavior, timing, and performance
- Use `pnpm test [path]` to run tests for specific components
- Maintain consistency with existing ScreenTransition component style

## Tasks

- [ ] 1.0 Create Animation Infrastructure and Utilities
  - [ ] 1.1 Create animation configuration file with standard durations, easing curves, and constants
  - [ ] 1.2 Create animation utility functions for common patterns (timing, easing, sequencing)
  - [ ] 1.3 Create reusable ButtonAnimation component for all interactive buttons
  - [ ] 1.4 Write unit tests for animation configuration and utilities
  - [ ] 1.5 Document animation patterns and usage guidelines

- [ ] 2.0 Implement Encounter Interaction Animations
  - [ ] 2.1 Create PuzzleChamberTileAnimation component for tile reveals
  - [ ] 2.2 Create TradeOpportunityAnimations component for card selections
  - [ ] 2.3 Create RiskEventAnimations component for decision buttons
  - [ ] 2.4 Create HazardAnimations component for mitigation choices
  - [ ] 2.5 Create RestSiteAnimations component for energy recovery display
  - [ ] 2.6 Create universal EncounterInteraction wrapper component
  - [色8] 2.7 Write unit tests for all encounter animation components
  - [ ] 2.8 Integrate animations into existing encounter screens

- [ ] 3.0 Implement Energy Depletion Feedback Animations
  - [ ] 3.1 Create EnergyBarAnimation component with smooth fill/deplete animation
  - [ ] 3.2 Create NumericalEnergyDisplay component with count-up/count-down animations
  - [ ] 3.3 Create EnergyColorTransition component for energy level color changes
  - [ ] 3.4 Create LowEnergyWarning component with pulsing and glow effects
  - [ ] 3.5 Create EnergyCostPreview component for node cost previews
  - [ ] 3.6 Integrate all energy animation components into energy display
  - [ ] 3.7 Write unit tests for energy animation components
  - [ ] 3.8 Add return cost highlighting when player cannot afford communicate

- [ ] 4.0 Implement Reward Collection Animations
  - [ ] 4.1 Create SequentialRewardDisplay component for sequential reward appearance
  - [ ] 4.2 Create RewardItemAnimation component with scale, rotation, and shine effects
  - [ ] 4.3 Create CollectionFeedback component for "+1" indicators and progress updates
  - [ ] 4.4 Create RewardCollection wrapper component orchestrating all reward animations
  - [ ] 4.5 Write unit tests for reward collection animation components
  - [ ] 4.6 Integrate reward animations into encounter reward flows

- [ ] 5.0 Implement Achievement Unlock Banner Animations
  - [ ] 5.1 Create AchievementBanner component with slide-down animation
  - [ ] 5.2 Create AchievementIconAnimation component with rotation effect
  - [ ] 5.3 Create MultipleAchievementHandler component for stacked banners
  - [ ] 5.4 Add auto-dismiss functionality after 4-second display
  - [ ] 5.5 Write unit tests for achievement banner components
  - [ ] 5.6 Integrate achievement banners into achievement unlock triggers

- [ ] 6.0 Implement Map Navigation Animations
  - [ ] 6.1 Create MapSlideTransition component for depth level transitions
  - [ ] 6.2 Create NodeAppearanceAnimation component for fade-in and scale effects
  - [ ] 6.3 Create PathVisualizationAnimation component for draw-on effect
  - [ ] 6.4 Create VisitedNodeIndicator component with checkmark animation
  - [ ] 6.5 Create AvailablePathPulse component for path highlighting
  - [ ] 6.6 Create ReturnJourneyVisualization component with distinct styling
  - [ ] 6.7 Write unit tests for map navigation animation components
  - [ ] 6.8 Integrate map animations into existing map components

- [ ] 7.0 Integration Testing and Performance Optimization
  - [ ] 7.1 Create integration tests for animation system with all game systems
  - [ ] 7.2 Test animation performance on iPhone 13+ devices
  - [ ] 7.3 Verify 60fps frame rate targets are met
  - [ ] 7.4 Test animation cleanup and memory management
  - [ ] 7.5 Test animation consistency across all screens and interactions
  - [ ] 7.6 Test animation behavior during app backgrounding/resuming
  - [ ] 7.7 Verify animations work correctly with ScreenTransition component
  - [ ] 7.8 Document animation performance benchmarks and optimizations
