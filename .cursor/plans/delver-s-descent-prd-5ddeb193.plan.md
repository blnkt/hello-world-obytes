<!-- 5ddeb193-ae2b-458a-9365-4a76638b3619 13ea048f-1f54-4063-be73-de262017f4ee -->

# PRD: Delver's Descent - Spatial Push-Your-Luck Dungeon Crawler

## Overview

Transform the existing dungeon game into "Delver's Descent", a spatial navigation roguelike where players explore an ever-deepening dungeon using energy derived from their real-world daily steps. The core mechanic revolves around push-your-luck gameplay with spatial depth management and the critical tension of managing return journey energy costs.

## Key Design Principles from Game Design Conversation

**Core Mechanic**: Real-world steps serve as both permanent XP progression AND spendable energy for runs

- Steps are double-counted: contribute to character XP (permanent) + energy pool (consumable per run)
- Each real-world day generates ONE run with energy proportional to steps taken that day
- Players navigate a spatial dungeon map, descending through depth levels with branching paths
- Must manage energy for both descent AND return to surface (core tension)
- Push-your-luck: go deeper for better rewards vs. cash out safely

**From Conversation**: "Instead of sequential encounters, you navigate a 2D map going DEEPER. The deeper you go, the better the rewards, but getting back out costs energy too."

## PRD Structure

### 1. Game Systems Architecture

**Daily Runs System**

- Each day's steps generate one queued run with energy = steps from that specific day
- Multiple days without playing = multiple runs queued (e.g., 5 days missed = 5 runs available)
- Streak bonuses: Meeting daily step goals (10,000 steps) adds +20% bonus energy to that run
- Each run maintains its own energy level based on the day's activity

**Energy Economy Redesign**

- Remove existing "100 steps = 1 turn" system
- New model: 1 step = 1 energy unit for that day's run
- Energy costs: - Moving to a node: 5-25 energy depending on depth and path difficulty - Engaging encounters: 10-50 energy depending on type - Return journey: Cumulative cost based on descent path (deeper = more expensive)
- Example: 8,000 step day = 80 energy for that run (96 with streak bonus)

**Spatial Navigation Structure**

- Vertical depth-based progression (Surface → Depth 1 → Depth 2 → etc.)
- Each depth level offers 2-3 node choices (limited lookahead, 1-2 depths visible)
- No hard limit on maximum depth (theoretically infinite, but energy constrains)
- Each node has: type, energy cost to reach, potential encounters/rewards
- Return journey required: must spend energy to return to surface or find shortcuts

### 2. Encounter System

**Encounter Types** (existing grid dungeon becomes one type):

**a) Puzzle Chamber (existing grid dungeon game)**

- Grid-based tile reveal puzzle
- Energy cost: 15-30 to enter
- Rewards: Collection items, currency, shortcuts
- Risk: Can spend extra energy trying to solve, or abandon early

**b) Trade Opportunity**

- Simple decision: buy/sell/trade resources
- Energy cost: 5-10 to engage
- Rewards: Trade goods for collection sets, profit from arbitrage
- Risk: Low, mostly strategic choices

**c) Discovery Site**

- Exploration encounter with branching choices
- Energy cost: 10-25 to explore
- Rewards: Regional discoveries, lore fragments, map pieces
- Risk: Medium, some choices have consequences

**d) Risk Event**

- High-stakes gamble or challenge
- Energy cost: 15-40 to attempt
- Rewards: Legendary treasures, rare collection items
- Risk: High, probability-based outcomes (could lose energy, items, or force retreat)

**e) Hazard**

- Obstacles that must be overcome or avoided
- Energy cost: Variable (pay toll, find alternate route, gamble)
- Rewards: None directly, but avoiding them saves energy
- Risk: Failure conditions can trigger bust or force retreat

**f) Rest Site** (rare)

- Safe haven for making decisions
- Energy cost: Free or minimal
- Rewards: Minor energy recovery, intel on deeper paths, temporary buffs
- Risk: None

### 3. Push-Your-Luck Mechanics

**Descent Phase**

- Survey available nodes at current depth
- Choose path: which node to visit (each costs energy)
- Resolve encounter at node
- Calculate: Current energy - descent costs - estimated return cost = safety margin
- Decision: Continue deeper OR return to surface

**Return Phase** (critical mechanic)

- Return journey retraces path upward (or takes shortcuts if found)
- Return costs scale with depth: deeper = exponentially more expensive
- Example costs: - Depth 1 → Surface: 5 energy - Depth 2 → Surface: 20 energy (5 + 15) - Depth 3 → Surface: 45 energy (5 + 15 + 25) - Depth 4 → Surface: 85 energy (5 + 15 + 25 + 40)
- Shortcuts can dramatically reduce return costs (key strategic element)

**Point of No Return**

- Going too deep without sufficient return energy = commitment
- Must find alternative escape (shortcuts, risky gambles, or bust)
- Creates dramatic "I'm in too deep" moments

**Bust Conditions**

