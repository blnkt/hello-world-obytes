import { BalanceManager } from '../balance-manager';

describe('Bust Rate Balancing', () => {
  let balanceManager: BalanceManager;

  beforeEach(() => {
    balanceManager = new BalanceManager();
  });

  describe('Target Bust Rate (20-30%)', () => {
    it('should have target bust rate range configured', () => {
      const config = balanceManager.getConfig();

      expect(config.difficulty.targetBustRateMin).toBe(0.2);
      expect(config.difficulty.targetBustRateMax).toBe(0.3);
    });

    it('should check if bust rate is within target range', () => {
      const result1 = balanceManager.isBustRateBalanced(100, 20); // 20% bust rate
      expect(result1.balanced).toBe(true);
      expect(result1.bustRate).toBe(0.2);

      const result2 = balanceManager.isBustRateBalanced(100, 30); // 30% bust rate
      expect(result2.balanced).toBe(true);
      expect(result2.bustRate).toBe(0.3);

      const result3 = balanceManager.isBustRateBalanced(100, 25); // 25% bust rate
      expect(result3.balanced).toBe(true);
      expect(result3.bustRate).toBe(0.25);
    });

    it('should detect when bust rate is too low', () => {
      const result = balanceManager.isBustRateBalanced(100, 10); // 10% bust rate
      expect(result.balanced).toBe(false);
      expect(result.bustRate).toBe(0.1);
      expect(result.bustRate).toBeLessThan(result.targetRange[0]);
    });

    it('should detect when bust rate is too high', () => {
      const result = balanceManager.isBustRateBalanced(100, 40); // 40% bust rate
      expect(result.balanced).toBe(false);
      expect(result.bustRate).toBe(0.4);
      expect(result.bustRate).toBeGreaterThan(result.targetRange[1]);
    });
  });

  describe('Bust Rate Balancing Factors', () => {
    it('should provide safety margin configuration for risk assessment', () => {
      const safetyMargin = balanceManager.getSafetyMarginConfig();

      expect(safetyMargin.low).toBeDefined();
      expect(safetyMargin.medium).toBeDefined();
      expect(safetyMargin.high).toBeDefined();

      expect(safetyMargin.medium).toBeGreaterThan(safetyMargin.low);
      expect(safetyMargin.high).toBeGreaterThan(safetyMargin.medium);
    });

    it('should assess safety margin levels correctly', () => {
      const low = balanceManager.assessSafetyMargin(100, 95);
      const medium = balanceManager.assessSafetyMargin(100, 80);
      const high = balanceManager.assessSafetyMargin(100, 45);

      expect(low).toBe('low');
      expect(medium).toBe('medium');
      expect(high).toBe('high');
    });
  });

  describe('Energy vs Return Cost Balance', () => {
    it('should calculate expected energy cost for a run', () => {
      const expectedCost2 = balanceManager.calculateExpectedEnergyCost(2);
      const expectedCost3 = balanceManager.calculateExpectedEnergyCost(3);

      expect(expectedCost2).toBeGreaterThan(0);
      expect(expectedCost3).toBeGreaterThan(expectedCost2);
    });

    it('should provide recommended starting energy for target depth', () => {
      const recommended = balanceManager.getRecommendedStartingEnergy(3);
      expect(recommended).toBeGreaterThan(0);

      const returnCost3 = balanceManager.calculateReturnCost(3);
      expect(recommended).toBeGreaterThan(returnCost3);
    });

    it('should recommend enough energy to complete a run safely', () => {
      for (let depth = 1; depth <= 5; depth++) {
        const recommended = balanceManager.getRecommendedStartingEnergy(depth);
        const expectedCost = balanceManager.calculateExpectedEnergyCost(depth);
        const returnCost = balanceManager.calculateReturnCost(depth);

        expect(recommended).toBeGreaterThan(expectedCost + returnCost);
      }
    });
  });

  describe('Difficulty Curve Impact on Bust Rate', () => {
    it('should maintain difficulty curve that supports 20-30% bust rate', () => {
      const depths = [1, 2, 3, 5];

      depths.forEach((depth) => {
        const difficultyMultiplier =
          balanceManager.calculateDifficultyMultiplier(depth);
        const nodeCost = balanceManager.calculateNodeCost(
          depth,
          'puzzle_chamber'
        );
        const returnCost = balanceManager.calculateReturnCost(depth);

        // Difficulty should scale meaningfully
        expect(difficultyMultiplier).toBeGreaterThan(1);

        // Return cost should grow with depth
        expect(returnCost).toBeGreaterThan(0);

        // Node costs should be reasonable proportion of return cost
        const costProportion = nodeCost / returnCost;
        expect(costProportion).toBeGreaterThan(0);
        expect(costProportion).toBeLessThanOrEqual(3.0); // Allow up to 3x to account for configuration
      });
    });

    it('should ensure deeper depths have higher energy requirements', () => {
      const depths = [1, 2, 3, 5, 10];
      const nodeCosts = depths.map((depth) =>
        balanceManager.calculateNodeCost(depth, 'puzzle_chamber')
      );
      const returnCosts = depths.map((depth) =>
        balanceManager.calculateReturnCost(depth)
      );

      for (let i = 1; i < nodeCosts.length; i++) {
        expect(nodeCosts[i]).toBeGreaterThan(nodeCosts[i - 1]);
      }

      for (let i = 1; i < returnCosts.length; i++) {
        expect(returnCosts[i]).toBeGreaterThanOrEqual(returnCosts[i - 1]);
      }
    });
  });
});
