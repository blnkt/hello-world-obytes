# Feedback System Documentation

## Overview

The Delver's Descent feedback system provides comprehensive, contextual feedback to players throughout their gameplay experience. The system consists of multiple integrated components that work together to provide clear, actionable, and helpful information.

## System Architecture

### Core Feedback Components

1. **Decision Feedback System** (`DecisionFeedbackSystem`)
2. **Risk Warning System** (`RiskWarningFeedback`)
3. **Energy Status System** (`EnergyStatusFeedback`)
4. **Encounter Outcome System** (`EncounterOutcomeFeedback`)
5. **Collection Progress System** (`CollectionProgressFeedback`)
6. **Reward Collection System** (`RewardCollectionFeedback`)
7. **Error Feedback System** (`ErrorFeedback`)
8. **Hints and Guidance System** (`HintsGuidance`)

### UI Components

- `DecisionFeedbackDisplay` - Displays decision feedback to players
- `RiskWarningDisplay` - Shows risk warnings with severity indicators
- `EnergyStatusDisplay` - Shows current energy status and safety margins
- `CollectionProgressDisplay` - Displays collection progress with visual indicators
- `RewardAnimationDisplay` - Animates reward collection

## Usage Patterns

### Decision Feedback

**Purpose**: Provides contextual feedback on player actions, especially in energy-sensitive situations.

**Usage**:

```typescript
import { DecisionFeedbackSystem } from '@/lib/delvers-descent/decision-feedback';

const feedback = new DecisionFeedbackSystem();

const result = feedback.getDecisionFeedback({
  action: 'continue',
  currentEnergy: 60,
  totalEnergy: 100,
  estimatedCost: 20,
});

console.log(result.type); // 'positive' | 'warning' | 'danger'
console.log(result.message); // User-friendly message
```

**Feedback Types**:

- `positive`: Safe to proceed with good energy margin
- `warning`: Proceeding is risky, caution recommended
- `danger`: Proceeding is dangerous, retreat recommended

### Risk Warning System

**Purpose**: Generates risk warnings for dangerous decisions, integrating with decision feedback.

**Usage**:

```typescript
import { RiskWarningFeedback } from '@/lib/delvers-descent/risk-warning-feedback';
import { DecisionFeedbackSystem } from '@/lib/delvers-descent/decision-feedback';

const decisionFeedback = new DecisionFeedbackSystem();
const riskWarning = new RiskWarningFeedback(decisionFeedback);

const warning = riskWarning.getRiskWarning({
  currentEnergy: 30,
  returnCost: 25,
  totalEnergy: 100,
});

if (warning.shouldShow) {
  console.log(warning.message);
  console.log(warning.urgency); // 0-100
}
```

**When to Show**:

- Energy levels are low (below 30%)
- Safety margin is minimal (less than 10 energy)
- Return journey would be difficult

### Energy Status System

**Purpose**: Provides detailed energy status information with safety margin calculations.

**Usage**:

```typescript
import { EnergyStatusFeedback } from '@/lib/delvers-descent/energy-status-feedback';

const energyStatus = new EnergyStatusFeedback();

const status = energyStatus.generateEnergyStatus({
  currentEnergy: 50,
  totalEnergy: 100,
  estimatedCost: 15,
  returnCost: 20,
});

console.log(status.status); // 'healthy' | 'low' | 'critical'
console.log(status.safetyMargin); // Calculated safety margin
console.log(status.recommendation); // 'safe_to_continue' | 'consider_retreating'
console.log(status.canContinue); // boolean
```

**Status Levels**:

- **Healthy**: Energy > 70%, safety margin > 10%
- **Low**: Energy 30-70%, safety margin 5-10%
- **Critical**: Energy < 30% or safety margin < 5%

### Encounter Outcome Feedback

**Purpose**: Provides feedback for successful and failed encounters.

**Usage**:

