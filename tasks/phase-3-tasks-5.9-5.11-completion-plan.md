# Phase 3 Tasks 5.9-5.11 Completion Plan

## Overview

Complete the remaining UI integration tasks (5.9-5.11) for Phase 3: Push-Your-Luck Mechanics & Advanced Encounters. This involves creating a React hook that properly integrates all push-your-luck managers, implementing smooth transitions, and comprehensive testing.

## Context

The UI components (Tasks 5.1-5.8) are complete but isolated. They need:

1. A unified React hook to integrate ReturnCostCalculator, SafetyMarginManager, and CashOutManager
2. Smooth transitions between UI states
3. Comprehensive unit tests

**Key Challenge**: The previous attempt at Task 5.9 failed due to API mismatches between the hook and the underlying managers.

## Detailed Implementation Plan

### Task 5.9: Create usePushYourLuck React Hook

**File**: `src/components/delvers-descent/hooks/use-push-your-luck.tsx`

**Problem Analysis**:

- CashOutManager methods like `processCashOut()` and `processBust()` don't exist
- SafetyMarginManager's `getRiskWarnings()` requires 3 parameters (currentEnergy, returnCost, currentDepth)
- Need to properly expose manager instances and computed values

**Solution**:

1. **Create a HYBRID hook that provides convenience + flexibility**:
   - Initialize ReturnCostCalculator, SafetyMarginManager once
   - Cache commonly-needed returnCost using useMemo
   - Expose raw manager instances for full flexibility
   - Provide convenience getters (getSafetyMargin, getRiskWarnings, getRiskLevel)
   - Let components call managers directly when they need custom logic

2. **Key exports (Hybrid Approach)**:

   ```typescript
   interface UsePushYourLuckReturn {
     // Cached convenience value (most common)
     returnCost: number;

     // Manager instances (for flexibility)
     returnCostCalculator: ReturnCostCalculator;
     safetyMarginManager: SafetyMarginManager;
     cashOutManager: CashOutManager;

     // Convenience getters (compute on-demand)
     getSafetyMargin: (currentEnergy: number, depth: number) => SafetyMargin;
     getRiskWarnings: (currentEnergy: number, depth: number) => RiskWarning[];
     getRiskLevel: (
       currentEnergy: number,
       depth: number
     ) => 'safe' | 'caution' | 'danger' | 'critical';
   }
   ```

   **Why Hybrid?**
   - Matches existing codebase pattern (see `use-encounter-resolver` and `risk-event-screen.tsx`)
   - Simple API for common cases: `hook.returnCost`
   - Full flexibility for edge cases: `hook.safetyMarginManager.calculateSafetyMargin(...)`
   - Components can choose between convenience or direct manager calls

