Here’s a concise, implementation-ready Markdown spec for Shut the Box, including solo variants.

Shut the Box: implementation spec (React Native) ￼

These directions synthesize the canonical pub rules with common solo variants. They define entities, setup, turn flow, legal moves, scoring, end conditions, and difficulty toggles, expressed as deterministic actions for an AI agent. ​⁠￼ ​⁠￼ ​⁠￼

Core idea ￼

Roll dice and “shut” number tiles 1–9 by matching either the sum or decompositions equal to your roll. Your turn ends when no legal shut exists. Score is typically the sum of remaining open tiles; lowest total wins. Solo modes compare your score to thresholds or fixed round counts. ​⁠￼

Entities and state ￼

- boardTiles: array of 9 tile objects for numbers 1..9, each with isOpen:boolean.

- dice: two d6 values per roll.

- canRollOneDie: boolean computed each turn (true only when 7,8,9 are shut).

- turnOpenSum: live set of open numbers; used to compute legal partitions for a roll.

- playerScoreTotal: running total for multi-round play.

- roundCount: number of rounds played.

- config:

▫ variant: “standard” | “alwaysSum” | “alwaysSumDuo” | “digitalScore” | “missionaryCount” | “tournament45out”.

▫ tilesCount: 9 or 12 (default 9).

▫ rounds: integer (default 5 for multi-player norms; for solo use 5 or target threshold).

- soloConfig:

▫ targetMode: “minimizeSum” | “thresholdWin”.

▫ thresholdSum: e.g., 12 (win if remaining sum ≤ threshold).

▫ perRoundScoring: true/false (accumulate across rounds).

▫ difficulty: “easy” | “standard” | “hard” (affects legal move policy and one-die rule strictness).

Setup ￼

1. Initialize board with tiles 1..tilesCount, all isOpen=true.

2. Set playerScoreTotal=0, roundCount=0.

3. For solo, set soloConfig defaults: targetMode=“minimizeSum”, thresholdSum=12, rounds=5.

4. Seed PRNG for dice rolls for reproducibility.

Turn flow (single player) ￼

Each turn repeats roll → shut → repeat until no legal shut.

1. Determine dice count:

▫ If tiles 7,8,9 are all shut (isOpen=false) on a 9-tile board, player may roll one die; otherwise roll two dice. For 12-tile boards, many tables allow one die only when all tiles >6 are shut. Respect config. ​⁠￼

2. Roll dice (1d6 or 2d6).

3. Compute legal shuts based on variant:

▫ Standard: you may shut either

⁃ the sum (a single tile equal to d1+d2), or

⁃ any combination of open tiles that sums to d1+d2 (including 2 or 3 numbers), or

⁃ exactly the two individual dice if both tiles are open. Note: tables differ; the conservative pub rule uses “any combination equal to the sum.” Apply this as default. ​⁠￼ ​⁠￼

▫ AlwaysSum: you may shut any set of open tiles whose sum equals d1+d2; never use the dice individually. ​⁠￼

▫ AlwaysSumDuo: you must shut exactly two open tiles whose sum equals d1+d2. One tile will always remain at endgame. ​⁠￼

4. If at least one legal shut exists:

▫ Player chooses one legal combination; set those tiles isOpen=false.

▫ Go to step 1 and continue the turn.

5. If no legal shut exists:

▫ End the turn; compute score for the round (see Scoring).

▫ Reset board (all tiles isOpen=true) for next round.

Immediate win condition:

- If, during the turn, all tiles become shut (isOpen=false for all), the player “Shut the Box” and wins the round immediately (score 0). In instant-victory mode, win the game immediately. ​⁠￼

Scoring ￼

At end of turn (no legal moves):

- Golf (default): score = sum of all open tiles. Lowest score wins in multiplayer; in solo compare to threshold/goal. ​⁠￼

- Digital: score = the concatenation of open digits left-to-right (e.g., open 3,4,6 → 346). ​⁠￼

- Missionary: score = count of open tiles (lower is better). ​⁠￼

For multi-round solo:

- Add round score to playerScoreTotal; increment roundCount; end after config.rounds and evaluate result.

Solo modes and difficulty ￼

Solo basic:

- Play 5 rounds. Total score <= target (e.g., ≤45) is a win; strict modes require ≤40.

ThresholdWin mode:

- Single round; win if Golf score ≤ thresholdSum (e.g., 12), else loss.

Difficulty knobs:

- Standard: legal sums allow any partition; one-die option after 7,8,9 shut.

- Hard:

▫ Disallow 3+ tile partitions; only allow one or two tiles per roll.

▫ Require two dice until total of open tiles ≤6 (tighten one-die access). ​⁠￼

- Easy:

▫ Allow 3+ tile partitions and gentle one-die access once all open tiles are ≤6.

▫ Optional mulligan: once per round, reroll if no legal move exists, then proceed (non-canonical).

Long Game (solo practice of two-player variant):

- Play a standard turn to shut tiles.

- Immediately play an “open” turn trying to open tiles under mirrored rules; doubles grant an extra roll. Win if you shut or open the entire board first. ​⁠￼

12-tile variant:

- Use tiles 1..12; largely identical flow; consider two-dice requirement until 7–12 are all shut. ​⁠￼

Deterministic actions (reducers) ￼

- initGame(seed, config, soloConfig)

- startRound(): set all tiles isOpen=true; set roundScore=0.

- computeCanRollOneDie(boardTiles, config): returns boolean.

- rollDice(numDice): returns [d1,d2?].

- legalCombos(boardTiles, roll, variant):

▫ Return list of combinations of open tile numbers that equal sum (or exact duo for AlwaysSumDuo).

▫ In “standard,” include exact-dice option when both individual faces are open.

- applyShut(combo): set those tiles isOpen=false.

- hasShutTheBox(boardTiles): return true if all tiles shut.

- endTurnAndScore(boardTiles, scoringMode):

▫ Golf: sum of open numbers.

▫ Digital: concatenation of open numbers left-to-right.

▫ Missionary: count of open tiles.

- updateSoloProgress(score): track totals, thresholds; decide win/loss after final round.

Edge cases and clarifications ￼

- One-die option:

▫ 9-tile boards: enabled only when 7,8,9 are shut; else two dice. ​⁠￼

▫ 12-tile boards: commonly allow one die once all >6 are shut; codify in config. ​⁠￼

- Must use full total:

▫ You must match the entire sum; partial use (e.g., only shutting one tile that is less than the roll) is illegal unless variant explicitly allows exact dice faces. If no partition equals the sum under the chosen variant, the turn ends. ​⁠￼

- Multiple partitions:

▫ When several are legal, choice is free. Present hints (e.g., prefer shutting high tiles early to unlock one-die sooner).

- Reset between rounds:

▫ Always reset to all-open before the next round; scores do not carry open/closed states across rounds (except “long game”).

- Instant victory:

▫ Shut the Box yields immediate round win; optionally ends the whole solo session if using instant victory mode. ​⁠￼

UI/UX notes (RN) ￼

- Tiles: 9 or 12 buttons labeled 1..N with open/shut state.

- Dice tray: show 2 dice by default; present a one-die toggle when eligible.

- Move helper: after a roll, highlight all legal tile combinations; selection commits.

- Scoring mode selector: Golf/Digital/Missionary; show running total for multi-round.

- Accessibility: large tap targets; color-safe “open/shut” indicators; haptics on shut, stronger haptic on box shut.

Example turn (standard, 9 tiles) ￼

- Open: 1 2 3 4 5 6 7 8 9.

- Roll: 5+3=8.

- Legal: [8], [7+1], [6+2], [5+3], [5+2+1], [4+3+1]. Player chooses [8]; shut 8.

- Roll: 6+5=11.

- Legal: partitions summing to 11, e.g., [9+2], [8+3] (but 8 is shut), [7+4], [6+5] (5 open? depends). Choose [6+5]; shut both.

- Now 7,8,9 not all shut → must roll two dice next.

Sources ￼

- Traditional pub rules and one-die condition: Masters Traditional Games ↗. ​⁠￼

- Overview, scoring variants, and “Golf/Missionary/Digital”: Wikipedia ↗. ​⁠￼

- Variant summaries (Always Sum, Always Sum Duo) and round structure: Dice Game Depot ↗. ​⁠￼
