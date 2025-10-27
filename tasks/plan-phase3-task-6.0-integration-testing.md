# Phase 3 Task 6.0: Integration Testing & Validation Plan

## Overview

Create comprehensive integration tests for Phase 3: Push-Your-Luck Mechanics & Advanced Encounters. These tests validate the complete system integration between Phase 1 (spatial navigation), Phase 2 (encounter resolution), and Phase 3 (push-your-luck mechanics).

## Scope Note

Since Tasks 5.9-5.11 were skipped:

- **SKIP** testing for `usePushYourLuck` hook (5.9)
- **SKIP** testing for UI transitions/smooth animations (5.10)
- **SKIP** component unit tests for those items (5.11)
- **DO** test all existing completed components and systems

## Existing Integration Tests

Review these existing tests to understand patterns:

- `src/lib/delvers-descent/energy-push-your-luck-integration.test.ts`
- `src/lib/delvers-descent/advanced-encounters-reward-integration.test.ts`
- `src/lib/delvers-descent/map-generator-integration.test.ts`
- `src/lib/delvers-descent/phase3-performance-optimization.test.ts`
- `src/lib/delvers-descent/phase3-types-verification.test.ts`

## Task Breakdown

### Task 6.1: Create integration tests for Phase 1 + Phase 2 + Phase 3 system interaction

**File**: `src/lib/delvers-descent/__tests__/phase123-integration.test.ts`

**What to test**:

1. Complete flow: Initialize run → Navigate to depth → Encounter → Push-your-luck decision
2. Energy consumption through spatial navigation
3. Return cost calculation updates with depth
4. Encounter rewards affect energy/inventory
5. Cash out/bust decisions impact state

**Test scenarios**:

- Start run at depth 0, navigate to depth 5, encounter Risk Event, attempt cash out
- Start run at depth 3, encounter Hazard, fail encounter, check bust condition
- Start run at depth 2, encounter Rest Site, gain energy, continue deeper
- Multiple encounters in sequence with energy management
- Return journey with shortcut discovery

**Key assertions**:

- Energy is correctly tracked across all phases
- Return costs increase appropriately with depth
- Encounter outcomes affect energy/items
- Safety margins update correctly
- Cash out logic preserves XP correctly

### Task 6.2: Test return cost calculations with various depth and shortcut scenarios

**File**: `src/lib/delvers-descent/__tests__/return-cost-scenarios.test.ts`

**What to test**:

1. Exponential scaling at different depths (1, 5, 10, 20)
2. Shortcut reduction effectiveness (different reduction factors)
3. Path optimization with multiple shortcuts
4. Edge cases: depth 0, very high depth, fractional depths

**Test scenarios**:

- Calculate return cost from depth 0, 1, 5, 10, 20
- Add single shortcut at depth 5, verify 70% reduction
- Add multiple shortcuts at different depths
- Verify optimal path calculation uses best shortcuts
- Test with custom baseMultiplier and exponent values

**Key assertions**:

- Return cost = 0 at depth 0
- Return cost increases exponentially
- Shortcuts reduce costs by expected amount
- Optimal path calculation is correct
- Configuration changes affect calculations as expected

### Task 6.3: Test cash out/bust logic with edge cases and boundary conditions

**File**: `src/lib/delvers-descent/__tests__/cashout-bust-edge-cases.test.ts`

**What to test**:

1. Cash out when safe (>50% energy remaining)
2. Cash out when at caution threshold (30%)
3. Cash out when at danger threshold (10%)
4. Cash out when at critical threshold (0%)
5. Bust scenarios (cannot afford return)
6. XP preservation in all scenarios
7. Item banking on cash out
8. Item loss on bust

**Test scenarios**:

- Cash out with various energy levels (100%, 60%, 35%, 15%, 5%)
- Bust when return cost > current energy
- XP is preserved regardless of outcome
- Items are properly banked on successful cash out
- Items are lost on bust (but XP preserved)
- Multiple items of different types

