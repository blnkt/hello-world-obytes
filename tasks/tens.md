Here’s a clean, implementation-ready Markdown spec for “Card Merge 10” (aka Tens).

Card Merge 10 (Tens): implementation spec (React Native)

These directions synthesize canonical “Tens” solitaire rules and common variants, structured as entities, setup, turn flow, legal moves, scoring, win/lose conditions, difficulty toggles, and deterministic actions for an AI agent. ​⁠https://www.thesprucecrafts.com/take-ten-solitaire-412479 ​⁠https://playingcarddecks.com/blogs/all-in/popular-adding-and-pairing-solitaire-card-games?srsltid=AfmBOoo5RGVDxBwFA7X4db9YSubKNQQQAF6Pq7nQyWWHJNWKaWk0rLjw

Core idea

Play with a standard deck, repeatedly remove:

- Pairs that sum to 10 (A+9, 2+8, 3+7, 4+6, 5+5).

- Quartets of matching rank for 10/J/Q/K (four 10s, four Jacks, four Queens, four Kings).
  Refill the tableau as cards are removed. You win if all 52 cards are dealt onto the table without reaching an impasse; typical win rate is low (around 12–13%). ​⁠https://www.thesprucecrafts.com/take-ten-solitaire-412479

Entities and state

- deck: shuffled array of 52 cards.

- drawPile: face-down stack (top = next to draw).

- tableau: face-up card grid (default 13 cards visible).

- legalPairs: computed list of two-card pairs that sum to 10.

- legalQuartets: computed list of four-of-a-kind sets for ranks 10/J/Q/K.

- movesHistory: stack for undo (optional).

- gameOutcome: null | “win” | “loss”.

Card model:

- Card: { rank: A,2,…,10,J,Q,K; suit: ♣♦♥♠ }.

- For arithmetic, map A=1; 2..10 as pip values; J=11, Q=12, K=13 (note: in Tens, face-card quartets are removed by matching rank, not by summation). ​⁠https://www.thesprucecrafts.com/take-ten-solitaire-412479

Setup

1. Shuffle the deck.

2. Deal initial tableau: 13 cards face-up, arranged as two rows of five and one row of three (or three rows of five for the easier 15-card variant). All cards must be visible and selectable. ​⁠https://www.thesprucecrafts.com/take-ten-solitaire-412479

3. Place the remaining cards as drawPile.

Turn flow

Repeat until win/loss:

1. Scan tableau for:

▫ Any two face-up cards that sum to 10.

▫ Any four-of-a-kind for 10/J/Q/K.

2. If a legal removal exists:

▫ Player chooses either a pair-sum-to-10 or a quartet-of-same-face-rank; remove selected cards to discard.

▫ Immediately refill the tableau by dealing the same number of cards from drawPile (maintain the tableau size target: 13 or 15, unless drawPile is exhausted).

3. If no legal removal exists, but the drawPile still has cards:

▫ Deal from drawPile to the tableau until target size is reached or drawPile empties.

▫ Re-scan and continue.

4. Impasse / loss condition: If the tableau cannot accept more cards (i.e., target size already met or drawPile exhausted), and there are no legal removals, the game ends in a loss.

5. Win condition: If you successfully deal all 52 cards to the tableau (i.e., drawPile empties) without ever reaching an impasse that blocks further removals, you win. ​⁠https://www.thesprucecrafts.com/take-ten-solitaire-412479

Notes:

- Suits do not matter for pair-sum-to-10 or for quartets (quartets are same rank only). ​⁠https://www.thesprucecrafts.com/take-ten-solitaire-412479

- You may remove 5+5 as a valid pair to 10.

Legal move computation

- Pairs-to-10: Enumerate all unordered card pairs in tableau; allow (A,9), (2,8), (3,7), (4,6), (5,5).

- Quartets: For ranks {10, J, Q, K}, if count(rank) ≥ 4 in tableau, each distinct four-of-a-kind is legal to remove.

- Deduplicate results; prioritize UI to show both categories distinctly.

Scoring (optional)

Tens is traditionally win/lose without point scoring; if scoring is desired:

- Success bonus: +52 for a clean clear (or +n for cards removed).

- Efficiency bonus: +k per removal; -k for dead-end deals.

- Otherwise, keep to binary win/loss per round. ​⁠https://playingcarddecks.com/blogs/all-in/popular-adding-and-pairing-solitaire-card-games?srsltid=AfmBOoo5RGVDxBwFA7X4db9YSubKNQQQAF6Pq7nQyWWHJNWKaWk0rLjw

Variants and difficulty toggles

- Easier tableau size: Start with 15 face-up (three rows of five). ​⁠https://www.thesprucecrafts.com/take-ten-solitaire-412479

- Block Ten (hard mode): Identical to Tens, but cannot remove tens (rank 10 never removed via quartet). This increases blocking and lowers win rates. ​⁠https://www.thesprucecrafts.com/take-ten-solitaire-412479

- Refill policy:

▫ Strict: Immediately refill after each removal (default).

▫ Buffered: Accumulate removals within a “step” then refill up to target size (slightly more user-friendly).

- Undo limit: 0 (strict), 3 (standard), unlimited (casual).

- Hint system: Toggle to highlight at least one legal removal when available.

Related adding games in the “adding and pairing” genre also use sum targets like 10/11/13, but Tens specifically uses sum-to-10 and face-card quartets. ​⁠https://playingcarddecks.com/blogs/all-in/popular-adding-and-pairing-solitaire-card-games?srsltid=AfmBOoo5RGVDxBwFA7X4db9YSubKNQQQAF6Pq7nQyWWHJNWKaWk0rLjw

Edge cases and clarifications

- Multiple removals exist: Player may choose any; optimal play generally favors removing pairs that unblock future quartets or keep tableau balanced.

- Refill ordering: Always draw from drawPile top; preserve consistent placement order for deterministic replays.

- DrawPile exhaustion: If you cannot refill to the target size, continue playing with the reduced tableau; win only if you avoid an impasse until all cards have been dealt and removed. ​⁠https://www.thesprucecrafts.com/take-ten-solitaire-412479

- Face-card quartets: Only ranks 10/J/Q/K qualify for quartet removal (A ranks do not). ​⁠https://www.thesprucecrafts.com/take-ten-solitaire-412479

Deterministic actions (reducers)

- initGame(seed, tableauSize=13, variant=“tens”):

▫ Shuffle deck with seed; deal tableauSize; set drawPile to remaining cards.

- scanLegalMoves(tableau):

▫ Return {pairsTo10: [[i,j]…], quartets: [[i,j,k,l]…]}.

- removeCards(indices):

▫ Remove specified cards from tableau; push to discard; log in movesHistory.

- refillTableau(targetSize):

▫ While tableau.length < targetSize and drawPile not empty, deal top card to tableau.

- step():

▫ Compute legal moves; if none and (drawPile not empty) and tableau.length < targetSize, refill; else if none and (drawPile empty), outcome=“loss”; else await player selection.

- checkWin():

▫ Outcome=“win” when all 52 cards have been dealt and the game concludes without impasse (i.e., last removal clears tableau or no blocking before full deal).

- undo():

▫ Pop last move from movesHistory; restore tableau and drawPile snapshot (if enabled).

UI/UX notes (RN)

- Tableau grid: 13 or 15 cells; show clear affordances for selectable pairs/quartets.

- Move affordances: Tap first card, then highlight all compatible second cards (for pairs) or remaining for quartets.

- Feedback: Haptic on removal; subtle animation on refill; distinct effect for quartet removal.

- Seeded replay: Show seed; allow share/retry same seed.

Example walkthrough

- Start: tableau 13 cards.

- Player sees A♣ and 9♦ → removes as A+9=10. Refill +2 from drawPile.

- Later: tableau holds J♣ J♦ J♥ J♠ → remove the four Jacks. Refill +4.

- Continue until either no legal removals and drawPile empty (loss) or all 52 cards were placed without impasse (win). ​⁠https://www.thesprucecrafts.com/take-ten-solitaire-412479
