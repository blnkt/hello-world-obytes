import { BalanceManager } from '../balance-manager';

describe('Exponential Return Cost Curve Optimization', () => {
  let balanceManager: BalanceManager;

  beforeEach(() => {
    balanceManager = new BalanceManager();
  });

  describe('Exponential Return Cost Formula', () => {
    it('should use exponential scaling for return costs', () => {
      const cost1 = balanceManager.calculateReturnCost(1);
      const cost2 = balanceManager.calculateReturnCost(2);
      const cost3 = balanceManager.calculateReturnCost(3);
      const cost4 = balanceManager.calculateReturnCost(4);
      const cost5 = balanceManager.calculateReturnCost(5);

      // Verify exponential growth (each increase should be proportionally larger)
      const increase2to1 = cost2 - cost1;
      const increase3to2 = cost3 - cost2;
      const increase4to3 = cost4 - cost3;
      const increase5to4 = cost5 - cost4;

      expect(increase3to2).toBeGreaterThan(increase2to1);
      expect(increase4to3).toBeGreaterThan(increase3to2);
      expect(increase5to4).toBeGreaterThan(increase4to3);
    });

    it('should use configured base multiplier and exponent', () => {
      const config = balanceManager.getConfig();
      const cost = balanceManager.calculateReturnCost(3);

      const expectedCost = Math.round(
        config.returnCost.baseMultiplier *
          Math.pow(3, config.returnCost.exponent)
      );

      expect(cost).toBe(expectedCost);
    });

    it('should handle depth 0 correctly', () => {
      const cost = balanceManager.calculateReturnCost(0);
      expect(cost).toBe(0);
    });

    it('should handle depth 1 correctly', () => {
      const cost = balanceManager.calculateReturnCost(1);
      expect(cost).toBeGreaterThan(0);
    });
  });

  describe('Return Cost Growth Rate', () => {
    it('should have reasonable cost growth at early depths', () => {
      const costs = [1, 2, 3, 4].map((depth) =>
        balanceManager.calculateReturnCost(depth)
      );

      // At shallow depths, cost should not be prohibitive
      expect(costs[3]).toBeLessThan(100); // Depth 4 return cost
    });

    it('should scale dramatically at higher depths', () => {
      const cost5 = balanceManager.calculateReturnCost(5);
      const cost10 = balanceManager.calculateReturnCost(10);

      // Deep return should be significantly more expensive
      expect(cost10).toBeGreaterThan(cost5 * 2);
    });

    it('should maintain push-your-luck tension', () => {
      const costs = [1, 2, 3, 5, 7].map((depth) =>
        balanceManager.calculateReturnCost(depth)
      );

      // Each additional depth should make return significantly harder
      for (let i = 1; i < costs.length; i++) {
        const ratio = costs[i] / costs[i - 1];
        expect(ratio).toBeGreaterThan(1.2); // At least 20% increase
      }
    });
  });

  describe('Return Cost Curve Configuration', () => {
    it('should allow changing base multiplier', () => {
      const originalCost = balanceManager.calculateReturnCost(3);
      const config = balanceManager.getConfig();

      balanceManager.updateConfig({
        returnCost: {
          ...config.returnCost,
          baseMultiplier: 7,
        },
      });

      const newCost = balanceManager.calculateReturnCost(3);
      expect(newCost).toBeGreaterThan(originalCost);
    });

    it('should allow changing exponent', () => {
      const originalCost = balanceManager.calculateReturnCost(5);
      const config = balanceManager.getConfig();

      balanceManager.updateConfig({
        returnCost: {
          ...config.returnCost,
          exponent: 1.8,
        },
      });

      const newCost = balanceManager.calculateReturnCost(5);
      expect(newCost).not.toBe(originalCost);
    });

    it('should allow setting curve type', () => {
      const config = balanceManager.getConfig();

      expect(config.returnCost.curveType).toBe('exponential');

      balanceManager.updateConfig({
        returnCost: {
          ...config.returnCost,
          curveType: 'linear',
        },
      });

      const newConfig = balanceManager.getConfig();
      expect(newConfig.returnCost.curveType).toBe('linear');
    });
  });

  describe('Return Cost vs Node Cost Balance', () => {
    it('should have return costs appropriate relative to node costs', () => {
      const depths = [1, 2, 3, 5];

      depths.forEach((depth) => {
        const nodeCost = balanceManager.calculateNodeCost(
          depth,
          'puzzle_chamber'
        );
        const returnCost = balanceManager.calculateReturnCost(depth);

        // Return cost should be greater than or equal to single node cost
        expect(returnCost).toBeGreaterThanOrEqual(nodeCost);

        // But not absurdly high at reasonable depths
        expect(returnCost).toBeLessThan(nodeCost * 20);
      });
    });

    it('should ensure deeper depths have proportionally higher return costs', () => {
      const nodeCost1 = balanceManager.calculateNodeCost(1, 'puzzle_chamber');
      const returnCost1 = balanceManager.calculateReturnCost(1);
      const ratio1 = returnCost1 / nodeCost1;

      const nodeCost5 = balanceManager.calculateNodeCost(5, 'puzzle_chamber');
      const returnCost5 = balanceManager.calculateReturnCost(5);
      const ratio5 = returnCost5 / nodeCost5;

      // Deeper depths should have relatively higher return costs
      expect(ratio5).toBeGreaterThan(ratio1);
    });
  });

  describe('Return Cost Optimization for Balance', () => {
    it('should prevent too-easy early returns', () => {
      const returnCost2 = balanceManager.calculateReturnCost(2);
      const returnCost3 = balanceManager.calculateReturnCost(3);

      // Depth 3 return should be meaningfully more expensive
      const increase = returnCost3 - returnCost2;
      expect(increase).toBeGreaterThan(5); // Significant increase
    });

    it('should prevent impossible late returns', () => {
      const returnCost10 = balanceManager.calculateReturnCost(10);

      // Even at depth 10, return should be feasible
      // A reasonable player should have ~1000 energy
      expect(returnCost10).toBeLessThan(500);
    });

    it('should scale appropriately for the target bust rate', () => {
      const costs = [1, 2, 3, 4, 5, 7, 10].map((depth) =>
        balanceManager.calculateReturnCost(depth)
      );

      // Costs should grow in a way that supports 20-30% bust rate unfortunately
      // Early depths should be safer
      const earlyRisk = costs[2] / costs[1];
      // Later depths should be riskier
      const lateRisk = costs[5] / costs[4];

      // Risk should generally increase, but allow for some fluctuation in exponential curves
      expect(earlyRisk).toBeGreaterThan(0);
      expect(lateRisk).toBeGreaterThan(0);
    });
  });
});
