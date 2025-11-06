Dungeon Dice (solo, push-your-luck): implementation spec for React Native

OVERVIEW
You delve through a sequence of “rooms.” Each room is a dice pool of enemies and treasure. On your turn, you roll your dice, assign them to attack or defend against room dice, optionally bank any available treasure, then choose to press on (risking a wipe) or exit the dungeon with whatever you have banked. If you ever “wipe” (fail to meet minimum defense or take lethal damage), you lose all unbanked treasure and the run ends. Clear enough rooms to win by reaching a target treasure score or surviving a fixed depth.

CORE OBJECTS

- Player state:

▫ health: integer (default 10 or 12).

▫ armor: integer (temporary defense buffer; starts 0 each room unless equipment rules are used).

▫ attackDice: N d6 (default 3).

▫ defenseDice: M d6 (default 2).

▫ bankedTreasure: integer tally (persistent).

▫ roomIndex: 1..D (depth).

- Room state:

▫ enemyDice: array of K d6 values (threat).

▫ trapDice: array of T d6 values (conditional damage checks).

▫ treasureDice: array of R d6 values (claimable loot).

▫ difficulty: scalar or tags (affects enemy count and trap thresholds).

- Run config:

▫ depth: number of rooms (e.g., 8).

▫ targetTreasure: e.g., 30 to win early.

▫ wipeRules: definition of failure conditions (below).

▫ rerollsPerRoom: default 0 (or 1 for easier mode).

▫ bankAtAnyTime: true (you can bank before resolving wipe checks).

▫ roomGeneration: deterministic by seed.

SETUP

1. Set health to starting value (e.g., 12), armor to 0, bankedTreasure=0, roomIndex=1.

2. For each room i, generate:

▫ enemyDice: roll K d6 (e.g., 3 at early depth, 4–5 later).

▫ trapDice: roll T d6 (e.g., 1–2 depending on difficulty).

▫ treasureDice: roll R d6 (e.g., 2–3 scaled by difficulty).

3. Present room i with its dice, and the player’s current dice pools.

TURN SEQUENCE (PER ROOM)

1. Preparation:

▫ Reset armor to 0 (unless persistent effects exist).

▫ The player rolls all attackDice and defenseDice (unless a pre-roll ability modifies dice).

2. Assignment (single allocation phase):

▫ Assign any number of attack dice to specific enemy dice.

⁃ Attack success rule (recommended): An assigned attack die that is greater than or equal to the targeted enemy die defeats that enemy. Otherwise, it fails.

⁃ Multi-assign allowed: You may stack multiple attack dice onto a single enemy die; only the highest matters (keep one highest against that enemy).

▫ Assign any number of defense dice to “block line” or specific trap/enemy sources, depending on chosen defense model:

⁃ Simple block model: Sum of defense dice becomes your armor for the room; armor reduces incoming damage after resolution.

⁃ Targeted block model (optional): A defense die equal to or greater than a selected trap die prevents that trap effect; otherwise trap triggers.

▫ Unassigned dice remain unused this room.

3. Treasure claim:

▫ You may bank treasure at any time before wipe resolution. For simplicity:

⁃ Banking treasure: sum of treasureDice values (or only those you choose) added to bankedTreasure immediately.

⁃ Optional restraint: Claim only treasure dice showing 5 or 6 for thematic scarcity; configurable.

▫ Banking does not affect current room danger; it only protects treasure from being lost if you wipe later.

4. Resolution:

▫ Enemy damage:

⁃ Count undefeated enemyDice after attack assignment. Each undefeated enemy die deals damage equal to its face value or a fixed amount (choose one model; recommended fixed 1 or face value capped at 3).

▫ Trap resolution:

⁃ For each trap die, check threshold (e.g., 4+ triggers 1 damage or special effect). If targeted block model is enabled, only unblocked traps apply.

▫ Total incoming damage = enemyDamage + trapDamage.

▫ Apply armor (if using block model): damageTaken = max(0, incomingDamage - armor).

▫ Reduce health: health = health - damageTaken.

5. Wipe check:

▫ You wipe if any of these are true:

⁃ health <= 0 (lethal).

⁃ “Guard threshold” unmet: For rooms with guard conditions (e.g., must defeat at least one enemy), failing them triggers wipe.

⁃ “Trap fail” rule: If any trap over threshold hits and you had no defense assigned, triggers wipe (optional hard mode).

▫ On wipe: lose all unbanked treasure from the current room (already banked treasure is safe), end the run immediately.