**Key assertions**:

- canContinue() returns correct boolean
- canCashOut() returns correct boolean
- Cash out summary shows correct totals
- Bust consequence shows XP preserved
- XP is always preserved (even on bust)

### Task 6.4: Test advanced encounter integration with existing encounter system

**File**: `src/lib/delvers-descent/__tests__/advanced-encounters-integration.test.ts`

**What to test**:

1. RiskEventEncounter integrates with EncounterResolver
2. HazardEncounter integrates with EncounterResolver
3. RestSiteEncounter integrates with EncounterResolver
4. All encounter types use RewardCalculator
5. All encounter types use FailureConsequenceManager
6. Encounter outcomes affect run state

**Test scenarios**:

- Create RiskEventEncounter, resolve with success
- Create RiskEventEncounter, resolve with failure
- Create HazardEncounter with multiple solution paths
- Create RestSiteEncounter, verify energy/intel rewards
- Verify RewardCalculator applies correct multipliers
- Verify FailureConsequenceManager handles consequences

**Key assertions**:

- All encounter types can be resolved
- Rewards are correctly calculated (depth scaling)
- Failure consequences are properly applied
- Energy/inventory updates correctly
- Encounter state persists

### Task 6.5: Test state persistence across app sessions and run transitions

**File**: `src/lib/delvers-descent/__tests__/state-persistence-phases.test.ts`

**What to test**:

1. Run state persists across MMKV sessions
2. Shortcut discoveries persist across runs
3. Visited nodes persist within active run
4. Inventory items persist between sessions
5. Energy state persists within active run
6. Cash out/bust records persist

**Test scenarios**:

- Initialize run, persist to MMKV, recreate manager, verify state
- Discover shortcuts, persist, recreate ShortcutManager, verify shortcuts
- Complete encounter, update inventory, persist, verify items preserved
- Cash out run, verify rewards banked, check historical records
- Bust run, verify XP preserved, check no item loss in inventory

**Key assertions**:

- RunStateManager.state persists correctly
- ShortcutManager.shortcuts persists correctly
- Inventory persists between app sessions
- Energy updates persist within run
- Historical records (cash outs, busts) are saved

### Task 6.6: Test performance requirements (50ms return costs, 200ms UI transitions)

**File**: `src/lib/delvers-descent/__tests__/performance-requirements.test.ts`

**Note**: Since UI transitions (Task 5.10) were skipped, only test calculation performance.

**What to test**:

1. Return cost calculation < 50ms
2. Safety margin calculation < 50ms
3. Risk warnings generation < 50ms
4. Cash out/bust logic < 50ms
5. Shortcut path optimization < 100ms

**Test scenarios**:

- Calculate return costs from depths 1-30 (benchmark)
- Calculate safety margins for various energy levels
- Generate risk warnings for different safety zones
- Process cash out with large inventory (100+ items)
- Calculate optimal return path with 20 shortcuts

**Key assertions**:

- All operations complete within time limits
- No operations exceed 2x the time limit
- Performance is consistent (no outliers)
- Memory usage is reasonable (< 100MB)

### Task 6.7: Test user experience flows for decision-making and risk communication

**File**: `src/lib/delvers-descent/__tests__/ux-decision-flows.test.ts`

**Note**: This tests the backend logic, not UI components (which were skipped in 5.9-5.11).

**What to test**:

1. Risk warning accuracy matches safety level
2. Cash out summaries are clear and accurate
3. Bust consequences explain XP preservation clearly
4. Safety margin calculations help decision-making
5. Encounter outcomes affect future decisions

**Test scenarios**:

- Verify risk warnings match actual safety situation
- Verify cash out summary has all required info
- Verify bust consequence emphasizes XP preservation
- Verify safety margin guides player toward cash out when appropriate
- Verify encountered choices affect future energy availability

**Key assertions**:

- Risk warnings are appropriate for energy level
- Cash out summaries are complete and accurate
- Bust consequences emphasize XP preservation
- Safety margins guide optimal decisions
- Encounter outcomes create meaningful choices

### Task 6.8: Validate all success metrics from PRD (engagement, risk balance, etc.)

**File**: `src/lib/delvers-descent/__tests__/prd-success-metrics.test.ts`

**What to test** (note: these are simulation-based, not real user metrics):

1. 85%+ engagement with push-your-luck mechanics
2. 20-30% bust rate in typical playthrough
3. Encounter variety (all types appear)
4. 70%+ informed decisions based on safety margins
5. Seamless system integration
6. Performance targets met
7. 90%+ understanding of return costs/safety margins

**Test scenarios**:

- Simulate 1000 runs with typical player behavior
- Track decision points (continue vs cash out)
- Track bust rate across runs
- Track encounter type distribution
- Track safety margin usage for decisions
- Measure system integration smoothness
- Verify calculation performance

**Key assertions** (note: these are hardcoded assertions, not real metrics):

- System supports engagement tracking (mechanisms exist)
- Bust rate can be tuned via configuration
- All encounter types are available
- Safety margin data is accessible for UI
- System components integrate seamlessly
- Performance requirements are met
- User education features exist (messages, summaries)

## Success Criteria

- [ ] Task 6.1: Complete Phase 1+2+3 integration tests exist
- [ ] Task 6.2: Return cost scenario tests cover all cases
- [ ] Task 6.3: Cash out/bust edge case tests are comprehensive
- [ ] Task 6.4: Advanced encounter integration tests verify all types
- [ ] Task 6.5: State persistence tests verify across-session persistence
- [ ] Task 6.6: Performance tests verify all requirements met
- [ ] Task 6.7: UX flow tests verify decision-making support
- [ ] Task 6.8: PRD success metrics validation tests exist
- [ ] All tests pass (`pnpm test`)
- [ ] Test coverage for Phase 3 > 80%

## Files to Create

1. `src/lib/delvers-descent/__tests__/phase123-integration.test.ts` (~300 lines)
2. `src/lib/delvers-descent/__tests__/return-cost-scenarios.test.ts` (~250 lines)
3. `src/lib/delvers-descent/__tests__/cashout-bust-edge-cases.test.ts` (~250 lines)
4. `src/lib/delvers-descent/__tests__/advanced-encounters-integration.test.ts` (~200 lines)
5. `src/lib/delvers-descent/__tests__/state-persistence-phases.test.ts` (~200 lines)
6. `src/lib/delvers-descent/__tests__/performance-requirements.test.ts` (~200 lines)
7. `src/lib/delvers-descent/__tests__/ux-decision-flows.test.ts` (~200 lines)
8. `src/lib/delvers-descent/__tests__/prd-success-metrics.test.ts` (~250 lines)

**Total**: ~1,850 lines of integration tests

## Implementation Order

1. **Tasks 6.1-6.4**: Core system integration tests (most critical)
2. **Task 6.5**: State persistence (important for gameplay)
3. **Task 6.6**: Performance requirements (ensure quality)
4. **Tasks 6.7-6.8**: UX and success metrics (validation)

## Estimated Effort

- Tasks 6.1-6.4: 3-4 hours (core integration)
- Task 6.5: 1-2 hours (state persistence)
- Task 6.6: 1-2 hours (performance)
- Tasks 6.7-6.8: 2-3 hours (UX metrics)
- Total: 7-11 hours

## Dependencies

- All Phase 1 tasks (spatial navigation)
- All Phase 2 tasks (encounter resolution)
- All Phase 3 tasks (push-your-luck mechanics)
- NOT Tasks 5.9-5.11 (skipped UI items)

## Notes

- Follow TDD approach: Write test first, then verify it fails, then fix code if needed
- Mock external dependencies (MMKV, timers)
- Use realistic game scenarios
- Focus on error cases and edge conditions
- Ensure tests are fast (< 1 second each)
