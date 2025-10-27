import { EnergyCalculator } from '../energy-calculator';
import { BalanceManager } from '../balance-manager';
import type { EncounterType } from '@/types/delvers-descent';

describe('EnergyCalculator with Balance Integration', () => {
  let energyCalculator: EnergyCalculator;
  let balanceManager: BalanceManager;

  beforeEach(() => {
    energyCalculator = new EnergyCalculator();
    balanceManager = new BalanceManager();
  });

  describe('calculateNodeCost with balance configuration', () => {
    it('should use balance manager configuration for node costs', () => {
      const cost1 = energyCalculator.calculateNodeCost(1, 'puzzle_chamber');
      const balanceCost1 = balanceManager.calculateNodeCost(1, 'puzzle_chamber');

      expect(cost1).toBe(balanceCost1);
    });

    it('should scale costs with depth using balance configuration', () => {
      const cost2 = energyCalculator.calculateNodeCost(2, 'puzzle_chamber');
      const balanceCost2 = balanceManager.calculateNodeCost(2, 'puzzle_chamber');

      expect(cost2).toBe(balanceCost2);
      expect(cost2).toBeGreaterThan(energyCalculator.calculateNodeCost(1, 'puzzle_chamber'));
    });

    it('should apply type-specific modifiers from balance configuration', () => {
      const puzzleCost = energyCalculator.calculateNodeCost(2, 'puzzle_chamber');
      const tradeCost = energyCalculator.calculateNodeCost(2, 'trade_opportunity');
      const hazardCost = energyCalculator.calculateNodeCost(2, 'hazard');

      expect(tradeCost).toBe(puzzleCost - 2); // -2 modifier
      expect(hazardCost).toBe(puzzleCost + 3); // +3 modifier
    });
  });

  describe('calculateReturnCost with balance configuration', () => {
    it('should use balance manager return cost formula for each depth level', () => {
      const energyReturn = energyCalculator.calculateReturnCost(3);
      // Calculate manually what balance manager returns
      const balanceReturn = balanceManager.calculateReturnCost(3);

      // Return cost accumulates from each depth level
      expect(energyReturn).toBeGreaterThan(balanceReturn);
    });

    it('should handle exponential scaling correctly', () => {
      const cost1 = energyCalculator.calculateReturnCost(1);
      const cost2 = energyCalculator.calculateReturnCost(2);
      const cost3 = energyCalculator.calculateReturnCost(3);

      expect(cost2).toBeGreaterThan(cost1);
      expect(cost3).toBeGreaterThan(cost2);
    });
  });

  describe('balance configuration integration', () => {
    it('should allow updating balance configuration', () => {
      const originalCost = energyCalculator.calculateNodeCost(2, 'puzzle_chamber');
      const config = balanceManager.getConfig();

      balanceManager.updateConfig({
        energy: {
          ...config.energy,
          baseCost: 8,
        },
      });

      // Cost should increase with new base cost
      const newCost = balanceManager.calculateNodeCost(2, 'puzzle_chamber');
      expect(newCost).toBeGreaterThan(originalCost);
    });

    it('should respect min/max cost bounds from balance config', () => {
      const config = balanceManager.getConfig();

      const lowCost = energyCalculator.calculateNodeCost(1, 'rest_site');
      expect(lowCost).toBeGreaterThanOrEqual(config.energy.minCost);

      balanceManager.updateConfig({
        energy: {
          ...config.energy,
          baseCost: 100,
        },
      });

      const highCost = energyCalculator.calculateNodeCost(10, 'hazard');
      expect(highCost).toBeLessThanOrEqual(config.energy.maxCost);
    });
  });

  describe('preset configurations', () => {
    it('should allow switching to EASY preset', () => {
      const easyManager = new BalanceManager();
      easyManager.loadPreset('EASY');
      const easyCost = easyManager.calculateNodeCost(5, 'puzzle_chamber');

      const normalManager = new BalanceManager();
      const normalCost = normalManager.calculateNodeCost(5, 'puzzle_chamber');

      expect(easyCost).toBeLessThan(normalCost);
    });

    it('should allow switching to HARD preset', () => {
      const hardManager = new BalanceManager();
      hardManager.loadPreset('HARD');
      const hardCost = hardManager.calculateNodeCost(5, 'puzzle_chamber');

      const normalManager = new BalanceManager();
      const normalCost = normalManager.calculateNodeCost(5, 'puzzle_chamber');

      expect(hardCost).toBeGreaterThan(normalCost);
    });
  });
});

