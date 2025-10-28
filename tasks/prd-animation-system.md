# PRD: Delver's Descent - Comprehensive Animation System

## Introduction/Overview

This feature implements a comprehensive animation system for Delver's Descent to provide visual polish and functional feedback throughout the player experience. The animation system enhances user understanding of game state, provides satisfying visual feedback for player actions, and creates a cohesive, polished feel across all game screens and interactions.

**Problem Solved:** The current game has basic screen transitions but lacks animations for encounters, energy management, rewards, achievements, and map navigation. This makes the game feel static and reduces player understanding of feedback mechanisms.

**Goal:** Implement a complete animation system that provides visual feedback for all major game interactions while maintaining performance and visual consistency.

## Goals

1. **Enhance Player Feedback:** Provide clear visual feedback for all player actions and game state changes
2. **Visual Polish:** Create smooth, engaging animations that make the game feel premium and polished
3. **Consistency:** Ensure all animations follow consistent timing, easing, and visual style
4. **Performance:** Maintain 60fps performance on target devices (iPhone 13+)
5. **Functional Clarity:** Use animations to help players understand game mechanics and make informed decisions
6. **Seamless Transitions:** Provide smooth navigation between all game screens and states

## User Stories

1. **As a player**, I want to see smooth animations when revealing tiles in Puzzle Chamber encounters so I feel engaged with the puzzle-solving process.
2. **As a player**, I want visual feedback when I make decisions in encounters (Trade, Risk Events, Hazards) so I know my actions are being registered.
3. **As a player**, I want to see animated energy depletion so I can monitor my remaining energy and make informed decisions about whether to continue or cash out.
4. **As a player**, I want to see rewards appear sequentially when collecting items so I can appreciate each individual reward.
5. **As a player**, I want achievement unlocks to appear as non-blocking notifications so I don't lose my place in the game flow.
6. **As a player**, I want smooth slide/pan transitions when moving between depth levels on the map so the navigation feels natural.
7. **As a player**, I want all animations to feel consistent in speed and style so the game feels cohesive and polished.
8. **As a player**, I want clear numerical displays alongside energy animations so I can make strategic decisions based on exact energy values.

## Functional Requirements

### 1. Encounter Interaction Animations

#### 1.1 Puzzle Chamber Tile Animations

- **FR-1.1.1:** When a tile is revealed, it should smoothly scale up (1.0 → 1.15 → 1.0) over 200ms
- **FR-1.1.2:** Tiles should fade in smoothly (opacity 0 → 1) over 200ms when revealed
- **FR-1.1.3:** Tile reveals should trigger sequentially with a 50ms delay between tiles for multiple reveals
- **FR-1.1.4:** The exit tile should have a special pulsing glow animation to indicate importance

#### 1.2 Trade Opportunity Animations

- **FR-1.2.1:** Trade option cards should scale up (1.0 → 1.05 → 1.0) on press for 150ms
- **FR-1.2.2:** Selected trade cards should maintain a slight elevation (transform: translateY(-2px)) to show selection
- **FR-1.2.3:** Trade confirmation buttons should bounce (scale 0.95 → 1.05 → 1.0) when pressed
- **FR-1.2.4:** Currency values should animate with a smooth count-up effect when displayed

#### 1.3 Risk Event Decision Animations

- **FR-1.3.1:** Risk decision buttons should scale down (1.0 → 0.95) on press for 100ms, then back to 1.0
- **FR-1.3.2:** Risk decision buttons should have a subtle border glow animation when hovered/focused
- **FR-1.3.3:** The risk meter/indicator should animate smoothly when risk level changes
- **FR-1.3.4:** Success/failure outcomes should have distinct animation styles (bounce for success, shake for failure)

#### 1.4 Hazard Mitigation Animations

- **FR-1.4.1:** Hazard mitigation buttons should pulse with urgency (opacity 0.7 → 1.0 → 0.7) in a 1s loop
- **FR-1.4.2:** Selected mitigation option should smoothly transition to a "chosen" state with color change
- **FR-1.4.3:** Successful mitigation should trigger a positive bounce animation (scale 1 → 1.2 → 1)

#### 1.5 Rest Site Energy Display

