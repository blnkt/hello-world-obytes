# Game Balance Documentation

## Overview

The Delver's Descent balance system is designed to provide a challenging, engaging push-your-luck experience with strategic depth. This document explains the balance configuration, rationale behind key decisions, and how to tune the game for different experiences.

## Balance Architecture

### Centralized Configuration System

All game balance is managed through the `BalanceManager` class and `GameBalanceConfig` interface. This centralized approach ensures:

- **Consistency**: All systems use the same balance parameters
- **Testability**: Easy to run balance tests against different configurations
- **Tunability**: Adjust game difficulty without code changes
- **Presets**: Quick switching between EASY, HARD, and TESTING modes

### Key Balance Areas

1. **Energy Management**: Node costs, return costs, and energy economy
2. **Rewards**: Value of rewards and their scaling with depth
3. **Difficulty**: Risk escalation and bust rate targeting
4. **Collections**: Bonuses for completing collection sets
5. **Encounters**: Distribution and balance of different encounter types
6. **Regions**: Regional variations in difficulty and rewards

---

## Energy Balance

### Node Cost Formula

```
nodeCost = max(minCost, min(maxCost, baseCost + (depth - 1) * depthMultiplier + typeModifier))
```

**Default Values:**

- `baseCost`: 5
- `depthMultiplier`: 2
- `minCost`: 3
- `maxCost`: 30

**Rationale:**

- Depth 1: 5 energy (starting cost)
- Depth 3: 9 energy (moderate increase)
- Depth 5: 13 energy (challenging but manageable)
- Depth 7+: Capped at 30 (prevents energy costs from becoming absurd)

### Type Modifiers

Different encounter types have varying energy costs to reflect their risk/reward profile:

- **Rest Site**: -3 energy (energy recovery)
- **Trade Opportunity**: -2 energy (low cost, moderate reward)
- **Puzzle Chamber**: 0 energy (baseline)
- **Discovery Site**: +1 energy (slight premium)
- **Risk Event**: +2 energy (higher risk)
- **Hazard**: +3 energy (highest risk)

**Rationale:** This creates strategic choices. High-risk encounters cost more energy but offer better rewards. Rest sites provide energy recovery to allow deeper runs.

### Return Cost Formula

```
returnCost = baseMultiplier * depth^exponent
```

**Default Values:**

- `baseMultiplier`: 5
- `exponent`: 1.5

**Rationale:**

- Depth 1: 5 energy (easy return)
- Depth 3: ~27 energy (significant cost)
- Depth 5: ~56 energy (high cost, requires planning)
- Depth 7: ~93 energy (very expensive, push-your-luck tension)

The exponential curve creates the core push-your-luck mechanic. Each additional depth level increases return cost dramatically, forcing players to decide when to cash out.

---

## Reward Balance

### Depth Scaling

```
reward = baseReward * typeMultiplier * (1 + depth * depthScalingFactor)
```

**Default Values:**

- `depthScalingFactor`: 0.2 (20% increase per depth level)

**Rationale:** Rewards scale linearly with depth to compensate for increasing energy costs. At depth 5, rewards are 2x the base value, making deep runs financially rewarding if successful.

### Type Multipliers

- **Trade Opportunity**: 1.2x (slightly above average)
- **Discovery Site**: 1.1x (moderate reward)
- **Risk Event**: 1.5x (high reward for risk)
- **Hazard**: 0.8x (lower reward due to risk mitigation options)
- **Rest Site**: 0.5x (energy-focused, low reward)
- **Puzzle Chamber**: 1.0x (baseline)

**Rationale:** Rewards align with risk and energy cost. Players take more risk for higher rewards, creating interesting decision-making moments.

### Reward Variation

```
variation = variationBase + depth * variationDepthMultiplier
finalReward = baseReward * (1 ± variation)
```

**Default Values:**

- `variationBase`: 0.15 (±15%)
- `variationDepthMultiplier`: 0.02 (+2% per depth)

**Rationale:** Adds unpredictability without making rewards feel arbitrary. At depth 5, variation is ±25%, keeping the game exciting.

---

## Difficulty Balance

### Target Bust Rate

**Default Range:** 20-30%

**Rationale:**

- Too low (<15%): Game feels too easy, no tension
- Too high (>40%): Game feels punishing, players become risk-averse
- 20-30%: Creates meaningful risk without feeling unfair

