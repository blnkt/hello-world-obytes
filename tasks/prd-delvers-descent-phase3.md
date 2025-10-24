# PRD: Delver's Descent Phase 3 - Push-Your-Luck Mechanics & Advanced Encounters

## Introduction/Overview

Phase 3 completes the core Delver's Descent experience by implementing the critical push-your-luck mechanics that create the game's signature tension, while adding the remaining encounter types (Risk Event, Hazard, Rest Site) to provide full encounter variety. This phase transforms the spatial navigation and encounter systems from Phases 1 and 2 into a cohesive, strategic dungeon crawling experience where every decision matters.

**Problem Solved:** Players can navigate the dungeon and resolve basic encounters, but lack the critical push-your-luck mechanics that create meaningful risk/reward decisions. The game needs return cost calculations, cash out/bust logic, and the remaining high-stakes encounter types to deliver the full strategic depth envisioned in the original design.

**Goal:** Implement comprehensive push-your-luck mechanics with exponential return costs, player choice-driven cash out/bust logic, point of no return detection, and the remaining encounter types (Risk Event, Hazard, Rest Site) to create the complete strategic dungeon crawling experience.

## Goals

1. **Push-Your-Luck Core Mechanics**: Implement exponential return cost calculation with shortcut support and configurable scaling
2. **Cash Out & Bust Logic**: Create player choice-driven system with risk warnings and safety margin calculations
3. **Point of No Return Detection**: Implement algorithms to detect when players are committed to deeper exploration
4. **Risk Escalation**: Create depth-based risk scaling that increases tension and reward potential
5. **Advanced Encounter Types**: Implement Risk Event, Hazard, and Rest Site encounters with unique mechanics
6. **Complete System Integration**: Seamlessly integrate push-your-luck mechanics with existing spatial navigation and encounter systems
7. **Comprehensive UI Integration**: Create complete UI for all new mechanics with smooth transitions and clear risk communication

## User Stories

1. **As a player**, I want to see my return energy cost clearly displayed so I can make informed decisions about going deeper.
2. **As a player**, I want to be warned when I'm approaching the point of no return so I can choose to cash out safely.
3. **As a player**, I want to encounter high-stakes Risk Events so I can gamble for legendary rewards with meaningful consequences.
4. **As a player**, I want to face Hazard obstacles so I can choose between paying costs, finding alternate routes, or taking risks.
5. **As a player**, I want to discover Rest Sites so I can gain a reserve of energy that is depleted before my normal energy, as well as gain strategic information about deeper paths.
6. **As a player**, I want shortcuts to dramatically reduce my return costs so I can take calculated risks knowing I have escape options.
7. **As a player**, I want the game to clearly communicate my safety margin so I understand the risk of each decision.
8. **As a player**, I want to choose when to cash out vs. push deeper so I control my own risk level.
9. **As a player**, I want bust conditions to be clear and fair so I understand the consequences of my choices.
10. **As a player**, I want all encounter types to feel meaningfully different so I have varied strategic experiences.

## Functional Requirements

### Push-Your-Luck Core Mechanics

- [ ] **Exponential Return Cost Calculation**: Implement `5 * depth^1.5` base formula with configurable scaling factors
- [ ] **Shortcut Integration**: Shortcuts reduce return costs by 70% (configurable) when available
- [ ] **Path Optimization**: Calculate optimal return paths considering shortcuts and visited nodes
- [ ] **Safety Margin Calculation**: Display remaining energy after estimated return cost
- [ ] **Point of No Return Detection**: Algorithm to detect when return energy exceeds remaining energy
- [ ] **Risk Escalation**: Increase encounter difficulty, rewards, and consequences with depth
- [ ] **Configurable Scaling**: Allow tuning of exponential factors, shortcut effectiveness, and risk curves

### Cash Out & Bust Logic

- [ ] **Player Choice System**: Always allow player to choose cash out vs. continue (no forced busts)
- [ ] **Risk Warning System**: Clear warnings when approaching dangerous energy levels
- [ ] **Safety Margin Display**: Visual indicators of energy safety (safe/warning/danger zones)
- [ ] **Cash Out Confirmation**: Modal to confirm cash out with reward summary
- [ ] **Bust Confirmation**: Clear explanation of bust consequences before final decision
- [ ] **Reward Banking**: Secure all collected items when successfully cashing out
- [ ] **XP Preservation**: Ensure step-based XP is always preserved regardless of bust/cash out

### Advanced Encounter Types

**Risk Event Encounter**

- [ ] **High-Stakes Gambling**: Probability-based outcomes with significant rewards/consequences
- [ ] **Legendary Rewards**: Rare collection items and high-value treasures
- [ ] **Multiple Risk Levels**: Different gamble options with varying success rates and rewards
- [ ] **Failure Consequences**: Energy loss, item loss risk, or forced retreat on failure
- [ ] **Depth Scaling**: Higher rewards and risks at deeper depths

**Hazard Encounter**