3. **Dependencies**:
   - Import from `@/lib/delvers-descent/return-cost-calculator`
   - Import from `@/lib/delvers-descent/safety-margin-manager`
   - Import from `@/lib/delvers-descent/cash-out-manager`
   - Use `useMemo` for returnCost (expensive calculation)
   - Use `useCallback` for convenience getters (don't cache, compute on-demand)

**Implementation Steps**:

- Create hook with hybrid interface (cached returnCost + raw managers)
- Initialize managers using useState with lazy initialization
- Cache returnCost using useMemo (most common calculation)
- Export convenience getters using useCallback (compute on-demand, not cached)
- Expose raw managers for full flexibility
- Handle edge cases (zero energy, negative depth)

### Task 5.10: Add Smooth Transitions

**Approach**: Minimal CSS transitions for existing components

**Files to modify**:

1. `src/components/delvers-descent/push-your-luck/return-cost-display.tsx`
   - Add transition classes to safety indicator bar
   - Animate color changes on safety level transitions

2. `src/components/delvers-descent/push-your-luck/risk-warning-modal.tsx`
   - Add fade-in animation for modal appearance
   - Add slide-up animation for modal content

3. `src/components/delvers-descent/push-your-luck/cash-out-screen.tsx`
   - Add fade-in for reward summary
   - Add stagger animation for item lists

4. `src/components/delvers-descent/push-your-luck/bust-screen.tsx`
   - Add fade-in for consequence display
   - Add emphasis animation for XP preservation message

**Implementation**:

- Use Tailwind's `transition-*` utilities
- Add `animate-*` classes for entrance animations
- Keep animations subtle (200-300ms duration)
- No new dependencies required

### Task 5.11: Add Comprehensive Unit Tests

**Test files to create**:

1. **Hook test**: `src/components/delvers-descent/hooks/use-push-your-luck.test.tsx`
   - Test manager initialization
   - Test derived value calculations
   - Test convenience methods
   - Test edge cases (zero energy, max depth)
   - Test memoization behavior

2. **Component tests** (add to existing test files):
   - `safety-margin-indicator.test.tsx` - Create if missing
   - `risk-warning-modal.test.tsx` - Create if missing
   - Update `return-cost-display.test.tsx` with transition tests
   - Update `cash-out-screen.test.tsx` with animation tests
   - Update `bust-screen.test.tsx` with animation tests

3. **Integration test**: `src/lib/delvers-descent/__tests__/phase3-ui-integration.test.ts`
   - Test hook + component integration
   - Test state flow between components
   - Test error handling
   - Test performance (calculations < 50ms)

**Testing approach**:

- Use React Testing Library
- Mock manager instances where appropriate
- Test user interactions (clicks, state changes)
- Verify accessibility attributes
- Test responsive behavior

## Success Criteria

- [ ] Task 5.9: usePushYourLuck hook exports all required values and methods
- [ ] Task 5.9: Hook properly integrates with all three managers
- [ ] Task 5.9: Hook tests achieve 90%+ coverage
- [ ] Task 5.10: All UI components have smooth transitions
- [ ] Task 5.10: Transitions are consistent and subtle (200-300ms)
- [ ] Task 5.11: All components have comprehensive unit tests
- [ ] Task 5.11: Integration tests validate end-to-end flows
- [ ] All tests pass (`pnpm test`)
- [ ] No linting errors (`pnpm lint`)
- [ ] TypeScript compilation succeeds

## Files to Create

1. `src/components/delvers-descent/hooks/use-push-your-luck.tsx` (~150 lines)
2. `src/components/delvers-descent/hooks/use-push-your-luck.test.tsx` (~200 lines)
3. `src/components/delvers-descent/push-your-luck/safety-margin-indicator.test.tsx` (~150 lines)
4. `src/components/delvers-descent/push-your-luck/risk-warning-modal.test.tsx` (~150 lines)
5. `src/lib/delvers-descent/__tests__/phase3-ui-integration.test.ts` (~250 lines)
6. `tasks/plan-phase3-tasks-5.9-5.11.md` (this plan document)

## Files to Modify

1. `src/components/delvers-descent/push-your-luck/return-cost-display.tsx` - Add transitions
2. `src/components/delvers-descent/push-your-luck/risk-warning-modal.tsx` - Add animations
3. `src/components/delvers-descent/push-your-luck/cash-out-screen.tsx` - Add animations
4. `src/components/delvers-descent/push-your-luck/bust-screen.tsx` - Add animations
5. `tasks/tasks-prd-delvers-descent-phase3.md` - Mark tasks complete

## Implementation Order

1. **Task 5.9**: Create usePushYourLuck hook (TDD approach with Hybrid pattern)
   - Write failing tests first (test hybrid return type)
   - Implement hook with returnCost cache + exposed managers
   - Add convenience getters with useCallback
   - Refactor for optimization

2. **Task 5.10**: Add transitions to components
   - Start with ReturnCostDisplay
   - Add to modal components
   - Test visual consistency

3. **Task 5.11**: Complete test coverage
   - Create missing test files
   - Add integration tests
   - Verify coverage targets

## Estimated Effort

- Task 5.9: 2-3 hours (hook + tests)
- Task 5.10: 1 hour (CSS transitions)
- Task 5.11: 2-3 hours (comprehensive tests)
- Total: 5-7 hours

## Risks & Mitigations

**Risk**: Hook API still doesn't match component expectations

**Mitigation**: Start with minimal hook, expand based on actual component usage

**Risk**: Animations cause performance issues

**Mitigation**: Use CSS transitions only, avoid JavaScript animations

**Risk**: Test coverage is insufficient

**Mitigation**: Follow TDD approach, write tests first
