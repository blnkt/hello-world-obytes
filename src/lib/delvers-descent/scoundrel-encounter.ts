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
 * Configuration for a Scoundrel encounter
 */
export interface ScoundrelConfig {
  startingLife: number; // Default: 10
  dungeonSize: number; // Number of rooms (5-10)
  depth: number; // Depth level affects difficulty and rewards
}

/**
 * A room in the dungeon containing monsters and cards
 */
export interface DungeonRoom {
  id: string;
  roomNumber: number;
  monsters: Monster[];
  cards: Card[];
  isCompleted: boolean;
}

/**
 * A monster that can be encountered in a dungeon room
 */
export interface Monster {
  id: string;
  name: string;
  value: number; // For scoring
  lifeDamage: number; // Damage dealt when encountered
}

/**
 * A card that can be drawn in a dungeon room
 */
export interface Card {
  id: string;
  name: string;
  type: 'monster' | 'health_potion' | 'treasure' | 'trap';
  effect?: {
    healAmount?: number;
    damageAmount?: number;
    treasureValue?: number;
  };
}

/**
 * State of a Scoundrel encounter
 */
export interface ScoundrelState {
  encounterId: string;
  encounterType: EncounterType;
  config: ScoundrelConfig;
  currentLife: number;
  currentRoom: number;
  dungeon: DungeonRoom[];
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

export class ScoundrelEncounter {
  private state: ScoundrelState;
  private lastCardPlayed?: Card;
  private rewardCalculator: RewardCalculator;

  /**
   * Create a scoundrel encounter configuration
   * @param depth - Depth level affects dungeon size and difficulty
   * @param startingLife - Starting life (default: 10)
   * @param dungeonSize - Number of rooms (default: 5-10 based on depth)
   */
  static createScoundrelConfig(
    depth: number,
    startingLife: number = 10,
    dungeonSize?: number
  ): ScoundrelConfig {
    const size = dungeonSize ?? 5 + Math.floor(Math.random() * 6); // 5-10 rooms
    return {
      startingLife,
      dungeonSize: size,
      depth,
    };
  }

  constructor(encounterId: string, config: ScoundrelConfig) {
    this.state = {
      encounterId,
      encounterType: 'scoundrel',
      config,
      currentLife: config.startingLife,
      currentRoom: 0,
      dungeon: [],
      isResolved: false,
    };

    this.rewardCalculator = new RewardCalculator();
    this.initializeDungeon();
  }

  /**
   * Get current encounter state
   */
  getState(): ScoundrelState {
    return { ...this.state };
  }

  /**
   * Initialize the dungeon structure
   */
  private initializeDungeon(): void {
    this.state.dungeon = this.generateDungeon();
  }

  /**
   * Generate dungeon with rooms based on config
   */
  private generateDungeon(): DungeonRoom[] {
    const rooms: DungeonRoom[] = [];
    const numRooms = Math.max(5, Math.min(10, this.state.config.dungeonSize));

    for (let i = 0; i < numRooms; i++) {
      const monsters = this.generateMonsters(i + 1);
      const cards = this.generateCards(i + 1, monsters);

      rooms.push({
        id: `room-${i + 1}`,
        roomNumber: i + 1,
        monsters,
        cards,
        isCompleted: false,
      });
    }

    return rooms;
  }

  /**
   * Generate monsters for a room based on room number and depth
   */
  private generateMonsters(roomNumber: number): Monster[] {
    const depthMultiplier = Math.pow(this.state.config.depth, 1.2);
    const roomDifficulty = roomNumber * 0.5;
    const numMonsters = Math.floor(Math.random() * 3) + 1; // 1-3 monsters per room

    const monsters: Monster[] = [];

    for (let i = 0; i < numMonsters; i++) {
      const baseValue = Math.round((10 + roomDifficulty * 5) * depthMultiplier);
      const baseDamage = Math.round(
        (1 + roomDifficulty * 0.5) * depthMultiplier
      );

      const value = baseValue + Math.floor(Math.random() * 5);
      const lifeDamage = Math.max(
        1,
        baseDamage + Math.floor(Math.random() * 3)
      );

      const monsterNames = [
        'Goblin',
        'Skeleton',
        'Orc',
        'Shadow Beast',
        'Dark Mage',
        'Troll',
        'Vampire',
        'Demon',
      ];

      monsters.push({
        id: `monster-${roomNumber}-${i + 1}`,
        name: monsterNames[Math.floor(Math.random() * monsterNames.length)],
        value,
        lifeDamage,
      });
    }

    return monsters;
  }

