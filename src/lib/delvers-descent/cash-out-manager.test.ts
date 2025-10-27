import { CashOutManager } from './cash-out-manager';

describe('CashOutManager', () => {
  let manager: CashOutManager;

  beforeEach(() => {
    manager = new CashOutManager();
  });

  describe('player choice system', () => {
    it('should allow player to always choose to continue (no forced busts)', () => {
      const currentEnergy = 50;
      const returnCost = 100; // Can't afford return
      const canContinue = manager.canContinue(currentEnergy, returnCost);

      expect(canContinue).toBe(true); // Player always has the choice
    });

    it('should allow player to cash out safely', () => {
      const currentEnergy = 200;
      const returnCost = 50; // Can easily afford return
      const rewards = { energy: 0, items: [], xp: 100 };

      const canCashOut = manager.canCashOut(currentEnergy, returnCost, rewards);

      expect(canCashOut).toBe(true);
    });

    it('should calculate safety margin for cash out decision', () => {
      const currentEnergy = 100;
      const returnCost = 30;

      const safetyMargin = manager.calculateSafetyMargin(
        currentEnergy,
        returnCost
      );

      expect(safetyMargin).toBe(70); // 100 - 30 = 70 remaining energy
    });
  });

  describe('risk warning system', () => {
    it('should generate safe zone warning', () => {
      const currentEnergy = 100;
      const returnCost = 20; // 80 safety margin

      const warning = manager.getRiskWarning(currentEnergy, returnCost);

      expect(warning.level).toBe('safe');
      expect(warning.message).toContain('Safe');
    });

    it('should generate caution zone warning', () => {
      const currentEnergy = 100;
      const returnCost = 60; // 40 safety margin

      const warning = manager.getRiskWarning(currentEnergy, returnCost);

      expect(warning.level).toBe('caution');
    });

    it('should generate danger zone warning', () => {
      const currentEnergy = 100;
      const returnCost = 85; // 15 safety margin

      const warning = manager.getRiskWarning(currentEnergy, returnCost);

      expect(warning.level).toBe('danger');
    });

    it('should generate critical zone warning', () => {
      const currentEnergy = 100;
      const returnCost = 100; // 0 safety margin

      const warning = manager.getRiskWarning(currentEnergy, returnCost);

      expect(warning.level).toBe('critical');
    });
  });

  describe('reward banking system', () => {
    it('should securely bank all collected items on cash out', () => {
      const rewards = {
        energy: 50,
        items: [
          {
            id: 'item1',
            name: 'Test Item 1',
            quantity: 1,
            rarity: 'common' as const,
            type: 'trade_good' as const,
            setId: 'test_set',
            value: 10,
            description: 'Test item 1',
          },
          {
            id: 'item2',
            name: 'Test Item 2',
            quantity: 1,
            rarity: 'uncommon' as const,
            type: 'discovery' as const,
            setId: 'test_set',
            value: 20,
            description: 'Test item 2',
          },
        ],
        xp: 100,
      };

      const bankedRewards = manager.bankRewards(rewards);

      expect(bankedRewards.items).toHaveLength(2);
      expect(bankedRewards.xp).toBe(100);
    });

    it('should preserve XP regardless of outcome', () => {
      const rewards = { energy: 0, items: [], xp: 250 };

      const bankedRewards = manager.bankRewards(rewards);

      expect(bankedRewards.xp).toBe(250); // XP always preserved
    });
  });

  describe('XP preservation logic', () => {
    it('should preserve XP on successful cash out', () => {
      const rewards = { energy: 100, items: [], xp: 500 };

      const result = manager.processCashOut(rewards);

      expect(result.xpPreserved).toBe(true);
      expect(result.preservedXp).toBe(500);
    });

    it('should preserve XP on bust', () => {
      const rewards = { energy: 0, items: [], xp: 300 };

      const result = manager.processBust(rewards);

      expect(result.xpPreserved).toBe(true);
      expect(result.preservedXp).toBe(300);
    });
  });

  describe('bust confirmation', () => {
    it('should provide clear consequence explanation for bust', () => {
      const consequence = manager.getBustConsequence();

      expect(consequence.message).toBeDefined();
      expect(consequence.xpPreserved).toBe(true);
      expect(consequence.itemsLost).toBeDefined();
    });
  });

  describe('cash out confirmation', () => {
    it('should provide reward summary for cash out confirmation', () => {
      const rewards = {
        energy: 50,
        items: [
          {
            id: 'item1',
            name: 'Test Item',
            quantity: 1,
            rarity: 'common' as const,
            type: 'trade_good' as const,
            setId: 'test_set',
            value: 10,
            description: 'Test item',
          },
        ],
        xp: 150,
      };

      const summary = manager.getCashOutSummary(rewards);

      expect(summary.totalItems).toBe(1);
      expect(summary.totalXP).toBe(150);
      expect(summary.rewardDetails).toBeDefined();
    });
  });
});