- **FR-1.5.1:** Energy recovery should animate with a smooth fill-up effect in the energy bar
- **FR-1.5.2:** Recovered energy amount should count up numerically alongside the bar animation
- **FR-1.5.3:** The energy bar should have a subtle glow effect when energy is being recovered

#### 1.6 Universal Button Animations

- **FR-1.6.1:** All interactive buttons should have a standard press animation (scale 0.98 → 1.0) over 100ms
- **FR-1.6.2:** Disabled buttons should have a subtle pulsing effect (opacity 0.5 → 0.7 → 0.5) to indicate interactivity when enabled
- **FR-1.6.3:** Success buttons should have a green glow animation when pressed
- **FR-1.6.4:** Cancel/danger buttons should have a red glow animation when pressed

### 2. Energy Depletion Visual Feedback

#### 2.1 Energy Bar Animations

- **FR-2.1.1:** The energy bar should smoothly animate when energy decreases (fill from right to left)
- **FR-2.1.2:** Energy depletion should use a smooth easing curve (ease-out-cubic) for natural deceleration
- **FR-2.1.3:** The energy bar should change color based on energy level:
  - Green: >50% energy remaining
  - Yellow: 20-50% energy remaining
  - Orange: 10-20% energy remaining
  - Red: <10% energy remaining
- **FR-2.1.4:** Color transitions should be smooth, not abrupt

#### 2.2 Numerical Energy Display

- **FR-2.2.1:** Current energy should display as a large, prominent number alongside the energy bar
- **FR-2.2.2:** Energy changes should count down/up smoothly (e.g., 150 → 145 dunking 200ms)
- **FR-2.2.3:** When energy drops below 20%, the numerical display should pulse red gently
- **FR-2.2.4:** The return cost should display prominently as "Return: X energy" near the energy display
- **FR-2.2.5:** Return cost should highlight in red when player doesn't have enough energy to return

#### 2.3 Low Energy Warnings

- **FR-2.3.1:** When energy drops below 10%, the entire energy display should pulse gently (scale 1.0 → 1.05 → 1.0) every 1 second
- **FR-2.3.2:** The energy bar should have a warning glow effect when energy is low
- **FR-2.3.3:** Warning animations should intensify as energy approaches zero

#### 2.4 Energy Cost Display

- **FR-2.4.1:** When Neuron a node, the node cost should display as a preview animation
- **FR-2.4.2:** Energy depletion should show exactly how much energy will be spent before confirming
- **FR-2.4.3:** After energy is spent, show a brief "-X energy" text animation that fades out

### 3. Reward Collection Animations

#### 3.1 Sequential Reward Display

- **FR-3.1.1:** Rewards should appear one at a time in a sequential fashion (not all at once)
- **FR-3.1.2:** Each reward should scale in from 0 to 1.1, then settle to 1.0 over 300ms
- **FR-3.1.3:** There should be a 200ms delay between each reward appearing
- **FR-3.1.4:** Rewards should slide in from a slight upward offset (translateY -10px to 0) for visual depth

#### 3.2 Reward Item Animations

- **FR-3.2.1:** Each reward item should have a subtle rotation animation (-5deg → 0deg) on appearance
- **FR-3.2.2:** Reward icons should have a shine effect that sweeps across them on display
- **FR-3.2.3:** Collection items (trade goods, discoveries, legendary items) should have distinct visual treatment
- prescribe FR-3.2.4:\*\* Rewards should have a gentle bounce when first displayed (scale 1.0 → 1.05 → 1.0)

#### 3.3 Collection Feedback

- **FR-3.3.1:** When a reward is added to a collection set, show a "+1" indicator that moves toward the collection icon
- **FR-3.3.2:** Collection set progress should animate smoothly when updated
- **FR-3.3.3:** Completed collection sets should have a celebratory animation (scale pulse + glow)

### 4. Achievement Unlock Animations

#### 4.1 Non-Blocking Banner Notification

- **FR-4.1.1:** Achievement unlocks should appear as a banner at the top of the screen
- **FR-4.1.2:** Banner should slide down from off-screen (translateY -100 to 0) over 400ms
- **FR- prou4.1.3:** Banner should remain visible for 4 seconds before sliding back up
- **FR-4.1.4:** Banner should not pause gameplay or block critical UI elements

#### 4.2 Achievement Display Content