### Safety Margins

- **Low Safety**: <10 energy above return cost (dangerous)
- **Medium Safety**: 10-50 energy above return cost (risky)
- **High Safety**: >50 energy above return cost (safe)

**Rationale:** Gives players clear feedback about their risk level. UI can warn players when safety margin is low, helping prevent accidental busts while still allowing brave players to push deeper.

### Difficulty Scaling

```
difficultyMultiplier = difficultyBaseMultiplier + depth * difficultyDepthMultiplier
```

**Default Values:**

- `difficultyBaseMultiplier`: 1.0
- `difficultyDepthMultiplier`: 0.2

**Rationale:** Encounters become 20% more difficult per depth level. At depth 5, difficulty is 2x the baseline, creating a natural difficulty curve.

---

## Collection Balance

### Set Completion Bonuses

- **Energy Bonus**: +50 energy per completed set
- **Item Bonus**: +2 bonus items per completed set

**Rationale:** Collection completion rewards are meaningful but not overpowering. A player with 5 completed sets gets +250 energy, which is roughly the energy cost of 3-4 depth-1 nodes or 1 depth-5 return.

### Legendary Items

- **Bonus Multiplier**: 1.5x (for legendary collection sets)

**Rationale:** Legendary items are rare and hard to complete, so they deserve a premium bonus. This encourages players to seek out legendary items while not making them mandatory.

---

## Encounter Distribution

### Default Distribution

- **Puzzle Chamber**: 30%
- **Trade Opportunity**: 20%
- **Discovery Site**: 15%
- **Risk Event**: 15%
- **Hazard**: 10%
- **Rest Site**: 10%

**Rationale:**

- Puzzle Chamber (30%): Most common, provides consistent rewards
- Trade & Discovery (35% combined): Moderate risk/reward encounters
- Risk Event & Hazard (25% combined): Dangerous but rewarding
- Rest Site (10%): Strategic recovery points

### Regional Variations

Different regions can override the default distribution to create thematic experiences:

- **Desolate Wastes**: More hazards, fewer rest sites
- **Ancient Ruins**: More discovery sites, more puzzle chambers
- **Twisted Depths**: More risk events, fewer safe encounters

---

## Return Cost Curve

### Exponential Scaling

The return cost uses an exponential curve: `cost = 5 * depth^1.5`

This creates:

- **Shallow Depths (1-3)**: Manageable return costs
- **Medium Depths (4-6)**: Significant return costs requiring planning
- **Deep Depths (7+)**: Very expensive returns, major push-your-luck decisions

### Shortcut System

Shortcuts reduce return costs by 70% (configurable). This:

- Makes deep runs more viable
- Rewards players who explore and unlock shortcuts
- Creates interesting decisions: push deeper with a shortcut exit, or cash out now?

---

## Balance Presets

### EASY Mode

**Use Cases:** New players, casual gameplay, accessibility

**Changes:**

- Lower base costs (4 vs 5)
- Reduced depth multiplier (1.5 vs 2)
- Lower target bust rate (15-25% vs 20-30%)
- Higher safety margins (60 vs 50)

**Effect:** Players can go deeper with less risk, more forgiving mistakes.

### HARD Mode

**Use Cases:** Experienced players, competitive runs, achievements

**Changes:**

- Higher base costs (6 vs 5)
- Increased depth multiplier (2.5 vs 2)
- Higher target bust rate (25-40% vs 20-30%)
- Lower safety margins (40 vs 50)

**Effect:** More punishing mistakes, higher risk/reward, greater satisfaction from successful deep runs.

### TESTING Mode

**Use Cases:** QA testing, development, balance verification

**Changes:**

- Very wide cost range (1-999)
- Very wide bust rate range (5-95%)

**Effect:** Allows testing edge cases and extreme scenarios.

---

## Balance Testing Framework

The balance testing framework (see `balance-framework.test.ts`) validates:

1. **Configuration Integrity**: All config values are valid
2. **Cross-System Balance**: Energy costs, rewards, and difficulty work together
3. **Preset Functionality**: Each preset behaves as intended
4. **Performance**: Balance calculations are fast enough for real-time gameplay
5. **Regional Balance**: Different regions offer similar difficulty levels

### Running Balance Tests

```bash
# Run all balance tests
pnpm test balance

# Run specific test suite
pnpm test balance-framework
```

### Interpreting Results

