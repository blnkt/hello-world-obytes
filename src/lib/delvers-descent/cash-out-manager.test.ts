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

  describe('risk warning system - Task 3.2', () => {
    it('should calculate safety percentage correctly', () => {
      const currentEnergy = 100;
      const returnCost = 30; // 70% remaining = safe

      const warning = manager.getRiskWarning(currentEnergy, returnCost);

      expect(warning.safetyMargin).toBe(70);
      expect(warning.level).toBe('safe');
    });

    it('should handle edge case at threshold boundaries', () => {
      const currentEnergy = 100;

      // Test at exactly 50% threshold (safe/caution boundary)
      const warning1 = manager.getRiskWarning(currentEnergy, 50);
      expect(warning1.level).toBe('safe'); // >= 50% = safe

      // Test just below 50% threshold
      const warning2 = manager.getRiskWarning(currentEnergy, 51);
      expect(warning2.level).toBe('caution');
    });

    it('should handle zero energy gracefully', () => {
      const warning = manager.getRiskWarning(0, 50);

      expect(warning.level).toBe('critical');
      expect(warning.safetyMargin).toBe(0);
    });

    it('should provide severity-based messages', () => {
      const testCases = [
        { energy: 100, cost: 10, expectedLevel: 'safe' }, // 90 remaining = safe
        { energy: 100, cost: 60, expectedLevel: 'caution' }, // 40 remaining = caution
        { energy: 100, cost: 90, expectedLevel: 'danger' }, // 10 remaining = danger
        { energy: 100, cost: 100, expectedLevel: 'critical' }, // 0 remaining = critical
      ];

      testCases.forEach(({ energy, cost, expectedLevel }) => {
        const warning = manager.getRiskWarning(energy, cost);
        expect(warning.level).toBe(expectedLevel);
        expect(warning.message).toBeDefined();
        expect(warning.safetyMargin).toBeDefined();
      });
    });

    it('should account for depth in risk escalation', () => {
      // Simulate deeper descent = higher return costs
      const depth1Cost = 50;
      const depth3Cost = 150;
      const currentEnergy = 200;

      const warning1 = manager.getRiskWarning(currentEnergy, depth1Cost);
      const warning3 = manager.getRiskWarning(currentEnergy, depth3Cost);

      expect(warning1.safetyMargin).toBeGreaterThan(warning3.safetyMargin);
      expect(warning1.level).toBe('safe'); // 150 remaining = safe
      expect(warning3.level).toBe('danger'); // 50 remaining = danger
    });

    it('should handle very large energy values', () => {
      const warning = manager.getRiskWarning(10000, 5000);

      expect(warning.level).toBe('safe');
      expect(warning.safetyMargin).toBe(5000);
    });

    it('should handle return cost exceeding energy', () => {
      const warning = manager.getRiskWarning(100, 200);

      expect(warning.level).toBe('critical');
      expect(warning.safetyMargin).toBe(0);
      expect(warning.message).toContain('CRITICAL');
    });
  });

  describe('reward banking system - Task 3.3', () => {
    it('should create deep copy of items to prevent mutation', () => {
      const originalItems = [
        {
          id: 'item1',
          name: 'Test Item',
          quantity: 1,
          rarity: 'common' as const,
          type: 'trade_good' as const,
          setId: 'test_set',
          value: 10,
          description: 'Test',
        },
      ];
      const rewards = {
        energy: 50,
        items: originalItems,
        xp: 100,
      };

      const banked = manager.bankRewards(rewards);

      // Modify original items
      originalItems[0].quantity = 99;

      // Banked items should not be affected
      expect(banked.items[0].quantity).toBe(1);
    });

    it('should preserve all item properties during banking', () => {
      const rewards = {
        energy: 0,
        items: [
          {
            id: 'legendary1',
            name: 'Legendary Item',
            quantity: 5,
            rarity: 'legendary' as const,
            type: 'legendary' as const,
            setId: 'legendary_set',
            value: 1000,
            description: 'Very rare item',
          },
        ],
        xp: 500,
      };

      const banked = manager.bankRewards(rewards);

      expect(banked.items[0]).toEqual({
        id: 'legendary1',
        name: 'Legendary Item',
        quantity: 5,
        rarity: 'legendary' as const,
        type: 'legendary' as const,
        setId: 'legendary_set',
        value: 1000,
        description: 'Very rare item',
      });
    });

    it('should handle banking multiple item types correctly', () => {
      const rewards = {
        energy: 0,
        items: [
          {
            id: 'trade1',
            name: 'Trade Good',
            quantity: 3,
            rarity: 'common' as const,
            type: 'trade_good' as const,
            setId: 'trade_set',
            value: 10,
            description: 'Common good',
          },
          {
            id: 'discovery1',
            name: 'Discovery',
            quantity: 1,
            rarity: 'rare' as const,
            type: 'discovery' as const,
            setId: 'discovery_set',
            value: 50,
            description: 'Rare discovery',
          },
          {
            id: 'legendary1',
            name: 'Legendary',
            quantity: 1,
            rarity: 'legendary' as const,
            type: 'legendary' as const,
            setId: 'legendary_set',
            value: 500,
            description: 'Legendary item',
          },
        ],
        xp: 200,
      };

      const banked = manager.bankRewards(rewards);

      expect(banked.items).toHaveLength(3);
      expect(banked.items[0].type).toBe('trade_good');
      expect(banked.items[1].type).toBe('discovery');
      expect(banked.items[2].type).toBe('legendary');
    });

    it('should handle empty item list gracefully', () => {
      const rewards = { energy: 100, items: [], xp: 50 };

      const banked = manager.bankRewards(rewards);

      expect(banked.items).toHaveLength(0);
      expect(banked.energy).toBe(100);
      expect(banked.xp).toBe(50);
    });

    it('should track banked items count for statistics', () => {
      const rewards = {
        energy: 0,
        items: [
          {
            id: 'i1',
            name: 'Item 1',
            quantity: 1,
            rarity: 'common' as const,
            type: 'trade_good' as const,
            setId: 's',
            value: 10,
            description: 'd',
          },
          {
            id: 'i2',
            name: 'Item 2',
            quantity: 2,
            rarity: 'uncommon' as const,
            type: 'discovery' as const,
            setId: 's',
            value: 20,
            description: 'd',
          },
        ],
        xp: 100,
      };

      const result = manager.processCashOut(rewards);

      expect(result.bankedItems).toBe(2);
    });
  });

  describe('XP preservation logic - Task 3.4', () => {
    it('should preserve XP even when player busts', () => {
      const rewards = {
        energy: 0,
        items: [
          {
            id: 'item1',
            name: 'Lost Item',
            quantity: 1,
            rarity: 'epic' as const,
            type: 'legendary' as const,
            setId: 'legendary_set',
            value: 500,
            description: 'Epic item',
          },
        ],
        xp: 1000,
      };

      const bustResult = manager.processBust(rewards);

      expect(bustResult.xpPreserved).toBe(true);
      expect(bustResult.preservedXp).toBe(1000); // XP preserved even on bust
      expect(bustResult.itemsLost).toBe(1); // But items are lost
    });

    it('should preserve XP on successful cash out', () => {
      const rewards = {
        energy: 50,
        items: [
          {
            id: 'item1',
            name: 'Saved Item',
            quantity: 2,
            rarity: 'rare' as const,
            type: 'discovery' as const,
            setId: 'discovery_set',
            value: 100,
            description: 'Rare item',
          },
        ],
        xp: 750,
      };

      const cashOutResult = manager.processCashOut(rewards);

      expect(cashOutResult.xpPreserved).toBe(true);
      expect(cashOutResult.preservedXp).toBe(750); // XP preserved
      expect(cashOutResult.bankedItems).toBe(1); // Items saved
    });

    it('should handle fractional XP values correctly', () => {
      const rewards = { energy: 0, items: [], xp: 123.45 };

      const result = manager.processCashOut(rewards);

      expect(result.preservedXp).toBeCloseTo(123.45);
    });

    it('should handle zero XP scenarios', () => {
      const rewards = { energy: 100, items: [], xp: 0 };

      const result = manager.processCashOut(rewards);

      expect(result.xpPreserved).toBe(true);
      expect(result.preservedXp).toBe(0);
    });

    it('should preserve XP from steps even when run fails', () => {
      // Simulate a bust scenario where player loses items but keeps XP from steps
      const rewards = {
        energy: 0,
        items: [
          {
            id: 'lost',
            name: 'Lost Item',
            quantity: 1,
            rarity: 'epic' as const,
            type: 'legendary' as const,
            setId: 'legendary_set',
            value: 1000,
            description: 'Lost',
          },
        ],
        xp: 5000, // Step-based XP should be preserved
      };

      const bustResult = manager.processBust(rewards);

      // XP is always preserved (from steps)
      expect(bustResult.xpPreserved).toBe(true);
      expect(bustResult.preservedXp).toBe(5000);
    });

    it('should ensure steps always count for XP regardless of outcome', () => {
      // This test verifies the core principle: steps always count
      const successRewards = { energy: 100, items: [], xp: 10000 };
      const bustRewards = { energy: 0, items: [], xp: 10000 };

      const successResult = manager.processCashOut(successRewards);
      const bustResult = manager.processBust(bustRewards);

      // Both outcomes preserve the same XP
      expect(successResult.preservedXp).toBe(10000);
      expect(bustResult.preservedXp).toBe(10000);
      expect(successResult.preservedXp).toBe(bustResult.preservedXp);
    });
  });

  describe('bust confirmation - Task 3.5', () => {
    it('should provide clear consequence explanation for bust', () => {
      const consequence = manager.getBustConsequence();

      expect(consequence.message).toBeDefined();
      expect(consequence.xpPreserved).toBe(true);
      expect(consequence.itemsLost).toBeDefined();
    });

    it('should provide context-aware explanations based on items lost', () => {
      const oneItemContext = manager.getBustConsequence({ itemsLost: 1 });
      const multipleItemsContext = manager.getBustConsequence({ itemsLost: 5 });
      const noItemsContext = manager.getBustConsequence({ itemsLost: 0 });

      expect(oneItemContext.message).toContain(
        '1 collected item has been lost'
      );
      expect(multipleItemsContext.message).toContain(
        '5 collected items have been lost'
      );
      expect(noItemsContext.message).toContain('Your collected items are lost');
    });

    it('should always mention XP preservation in bust consequence', () => {
      const consequence = manager.getBustConsequence();

      expect(consequence.message).toContain('XP');
      expect(consequence.message).toContain('preserved');
      expect(consequence.xpPreserved).toBe(true);
    });

    it('should explain that step progress is retained', () => {
      const consequence = manager.getBustConsequence({ itemsLost: 3 });

      expect(consequence.message).toContain('step progress');
      expect(consequence.message).toContain('preserved');
    });

    it('should provide different messages for different item counts', () => {
      const consequence1 = manager.getBustConsequence({ itemsLost: 1 });
      const consequence2 = manager.getBustConsequence({ itemsLost: 10 });

      expect(consequence1.message).toContain('1 collected item has been lost');
      expect(consequence1.message).toContain('has'); // singular form

      expect(consequence2.message).toContain(
        '10 collected items have been lost'
      );
      expect(consequence2.message).toContain('have'); // plural form
    });

    it('should be clear about what is lost vs preserved', () => {
      const consequence = manager.getBustConsequence({ itemsLost: 5 });

      // Should mention what's lost
      expect(consequence.message).toContain('lost');
      // Should mention what's preserved
      expect(consequence.message).toContain('preserved');
      // Should be clear about XP preservation
      expect(consequence.xpPreserved).toBe(true);
    });
  });

  describe('cash out confirmation - Task 3.6', () => {
    it('should provide comprehensive reward summary', () => {
      const rewards = {
        energy: 150,
        items: [
          {
            id: 'item1',
            name: 'Rare Gem',
            quantity: 1,
            rarity: 'rare' as const,
            type: 'trade_good' as const,
            setId: 'trade_set',
            value: 100,
            description: 'A rare gem',
          },
        ],
        xp: 500,
      };

      const summary = manager.getCashOutSummary(rewards);

      expect(summary.totalItems).toBe(1);
      expect(summary.totalXP).toBe(500);
      expect(summary.totalEnergy).toBe(150);
      expect(summary.rewardDetails).toBe('Rare Gem');
    });

    it('should categorize items by type in summary', () => {
      const rewards = {
        energy: 0,
        items: [
          {
            id: 'trade1',
            name: 'Trade Good 1',
            quantity: 3,
            rarity: 'common' as const,
            type: 'trade_good' as const,
            setId: 'trade_set',
            value: 10,
            description: 'Common good',
          },
          {
            id: 'discovery1',
            name: 'Discovery 1',
            quantity: 1,
            rarity: 'rare' as const,
            type: 'discovery' as const,
            setId: 'discovery_set',
            value: 50,
            description: 'Rare discovery',
          },
          {
            id: 'legendary1',
            name: 'Legendary 1',
            quantity: 1,
            rarity: 'legendary' as const,
            type: 'legendary' as const,
            setId: 'legendary_set',
            value: 500,
            description: 'Legendary item',
          },
        ],
        xp: 1000,
      };

      const summary = manager.getCashOutSummary(rewards);

      expect(summary.itemTypes.trade_goods).toBe(1);
      expect(summary.itemTypes.discoveries).toBe(1);
      expect(summary.itemTypes.legendaries).toBe(1);
    });

    it('should calculate total item value correctly', () => {
      const rewards = {
        energy: 0,
        items: [
          {
            id: 'item1',
            name: 'Item 1',
            quantity: 5,
            rarity: 'common' as const,
            type: 'trade_good' as const,
            setId: 'trade_set',
            value: 10,
            description: 'Test',
          },
          {
            id: 'item2',
            name: 'Item 2',
            quantity: 2,
            rarity: 'uncommon' as const,
            type: 'discovery' as const,
            setId: 'discovery_set',
            value: 25,
            description: 'Test',
          },
        ],
        xp: 0,
      };

      const summary = manager.getCashOutSummary(rewards);

      // (5 * 10) + (2 * 25) = 50 + 50 = 100
      expect(summary.totalValue).toBe(100);
    });

    it('should handle summary for mixed item types', () => {
      const rewards = {
        energy: 200,
        items: [
          {
            id: 'trade1',
            name: 'Gold Coin',
            quantity: 10,
            rarity: 'common' as const,
            type: 'trade_good' as const,
            setId: 'trade_set',
            value: 5,
            description: 'Gold coin',
          },
          {
            id: 'trade2',
            name: 'Silver Coin',
            quantity: 5,
            rarity: 'common' as const,
            type: 'trade_good' as const,
            setId: 'trade_set',
            value: 2,
            description: 'Silver coin',
          },
          {
            id: 'discovery1',
            name: 'Ancient Artifact',
            quantity: 1,
            rarity: 'epic' as const,
            type: 'discovery' as const,
            setId: 'discovery_set',
            value: 200,
            description: 'Ancient',
          },
        ],
        xp: 750,
      };

      const summary = manager.getCashOutSummary(rewards);

      expect(summary.totalItems).toBe(3);
      expect(summary.itemTypes.trade_goods).toBe(2);
      expect(summary.itemTypes.discoveries).toBe(1);
      expect(summary.itemTypes.legendaries).toBe(0);
      // (10 * 5) + (5 * 2) + (1 * 200) = 50 + 10 + 200 = 260
      expect(summary.totalValue).toBe(260);
    });

    it('should handle empty reward summary', () => {
      const rewards = { energy: 100, items: [], xp: 50 };

      const summary = manager.getCashOutSummary(rewards);

      expect(summary.totalItems).toBe(0);
      expect(summary.rewardDetails).toBe('No items collected');
      expect(summary.itemTypes.trade_goods).toBe(0);
      expect(summary.itemTypes.discoveries).toBe(0);
      expect(summary.itemTypes.legendaries).toBe(0);
      expect(summary.totalValue).toBe(0);
    });

    it('should list all item names in reward details', () => {
      const rewards = {
        energy: 0,
        items: [
          {
            id: 'item1',
            name: 'Item A',
            quantity: 1,
            rarity: 'common' as const,
            type: 'trade_good' as const,
            setId: 'set',
            value: 10,
            description: 'Test',
          },
          {
            id: 'item2',
            name: 'Item B',
            quantity: 1,
            rarity: 'uncommon' as const,
            type: 'discovery' as const,
            setId: 'set',
            value: 20,
            description: 'Test',
          },
          {
            id: 'item3',
            name: 'Item C',
            quantity: 1,
            rarity: 'rare' as const,
            type: 'legendary' as const,
            setId: 'set',
            value: 30,
            description: 'Test',
          },
        ],
        xp: 100,
      };

      const summary = manager.getCashOutSummary(rewards);

      expect(summary.rewardDetails).toBe('Item A, Item B, Item C');
    });
  });

  describe('comprehensive unit tests - Task 3.7', () => {
    describe('edge cases', () => {
      it('should handle negative energy values gracefully', () => {
        const warning = manager.getRiskWarning(100, 150);

        expect(warning.safetyMargin).toBe(0);
        expect(warning.level).toBe('critical');
      });

      it('should handle very large reward values', () => {
        const rewards = {
          energy: 0,
          items: [
            {
              id: 'huge',
              name: 'Huge Reward',
              quantity: 999,
              rarity: 'legendary' as const,
              type: 'legendary' as const,
              setId: 'legendary_set',
              value: 9999,
              description: 'Huge',
            },
          ],
          xp: 999999,
        };

        const summary = manager.getCashOutSummary(rewards);

        expect(summary.totalItems).toBe(1);
        expect(summary.totalXP).toBe(999999);
        expect(summary.totalValue).toBe(999 * 9999);
      });

      it('should handle empty energy on cash out', () => {
        const rewards = { energy: 0, items: [], xp: 100 };

        const result = manager.canCashOut(0, 100, rewards);

        expect(result).toBe(false); // Can't cash out without energy
      });

      it('should handle all item types together', () => {
        const rewards = {
          energy: 0,
          items: [
            {
              id: 'tg1',
              name: 'TG1',
              quantity: 1,
              rarity: 'common' as const,
              type: 'trade_good' as const,
              setId: 'tg',
              value: 10,
              description: 'd',
            },
            {
              id: 'tg2',
              name: 'TG2',
              quantity: 2,
              rarity: 'uncommon' as const,
              type: 'trade_good' as const,
              setId: 'tg',
              value: 10,
              description: 'd',
            },
            {
              id: 'd1',
              name: 'D1',
              quantity: 1,
              rarity: 'rare' as const,
              type: 'discovery' as const,
              setId: 'd',
              value: 50,
              description: 'd',
            },
            {
              id: 'l1',
              name: 'L1',
              quantity: 1,
              rarity: 'legendary' as const,
              type: 'legendary' as const,
              setId: 'l',
              value: 500,
              description: 'd',
            },
          ],
          xp: 1000,
        };

        const summary = manager.getCashOutSummary(rewards);

        expect(summary.totalItems).toBe(4);
        expect(summary.itemTypes.trade_goods).toBe(2);
        expect(summary.itemTypes.discoveries).toBe(1);
        expect(summary.itemTypes.legendaries).toBe(1);
      });
    });

    describe('integration scenarios', () => {
      it('should handle complete cash out flow', () => {
        const rewards = {
          energy: 50,
          items: [
            {
              id: 'item1',
              name: 'Item 1',
              quantity: 2,
              rarity: 'common' as const,
              type: 'trade_good' as const,
              setId: 's',
              value: 10,
              description: 'd',
            },
          ],
          xp: 200,
        };

        // Get summary
        const summary = manager.getCashOutSummary(rewards);
        expect(summary.totalItems).toBe(1);
        expect(summary.totalXP).toBe(200);

        // Process cash out
        const result = manager.processCashOut(rewards);
        expect(result.success).toBe(true);
        expect(result.xpPreserved).toBe(true);
        expect(result.preservedXp).toBe(200);
      });

      it('should handle complete bust flow', () => {
        const rewards = {
          energy: 0,
          items: [
            {
              id: 'lost1',
              name: 'Lost 1',
              quantity: 3,
              rarity: 'epic' as const,
              type: 'legendary' as const,
              setId: 'l',
              value: 1000,
              description: 'd',
            },
          ],
          xp: 500,
        };

        // Get consequence
        const consequence = manager.getBustConsequence({ itemsLost: 3 });
        expect(consequence.xpPreserved).toBe(true);
        expect(consequence.itemsLost).toBe(true);

        // Process bust
        const result = manager.processBust(rewards);
        expect(result.xpPreserved).toBe(true);
        expect(result.preservedXp).toBe(500);
        expect(result.itemsLost).toBe(1);
      });

      it('should handle zero energy with items', () => {
        const rewards = {
          energy: 0,
          items: [
            {
              id: 'item1',
              name: 'Item',
              quantity: 1,
              rarity: 'common' as const,
              type: 'trade_good' as const,
              setId: 's',
              value: 10,
              description: 'd',
            },
          ],
          xp: 100,
        };

        const canCashOut = manager.canCashOut(0, 50, rewards);
        expect(canCashOut).toBe(false);
      });
    });

    describe('boundary conditions', () => {
      it('should handle exactly 50% safety margin threshold', () => {
        const warning = manager.getRiskWarning(100, 50);

        expect(warning.level).toBe('safe');
        expect(warning.safetyMargin).toBe(50);
      });

      it('should handle exactly 30% safety margin threshold', () => {
        const warning = manager.getRiskWarning(100, 70);

        expect(warning.level).toBe('caution');
        expect(warning.safetyMargin).toBe(30);
      });

      it('should handle exactly 10% safety margin threshold', () => {
        const warning = manager.getRiskWarning(100, 90);

        expect(warning.level).toBe('danger');
        expect(warning.safetyMargin).toBe(10);
      });

      it('should handle exactly 0% safety margin threshold', () => {
        const warning = manager.getRiskWarning(100, 100);

        expect(warning.level).toBe('critical');
        expect(warning.safetyMargin).toBe(0);
      });
    });

    describe('quantity handling', () => {
      it('should handle items with quantity > 1 in summary', () => {
        const rewards = {
          energy: 0,
          items: [
            {
              id: 'gem',
              name: 'Gem',
              quantity: 10,
              rarity: 'common' as const,
              type: 'trade_good' as const,
              setId: 's',
              value: 5,
              description: 'd',
            },
          ],
          xp: 50,
        };

        const summary = manager.getCashOutSummary(rewards);

        expect(summary.totalItems).toBe(1);
        expect(summary.totalValue).toBe(50); // 10 * 5
      });

      it('should sum quantities correctly across multiple items', () => {
        const rewards = {
          energy: 0,
          items: [
            {
              id: 'item1',
              name: 'Item A',
              quantity: 3,
              rarity: 'common' as const,
              type: 'trade_good' as const,
              setId: 's',
              value: 10,
              description: 'd',
            },
            {
              id: 'item2',
              name: 'Item B',
              quantity: 5,
              rarity: 'uncommon' as const,
              type: 'discovery' as const,
              setId: 's',
              value: 20,
              description: 'd',
            },
            {
              id: 'item3',
              name: 'Item C',
              quantity: 2,
              rarity: 'rare' as const,
              type: 'legendary' as const,
              setId: 's',
              value: 100,
              description: 'd',
            },
          ],
          xp: 0,
        };

        const summary = manager.getCashOutSummary(rewards);

        // 3*10 + 5*20 + 2*100 = 30 + 100 + 200 = 330
        expect(summary.totalValue).toBe(330);
      });
    });

    describe('performance and reliability', () => {
      it('should handle large number of items efficiently', () => {
        const items = Array.from({ length: 100 }, (_, i) => ({
          id: `item${i}`,
          name: `Item ${i}`,
          quantity: 1,
          rarity: 'common' as const,
          type: 'trade_good' as const,
          setId: 'set',
          value: i,
          description: 'Test',
        }));

        const rewards = { energy: 0, items, xp: 1000 };

        const startTime = performance.now();
        const summary = manager.getCashOutSummary(rewards);
        const endTime = performance.now();

        expect(summary.totalItems).toBe(100);
        expect(endTime - startTime).toBeLessThan(10); // Should be fast
      });

      it('should handle concurrent operations safely', () => {
        const rewards = { energy: 100, items: [], xp: 500 };

        const promise1 = Promise.resolve(manager.getRiskWarning(100, 50));
        const promise2 = Promise.resolve(manager.getCashOutSummary(rewards));
        const promise3 = Promise.resolve(manager.processCashOut(rewards));

        return Promise.all([promise1, promise2, promise3]).then(
          ([warning, summary, result]) => {
            expect(warning.level).toBe('safe');
            expect(summary.totalXP).toBe(500);
            expect(result.xpPreserved).toBe(true);
          }
        );
      });
    });
  });
});
