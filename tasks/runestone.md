Here is a clean, implementation-ready Markdown spec for Rune Stones (base rules + solo variant).

Rune Stones: implementation spec (React Native)

This spec fuses the official mechanics of Rune Stones with a concise fan-made solo mode so an AI agent can build a faithful facsimile. It focuses on entities, setup, turn structure, actions, effects, scoring, and solo/automa behaviors, with deterministic primitives for coding. ​⁠https://rules.queen-games.com/runestones_en.pdf

Core idea

Players are druids building a deck of creature cards. Each turn you either play creatures for effects (often gems), or spend gems to forge artifacts, then trade artifacts for rune stones. Rune stones grant permanent abilities and power points (victory points). The race ends at a power-point threshold; most points wins. ​⁠https://cdn.1j1ju.com/medias/3f/b1/42-rune-stones-rulebook.pdf

Entities and data structures

- Decks:

▫ creaturesDeck: face-down draw pile of creature cards.

▫ creaturesMarket: face-up row (N slots, e.g., 5–6).

▫ discardPile: face-up creature discards.

- Player state:

▫ hand: array of creature cards (drawn from creaturesDeck).

▫ gems: map by color {red, blue, green, black, white} with integer counts.

▫ artifactsRowA/RowB: two market rows of artifact tiles (each tile shows cost in colored gems and VP value).

▫ ownedArtifacts: list of artifact tiles collected.

▫ runeStones: list of permanent rune-stone tiles (each has a passive ability and power-point value).

▫ powerPoints: integer (score).

- Card fields (creature):

▫ id, name, faction/color, number (initiative value), effects (gain gems, exchange, draw, etc.), cost (if applicable when buying from market).

- Artifact fields:

▫ id, row (A/B), cost: {color→amount}, vp: integer.

- Rune-stone fields:

▫ id, abilityTag (passive), vp: integer, prerequisites: usually “exchange any two owned artifacts.”

- Automa (solo bot) state (see Solo section):

▫ botPowerPoints: integer.

▫ botProgressTrack: integer thresholds to simulate forging and rune purchase pressure.

▫ botTimers: counters driving market consumption and VP gains.

Setup

1. Build creaturesDeck from the full creature card set, shuffle.

2. Deal initial hand to player (e.g., 4 cards).

3. Fill creaturesMarket with N face-up creature cards from creaturesDeck.

4. Prepare artifacts:

▫ Shuffle artifacts and fill two rows (Row A and Row B) with M tiles each (e.g., 6 per row).

▫ Refill from artifacts supply when a tile is taken.

5. Prepare rune-stone supply:

▫ Shuffle/stack available rune stones; display all types with limited copies per type (copies < player count in multiplayer; keep the same limit in solo for tension).

6. Set player gems = {all colors: 0}, ownedArtifacts = [], runeStones = [], powerPoints = 0.

7. Solo mode only: initialize automa tracks and timers (see Solo section). ​⁠https://rules.queen-games.com/runestones_en.pdf

Turn structure (player)

On your turn, perform exactly one of the following primary actions:

1. Play Creatures

- Choose exactly two creature cards from hand, reveal and resolve both effects in any order.

- After resolving, discard both to the discardPile, then apply the “perfect dilemma” culling rule:

▫ Compare the two cards’ numbers (initiative values).

▫ The card with the higher number is removed from your deck (exiled from the game).

▫ The card with the lower number stays in your discard (will return when you reshuffle).

- Optional draw: draw up to hand size (if rules indicate; many implementations draw back to 4–5 after turns).

- Replace any market and perform downstream maintenance as required by card effects. ​⁠https://cdn.1j1ju.com/medias/3f/b1/42-rune-stones-rulebook.pdf

2. Forge Artifact

- Pay the exact colored gem cost shown on one artifact tile in row A or row B.

- Take the artifact tile, place into ownedArtifacts.

- Immediately gain its printed VP (add to powerPoints).

- Refill that artifact slot from supply (if any). ​⁠https://rules.queen-games.com/runestones_en.pdf

3. Claim Rune Stone (exchange artifacts)

