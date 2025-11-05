import type {
  AdvancedEncounterItem,
  CollectedItem,
  EncounterType,
} from '@/types/delvers-descent';

import { RewardCalculator } from './reward-calculator';
import type { AdvancedEncounterOutcome } from './risk-event-encounter';

// Re-export for UI components
export type { AdvancedEncounterOutcome };

/**
 * Playing card suit
 */
export type Suit = 'clubs' | 'spades' | 'diamonds' | 'hearts';

/**
 * Playing card value (2-10, J=11, Q=12, K=13, A=14)
 */
export type CardValue = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

/**
 * Playing card representation
 */
export interface PlayingCard {
  suit: Suit;
  value: CardValue;
  id: string; // Unique identifier (e.g., "clubs-7", "hearts-11")
}

/**
 * Configuration for a Scoundrel encounter
 */
export interface ScoundrelConfig {
  startingLife: number; // Default: 20
  depth: number; // Depth level affects rewards
  roomsToSurvive?: number; // Number of rooms to complete to win (default: 5 + depth)
}

/**
 * State of a Scoundrel encounter
 */
export interface ScoundrelState {
  encounterId: string;
  encounterType: EncounterType;
  config: ScoundrelConfig;
  health: number;
  deck: PlayingCard[]; // Ordered array (top = next to draw)
  discard: PlayingCard[];
  equippedWeapon: PlayingCard | null;
  defeatedByWeapon: number[]; // Ordered list of monster values defeated with current weapon
  currentRoom: PlayingCard[]; // Up to 4 cards (left to right)
  skipAvailable: boolean;
  gameOutcome: null | 'win' | 'loss';
  roomActionCount: number; // 0-3
  roomPotionCount: number; // 0-3
  roomsCompleted: number; // Number of rooms successfully completed
  isResolved: boolean;
  outcome?: AdvancedEncounterOutcome;
}

/**
 * Reward tier configuration
 */
export interface RewardTier {
  minScore: number;
  maxScore: number;
  xp: number;
  itemCount: number;
}

const REWARD_TIERS: RewardTier[] = [
  { minScore: 0, maxScore: 10, xp: 50, itemCount: 1 }, // Tier 1
  { minScore: 11, maxScore: 20, xp: 100, itemCount: 2 }, // Tier 2
  { minScore: 21, maxScore: Infinity, xp: 200, itemCount: 3 }, // Tier 3
];

/**
 * Generate a standard 52-card deck
 */