  /**
   * Generate cards for a room (monsters, health potions, treasures, traps)
   */
  private generateCards(roomNumber: number, monsters: Monster[]): Card[] {
    const cards: Card[] = [];

    // Add monster cards based on monsters in room
    monsters.forEach((monster) => {
      cards.push({
        id: `card-monster-${monster.id}`,
        name: `${monster.name} Card`,
        type: 'monster',
        effect: {
          damageAmount: monster.lifeDamage,
        },
      });
    });

    // Add health potions (chance increases with room number)
    const healthPotionChance = Math.min(0.4, 0.2 + roomNumber * 0.05);
    if (Math.random() < healthPotionChance) {
      const healAmount = Math.floor(Math.random() * 5) + 5; // 5-10 healing
      cards.push({
        id: `card-health-${roomNumber}`,
        name: 'Health Potion',
        type: 'health_potion',
        effect: {
          healAmount,
        },
      });
    }

    // Add treasure cards (rarer than health potions)
    const treasureChance = Math.min(0.3, 0.1 + roomNumber * 0.03);
    if (Math.random() < treasureChance) {
      const treasureValue = Math.floor(Math.random() * 10) + 5; // 5-15 value
      cards.push({
        id: `card-treasure-${roomNumber}`,
        name: 'Treasure',
        type: 'treasure',
        effect: {
          treasureValue,
        },
      });
    }

    // Add trap cards (dangerous, but less common)
    const trapChance = Math.min(0.25, 0.1 + roomNumber * 0.02);
    if (Math.random() < trapChance) {
      const damageAmount = Math.floor(Math.random() * 3) + 2; // 2-5 damage
      cards.push({
        id: `card-trap-${roomNumber}`,
        name: 'Trap',
        type: 'trap',
        effect: {
          damageAmount,
        },
      });
    }

    // Shuffle cards
    return cards.sort(() => Math.random() - 0.5);
  }

  /**
   * Get current life points
   */
  getCurrentLife(): number {
    return this.state.currentLife;
  }

  /**
   * Get maximum life points (starting life)
   */
  getMaxLife(): number {
    return this.state.config.startingLife;
  }

  /**
   * Check if encounter is complete (life = 0 OR dungeon completed)
   */
  isEncounterComplete(): boolean {
    // If dungeon hasn't been initialized yet, encounter is not complete
    if (this.state.dungeon.length === 0) {
      return false;
    }

    return (
      this.state.currentLife <= 0 ||
      this.state.currentRoom >= this.state.dungeon.length
    );
  }

  /**
   * Get remaining monsters that haven't been encountered
   */
  getRemainingMonsters(): Monster[] {
    const remainingMonsters: Monster[] = [];

    for (let i = this.state.currentRoom; i < this.state.dungeon.length; i++) {
      const room = this.state.dungeon[i];
      if (!room.isCompleted) {
        remainingMonsters.push(...room.monsters);
      }
    }

    return remainingMonsters;
  }

  /**
   * Select a card from the current room
   */
  selectCard(cardId: string): boolean {
    const currentRoomData = this.getCurrentRoom();
    if (!currentRoomData) {
      return false;
    }

    const card = currentRoomData.cards.find((c) => c.id === cardId);
    if (!card) {
      return false;
    }

    return this.processCard(card);
  }

  /**
   * Process a card and update game state
   */
  processCard(card: Card): boolean {
    if (this.isEncounterComplete()) {
      return false;
    }

    // Track last card played
    this.lastCardPlayed = card;

    // Apply card effects
    if (card.effect) {
      if (card.effect.healAmount) {
        this.state.currentLife = Math.min(
          this.getMaxLife(),
          this.state.currentLife + card.effect.healAmount
        );
      }

      if (card.effect.damageAmount) {
        this.state.currentLife = Math.max(
          0,
          this.state.currentLife - card.effect.damageAmount
        );
      }
    }

    return true;
  }

  /**
   * Advance to the next room in the dungeon
   */
  advanceRoom(): boolean {
    if (this.isEncounterComplete()) {
      return false;
    }

    // Mark current room as completed
    if (this.state.currentRoom < this.state.dungeon.length) {
      this.state.dungeon[this.state.currentRoom].isCompleted = true;
    }

    // Move to next room
    this.state.currentRoom += 1;

    return true;
  }

