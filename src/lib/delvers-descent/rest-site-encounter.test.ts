import { type AdvancedEncounterItem } from '@/types/delvers-descent';

import {
  type RestSiteConfig,
  RestSiteEncounter,
  type RestSiteType,
} from './rest-site-encounter';

describe('RestSiteEncounter', () => {
  let encounter: RestSiteEncounter;
  let config: RestSiteConfig;

  beforeEach(() => {
    config = {
      restSiteType: 'ancient_shrine',
      quality: 5,
      baseReward: {
        energy: 0,
        items: [
          {
            id: 'rest_site_loot',
            name: 'Rest Site Loot',
            quantity: 1,
            rarity: 'common',
            type: 'trade_good',
            setId: 'rest_set',
            value: 10,
            description: 'Loot from rest site',
          } as AdvancedEncounterItem,
        ],
        xp: 25,
      },
      energyReserve: {
        maxCapacity: 100,
        currentCapacity: 100,
        regenerationRate: 10,
      },
      strategicIntel: {
        mapReveals: 3,
        shortcutHints: 2,
        hazardWarnings: 1,
      },
      failureConsequence: {
        energyLoss: 10,
        itemLossRisk: 0.2,
        forcedRetreat: false,
        encounterLockout: false,
      },
    };
    encounter = new RestSiteEncounter('test-rest-1', config);
  });

  describe('encounter initialization', () => {
    it('should initialize with correct state', () => {
      const state = encounter.getState();

      expect(state.encounterId).toBe('test-rest-1');
      expect(state.encounterType).toBe('rest_site');
      expect(state.config).toEqual(config);
      expect(state.availableActions.length).toBeGreaterThan(3); // Base actions + site-specific
      expect(state.isResolved).toBe(false);
      expect(state.outcome).toBeUndefined();
    });

    it('should generate appropriate actions for different rest site types', () => {
      const restSiteTypes: RestSiteType[] = [
        'ancient_shrine',
        'crystal_cave',
        'mystic_grove',
        'energy_well',
        'guardian_sanctuary',
      ];

      restSiteTypes.forEach((restSiteType) => {
        const siteConfig = { ...config, restSiteType };
        const siteEncounter = new RestSiteEncounter(
          `test-${restSiteType}`,
          siteConfig
        );
        const actions = siteEncounter.getState().availableActions;

        expect(actions.length).toBeGreaterThanOrEqual(3); // At least base actions
        expect(actions.find((a) => a.id === 'quick_rest')).toBeDefined();
        expect(actions.find((a) => a.id === 'thorough_rest')).toBeDefined();
        expect(actions.find((a) => a.id === 'meditation')).toBeDefined();
      });
    });

    it('should include site-specific actions', () => {
      const shrineConfig = {
        ...config,
        restSiteType: 'ancient_shrine' as RestSiteType,
      };
      const shrineEncounter = new RestSiteEncounter(
        'shrine-test',
        shrineConfig
      );
      const actions = shrineEncounter.getState().availableActions;

      expect(actions.find((a) => a.id === 'prayer')).toBeDefined();
      expect(actions.find((a) => a.id === 'offering')).toBeDefined();
    });

    it('should scale action benefits with quality', () => {
      const lowQualityConfig = { ...config, quality: 2 };
      const highQualityConfig = { ...config, quality: 8 };

      const lowQualityEncounter = new RestSiteEncounter(
        'low-quality',
        lowQualityConfig
      );
      const highQualityEncounter = new RestSiteEncounter(
        'high-quality',
        highQualityConfig
      );

      const lowActions = lowQualityEncounter.getState().availableActions;
      const highActions = highQualityEncounter.getState().availableActions;

      const lowQuickRest = lowActions.find((a) => a.id === 'quick_rest')!;
      const highQuickRest = highActions.find((a) => a.id === 'quick_rest')!;

      expect(highQuickRest.energyGain).toBeGreaterThan(lowQuickRest.energyGain);

      // Test thorough rest instead (which has intel gain)
      const lowThoroughRest = lowActions.find((a) => a.id === 'thorough_rest')!;
      const highThoroughRest = highActions.find(
        (a) => a.id === 'thorough_rest'
      )!;

      expect(highThoroughRest.intelGain.mapReveals).toBeGreaterThan(
        lowThoroughRest.intelGain.mapReveals
      );
    });
  });

  describe('action selection', () => {
    it('should allow selecting valid actions', () => {
      const state = encounter.getState();
      const action = state.availableActions[0];

      const result = encounter.selectAction(action.id);

      expect(result).toBe(true);
      expect(encounter.getState().selectedAction).toEqual(action);
    });

    it('should reject invalid action IDs', () => {
      const result = encounter.selectAction('invalid-action');

      expect(result).toBe(false);
      expect(encounter.getState().selectedAction).toBeUndefined();
    });

    it('should update state when action is selected', () => {
      const state = encounter.getState();
      const action = state.availableActions[1];

      encounter.selectAction(action.id);
      const updatedState = encounter.getState();

      expect(updatedState.selectedAction).toEqual(action);
    });
  });

  describe('encounter resolution', () => {
    beforeEach(() => {
      const state = encounter.getState();
      encounter.selectAction(state.availableActions[0].id);
    });

    it('should resolve encounter with selected action', () => {
      const outcome = encounter.resolve();

      expect(outcome).toBeDefined();
      expect(outcome.type).toBe('success'); // Rest sites always succeed
      expect(outcome.message).toBeDefined();
      expect(outcome.reward).toBeDefined();
      expect(encounter.getState().isResolved).toBe(true);
    });

    it('should throw error if no action selected', () => {
      const newEncounter = new RestSiteEncounter('no-action', config);

      expect(() => newEncounter.resolve()).toThrow(
        'No action selected for rest site encounter'
      );
    });

    it('should return same outcome on multiple resolve calls', () => {
      const outcome1 = encounter.resolve();
      const outcome2 = encounter.resolve();

      expect(outcome1).toEqual(outcome2);
    });

    it('should generate energy rewards based on action', () => {
      const state = encounter.getState();
      const quickRestAction = state.availableActions.find(
        (a) => a.id === 'quick_rest'
      )!;

      encounter.selectAction(quickRestAction.id);
      const outcome = encounter.resolve();

      expect(outcome.type).toBe('success');
      expect(outcome.reward!.energy).toBeGreaterThanOrEqual(0);
    });

    it('should generate intel rewards based on action', () => {
      const state = encounter.getState();
      const thoroughRestAction = state.availableActions.find(
        (a) => a.id === 'thorough_rest'
      )!;

      encounter.selectAction(thoroughRestAction.id);
      const outcome = encounter.resolve();

      expect(outcome.type).toBe('success');
      expect(outcome.reward!.items.length).toBeGreaterThan(0);
      expect(outcome.reward!.xp).toBeGreaterThan(config.baseReward.xp);
    });
  });

  describe('energy reserve mechanics', () => {
    it('should limit energy gain to reserve capacity', () => {
      const limitedConfig = {
        ...config,
        energyReserve: {
          maxCapacity: 100,
          currentCapacity: 5, // Very low capacity
          regenerationRate: 10,
        },
      };
      const limitedEncounter = new RestSiteEncounter(
        'limited-test',
        limitedConfig
      );

      const state = limitedEncounter.getState();
      const highEnergyAction = state.availableActions.find(
        (a) => a.id === 'thorough_rest'
      )!;

      limitedEncounter.selectAction(highEnergyAction.id);
      const outcome = limitedEncounter.resolve();

      expect(outcome.reward!.energy).toBeLessThanOrEqual(5); // Should be limited by capacity
    });

    it('should handle net energy loss correctly', () => {
      const state = encounter.getState();
      const meditationAction = state.availableActions.find(
        (a) => a.id === 'meditation'
      )!;

      encounter.selectAction(meditationAction.id);
      const outcome = encounter.resolve();

      // Meditation has energy cost, so net gain might be negative
      expect(outcome.reward!.energy).toBeDefined();
    });
  });

  describe('intel reward calculation', () => {
    it('should generate map reveal items', () => {
      const state = encounter.getState();
      const thoroughRestAction = state.availableActions.find(
        (a) => a.id === 'thorough_rest'
      )!;

      encounter.selectAction(thoroughRestAction.id);
      const outcome = encounter.resolve();

      const mapRevealItem = outcome.reward!.items.find(
        (item: any) => item.id === 'map_reveal'
      );
      expect(mapRevealItem).toBeDefined();
      expect(mapRevealItem!.quantity).toBeGreaterThan(0);
    });

    it('should generate shortcut hint items', () => {
      const state = encounter.getState();
      const meditationAction = state.availableActions.find(
        (a) => a.id === 'meditation'
      )!;

      encounter.selectAction(meditationAction.id);
      const outcome = encounter.resolve();

      const shortcutHintItem = outcome.reward!.items.find(
        (item: any) => item.id === 'shortcut_hint'
      );
      expect(shortcutHintItem).toBeDefined();
      expect(shortcutHintItem!.rarity).toBe('rare');
    });

    it('should generate hazard warning items', () => {
      const state = encounter.getState();
      const meditationAction = state.availableActions.find(
        (a) => a.id === 'meditation'
      )!;

      encounter.selectAction(meditationAction.id);
      const outcome = encounter.resolve();

      const hazardWarningItem = outcome.reward!.items.find(
        (item: any) => item.id === 'hazard_warning'
      );
      expect(hazardWarningItem).toBeDefined();
      expect(hazardWarningItem!.rarity).toBe('uncommon');
    });
  });

  describe('site-specific mechanics', () => {
    it('should handle ancient shrine prayer', () => {
      const shrineConfig = {
        ...config,
        restSiteType: 'ancient_shrine' as RestSiteType,
      };
      const shrineEncounter = new RestSiteEncounter(
        'shrine-test',
        shrineConfig
      );
      const state = shrineEncounter.getState();
      const prayerAction = state.availableActions.find(
        (a) => a.id === 'prayer'
      )!;

      expect(prayerAction).toBeDefined();
      expect(prayerAction.specialEffect).toContain('divine guidance');
      expect(prayerAction.energyCost).toBe(0); // Prayer is free
    });

    it('should handle crystal cave harvesting', () => {
      const caveConfig = {
        ...config,
        restSiteType: 'crystal_cave' as RestSiteType,
      };
      const caveEncounter = new RestSiteEncounter('cave-test', caveConfig);
      const state = caveEncounter.getState();
      const harvestAction = state.availableActions.find(
        (a) => a.id === 'crystal_harvest'
      )!;

      expect(harvestAction).toBeDefined();
      expect(harvestAction.specialEffect).toContain('rare crystal formations');
      expect(harvestAction.energyGain).toBeGreaterThan(
        harvestAction.energyCost
      );
    });

    it('should handle energy well drawing', () => {
      const wellConfig = {
        ...config,
        restSiteType: 'energy_well' as RestSiteType,
      };
      const wellEncounter = new RestSiteEncounter('well-test', wellConfig);
      const state = wellEncounter.getState();
      const drawAction = state.availableActions.find(
        (a) => a.id === 'well_draw'
      )!;

      expect(drawAction).toBeDefined();
      expect(drawAction.specialEffect).toContain('ancient energy patterns');
      expect(drawAction.energyGain).toBeGreaterThan(15); // High energy gain
    });

    it('should handle guardian sanctuary counsel', () => {
      const sanctuaryConfig = {
        ...config,
        restSiteType: 'guardian_sanctuary' as RestSiteType,
      };
      const sanctuaryEncounter = new RestSiteEncounter(
        'sanctuary-test',
        sanctuaryConfig
      );
      const state = sanctuaryEncounter.getState();
      const counselAction = state.availableActions.find(
        (a) => a.id === 'guardian_counsel'
      )!;

      expect(counselAction).toBeDefined();
      expect(counselAction.specialEffect).toContain('ancient knowledge');
      expect(counselAction.intelGain.mapReveals).toBeGreaterThan(3); // High intel gain
    });
  });

  describe('static configuration creation', () => {
    it('should create rest site configuration for different types', () => {
      const restSiteTypes: RestSiteType[] = [
        'ancient_shrine',
        'crystal_cave',
        'mystic_grove',
        'energy_well',
        'guardian_sanctuary',
      ];

      restSiteTypes.forEach((restSiteType) => {
        const restSiteConfig = RestSiteEncounter.createRestSiteConfig(
          restSiteType,
          5,
          2
        );

        expect(restSiteConfig.restSiteType).toBe(restSiteType);
        expect(restSiteConfig.quality).toBeGreaterThan(0);
        expect(restSiteConfig.quality).toBeLessThanOrEqual(10);
        expect(restSiteConfig.energyReserve.maxCapacity).toBeGreaterThan(0);
        expect(restSiteConfig.strategicIntel.mapReveals).toBeGreaterThan(0);
      });
    });

    it('should scale configuration with depth', () => {
      const depth1Config = RestSiteEncounter.createRestSiteConfig(
        'ancient_shrine',
        5,
        1
      );
      const depth3Config = RestSiteEncounter.createRestSiteConfig(
        'ancient_shrine',
        5,
        3
      );

      expect(depth3Config.energyReserve.maxCapacity).toBeGreaterThan(
        depth1Config.energyReserve.maxCapacity
      );
      expect(depth3Config.baseReward.xp).toBeGreaterThan(
        depth1Config.baseReward.xp
      );
    });

    it('should clamp quality to valid range', () => {
      const lowQualityConfig = RestSiteEncounter.createRestSiteConfig(
        'ancient_shrine',
        0,
        1
      );
      const highQualityConfig = RestSiteEncounter.createRestSiteConfig(
        'ancient_shrine',
        15,
        1
      );

      expect(lowQualityConfig.quality).toBe(1);
      expect(highQualityConfig.quality).toBe(10);
    });
  });

  describe('edge cases', () => {
    it('should handle zero energy reserve capacity', () => {
      const zeroCapacityConfig = {
        ...config,
        energyReserve: {
          maxCapacity: 100,
          currentCapacity: 0,
          regenerationRate: 10,
        },
      };
      const zeroCapacityEncounter = new RestSiteEncounter(
        'zero-capacity',
        zeroCapacityConfig
      );

      const state = zeroCapacityEncounter.getState();
      zeroCapacityEncounter.selectAction(state.availableActions[0].id);

      const outcome = zeroCapacityEncounter.resolve();

      expect(outcome.reward!.energy).toBeLessThanOrEqual(0);
    });

    it('should handle actions with no intel gain', () => {
      const state = encounter.getState();
      const quickRestAction = state.availableActions.find(
        (a) => a.id === 'quick_rest'
      )!;

      encounter.selectAction(quickRestAction.id);
      const outcome = encounter.resolve();

      // Quick rest should have minimal intel items
      const intelItems = outcome.reward!.items.filter((item: any) =>
        ['map_reveal', 'shortcut_hint', 'hazard_warning'].includes(item.id)
      );
      expect(intelItems.length).toBe(0);
    });
  });

  describe('performance', () => {
    it('should resolve encounters within performance requirements', () => {
      const state = encounter.getState();
      encounter.selectAction(state.availableActions[0].id);

      const startTime = performance.now();
      encounter.resolve();
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50); // Should complete within 50ms
    });
  });
});