- Run out of energy before returning to surface = BUST
- Lose ALL rewards collected during that run
- Still gain XP from the steps (permanent progression preserved)
- No penalty to future runs (each run is independent)

**Cash Out (Safe Return)**

- Successfully return to surface with remaining energy
- Bank ALL collected rewards permanently
- Add items to collection, unlock progression
- Run ends successfully

### 4. Collection & Progression Systems

**Collection System** (Mixed approach from conversation)

**Trade Goods Sets** (5-7 items per set)

- Example: Silk Road Set (spices, textiles, jade, porcelain, incense)
- Completion bonus: +10% energy efficiency on future runs
- Found in: Trade Opportunity encounters

**Regional Discoveries** (Location/lore based)

- Example: Ancient Temple Set (maps, relics, inscriptions, artifacts)
- Completion bonus: Unlock new starting regions or shortcuts
- Found in: Discovery Site encounters

**Legendary Treasures** (Rare, high-value)

- Example: Dragon's Hoard items (crown, scepter, gems)
- Completion bonus: Permanent powerful abilities (extra starting energy, better odds)
- Found in: Risk Event encounters, deep depths

**Permanent Progression**

- Character XP: All steps count toward level progression (existing system)
- Collection Bonuses: Completed sets grant permanent abilities
- Region Unlocks: Discover new starting regions with different encounter tables
- Shortcuts Discovered: Permanent shortcuts memorized for future runs
- Achievements: Milestones (depth records, perfect runs, streak bonuses)

### 5. Integration with Existing Systems

**HealthKit Integration**

- Daily step count from HealthKit → energy for that day's run
- Streak tracking: 10,000+ step days = +20% energy bonus for that run
- No change to existing step tracking or XP accumulation

**Character System**

- Steps still accumulate as XP (existing system unchanged)
- Character level based on cumulative steps (existing FITNESS_LEVELS)
- Character progression unlocks starting bonuses for runs

**Currency System Replacement**

- Remove: "100 steps = 1 turn" currency system
- Replace with: Daily run energy pools (steps from specific day)
- Maintain: useCurrencySystem hook interface but change internal logic
- Each run is self-contained with its own energy budget

**Existing Dungeon Game**

- Repurpose grid-based dungeon as "Puzzle Chamber" encounter type
- Adjust energy costs: entering chamber + energy per tile reveal
- Adapt win/loss conditions to fit within larger run context
- Maintain existing puzzle logic, tile types, and mechanics

### 6. User Experience Flow

**Opening App After 3 Days Away**

```
Home Screen → Delver's Descent
  ↓
See 3 Queued Runs:
  - Run 1: 6,000 steps → 60 energy
  - Run 2: 12,000 steps → 120 energy ⭐ (streak bonus +24 = 144 total)
  - Run 3: 8,500 steps → 85 energy
  ↓
Select Run 2 (144 energy)
  ↓
Choose Starting Region: "Forest Depths" (others locked)
  ↓
View Collection Progress: 15/200 items, Silk Road Set 2/5
```

**During Run - Spatial Navigation**

```
SURFACE [144 energy]
View 3 starting nodes:
  - Node A [Trade Post] - 5 energy
  - Node B [Puzzle Chamber] - 15 energy
  - Node C [Hazard] - 5 energy, but legendary visible beyond
  ↓
Choose Node B (Puzzle Chamber)
  ↓
[139 energy] Puzzle Chamber encounter
  - Engage grid dungeon (spend 20 energy solving)
  - Collect: 2 trade goods + 15 gold
  ↓
[119 energy] Now at Depth 1
Return cost to surface: 5 energy
View nodes at Depth 2:
  - Node D [Discovery Site] - 12 energy
  - Node E [Risk Event] - 20 energy, legendary item possible
  ↓
Decision: Continue to E or Cash Out?
Continue to E
  ↓
[99 energy] Risk Event at Depth 2
Return cost to surface: 20 energy (5 + 15)
  - Gamble for legendary? 50% success rate
  - Success! +Legendary Crown
  ↓
[99 energy, carrying: 2 goods, 15 gold, 1 legendary]
View Depth 3 nodes... return cost now 45 energy
  ↓
DECISION: Cash out (safe, keep rewards) or push deeper?
  - Remaining energy: 99
  - Return cost: 45
  - Safety margin: 54 energy
  ↓
CASH OUT - Return to Surface (costs 45 energy)
  ↓
Victory! Rewards banked permanently:
  - 2 trade goods (Silk Road Set now 4/5!)
  - 15 gold
  - Legendary Crown
  - +6000 XP (from steps, was always safe)
  ↓
Back to Run Selection (2 runs remaining)
```

### 7. Technical Implementation Details

**Data Models**

New types needed:

```typescript
interface DelvingRun {
  id: string;
  date: string;
  steps: number;
  baseEnergy: number;
  bonusEnergy: number;
  totalEnergy: number;
  hasStreakBonus: boolean;
  status: 'queued' | 'active' | 'completed' | 'busted';
}

interface DungeonNode {
  id: string;
  depth: number;
  position: number; // 0-2 for left/center/right
  type: EncounterType;
  energyCost: number;
  returnCost: number; // Cumulative cost to return to surface
  isRevealed: boolean;
  connections: string[]; // IDs of deeper nodes
  encounter?: EncounterData;
}

interface RunState {
  runId: string;
  currentDepth: number;
  currentNode: string;
  energyRemaining: number;
  inventory: CollectedItem[];
  visitedNodes: string[];
  discoveredShortcuts: Shortcut[];
}

interface CollectedItem {
  id: string;
  type: 'trade_good' | 'discovery' | 'legendary';
  setId: string;
  value: number;
}
```

**Algorithm: Generate Dungeon Map**

```
For each depth level (0 to theoretical max):
  - Generate 2-3 nodes using Fisher-Yates shuffle of encounter types
  - Assign energy costs scaled by depth
  - Calculate cumulative return costs
  - Create connections to next depth (branching paths)
  - Add shortcuts randomly (5-10% chance per depth)
```

**Algorithm: Return Cost Calculation**

```
function calculateReturnCost(currentDepth, visitedPath):
  cost = 0
  for each depth level from current to surface:
    baseCost = 5 * (depth ^ 1.5) // Exponential scaling
    if hasShortcut(depth):
      baseCost = baseCost * 0.3 // Shortcuts reduce cost dramatically
    cost += baseCost
  return cost
```

**Component Architecture**

```
DelvingRunScreen (container)
  ├── RunSelectionView (choose which queued run to play)
  ├── DungeonMapView (spatial navigation interface)
  │   ├── DepthLevelRow (shows nodes at each depth)
  │   ├── NodeCard (individual node with type, cost, status)
  │   └── PathConnections (visual links between nodes)
  ├── EnergyDisplay (current energy, return cost indicator)
  ├── EncounterModal (handles different encounter types)
  │   ├── PuzzleChamber (reused existing dungeon grid)
  │   ├── TradeOpportunity
  │   ├── DiscoverySite
  │   ├── RiskEvent
  │   └── HazardChallenge
  ├── InventoryPanel (shows collected items during run)
  ├── CashOutModal (confirm return to surface)
  └── BustModal (show lost rewards, preserve XP)
```

### 8. Success Metrics

1. **Engagement**: Players complete 70%+ of queued runs within 7 days
2. **Retention**: 60%+ of players return after first run
3. **Balance**: Average bust rate 20-30% (high tension, not punishing)
4. **Progression**: Players unlock new regions within 2 weeks
5. **Collection**: 40%+ of players complete at least one collection set
6. **Fitness Motivation**: Average daily steps increase by 15% after 30 days

### 9. Open Questions & Design Decisions Needed

1. **Shortcuts**: Should shortcuts be permanent (memorized) or temporary (per run)?
2. **Energy Recovery**: Should Rest Sites recover energy, or only provide strategic info?
3. **Encounter Rewards**: Should rewards scale with depth, or vary by encounter type?
4. **Collection Set Sizes**: How many items per set for good progression pacing?
5. **Maximum Queued Runs**: Should there be a cap (e.g., 7 days max) or unlimited queue?
6. **Bust Severity**: Lose everything, or keep low-value items?
7. **Region Unlocks**: Unlock by collection completion, depth records, or both?

### 10. Implementation Phases

**Phase 1: Core Systems (Foundational)**

- Daily runs queue system
- Energy economy (replace turn-based currency)
- Spatial navigation map generation
- Basic descent/return mechanics
- Run state management

**Phase 2: Encounter System**

- Integrate existing grid dungeon as Puzzle Chamber
- Implement Trade Opportunity encounters
- Implement Discovery Site encounters
- Create encounter resolution system

**Phase 3: Push-Your-Luck Mechanics**

- Return cost calculation and display
- Cash out / bust logic
- Point of no return detection
- Risk escalation with depth

**Phase 4: Collection & Progression**

- Collection system (trade goods, discoveries, legendaries)
- Set completion bonuses
- Region unlocks
- Permanent progression integration

**Phase 5: Polish & Balance**

- Visual design for map/path navigation
- Energy cost balancing
- Encounter reward tuning
- Streak bonus integration with HealthKit
- Achievement system

**Phase 6: Testing & Refinement**

- Playtest for balance (bust rate, progression pace)
- Performance optimization
- Accessibility features
- Tutorial/onboarding flow

## Next Steps

1. Review and approve this PRD
2. Create feature branch: `feature/prd-delvers-descent`
3. Generate detailed task list using `@generate-tasks.md` workflow
4. Begin Phase 1 implementation with TDD approach

## Files Requiring Major Changes

- `src/lib/health/index.tsx` - Currency system redesign
- `src/types/dungeon-game.ts` - New types for runs, nodes, spatial navigation
- `src/components/dungeon-game/` - Complete refactor to spatial navigation
- `src/components/dungeon-game/dungeon-game.tsx` - Repurpose as Puzzle Chamber encounter
- New files needed for run queue, map generation, encounter system
