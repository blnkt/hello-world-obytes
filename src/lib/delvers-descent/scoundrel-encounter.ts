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
    // TODO: Implement in Task 3.1
    this.state.dungeon = [];
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
}
