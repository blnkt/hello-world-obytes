# PRD: Metaphysical Encounters - Luck Shrine, Energy Nexus, Time Distortion, and Fate Weaver

## Introduction/Overview

This feature adds four new encounter types that introduce unique metaphysical and strategic gameplay mechanics to the Delver's Descent game. These encounters provide players with advanced tools for run management, resource conversion, probability manipulation, and temporal manipulation. Unlike standard encounters, these metaphysical encounters focus on strategic utility rather than direct rewards, adding depth to the push-your-luck gameplay loop.

**Problem Solved:** Players need more strategic options during runs to manage resources, mitigate risks, and influence encounter probabilities. The current encounter system lacks utility-focused encounters that allow players to manipulate their run state.

**Goal:** Add four new encounter types that provide strategic utility without breaking game balance, while maintaining the push-your-luck risk/reward mechanics.

## Goals

1. Implement four new encounter types: Luck Shrine, Energy Nexus, Time Distortion, and Fate Weaver
2. Ensure all new encounters integrate seamlessly with existing encounter routing and resolution systems
3. Maintain game balance by having these encounters provide utility benefits rather than direct rewards
4. Support persistent state management for effects that last across multiple encounters
5. Provide clear UI/UX for complex mechanics like probability alteration and time manipulation

## User Stories

1. **As a player**, I want to temporarily boost reward multipliers for my next few encounters using a Luck Shrine, so that I can maximize gains when I'm confident about my run's trajectory.

2. **As a player**, I want to convert items to energy (or vice versa) at an Energy Nexus, so that I can optimize my resource allocation based on my current situation.

3. **As a player**, I want to rewind or skip encounters using Time Distortion, so that I can recover from mistakes or accelerate through unfavorable encounters (with appropriate risks).

4. **As a player**, I want to alter the probability distribution of encounter types using a Fate Weaver, so that I can influence what types of encounters I'll face for the rest of my run.

5. **As a player**, I want these encounters to appear in all regions, so that I have consistent access to these strategic tools regardless of where I'm exploring.

## Functional Requirements

### General Requirements

1. All four new encounter types must be added to the `EncounterType` union type in the type definitions.
2. All four encounters must be registered in the encounter router system to route to appropriate screens.
3. All four encounters must be supported in the encounter resolver system.
4. All four encounters must be added to map generator encounter type lists.
5. All four encounters must be included in regional encounter distributions (available in all regions).
6. None of these encounters should have reward multipliers (they provide utility benefits instead).
7. All four encounters must persist their state properly across app restarts.
8. All four encounters must have appropriate energy costs based on depth and encounter type modifiers.

### Luck Shrine Encounter

9. The Luck Shrine must allow players to activate a luck boost that increases reward multipliers for the next 2-3 encounters.
10. The luck boost effect must be stored in run state and tracked across encounters.
11. The luck boost must apply to all reward calculations for the affected encounters.
12. The encounter must have a fixed energy cost (not variable based on investment).
13. The luck boost effect must automatically expire after the specified number of encounters.
14. The UI must clearly display how many encounters the luck boost will affect.
15. The encounter must show the player what reward multiplier bonus they'll receive.

### Energy Nexus Encounter

16. The Energy Nexus must allow players to choose between converting items to energy OR energy to items (one-way conversion per encounter).
17. The conversion rate must be fixed (e.g., 1 item value = 10 energy, or vice versa).
18. Players must be limited to 1 conversion per Energy Nexus encounter.
19. The conversion must validate that the player has sufficient resources (items or energy) to perform the conversion.
20. The UI must clearly show the conversion rate and what the player will receive.
21. The encounter must prevent players from converting if they lack sufficient resources.
22. After conversion, the player's energy and inventory must be updated immediately.

### Time Distortion Encounter

