import { BalanceManager } from '../balance-manager';
import { REGIONS } from '../regions';

describe('Encounter Frequency Distribution Tuning', () => {
  let balanceManager: BalanceManager;

  beforeEach(() => {
    balanceManager = new BalanceManager();
  });

  describe('Default Encounter Distribution', () => {
    it('should have a balanced default distribution', () => {
      const distribution = balanceManager.getEncounterDistribution();

      // Check that all encounter types are represented
      expect(distribution.puzzle_chamber).toBeDefined();
      expect(distribution.discovery_site).toBeDefined();
      expect(distribution.risk_event).toBeDefined();
      expect(distribution.hazard).toBeDefined();
      expect(distribution.rest_site).toBeDefined();
    });

    it('should have total distribution percentages summing to 1.0', () => {
      const distribution = balanceManager.getEncounterDistribution();

      const total = Object.values(distribution).reduce(
        (sum, value) => sum + value,
        0
      );
      expect(total).toBeCloseTo(1.0, 5);
    });

    it('should have no negative frequencies', () => {
      const distribution = balanceManager.getEncounterDistribution();

      Object.values(distribution).forEach((frequency) => {
        expect(frequency).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have reasonable distribution percentages', () => {
      const distribution = balanceManager.getEncounterDistribution();

      // No single encounter type should dominate (>50%)
      Object.values(distribution).forEach((frequency) => {
        expect(frequency).toBeLessThanOrEqual(0.5);
      });

      // Each type should be meaningfully present (>5%)
      Object.values(distribution).forEach((frequency) => {
        expect(frequency).toBeGreaterThanOrEqual(0.05);
      });
    });
  });

  describe('Region-Specific Distributions', () => {
    it('should have all regions with valid encounter distributions', () => {
      REGIONS.forEach((region) => {
        const distribution = region.encounterDistribution;
        const total = Object.values(distribution).reduce(
          (sum, value) => sum + value,
          0
        );
        expect(total).toBe(100);
      });
    });

    it('should have different encounter distributions for different regions', () => {
      const distributions = REGIONS.map((r) => r.encounterDistribution);

      // At least one region should have different distribution
      const firstDistribution = distributions[0];
      const hasDifferent = distributions.some(
        (dist) => JSON.stringify(dist) !== JSON.stringify(firstDistribution)
      );
      expect(hasDifferent).toBe(true);
    });

    it('should balance risk vs reward encounters appropriately', () => {
      REGIONS.forEach((region) => {
        const distribution = region.encounterDistribution;

        // Risk encounters (hazard, risk_event) percentage
        const riskPercentage =
          (distribution.hazard + distribution.risk_event) / 100;

        // Low risk encounters (rest_site) percentage
        const safePercentage = distribution.rest_site / 100;

        // Moderate encounters (puzzle_chamber, discovery_site) percentage
        const moderatePercentage =
          (distribution.puzzle_chamber + distribution.discovery_site) / 100;

        // Should have reasonable balance across all three categories
        expect(riskPercentage).toBeGreaterThan(0.05);
        expect(safePercentage).toBeGreaterThanOrEqual(0.06); // At least 6% rest sites
        expect(moderatePercentage).toBeGreaterThanOrEqual(0.15);
      });
    });
  });

  describe('Distribution Configuration', () => {
    it('should allow updating encounter distribution', () => {
      const config = balanceManager.getConfig();
      const originalDistribution = config.encounter.encounterDistribution;

      balanceManager.updateConfig({
        encounter: {
          encounterDistribution: {
            puzzle_chamber: 0.4,
            discovery_site: 0.2,
            risk_event: 0.1,
            hazard: 0.1,
            rest_site: 0.1,
            safe_passage: 0.1,
          },
        },
      });

      const newDistribution = balanceManager.getEncounterDistribution();
      expect(newDistribution.puzzle_chamber).toBe(0.5);
      expect(newDistribution.puzzle_chamber).not.toBe(
        originalDistribution.puzzle_chamber
      );
    });

    it('should validate distribution sums to 1.0', () => {
      const distribution = balanceManager.getEncounterDistribution();
      const total = Object.values(distribution).reduce(
        (sum, value) => sum + value,
        0
      );

      expect(total).toBeCloseTo(1.0, 2);
    });
  });

  describe('Distribution Balance Goals', () => {
    it('should provide sufficient variety of encounter types', () => {
      const distribution = balanceManager.getEncounterDistribution();

      // Count how many types have meaningful presence (>10%)
      const meaningfulTypes = Object.values(distribution).filter(
        (value) => value > 0.1
      ).length;

      expect(meaningfulTypes).toBeGreaterThanOrEqual(3);
    });

    it('should ensure rest sites are available (essential for gameplay)', () => {
      const distribution = balanceManager.getEncounterDistribution();

      expect(distribution.rest_site).toBeGreaterThan(0.05); // At least 5%
    });

    it('should have appropriate risk encounter balance', () => {
      const distribution = balanceManager.getEncounterDistribution();

      const riskEncounters = distribution.risk_event + distribution.hazard;

      // Risk encounters should be present but not overwhelming
      expect(riskEncounters).toBeGreaterThan(0.1);
      expect(riskEncounters).toBeLessThan(0.4);
    });
  });
});
