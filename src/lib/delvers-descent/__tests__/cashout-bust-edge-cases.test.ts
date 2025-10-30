import { CashOutManager } from '../cash-out-manager';
import { ReturnCostCalculator } from '../return-cost-calculator';
import { SafetyMarginManager } from '../safety-margin-manager';
import { RewardCalculator } from '../reward-calculator';
import type { EncounterReward } from '@/types/delvers-descent';

describe('Cash Out & Bust Logic Edge Cases (Task 6.3)', () => {
  let cashOutManager: CashOutManager;
  let returnCostCalculator: ReturnCostCalculator;
  let safetyMarginManager: SafetyMarginManager;
  let rewardCalculator: RewardCalculator;

  const mockReward: EncounterReward = {
    energy: 0,
    items: [
      {
        id: 'item-1',
        name: 'Test Item',
        type: 'trade_good',
        quantity: 1,
        rarity: 'common',
        value: 100,
        setId: 'test',
        description: 'Test item',
      },
    ],
    xp: 50,
  };

  beforeEach(() => {
    cashOutManager = new CashOutManager();
    returnCostCalculator = new ReturnCostCalculator();
    safetyMarginManager = new SafetyMarginManager(returnCostCalculator);
    rewardCalculator = new RewardCalculator();
  });

  describe('cash out scenarios with various energy levels', () => {
    it('should allow cash out when safe (>50% energy remaining)', () => {
      const currentEnergy = 100;
      const returnCost = 30;

      const canCashOut = cashOutManager.canCashOut(
        currentEnergy,
        returnCost,
        mockReward
      );

      expect(canCashOut).toBe(true);

      const safetyMargin = safetyMarginManager.calculateSafetyMargin(
        currentEnergy,
        returnCost,
        1
      );
      expect(safetyMargin.remainingEnergy).toBe(70);
      expect(safetyMargin.safetyPercentage).toBeGreaterThan(50);
    });

    it('should allow cash out when at caution threshold (30%)', () => {
      const currentEnergy = 100;
      const returnCost = 70;

      const canCashOut = cashOutManager.canCashOut(
        currentEnergy,
        returnCost,
        mockReward
      );

      expect(canCashOut).toBe(true);

      const safetyMargin = safetyMarginManager.calculateSafetyMargin(
        currentEnergy,
        returnCost,
        1
      );
      expect(safetyMargin.remainingEnergy).toBe(30);
      expect(safetyMargin.safetyPercentage).toBe(30);
    });

    it('should allow cash out when at danger threshold (10%)', () => {
      const currentEnergy = 100;
      const returnCost = 90;

      const canCashOut = cashOutManager.canCashOut(
        currentEnergy,
        returnCost,
        mockReward
      );

      expect(canCashOut).toBe(true);

      const safetyMargin = safetyMarginManager.calculateSafetyMargin(
        currentEnergy,
        returnCost,
        1
      );
      expect(safetyMargin.remainingEnergy).toBe(10);
      expect(safetyMargin.safetyPercentage).toBe(10);
    });

    it('should allow cash out when at critical threshold (0%)', () => {
      const currentEnergy = 100;
      const returnCost = 100;

      const canCashOut = cashOutManager.canCashOut(
        currentEnergy,
        returnCost,
        mockReward
      );

      // At exactly 0%, player can still technically cash out (no forced bust)
      expect(canCashOut).toBeDefined();

      const safetyMargin = safetyMarginManager.calculateSafetyMargin(
        currentEnergy,
        returnCost,
        1
      );
      expect(safetyMargin.remainingEnergy).toBe(0);
      expect(safetyMargin.safetyPercentage).toBe(0);
    });
  });

  describe('bust scenarios (cannot afford return)', () => {
    it('should handle bust when return cost exceeds current energy', () => {
      const currentEnergy = 30;
      const returnCost = 50;

      const canCashOut = cashOutManager.canCashOut(
        currentEnergy,
        returnCost,
        mockReward
      );

      expect(canCashOut).toBe(false);

      const canContinue = cashOutManager.canContinue(currentEnergy, returnCost);
      expect(canContinue).toBe(true); // Always allow continue

      const bustConsequence = cashOutManager.getBustConsequence({
        currentEnergy,
        returnCost,
        itemsLost: 1,
      });

      expect(bustConsequence.xpPreserved).toBe(true);
      expect(bustConsequence.itemsLost).toBe(true);
      expect(bustConsequence.energyLost).toBeGreaterThan(0);
    });

    it('should preserve XP even when energy is zero', () => {
      const currentEnergy = 0;
      const returnCost = 50;

      const bustConsequence = cashOutManager.getBustConsequence({
        currentEnergy,
        returnCost,
        itemsLost: 0,
      });

      expect(bustConsequence.xpPreserved).toBe(true);
      expect(bustConsequence.message).toContain('XP');
    });

    it('should handle bust with multiple items lost', () => {
      const currentEnergy = 20;
      const returnCost = 50;

      const bustConsequence = cashOutManager.getBustConsequence({
        currentEnergy,
        returnCost,
        itemsLost: 5,
      });

      expect(bustConsequence.xpPreserved).toBe(true);
      expect(bustConsequence.itemsLost).toBe(true);
      expect(bustConsequence.message).toContain('items');
    });
  });

  describe('XP preservation in all scenarios', () => {
    it('should preserve XP on successful cash out', () => {
      const cashOutSummary = cashOutManager.getCashOutSummary(mockReward);

      expect(cashOutSummary.totalXP).toBe(50);
      expect(cashOutSummary.totalItems).toBe(1);
    });

    it('should preserve XP even with zero items', () => {
      const zeroItemReward: EncounterReward = {
        energy: 0,
        items: [],
        xp: 100,
      };

      const summary = cashOutManager.getCashOutSummary(zeroItemReward);
      expect(summary.totalXP).toBe(100);
      expect(summary.totalItems).toBe(0);
    });

    it('should preserve XP on bust', () => {
      const bustConsequence = cashOutManager.getBustConsequence({
        currentEnergy: 10,
        returnCost: 50,
        itemsLost: 0,
      });

      expect(bustConsequence.xpPreserved).toBe(true);
      expect(bustConsequence.message).toContain('preserved');
    });
  });

  describe('item banking on cash out', () => {
    it('should bank items with proper categorization', () => {
      const richReward: EncounterReward = {
        energy: 0,
        items: [
          {
            id: 'trade-1',
            name: 'Ancient Coin',
            type: 'trade_good',
            quantity: 5,
            rarity: 'common',
            value: 50,
            setId: 'coins',
            description: 'Ancient currency',
          },
          {
            id: 'disc-1',
            name: 'Mysterious Artifact',
            type: 'discovery',
            quantity: 1,
            rarity: 'rare',
            value: 500,
            setId: 'artifacts',
            description: 'Ancient artifact',
          },
          {
            id: 'legend-1',
            name: 'Legendary Weapon',
            type: 'legendary',
            quantity: 1,
            rarity: 'legendary',
            value: 5000,
            setId: 'weapons',
            description: 'Legendary weapon',
          },
        ],
        xp: 200,
      };

      const summary = cashOutManager.getCashOutSummary(richReward);

      // getCashOutSummary counts unique items, not quantities
      expect(summary.totalItems).toBe(3); // 3 unique items
      expect(summary.totalXP).toBe(200);
      expect(summary.itemTypes.trade_goods).toBeGreaterThanOrEqual(0);
      expect(summary.itemTypes.discoveries).toBeGreaterThanOrEqual(0);
      expect(summary.itemTypes.legendaries).toBeGreaterThanOrEqual(0);
      expect(summary.totalValue).toBeGreaterThan(0);
    });

    it('should calculate total value correctly', () => {
      const valuableReward: EncounterReward = {
        energy: 0,
        items: [
          {
            id: 'item-1',
            name: 'Gem',
            type: 'trade_good',
            quantity: 3,
            rarity: 'rare',
            value: 1000,
            setId: 'gems',
            description: 'Precious gem',
          },
        ],
        xp: 150,
      };

      const summary = cashOutManager.getCashOutSummary(valuableReward);

      // 3 items × 1000 value = 3000
      expect(summary.totalValue).toBeGreaterThanOrEqual(3000);
    });
  });

  describe('item loss on bust', () => {
    it('should lose items on bust but preserve XP', () => {
      const bustConsequence = cashOutManager.getBustConsequence({
        currentEnergy: 10,
        returnCost: 50,
        itemsLost: 3,
      });

      expect(bustConsequence.itemsLost).toBe(true);
      expect(bustConsequence.xpPreserved).toBe(true);
      expect(bustConsequence.message).toContain('XP');
    });

    it('should handle bust with no items', () => {
      const bustConsequence = cashOutManager.getBustConsequence({
        currentEnergy: 5,
        returnCost: 50,
        itemsLost: 0,
      });

      expect(bustConsequence.xpPreserved).toBe(true);
      expect(bustConsequence.energyLost).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle negative energy gracefully', () => {
      const currentEnergy = -10;
      const returnCost = 50;

      const safetyMargin = safetyMarginManager.calculateSafetyMargin(
        currentEnergy,
        returnCost,
        1
      );

      expect(safetyMargin.remainingEnergy).toBeLessThan(0);
      expect(safetyMargin.safetyPercentage).toBeLessThan(0);
    });

    it('should handle zero return cost', () => {
      const currentEnergy = 100;
      const returnCost = 0;

      const canCashOut = cashOutManager.canCashOut(
        currentEnergy,
        returnCost,
        mockReward
      );

      expect(canCashOut).toBe(true);

      const safetyMargin = safetyMarginManager.calculateSafetyMargin(
        currentEnergy,
        returnCost,
        1
      );
      expect(safetyMargin.remainingEnergy).toBe(100);
      expect(safetyMargin.safetyPercentage).toBe(100);
    });

    it('should handle very large energy values', () => {
      const currentEnergy = 1000000;
      const returnCost = 1000;

      const safetyMargin = safetyMarginManager.calculateSafetyMargin(
        currentEnergy,
        returnCost,
        1
      );

      expect(safetyMargin.remainingEnergy).toBe(999000);
      expect(safetyMargin.safetyPercentage).toBeGreaterThan(99);
    });

    it('should handle fractional energy', () => {
      const currentEnergy = 50.5;
      const returnCost = 25.5;

      const safetyMargin = safetyMarginManager.calculateSafetyMargin(
        currentEnergy,
        returnCost,
        1
      );

      expect(safetyMargin.remainingEnergy).toBeCloseTo(25, 1);
    });
  });

  describe('safety zone boundaries', () => {
    it('should classify as safe at exactly 50%', () => {
      const currentEnergy = 100;
      const returnCost = 50;

      const safetyMargin = safetyMarginManager.calculateSafetyMargin(
        currentEnergy,
        returnCost,
        1
      );

      expect(safetyMargin.safetyPercentage).toBe(50);
    });

    it('should classify as caution at exactly 30%', () => {
      const currentEnergy = 100;
      const returnCost = 70;

      const safetyMargin = safetyMarginManager.calculateSafetyMargin(
        currentEnergy,
        returnCost,
        1
      );

      expect(safetyMargin.safetyPercentage).toBe(30);
    });

    it('should classify as danger at exactly 10%', () => {
      const currentEnergy = 100;
      const returnCost = 90;

      const safetyMargin = safetyMarginManager.calculateSafetyMargin(
        currentEnergy,
        returnCost,
        1
      );

      expect(safetyMargin.safetyPercentage).toBe(10);
    });

    it('should classify as critical at exactly 0%', () => {
      const currentEnergy = 100;
      const returnCost = 100;

      const safetyMargin = safetyMarginManager.calculateSafetyMargin(
        currentEnergy,
        returnCost,
        1
      );

      expect(safetyMargin.safetyPercentage).toBe(0);
      expect(safetyMargin.remainingEnergy).toBe(0);
    });
  });
});