23. The Time Distortion encounter must offer two options: Rewind (undo last encounter choice) and Skip (jump ahead 1-2 encounters).
24. Both options must have high energy costs.
25. Both options must have risks of losing items/progress.
26. Both options must have random negative side effects.
27. The Rewind option must restore the player to the state before their last encounter (including energy, inventory, and position).
28. The Skip option must advance the player forward by 1-2 encounters, skipping those encounters but still consuming energy.
29. The encounter must have a chance to cause bust conditions if misused.
30. The UI must clearly warn players about the risks of each option.
31. The encounter must track which option was used for statistics purposes.

### Fate Weaver Encounter

32. The Fate Weaver must randomly select 3 encounter types from available types in the current region.
33. The Fate Weaver must allow players to increase or decrease the probability of these 3 encounter types.
34. The probability alteration must be a fixed amount (e.g., ±10% per encounter type).
35. The probability changes must persist for the rest of the current run.
36. The probability changes must be stored in run state.
37. The map generator must use the modified probability distribution when generating future encounters.
38. The UI must clearly show which 3 encounter types were selected and how their probabilities will change.
39. The UI must display the current probability distribution so players can see the changes.
40. The probability changes must reset when starting a new run.

## Non-Goals (Out of Scope)

1. **Reward multipliers:** These encounters do not provide direct reward multipliers (they provide utility instead).
2. **Region-specific availability:** These encounters will be available in all regions, not region-locked.
3. **Multiple uses per run:** Players cannot use the same metaphysical encounter multiple times in a single run (standard encounter rules apply).
4. **Permanent effects:** All effects from these encounters are temporary and reset when starting a new run.
5. **Complex conversion mechanics:** The Energy Nexus uses simple fixed-rate conversions, not market-based or negotiation systems.
6. **Undo system:** Time Distortion Rewind only affects the last encounter, not a full undo history system.
7. **Preview system:** Fate Weaver does not show players what encounters they'll face, only alters probabilities.

## Design Considerations

### UI/UX Requirements

1. **Luck Shrine Screen:**
   - Display current reward multiplier
   - Show the boosted multiplier that will apply
   - Show how many encounters the boost will last (2-3)
   - Clear call-to-action button to activate the shrine

2. **Energy Nexus Screen:**
   - Display current energy and inventory
   - Show conversion rate clearly
   - Two buttons: "Convert Items → Energy" and "Convert Energy → Items"
   - Disable buttons if insufficient resources
   - Show preview of what player will receive after conversion

3. **Time Distortion Screen:**
   - Display two options: "Rewind" and "Skip"
   - Show energy costs for each option
   - Display risk warnings prominently
   - Show potential negative side effects
   - Confirmation dialog before executing risky actions

4. **Fate Weaver Screen:**
   - Display the 3 randomly selected encounter types
   - Show current probability distribution (before changes)
   - Show modified probability distribution (after changes)
   - Allow players to choose increase or decrease for each type
   - Display confirmation before applying changes

### Visual Design

- All four encounters should have distinct visual themes that convey their metaphysical nature
- Use consistent styling with existing advanced encounter screens
- Icons/visuals should clearly communicate the encounter's function
- Risk warnings should use appropriate visual indicators (colors, icons)

## Technical Considerations

### State Management

1. **Run State Extensions:**
   - Add `luckBoostActive?: { remainingEncounters: number; multiplierBonus: number }` to `RunState`
   - Add `modifiedEncounterProbabilities?: Record<EncounterType, number>` to `RunState`
   - Add `timeDistortionHistory?: Array<{ type: 'rewind' | 'skip'; timestamp: number }>` to `RunState`

2. **Encounter State:**
   - Each encounter type needs its own encounter state structure
   - State must persist across app restarts
   - State must be cleared when run completes or busts

### Map Generation Integration

1. The map generator must check for modified encounter probabilities in run state
2. If modified probabilities exist, use them instead of default regional distribution
3. Normalize probabilities to ensure they sum to 100%
4. Handle edge cases where modified probabilities might conflict with region constraints

### Reward Calculation Integration

1. The reward calculator must check for active luck boost
2. Apply luck boost multiplier to reward calculations
3. Luck boost should decay after each encounter (reduce remainingEncounters)
4. Remove luck boost when remainingEncounters reaches 0

### Energy Conversion System