- [ ] **Obstacle Types**: Environmental hazards, traps, or blocked paths
- [ ] **Multiple Solutions**: Pay energy toll, find alternate route, or take risky gamble
- [ ] **Energy Cost Options**: Variable costs based on chosen solution method
- [ ] **Failure Conditions**: Risk of bust or forced retreat if gamble fails
- [ ] **Strategic Information**: Intel about deeper paths or shortcuts as rewards

**Rest Site Encounter**

- [ ] **Energy Recovery**: Free minor energy reserve (10-20% of total, configurable)
- [ ] **Strategic Intel**: Information about deeper paths, shortcuts, or encounter types
- [ ] **Temporary Buffs**: Short-term bonuses for next few encounters
- [ ] **Decision Making**: Safe space to review inventory and plan next moves
- [ ] **Rarity**: Uncommon encounter type (5-10% spawn rate)

### System Integration

- [ ] **Spatial Navigation Integration**: Return costs integrate with existing map generation
- [ ] **Encounter System Integration**: New encounter types work with existing resolution framework
- [ ] **Energy Management Integration**: Push-your-luck mechanics integrate with existing energy tracking
- [ ] **Reward System Integration**: Advanced encounters use existing reward calculation system
- [ ] **State Persistence**: All new mechanics persist across app sessions
- [ ] **Performance Optimization**: Efficient calculations for complex return cost scenarios

### UI Integration

- [ ] **Return Cost Display**: Clear, prominent display of return energy costs
- [ ] **Safety Margin Indicators**: Visual safety zones (green/yellow/red energy levels)
- [ ] **Risk Warning Modals**: Contextual warnings when approaching dangerous situations
- [ ] **Cash Out Interface**: Comprehensive cash out screen with reward summary
- [ ] **Bust Interface**: Clear bust screen explaining consequences and XP preservation
- [ ] **Advanced Encounter Screens**: Complete UI for Risk Event, Hazard, and Rest Site encounters
- [ ] **Shortcut Discovery UI**: Clear indication when shortcuts are found and available
- [ ] **Smooth Transitions**: Seamless flow between all new UI elements and existing systems

## Non-Goals (Out of Scope)

- Collection set completion bonuses (Phase 4)
- Region unlocks and permanent progression (Phase 4)
- Visual polish and animations (Phase 5)
- Advanced balancing and tuning (Phase 5)
- Tutorial/onboarding flow (Phase 6)
- Achievement system (Phase 5)
- Performance optimization beyond basic requirements (Phase 6)

## Technical Considerations

**Integration Points:**

- Existing spatial navigation system (Phase 1) → Return cost calculations
- Existing encounter resolution system (Phase 2) → Advanced encounter types
- Existing energy management → Push-your-luck mechanics
- Existing reward system → Advanced encounter rewards
- Existing UI framework → New encounter screens and risk displays

**Performance:**

- Return cost calculations must complete within 50ms
- Complex path optimization should not block UI
- Encounter screens should load within 200ms
- Smooth transitions between all UI states

**Data Persistence:**

- Shortcut discoveries persist across runs
- Risk escalation state persists during active runs
- Cash out/bust decisions persist in run history
- Configuration settings persist across app sessions

**Algorithmic Complexity:**

- Return cost calculation: O(depth) complexity
- Path optimization: O(nodes_visited) complexity
- Point of no return detection: O(1) complexity
- Risk escalation: O(depth) complexity

## Success Metrics

1. **Engagement**: 85%+ of players engage with push-your-luck mechanics (cash out vs. continue decisions)
2. **Risk Balance**: 20-30% bust rate maintains tension without frustration
3. **Encounter Variety**: Players encounter all encounter types with roughly equal frequency
4. **Decision Quality**: 70%+ of players make informed decisions based on safety margin displays
5. **System Integration**: Seamless transitions between spatial navigation, encounters, and push-your-luck mechanics
6. **Performance**: All calculations complete within specified time limits
7. **User Understanding**: 90%+ of players understand return costs and safety margins

## Open Questions

1. **Shortcut Discovery**: Should shortcuts be discovered through specific encounters or random chance?
2. **Risk Event Frequency**: How often should Risk Events appear at different depths?
3. **Hazard Solutions**: Should alternate routes always be available, or sometimes force risky gambles?
4. **Rest Site Benefits**: Should energy recovery be percentage-based or fixed amounts?
5. **Bust Severity**: Should busts have any permanent consequences beyond losing run rewards?
6. **Configuration Defaults**: What are the optimal default values for exponential scaling and shortcut effectiveness?

## Implementation Notes

- Start with return cost calculation algorithms (foundational)
- Implement cash out/bust logic early for testing
- Create advanced encounter types incrementally
- Focus heavily on integration testing between all three phases
- Use comprehensive user experience testing for decision-making flows
- Prepare interfaces for Phase 4 collection and progression systems
- Maintain backward compatibility with existing Phase 1 and Phase 2 systems
