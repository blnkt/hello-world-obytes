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
- [ ] 2.0 Implement Encounter Interaction Animations
- [ ] 3.0 Implement Energy Depletion Feedback Animations
- [ ] 4.0 Implement Reward Collection Animations
- [ ] 5.0 Implement Achievement Unlock Banner Animations
- [ ] 6.0 Implement Map Navigation Animations
- [ ] 7.0 Integration Testing and Performance Optimization