1. Create utility functions for item-to-energy and energy-to-item conversion
2. Validate conversion requests (sufficient resources)
3. Update inventory and energy atomically
4. Handle edge cases (empty inventory, zero energy)

### Time Manipulation System

1. Store encounter history for rewind functionality
2. Implement encounter skipping logic
3. Handle state restoration for rewind
4. Generate random negative side effects
5. Integrate with bust condition checking

### Files to Create/Modify

**New Files:**

- `src/lib/delvers-descent/luck-shrine-encounter.ts` - Luck Shrine encounter logic
- `src/lib/delvers-descent/energy-nexus-encounter.ts` - Energy Nexus encounter logic
- `src/lib/delvers-descent/time-distortion-encounter.ts` - Time Distortion encounter logic
- `src/lib/delvers-descent/fate-weaver-encounter.ts` - Fate Weaver encounter logic
- `src/components/delvers-descent/encounters/advanced/luck-shrine-screen.tsx` - UI component
- `src/components/delvers-descent/encounters/advanced/energy-nexus-screen.tsx` - UI component
- `src/components/delvers-descent/encounters/advanced/time-distortion-screen.tsx` - UI component
- `src/components/delvers-descent/encounters/advanced/fate-weaver-screen.tsx` - UI component

**Files to Modify:**

- `src/types/delvers-descent.ts` - Add new encounter types, extend RunState
- `src/lib/delvers-descent/encounter-router.ts` - Add routing for new encounters
- `src/lib/delvers-descent/encounter-resolver.ts` - Support new encounter types
- `src/lib/delvers-descent/map-generator.ts` - Include new types, support probability modification
- `src/lib/delvers-descent/map-generator-optimized.ts` - Include new types, support probability modification
- `src/lib/delvers-descent/balance-config.ts` - Add encounter distributions for new types
- `src/lib/delvers-descent/regions.ts` - Update encounter distributions to include new types

### Dependencies

- Existing encounter system infrastructure
- Run state persistence system
- Map generation system
- Reward calculation system
- Energy management system
- Inventory management system

## Success Metrics

1. **Functionality:**
   - All four encounter types appear in map generation
   - All four encounters can be completed without errors
   - State persists correctly across app restarts
   - Effects apply correctly (luck boost, probability changes, etc.)

2. **Balance:**
   - Players use these encounters strategically (not ignored)
   - Encounter usage doesn't break game difficulty curve
   - Energy costs are appropriate for the utility provided
   - No exploits or unintended interactions with other systems

3. **User Experience:**
   - Players understand what each encounter does
   - UI clearly communicates risks and benefits
   - No confusion about how effects work
   - Positive player feedback on strategic depth added

## Open Questions

1. **Specific Values:**
   - What is the exact fixed energy cost for Luck Shrine? (Should scale with depth?)
   - What is the exact conversion rate for Energy Nexus? (1 item value = X energy?)
   - What are the exact energy costs for Time Distortion options?
   - What is the exact probability change amount for Fate Weaver? (±10% or different?)
   - What is the exact reward multiplier bonus from Luck Shrine? (+0.2x, +0.5x, etc.?)

2. **Luck Shrine:**
   - Should the luck boost multiplier be fixed or variable based on depth?
   - Should the number of encounters affected (2-3) be random or fixed?

3. **Energy Nexus:**
   - Should the conversion rate be the same in both directions (items→energy and energy→items)?
   - Should conversion rates scale with depth or item rarity?

4. **Time Distortion:**
   - What are the exact probabilities for negative side effects?
   - Should the number of encounters skipped (1-2) be random or player choice?
   - What specific side effects can occur?

5. **Fate Weaver:**
   - Should the probability change be the same for all three selected types, or can players choose different amounts?
   - Should there be a limit to how much probabilities can be changed (e.g., max ±20%)?

6. **Encounter Distribution:**
   - What should be the base spawn rate for each of these encounters in the encounter distribution?
   - Should they be rare (like region_shortcut at 6%) or more common?

7. **Implementation Priority:**
   - In what order should the four encounters be implemented? (User said no preference, but we should decide for task breakdown)