function generateStandardDeck(): PlayingCard[] {
  const deck: PlayingCard[] = [];
  const suits: Suit[] = ['clubs', 'spades', 'diamonds', 'hearts'];
  const values: CardValue[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

  for (const suit of suits) {
    for (const value of values) {
      deck.push({
        suit,
        value,
        id: `${suit}-${value}`,
      });
    }
  }

  return deck;
}

/**
 * Remove red face cards and red aces from deck
 * Remove: ♥J (hearts-11), ♥Q (hearts-12), ♥K (hearts-13), ♥A (hearts-14)
 *        ♦J (diamonds-11), ♦Q (diamonds-12), ♦K (diamonds-13), ♦A (diamonds-14)
 */
function filterDeck(deck: PlayingCard[]): PlayingCard[] {
  return deck.filter((card) => {
    // Remove red face cards and red aces
    if (card.suit === 'hearts' && card.value >= 11) {
      return false; // Hearts J, Q, K, A
    }
    if (card.suit === 'diamonds' && card.value >= 11) {
      return false; // Diamonds J, Q, K, A
    }
    return true;
  });
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get card value for display (2-10, J, Q, K, A)
 */
export function getCardDisplayValue(value: CardValue): string {
  if (value <= 10) {
    return value.toString();
  }
  if (value === 11) {
    return 'J';
  }
  if (value === 12) {
    return 'Q';
  }
  if (value === 13) {
    return 'K';
  }
  return 'A';
}

/**
 * Get suit symbol for display
 */
export function getSuitSymbol(suit: Suit): string {
  switch (suit) {
    case 'clubs':
      return '♣';
    case 'spades':
      return '♠';
    case 'diamonds':
      return '♦';
    case 'hearts':
      return '♥';
  }
}

/**
 * Check if card is a monster (Clubs or Spades)
 */
function isMonster(card: PlayingCard): boolean {
  return card.suit === 'clubs' || card.suit === 'spades';
}

/**
 * Check if card is a weapon (Diamonds, value 2-10)
 */
function isWeapon(card: PlayingCard): boolean {
  return card.suit === 'diamonds' && card.value >= 2 && card.value <= 10;
}

/**
 * Check if card is a potion (Hearts)
 */
function isPotion(card: PlayingCard): boolean {
  return card.suit === 'hearts';
}

export class ScoundrelEncounter {
  private state!: ScoundrelState; // Initialized in initializeGame
  private rewardCalculator: RewardCalculator;

  /**
   * Create a scoundrel encounter configuration
   * @param depth - Depth level affects rewards and number of rooms to survive
   * @param startingLife - Starting life (default: 20)
   * @param roomsToSurvive - Number of rooms to complete to win (default: 5 + depth)
   */
  static createScoundrelConfig(
    depth: number,
    startingLife: number = 20,
    roomsToSurvive?: number
  ): ScoundrelConfig {
    const rooms = roomsToSurvive ?? 5 + depth; // Default: 5 + depth (scales with difficulty)
    return {
      startingLife,
      depth,
      roomsToSurvive: rooms,
    };
  }

  constructor(encounterId: string, config: ScoundrelConfig) {
    this.rewardCalculator = new RewardCalculator();
    this.initializeGame(encounterId, config);
  }

  /**
   * Initialize the game according to Scoundrel rules
   */
  private initializeGame(encounterId: string, config: ScoundrelConfig): void {
    // Create and shuffle deck
    const fullDeck = generateStandardDeck();
    const filteredDeck = filterDeck(fullDeck);
    const shuffledDeck = shuffleArray(filteredDeck);

    // Deal initial room (4 cards)
    const initialRoom: PlayingCard[] = [];
    for (let i = 0; i < 4 && shuffledDeck.length > 0; i++) {
      initialRoom.push(shuffledDeck.shift()!);
    }

    // Ensure roomsToSurvive has a default value
    const roomsToSurvive = config.roomsToSurvive ?? 5 + config.depth;

    this.state = {
      encounterId,
      encounterType: 'scoundrel',
      config: {
        ...config,
        roomsToSurvive,
      },
      health: config.startingLife,
      deck: shuffledDeck,
      discard: [],
      equippedWeapon: null,
      defeatedByWeapon: [],
      currentRoom: initialRoom,
      skipAvailable: true,
      gameOutcome: null,
      roomActionCount: 0,
      roomPotionCount: 0,
      roomsCompleted: 0,
      isResolved: false,
    };
  }

  /**
   * Get current encounter state
   */
  getState(): ScoundrelState {
    return { ...this.state };
  }

  /**
   * Get current health
   */
  getCurrentLife(): number {
    return this.state.health;
  }

  /**
   * Get maximum life (starting life)
   */
  getMaxLife(): number {
    return this.state.config.startingLife;
  }

  /**
   * Check if encounter is complete (health = 0 OR game outcome set)
   */
  isEncounterComplete(): boolean {
    return this.state.health <= 0 || this.state.gameOutcome !== null;
  }

  /**
   * Get current room cards
   */
  getCurrentRoom(): PlayingCard[] {
    return [...this.state.currentRoom];
  }

  /**
   * Get equipped weapon
   */
  getEquippedWeapon(): PlayingCard | null {
    return this.state.equippedWeapon;
  }

  /**
   * Get monsters defeated by current weapon (for durability tracking)
   */
  getDefeatedByWeapon(): number[] {
    return [...this.state.defeatedByWeapon];
  }

  /**
   * Check if skip is available
   */
  canSkipRoom(): boolean {
    return this.state.skipAvailable && !this.isEncounterComplete();
  }

  /**
   * Get remaining deck size
   */
  getDeckSize(): number {
    return this.state.deck.length;
  }

  /**
   * Get room action count (0-3)
   */
  getRoomActionCount(): number {
    return this.state.roomActionCount;
  }

  /**
   * Skip the current room
   */
  skipRoom(): boolean {
    if (!this.canSkipRoom()) {
      return false;
    }

    // Move all 4 room cards to bottom of deck
    this.state.deck.push(...this.state.currentRoom);
    this.state.currentRoom = [];

    // Deal fresh room of 4 cards
    this.dealRoom();

    // Set skipAvailable = false
    this.state.skipAvailable = false;

    // Check win condition after dealing new room
    this.checkWinCondition();

    return true;
  }

  /**
   * Deal a new room (4 cards)
   */
  private dealRoom(): void {
    // Draw 4 cards (or as many as available)
    for (
      let i = this.state.currentRoom.length;
      i < 4 && this.state.deck.length > 0;
      i++
    ) {
      const card = this.state.deck.shift();
      if (card) {
        this.state.currentRoom.push(card);
      }
    }
  }

  /**
   * Play a card from the current room
   */
  playCard(cardIndex: number, useWeapon: boolean = false): boolean {
    if (this.isEncounterComplete()) {
      return false;
    }

    if (this.state.roomActionCount >= 3) {
      return false; // Room already completed
    }

    if (cardIndex < 0 || cardIndex >= this.state.currentRoom.length) {
      return false;
    }

    const card = this.state.currentRoom[cardIndex];
    if (!card) {
      return false;
    }

    let success = false;

    if (isMonster(card)) {
      success = this.fightMonster(card, useWeapon);
    } else if (isWeapon(card)) {
      success = this.equipWeapon(card);
    } else if (isPotion(card)) {
      success = this.consumePotion(card);
    }

    if (success) {
      // Remove card from room and move to discard
      this.state.currentRoom.splice(cardIndex, 1);
      this.state.discard.push(card);
      this.state.roomActionCount++;

      // If room completed (3 cards played), advance to next room
      if (this.state.roomActionCount >= 3) {
        this.completeRoom();
      }
    }

    return success;
  }

  /**
   * Fight a monster
   */
  private fightMonster(monster: PlayingCard, useWeapon: boolean): boolean {
    const monsterValue = monster.value;

    if (!this.state.equippedWeapon || !useWeapon) {
      // No weapon or fighting bare-handed
      this.state.health = Math.max(this.state.health - monsterValue, 0);
      if (this.state.health === 0) {
        this.state.gameOutcome = 'loss';
      }
      return true;
    }

    // Weapon equipped - check durability legality
    const weapon = this.state.equippedWeapon;
    const weaponStrength = weapon.value;

    // Check if weapon can attack this monster
    if (this.state.defeatedByWeapon.length > 0) {
      const lastDefeated =
        this.state.defeatedByWeapon[this.state.defeatedByWeapon.length - 1];
      if (monsterValue >= lastDefeated) {
        // Weapon durability constraint: must be strictly descending
        // Player can still choose to fight bare-handed
        if (useWeapon) {
          return false; // Cannot use weapon, must fight bare-handed
        }
        // Fighting bare-handed
        this.state.health = Math.max(this.state.health - monsterValue, 0);
        if (this.state.health === 0) {
          this.state.gameOutcome = 'loss';
        }
        return true;
      }
    }

    // Weapon can attack - calculate damage
    const damage = Math.max(monsterValue - weaponStrength, 0);
    this.state.health = Math.max(this.state.health - damage, 0);
    this.state.defeatedByWeapon.push(monsterValue);

    if (this.state.health === 0) {
      this.state.gameOutcome = 'loss';
    }

    return true;
  }

  /**
   * Equip a weapon
   */
  private equipWeapon(weapon: PlayingCard): boolean {
    // Discard previous weapon and all monsters in defeatedByWeapon
    if (this.state.equippedWeapon) {
      this.state.discard.push(this.state.equippedWeapon);
      // Monsters were already discarded when defeated, but we track them
      // in defeatedByWeapon for durability checking
    }

    // Equip new weapon
    this.state.equippedWeapon = weapon;
    this.state.defeatedByWeapon = [];

    return true;
  }

  /**
   * Consume a potion
   */
  private consumePotion(potion: PlayingCard): boolean {
    // Only first potion per room has effect
    if (this.state.roomPotionCount === 0) {
      this.state.health += potion.value;
    }

    this.state.roomPotionCount++;
    return true;
  }

  /**
   * Complete current room and advance to next
   */
  private completeRoom(): void {
    // Increment rooms completed
    this.state.roomsCompleted++;

    // Carry over the unplayed 4th card (if room had 4 cards and we played 3)
    let carryover: PlayingCard | null = null;
    if (this.state.currentRoom.length > 0) {
      carryover = this.state.currentRoom[0];
    }

    // Clear current room
    this.state.currentRoom = [];

    // Add carryover as leftmost slot of next room
    if (carryover) {
      this.state.currentRoom.push(carryover);
    }

    // Draw 3 more cards to complete room to 4 cards
    this.dealRoom();

    // Reset room state
    this.state.skipAvailable = true;
    this.state.roomActionCount = 0;
    this.state.roomPotionCount = 0;

    // Check win condition after completing room
    this.checkWinCondition();
  }

  /**
   * Check win condition: player survives required number of rooms
   */
  private checkWinCondition(): void {
    // Win: Player has completed the required number of rooms and health > 0
    const roomsToSurvive =
      this.state.config.roomsToSurvive ?? 5 + this.state.config.depth;
    if (this.state.roomsCompleted >= roomsToSurvive && this.state.health > 0) {
      this.state.gameOutcome = 'win';
    }
  }

  /**
   * Get dungeon progress (rooms completed vs rooms to survive)
   */
  getDungeonProgress(): { current: number; total: number } {
    // roomsToSurvive is guaranteed to be set in state.config after initialization
    const roomsToSurvive = this.state.config.roomsToSurvive!;
    return {
      current: this.state.roomsCompleted,
      total: roomsToSurvive,
    };
  }

  /**
   * Get available cards in current room (for UI compatibility)
   */
  getAvailableCards(): PlayingCard[] {
    return this.getCurrentRoom();
  }

  /**
   * Get last card played (for compatibility - not used in actual Scoundrel)
   */
  getLastCard(): PlayingCard | undefined {
    return this.state.discard.length > 0
      ? this.state.discard[this.state.discard.length - 1]
      : undefined;
  }

  /**
   * Get remaining monsters (for compatibility - not used in actual Scoundrel scoring)
   */
  getRemainingMonsters(): { name: string; value: number }[] {
    // Return monsters in current room and deck
    const monsters: { name: string; value: number }[] = [];

    // Check current room
    for (const card of this.state.currentRoom) {
      if (isMonster(card)) {
        monsters.push({
          name: `${getSuitSymbol(card.suit)} ${getCardDisplayValue(card.value)}`,
          value: card.value,
        });
      }
    }

    // Check deck
    for (const card of this.state.deck) {
      if (isMonster(card)) {
        monsters.push({
          name: `${getSuitSymbol(card.suit)} ${getCardDisplayValue(card.value)}`,
          value: card.value,
        });
      }
    }

    return monsters;
  }

  /**
   * Calculate final score based on encounter outcome
   * For Scoundrel: score = final health (win) or negative score based on remaining deck (loss)
   */
  calculateScore(): number {
    if (this.state.gameOutcome === 'win') {
      return this.state.health;
    }

    if (this.state.gameOutcome === 'loss') {
      // Calculate negative score based on remaining cards
      const remainingCards =
        this.state.deck.length + this.state.currentRoom.length;
      return -remainingCards;
    }

    // Game not complete
    return 0;
  }

  /**
   * Get reward tier based on score
   */
  private getRewardTier(score: number): RewardTier {
    // For negative scores (failures), use tier 1
    if (score < 0) {
      return REWARD_TIERS[0];
    }

    // Find the tier that matches the score
    for (const tier of REWARD_TIERS) {
      if (score >= tier.minScore && score <= tier.maxScore) {
        return tier;
      }
    }

    // Default to tier 1
    return REWARD_TIERS[0];
  }

  /**
   * Generate rewards based on score
   */
  private generateRewards(score: number): CollectedItem[] {
    // No rewards for failures (negative scores)
    if (score < 0) {
      return [];
    }

    const tier = this.getRewardTier(score);
    const items: CollectedItem[] = [];

    const itemTypes: ('trade_good' | 'discovery' | 'legendary')[] = [
      'trade_good',
      'discovery',
    ];

    // Add legendary items for tier 3 (score 21+)
    if (tier.itemCount === 3) {
      itemTypes.push('legendary');
    }

    for (let i = 0; i < tier.itemCount; i++) {
      const itemType =
        itemTypes[Math.floor(Math.random() * itemTypes.length)] || 'trade_good';

      const item = this.rewardCalculator.generateCollectionReward(
        itemType,
        this.state.config.depth
      );

      items.push(item);
    }

    return this.rewardCalculator.processEncounterRewards(
      items,
      'scoundrel',
      this.state.config.depth
    );
  }

  /**
   * Calculate number of items to steal based on score
   */
  private calculateItemsToSteal(score: number): number {
    if (score >= 0) {
      return 0;
    }

    const scoreMagnitude = Math.abs(score);
    return Math.min(5, Math.max(1, Math.ceil(scoreMagnitude / 10)));
  }

  /**
   * Steal items from inventory
   */
  private stealItemsFromInventory(
    runInventory: CollectedItem[],
    count: number
  ): string[] {
    if (runInventory.length === 0 || count <= 0) {
      return [];
    }

    const shuffled = [...runInventory].sort(() => Math.random() - 0.5);
    const itemsToSteal = shuffled.slice(0, Math.min(count, shuffled.length));
    return itemsToSteal.map((item) => item.id);
  }

  /**
   * Calculate energy loss based on failure severity
   */
  private calculateEnergyLoss(score: number): number {
    if (score >= 0) {
      return 0;
    }

    const scoreMagnitude = Math.abs(score);
    const depthMultiplier = Math.pow(this.state.config.depth, 1.2);
    const baseLoss = Math.ceil(scoreMagnitude / 10) * 5;
    return Math.round(baseLoss * depthMultiplier);
  }

  /**
   * Generate success outcome
   */
  private generateSuccessOutcome(score: number): AdvancedEncounterOutcome {
    const rewards = this.generateRewards(score);
    const tier = this.getRewardTier(score);
    const xp = tier.xp;

    const items: AdvancedEncounterItem[] = rewards.map((item) => {
      const rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' =
        item.type === 'legendary' ? 'legendary' : 'common';

      return {
        id: item.id,
        name: item.name,
        quantity: 1,
        rarity,
        type: item.type as 'trade_good' | 'discovery' | 'legendary',
        setId: item.setId || 'unknown_set',
        value: item.value,
        description: item.description || `A ${item.type} item`,
      };
    });

    const encounterReward = {
      energy: 0,
      items,
      xp,
    };

    return {
      type: 'success',
      message: `Victory! Score: ${score}. Earned ${xp} XP and ${rewards.length} items.`,
      reward: encounterReward,
    };
  }

  /**
   * Generate failure outcome
   */
  private generateFailureOutcome(
    score: number,
    runInventory: CollectedItem[]
  ): AdvancedEncounterOutcome {
    const itemsToStealCount = this.calculateItemsToSteal(score);
    const itemsToSteal = this.stealItemsFromInventory(
      runInventory,
      itemsToStealCount
    );
    const energyLoss = this.calculateEnergyLoss(score);

    let message = `Defeated! Your score: ${score}.`;
    if (itemsToSteal.length > 0) {
      message += ` ${itemsToSteal.length} item${itemsToSteal.length > 1 ? 's' : ''} stolen.`;
    }
    if (energyLoss > 0) {
      message += ` Lost ${energyLoss} energy.`;
    }

    return {
      type: 'failure',
      message,
      consequence: {
        energyLoss,
        itemLossRisk: 0,
        forcedRetreat: false,
        encounterLockout: false,
        itemsToSteal,
      } as AdvancedEncounterOutcome['consequence'] & {
        itemsToSteal?: string[];
      },
    };
  }

  /**
   * Resolve the encounter and return outcome
   */
  resolve(runInventory?: CollectedItem[]): AdvancedEncounterOutcome {
    if (this.state.isResolved) {
      throw new Error('Encounter already resolved');
    }

    const score = this.calculateScore();
    this.state.isResolved = true;

    const outcome =
      this.state.gameOutcome === 'win'
        ? this.generateSuccessOutcome(score)
        : this.generateFailureOutcome(score, runInventory || []);

    this.state.outcome = outcome;
    return outcome;
  }
}
