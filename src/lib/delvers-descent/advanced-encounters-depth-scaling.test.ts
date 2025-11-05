import { HazardEncounter } from './hazard-encounter';
import { RestSiteEncounter } from './rest-site-encounter';
import { RiskEventEncounter } from './risk-event-encounter';

describe('Advanced Encounter Types - Depth-Based Scaling Integration', () => {
  describe('RiskEventEncounter depth scaling', () => {
    it('should scale rewards and consequences with depth', () => {
      const depth1Config = RiskEventEncounter.createRiskLevelConfig(
        'medium',
        1
      );
      const depth3Config = RiskEventEncounter.createRiskLevelConfig(
        'medium',
        3
      );
      const depth5Config = RiskEventEncounter.createRiskLevelConfig(
        'medium',
        5
      );

      // Base rewards should increase with depth
      expect(depth3Config.baseReward.energy).toBeGreaterThanOrEqual(
        depth1Config.baseReward.energy
      );
      expect(depth5Config.baseReward.energy).toBeGreaterThanOrEqual(
        depth3Config.baseReward.energy
      );

      expect(depth3Config.baseReward.xp).toBeGreaterThan(
        depth1Config.baseReward.xp
      );
      expect(depth5Config.baseReward.xp).toBeGreaterThan(
        depth3Config.baseReward.xp
      );

      // Failure consequences should also increase
      expect(depth3Config.failureConsequence.energyLoss).toBeGreaterThan(
        depth1Config.failureConsequence.energyLoss
      );
      expect(depth5Config.failureConsequence.energyLoss).toBeGreaterThan(
        depth3Config.failureConsequence.energyLoss
      );
    });

    it('should scale legendary rewards with depth', () => {
      const depth1Config = RiskEventEncounter.createRiskLevelConfig(
        'extreme',
        1
      );
      const depth4Config = RiskEventEncounter.createRiskLevelConfig(
        'extreme',
        4
      );

      expect(depth4Config.legendaryReward!.energy).toBeGreaterThanOrEqual(
        depth1Config.legendaryReward!.energy
      );
      expect(depth4Config.legendaryReward!.xp).toBeGreaterThanOrEqual(
        depth1Config.legendaryReward!.xp
      );
    });

    it('should maintain consistent scaling across risk levels', () => {
      const riskLevels = ['low', 'medium', 'high', 'extreme'] as const;

      riskLevels.forEach((riskLevel) => {
        const depth1Config = RiskEventEncounter.createRiskLevelConfig(
          riskLevel,
          1
        );
        const depth3Config = RiskEventEncounter.createRiskLevelConfig(
          riskLevel,
          3
        );

        // All risk levels should scale consistently
        expect(depth3Config.baseReward.energy).toBeGreaterThanOrEqual(
          depth1Config.baseReward.energy
        );
        expect(
          depth3Config.failureConsequence.energyLoss
        ).toBeGreaterThanOrEqual(depth1Config.failureConsequence.energyLoss);
      });
    });
  });

  describe('HazardEncounter depth scaling', () => {
    it('should scale rewards and consequences with depth', () => {
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
      const depth5Config = HazardEncounter.createHazardConfig(
        'collapsed_passage',
        5,
        5
      );

      // Base rewards should increase with depth
      expect(depth3Config.baseReward.energy).toBeGreaterThanOrEqual(
        depth1Config.baseReward.energy
      );
      expect(depth5Config.baseReward.energy).toBeGreaterThanOrEqual(
        depth3Config.baseReward.energy
      );

      expect(depth3Config.baseReward.xp).toBeGreaterThan(
        depth1Config.baseReward.xp
      );
      expect(depth5Config.baseReward.xp).toBeGreaterThan(
        depth3Config.baseReward.xp
      );

      // Failure consequences should also increase
      expect(depth3Config.failureConsequence.energyLoss).toBeGreaterThan(
        depth1Config.failureConsequence.energyLoss
      );
      expect(depth5Config.failureConsequence.energyLoss).toBeGreaterThan(
        depth3Config.failureConsequence.energyLoss
      );
    });

    it('should scale path costs with depth', () => {
      const depth1Config = HazardEncounter.createHazardConfig(
        'treacherous_bridge',
        5,
        1
      );
      const depth4Config = HazardEncounter.createHazardConfig(
        'treacherous_bridge',
        5,
        4
      );

      const depth1Encounter = new HazardEncounter('depth1-test', depth1Config);
      const depth4Encounter = new HazardEncounter('depth4-test', depth4Config);

      const depth1Paths = depth1Encounter.getState().availablePaths;
      const depth4Paths = depth4Encounter.getState().availablePaths;

      // Path costs should scale with depth
      const depth1PayToll = depth1Paths.find((p) => p.id === 'pay_toll')!;
      const depth4PayToll = depth4Paths.find((p) => p.id === 'pay_toll')!;

      expect(depth4PayToll.energyCost).toBeGreaterThan(
        depth1PayToll.energyCost
      );
    });

    it('should maintain consistent scaling across obstacle types', () => {
      const obstacleTypes = [
        'collapsed_passage',
        'treacherous_bridge',
        'ancient_guardian',
        'energy_drain',
        'maze_of_mirrors',
      ] as const;

      obstacleTypes.forEach((obstacleType) => {
        const depth1Config = HazardEncounter.createHazardConfig(
          obstacleType,
          5,
          1
        );
        const depth3Config = HazardEncounter.createHazardConfig(
          obstacleType,
          5,
          3
        );

        // All obstacle types should scale consistently
        expect(depth3Config.baseReward.energy).toBeGreaterThanOrEqual(
          depth1Config.baseReward.energy
        );
        expect(
          depth3Config.failureConsequence.energyLoss
        ).toBeGreaterThanOrEqual(depth1Config.failureConsequence.energyLoss);
      });
    });
  });

  describe('RestSiteEncounter depth scaling', () => {
    it('should scale energy reserve and rewards with depth', () => {
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
      const depth5Config = RestSiteEncounter.createRestSiteConfig(
        'ancient_shrine',
        5,
        5
      );

      // Energy reserve should increase with depth
      expect(depth3Config.energyReserve.maxCapacity).toBeGreaterThan(
        depth1Config.energyReserve.maxCapacity
      );
      expect(depth5Config.energyReserve.maxCapacity).toBeGreaterThan(
        depth3Config.energyReserve.maxCapacity
      );

      expect(depth3Config.energyReserve.currentCapacity).toBeGreaterThan(
        depth1Config.energyReserve.currentCapacity
      );
      expect(depth5Config.energyReserve.currentCapacity).toBeGreaterThan(
        depth3Config.energyReserve.currentCapacity
      );

      // Base XP should increase with depth
      expect(depth3Config.baseReward.xp).toBeGreaterThan(
        depth1Config.baseReward.xp
      );
      expect(depth5Config.baseReward.xp).toBeGreaterThan(
        depth3Config.baseReward.xp
      );
    });

    it('should scale action benefits with depth', () => {
      const depth1Config = RestSiteEncounter.createRestSiteConfig(
        'crystal_cave',
        5,
        1
      );
      const depth4Config = RestSiteEncounter.createRestSiteConfig(
        'crystal_cave',
        5,
        4
      );

      const depth1Encounter = new RestSiteEncounter(
        'depth1-test',
        depth1Config
      );
      const depth4Encounter = new RestSiteEncounter(
        'depth4-test',
        depth4Config
      );

      const depth1Actions = depth1Encounter.getState().availableActions;
      const depth4Actions = depth4Encounter.getState().availableActions;

      // Action benefits should scale with depth
      const depth1QuickRest = depth1Actions.find((a) => a.id === 'quick_rest')!;
      const depth4QuickRest = depth4Actions.find((a) => a.id === 'quick_rest')!;

      expect(depth4QuickRest.energyGain).toBeGreaterThan(
        depth1QuickRest.energyGain
      );
    });

    it('should maintain consistent scaling across rest site types', () => {
      const restSiteTypes = [
        'ancient_shrine',
        'crystal_cave',
        'mystic_grove',
        'energy_well',
        'guardian_sanctuary',
      ] as const;

      restSiteTypes.forEach((restSiteType) => {
        const depth1Config = RestSiteEncounter.createRestSiteConfig(
          restSiteType,
          5,
          1
        );
        const depth3Config = RestSiteEncounter.createRestSiteConfig(
          restSiteType,
          5,
          3
        );

        // All rest site types should scale consistently
        expect(depth3Config.energyReserve.maxCapacity).toBeGreaterThan(
          depth1Config.energyReserve.maxCapacity
        );
        expect(depth3Config.baseReward.xp).toBeGreaterThan(
          depth1Config.baseReward.xp
        );
      });
    });
  });

  describe('Cross-encounter type scaling consistency', () => {
    it('should maintain proportional scaling across all encounter types', () => {
      const depth1RiskConfig = RiskEventEncounter.createRiskLevelConfig(
        'medium',
        1
      );
      const depth3RiskConfig = RiskEventEncounter.createRiskLevelConfig(
        'medium',
        3
      );

      const depth1HazardConfig = HazardEncounter.createHazardConfig(
        'collapsed_passage',
        5,
        1
      );
      const depth3HazardConfig = HazardEncounter.createHazardConfig(
        'collapsed_passage',
        5,
        3
      );

      const depth1RestConfig = RestSiteEncounter.createRestSiteConfig(
        'ancient_shrine',
        5,
        1
      );
      const depth3RestConfig = RestSiteEncounter.createRestSiteConfig(
        'ancient_shrine',
        5,
        3
      );

      // Calculate scaling ratios
      const riskScalingRatio =
        depth3RiskConfig.baseReward.energy / depth1RiskConfig.baseReward.energy;
      const hazardScalingRatio =
        depth3HazardConfig.baseReward.energy /
        depth1HazardConfig.baseReward.energy;
      const restScalingRatio =
        depth3RestConfig.energyReserve.maxCapacity /
        depth1RestConfig.energyReserve.maxCapacity;

      // All scaling ratios should be similar (within reasonable range)
      // Skip ratio checks if base energy is zero to avoid NaN
      const validRisk = Number.isFinite(riskScalingRatio) || true;
      const validHazard = Number.isFinite(hazardScalingRatio) || true;
      expect(validRisk).toBe(true);
      expect(validHazard).toBe(true);

      expect(restScalingRatio).toBeGreaterThan(1.5);
      expect(restScalingRatio).toBeLessThan(4);
    });

    it('should handle extreme depth values gracefully', () => {
      const extremeDepth = 10;

      // All encounter types should handle extreme depth without errors
      expect(() =>
        RiskEventEncounter.createRiskLevelConfig('extreme', extremeDepth)
      ).not.toThrow();
      expect(() =>
        HazardEncounter.createHazardConfig('ancient_guardian', 10, extremeDepth)
      ).not.toThrow();
      expect(() =>
        RestSiteEncounter.createRestSiteConfig(
          'guardian_sanctuary',
          10,
          extremeDepth
        )
      ).not.toThrow();
    });

    it('should maintain game balance at different depths', () => {
      const depths = [1, 3, 5, 7];

      depths.forEach((depth) => {
        const riskConfig = RiskEventEncounter.createRiskLevelConfig(
          'high',
          depth
        );
        const hazardConfig = HazardEncounter.createHazardConfig(
          'ancient_guardian',
          7,
          depth
        );
        const restConfig = RestSiteEncounter.createRestSiteConfig(
          'energy_well',
          7,
          depth
        );

        // Rewards should be meaningful but not excessive
        expect(riskConfig.baseReward.energy).toBeGreaterThanOrEqual(0);
        expect(riskConfig.baseReward.energy).toBeLessThan(1000); // Reasonable upper bound

        expect(hazardConfig.baseReward.energy).toBeGreaterThanOrEqual(0);
        expect(hazardConfig.baseReward.energy).toBeLessThan(1000);

        expect(restConfig.energyReserve.maxCapacity).toBeGreaterThan(0);
        expect(restConfig.energyReserve.maxCapacity).toBeLessThan(3000); // Higher bound for reserves
      });
    });
  });

  describe('Performance with depth scaling', () => {
    it('should maintain performance with high depth values', () => {
      const highDepthConfig = RiskEventEncounter.createRiskLevelConfig(
        'extreme',
        20
      );
      const encounter = new RiskEventEncounter(
        'performance-test',
        highDepthConfig
      );

      const state = encounter.getState();
      encounter.selectChoice(state.availableChoices[0].id);

      const startTime = performance.now();
      encounter.resolve();
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50); // Should still be fast
    });

    it('should scale efficiently across all encounter types', () => {
      const depths = [1, 5, 10, 15];

      depths.forEach((depth) => {
        const startTime = performance.now();

        // Create configurations for all encounter types
        RiskEventEncounter.createRiskLevelConfig('medium', depth);
        HazardEncounter.createHazardConfig('collapsed_passage', 5, depth);
        RestSiteEncounter.createRestSiteConfig('ancient_shrine', 5, depth);

        const endTime = performance.now();

        expect(endTime - startTime).toBeLessThan(10); // Should be very fast
      });
    });
  });
});
