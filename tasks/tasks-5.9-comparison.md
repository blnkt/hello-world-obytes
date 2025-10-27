# Task 5.9: Hook API Comparison

## Current Pattern in Codebase

Looking at `use-encounter-resolver.tsx` and `risk-event-screen.tsx`:

```typescript
// Pattern: Components receive manager instances and props, use manager methods directly
export const RiskEventScreen = ({ encounter, onComplete, onReturn }) => {
  const [state, setState] = useState(encounter.getState());

  const handleSelectChoice = (choiceId: string) => {
    encounter.selectChoice(choiceId); // Direct manager call
    setState(encounter.getState()); // Direct manager call
  };

  const handleResolve = () => {
    const result = encounter.resolve(); // Direct manager call
    setOutcome(result);
  };

  // Component gets props and manages its own state
};
```

## Approach 1: Minimal Hook (Expose Managers)

**Philosophy**: Hook provides instantiated managers, components call them directly

**Code Example**:

```typescript
// src/components/delvers-descent/hooks/use-push-your-luck.tsx
export const usePushYourLuck = (props: {
  currentEnergy: number;
  currentDepth: number;
}) => {
  const returnCostCalculator = useState(() => new ReturnCostCalculator())[0];
  const safetyMarginManager = useState(() =>
    new SafetyMarginManager(returnCostCalculator)
  )[0];
  const cashOutManager = useState(() => new CashOutManager())[0];

  // Simple computed values
  const returnCost = useMemo(
    () => returnCostCalculator.calculateCumulativeReturnCost(props.currentDepth),
    [props.currentDepth]
  );

  return {
    // Computed values
    returnCost,

    // Raw managers (let components call methods)
    returnCostCalculator,
    safetyMarginManager,
    cashOutManager,
  };
};

// Usage in component:
function MyComponent({ currentEnergy, currentDepth }) {
  const hook = usePushYourLuck({ currentEnergy, currentDepth });

  // Component calculates what it needs
  const safetyMargin = hook.safetyMarginManager.calculateSafetyMargin(
    currentEnergy,
    hook.returnCost,
    currentDepth
  );

  const riskWarnings = hook.safetyMarginManager.getRiskWarnings(
    currentEnergy,
    hook.returnCost,
    currentDepth
  );

  return (
    <div>
      Return Cost: {hook.returnCost}
      Safety Margin: {safetyMargin.remainingEnergy}
    </div>
  );
}
```

**Pros**:

- ✅ Matches existing codebase pattern (`use-encounter-resolver` exposes resolver)
- ✅ Components have full flexibility to call any manager method
- ✅ No "magic" - everything is explicit and visible
- ✅ Easy to test (components call managers, can mock managers)
- ✅ Less code in hook, less to maintain

**Cons**:

- ❌ Components need to understand manager APIs
- ❌ Some boilerplate in components (repeated parameter passing)
- ❌ More TypeScript spread across components

## Approach 2: Full-Featured Hook (Wrap Manager Logic)

**Philosophy**: Hook calculates everything, components just consume computed values

**Code Example**:

```typescript
// src/components/delvers-descent/hooks/use-push-your-luck.tsx
export const usePushYourLuck = (props: {
  currentEnergy: number;
  currentDepth: number;
}) => {
  const returnCostCalculator = useState(() => new ReturnCostCalculator())[0];
  const safetyMarginManager = useState(() =>
    new SafetyMarginManager(returnCostCalculator)
  )[0];
  const cashOutManager = useState(() => new CashOutManager())[0];

  // Hook does ALL calculations
  const returnCost = useMemo(
    () => returnCostCalculator.calculateCumulativeReturnCost(props.currentDepth),
    [props.currentDepth]
  );

  const safetyMargin = useMemo(
    () => safetyMarginManager.calculateSafetyMargin(
      props.currentEnergy,
      returnCost,
      props.currentDepth
    ),
    [props.currentEnergy, returnCost, props.currentDepth]
  );

  const riskWarnings = useMemo(
    () => safetyMarginManager.getRiskWarnings(
      props.currentEnergy,
      returnCost,
      props.currentDepth
    ),
    [props.currentEnergy, returnCost, props.currentDepth]
  );

  const getRiskLevel = useCallback(() => {
    if (safetyMargin.safetyPercentage >= 50) return 'safe';
    if (safetyMargin.safetyPercentage >= 30) return 'caution';
    if (safetyMargin.safetyPercentage >= 10) return 'danger';
    return 'critical';
  }, [safetyMargin]);

  return {
    // All computed values ready to use
    returnCost,
    safetyMargin,
    riskWarnings,

    // Convenience methods
    getRiskLevel,

    // Managers still exposed if needed
    managers: {
      returnCostCalculator,
      safetyMarginManager,
      cashOutManager,
    },
  };
};

// Usage in component:
function MyComponent({ currentEnergy, currentDepth }) {
  const hook = usePushYourLuck({ currentEnergy, currentDepth });

  // Just use pre-computed values!
  return (
    <div>
      Return Cost: {hook.returnCost}
      Safety Margin: {hook.safetyMargin.remainingEnergy}
      Risk Level: {hook.getRiskLevel()}
    </div>
  );
}
```

**Pros**:

- ✅ Simpler component code (less boilerplate)
- ✅ Consistent API (hook always returns same structure)
- ✅ All calculations cached with useMemo automatically
- ✅ Easier to use for new developers

**Cons**:

- ❌ Extra abstraction layer (need to maintain hook + managers)
- ❌ Less flexible (if component needs different calculation, hard to override)
- ❌ More complex hook (more code to maintain)
- ❌ Harder to test (have to test hook + managers)

## Real Example: How Your Components Currently Work

Looking at `risk-event-screen.tsx`:

```typescript
export const RiskEventScreen = ({ encounter, onComplete, onReturn }) => {
  const [state, setState] = useState(encounter.getState());
  const [outcome, setOutcome] = useState(null);

  const handleSelectChoice = (choiceId: string) => {
    encounter.selectChoice(choiceId); // Direct manager call
    setState(encounter.getState());
  };

  const handleResolve = () => {
    const result = encounter.resolve(); // Direct manager call
    setOutcome(result);
    setState(encounter.getState());
  };
};
```

This matches **Approach 1**: Components use managers directly.

But looking at `return-cost-display.tsx`:

```typescript
export const ReturnCostDisplay = ({
  currentEnergy,
  returnCost,
  currentDepth,
}) => {
  // Component receives PRE-CALCULATED props
  const safetyMargin = currentEnergy - returnCost; // Simple calculation
  const safetyPercentage = (safetyMargin / currentEnergy) * 100;

  // Component does its own calculations
};
```

This suggests **Approach 2** might be better for display components!

## Recommendation

**Hybrid Approach**: Start with Approach 1 (expose managers), but provide convenience computed values that components commonly need:

```typescript
export const usePushYourLuck = (props) => {
  const managers = {
    returnCostCalculator: useState(() => new ReturnCostCalculator())[0],
    safetyMarginManager: useState(() => new SafetyMarginManager())[0],
    cashOutManager: useState(() => new CashOutManager())[0],
  };

  // Calculate commonly-needed values
  const returnCost = useMemo(
    () =>
      managers.returnCostCalculator.calculateCumulativeReturnCost(
        props.currentDepth
      ),
    [props.currentDepth]
  );

  // But also expose managers for flexibility
  return {
    // Convenience values
    returnCost,

    // Managers for anything else
    ...managers,
  };
};
```

This gives you:

- ✅ Simple API for common cases (`hook.returnCost`)
- ✅ Full flexibility for edge cases (`hook.returnCostCalculator.calculateOptimalReturnCost(...)`)
- ✅ Matches existing codebase patterns