```typescript
import { EncounterOutcomeFeedback } from '@/lib/delvers-descent/encounter-outcome-feedback';

const feedback = new EncounterOutcomeFeedback();

// Success feedback
const success = feedback.generateSuccessFeedback({
  rewards: [{ type: 'energy', amount: 100, description: '100 energy' }],
  itemsGained: [{ id: 'item1', name: 'Treasure', value: 50 }],
  energyUsed: 15,
});

// Failure feedback
const failure = feedback.generateFailureFeedback({
  failureType: 'energy_exhausted',
  energyLost: 20,
  itemsLost: [],
});
```

### Collection Progress Feedback

**Purpose**: Tracks and displays collection progress with completion indicators.

**Usage**:

```typescript
import { CollectionProgressFeedback } from '@/lib/delvers-descent/collection-progress-feedback';

const feedback = new CollectionProgressFeedback();

const summary = feedback.generateProgressSummary({
  totalItems: 100,
  collectedItems: 45,
  completedSets: 3,
  totalSets: 10,
  recentGain: 'Rare Artifact',
});

console.log(summary.completionPercentage); // 45%
console.log(summary.isNearComplete); // false
console.log(summary.isJustStarting); // false
```

### Reward Collection Feedback

**Purpose**: Generates animations and feedback for reward collection.

**Usage**:

```typescript
import { RewardCollectionFeedback } from '@/lib/delvers-descent/reward-collection-feedback';

const feedback = new RewardCollectionFeedback();

// Generate animation for a reward
const animation = feedback.generateRewardAnimation({
  rewardType: 'item',
  itemName: 'Legendary Artifact',
  rarity: 'legendary',
});

console.log(animation.animationType); // 'bounce' | 'glow' | 'pulse'
console.log(animation.icon); // '💎'
console.log(animation.color); // '#purple'
```

**Animation Types by Rarity**:

- **Common**: Bounce animation, gray color
- **Rare**: Glow animation, cyan/blue color
- **Epic**: Glow animation, blue color
- **Legendary**: Pulse animation, purple color

### Error Feedback System

**Purpose**: Provides user-friendly error messages with recovery suggestions.

**Usage**:

```typescript
import { ErrorFeedback } from '@/lib/delvers-descent/error-feedback';

const feedback = new ErrorFeedback();

const errorFeedback = feedback.generateErrorFeedback({
  errorType: 'network',
  message: 'Connection failed',
});

console.log(errorFeedback.userMessage); // User-friendly message
console.log(errorFeedback.recoverySteps); // Array of recovery steps
console.log(errorFeedback.fallbackOptions); // Fallback options
```

**Error Types**:

- `network`: Connection issues
- `validation`: Input validation errors
- `system`: System-level errors
- `unknown`: Unexpected errors

### Hints and Guidance System

**Purpose**: Provides contextual hints and guidance based on game state.

**Usage**:

```typescript
import { HintsGuidance } from '@/lib/delvers-descent/hints-guidance';

const guidance = new HintsGuidance();

// Get contextual hint
const hint = guidance.getContextualHint({
  context: 'low_energy',
  energyLevel: 25,
  depth: 3,
});

console.log(hint.hint);
console.log(hint.relevance); // 0-1 scale

// Get guidance message
const guidanceMsg = guidance.getGuidanceMessage({
  context: 'tutorial',
  playerLevel: 1,
});

console.log(guidanceMsg.message);
console.log(guidanceMsg.category); // 'beginner' | 'intermediate' | 'advanced'
```

**Guidance Contexts**:

- `low_energy`: Energy is running low
- `deep_dive`: Player is at significant depth
- `collection`: Focus on collection
- `critical`: Critical situation
- `tutorial`: Tutorial/onboarding
- `advanced`: Advanced strategies
- `risk_assessment`: Decision making

## Integration Patterns

### Typical Feedback Flow

1. **Player Action**: Player attempts to proceed to next node
2. **Decision Feedback**: Check if action is safe
3. **Risk Warning**: If risky, show warning
4. **Energy Status**: Display current energy status
5. **Recommendation**: Provide recommendation based on safety

Example integration:

