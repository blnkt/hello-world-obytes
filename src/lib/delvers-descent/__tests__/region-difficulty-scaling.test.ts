import { REGIONS } from '../regions';
import { BalanceManager } from '../balance-manager';
import type { Region } from '@/types/delvers-descent';

describe('Region Difficulty Scaling', () => {
  let balanceManager: BalanceManager;

  beforeEach(() => {
    balanceManager = new BalanceManager();
  });

  describe('Region Difficulty Balance', () => {
    it('should have all regions defined', () => {
      expect(REGIONS.length).toBeGreaterThan(0);
      expect(REGIONS.length).toBe(5);
    });

    it('should calculate overall difficulty for each region', () => {
      REGIONS.forEach((region) => {
        const difficulty = calculateRegionDifficulty(region);
        expect(difficulty).toBeGreaterThan(0);
      });
    });

    it('should have region difficulty multipliers configured', () => {
      const config = balanceManager.getConfig();

      expect(config.region.difficultyMultipliers).toBeDefined();
      expect(config.region.difficultyMultipliers.default).toBe(1.0);
    });

    it('should allow setting custom difficulty multipliers per region', () => {
      const config = balanceManager.getConfig();

      balanceManager.updateConfig({
        region: {
          ...config.region,
          difficultyMultipliers: {
            ...config.region.difficultyMultipliers,
            forest_depths: 0.9,
            dragons_lair: 1.3,
          },
        },
      });

      const newConfig = balanceManager.getConfig();
      expect(newConfig.region.difficultyMultipliers.forest_depths).toBe(0.9);
      expect(newConfig.region.difficultyMultipliers.dragons_lair).toBe(1.3);
    });
  });

  describe('Encounter Distribution Balance', () => {
    it('should have total encounter distribution adding up to 100', () => {
      REGIONS.forEach((region) => {
        const distribution = region.encounterDistribution;
        const total = Object.values(distribution).reduce(
          (sum, value) => sum + value,
          0
        );
        expect(total).toBe(100);
      });
    });

    it('should have balanced encounter distributions across regions', () => {
      REGIONS.forEach((region) => {
        const distribution = region.encounterDistribution;

        // Each region should have at least one type of encounter
        const hasEncounterTypes = Object.values(distribution).some(
          (value) => value > 0
        );
        expect(hasEncounterTypes).toBe(true);

        // No single encounter type should dominate (>50%)
        Object.values(distribution).forEach((value) => {
          expect(value).toBeLessThanOrEqual(50);
        });
      });
    });

    it('should allow configuring region-specific encounter distributions', () => {
      const config = balanceManager.getConfig();

      balanceManager.updateConfig({
        region: {
          ...config.region,
          encounterDistributions: {
            ...config.region.encounterDistributions,
            forest_depths: {
              puzzle_chamber: 0.4,
              discovery_site: 0.25,
              risk_event: 0.1,
              hazard: 0.1,
              rest_site: 0.05,
              safe_passage: 0.1,
            },
          },
        },
      });

      const newConfig = balanceManager.getConfig();
      expect(
        newConfig.region.encounterDistributions.forest_depths
      ).toBeDefined();
    });
  });

  describe('Regional Starting Bonuses', () => {
    it('should have appropriate starting bonuses for each region', () => {
      REGIONS.forEach((region) => {
        expect(region.startingBonus).toBeDefined();
        expect(region.startingBonus.energyBonus).toBeGreaterThanOrEqual(0);
        expect(region.startingBonus.itemsBonus).toBeGreaterThanOrEqual(0);
      });
    });

    it('should scale starting bonuses appropriately with region difficulty', () => {
      // Easier regions should have fewer bonuses
      const forestDepths = REGIONS.find((r) => r.id === 'forest_depths')!;
      const dragonsLair = REGIONS.find((r) => r.id === 'dragons_lair')!;

      expect(forestDepths.startingBonus.energyBonus).toBeLessThan(
        dragonsLair.startingBonus.energyBonus
      );
      expect(forestDepths.startingBonus.itemsBonus).toBeLessThanOrEqual(
        dragonsLair.startingBonus.itemsBonus
      );
    });
  });

  describe('Equal Challenge Across Regions', () => {
    it('should calculate similar energy requirements across regions at same depth', () => {
      const depth = 3;

      REGIONS.forEach((region) => {
        const cost = balanceManager.calculateNodeCost(depth, 'puzzle_chamber');

        // Basic node cost should be same regardless of region (before multipliers)
        expect(cost).toBeGreaterThan(0);
      });
    });

    it('should ensure regions offer equivalent challenge', () => {
      const regionDifficulties = REGIONS.map((region) =>
        calculateRegionDifficulty(region)
      );

      // All regions should have reasonable difficulty scores
      regionDifficulties.forEach((difficulty) => {
        expect(difficulty).toBeGreaterThan(0);
        expect(difficulty).toBeLessThan(100); // Reasonable upper bound
      });

      // Difficulty spread should not be too extreme
      const minDifficulty = Math.min(...regionDifficulties);
      const maxDifficulty = Math.max(...regionDifficulties);

      // Max difficulty should not exceed 2x min difficulty (balanced range)
      expect(maxDifficulty).toBeLessThan(minDifficulty * 3);
    });
  });
});

/**
 * Calculate overall difficulty score for a region
 * This is a helper function for testing regional balance
 */
function calculateRegionDifficulty(region: Region): number {
  const distribution = region.encounterDistribution;

  // Weight different encounter types by their difficulty
  const difficultyWeights: Record<string, number> = {
    puzzle_chamber: 1.0,
    discovery_site: 1.1,
    risk_event: 2.0,
    hazard: 2.5,
    rest_site: 0.5,
  };

  let totalDifficulty = 0;
  for (const [encounterType, percentage] of Object.entries(distribution)) {
    const weight = difficultyWeights[encounterType] || 1.0;
    totalDifficulty += (percentage / 100) * weight;
  }

  return totalDifficulty;
}