- Pay the exchange cost: discard any two ownedArtifacts (return them to a common discard).

- Take any available rune-stone tile from supply.

- Immediately gain its printed VP (add to powerPoints).

- The rune stone’s abilityTag becomes a permanent passive modifier on your future turns. ​⁠https://rules.queen-games.com/runestones_en.pdf

4. Acquire Creature (market buy)

- Pay the cost shown for a face-up creature card in creaturesMarket (cost system varies—if using official rulebook, creatures are acquired via a specific action using resource icons on cards; if simplifying, treat cost as gems or a generic “essence” accrued by card effects).

- Place the acquired creature into your discardPile (or hand, if the rules/card effect say so).

- Refill the market from the creaturesDeck. ​⁠https://cdn.1j1ju.com/medias/3f/b1/42-rune-stones-rulebook.pdf

End of Turn: Resolve any end-of-turn passives (from rune stones), then draw up to hand size if the base rules prescribe (commonly 4). If creaturesDeck empties, shuffle discardPile to form a new creaturesDeck.

The “perfect dilemma” card-culling rule

- Whenever you play the “Play Creatures” action, you must choose two cards and resolve them.

- Of those two, the card with the higher number is removed from the game (exiled).

- The lower-number card goes to your discardPile (returns later).

- This enforces continual deck thinning of your strongest effects, balancing explosive turns with long-term tempo. ​⁠https://boardgamegeek.com/blog/12247/blogpost/141626/the-perfect-dilemma-rune-stones

Gems, artifacts, and rune stones

- Gems: multiple colors; creature effects primarily generate gems and/or perform exchanges, draws, and market manipulation.

- Artifacts (two rows): each artifact shows a colored cost and a VP value; buying an artifact is immediate VP and advances your engine toward rune stones.

- Rune stones: exchanging two artifacts grants a rune stone tile with:

▫ Permanent passive effect (e.g., improve card-play, draw, gem production, exchange bonuses).

▫ Immediate VP gain.

- Scarcity: keep 1 fewer copy of each rune-stone type than the (nominal) player count to preserve tension even in solo. ​⁠https://rules.queen-games.com/runestones_en.pdf

Scoring and endgame

- Power points (score) accrue from:

▫ Artifact VP.

▫ Rune-stone VP.

▫ Any printed card or board bonuses that grant VP (if using expansions).

- End trigger (base race): immediately when a player reaches or exceeds the threshold (e.g., 65 power points), the game enters end-of-round and final scoring; highest points wins. In solo, compare against automa or a target. ​⁠https://rules.queen-games.com/runestones_en.pdf

Solo/automa variant (fan-made condensation)

This automa is a compact distillation of community solo modes so you can implement cleanly without bespoke decks. It creates market pressure and a scoring race. ​⁠https://boardgamegeek.com/thread/2687681/2021-solo-variant-for-rune-stones

Automa parameters

- botPowerPoints: starts at 0.

- botSpeed: difficulty knob (default 3).

- botArtifactRate: every time botSpeed ticks reach threshold, bot gains 1 artifact-equivalent (worth 2 VP).

- botRuneRate: every 2 artifacts-equivalents, bot converts them into 1 rune-stone-equivalent (worth 5 VP) and gains a random passive “pressure” effect.

- botPressureEffects (randomly cycle; one active at a time):

▫ Market Cull: remove the rightmost creature from creaturesMarket each bot turn; refill.

▫ Price Surge: increase the gem cost of the most expensive artifact slot by +1 in a required color until purchased.

▫ Gem Scarcity: when you play creatures for gems, reduce total gems gained by 1 (min 0) that turn.

Solo turn order

- Player takes a normal turn (choose one primary action).

- Automa turn:

a. botTicks += botSpeed.

b. If botTicks ≥ 3: botTicks -= 3; bot gains one artifact-equivalent (botPowerPoints += 2).

c. If botArtifactCount % 2 == 0 (i.e., bot has gained 2 artifacts since last check): bot converts to a rune-stone-equivalent (botPowerPoints += 5) and randomly sets a new botPressureEffect (from the list above).