```typescript
// Player wants to continue
const decision = decisionFeedback.getDecisionFeedback({
  /* ... */
});
const energyStatus = energyStatusFeedback.generateEnergyStatus({
  /* ... */
});
const warning = riskWarning.getRiskWarning({
  /* ... */
});

// Display appropriate feedback
if (decision.type === 'danger' || warning.shouldShow) {
  // Show risk warning
  showRiskWarning(warning);
}

// Show energy status
showEnergyStatus(energyStatus);

// Provide recommendation
showRecommendation(energyStatus.recommendation);
```

### Encounter Feedback Flow

1. **Encounter Resolution**: Resolve encounter
2. **Generate Outcome**: Determine success/failure
3. **Show Result**: Display outcome feedback
4. **Animate Reward**: If successful, animate reward collection
5. **Update Progress**: Update collection progress

### Collection Feedback Flow

1. **Item Collected**: Player collects an item
2. **Update Progress**: Update collection statistics
3. **Generate Animation**: Create reward animation
4. **Show Progress**: Display progress update
5. **Check Completion**: Check if set is complete

## UI Component Usage

### Displaying Decision Feedback

```typescript
import { DecisionFeedbackDisplay } from '@/components/delvers-descent/feedback';

function MyComponent() {
  const feedback = /* ... get feedback ... */;

  return (
    <DecisionFeedbackDisplay feedback={feedback} />
  );
}
```

### Displaying Risk Warnings

```typescript
import { RiskWarningDisplay } from '@/components/delvers-descent/feedback';

function MyComponent() {
  const warning = /* ... get warning ... */;

  return (
    {warning.shouldShow && (
      <RiskWarningDisplay warning={warning} />
    )}
  );
}
```

### Displaying Energy Status

```typescript
import { EnergyStatusDisplay } from '@/components/delvers-descent/feedback';

function MyComponent() {
  const status = /* ... get energy status ... */;

  return (
    <EnergyStatusDisplay status={status} />
  );
}
```

### Displaying Collection Progress

```typescript
import { CollectionProgressDisplay } from '@/components/delvers-descent/feedback';

function MyComponent() {
  const summary = /* ... get collection summary ... */;

  return (
    <CollectionProgressDisplay summary={summary} />
  );
}
```

### Displaying Reward Animations

```typescript
import { RewardAnimationDisplay } from '@/components/delvers-descent/feedback';

function MyComponent() {
  const animation = /* ... get animation data ... */;

  return (
    <RewardAnimationDisplay animation={animation} />
  );
}
```

## Best Practices

### 1. Consistent Feedback Timing

- Provide feedback immediately after player actions
- Don't delay feedback unnecessarily
- Show critical warnings immediately

### 2. Clear and Actionable Messages

- Use plain language
- Avoid technical jargon
- Provide specific recommendations
- Include recovery options for errors

### 3. Progressive Disclosure

- Start with essential information
- Provide details on demand
- Don't overwhelm players with too much feedback at once

### 4. Visual Hierarchy

- Use color coding for severity (green/yellow/red)
- Make critical warnings stand out
- Use appropriate animations for different contexts

### 5. Context-Aware Feedback

- Adapt feedback to player level
- Provide relevant hints based on game state
- Customize messages for different situations

## Testing

All feedback systems include comprehensive test coverage:

- Unit tests for individual systems
- Integration tests for system interaction
- UI component tests for visual feedback
- End-to-end tests for complete feedback flows

Run tests:

```bash
pnpm test feedback
```

## Performance Considerations

- Feedback calculations are optimized for <50ms response time
- UI components use efficient rendering patterns
- Animations use hardware acceleration when available
- Feedback is cached when appropriate

## Accessibility

- All feedback is screen reader friendly
- Color is not the only indicator (icons, text)
- Feedback messages are readable and clear
- Actions are keyboard accessible

## Future Enhancements

- Customizable feedback preferences
- Player-controlled feedback frequency
- Personalized guidance based on play style
- Advanced analytics integration
