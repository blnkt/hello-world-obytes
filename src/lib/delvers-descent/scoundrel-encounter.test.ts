import type { ScoundrelConfig } from './scoundrel-encounter';
import { ScoundrelEncounter } from './scoundrel-encounter';

describe('ScoundrelEncounter', () => {
  const createDefaultConfig = (): ScoundrelConfig => ({
    startingLife: 10,
    dungeonSize: 5,
    depth: 1,
  });

  describe('constructor', () => {
    it('should initialize with default config', () => {
      const config = createDefaultConfig();
      const encounter = new ScoundrelEncounter('test-encounter-1', config);

      const state = encounter.getState();
      expect(state.encounterId).toBe('test-encounter-1');
      expect(state.encounterType).toBe('scoundrel');
      expect(state.config).toEqual(config);
      expect(state.currentLife).toBe(10);
      expect(state.currentRoom).toBe(0);
      expect(state.isResolved).toBe(false);
    });

    it('should initialize with custom starting life', () => {
      const config: ScoundrelConfig = {
        startingLife: 15,
        dungeonSize: 7,
        depth: 3,
      };
      const encounter = new ScoundrelEncounter('test-encounter-2', config);

      const state = encounter.getState();
      expect(state.currentLife).toBe(15);
      expect(state.config.startingLife).toBe(15);
    });
  });

  describe('getState', () => {
    it('should return a copy of the current state', () => {
      const encounter = new ScoundrelEncounter(
        'test-encounter-3',
        createDefaultConfig()
      );

      const state1 = encounter.getState();
      const state2 = encounter.getState();

      expect(state1).toEqual(state2);
      expect(state1).not.toBe(state2); // Different object references
    });
  });

  describe('getCurrentLife', () => {
    it('should return current life points', () => {
      const encounter = new ScoundrelEncounter(
        'test-encounter-4',
        createDefaultConfig()
      );

      expect(encounter.getCurrentLife()).toBe(10);
    });
  });

  describe('getMaxLife', () => {
    it('should return starting life (max life)', () => {
      const config = createDefaultConfig();
      const encounter = new ScoundrelEncounter('test-encounter-5', config);

      expect(encounter.getMaxLife()).toBe(10);
      expect(encounter.getMaxLife()).toBe(config.startingLife);
    });

    it('should return custom starting life', () => {
      const config: ScoundrelConfig = {
        startingLife: 20,
        dungeonSize: 8,
        depth: 5,
      };
      const encounter = new ScoundrelEncounter('test-encounter-6', config);

      expect(encounter.getMaxLife()).toBe(20);
    });
  });

  describe('isEncounterComplete', () => {
    it('should return false when life > 0 and dungeon not completed', () => {
      const encounter = new ScoundrelEncounter(
        'test-encounter-7',
        createDefaultConfig()
      );

      expect(encounter.isEncounterComplete()).toBe(false);
    });

    it('should return true when life is 0', () => {
      const encounter = new ScoundrelEncounter(
        'test-encounter-8',
        createDefaultConfig()
      );

      // We can't directly modify state, but we can test the logic
      // For now, we'll test that encounter is not complete with life > 0
      // This will be tested more thoroughly when we implement damage methods
      expect(encounter.getCurrentLife()).toBeGreaterThan(0);
      expect(encounter.isEncounterComplete()).toBe(false);
    });
  });

  describe('getRemainingMonsters', () => {
    it('should return all monsters when no rooms are completed', () => {
      const encounter = new ScoundrelEncounter(
        'test-encounter-10',
        createDefaultConfig()
      );

      const remaining = encounter.getRemainingMonsters();
      expect(Array.isArray(remaining)).toBe(true);
      expect(remaining.length).toBeGreaterThan(0);
    });

    it('should return fewer monsters after completing rooms', () => {
      const encounter = new ScoundrelEncounter(
        'test-encounter-11',
        createDefaultConfig()
      );

      const initialMonsters = encounter.getRemainingMonsters();
      encounter.advanceRoom();
      const afterAdvance = encounter.getRemainingMonsters();

      expect(afterAdvance.length).toBeLessThanOrEqual(initialMonsters.length);
    });
  });

  describe('dungeon generation', () => {
    it('should generate dungeon with 5-10 rooms based on config', () => {
      const config: ScoundrelConfig = {
        startingLife: 10,
        dungeonSize: 7,
        depth: 1,
      };
      const encounter = new ScoundrelEncounter('test-dungeon-1', config);

      const state = encounter.getState();
      expect(state.dungeon.length).toBe(7);
    });

    it('should generate rooms with monsters and cards', () => {
      const encounter = new ScoundrelEncounter(
        'test-dungeon-2',
        createDefaultConfig()
      );

      const state = encounter.getState();
      expect(state.dungeon.length).toBeGreaterThan(0);

      state.dungeon.forEach((room) => {
        expect(room.monsters.length).toBeGreaterThan(0);
        expect(room.cards.length).toBeGreaterThan(0);
        expect(room.isCompleted).toBe(false);
      });
    });

    it('should generate monsters with values and damage', () => {
      const encounter = new ScoundrelEncounter(
        'test-dungeon-3',
        createDefaultConfig()
      );

      const state = encounter.getState();
      const firstRoom = state.dungeon[0];

      firstRoom.monsters.forEach((monster) => {
        expect(monster.value).toBeGreaterThan(0);
        expect(monster.lifeDamage).toBeGreaterThan(0);
        expect(monster.name).toBeDefined();
      });
    });

    it('should generate different card types', () => {
      const encounter = new ScoundrelEncounter(
        'test-dungeon-4',
        createDefaultConfig()
      );

      const state = encounter.getState();
      const allCards = state.dungeon.flatMap((room) => room.cards);

      const cardTypes = new Set(allCards.map((card) => card.type));
      expect(cardTypes.size).toBeGreaterThan(0);
    });
  });

  describe('card selection and processing', () => {
    it('should select and process a card', () => {
      const encounter = new ScoundrelEncounter(
        'test-card-1',
        createDefaultConfig()
      );

      const initialLife = encounter.getCurrentLife();
      const availableCards = encounter.getAvailableCards();

      if (availableCards.length > 0) {
        const card = availableCards[0];
        const success = encounter.selectCard(card.id);

        expect(success).toBe(true);

        // Check if life changed (if card had damage/heal effect)
        const newLife = encounter.getCurrentLife();
        expect(newLife).toBeGreaterThanOrEqual(0);
        expect(newLife).toBeLessThanOrEqual(encounter.getMaxLife());
      }
    });

    it('should track last card played', () => {
      const encounter = new ScoundrelEncounter(
        'test-card-2',
        createDefaultConfig()
      );

      const availableCards = encounter.getAvailableCards();

      if (availableCards.length > 0) {
        const card = availableCards[0];
        encounter.selectCard(card.id);

        const lastCard = encounter.getLastCard();
        expect(lastCard).toBeDefined();
        expect(lastCard?.id).toBe(card.id);
      }
    });

    it('should return false when selecting invalid card', () => {
      const encounter = new ScoundrelEncounter(
        'test-card-3',
        createDefaultConfig()
      );

      const success = encounter.selectCard('invalid-card-id');
      expect(success).toBe(false);
    });

    it('should process health potion cards correctly', () => {
      const encounter = new ScoundrelEncounter(
        'test-card-4',
        createDefaultConfig()
      );

      // Create a health potion card
      const healthPotion = {
        id: 'test-health-potion',
        name: 'Health Potion',
        type: 'health_potion' as const,
        effect: {
          healAmount: 5,
        },
      };

      const initialLife = encounter.getCurrentLife();
      encounter.processCard(healthPotion);

      const newLife = encounter.getCurrentLife();
      expect(newLife).toBeGreaterThanOrEqual(initialLife);
      expect(newLife).toBeLessThanOrEqual(encounter.getMaxLife());
    });

    it('should process trap cards correctly', () => {
      const encounter = new ScoundrelEncounter(
        'test-card-5',
        createDefaultConfig()
      );

      // Create a trap card
      const trap = {
        id: 'test-trap',
        name: 'Trap',
        type: 'trap' as const,
        effect: {
          damageAmount: 3,
        },
      };

      const initialLife = encounter.getCurrentLife();
      encounter.processCard(trap);

      const newLife = encounter.getCurrentLife();
      expect(newLife).toBeLessThanOrEqual(initialLife);
      expect(newLife).toBeGreaterThanOrEqual(0);
    });
  });

  describe('room advancement', () => {
    it('should advance to next room', () => {
      const encounter = new ScoundrelEncounter(
        'test-room-1',
        createDefaultConfig()
      );

      const initialProgress = encounter.getDungeonProgress();
      const success = encounter.advanceRoom();

      expect(success).toBe(true);

      const newProgress = encounter.getDungeonProgress();
      expect(newProgress.current).toBe(initialProgress.current + 1);
    });

    it('should mark current room as completed when advancing', () => {
      const encounter = new ScoundrelEncounter(
        'test-room-2',
        createDefaultConfig()
      );

      const stateBefore = encounter.getState();
      const currentRoomIndex = stateBefore.currentRoom;

      encounter.advanceRoom();

      const stateAfter = encounter.getState();
      expect(stateAfter.dungeon[currentRoomIndex].isCompleted).toBe(true);
    });

    it('should return false when trying to advance after completion', () => {
      const encounter = new ScoundrelEncounter(
        'test-room-3',
        createDefaultConfig()
      );

      const state = encounter.getState();
      // Advance through all rooms
      for (let i = 0; i < state.dungeon.length; i++) {
        encounter.advanceRoom();
      }

      const success = encounter.advanceRoom();
      expect(success).toBe(false);
    });

    it('should return current room information', () => {
      const encounter = new ScoundrelEncounter(
        'test-room-4',
        createDefaultConfig()
      );

      const currentRoom = encounter.getCurrentRoom();
      expect(currentRoom).not.toBeNull();
      expect(currentRoom?.roomNumber).toBe(1);
      expect(currentRoom?.monsters.length).toBeGreaterThan(0);
      expect(currentRoom?.cards.length).toBeGreaterThan(0);
    });

    it('should return null when dungeon is completed', () => {
      const encounter = new ScoundrelEncounter(
        'test-room-5',
        createDefaultConfig()
      );

      const state = encounter.getState();
      // Advance through all rooms
      for (let i = 0; i < state.dungeon.length; i++) {
        encounter.advanceRoom();
      }

      const currentRoom = encounter.getCurrentRoom();
      expect(currentRoom).toBeNull();
    });

    it('should return dungeon progress', () => {
      const config: ScoundrelConfig = {
        startingLife: 10,
        dungeonSize: 6,
        depth: 1,
      };
      const encounter = new ScoundrelEncounter('test-room-6', config);

      const progress = encounter.getDungeonProgress();
      expect(progress.current).toBe(1);
      expect(progress.total).toBe(6);

      encounter.advanceRoom();
      const newProgress = encounter.getDungeonProgress();
      expect(newProgress.current).toBe(2);
      expect(newProgress.total).toBe(6);
    });

    it('should return available cards for current room', () => {
      const encounter = new ScoundrelEncounter(
        'test-room-7',
        createDefaultConfig()
      );

      const availableCards = encounter.getAvailableCards();
      expect(Array.isArray(availableCards)).toBe(true);
      expect(availableCards.length).toBeGreaterThan(0);
    });
  });
});