  /**
   * Get current room information
   */
  getCurrentRoom(): DungeonRoom | null {
    if (
      this.state.currentRoom < 0 ||
      this.state.currentRoom >= this.state.dungeon.length
    ) {
      return null;
    }

    return { ...this.state.dungeon[this.state.currentRoom] };
  }

  /**
   * Get dungeon progress (current room / total rooms)
   */
  getDungeonProgress(): { current: number; total: number } {
    return {
      current: this.state.currentRoom + 1,
      total: this.state.dungeon.length,
    };
  }

  /**
   * Get available cards in the current room
   */
  getAvailableCards(): Card[] {
    const currentRoomData = this.getCurrentRoom();
    if (!currentRoomData) {
      return [];
    }

    return [...currentRoomData.cards];
  }

  /**
   * Track last card played (for health potion bonus)
   */
  trackLastCard(card: Card): void {
    this.lastCardPlayed = card;
  }

  /**
   * Get last card played
   */
  getLastCard(): Card | undefined {
    return this.lastCardPlayed;
  }

  /**
   * Get sum of remaining monster values
   */
  getRemainingMonsterValues(): number {
    const remainingMonsters = this.getRemainingMonsters();
    return remainingMonsters.reduce((sum, monster) => sum + monster.value, 0);
  }

  /**
   * Check if card is a health potion
   */
  isHealthPotion(card: Card): boolean {
    return card.type === 'health_potion';
  }

  /**
   * Get health potion value (heal amount)
   */
  getHealthPotionValue(card: Card): number {
    if (!this.isHealthPotion(card)) {
      return 0;
    }

    return card.effect?.healAmount ?? 0;
  }

  /**
   * Calculate final score based on encounter outcome
   * Note: Life = 0 takes priority over dungeon completion (failure > success)
   */
  calculateScore(): number {
    const currentLife = this.state.currentLife;
    const isDungeonCompleted =
      this.state.currentRoom >= this.state.dungeon.length;

    // Failure scoring: life = 0 (takes priority over dungeon completion)
    if (currentLife <= 0) {
      const remainingMonsterValues = this.getRemainingMonsterValues();
      // Score = life (0) - remaining monster values = negative score
      return 0 - remainingMonsterValues;
    }

    // Success scoring: dungeon completed AND life > 0
    if (isDungeonCompleted) {
      let score = currentLife;

      // Health potion bonus: if life = 20 and last card was health potion
      const lastCard = this.getLastCard();
      if (lastCard && this.isHealthPotion(lastCard) && currentLife === 20) {
        const potionValue = this.getHealthPotionValue(lastCard);
        score = currentLife + potionValue;
      }

      return score;
    }

    // Encounter not yet complete
    return 0;
  }

  /**
   * Get reward tier based on score
   */
  getRewardTier(score: number): RewardTier {
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

    // Default to tier 1 if no match (shouldn't happen)
    return REWARD_TIERS[0];
  }

  /**
   * Calculate reward XP for a given tier
   */
  calculateRewardXP(tier: number): number {
    if (tier < 1 || tier > REWARD_TIERS.length) {
      return REWARD_TIERS[0].xp;
    }

    return REWARD_TIERS[tier - 1].xp;
  }

  /**
   * Calculate reward item count for a given tier
   */
  calculateRewardItemCount(tier: number): number {
    if (tier < 1 || tier > REWARD_TIERS.length) {
      return REWARD_TIERS[0].itemCount;
    }

    return REWARD_TIERS[tier - 1].itemCount;
  }

  /**
   * Generate rewards based on score
   */
  generateRewards(score: number): CollectedItem[] {
    // No rewards for failures (negative scores)
    if (score < 0) {
      return [];
    }

    const tier = this.getRewardTier(score);
    const items: CollectedItem[] = [];

    // Generate items based on tier
    // Mix of trade_goods, discoveries, and potentially legendaries for higher tiers
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

    // Process rewards through RewardCalculator for proper scaling
    return this.rewardCalculator.processEncounterRewards(
      items,
      'scoundrel',
      this.state.config.depth
    );
  }