- **FR-4.2.1:** Banner should display achievement icon, title, and description
- **FR-4.2.2:** Achievement icon should have a subtle rotation animation (0deg → 360deg over 500ms)
- **FR-4.2.3:** Banner should have a subtle background glow effect
- **FR-4.2.4:** Text should fade in after the icon animation completes

#### 4.3 Multiple Achievement Handling

- **FR-4.3.1:** If multiple achievements unlock simultaneously, display them with 500ms stagger between banners
- **FR-4.3.2:** Subsequent achievement banners should stack vertically without overlap
- **FR-4.3.3:** Each banner should independently slide away after its 4-second display period

### 5. Map Navigation Animations

#### 5.1 Depth Transition Animations

- **FR-5.1.1:** When moving between depth levels, the map should slide/pan smoothly (slide horizontal for depth change)
- **FR-5.1.2:** Transition should use a slide animation (translateX based on depth direction)
- **FR-5.1.3:** Transition duration should be 400ms with ease-in-out easing
- **FR-5.1.4:** Nodes should fade out as they move off-screen and fade in as they move on-screen

#### 5.2 Node Appearance

- **FR-5.2.1:** New nodes should fade in (opacity 0 → 1) over 300ms
- **FR-5.2.2:** Nodes should scale in slightly (0.95 → 1.0) for depth effect
- **FR-5.2.3:** Visited nodes should have a subtle "visited" state animation (slight dim + checkmark icon)

#### 5.3 Path Visualization

- **FR-5.3.1:** Path connections should animate in progressively (draw on effect) when nodes appear
- **FR-5.3.2:** Available paths (not yet taken) should have a subtle pulse animation
- **FR-5.3.3:** Current path should be highlighted with a flowing glow effect

#### 5.4 Return Journey Visualization

- **FR-5.4.1:** Return journey should use the same slide/pan animation as descent
- **FR-5.4.2:** Return path should be visually distinct (e.g., dotted line or different color)
- **FR-5.4.3:** Return journey should animate smoothly without jarring transitions

### 6. Animation Consistency Requirements

#### 6.1 Timing Standardization

- **FR-6.1.1:** All animations should use standardized durations:
  - Micro interactions: 100-150ms
  - Standard interactions: 200-300ms
  - Transitions: 300-400ms
  - Celebrations: 500-600ms
- **FR-6.1.2:** All animations should use the same easing curve (ease-out-cubic) for consistency
- **FR-6.1.3:** No animation should exceed 600ms in duration

#### 6.2 Easing Consistency

- **FR-6.2.1:** All animations should use cubic-bezier easing: cubic-bezier(0.4, 0, 0.2, 1)
- **FR-6.2.2:** Exceptions can be made for bounce effects, but should still feel consistent with overall style
- **FR-6.2.3:** Linear animations should be avoided except for specific effects (counters, progress bars)

#### 6.3 Visual Style Consistency

- **FR-6.3.1:** All scale animations should use consistent ranges (typically 0.95-1.15)
- **FR-6.3.2:** All opacity transitions should be smooth (avoid sudden fades)
- **FR-6.3.3:** Color transitions should use smooth interpolation (not instant changes)
- **FR-6.3.4:** All animations should respect the game's visual design language

### 7. Performance Requirements

#### 7.1 Frame Rate Targets

- **FR-7.1.1:** All animations must maintain 60fps on iPhone 13 and newer devices
- **FR-7.1.2:** Animations should degrade gracefully if device can't maintain 60fps (reduce complexity, not disable)
- **FR-7.1.3:** No single animation should cause frame drops below 30fps

#### 7.2 Resource Optimization

- **FR-7.2.1:** Use React Native Reanimated 3 for all animations (worklet-based for performance)
- **FR-7.2.2:** Minimize re-renders during animations by using shared values
- **FR-7.2.3:** Avoid layout-intensive animations (prefer transform and opacity)
- **FR-7.2.4:** Cache animation configurations to avoid recalculation

#### 7.3 Memory Management

- **FR-7.3.1:** Clean up animation listeners when components unmount
- **FR-7.3.2:** Use native driver whenever possible for better performance
- **FR-7.3.3:** Avoid creating new animation configurations on each render

### 8. Integration Requirements

#### 8.1 Existing Component Integration

