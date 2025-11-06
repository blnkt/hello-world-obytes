Farkle-lite: implementation spec (React Native)

A streamlined push-your-luck dice game. Roll six dice, set aside scoring dice (“keepers”), and choose to roll the rest to build a bigger turn total—or bank your points before you “farkle” (roll no scoring dice and lose all unbanked points for the turn).

Core concepts

- Six d6 dice per turn.

- Scoring dice are only 1s, 5s, and sets-of-a-kind (triples+).

- “Bank” locks in the turn total to your game score.

- “Farkle” ends your turn and you lose the unbanked turn total.

Entities and state

- dice: array of up to 6 objects {value: 1..6, locked: boolean}.

- turnTotal: integer (sum of selected scoring dice for the current turn).

- gameScore: integer (banked cumulative points).

- remainingDice: integer (unlocked dice count to roll next).

- phase: “idle” | “rolled” | “selection” | “farkle” | “banked” | “end”.

- config:

▫ targetScore: default 10000 (win when gameScore ≥ targetScore).

▫ scoringRules: see Scoring.

▫ hotDiceEnabled: true (rolling “hot dice” if all 6 score).

▫ maxTurns (optional for arcade mode): e.g., 10.

- effects (UI only): riskMeter (derived from turnTotal and remainingDice), sfx cues.

Setup

1. Initialize gameScore=0, turnTotal=0, remainingDice=6, phase=“idle”.

2. On new turn, reset dice to unlocked, turnTotal=0, remainingDice=6.

Turn flow

1. Roll:

▫ Roll all unlocked dice (count=remainingDice).

▫ phase=“rolled”.

2. Evaluate roll:

▫ Compute all scoring options under Scoring.

▫ If no scoring dice present: phase=“farkle”; turnTotal=0; end turn.

▫ Else phase=“selection”.

3. Selection:

▫ Player chooses one or more legal “keeper” groups (e.g., a single 1, a single 5, or a triple).

▫ Lock selected dice; add their points to turnTotal.

▫ Update remainingDice = current unlocked dice count.

▫ If remainingDice == 0 and hotDiceEnabled: “hot dice” → reset remainingDice=6, unlock all, continue same turn.

4. Decision:

▫ Player either:

⁃ Roll again (go to step 1 with remainingDice).

⁃ Bank: phase=“banked”; gameScore += turnTotal; end turn.

5. End turn:

▫ If “farkle” → turn ends with no change to gameScore.

▫ If “banked” → turn ends with gameScore updated.

▫ Reset for next turn (remainingDice=6, turnTotal=0, unlock all).

6. End game:

▫ If gameScore ≥ targetScore → win.

▫ If arcade mode and turns ≥ maxTurns → evaluate score/medals.

Scoring (lite rules)

- Singles:

▫ 1 = 100 points (per die).

▫ 5 = 50 points (per die).

- Three-of-a-kind (any face):

▫ Three 1s = 1000 points.

▫ Three 2s = 200 points; Three 3s = 300; Three 4s = 400; Three 5s = 500; Three 6s = 600.

- Four/ Five/ Six-of-a-kind:

▫ Multiply the base triple value:

⁃ 4-of-a-kind = triple value × 2.

⁃ 5-of-a-kind = triple value × 3.

⁃ 6-of-a-kind = triple value × 4.

- Combination rules:

▫ You can score multiple groups from a single roll (e.g., a triple + single 1s/5s).

▫ A die may only belong to one scoring group.

- Optional combos (disabled by default for lite):

▫ Straight (1–6) = 1500 points.

▫ Three pairs = 1500 points.

▫ Enable via config if desired.

Conflict resolution:

- When both singles (1s/5s) and sets-of-a-kind overlap, prefer the higher-scoring grouping; UI should allow players to pick either, but present a “recommended” highlight.

Risk and banking

- Farkle: a roll with zero scoring dice (no 1s, no 5s, no valid sets) ends the turn and forfeits turnTotal.

- Hot dice: if all 6 dice are scored in the turn (i.e., none remain unlocked), player may roll all 6 again and continue accumulating in the same turn.

Deterministic actions (reducers)

- initGame(config)

- startTurn():

▫ turnTotal=0; remainingDice=6; unlock all; phase=“idle”.

- rollDice():

▫ Roll all dice where locked=false; phase=“rolled”; evaluateScoring().

- evaluateScoring():

▫ Compute legal scoringGroups from current dice; if none → phase=“farkle”.

- selectKeepers(groupSelection):

▫ Validate selection; lock dice in the selected groups; turnTotal += score(groupSelection); update remainingDice.

- bank():

▫ gameScore += turnTotal; phase=“banked”; endTurn().

- endTurn():

▫ Reset dice locked=false; turnTotal=0; remainingDice=6; phase=“idle”.

- checkEndGame():

▫ If gameScore ≥ targetScore → phase=“end”.

- hotDiceCheck():

▫ If remainingDice==0 and config.hotDiceEnabled → remainingDice=6; unlock all; phase=“selection”.

- computeRiskMeter():

▫ Derived: higher risk with fewer remainingDice and higher unbanked turnTotal.

UI/UX notes (React Native)

- Dice area: show six dice with lock state; animate rolls; glow scoring dice.

- Scoring panel: list legal groups with point values; recommend highest EV grouping.

- Controls: “Roll” (enabled when at least one die is unlocked), “Bank” (enabled when turnTotal>0).

- Feedback:

▫ Farkle: strong SFX and shake.

▫ Banking: satisfying SFX and confetti pulse.

▫ Risk meter: a visual bar rising with turnTotal/remainingDice (purely derived, no gameplay impact).

- Accessibility: large touch targets; color-safe highlights; ARIA-like labels for dice values.

Examples

- Roll: [1, 5, 2, 2, 2, 6]

▫ Legal: triple 2s = 200; single 1=100; single 5=50.

▫ Player selects triple 2s + single 1 (turnTotal += 300). Remaining dice: 2 (the 5 and 6).

▫ Decision: roll 2 dice or bank 300.

- Roll: [1, 1, 1, 5, 5, 5]

▫ Legal: triple 1s=1000 + triple 5s=500; total 1500.

▫ All dice scored → hot dice → roll all six again in same turn.

Config presets

- Casual: targetScore=5000; hotDiceEnabled=true; optional combos disabled; maxTurns undefined.

- Standard: targetScore=10000; hotDiceEnabled=true; optional combos disabled.

- Spicy: targetScore=10000; hotDiceEnabled=true; optional combos enabled (straight, three pairs).

Edge cases

- Multiple group selection must not reuse the same die.

- If a player selects suboptimal groups, accept the choice (no auto-correction).

- When no unlocked dice remain but not all dice are scoring (shouldn’t happen if selection is validated)—block roll and prompt to bank.

Testing hooks

- seedRolls(sequence): feed predetermined dice values for deterministic tests.

- simulateTurn(actions[]): assert final turnTotal, gameScore, phase.

- validateScore(dice, selection): ensure scoring math matches rules.

This spec yields a fast, readable push-your-luck loop with clear banking decisions, an escalatory risk feel, and minimal rules overhead suitable for a polished mini-game.