6. Press-or-exit:

▫ If you did not wipe, choose:

⁃ Press: proceed to next room (roomIndex += 1).

⁃ Exit: end the run voluntarily; keep bankedTreasure as final score.

▫ If roomIndex exceeds depth, you cleared the dungeon; final score is bankedTreasure, and health surviving can be used as a bonus.

SCORING AND WIN CONDITIONS

- Basic: win by reaching depth (clear all rooms) or by exiting with bankedTreasure >= targetTreasure.

- Score = bankedTreasure (optionally add survival bonus: +health at exit).

- Difficulty knobs:

▫ Increase enemyDice and trapDice at later rooms.

▫ Raise trap thresholds or per-enemy damage model.

▫ Reduce rerollsPerRoom to 0 for harder runs.

EXAMPLES (NUMERIC)

- Room: enemyDice [2, 4, 6], trapDice [5], treasureDice [3, 6]; player rolls attack [1, 4, 5], defense [2, 3].

▫ Assign attack 5 to enemy 6 (fails, because 5 < 6), attack 4 to enemy 4 (defeats), attack 1 unused.

▫ Defense model simple: armor = 2 + 3 = 5.

▫ Remaining enemies: [2, 6]. Incoming from enemies: if fixed 1 per enemy, 2 damage; if face value capped at 3, 2 + 3 = 5.

▫ Trap 5: threshold 4+, triggers 1 damage (unless targeted block is used and a defense die was assigned to it and met 5).

▫ Total incoming: enemies + trap; armor reduces it; apply to health.

▫ Player banks treasure 6 now (safe); optionally also 3 (safer), or push luck and keep unbanked for multiplier variants.

▫ If health > 0 and wipe not triggered, choose to press or exit.

OPTIONAL VARIANTS

- Combo attack: sum multiple attack dice against a single enemy and compare total to enemy die; this increases tactical depth and success rate.

- Enemy toughness: enemies require equal-or-greater dice count (e.g., 2+ assigned dice) instead of just value to defeat.

- Treasure risk multiplier: unbanked treasure in a room can be multiplied by x2 if you press, but is lost on wipe.

- Equipment: persistent items grant +1 armor, a reroll per room, or a free 1-value attack die.

ACTIONS/REDUCERS (DETERMINISTIC)

- initRun(seed, config) -> state

- generateRoom(seed, roomIndex, config) -> room

- rollPlayerDice(state) -> {attackRolls, defenseRolls}

- assignDice(state, assignments) -> state

- bankTreasure(state, treasureSelection) -> state (increase bankedTreasure)

- resolveRoom(state) -> state (apply enemy/trap damage, armor, wipe check)

- pressOrExit(state, decision) -> state (advance depth or finalize score)

- checkWin(state) -> outcome (cleared depth or target met)

- rng with seed for reproducibility

UI NOTES (PLAIN TEXT)

- Show room dice grouped: enemies, traps, treasure.

- Show player dice separated: attack and defense, with tap-to-assign.

- Live previews:

▫ Expected enemy defeats after current assignments.

▫ Total incoming damage and post-armor damage preview.

▫ Treasure to be banked if you confirm.

- End-of-room panel: confirm assignment, bank, and then resolve; then present press-or-exit.

BALANCING STARTING VALUES (RECOMMENDED DEFAULTS)

- health: 12

- attackDice: 3 d6

- defenseDice: 2 d6

- depth: 8 rooms

- enemyDice per room: start 3, increase to 4, then 5 from room 6+

- trapDice per room: 1 early, 2 late; threshold 5+ triggers 1 damage

- enemy damage: fixed 1 per undefeated enemy (easier), or face value capped at 3 (harder)

- treasureDice: 2 early, 3 late; bank full value; targetTreasure: 30

EDGE CASES

- If the player assigns all dice to treasure (not allowed): treasure claim does not consume attack/defense dice; assignments apply only to enemy/trap. Keep treasure claim as a separate action before resolution.

- If all enemies are defeated and traps blocked: incoming damage is 0; proceed to press-or-exit.

- If no attack or defense dice are available (due to variant or item loss): the player may only bank treasure and press at high risk.

TEST HOOKS

- seedRoomRolls(roomIndex, predefinedDice) for deterministic QA.

- simulateRoom(assignments, bankSelection) -> returns post-resolution health, wiped flag, bankedTreasure delta.

- runAuto(strategy) to benchmark balance (e.g., bank if incoming damage forecast > 3, else press).