- **FR-8.1.1:** Energy display components must integrate with new energy animations
- **FR-8.1.2:** Encounter screens must integrate with encounter interaction animations
- **FR-8.1.3:** Map components must integrate with navigation animations
- **FR-8.1.4:** Collection UI must integrate with reward collection animations

#### 8.2 Screen Transition Compatibility

- **FR-8.2.1:** All new animations must work seamlessly with existing ScreenTransition component
- **FR-8.2.2:** Encounter-to-map transitions should not conflict with encounter animations
- **FR-8.2.3:** Screen transitions should enhance, not replace, internal screen animations

## Non-Goals (Out of Scope)

- **Loading State Animations:** No dedicated loading indicators needed at this time
- **Tutorial/Onboarding Animations:** Future phase
- **Sound Effects:** Audio feedback is out of scope for this phase
- **Haptic Feedback:** Vibration/taptic feedback is out of scope
- **Configurable Animation Settings:** Animations are always on (no toggle)
- **Accessibility Animation Reductions:** No reduced motion support at this time
- **End Game Celebrations:** Victory/defeat animations for future phases
- **Custom Animation Creator:** No tools for players to create custom animations
- **Animation Recording/Playback:** No replays or recording features

## Design Considerations

### Visual Design Guidelines

- **Consistency:** All animations should feel like part of the same family - use consistent timing, easing, and scale factors
- **Subtlety:** Animations should enhance without being distracting - err on the side of subtle
- **Purpose:** Every animation should serve a functional purpose, not just decoration
- **Feedback:** Use animations to communicate game state changes and player actions
- **Polish:** Even the smallest interactions deserve thoughtful animation

### React Native Reanimated 3 Implementation

- Use `useSharedValue` for all animated properties
- Use `useAnimatedStyle` to create animated styles
- Use `withTiming` for smooth transitions with easing curves
- Use `withSequence` for complex animation sequences
- Use `withDelay` to stagger animations
- Use worklets for performance-critical animations
- Use native driver for transform and opacity animations when possible

### Animation Component Architecture

- Create reusable animation components for common patterns
- Separate animation logic from business logic
- Use composition over inheritance for animation effects
- Create animation utilities for common timing/easing configurations
- Document animation patterns for future developers

## Technical Considerations

### Dependencies

- **React Native Reanimated 3:** Core animation library
- **React Native Gesture Handler:** For press animations and interactions
- **Existing Components:** Integrate with current UI components without breaking changes

### Performance Targets

- 60fps on iPhone 13+
- Smooth animations with <16ms frame time
- No memory leaks from animation listeners
- Efficient re-render patterns

### Integration Points

- **Energy Management System:** Integrate with energy calculations and displays
- **Encounter System:** Integrate with all encounter types and outcomes
- **Collection System:** Integrate with reward collection and set completion
- **Achievement System:** Integrate with achievement unlock triggers
- **Map System:** Integrate with depth navigation and node rendering

## Success Metrics

1. **Performance:** 95% of animation sequences maintain 60fps on iPhone 13+
2. **User Understanding:** Players can clearly see energy depletion, rewards, and state changes
3. **Visual Polish:** Game feels premium and polished to players
4. **Consistency:** All animations follow the same timing and easing standards
5. **Functional Clarity:** Players make better decisions due to clear visual feedback
6. **Engagement:** Players report feeling more engaged with interactive encounters
7. **Bug-Free:** No animation-related crashes or performance issues
8. **Integration:** All animations work seamlessly with existing systems

## Open Questions

1. Should rare rewards (legendary items) have special animations beyond the standard reward animations?
2. Should there be different animation intensities for different encounter difficulty levels?
3. How should we handle animations when the app is backgrounded and then resumed?
4. Should errors in animations (e.g., animation can't complete) fall back to instant state changes or retry?
5. Do we need any animations for the collection overview screen itself (not just individual items)?
6. Should there be special animations for the first time a player experiences each encounter type?

## Implementation Notes

- Start with high-impact animations (energy, rewards) and expand to all interactions
- Test on real iPhone 13+ devices throughout development
- Use the existing ScreenTransition component as a reference for consistency
- Create animation utility functions early to maintain consistency
- Document animation patterns and conventions for future developers
- Consider creating a visual reference/animation library for the team
- Maintain backward compatibility with existing components
- Test animations at various energy levels and game states
- Verify animations work correctly in all encounter types
