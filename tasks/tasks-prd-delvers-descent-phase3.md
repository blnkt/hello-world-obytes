## Relevant Files

- `src/lib/delvers-descent/return-cost-calculator.ts` - Core algorithm for exponential return cost calculation with shortcut support
- `src/lib/delvers-descent/return-cost-calculator.test.ts` - Unit tests for return cost calculation algorithms
- `src/lib/delvers-descent/safety-margin-manager.ts` - Safety margin calculation and point of no return detection
- `src/lib/delvers-descent/safety-margin-manager.test.ts` - Unit tests for safety margin calculations
- `src/lib/delvers-descent/cash-out-manager.ts` - Cash out and bust logic with player choice system
- `src/lib/delvers-descent/cash-out-manager.test.ts` - Unit tests for cash out and bust mechanics
- `src/lib/delvers-descent/risk-event-encounter.ts` - High-stakes gambling encounter with legendary rewards
- `src/lib/delvers-descent/risk-event-encounter.test.ts` - Unit tests for Risk Event encounter mechanics
- `src/lib/delvers-descent/hazard-encounter.ts` - Obstacle encounter with multiple solution paths
- `src/lib/delvers-descent/hazard-encounter.test.ts` - Unit tests for Hazard encounter mechanics
- `src/lib/delvers-descent/rest-site-encounter.ts` - Safe haven encounter with energy reserve and strategic intel
- `src/lib/delvers-descent/rest-site-encounter.test.ts` - Unit tests for Rest Site encounter mechanics
- `src/lib/delvers-descent/shortcut-manager.ts` - Shortcut discovery and integration with return costs
- `src/lib/delvers-descent/shortcut-manager.test.ts` - Unit tests for shortcut management
- `src/lib/delvers-descent/risk-escalation-manager.ts` - Depth-based risk scaling and encounter difficulty
- `src/lib/delvers-descent/risk-escalation-manager.test.ts` - Unit tests for risk escalation mechanics
- `src/types/delvers-descent.ts` - Extend existing types with push-your-luck mechanics and advanced encounters
- `src/types/delvers-descent.test.ts` - Update tests for new types and interfaces
- `src/components/delvers-descent/push-your-luck/return-cost-display.tsx` - UI component for displaying return costs
- `src/components/delvers-descent/push-your-luck/return-cost-display.test.tsx` - Unit tests for return cost display
- `src/components/delvers-descent/push-your-luck/safety-margin-indicator.tsx` - Visual safety zone indicators
- `src/components/delvers-descent/push-your-luck/safety-margin-indicator.test.tsx` - Unit tests for safety margin indicators
- `src/components/delvers-descent/push-your-luck/risk-warning-modal.tsx` - Modal for risk warnings and confirmations
- `src/components/delvers-descent/push-your-luck/risk-warning-modal.test.tsx` - Unit tests for risk warning modal
- `src/components/delvers-descent/push-your-luck/cash-out-screen.tsx` - Complete cash out interface with reward summary
- `src/components/delvers-descent/push-your-luck/cash-out-screen.test.tsx` - Unit tests for cash out screen
- `src/components/delvers-descent/push-your-luck/bust-screen.tsx` - Bust interface explaining consequences and XP preservation
- `src/components/delvers-descent/push-your-luck/bust-screen.test.tsx` - Unit tests for bust screen
- `src/components/delvers-descent/encounters/risk-event-screen.tsx` - UI for Risk Event encounter with gambling mechanics
- `src/components/delvers-descent/encounters/risk-event-screen.test.tsx` - Unit tests for Risk Event screen
- `src/components/delvers-descent/encounters/hazard-screen.tsx` - UI for Hazard encounter with multiple solution options
- `src/components/delvers-descent/encounters/hazard-screen.test.tsx` - Unit tests for Hazard screen
- `src/components/delvers-descent/encounters/rest-site-screen.tsx` - UI for Rest Site encounter with energy reserve and intel
- `src/components/delvers-descent/encounters/rest-site-screen.test.tsx` - Unit tests for Rest Site screen
- `src/components/delvers-descent/hooks/use-push-your-luck.tsx` - React hook for push-your-luck mechanics integration
- `src/components/delvers-descent/hooks/use-push-your-luck.test.tsx` - Unit tests for push-your-luck hook
- `src/lib/delvers-descent/__tests__/phase3-integration.test.ts` - Integration tests for Phase 3 systems

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `return-cost-calculator.ts` and `return-cost-calculator.test.ts` in the same directory).
- Use `pnpm test [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [x] 1.0 Push-Your-Luck Core Mechanics
  - [x] 1.1 Create ReturnCostCalculator class with exponential scaling algorithm (5 \* depth^1.5)
  - [x] 1.2 Implement shortcut integration with configurable cost reduction (70% default)
  - [x] 1.3 Create path optimization algorithm considering shortcuts and visited nodes
  - [x] 1.4 Implement SafetyMarginManager for point of no return detection
  - [x] 1.5 Create RiskEscalationManager for depth-based difficulty scaling
  - [x] 1.6 Add configurable scaling factors for exponential curves and shortcut effectiveness
  - [x] 1.7 Add comprehensive unit tests for all push-your-luck algorithms

- [x] 2.0 Advanced Encounter Types Implementation
  - [x] 2.1 Create RiskEventEncounter class with high-stakes gambling mechanics
  - [x] 2.2 Implement multiple risk levels with varying success rates and legendary rewards
  - [x] 2.3 Create HazardEncounter class with obstacle types and multiple solution paths
  - [x] 2.4 Implement energy cost options (pay toll, alternate route, risky gamble)
  - [x] 2.5 Create RestSiteEncounter class with energy reserve and strategic intel
  - [x] 2.6 Implement depth-based scaling for all advanced encounter types
  - [x] 2.7 Add comprehensive unit tests for all advanced encounter mechanics

- [x] 3.0 Cash Out & Bust Logic System
  - [x] 3.1 Create CashOutManager class with player choice system (no forced busts)
  - [x] 3.2 Implement risk warning system with clear danger level indicators
  - [x] 3.3 Create reward banking system for secure item collection on cash out
  - [x] 3.4 Implement XP preservation logic (steps always count regardless of outcome)
  - [x] 3.5 Add bust confirmation with clear consequence explanations
  - [x] 3.6 Create cash out confirmation modal with reward summary
  - [x] 3.7 Add comprehensive unit tests for cash out and bust logic

- [ ] 4.0 System Integration & State Management
  - [x] 4.1 Integrate return cost calculations with existing spatial navigation system
  - [x] 4.2 Integrate advanced encounter types with existing encounter resolution framework
  - [x] 4.3 Integrate push-your-luck mechanics with existing energy management system
  - [x] 4.4 Integrate advanced encounters with existing reward calculation system
  - [x] 4.5 Create ShortcutManager for discovery and persistence across runs
  - [x] 4.6 Implement state persistence for all new mechanics across app sessions
  - [ ] 4.7 Add performance optimization for complex return cost scenarios
  - [ ] 4.8 Extend existing TypeScript interfaces for all new mechanics

- [ ] 5.0 UI Integration & User Experience
  - [ ] 5.1 Create ReturnCostDisplay component with clear, prominent cost visualization
  - [ ] 5.2 Implement SafetyMarginIndicator with visual safety zones (green/yellow/red)
  - [ ] 5.3 Create RiskWarningModal for contextual warnings and confirmations
  - [ ] 5.4 Implement CashOutScreen with comprehensive reward summary
  - [ ] 5.5 Create BustScreen explaining consequences and XP preservation
  - [ ] 5.6 Implement RiskEventScreen with gambling mechanics and legendary rewards
  - [ ] 5.7 Create HazardScreen with multiple solution options and energy costs
  - [ ] 5.8 Implement RestSiteScreen with energy reserve and strategic intel display
  - [ ] 5.9 Create usePushYourLuck React hook for UI integration
  - [ ] 5.10 Add smooth transitions between all new UI elements and existing systems
  - [ ] 5.11 Add comprehensive unit tests for all UI components

- [ ] 6.0 Integration Testing & Validation
  - [ ] 6.1 Create integration tests for Phase 1 + Phase 2 + Phase 3 system interaction
  - [ ] 6.2 Test return cost calculations with various depth and shortcut scenarios
  - [ ] 6.3 Test cash out/bust logic with edge cases and boundary conditions
  - [ ] 6.4 Test advanced encounter integration with existing encounter system
  - [ ] 6.5 Test state persistence across app sessions and run transitions
  - [ ] 6.6 Test performance requirements (50ms return costs, 200ms UI transitions)
  - [ ] 6.7 Test user experience flows for decision-making and risk communication
  - [ ] 6.8 Validate all success metrics from PRD (engagement, risk balance, etc.)