- **Pass**: Balance is within acceptable ranges
- **Fail**: Balance parameters may need adjustment
- **Performance**: Should complete in <200ms for 1000 calculations

---

## Tuning Guide

### Making the Game Easier

1. Reduce `energy.baseCost` (e.g., 4 instead of 5)
2. Reduce `energy.depthMultiplier` (e.g., 1.5 instead of 2)
3. Reduce `returnCost.exponent` (e.g., 1.3 instead of 1.5)
4. Increase `difficulty.safetyMarginHigh` (e.g., 60 instead of 50)
5. Reduce `difficulty.targetBustRateMax` (e.g., 0.25 instead of 0.3)

### Making the Game Harder

1. Increase `energy.baseCost` (e.g., 6 instead of 5)
2. Increase `energy.depthMultiplier` (e.g., 2.5 instead of 2)
3. Increase `returnCost.exponent` (e.g., 1.7 instead of 1.5)
4. Decrease `difficulty.safetyMarginHigh` (e.g., 40 instead of 50)
5. Increase `difficulty.targetBustRateMax` (e.g., 0.4 instead of 0.3)

### Adjusting Reward Economy

1. Increase `reward.depthScalingFactor` for better depth rewards (e.g., 0.25 instead of 0.2)
2. Modify `reward.typeMultipliers` to adjust specific encounter rewards
3. Increase `collection.setCompletionBonusEnergy` for more collection incentive (e.g., 75 instead of 50)

### Changing Encounter Frequency

Modify `encounter.encounterDistribution` percentages. Make sure they sum to 1.0 (100%).

Example: More puzzle chambers, fewer hazards:

```typescript
encounterDistribution: {
  puzzle_chamber: 0.4,    // was 0.3
  trade_opportunity: 0.2,
  discovery_site: 0.15,
  risk_event: 0.1,        // was 0.15
  hazard: 0.05,           // was 0.1
  rest_site: 0.1,
}
```

---

## Implementation Example

```typescript
import { BalanceManager } from '@/lib/delvers-descent/balance-manager';

// Use default configuration
const balanceManager = new BalanceManager();

// Load a preset
balanceManager.loadPreset('HARD');

// Custom configuration
balanceManager.updateConfig({
  energy: {
    ...balanceManager.getConfig().energy,
    baseCost: 6,
  },
  difficulty: {
    ...balanceManager.getConfig().difficulty,
    targetBustRateMax: 0.35,
  },
});

// Use in calculations
const nodeCost = balanceManager.calculateNodeCost(5, 'puzzle_chamber');
const returnCost = balanceManager.calculateReturnCost(5);
const reward = balanceManager.calculateRewardValue(20, 'puzzle_chamber', 5);
```

---

## Success Metrics

### Balanced Game Should Achieve:

1. **Bust Rate**: 20-30% of runs end in bust
2. **Average Depth**: Players average 4-6 depth levels
3. **Energy Economy**: Players feel energy-limited, not energy-starved
4. **Reward Satisfaction**: Rewards feel meaningful relative to risks
5. **Strategic Depth**: Multiple viable strategies (safe, risky, balanced)
6. **Collection Incentive**: Players motivated to collect sets
7. **Regional Balance**: No single region dominates as the "best" choice

### Monitoring Balance in Production

Track these metrics:

- Average depth per run
- Bust rate
- Energy spent vs collected
- Most common return depth
- Completion rates for encounters
- Collection completion rates
- Regional popularity

If metrics deviate from targets, adjust balance configuration accordingly.

---

## Future Considerations Remembered

Future balance changes might include:

- Seasonal events with temporary balance adjustments
- Dynamic difficulty based on player performance
- Player-driven balance via voting or feedback
- Leaderboard-specific balance presets
- Smart tutorials that adjust difficulty based on player progress

---

## References

- `src/lib/delvers-descent/balance-config.ts` - Configuration definitions
- `src/lib/delvers-descent/balance-manager.ts` - Balance management class
- `src/lib/delvers-descent/__tests__/balance-framework.test.ts` - Balance testing suite
- `src/lib/delvers-descent/__tests__/energy-balance-integration.test.ts` - Energy balance tests
- `src/lib/delvers-descent/__tests__/reward-balance-integration.test.ts` - Reward balance tests
- `src/lib/delvers-descent/__tests__/bust-rate-balancing.test.ts` - Bust rate tests