d. Apply botPressureEffect (e.g., cull market rightmost card, raise cost marker, or apply gem scarcity to your next “Play Creatures” action).

- Refill markets as needed.

Solo end conditions

- If player reaches or exceeds 65 power points, finish the round; if player ≥ botPowerPoints, player wins; else, loss.

- If botPowerPoints ≥ 65 before you, immediate loss.

- If creaturesDeck cannot refill the market and you have not reached 65, treat as soft loss unless you’re ahead of the bot and can still forge via available gems this turn.

Difficulty scaling

- Easy: botSpeed = 2; botArtifact-equivalent VP = 1; rune-stone-equivalent VP = 4.

- Standard: botSpeed = 3; 2 VP per artifact-equivalent; 5 VP per rune-stone-equivalent.

- Hard: botSpeed = 4; 3 VP per artifact-equivalent; 6 VP per rune-stone-equivalent; bot culls two market cards per turn (rightmost then leftmost).

Deterministic primitives (actions/reducers)

- initGame(seed)

▫ Shuffle creaturesDeck/artifacts/rune-stones with seed; fill markets; set player/automa state.

- playCreatures(cardId1, cardId2)

▫ Resolve both effects; apply culling rule (exile higher-number); move lower-number to discard; apply passives; draw up to hand size.

- buyArtifact(artifactId)

▫ Validate gem payment; decrement gems; add artifact to ownedArtifacts; add VP; refill slot.

- claimRuneStone(runeStoneId)

▫ Consume any two ownedArtifacts; add rune stone and VP; set passive abilityTag.

- acquireCreatureFromMarket(creatureId)

▫ Validate cost; move creature to discard (or hand per effect); refill market.

- endTurn()

▫ Apply end-of-turn passives; draw/replenish hand; reshuffle if deck empty.

- botTurn()

▫ Advance botTicks; award bot VP by timers; set/execute active botPressureEffect; perform market maintenance.

- checkEndTrigger()

▫ If playerPowerPoints ≥ threshold or botPowerPoints ≥ threshold, resolve end comparison.

UI/UX notes (RN)

- Market rows: two artifact rows and one creature row; clamp touch targets; show colored gem costs with color-safe palette.

- Hand: 4–5 cards visible with quick-select, show card numbers prominently (for culling).

- Rune stones: show active passives as badges; include an info popover describing effects.

- Haptics: light tap on gem gain; medium on forging artifact; strong on claiming rune stone; warning on bot cull/pressure changes.

Rule clarifications

- Playing creatures: resolve in chosen order; effects like “gain gems,” “draw,” “exchange,” or “market manipulation” apply immediately.

- Culling: always remove the higher-number of the two played creatures from your deck; the lower-number card remains available later via reshuffle. This is the central tension of the design. ​⁠https://boardgamegeek.com/thread/2632347/play-3-cards-plus-discard-the-lowest-rune-stones

- Artifacts: you may buy from either row; refill after purchase. Some tables play “both rows exchangeable” when claiming rune stones; keep the solo spec as “any two owned artifacts” for simplicity. ​⁠https://boardgamegeek.com/thread/2324451/exchange-artifacts-both-rows

- Rune stones: permanent passives stack unless the ability is explicitly unique; VP is immediate on claim.

- Endgame: threshold race to 65 points with final comparison (solo vs. bot).

Sources

- Official rules PDF (Queen Games): Rune Stones Rulebook (rules.queen-games.com/1t). ​⁠https://rules.queen-games.com/runestones_en.pdf

- Alternate rulebook mirror (1j1ju): Rune Stones Rulebook (mirror) (cdn.1j1ju.com/2w). ​⁠https://cdn.1j1ju.com/medias/3f/b1/42-rune-stones-rulebook.pdf

- 2021 community solo variant discussion: BGG Solo Variant Thread (boardgamegeek.com/3w). ​⁠https://boardgamegeek.com/thread/2687681/2021-solo-variant-for-rune-stones

- On the culling dilemma (play-two, discard higher-number): BGG discussion (boardgamegeek.com/7o). ​⁠https://boardgamegeek.com/blog/12247/blogpost/141626/the-perfect-dilemma-rune-stones
