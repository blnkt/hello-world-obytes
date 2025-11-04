import { type AdvancedEncounterItem } from '@/types/delvers-descent';

import {
  type HazardConfig,
  HazardEncounter,
  type ObstacleType,
} from './hazard-encounter';

describe('HazardEncounter', () => {
  let encounter: HazardEncounter;
  let config: HazardConfig;

  beforeEach(() => {
    config = {
      obstacleType: 'collapsed_passage',
      difficulty: 5,
      baseReward: {
        energy: 20,
        items: [
          {
            id: 'hazard_loot',
            name: 'Hazard Loot',
            quantity: 1,
            rarity: 'common',
            type: 'trade_good',
            setId: 'hazard_set',
            value: 10,
            description: 'Loot from hazard',
          } as AdvancedEncounterItem,
        ],
        xp: 40,
      },
      failureConsequence: {
        energyLoss: 15,
        itemLossRisk: 0.3,
        forcedRetreat: false,
        encounterLockout: false,
      },
    };
    encounter = new HazardEncounter('test-hazard-1', config);
  });

  describe('encounter initialization', () => {
    it('should initialize with correct state', () => {
      const state = encounter.getState();

      expect(state.encounterId).toBe('test-hazard-1');
      expect(state.encounterType).toBe('hazard');
      expect(state.config).toEqual(config);
      expect(state.availablePaths.length).toBeGreaterThan(3); // Base paths + obstacle-specific
      expect(state.isResolved).toBe(false);
      expect(state.outcome).toBeUndefined();
    });

    it('should generate appropriate paths for different obstacle types', () => {
      const obstacleTypes: ObstacleType[] = [
        'collapsed_passage',
        'treacherous_bridge',
        'ancient_guardian',
        'energy_drain',
        'maze_of_mirrors',
      ];

      obstacleTypes.forEach((obstacleType) => {
        const obstacleConfig = { ...config, obstacleType };
        const obstacleEncounter = new HazardEncounter(
          `test-${obstacleType}`,
          obstacleConfig
        );
        const paths = obstacleEncounter.getState().availablePaths;

        expect(paths.length).toBeGreaterThanOrEqual(3); // At least base paths
        expect(paths.find((p) => p.id === 'pay_toll')).toBeDefined();
        expect(paths.find((p) => p.id === 'alternate_route')).toBeDefined();
        expect(paths.find((p) => p.id === 'risky_gamble')).toBeDefined();
      });
    });

    it('should include obstacle-specific paths', () => {
      const guardianConfig = {
        ...config,
        obstacleType: 'ancient_guardian' as ObstacleType,
      };
      const guardianEncounter = new HazardEncounter(
        'guardian-test',
        guardianConfig
      );
      const paths = guardianEncounter.getState().availablePaths;

      expect(paths.find((p) => p.id === 'negotiate')).toBeDefined();
      expect(paths.find((p) => p.id === 'outsmart')).toBeDefined();
    });

    it('should scale path costs and success rates with difficulty', () => {
      const easyConfig = { ...config, difficulty: 2 };
      const hardConfig = { ...config, difficulty: 8 };

      const easyEncounter = new HazardEncounter('easy-test', easyConfig);
      const hardEncounter = new HazardEncounter('hard-test', hardConfig);

      const easyPaths = easyEncounter.getState().availablePaths;
      const hardPaths = hardEncounter.getState().availablePaths;

      const easyPayToll = easyPaths.find((p) => p.id === 'pay_toll')!;
      const hardPayToll = hardPaths.find((p) => p.id === 'pay_toll')!;

      expect(hardPayToll.energyCost).toBeGreaterThan(easyPayToll.energyCost);
      // Pay toll always succeeds, so success rate doesn't change
      expect(hardPayToll.successRate).toBe(easyPayToll.successRate);

      // Test alternate route instead
      const easyAlternate = easyPaths.find((p) => p.id === 'alternate_route')!;
      const hardAlternate = hardPaths.find((p) => p.id === 'alternate_route')!;

      expect(hardAlternate.successRate).toBeLessThan(easyAlternate.successRate);
    });
  });

  describe('path selection', () => {
    it('should allow selecting valid paths', () => {
      const state = encounter.getState();
      const path = state.availablePaths[0];

      const result = encounter.selectPath(path.id);

      expect(result).toBe(true);
      expect(encounter.getState().selectedPath).toEqual(path);
    });

    it('should reject invalid path IDs', () => {
      const result = encounter.selectPath('invalid-path');

      expect(result).toBe(false);
      expect(encounter.getState().selectedPath).toBeUndefined();
    });

    it('should update state when path is selected', () => {
      const state = encounter.getState();
      const path = state.availablePaths[1];

      encounter.selectPath(path.id);
      const updatedState = encounter.getState();

      expect(updatedState.selectedPath).toEqual(path);
    });
  });

  describe('encounter resolution', () => {
    beforeEach(() => {
      const state = encounter.getState();
      encounter.selectPath(state.availablePaths[0].id);
    });

    it('should resolve encounter with selected path', () => {
      const outcome = encounter.resolve();

      expect(outcome).toBeDefined();
      expect(outcome.type).toMatch(/^(success|failure)$/);
      expect(outcome.message).toBeDefined();
      expect(encounter.getState().isResolved).toBe(true);
    });

    it('should throw error if no path selected', () => {
      const newEncounter = new HazardEncounter('no-path', config);

      expect(() => newEncounter.resolve()).toThrow(
        'No path selected for hazard encounter'
      );
    });

    it('should return same outcome on multiple resolve calls', () => {
      const outcome1 = encounter.resolve();
      const outcome2 = encounter.resolve();

      expect(outcome1).toEqual(outcome2);
    });

    it('should generate success outcomes with modified rewards', () => {
      // Mock Math.random to ensure success
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.1); // Low number ensures success

      const outcome = encounter.resolve();

      expect(outcome.type).toBe('success');
      expect(outcome.reward).toBeDefined();
      expect(outcome.reward!.energy).toBe(0);
      expect(outcome.reward!.items).toBeDefined();
      expect(outcome.reward!.xp).toBeGreaterThan(0);

      Math.random = originalRandom;
    });

    it('should generate failure outcomes with consequences', () => {
      // Select a path that can fail (not pay_toll which always succeeds)
      const state = encounter.getState();
      const riskyPath = state.availablePaths.find(
        (p) => p.id === 'risky_gamble'
      )!;
      encounter.selectPath(riskyPath.id);

      // Mock Math.random to ensure failure
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.95); // Very high number ensures failure

      const outcome = encounter.resolve();

      expect(outcome.type).toBe('failure');
      expect(outcome.consequence).toBeDefined();
      expect(outcome.consequence!.energyLoss).toBeGreaterThan(0);
      expect(outcome.consequence!.itemLossRisk).toBeGreaterThanOrEqual(0);
      expect(typeof outcome.consequence!.forcedRetreat).toBe('boolean');

      Math.random = originalRandom;
    });
  });

  describe('path modifiers', () => {
    it('should apply reward modifiers on success', () => {
      const state = encounter.getState();
      const riskyPath = state.availablePaths.find(
        (p) => p.id === 'risky_gamble'
      )!;

      encounter.selectPath(riskyPath.id);

      // Mock Math.random to ensure success
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.1);

      const outcome = encounter.resolve();

      if (outcome.type === 'success') {
        expect(outcome.reward!.energy).toBe(0);
        expect(outcome.reward!.xp).toBeGreaterThan(config.baseReward.xp);
      }

      Math.random = originalRandom;
    });

    it('should apply consequence modifiers on failure', () => {
      const state = encounter.getState();
      const riskyPath = state.availablePaths.find(
        (p) => p.id === 'risky_gamble'
      )!;

      encounter.selectPath(riskyPath.id);

      // Mock Math.random to ensure failure
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.9);

      const outcome = encounter.resolve();

      if (outcome.type === 'failure') {
        expect(outcome.consequence!.energyLoss).toBeGreaterThan(
          config.failureConsequence.energyLoss
        );
      }

      Math.random = originalRandom;
    });

    it('should handle pay toll path correctly', () => {
      const state = encounter.getState();
      const payTollPath = state.availablePaths.find(
        (p) => p.id === 'pay_toll'
      )!;

      encounter.selectPath(payTollPath.id);

      // Pay toll should always succeed
      const outcome = encounter.resolve();

      expect(outcome.type).toBe('success');
      expect(outcome.reward!.energy).toBeLessThan(config.baseReward.energy); // Lower rewards
    });
  });

  describe('obstacle-specific mechanics', () => {
    it('should handle collapsed passage excavation', () => {
      const passageConfig = {
        ...config,
        obstacleType: 'collapsed_passage' as ObstacleType,
      };
      const passageEncounter = new HazardEncounter(
        'passage-test',
        passageConfig
      );
      const state = passageEncounter.getState();
      const excavatePath = state.availablePaths.find(
        (p) => p.id === 'excavate'
      )!;

      expect(excavatePath).toBeDefined();
      expect(excavatePath.specialEffect).toContain('hidden treasures');
    });

    it('should handle ancient guardian negotiation', () => {
      const guardianConfig = {
        ...config,
        obstacleType: 'ancient_guardian' as ObstacleType,
      };
      const guardianEncounter = new HazardEncounter(
        'guardian-test',
        guardianConfig
      );
      const state = guardianEncounter.getState();
      const negotiatePath = state.availablePaths.find(
        (p) => p.id === 'negotiate'
      )!;

      expect(negotiatePath).toBeDefined();
      expect(negotiatePath.specialEffect).toContain("guardian's blessing");
      expect(negotiatePath.rewardModifier).toBeGreaterThan(1.5); // High reward potential
    });

    it('should handle maze of mirrors puzzle solving', () => {
      const mazeConfig = {
        ...config,
        obstacleType: 'maze_of_mirrors' as ObstacleType,
      };
      const mazeEncounter = new HazardEncounter('maze-test', mazeConfig);
      const state = mazeEncounter.getState();
      const solvePath = state.availablePaths.find(
        (p) => p.id === 'solve_puzzle'
      )!;
      const breakPath = state.availablePaths.find(
        (p) => p.id === 'break_mirrors'
      )!;

      expect(solvePath).toBeDefined();
      expect(breakPath).toBeDefined();
      expect(solvePath.specialEffect).toContain('hidden passages');
      expect(breakPath.specialEffect).toContain('attract other hazards');
    });
  });

  describe('static configuration creation', () => {
    it('should create hazard configuration for different obstacle types', () => {
      const obstacleTypes: ObstacleType[] = [
        'collapsed_passage',
        'treacherous_bridge',
        'ancient_guardian',
        'energy_drain',
        'maze_of_mirrors',
      ];

      obstacleTypes.forEach((obstacleType) => {
        const hazardConfig = HazardEncounter.createHazardConfig(
          obstacleType,
          5,
          2
        );

        expect(hazardConfig.obstacleType).toBe(obstacleType);
        expect(hazardConfig.difficulty).toBeGreaterThan(0);
        expect(hazardConfig.difficulty).toBeLessThanOrEqual(10);
        expect(hazardConfig.baseReward.energy).toBe(0);
        expect(hazardConfig.failureConsequence.energyLoss).toBeGreaterThan(0);
      });
    });

    it('should scale configuration with depth', () => {
      const depth1Config = HazardEncounter.createHazardConfig(
        'collapsed_passage',
        5,
        1
      );
      const depth3Config = HazardEncounter.createHazardConfig(
        'collapsed_passage',
        5,
        3
      );

      expect(depth3Config.baseReward.energy).toBe(0);
      expect(depth1Config.baseReward.energy).toBe(0);
      expect(depth3Config.baseReward.xp).toBeGreaterThan(
        depth1Config.baseReward.xp
      );
      expect(depth3Config.failureConsequence.energyLoss).toBeGreaterThan(
        depth1Config.failureConsequence.energyLoss
      );
    });

    it('should clamp difficulty to valid range', () => {
      const lowDifficultyConfig = HazardEncounter.createHazardConfig(
        'collapsed_passage',
        0,
        1
      );
      const highDifficultyConfig = HazardEncounter.createHazardConfig(
        'collapsed_passage',
        15,
        1
      );

      expect(lowDifficultyConfig.difficulty).toBe(1);
      expect(highDifficultyConfig.difficulty).toBe(10);
    });
  });

  describe('edge cases', () => {
    it('should handle empty reward items', () => {
      const emptyRewardConfig = {
        ...config,
        baseReward: {
          energy: 10,
          items: [],
          xp: 25,
        },
      };
      const emptyRewardEncounter = new HazardEncounter(
        'empty-reward',
        emptyRewardConfig
      );

      const state = emptyRewardEncounter.getState();
      emptyRewardEncounter.selectPath(state.availablePaths[0].id);

      const outcome = emptyRewardEncounter.resolve();

      expect(outcome).toBeDefined();
      if (outcome.type === 'success') {
        expect(outcome.reward!.items).toEqual([]);
      }
    });

    it('should handle extreme difficulty values', () => {
      const extremeConfig = { ...config, difficulty: 10 };
      const extremeEncounter = new HazardEncounter(
        'extreme-test',
        extremeConfig
      );

      const state = extremeEncounter.getState();
      extremeEncounter.selectPath(state.availablePaths[0].id);

      // Should not throw error even with extreme difficulty
      expect(() => extremeEncounter.resolve()).not.toThrow();
    });
  });

  describe('performance', () => {
    it('should resolve encounters within performance requirements', () => {
      const state = encounter.getState();
      encounter.selectPath(state.availablePaths[0].id);

      const startTime = performance.now();
      encounter.resolve();
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50); // Should complete within 50ms
    });
  });
});
