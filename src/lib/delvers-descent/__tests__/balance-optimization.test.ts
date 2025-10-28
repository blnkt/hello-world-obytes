import { BalanceManager } from '../balance-manager';
import { DEFAULT_BALANCE_CONFIG } from '../balance-config';

describe('BalanceManager', () => {
  let manager: BalanceManager;

  beforeEach(() => {
    manager = new BalanceManager();
  });

  describe('Configuration Management', () => {
    it('should initialize with default config', () => {
      expect(manager.getConfig()).toEqual(DEFAULT_BALANCE_CONFIG);
    });

    it('should allow updating config', () => {
      manager.updateConfig({
        energy: {
          ...DEFAULT_BALANCE_CONFIG.energy,
          baseCost: 6,
        },
      });

      const config = manager.getConfig();
      expect(config.energy.baseCost).toBe(6);
    });

    it('should load preset configurations', () => {
      manager.loadPreset('EASY');
      const config = manager.getConfig();
      expect(config.energy.baseCost).toBe(4);

      manager.loadPreset('HARD');
      const hardConfig = manager.getConfig();
      expect(hardConfig.energy.baseCost).toBe(6);
    });
  });

  describe('Energy Cost Calculations', () => {
    it('should calculate base node cost correctly', () => {
      const cost = manager.calculateNodeCost(1, 'puzzle_chamber');
      expect(cost).toBe(5);
    });

    it('should scale cost with depth', () => {
      const cost1 = manager.calculateNodeCost(1, 'puzzle_chamber');
      const cost2 = manager.calculateNodeCost(2, 'puzzle_chamber');
      const cost3 = manager.calculateNodeCost(3, 'puzzle_chamber');

      expect(cost2).toBeGreaterThan(cost1);
      expect(cost3).toBeGreaterThan(cost2);
    });

    it('should apply type-specific modifiers', () => {
      const puzzleCost = manager.calculateNodeCost(2, 'puzzle_chamber');
      const tradeCost = manager.calculateNodeCost(2, 'trade_opportunity');
      const hazardCost = manager.calculateNodeCost(2, 'hazard');

      expect(tradeCost).toBeLessThan(puzzleCost);
      expect(hazardCost).toBeGreaterThan(puzzleCost);
    });

    it('should enforce min/max cost bounds', () => {
      const config = manager.getConfig();

      const lowCost = manager.calculateNodeCost(1, 'rest_site');
      expect(lowCost).toBeGreaterThanOrEqual(config.energy.minCost);

      manager.updateConfig({
        energy: {
          ...config.energy,
          baseCost: 100,
        },
      });

      const highCost = manager.calculateNodeCost(10, 'hazard');
      expect(highCost).toBeLessThanOrEqual(config.energy.maxCost);
    });
  });

  describe('Return Cost Calculations', () => {
    it('should calculate exponential return cost', () => {
      const cost1 = manager.calculateReturnCost(1);
      const cost2 = manager.calculateReturnCost(2);
      const cost3 = manager.calculateReturnCost(3);

      expect(cost2).toBeGreaterThan(cost1);
      expect(cost3).toBeGreaterThan(cost2);
      expect(cost3).toBeGreaterThan(cost1 * 2); // Exponential growth
    });

    it('should use configured base multiplier and exponent', () => {
      const config = manager.getConfig();
      const expectedCost = Math.round(
        config.returnCost.baseMultiplier *
          Math.pow(3, config.returnCost.exponent)
      );

      const actualCost = manager.calculateReturnCost(3);
      expect(actualCost).toBe(expectedCost);
    });
  });

  describe('Reward Calculations', () => {
    it('should scale rewards with depth', () => {
      const scaling1 = manager.calculateDepthRewardScaling(1);
      const scaling2 = manager.calculateDepthRewardScaling(2);
      const scaling3 = manager.calculateDepthRewardScaling(5);

      expect(scaling2).toBeGreaterThan(scaling1);
      expect(scaling3).toBeGreaterThan(scaling2);
    });

    it('should apply encounter type multipliers', () => {
      const baseReward = 10;

      const puzzleReward = manager.calculateRewardValue(
        baseReward,
        'puzzle_chamber',
        2
      );
      const riskReward = manager.calculateRewardValue(
        baseReward,
        'risk_event',
        2
      );

      expect(riskReward).toBeGreaterThan(puzzleReward);
    });

    it('should add reward variation', () => {
      const baseReward = 10;
      const rewards: number[] = [];

      for (let i = 0; i < 10; i++) {
        rewards.push(
          manager.calculateRewardValue(baseReward, 'puzzle_chamber', 2)
        );
      }

      const uniqueRewards = new Set(rewards);
      expect(uniqueRewards.size).toBeGreaterThan(1);
    });
  });

  describe('Safety Margin Assessment', () => {
    it('should correctly assess low safety margin', () => {
      const assessment = manager.assessSafetyMargin(100, 95);
      expect(assessment).toBe('low');
    });

    it('should correctly assess medium safety margin', () => {
      const assessment = manager.assessSafetyMargin(100, 80);
      expect(assessment).toBe('medium');
    });

    it('should correctly assess high safety margin', () => {
      const assessment = manager.assessSafetyMargin(100, 45);
      expect(assessment).toBe('high');
    });
  });

  describe('Collection Balance', () => {
    it('should calculate collection bonus energy', () => {
      const bonus1 = manager.calculateCollectionBonusEnergy(1);
      const bonus2 = manager.calculateCollectionBonusEnergy(2);

      expect(bonus2).toBe(bonus1 * 2);
    });

    it('should calculate collection bonus items', () => {
      const bonus = manager.calculateCollectionBonusItems(3);
      expect(bonus).toBe(6);
    });
  });

  describe('Bust Rate Balance Checking', () => {
    it('should identify balanced bust rate', () => {
      const result = manager.isBustRateBalanced(100, 25);
      expect(result.balanced).toBe(true);
      expect(result.bustRate).toBe(0.25);
    });

    it('should identify too low bust rate', () => {
      const result = manager.isBustRateBalanced(100, 10);
      expect(result.balanced).toBe(false);
    });

    it('should identify too high bust rate', () => {
      const result = manager.isBustRateBalanced(100, 40);
      expect(result.balanced).toBe(false);
    });
  });

  describe('Expected Energy Calculations', () => {
    it('should calculate expected energy cost', () => {
      const expectedCost = manager.calculateExpectedEnergyCost(3);
      expect(expectedCost).toBeGreaterThan(0);
    });

    it('should scale expected cost with depth', () => {
      const cost2 = manager.calculateExpectedEnergyCost(2);
      const cost3 = manager.calculateExpectedEnergyCost(3);

      expect(cost3).toBeGreaterThan(cost2);
    });

    it('should provide recommended starting energy', () => {
      const recommended = manager.getRecommendedStartingEnergy(3);
      expect(recommended).toBeGreaterThan(0);
    });
  });

  describe('Configuration Import/Export', () => {
    it('should export configuration', () => {
      const exported = manager.exportConfig();
      expect(exported).toEqual(DEFAULT_BALANCE_CONFIG);
    });

    it('should import configuration', () => {
      const customConfig = {
        ...DEFAULT_BALANCE_CONFIG,
        energy: {
          ...DEFAULT_BALANCE_CONFIG.energy,
          baseCost: 10,
        },
      };

      manager.importConfig(customConfig);
      const imported = manager.getConfig();

      expect(imported.energy.baseCost).toBe(10);
    });
  });
});

describe('Balance Preset Testing', () => {
  it('should have EASY preset more forgiving', () => {
    const easy = new BalanceManager();
    easy.loadPreset('EASY');

    const normal = new BalanceManager();

    const easyCost = easy.calculateNodeCost(5, 'puzzle_chamber');
    const normalCost = normal.calculateNodeCost(5, 'puzzle_chamber');

    expect(easyCost).toBeLessThan(normalCost);
  });

  it('should have HARD preset more challenging', () => {
    const hard = new BalanceManager();
    hard.loadPreset('HARD');

    const normal = new BalanceManager();

    const hardCost = hard.calculateNodeCost(5, 'puzzle_chamber');
    const normalCost = normal.calculateNodeCost(5, 'puzzle_chamber');

    expect(hardCost).toBeGreaterThan(normalCost);
  });
});

