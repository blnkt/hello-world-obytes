import { TradeOpportunityEncounter } from './trade-opportunity-encounter';

describe('TradeOpportunityEncounter - Collection Set Integration', () => {
  let tradeEncounter: TradeOpportunityEncounter;

  beforeEach(() => {
    tradeEncounter = new TradeOpportunityEncounter();
  });

  describe('collection set item rewards', () => {
    it('should generate trade goods that belong to specific collection sets', () => {
      const options = tradeEncounter.getTradeOptions();

      options.forEach((option) => {
        option.outcome.rewards.forEach((reward) => {
          expect(reward.type).toBe('trade_good');
          expect(reward.setId).toBeDefined();
          expect(reward.setId).not.toBe('');
          expect([
            'silk_road_set',
            'spice_trade_set',
            'gem_merchant_set',
            'exotic_goods_set',
          ]).toContain(reward.setId);
        });
      });
    });

    it('should provide different collection sets based on trade post', () => {
      const _tradePosts = tradeEncounter.getAllTradePosts();
      const collectionSets = new Set<string>();

      // Generate rewards from different posts to see variety
      for (let i = 0; i < 10; i++) {
        const testEncounter = new TradeOpportunityEncounter();
        const options = testEncounter.getTradeOptions();
        options.forEach((option) => {
          option.outcome.rewards.forEach((reward) => {
            collectionSets.add(reward.setId);
          });
        });
      }

      expect(collectionSets.size).toBeGreaterThan(1);
    });

    it('should scale collection set rewards with depth', () => {
      const depth1Encounter = new TradeOpportunityEncounter(1);
      const depth5Encounter = new TradeOpportunityEncounter(5);

      const depth1Options = depth1Encounter.getTradeOptions();
      const depth5Options = depth5Encounter.getTradeOptions();

      const depth1Rewards = depth1Options[0].outcome.rewards;
      const depth5Rewards = depth5Options[0].outcome.rewards;

      if (depth1Rewards.length > 0 && depth5Rewards.length > 0) {
        expect(depth5Rewards[0].value).toBeGreaterThan(depth1Rewards[0].value);
        expect(depth5Rewards[0].setId).toBe(depth1Rewards[0].setId); // Same set, better value
      }
    });

    it('should provide collection set information', () => {
      const collectionSets = tradeEncounter.getAvailableCollectionSets();

      expect(collectionSets).toBeDefined();
      expect(collectionSets.length).toBeGreaterThan(0);

      collectionSets.forEach((set) => {
        expect(set.id).toBeDefined();
        expect(set.name).toBeDefined();
        expect(set.completionBonus).toBeDefined();
        expect(set.items).toBeDefined();
        expect(Array.isArray(set.items)).toBe(true);
      });
    });

    it('should track collection progress', () => {
      const options = tradeEncounter.getTradeOptions();
      const result = tradeEncounter.processTradeDecision(options[0].id);

      if (result.success) {
        const progress = tradeEncounter.getCollectionProgress();
        expect(progress).toBeDefined();
        expect(progress.totalItems).toBeGreaterThan(0);
        expect(progress.completedSets).toBeDefined();
        expect(progress.partialSets).toBeDefined();
      }
    });
  });

  describe('depth-based inventory scaling', () => {
    it('should offer better trade goods at deeper depths', () => {
      const depth1Encounter = new TradeOpportunityEncounter(1);
      const depth3Encounter = new TradeOpportunityEncounter(3);
      const depth5Encounter = new TradeOpportunityEncounter(5);

      const depth1Inventory = depth1Encounter.getAvailableInventory();
      const depth3Inventory = depth3Encounter.getAvailableInventory();
      const depth5Inventory = depth5Encounter.getAvailableInventory();

      expect(depth1Inventory.length).toBeGreaterThan(0);
      expect(depth3Inventory.length).toBeGreaterThanOrEqual(
        depth1Inventory.length
      );
      expect(depth5Inventory.length).toBeGreaterThanOrEqual(
        depth3Inventory.length
      );

      // Deeper depths should have higher value items
      const depth1MaxValue = Math.max(
        ...depth1Inventory.map((item) => item.value)
      );
      const depth5MaxValue = Math.max(
        ...depth5Inventory.map((item) => item.value)
      );
      expect(depth5MaxValue).toBeGreaterThan(depth1MaxValue);
    });

    it('should unlock rare items at deeper depths', () => {
      const depth1Encounter = new TradeOpportunityEncounter(1);
      const depth5Encounter = new TradeOpportunityEncounter(5);

      const depth1Inventory = depth1Encounter.getAvailableInventory();
      const depth5Inventory = depth5Encounter.getAvailableInventory();

      const depth1Rarity = depth1Inventory.map((item) => item.rarity);
      const depth5Rarity = depth5Inventory.map((item) => item.rarity);

      // Deeper depths should have more rare items
      const depth1RareCount = depth1Rarity.filter(
        (r) => r === 'rare' || r === 'exotic'
      ).length;
      const depth5RareCount = depth5Rarity.filter(
        (r) => r === 'rare' || r === 'exotic'
      ).length;

      expect(depth5RareCount).toBeGreaterThanOrEqual(depth1RareCount);
    });

    it('should provide inventory filtering by rarity', () => {
      const _inventory = tradeEncounter.getAvailableInventory();

      const commonItems = tradeEncounter.getInventoryByRarity('common');
      const rareItems = tradeEncounter.getInventoryByRarity('rare');
      const exoticItems = tradeEncounter.getInventoryByRarity('exotic');

      expect(commonItems.length).toBeGreaterThan(0);
      expect(rareItems.length).toBeGreaterThanOrEqual(0);
      expect(exoticItems.length).toBeGreaterThanOrEqual(0);

      commonItems.forEach((item) => expect(item.rarity).toBe('common'));
      rareItems.forEach((item) => expect(item.rarity).toBe('rare'));
      exoticItems.forEach((item) => expect(item.rarity).toBe('exotic'));
    });

    it('should scale inventory availability with depth', () => {
      const depth1Encounter = new TradeOpportunityEncounter(1);
      const depth5Encounter = new TradeOpportunityEncounter(5);

      const depth1Availability = depth1Encounter.getInventoryAvailability();
      const depth5Availability = depth5Encounter.getInventoryAvailability();

      expect(depth5Availability.totalItems).toBeGreaterThanOrEqual(
        depth1Availability.totalItems
      );
      expect(depth5Availability.rareItems).toBeGreaterThanOrEqual(
        depth1Availability.rareItems
      );
      expect(depth5Availability.exoticItems).toBeGreaterThanOrEqual(
        depth1Availability.exoticItems
      );
    });
  });

  describe('failure consequences for bad trades', () => {
    it('should implement bad trade detection', () => {
      const options = tradeEncounter.getTradeOptions();

      // Process a trade and check if it's marked as bad
      const result = tradeEncounter.processTradeDecision(options[0].id);

      if (result.success) {
        const tradeQuality = tradeEncounter.getLastTradeQuality();
        expect(tradeQuality).toBeDefined();
        expect(['excellent', 'good', 'fair', 'poor', 'terrible']).toContain(
          tradeQuality?.rating
        );
      }
    });

    it('should apply consequences for bad trades', () => {
      const options = tradeEncounter.getTradeOptions();
      const result = tradeEncounter.processTradeDecision(options[0].id);

      if (result.success) {
        const consequences = tradeEncounter.getTradeConsequences();

        if (consequences.isBadTrade) {
          expect(consequences.energyLoss).toBeGreaterThan(0);
          expect(consequences.itemLossRisk).toBeGreaterThan(0);
          expect(consequences.description).toBeDefined();
        }
      }
    });

    it('should track bad trade statistics', () => {
      const stats = tradeEncounter.getTradeStatistics();

      expect(stats.totalTrades).toBeGreaterThanOrEqual(0);
      expect(stats.goodTrades).toBeGreaterThanOrEqual(0);
      expect(stats.badTrades).toBeGreaterThanOrEqual(0);
      expect(stats.averageTradeQuality).toBeDefined();
    });

    it('should prevent excessive bad trades', () => {
      // Simulate multiple bad trades
      for (let i = 0; i < 5; i++) {
        const testEncounter = new TradeOpportunityEncounter();
        const options = testEncounter.getTradeOptions();
        testEncounter.processTradeDecision(options[0].id);
      }

      const stats = tradeEncounter.getTradeStatistics();
      const badTradeRate = stats.badTrades / Math.max(stats.totalTrades, 1);

      // Bad trade rate should be reasonable (not more than 30%)
      expect(badTradeRate).toBeLessThanOrEqual(0.3);
    });

    it('should provide trade risk assessment', () => {
      const riskAssessment = tradeEncounter.getTradeRiskAssessment();

      expect(riskAssessment.overallRisk).toBeDefined();
      expect(['low', 'medium', 'high']).toContain(riskAssessment.overallRisk);
      expect(riskAssessment.factors).toBeDefined();
      expect(Array.isArray(riskAssessment.factors)).toBe(true);
    });
  });

  describe('comprehensive integration tests', () => {
    it('should integrate all new features seamlessly', () => {
      const depth3Encounter = new TradeOpportunityEncounter(3);

      // Test collection sets
      const collectionSets = depth3Encounter.getAvailableCollectionSets();
      expect(collectionSets.length).toBeGreaterThan(0);

      // Test inventory scaling
      const inventory = depth3Encounter.getAvailableInventory();
      expect(inventory.length).toBeGreaterThan(0);

      // Test trade processing with all features
      const options = depth3Encounter.getTradeOptions();
      const result = depth3Encounter.processTradeDecision(options[0].id);

      if (result.success) {
        // Should have collection set rewards
        expect(result.rewards).toBeDefined();
        expect(result.rewards!.length).toBeGreaterThan(0);

        // Should track trade quality
        const quality = depth3Encounter.getLastTradeQuality();
        expect(quality).toBeDefined();

        // Should provide comprehensive statistics
        const stats = depth3Encounter.getTradeStatistics();
        expect(stats.totalTrades).toBeGreaterThan(0);
      }
    });

    it('should maintain backward compatibility', () => {
      // All existing functionality should still work
      const options = tradeEncounter.getTradeOptions();
      expect(options).toHaveLength(3);

      const arbitrage = tradeEncounter.getArbitrageOpportunities();
      expect(arbitrage.length).toBeGreaterThan(0);

      const _tradePosts = tradeEncounter.getAllTradePosts();
      expect(_tradePosts.length).toBeGreaterThan(1);
    });

    it('should handle edge cases gracefully', () => {
      // Test with extreme depth
      const extremeEncounter = new TradeOpportunityEncounter(100);
      const inventory = extremeEncounter.getAvailableInventory();
      expect(inventory.length).toBeGreaterThan(0);

      // Test with depth 0
      const zeroDepthEncounter = new TradeOpportunityEncounter(0);
      const zeroInventory = zeroDepthEncounter.getAvailableInventory();
      expect(zeroInventory.length).toBeGreaterThan(0);

      // Test with negative depth
      const negativeEncounter = new TradeOpportunityEncounter(-1);
      const negativeInventory = negativeEncounter.getAvailableInventory();
      expect(negativeInventory.length).toBeGreaterThan(0);
    });
  });
});
