import { type EncounterType } from '@/types/delvers-descent';

import type { AdvancedEncounterOutcome } from './risk-event-encounter';

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

export class ScoundrelEncounter {
  private state: ScoundrelState;
  private lastCardPlayed?: Card;

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
}