  /**
   * Calculate number of items to steal based on score
   * Lower score (more negative) = more items stolen
   */
  calculateItemsToSteal(score: number): number {
    // For failures, score is negative
    // More negative score = more items stolen
    if (score >= 0) {
      return 0; // No items stolen on success
    }

    // Score is negative, so we use its magnitude
    const scoreMagnitude = Math.abs(score);

    // Base calculation: 1 item per 10 points of negative score
    // Minimum 1 item, maximum 5 items
    const itemsToSteal = Math.min(
      5,
      Math.max(1, Math.ceil(scoreMagnitude / 10))
    );

    return itemsToSteal;
  }

  /**
   * Steal items from inventory (returns item IDs to remove)
   * This doesn't actually modify inventory - that's done by the UI layer
   */
  stealItemsFromInventory(
    runInventory: CollectedItem[],
    count: number
  ): string[] {
    if (runInventory.length === 0 || count <= 0) {
      return [];
    }

    // Randomly select items to steal
    const shuffled = [...runInventory].sort(() => Math.random() - 0.5);
    const itemsToSteal = shuffled.slice(0, Math.min(count, shuffled.length));

    return itemsToSteal.map((item) => item.id);
  }

  /**
   * Calculate energy loss based on failure severity
   */
  calculateEnergyLoss(score: number, remainingLife: number): number {
    // For failures, score is negative
    if (score >= 0) {
      return 0; // No energy loss on success
    }

    const scoreMagnitude = Math.abs(score);
    const depthMultiplier = Math.pow(this.state.config.depth, 1.2);

    // Base energy loss: 5 per 10 points of negative score
    // Plus depth scaling
    const baseLoss = Math.ceil(scoreMagnitude / 10) * 5;
    const scaledLoss = Math.round(baseLoss * depthMultiplier);

    // Additional loss based on how close to completing dungeon
    // If life was very low, add extra penalty
    const lifePenalty = remainingLife <= 2 ? 5 : 0;

    return scaledLoss + lifePenalty;
  }

  /**
   * Apply failure consequences and return item IDs to steal
   */
  applyFailureConsequences(runInventory: CollectedItem[]): {
    itemsToSteal: string[];
    energyLoss: number;
  } {
    const score = this.calculateScore();
    const currentLife = this.state.currentLife;

    const itemsToStealCount = this.calculateItemsToSteal(score);
    const itemsToSteal = this.stealItemsFromInventory(
      runInventory,
      itemsToStealCount
    );

    const energyLoss = this.calculateEnergyLoss(score, currentLife);

    return { itemsToSteal, energyLoss };
  }

  /**
   * Generate success outcome with rewards
   */
  private generateSuccessOutcome(score: number): AdvancedEncounterOutcome {
    const rewards = this.generateRewards(score);
    const tier = this.getRewardTier(score);
    const xp = tier.xp;

    // Convert CollectedItem[] to EncounterReward format
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
      message: `Dungeon completed! Score: ${score}. Earned ${xp} XP and ${rewards.length} items.`,
      reward: encounterReward,
    };
  }

  /**
   * Generate failure outcome with consequences
   */
  private generateFailureOutcome(
    score: number,
    runInventory: CollectedItem[]
  ): AdvancedEncounterOutcome {
    const inventory = runInventory || [];
    const consequences = this.applyFailureConsequences(inventory);

    const itemsStolenCount = consequences.itemsToSteal.length;
    const energyLoss = consequences.energyLoss;

    // Build failure message
    let message = `Defeated! Your score: ${score}.`;
    if (itemsStolenCount > 0) {
      message += ` ${itemsStolenCount} item${itemsStolenCount > 1 ? 's' : ''} stolen.`;
    }
    if (energyLoss > 0) {
      message += ` Lost ${energyLoss} energy.`;
    }

    return {
      type: 'failure',
      message,
      consequence: {
        energyLoss,
        itemLossRisk: 0, // Not used for scoundrel (we steal exact items)
        forcedRetreat: false,
        encounterLockout: false,
        // Store item IDs to steal for scoundrel encounters
        itemsToSteal: consequences.itemsToSteal,
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
    const currentLife = this.state.currentLife;
    const isDungeonCompleted =
      this.state.currentRoom >= this.state.dungeon.length;

    // Determine success or failure
    const isSuccess = currentLife > 0 && isDungeonCompleted;

    this.state.isResolved = true;

    const outcome = isSuccess
      ? this.generateSuccessOutcome(score)
      : this.generateFailureOutcome(score, runInventory || []);

    this.state.outcome = outcome;
    return outcome;
  }
}
