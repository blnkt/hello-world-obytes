import { TradeOpportunityEncounter } from './trade-opportunity-encounter';

describe('TradeOpportunityEncounter', () => {
  let tradeEncounter: TradeOpportunityEncounter;

  beforeEach(() => {
    tradeEncounter = new TradeOpportunityEncounter();
  });

  describe('constructor and initialization', () => {
    it('should initialize with default settings', () => {
      expect(tradeEncounter.getEncounterType()).toBe('trade_opportunity');
      expect(tradeEncounter.getDepth()).toBeGreaterThan(0);
      expect(tradeEncounter.getTradeOptions()).toBeDefined();
      expect(tradeEncounter.getTradeOptions().length).toBeGreaterThan(0);
    });

    it('should initialize with custom depth', () => {
      const customTradeEncounter = new TradeOpportunityEncounter(5);
      expect(customTradeEncounter.getDepth()).toBe(5);
    });

    it('should initialize with depth-based trade options', () => {
      const depth1Encounter = new TradeOpportunityEncounter(1);
      const depth5Encounter = new TradeOpportunityEncounter(5);

      const depth1Options = depth1Encounter.getTradeOptions();
      const depth5Options = depth5Encounter.getTradeOptions();

      expect(depth1Options).toBeDefined();
      expect(depth5Options).toBeDefined();
      expect(depth1Options.length).toBeGreaterThan(0);
      expect(depth5Options.length).toBeGreaterThan(0);
    });
  });

  describe('trade options and mechanics', () => {
    it('should provide A/B/C choice options', () => {
      const options = tradeEncounter.getTradeOptions();

      expect(options).toHaveLength(3);
      expect(options[0].id).toBe('A');
      expect(options[1].id).toBe('B');
      expect(options[2].id).toBe('C');
    });

    it('should have different trade types for each option', () => {
      const options = tradeEncounter.getTradeOptions();

      const types = options.map((option) => option.type);
      const uniqueTypes = [...new Set(types)];

      expect(uniqueTypes.length).toBeGreaterThan(1);
    });

    it('should provide trade descriptions and outcomes', () => {
      const options = tradeEncounter.getTradeOptions();

      options.forEach((option) => {
        expect(option.description).toBeDefined();
        expect(option.description.length).toBeGreaterThan(0);
        expect(option.outcome).toBeDefined();
        expect(option.outcome.rewards).toBeDefined();
        expect(option.outcome.consequences).toBeDefined();
      });
    });

    it('should have different reward values for different options', () => {
      const options = tradeEncounter.getTradeOptions();

      const rewardValues = options.map((option) =>
        option.outcome.rewards.reduce((sum, reward) => sum + reward.value, 0)
      );

      const uniqueValues = [...new Set(rewardValues)];
      expect(uniqueValues.length).toBeGreaterThan(1);
    });
  });

  describe('arbitrage opportunities', () => {
    it('should create price differences between trade posts', () => {
      const tradePost1 = tradeEncounter.getTradePost('post_1');
      const tradePost2 = tradeEncounter.getTradePost('post_2');

      expect(tradePost1).toBeDefined();
      expect(tradePost2).toBeDefined();
      expect(tradePost1.prices).toBeDefined();
      expect(tradePost2.prices).toBeDefined();

      // Should have different prices for arbitrage opportunities
      const hasPriceDifference = Object.keys(tradePost1.prices).some(
        (item) => tradePost1.prices[item] !== tradePost2.prices[item]
      );
      expect(hasPriceDifference).toBe(true);
    });

    it('should provide arbitrage calculation methods', () => {
      const arbitrageOpportunities = tradeEncounter.getArbitrageOpportunities();

      expect(arbitrageOpportunities).toBeDefined();
      expect(arbitrageOpportunities.length).toBeGreaterThan(0);

      arbitrageOpportunities.forEach((opportunity) => {
        expect(opportunity.item).toBeDefined();
        expect(opportunity.buyFrom).toBeDefined();
        expect(opportunity.sellTo).toBeDefined();
        expect(opportunity.profit).toBeGreaterThan(0);
      });
    });

    it('should scale arbitrage opportunities with depth', () => {
      const depth1Encounter = new TradeOpportunityEncounter(1);
      const depth5Encounter = new TradeOpportunityEncounter(5);

      const depth1Arbitrage = depth1Encounter.getArbitrageOpportunities();
      const depth5Arbitrage = depth5Encounter.getArbitrageOpportunities();

      expect(depth1Arbitrage.length).toBeGreaterThan(0);
      expect(depth5Arbitrage.length).toBeGreaterThan(0);

      // Deeper levels should have more profitable arbitrage opportunities
      const depth1MaxProfit = Math.max(...depth1Arbitrage.map((a) => a.profit));
      const depth5MaxProfit = Math.max(...depth5Arbitrage.map((a) => a.profit));

      expect(depth5MaxProfit).toBeGreaterThanOrEqual(depth1MaxProfit);
    });
  });

  describe('decision-based gameplay', () => {
    it('should process trade decisions', () => {
      const options = tradeEncounter.getTradeOptions();
      const selectedOption = options[0];

      const result = tradeEncounter.processTradeDecision(selectedOption.id);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.rewards).toBeDefined();
      expect(result.consequences).toBeDefined();
    });

    it('should handle invalid trade decisions', () => {
      const result = tradeEncounter.processTradeDecision('invalid_option');

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should track trade history', () => {
      const options = tradeEncounter.getTradeOptions();

      tradeEncounter.processTradeDecision(options[0].id);
      tradeEncounter.processTradeDecision(options[1].id);

      const history = tradeEncounter.getTradeHistory();
      expect(history).toHaveLength(2);
      expect(history[0].optionId).toBe('A');
      expect(history[1].optionId).toBe('B');
    });

    it('should prevent duplicate trades', () => {
      const options = tradeEncounter.getTradeOptions();

      const result1 = tradeEncounter.processTradeDecision(options[0].id);
      const result2 = tradeEncounter.processTradeDecision(options[0].id);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(false);
      expect(result2.error).toContain('already traded');
    });
  });

  describe('depth-based scaling', () => {
    it('should scale trade rewards based on depth', () => {
      const depth1Encounter = new TradeOpportunityEncounter(1);
      const depth5Encounter = new TradeOpportunityEncounter(5);

      const depth1Options = depth1Encounter.getTradeOptions();
      const depth5Options = depth5Encounter.getTradeOptions();

      const depth1Rewards = depth1Options[0].outcome.rewards;
      const depth5Rewards = depth5Options[0].outcome.rewards;

      if (depth1Rewards.length > 0 && depth5Rewards.length > 0) {
        expect(depth5Rewards[0].value).toBeGreaterThan(depth1Rewards[0].value);
      }
    });

    it('should scale trade consequences based on depth', () => {
      const depth1Encounter = new TradeOpportunityEncounter(1);
      const depth5Encounter = new TradeOpportunityEncounter(5);

      const depth1Options = depth1Encounter.getTradeOptions();
      const depth5Options = depth5Encounter.getTradeOptions();

      const depth1Consequences = depth1Options[0].outcome.consequences;
      const depth5Consequences = depth5Options[0].outcome.consequences;

      if (depth1Consequences.length > 0 && depth5Consequences.length > 0) {
        expect(depth5Consequences[0].value).toBeGreaterThanOrEqual(
          depth1Consequences[0].value
        );
      }
    });

    it('should provide more complex trade options at deeper levels', () => {
      const depth1Encounter = new TradeOpportunityEncounter(1);
      const depth5Encounter = new TradeOpportunityEncounter(5);

      const depth1Arbitrage = depth1Encounter.getArbitrageOpportunities();
      const depth5Arbitrage = depth5Encounter.getArbitrageOpportunities();

      expect(depth5Arbitrage.length).toBeGreaterThanOrEqual(
        depth1Arbitrage.length
      );
    });
  });

  describe('encounter completion', () => {
    it('should complete encounter after successful trade', () => {
      const options = tradeEncounter.getTradeOptions();
      const result = tradeEncounter.processTradeDecision(options[0].id);

      expect(result.success).toBe(true);
      // Encounter completes after 2 trades, not immediately
      expect(tradeEncounter.isEncounterComplete()).toBe(false);

      // Complete the second trade to finish the encounter
      const result2 = tradeEncounter.processTradeDecision(options[1].id);
      expect(result2.success).toBe(true);
      expect(tradeEncounter.isEncounterComplete()).toBe(true);
    });

    it('should generate appropriate rewards on completion', () => {
      const options = tradeEncounter.getTradeOptions();
      const result = tradeEncounter.processTradeDecision(options[0].id);

      if (result.success) {
        // Complete the encounter with a second trade
        tradeEncounter.processTradeDecision(options[1].id);

        const rewards = tradeEncounter.generateRewards();
        expect(rewards).toBeDefined();
        expect(rewards.length).toBeGreaterThan(0);
      }
    });

    it('should handle encounter failure', () => {
      const result = tradeEncounter.processTradeDecision('invalid_option');

      expect(result.success).toBe(false);
      expect(tradeEncounter.isEncounterComplete()).toBe(true);
    });
  });

  describe('trade post management', () => {
    it('should provide multiple trade posts', () => {
      const tradePosts = tradeEncounter.getAllTradePosts();

      expect(tradePosts).toBeDefined();
      expect(tradePosts.length).toBeGreaterThan(1);

      tradePosts.forEach((post) => {
        expect(post.id).toBeDefined();
        expect(post.name).toBeDefined();
        expect(post.prices).toBeDefined();
      });
    });

    it('should allow price updates', () => {
      const tradePost = tradeEncounter.getTradePost('post_1');
      const originalPrice = tradePost.prices['common_item'];

      tradeEncounter.updateTradePostPrices('post_1', {
        common_item: originalPrice * 1.5,
      });

      const updatedPost = tradeEncounter.getTradePost('post_1');
      expect(updatedPost.prices['common_item']).toBe(originalPrice * 1.5);
    });

    it('should validate trade post operations', () => {
      expect(() => {
        tradeEncounter.getTradePost('invalid_post');
      }).toThrow('Trade post not found');

      expect(() => {
        tradeEncounter.updateTradePostPrices('invalid_post', {});
      }).toThrow('Trade post not found');
    });
  });
});
