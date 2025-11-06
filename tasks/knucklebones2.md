Knucklebones-lite (solo): implementation spec for React Native

OVERVIEW
Fill a 3x3 grid in nine turns. Each turn, roll a six-sided die and place it in any empty cell. Score each row using simple set-based multipliers (pair, triple). The total of all three rows is the final score. The solo mode is a score chase: beat a target, a personal best, or a seeded leaderboard.

CORE RULES

- Grid: 3 rows by 3 columns (9 cells).

- Turns: 9 rolls total; on each roll, place the die in any empty cell.

- Scoring per row (three dice a, b, c):

▫ Base row sum = a + b + c.

▫ Multiplier:

⁃ Triple (all equal): x3.

⁃ Pair (two equal, one different): x2.

⁃ All distinct: x1.

▫ Row score = base row sum times multiplier.

- Final score: sum of the three row scores.

- End condition: after 9 placements, compute score and end the run.

STATE MODEL

- board: 3x3 matrix of { value: 1..6 or null }.

- currentRoll: 1..6 (latest die value).

- placementsRemaining: integer (starts 9, decrements to 0).

- runSeed: integer/string for deterministic RNG.

- finalScore: integer (computed at end).

- targetScore (optional): integer for challenge mode.

- history (optional): list of placements for undo/analytics.

SETUP

1. Initialize board to nulls, placementsRemaining = 9, finalScore = 0.

2. Initialize seeded RNG with runSeed.

3. Optionally load targetScore or leaderboard thresholds.

TURN FLOW

1. Roll: currentRoll = RNG(1..6).

2. Choose placement: player taps any empty cell.

3. Place: write currentRoll to that cell; placementsRemaining -= 1.

4. If placementsRemaining > 0, repeat from step 1; else computeScore() and end.

SCORING PROCEDURE

- For each row r in [0..2]:

▫ Let values = [board[r][0], board[r][1], board[r][2]].

▫ base = sum(values).

▫ multiplier:

⁃ if values[0] == values[1] == values[2] then 3.

⁃ else if any two values equal then 2.

⁃ else 1.

▫ rowScore = base \* multiplier.

- finalScore = sum(rowScore for all 3 rows).

UI BEHAVIOR (PLAIN TEXT SPEC)

- Show a clean 3x3 grid; empty cells are tappable, filled cells are locked.

- Animate the die roll (brief), then the placement (snap-in).

- On hovering or tapping an empty cell (preview mode), show the potential row’s base, multiplier, and rowScore if the currentRoll were placed there.

- After placement, show per-row running totals and the current aggregate score (optional).

- End screen: show each row’s dice and computed rowScore, plus finalScore and target comparison; present “Retry (same seed)” and “New run” options.

ACTIONS / REDUCERS

- initRun(seed, targetScore?): returns initial state.

- rollDie(state): uses seeded RNG to produce 1..6; sets currentRoll.

- getLegalCells(state): returns list of coordinates where value == null.

- placeDie(state, row, col): writes currentRoll to board[row][col]; decrements placementsRemaining; clears currentRoll.

- scoreRow(values[3]): returns base, multiplier, rowScore.

- computeScore(board): returns finalScore by summing all rows.

- endRun(state): locks interaction, records finalScore, updates best score and leaderboard if applicable.

- undo (optional): revert last placement (limited to 1 step or disabled for purity).

- setSeed(seed) and nextSeed(): for deterministic replay and fresh runs.

BALANCE AND TARGETS (RECOMMENDED DEFAULTS)

- No rerolls; pure placement skill with RNG.

- Targets:

▫ Bronze: 90

▫ Silver: 120

▫ Gold: 150

▫ These can be tuned after telemetry; triples push scores high when you align values, so reaching 150+ requires at least one strong triple row.

- Leaderboard mode:

▫ Seed daily: fixed seed so all players face the same roll sequence.

▫ Unlimited practice (local seed), but only first or best attempt per daily seed counts.

EXAMPLE SCORING

- Row [4, 4, 4]: base 12, triple x3, rowScore = 36.

- Row [2, 2, 6]: base 10, pair x2, rowScore = 20.

- Row [1, 3, 6]: base 10, distinct x1, rowScore = 10.

- FinalScore example = 36 + 20 + 10 = 66.

PLAYER TIPS (FOR TOOLTIP COPY, NOT REQUIRED)

- Triples beat pairs; pairs beat distinct. Aim to stack matching values in rows to amplify the base sum.

- Center cell is flexible for future alignment; when a row starts with a number, favor placing the same number there if possible.

TEST HOOKS

- setRollSequence([5,3,5,6,2,2,4,4,4]): deterministic QA.

- simulateRun(placements[]): compute finalScore without UI.

- validateScore(board): recompute and compare with stored finalScore.

OPTIONAL VARIANTS (TOGGLEABLE)

- Column scoring: apply the same set multipliers to columns and add to total (raises ceiling and complexity).

- One-time reroll: a single reroll token per run; press to replace currentRoll once (add tension).

- Wild six: treat 6 as wild for set formation only; if a row uses wilds, cap its multiplier at x2 for balance.

EDGE CASES

- Mis-tap on filled cell: ignore and await a valid empty cell.

- placementsRemaining at 0: auto-compute score; disable further input.

- RNG failure: fallback to system RNG and log seed mismatch.

DATA PERSISTENCE

- Store bestScore per mode (local).

- Store lastSeed and lastRun board for replay.

- Optionally store per-row breakdowns for post-run insights.

This spec yields a crisp nine-decision puzzle: readable rules, satisfying set-completion moments, and a clear solo score chase that’s easy to implement and polish with animation and sound.
