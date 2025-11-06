Knucklebones-lite (Yahtzee core): implementation spec (React Native)

A fast, deterministic dice-placement mini-game. Players roll a six-sided die and place it into a personal 3x3 grid (nine total placements). Each row scores based on set-formation (pairs or triples) with simple multipliers. Highest total wins.

Core concepts

- Grid: 3 rows by 3 columns per player (each has their own board; no direct interaction).

- Turn loop: Roll one die, place it into any empty cell, repeat until the grid is full.

- Scoring: Each row evaluates its three dice; sets multiply the row sum.

Entities and state

- Board: 3x3 matrix of cells {value: 1..6 or null}.

- diceRolled: integer 1..6 (last roll).

- turnCount: 0..9 per player.

- currentPlayer: “human” or “ai”.

- gameOutcome: null, “humanWin”, “aiWin”, or “draw”.

- config:

▫ rollsPerTurn: 1.

▫ gridSize: 3x3.

▫ scoringMode: “sets-multiplier”.

▫ aiDifficulty: “standard”.

▫ tieBreaker: “highest-single-die”, “sum-middle-row”, or “none”.

Setup

1. Create empty 3x3 boards for human and AI (all cells null).

2. Set currentPlayer to human, turnCount to 0.

3. Seed a PRNG for reproducible rolls and AI decisions if desired.

Turn flow

- Alternate players until both boards are full:

a. Roll: generate a value from 1 to 6 and assign to diceRolled.

b. Choose placement:

⁃ Human: select any empty cell on the human board.

⁃ AI: compute best placement via heuristic (see AI section).

c. Place: set the chosen cell’s value to diceRolled; increment that player’s turnCount.

d. Swap: switch currentPlayer.

e. End condition: when both boards have 9 dice placed, compute scores and decide the outcome.

Legal placements

- Any empty cell on the active player’s board is legal.

Scoring (sets-multiplier)

- Evaluate each row independently. Let the row’s dice be a, b, c (all non-null).

- Base row total: a + b + c.

- Multiplier:

▫ Triple (all equal): x3.

▫ Pair (two equal, one different): x2.

▫ All distinct: x1.

- Row score: (a + b + c) multiplied by the applicable multiplier.

- Board total: sum of the three row scores.

Outcome and tie-breaking

- Compare human and AI board totals.

- If equal:

▫ highest-single-die: compare the highest single die on each board; if still equal, draw.

▫ sum-middle-row: compare totals of the middle row; if still equal, draw.

▫ none: declare draw.

Deterministic AI (standard)

- Goal: place the current roll to maximize the final board score using a fast heuristic.

- Priority rules (evaluate all empty cells and pick the best):

a. Complete or create triples: if placing the die forms a triple in any row, choose the cell that yields the largest resulting row score.

b. Complete or create pairs: if placing the die forms a pair in any row, prefer the placement that yields the highest projected row score.

c. Row sum leverage: if no set is formed, place into the row where currentRowSum + die is highest; break ties by choosing the row with more empty cells.

d. Positional tie-breakers: prefer the center cell over edges if scores are equal, then prefer earlier rows and columns (top to bottom, left to right).

- Optional stronger AI: 1-ply lookahead estimating average future multipliers for partially filled rows (keep deterministic via seeded PRNG or fixed expectations).

Reducers and actions

- initGame(seed, config)

- rollDie(): returns 1..6 (seeded).

- getLegalCells(board): list of coordinates where value is null.

- placeDie(board, row, col, value): mutates board.

- scoreRow(rowValues): returns integer per rules.

- scoreBoard(board): sum of three row scores.

- aiChooseCell(board, value, config): returns a chosen row and column via heuristic.

- endGame(humanBoard, aiBoard, config): computes totals and outcome.

UI and UX notes (text-only spec)

- Show 3x3 grid with empty vs filled states; highlight the selected placement.

- Animate the roll briefly, then animate the placement.

- Provide live per-row score preview when hovering or tapping a candidate cell to teach the multiplier rule.

- End screen shows row-by-row and total scores, and clear tie-breaker messaging.

Examples

- Row outcomes:

▫ [4, 4, 4] -> base 12 times 3 = 36 points.

▫ [2, 2, 6] -> base 10 times 2 = 20 points.

▫ [1, 3, 6] -> base 10 times 1 = 10 points.

- AI decision example:

▫ Current roll: 5

▫ AI board rows:

⁃ Row 1: [5, 5, null] -> placing 5 completes triple: base 15 times 3 = 45.

⁃ Row 2: [3, null, null] -> placing 5 yields distinct partial.

⁃ Row 3: [null, null, null] -> distinct partial in any cell.

▫ AI places in Row 1 to form the triple.

Edge cases

- No legal cells: only after 9 placements; trigger scoring phase.

- Mis-taps on filled cells: reject and await a valid input.

- PRNG failure: fallback to system RNG and log seed mismatch.

Variant toggles (optional)

- Column multipliers: apply the same set multipliers to columns and sum rows plus columns for the final score (increases complexity and ceiling).

- Reroll token: each player gets one reroll per game to redraw the current die once.

- Wild face (6): treat 6 as wild for set formation only (still contributes 6 to sum). To balance, reduce the triple multiplier to x2 for rows containing wilds.
