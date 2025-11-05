Scope and intent ￼

This document describes the canonical rules of the solo card game Scoundrel, structured for an AI/agent to implement a faithful digital facsimile in React Native. It defines entities, state, setup, turn/room flow, combat resolution, potion handling, skipping, win/lose conditions, and edge cases. It adheres to the original design by Zach Gage and Kurt Bieg. Scoundrel.pdf ↗

Core concepts and entities ￼

- Deck: Standard 52-card deck with the red face cards and red aces removed (remove ♥J, ♥Q, ♥K, ♥A, ♦J, ♦Q, ♦K, ♦A). Jokers are not used.

- Card values: Ordered within suit, with Ace high. 2–10 are numerical; J=11, Q=12, K=13, A=14.

- Suits by role:

▫ Clubs (♣) and Spades (♠): Monsters. Monster damage equals the card’s value.

▫ Diamonds (♦): Weapons. Weapon strength equals the card’s value. Exactly one weapon can be equipped at a time.

▫ Hearts (♥): Health potions. Potion value equals the card’s value; only the first potion consumed each turn has any effect.

- Health: Player starts at 20.

- Room: A set of 4 face-up cards. The player must play any 3 cards, in any order, to complete the room. The unplayed 4th card carries into the next room. Scoundrel: rpdillon.net ↗

Game state ￼

Track at minimum:

- deck: ordered array of remaining cards (top = next to draw)

- discard: pile of discarded cards

- health: integer (default 20)

- equippedWeapon: nullable diamond card

- defeatedByWeapon: ordered list of monster values defeated with the current weapon

- currentRoom: ordered list of up to 4 cards (left to right)

- skipAvailable: boolean (cannot skip two rooms in a row)

- gameOutcome: null | “win” | “loss”

- roomActionCount: 0..3

- roomPotionCount: 0..3

Setup ￼

1. Create and shuffle a standard 52-card deck.

2. Remove red face cards (♥J, ♥Q, ♥K, ♦J, ♦Q, ♦K) and red aces (♥A, ♦A).

3. Set health to 20; discard empty.

4. No weapon equipped; defeatedByWeapon empty.

5. Deal the first room: draw 4 cards face-up, left-to-right.

6. Set skipAvailable = true; roomActionCount = 0; roomPotionCount = 0.

Turn and room flow ￼

1. Optionally skip the room if skipAvailable is true:

▫ Move all 4 room cards, in order, to the bottom of the deck.

▫ Deal a fresh room of 4 cards from the top.

▫ Set skipAvailable = false. End turn.

2. Otherwise, play exactly 3 cards from the room, one at a time, in any order:

▫ Monster (♣/♠): resolve combat.

▫ Weapon (♦): equip new weapon.

▫ Potion (♥): consume per potion rules.

▫ After each resolution, move the card to discard (monsters used to track durability sit under the weapon visually; in code, record values and still discard the card upon weapon replacement).

▫ Increment roomActionCount.

3. After 3 cards resolved:

▫ Carry over the unplayed 4th card as the leftmost slot of the next room.

▫ Draw 3 cards from deck to complete the room to 4 cards (left-to-right).

▫ Set skipAvailable = true; reset roomActionCount = 0; roomPotionCount = 0.

4. If the deck cannot supply enough cards to reach 4 in the next room (including carryover), the game ends immediately. If the player is not dead, this is a win.

Combat resolution (monsters) ￼

When a monster is selected (value M: 2–14):

- No weapon equipped:

▫ health = max(health − M, 0). If health == 0, gameOutcome = “loss”.

▫ Discard the monster.

- Weapon equipped (strength W: 2–10):

▫ Durability legality:

⁃ If defeatedByWeapon empty: weapon may attack any monster.

⁃ Else let L = last value in defeatedByWeapon. Weapon may only attack monsters with value < L (strictly descending).

▫ Player choice:

⁃ Fight with weapon (if legal): damage = max(M − W, 0); apply damage; append M to defeatedByWeapon; keep monster logically “under” weapon (or immediately discard in code, while tracking M in defeatedByWeapon).

⁃ Fight bare-handed: damage = M; apply damage; discard monster.

▫ If health reaches 0, gameOutcome = “loss”.

Weapon rules (diamonds) ￼

When a weapon is selected:

- Equip as current weapon: equippedWeapon = card; defeatedByWeapon = [].

- If a weapon was previously equipped:

▫ Discard the previous weapon and all monsters in its defeatedByWeapon stack (append to discard; preserve order if desired).

Potion rules (hearts) ￼

When a potion is selected:

- If roomPotionCount == 0: health += card.value.

- If roomPotionCount >= 1: no effect.

- Increment roomPotionCount.

- Discard the card.

Skipping rooms ￼

- May skip any room by putting all 4 cards on the bottom of the deck, then dealing 4 new cards.

- Cannot skip two rooms in a row; enforce via skipAvailable flag.

- Skipping does not change health, weapon, or defeatedByWeapon.

Win and loss conditions ￼

- Win: While forming the next room after carryover, if the deck cannot reach 4 cards total, and health > 0, gameOutcome = “win”.

- Loss: health reaches 0 at any time.

Edge cases and clarifications ￼

- First weapon use: Can attack any monster. Durability constraint applies starting after the first defeated monster.

- Strict descending: Next monster when using weapon must be strictly less than the last monster value defeated by that weapon.

- Player may always choose to fight bare-handed even if weapon use is legal.

- Potions: Only the first potion per room heals. Reset count at each new room.

- Health clamped at 0; do not allow negative values.

- No red face/aces; no jokers; ensure deck filtering at setup.

- Skip lockout: After a skip, set skipAvailable=false; after a non-skipped room completion, set skipAvailable=true.

- Discard behavior: All resolved cards go to discard. If visually stacking monsters under the weapon, move them to discard when the weapon is replaced.

Deterministic action primitives ￼

- dealInitialRoom()

- skipRoom()

- playCard(index)

- completeRoom()

- equipWeapon(card)

- fightMonster(card, useWeapon:boolean)

- consumePotion(card)

- checkWinOnRefill()

- clampHealth()

UI/state machine notes (React Native) ￼

- Represent currentRoom as a 4-slot array; disable interactions once a card is resolved.

- Show equippedWeapon and a simple list of defeatedByWeapon values to enforce legality.

- Maintain roomActionCount and roomPotionCount for per-room logic.

- Enforce skipAvailable in the skip button.

Example walkthrough (logic-only) ￼

Room: [♠11, ♦8, ♥6, ♣4]; order: ♦8 → ♠11 → ♥6.

- Equip ♦8.

- Fight ♠11 with weapon: damage = 3; health -=3; record 11 in defeatedByWeapon.

- Consume ♥6: first potion this room; health +=6.
  Carryover: ♣4 becomes next room’s first card; draw 3 more; skipAvailable = true.

Sources ￼

- Scoundrel.pdf ↗

- Scoundrel: rpdillon.net ↗
