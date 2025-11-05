import {
  BONUS_TYPES,
  type CollectedItem,
  COLLECTION_SET_TYPES,
  type CollectionSet,
  type DelvingRun,
  type DelvingStats,
  type DungeonNode,
  ENCOUNTER_TYPES,
  type EncounterData,
  isCollectedItem,
  isDelvingRun,
  isDungeonNode,
  isRunState,
  isValidEncounterType,
  type Region,
  type RiskData,
  type RunState,
  type Shortcut,
} from './delvers-descent';

describe("Delver's Descent Types", () => {
  describe('DelvingRun interface', () => {
    it('should create a valid DelvingRun object', () => {
      const run: DelvingRun = {
        id: 'run-123',
        date: '2024-01-15',
        steps: 8000,
        baseEnergy: 8000,
        bonusEnergy: 1600,
        totalEnergy: 9600,
        hasStreakBonus: true,
        status: 'queued',
      };

      expect(run.id).toBe('run-123');
      expect(run.steps).toBe(8000);
      expect(run.totalEnergy).toBe(9600);
      expect(run.hasStreakBonus).toBe(true);
      expect(run.status).toBe('queued');
    });

    it('should validate all status types', () => {
      const statuses: DelvingRun['status'][] = [
        'queued',
        'active',
        'completed',
        'busted',
      ];

      statuses.forEach((status) => {
        const run: DelvingRun = {
          id: 'test',
          date: '2024-01-15',
          steps: 1000,
          baseEnergy: 1000,
          bonusEnergy: 0,
          totalEnergy: 1000,
          hasStreakBonus: false,
          status,
        };
        expect(run.status).toBe(status);
      });
    });
  });

  describe('DungeonNode interface', () => {
    it('should create a valid DungeonNode object', () => {
      const node: DungeonNode = {
        id: 'depth1-node0',
        depth: 1,
        position: 0,
        type: 'puzzle_chamber',
        energyCost: 15,
        returnCost: 5,
        isRevealed: false,
        connections: ['depth2-node0', 'depth2-node1'],
      };

      expect(node.id).toBe('depth1-node0');
      expect(node.depth).toBe(1);
      expect(node.position).toBe(0);
      expect(node.type).toBe('puzzle_chamber');
      expect(node.energyCost).toBe(15);
      expect(node.returnCost).toBe(5);
      expect(node.isRevealed).toBe(false);
      expect(node.connections).toHaveLength(2);
    });

    it('should support all encounter types', () => {
      ENCOUNTER_TYPES.forEach((type) => {
        const node: DungeonNode = {
          id: 'test',
          depth: 1,
          position: 0,
          type,
          energyCost: 10,
          returnCost: 5,
          isRevealed: false,
          connections: [],
        };
        expect(node.type).toBe(type);
      });
    });

    it('should create a valid DungeonNode with scoundrel type', () => {
      const node: DungeonNode = {
        id: 'scoundrel-node',
        depth: 3,
        position: 1,
        type: 'scoundrel',
        energyCost: 25,
        returnCost: 15,
        isRevealed: false,
        connections: [],
      };

      expect(node.type).toBe('scoundrel');
      expect(node.depth).toBe(3);
      expect(node.energyCost).toBe(25);
    });
  });

  describe('RunState interface', () => {
    it('should create a valid RunState object', () => {
      const state: RunState = {
        runId: 'run-123',
        currentDepth: 2,
        currentNode: 'depth2-node1',
        energyRemaining: 75,
        inventory: [],
        visitedNodes: ['depth1-node0', 'depth2-node1'],
        discoveredShortcuts: [],
      };

      expect(state.runId).toBe('run-123');
      expect(state.currentDepth).toBe(2);
      expect(state.currentNode).toBe('depth2-node1');
      expect(state.energyRemaining).toBe(75);
      expect(state.inventory).toEqual([]);
      expect(state.visitedNodes).toHaveLength(2);
      expect(state.discoveredShortcuts).toEqual([]);
    });
  });

  describe('CollectedItem interface', () => {
    it('should create a valid CollectedItem object', () => {
      const item: CollectedItem = {
        id: 'item-123',
        type: 'trade_good',
        setId: 'silk_road_set',
        value: 50,
        name: 'Silk Fabric',
        description: 'Fine silk from the eastern markets',
      };

      expect(item.id).toBe('item-123');
      expect(item.type).toBe('trade_good');
      expect(item.setId).toBe('silk_road_set');
      expect(item.value).toBe(50);
      expect(item.name).toBe('Silk Fabric');
      expect(item.description).toBe('Fine silk from the eastern markets');
    });

    it('should support all collection types', () => {
      COLLECTION_SET_TYPES.forEach((type) => {
        const item: CollectedItem = {
          id: 'test',
          type,
          setId: 'test_set',
          value: 10,
          name: 'Test Item',
          description: 'Test description',
        };
        expect(item.type).toBe(type);
      });
    });
  });

  describe('Shortcut interface', () => {
    it('should create a valid Shortcut object', () => {
      const shortcut: Shortcut = {
        id: 'shortcut-123',
        fromDepth: 3,
        toDepth: 1,
        energyReduction: 20,
        isPermanent: true,
      };

      expect(shortcut.id).toBe('shortcut-123');
      expect(shortcut.fromDepth).toBe(3);
      expect(shortcut.toDepth).toBe(1);
      expect(shortcut.energyReduction).toBe(20);
      expect(shortcut.isPermanent).toBe(true);
    });
  });

  describe('EncounterData interface', () => {
    it('should create a valid EncounterData object', () => {
      const encounter: EncounterData = {
        id: 'encounter-123',
        type: 'risk_event',
        title: "Dragon's Hoard",
        description: 'A legendary treasure guarded by ancient magic',
        energyCost: 30,
        rewards: [],
        risks: [],
      };

      expect(encounter.id).toBe('encounter-123');
      expect(encounter.type).toBe('risk_event');
      expect(encounter.title).toBe("Dragon's Hoard");
      expect(encounter.description).toBe(
        'A legendary treasure guarded by ancient magic'
      );
      expect(encounter.energyCost).toBe(30);
      expect(encounter.rewards).toEqual([]);
      expect(encounter.risks).toEqual([]);
    });

    it('should create a valid EncounterData object with scoundrel type', () => {
      const encounter: EncounterData = {
        id: 'scoundrel-encounter-1',
        type: 'scoundrel',
        title: 'Scoundrel Challenge',
        description: 'A strategic dungeon challenge',
        energyCost: 20,
        rewards: [],
        risks: [],
      };

      expect(encounter.id).toBe('scoundrel-encounter-1');
      expect(encounter.type).toBe('scoundrel');
      expect(encounter.title).toBe('Scoundrel Challenge');
      expect(encounter.energyCost).toBe(20);
    });
  });

  describe('RiskData interface', () => {
    it('should create a valid RiskData object', () => {
      const risk: RiskData = {
        id: 'risk-123',
        description: 'Ancient curse activates',
        probability: 0.3,
        consequence: 'lose_energy',
        value: 15,
      };

      expect(risk.id).toBe('risk-123');
      expect(risk.description).toBe('Ancient curse activates');
      expect(risk.probability).toBe(0.3);
      expect(risk.consequence).toBe('lose_energy');
      expect(risk.value).toBe(15);
    });

    it('should validate all consequence types', () => {
      const consequences: RiskData['consequence'][] = [
        'lose_energy',
        'lose_item',
        'force_retreat',
        'bust',
      ];

      consequences.forEach((consequence) => {
        const risk: RiskData = {
          id: 'test',
          description: 'Test risk',
          probability: 0.5,
          consequence,
          value: 10,
        };
        expect(risk.consequence).toBe(consequence);
      });
    });
  });

  describe('CollectionSet interface', () => {
    it('should create a valid CollectionSet object', () => {
      const set: CollectionSet = {
        id: 'silk_road_set',
        name: 'Silk Road Collection',
        description: 'Ancient trading route treasures',
        category: 'trade_goods',
        items: [],
        bonuses: [
          {
            type: 'energy_efficiency',
            value: 10,
            description: '+10% energy efficiency',
            stackingType: 'additive',
          },
        ],
      };

      expect(set.id).toBe('silk_road_set');
      expect(set.name).toBe('Silk Road Collection');
      expect(set.description).toBe('Ancient trading route treasures');
      expect(set.category).toBe('trade_goods');
      expect(set.items).toEqual([]);
      expect(set.bonuses).toHaveLength(1);
      expect(set.bonuses[0].type).toBe('energy_efficiency');
      expect(set.bonuses[0].value).toBe(10);
    });

    it('should support all bonus types', () => {
      BONUS_TYPES.forEach((bonusType) => {
        const set: CollectionSet = {
          id: 'test',
          name: 'Test Set',
          description: 'Test collection',
          category: 'trade_goods',
          items: [],
          bonuses: [
            {
              type: bonusType,
              value: 5,
              description: 'Test bonus',
              stackingType: 'additive',
            },
          ],
        };
        expect(set.bonuses[0].type).toBe(bonusType);
      });
    });
  });

  describe('Region interface', () => {
    it('should create a valid Region object', () => {
      const region: Region = {
        id: 'forest_depths',
        name: 'Forest Depths',
        description: 'Ancient woodland with hidden paths',
        theme: 'ancient_forest',
        isUnlocked: false,
        unlockRequirements: {},
        startingBonus: {
          energyBonus: 0,
          itemsBonus: 0,
        },
        encounterDistribution: {
          puzzle_chamber: 19,
          discovery_site: 26,
          risk_event: 12,
          hazard: 17,
          rest_site: 13,
          safe_passage: 9,
          region_shortcut: 0,
          scoundrel: 5,
        },
      };

      expect(region.id).toBe('forest_depths');
      expect(region.name).toBe('Forest Depths');
      expect(region.description).toBe('Ancient woodland with hidden paths');
      expect(region.theme).toBe('ancient_forest');
      expect(region.isUnlocked).toBe(false);
      expect(region.encounterDistribution.puzzle_chamber).toBe(19);
      expect(region.startingBonus.energyBonus).toBe(0);
    });
  });

  describe('DelvingStats interface', () => {
    it('should create a valid DelvingStats object', () => {
      const stats: DelvingStats = {
        totalRuns: 15,
        queuedRuns: 2,
        completedRuns: 12,
        bustedRuns: 3,
        activeRuns: 1,
        totalSteps: 150000,
        averageSteps: 10000,
      };

      expect(stats.totalRuns).toBe(15);
      expect(stats.queuedRuns).toBe(2);
      expect(stats.completedRuns).toBe(12);
      expect(stats.bustedRuns).toBe(3);
      expect(stats.activeRuns).toBe(1);
      expect(stats.totalSteps).toBe(150000);
      expect(stats.averageSteps).toBe(10000);
    });
  });

  describe('Type Guards', () => {
    describe('isDelvingRun', () => {
      it('should return true for valid DelvingRun objects', () => {
        const validRun: DelvingRun = {
          id: 'test',
          date: '2024-01-15',
          steps: 1000,
          baseEnergy: 1000,
          bonusEnergy: 0,
          totalEnergy: 1000,
          hasStreakBonus: false,
          status: 'queued',
        };

        expect(isDelvingRun(validRun)).toBe(true);
      });

      it('should return false for invalid objects', () => {
        expect(isDelvingRun(null)).toBe(false);
        expect(isDelvingRun(undefined)).toBe(false);
        expect(isDelvingRun({})).toBe(false);
        expect(isDelvingRun({ id: 'test' })).toBe(false);
        expect(
          isDelvingRun({ id: 'test', date: '2024-01-15', steps: 'invalid' })
        ).toBe(false);
      });
    });

    describe('isDungeonNode', () => {
      it('should return true for valid DungeonNode objects', () => {
        const validNode: DungeonNode = {
          id: 'test',
          depth: 1,
          position: 0,
          type: 'puzzle_chamber',
          energyCost: 10,
          returnCost: 5,
          isRevealed: false,
          connections: [],
        };

        expect(isDungeonNode(validNode)).toBe(true);
      });

      it('should return false for invalid objects', () => {
        expect(isDungeonNode(null)).toBe(false);
        expect(isDungeonNode({})).toBe(false);
        expect(isDungeonNode({ id: 'test' })).toBe(false);
      });
    });

    describe('isRunState', () => {
      it('should return true for valid RunState objects', () => {
        const validState: RunState = {
          runId: 'test',
          currentDepth: 1,
          currentNode: 'node1',
          energyRemaining: 100,
          inventory: [],
          visitedNodes: [],
          discoveredShortcuts: [],
        };

        expect(isRunState(validState)).toBe(true);
      });

      it('should return false for invalid objects', () => {
        expect(isRunState(null)).toBe(false);
        expect(isRunState({})).toBe(false);
        expect(isRunState({ runId: 'test' })).toBe(false);
      });
    });

    describe('isCollectedItem', () => {
      it('should return true for valid CollectedItem objects', () => {
        const validItem: CollectedItem = {
          id: 'test',
          type: 'trade_good',
          setId: 'test_set',
          value: 10,
          name: 'Test Item',
          description: 'Test description',
        };

        expect(isCollectedItem(validItem)).toBe(true);
      });

      it('should return false for invalid objects', () => {
        expect(isCollectedItem(null)).toBe(false);
        expect(isCollectedItem({})).toBe(false);
        expect(isCollectedItem({ id: 'test' })).toBe(false);
      });
    });

    describe('isValidEncounterType', () => {
      it('should return true for valid encounter types', () => {
        ENCOUNTER_TYPES.forEach((type) => {
          expect(isValidEncounterType(type)).toBe(true);
        });
      });

      it('should return true for scoundrel encounter type', () => {
        expect(isValidEncounterType('scoundrel')).toBe(true);
      });

      it('should return true for metaphysical encounter types', () => {
        expect(isValidEncounterType('luck_shrine')).toBe(true);
        expect(isValidEncounterType('energy_nexus')).toBe(true);
        expect(isValidEncounterType('time_distortion')).toBe(true);
        expect(isValidEncounterType('fate_weaver')).toBe(true);
      });

      it('should return false for invalid encounter types', () => {
        expect(isValidEncounterType('invalid_type')).toBe(false);
        expect(isValidEncounterType('')).toBe(false);
        expect(isValidEncounterType('puzzle')).toBe(false);
      });
    });
  });

  describe('Constants', () => {
    it('should have correct ENCOUNTER_TYPES', () => {
      expect(ENCOUNTER_TYPES).toEqual([
        'puzzle_chamber',
        'discovery_site',
        'risk_event',
        'hazard',
        'rest_site',
        'safe_passage',
        'region_shortcut',
        'scoundrel',
        'luck_shrine',
        'energy_nexus',
        'time_distortion',
        'fate_weaver',
      ]);
    });

    it('should have correct COLLECTION_SET_TYPES', () => {
      expect(COLLECTION_SET_TYPES).toEqual([
        'trade_good',
        'discovery',
        'legendary',
      ]);
    });

    it('should have correct BONUS_TYPES', () => {
      expect(BONUS_TYPES).toEqual([
        'energy_efficiency',
        'starting_bonus',
        'unlock_region',
        'permanent_ability',
      ]);
    });
  });
});
