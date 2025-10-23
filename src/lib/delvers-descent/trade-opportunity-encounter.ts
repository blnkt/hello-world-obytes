import type {
  CollectedItem,
  CollectionSet,
  EncounterType,
} from '@/types/delvers-descent';

export interface TradeOption {
  id: 'A' | 'B' | 'C';
  type: 'buy' | 'sell' | 'exchange';
  description: string;
  outcome: TradeOutcome;
}

export interface TradeOutcome {
  rewards: CollectedItem[];
  consequences: TradeConsequence[];
}

export interface TradeConsequence {
  type: 'lose_energy' | 'lose_item' | 'force_retreat' | 'bust';
  value: number;
  description: string;
}

export interface TradePost {
  id: string;
  name: string;
  prices: Record<string, number>;
}

export interface ArbitrageOpportunity {
  item: string;
  buyFrom: string;
  sellTo: string;
  profit: number;
}

export interface TradeHistoryEntry {
  optionId: string;
  timestamp: number;
  outcome: TradeOutcome;
}

export interface InventoryItem {
  id: string;
  name: string;
  value: number;
  rarity: 'common' | 'rare' | 'exotic';
  collectionSet: string;
  description: string;
}

export interface InventoryAvailability {
  totalItems: number;
  commonItems: number;
  rareItems: number;
  exoticItems: number;
}

export interface TradeQuality {
  rating: 'excellent' | 'good' | 'fair' | 'poor' | 'terrible';
  score: number;
  factors: string[];
}

export interface TradeConsequences {
  isBadTrade: boolean;
  energyLoss: number;
  itemLossRisk: number;
  description: string;
}

export interface TradeStatistics {
  totalTrades: number;
  goodTrades: number;
  badTrades: number;
  averageTradeQuality: number;
}

export interface CollectionProgress {
  totalItems: number;
  completedSets: string[];
  partialSets: { setId: string; progress: number; total: number }[];
}

export interface TradeRiskAssessment {
  overallRisk: 'low' | 'medium' | 'high';
  factors: string[];
}

export class TradeOpportunityEncounter {
  private encounterType: EncounterType = 'trade_opportunity';
  private depth: number;
  private tradeOptions: TradeOption[] = [];
  private tradePosts: TradePost[] = [];
  private tradeHistory: TradeHistoryEntry[] = [];
  private encounterComplete: boolean = false;
  private encounterResult: 'success' | 'failure' | null = null;
  private availableInventory: InventoryItem[] = [];
  private collectionSets: CollectionSet[] = [];
  private tradeStatistics: TradeStatistics = {
    totalTrades: 0,
    goodTrades: 0,
    badTrades: 0,
    averageTradeQuality: 0,
  };
  private lastTradeQuality: TradeQuality | null = null;

  constructor(depth: number = 1) {
    this.depth = depth;
    this.initializeTradePosts();
    this.initializeCollectionSets();
    this.generateAvailableInventory();
    this.generateTradeOptions();
  }

  getEncounterType(): EncounterType {
    return this.encounterType;
  }

  getDepth(): number {
    return this.depth;
  }

  getTradeOptions(): TradeOption[] {
    return [...this.tradeOptions];
  }

  getTradePost(postId: string): TradePost {
    const post = this.tradePosts.find((p) => p.id === postId);
    if (!post) {
      throw new Error('Trade post not found');
    }
    return { ...post };
  }

  getAllTradePosts(): TradePost[] {
    return this.tradePosts.map((post) => ({ ...post }));
  }

  getArbitrageOpportunities(): ArbitrageOpportunity[] {
    const opportunities: ArbitrageOpportunity[] = [];

    for (let i = 0; i < this.tradePosts.length; i++) {
      for (let j = i + 1; j < this.tradePosts.length; j++) {
        const post1 = this.tradePosts[i];
        const post2 = this.tradePosts[j];

        Object.keys(post1.prices).forEach((item) => {
          if (post2.prices[item] !== undefined) {
            const price1 = post1.prices[item];
            const price2 = post2.prices[item];

            if (price1 < price2) {
              opportunities.push({
                item,
                buyFrom: post1.id,
                sellTo: post2.id,
                profit: price2 - price1,
              });
            } else if (price2 < price1) {
              opportunities.push({
                item,
                buyFrom: post2.id,
                sellTo: post1.id,
                profit: price1 - price2,
              });
            }
          }
        });
      }
    }

    return opportunities.sort((a, b) => b.profit - a.profit);
  }

  processTradeDecision(optionId: string): {
    success: boolean;
    rewards?: CollectedItem[];
    consequences?: TradeConsequence[];
    error?: string;
  } {
    if (this.encounterComplete) {
      return { success: false, error: 'Encounter already complete' };
    }

    const option = this.tradeOptions.find((opt) => opt.id === optionId);
    if (!option) {
      this.encounterComplete = true;
      this.encounterResult = 'failure';
      return { success: false, error: 'Invalid trade option' };
    }

    // Check if already traded this option
    const alreadyTraded = this.tradeHistory.some(
      (entry) => entry.optionId === optionId
    );
    if (alreadyTraded) {
      return { success: false, error: 'Option already traded' };
    }

    // Evaluate trade quality
    const tradeQuality = this.evaluateTradeQuality(option);
    this.lastTradeQuality = tradeQuality;
    this.updateTradeStatistics(tradeQuality);

    // Process the trade
    const scaledOutcome = this.scaleOutcomeByDepth(option.outcome);

    this.tradeHistory.push({
      optionId,
      timestamp: Date.now(),
      outcome: scaledOutcome,
    });

    // Complete encounter after 2 trades or if all options are used
    if (
      this.tradeHistory.length >= 2 ||
      this.tradeHistory.length >= this.tradeOptions.length
    ) {
      this.encounterComplete = true;
      this.encounterResult = 'success';
    }

    return {
      success: true,
      rewards: scaledOutcome.rewards,
      consequences: scaledOutcome.consequences,
    };
  }

  getTradeHistory(): TradeHistoryEntry[] {
    return [...this.tradeHistory];
  }

  isEncounterComplete(): boolean {
    return this.encounterComplete;
  }

  getEncounterResult(): 'success' | 'failure' | null {
    return this.encounterResult;
  }

  generateRewards(): CollectedItem[] {
    if (!this.encounterComplete || this.encounterResult !== 'success') {
      return [];
    }

    const allRewards: CollectedItem[] = [];
    this.tradeHistory.forEach((entry) => {
      allRewards.push(...entry.outcome.rewards);
    });

    return allRewards;
  }

  updateTradePostPrices(
    postId: string,
    newPrices: Record<string, number>
  ): void {
    const post = this.tradePosts.find((p) => p.id === postId);
    if (!post) {
      throw new Error('Trade post not found');
    }

    Object.assign(post.prices, newPrices);
  }

  // Collection Set Integration Methods
  getAvailableCollectionSets(): CollectionSet[] {
    return [...this.collectionSets];
  }

  getCollectionProgress(): CollectionProgress {
    const totalItems = this.tradeHistory.reduce(
      (sum, entry) => sum + entry.outcome.rewards.length,
      0
    );
    const completedSets: string[] = [];
    const partialSets: { setId: string; progress: number; total: number }[] =
      [];

    this.collectionSets.forEach((set) => {
      const collectedItems = this.tradeHistory.reduce((count, entry) => {
        return (
          count +
          entry.outcome.rewards.filter((reward) => reward.setId === set.id)
            .length
        );
      }, 0);

      if (collectedItems >= set.items.length) {
        completedSets.push(set.id);
      } else if (collectedItems > 0) {
        partialSets.push({
          setId: set.id,
          progress: collectedItems,
          total: set.items.length,
        });
      }
    });

    return {
      totalItems,
      completedSets,
      partialSets,
    };
  }

  // Inventory Scaling Methods
  getAvailableInventory(): InventoryItem[] {
    return [...this.availableInventory];
  }

  getInventoryByRarity(rarity: 'common' | 'rare' | 'exotic'): InventoryItem[] {
    return this.availableInventory.filter((item) => item.rarity === rarity);
  }

  getInventoryAvailability(): InventoryAvailability {
    const commonItems = this.availableInventory.filter(
      (item) => item.rarity === 'common'
    ).length;
    const rareItems = this.availableInventory.filter(
      (item) => item.rarity === 'rare'
    ).length;
    const exoticItems = this.availableInventory.filter(
      (item) => item.rarity === 'exotic'
    ).length;

    return {
      totalItems: this.availableInventory.length,
      commonItems,
      rareItems,
      exoticItems,
    };
  }

  // Trade Quality and Consequences Methods
  getLastTradeQuality(): TradeQuality | null {
    return this.lastTradeQuality;
  }

  getTradeConsequences(): TradeConsequences {
    if (!this.lastTradeQuality) {
      return {
        isBadTrade: false,
        energyLoss: 0,
        itemLossRisk: 0,
        description: 'No recent trade',
      };
    }

    const isBadTrade = ['poor', 'terrible'].includes(
      this.lastTradeQuality.rating
    );
    const energyLoss = isBadTrade ? Math.round(5 + this.depth * 2) : 0;
    const itemLossRisk = isBadTrade ? 0.1 + this.depth * 0.05 : 0;

    return {
      isBadTrade,
      energyLoss,
      itemLossRisk,
      description: isBadTrade
        ? `Bad trade detected: ${this.lastTradeQuality.rating}`
        : 'Good trade',
    };
  }

  getTradeStatistics(): TradeStatistics {
    return { ...this.tradeStatistics };
  }

  getTradeRiskAssessment(): TradeRiskAssessment {
    const factors: string[] = [];
    let overallRisk: 'low' | 'medium' | 'high' = 'low';

    // Assess based on depth
    if (this.depth > 5) {
      factors.push('High depth increases risk');
      overallRisk = 'high';
    } else if (this.depth > 3) {
      factors.push('Medium depth increases risk');
      overallRisk = 'medium';
    }

    // Assess based on trade history
    const badTradeRate =
      this.tradeStatistics.totalTrades > 0
        ? this.tradeStatistics.badTrades / this.tradeStatistics.totalTrades
        : 0;

    if (badTradeRate > 0.3) {
      factors.push('High bad trade rate');
      overallRisk = overallRisk === 'low' ? 'medium' : 'high';
    }

    // Assess based on recent trades
    if (
      this.lastTradeQuality &&
      ['poor', 'terrible'].includes(this.lastTradeQuality.rating)
    ) {
      factors.push('Recent bad trade');
      overallRisk = overallRisk === 'low' ? 'medium' : 'high';
    }

    return {
      overallRisk,
      factors,
    };
  }

  private initializeTradePosts(): void {
    const baseItems = ['common_item', 'rare_item', 'exotic_item', 'trade_good'];

    this.tradePosts = [
      {
        id: 'post_1',
        name: 'Merchant Caravan',
        prices: this.generatePrices(baseItems, 1.0),
      },
      {
        id: 'post_2',
        name: 'Nomad Trader',
        prices: this.generatePrices(baseItems, 1.2),
      },
      {
        id: 'post_3',
        name: 'Deep Delver Exchange',
        prices: this.generatePrices(baseItems, 0.8),
      },
    ];
  }

  private generatePrices(
    items: string[],
    multiplier: number
  ): Record<string, number> {
    const prices: Record<string, number> = {};
    const basePrices: Record<string, number> = {
      common_item: 10,
      rare_item: 25,
      exotic_item: 50,
      trade_good: 15,
    };

    items.forEach((item) => {
      const depthMultiplier = 1 + this.depth * 0.3; // Scale prices with depth
      prices[item] = Math.round(
        (basePrices[item] || 10) *
          multiplier *
          depthMultiplier *
          (0.8 + Math.random() * 0.4)
      );
    });

    return prices;
  }

  private generateTradeOptions(): void {
    const collectionSets = [
      'silk_road_set',
      'spice_trade_set',
      'gem_merchant_set',
      'exotic_goods_set',
    ];

    const baseOptions: TradeOption[] = [
      {
        id: 'A',
        type: 'buy',
        description: 'Purchase valuable trade goods from the merchant',
        outcome: {
          rewards: [this.createReward(collectionSets[0], 50)],
          consequences: [this.createConsequence('lose_energy', 10)],
        },
      },
      {
        id: 'B',
        type: 'sell',
        description: 'Sell your collected items for profit',
        outcome: {
          rewards: [this.createReward(collectionSets[1], 30)],
          consequences: [this.createConsequence('lose_item', 1)],
        },
      },
      {
        id: 'C',
        type: 'exchange',
        description: 'Exchange items for better equipment',
        outcome: {
          rewards: [this.createReward(collectionSets[2], 40)],
          consequences: [this.createConsequence('lose_energy', 15)],
        },
      },
    ];

    this.tradeOptions = baseOptions.map((option) => ({
      ...option,
      outcome: this.scaleOutcomeByDepth(option.outcome),
    }));
  }

  private createReward(collectionSet: string, value: number): CollectedItem {
    const setNames: Record<string, string> = {
      silk_road_set: 'Silk Road',
      spice_trade_set: 'Spice Trade',
      gem_merchant_set: 'Gem Merchant',
      exotic_goods_set: 'Exotic Goods',
    };

    const itemNames: Record<string, string[]> = {
      silk_road_set: ['Silk Fabric', 'Fine Silk', 'Royal Silk'],
      spice_trade_set: ['Spice Blend', 'Rare Spice', 'Legendary Spice'],
      gem_merchant_set: ['Common Gem', 'Precious Gem', 'Dragon Gem'],
      exotic_goods_set: ['Basic Potion', 'Elixir', 'Phoenix Elixir'],
    };

    const setName = setNames[collectionSet] || 'Trade Good';
    const availableItems = itemNames[collectionSet] || ['Trade Item'];
    const itemName =
      availableItems[Math.floor(Math.random() * availableItems.length)];

    return {
      id: `trade-reward-${collectionSet}-${Date.now()}-${Math.random()}`,
      type: 'trade_good',
      setId: collectionSet,
      value,
      name: itemName,
      description: `A valuable ${itemName.toLowerCase()} from the ${setName.toLowerCase()} collection`,
    };
  }

  private createConsequence(type: string, value: number): TradeConsequence {
    return {
      type: type as TradeConsequence['type'],
      value,
      description: `Trade consequence: ${type}`,
    };
  }

  private scaleOutcomeByDepth(outcome: TradeOutcome): TradeOutcome {
    const scaleFactor = 1 + this.depth * 0.2;

    return {
      rewards: outcome.rewards.map((reward) => ({
        ...reward,
        value: Math.round(reward.value * scaleFactor),
      })),
      consequences: outcome.consequences.map((consequence) => ({
        ...consequence,
        value: Math.round(consequence.value * scaleFactor),
      })),
    };
  }

  private initializeCollectionSets(): void {
    this.collectionSets = [
      {
        id: 'silk_road_set',
        name: 'Silk Road Collection',
        items: [],
        completionBonus: '+10% energy efficiency',
        bonusType: 'energy_efficiency',
        bonusValue: 10,
      },
      {
        id: 'spice_trade_set',
        name: 'Spice Trade Collection',
        items: [],
        completionBonus: 'Start runs with 10 gold',
        bonusType: 'starting_bonus',
        bonusValue: 10,
      },
      {
        id: 'gem_merchant_set',
        name: 'Gem Merchant Collection',
        items: [],
        completionBonus: 'Unlock Crystal Caverns region',
        bonusType: 'unlock_region',
        bonusValue: 1,
      },
      {
        id: 'exotic_goods_set',
        name: 'Exotic Goods Collection',
        items: [],
        completionBonus: '+15% starting energy',
        bonusType: 'permanent_ability',
        bonusValue: 15,
      },
    ];
  }

  private generateAvailableInventory(): void {
    const baseItems = this.getBaseInventoryItems();
    const depthMultiplier = 1 + this.depth * 0.3;
    const maxItems = Math.min(8 + this.depth * 2, 20);

    this.availableInventory = baseItems
      .filter((item) => this.shouldIncludeItem(item))
      .slice(0, maxItems)
      .map((item, index) =>
        this.createInventoryItem(item, index, depthMultiplier)
      );
  }

  private getBaseInventoryItems(): {
    name: string;
    rarity: 'common' | 'rare' | 'exotic';
    collectionSet: string;
    baseValue: number;
  }[] {
    return [
      ...this.getCommonItems(),
      ...this.getRareItems(),
      ...this.getExoticItems(),
    ];
  }

  private getCommonItems(): {
    name: string;
    rarity: 'common';
    collectionSet: string;
    baseValue: number;
  }[] {
    return [
      {
        name: 'Silk Fabric',
        rarity: 'common',
        collectionSet: 'silk_road_set',
        baseValue: 15,
      },
      {
        name: 'Spice Blend',
        rarity: 'common',
        collectionSet: 'spice_trade_set',
        baseValue: 12,
      },
      {
        name: 'Common Gem',
        rarity: 'common',
        collectionSet: 'gem_merchant_set',
        baseValue: 20,
      },
      {
        name: 'Basic Potion',
        rarity: 'common',
        collectionSet: 'exotic_goods_set',
        baseValue: 18,
      },
    ];
  }

  private getRareItems(): {
    name: string;
    rarity: 'rare';
    collectionSet: string;
    baseValue: number;
  }[] {
    return [
      {
        name: 'Fine Silk',
        rarity: 'rare',
        collectionSet: 'silk_road_set',
        baseValue: 35,
      },
      {
        name: 'Rare Spice',
        rarity: 'rare',
        collectionSet: 'spice_trade_set',
        baseValue: 30,
      },
      {
        name: 'Precious Gem',
        rarity: 'rare',
        collectionSet: 'gem_merchant_set',
        baseValue: 45,
      },
      {
        name: 'Elixir',
        rarity: 'rare',
        collectionSet: 'exotic_goods_set',
        baseValue: 40,
      },
    ];
  }

  private getExoticItems(): {
    name: string;
    rarity: 'exotic';
    collectionSet: string;
    baseValue: number;
  }[] {
    return [
      {
        name: 'Royal Silk',
        rarity: 'exotic',
        collectionSet: 'silk_road_set',
        baseValue: 80,
      },
      {
        name: 'Legendary Spice',
        rarity: 'exotic',
        collectionSet: 'spice_trade_set',
        baseValue: 75,
      },
      {
        name: 'Dragon Gem',
        rarity: 'exotic',
        collectionSet: 'gem_merchant_set',
        baseValue: 100,
      },
      {
        name: 'Phoenix Elixir',
        rarity: 'exotic',
        collectionSet: 'exotic_goods_set',
        baseValue: 90,
      },
    ];
  }

  private shouldIncludeItem(item: {
    rarity: 'common' | 'rare' | 'exotic';
  }): boolean {
    if (item.rarity === 'exotic' && this.depth < 3) return false;
    if (item.rarity === 'rare' && this.depth < 2) return false;
    return true;
  }

  private createInventoryItem(
    item: {
      name: string;
      rarity: 'common' | 'rare' | 'exotic';
      collectionSet: string;
      baseValue: number;
    },
    index: number,
    depthMultiplier: number
  ): InventoryItem {
    return {
      id: `inventory-${item.name.toLowerCase().replace(/\s+/g, '-')}-${index}`,
      name: item.name,
      value: Math.round(item.baseValue * depthMultiplier),
      rarity: item.rarity,
      collectionSet: item.collectionSet,
      description: `A ${item.rarity} ${item.name.toLowerCase()} from the trade markets`,
    };
  }

  private evaluateTradeQuality(option: TradeOption): TradeQuality {
    const factors: string[] = [];
    let score = 50; // Base score

    // Evaluate based on option type
    switch (option.type) {
      case 'buy':
        score += 10;
        factors.push('Buying low');
        break;
      case 'sell':
        score += 5;
        factors.push('Selling high');
        break;
      case 'exchange':
        score += 15;
        factors.push('Strategic exchange');
        break;
    }

    // Evaluate based on depth (deeper = riskier but potentially more profitable)
    if (this.depth > 5) {
      score += 20;
      factors.push('High depth premium');
    } else if (this.depth > 3) {
      score += 10;
      factors.push('Medium depth bonus');
    }

    // Add some randomness for realistic trade outcomes
    const randomFactor = Math.random() * 40 - 20; // -20 to +20
    score += randomFactor;

    // Determine rating
    let rating: TradeQuality['rating'];
    if (score >= 80) rating = 'excellent';
    else if (score >= 65) rating = 'good';
    else if (score >= 50) rating = 'fair';
    else if (score >= 35) rating = 'poor';
    else rating = 'terrible';

    return {
      rating,
      score: Math.max(0, Math.min(100, score)),
      factors,
    };
  }

  private updateTradeStatistics(quality: TradeQuality): void {
    this.tradeStatistics.totalTrades++;

    if (['excellent', 'good', 'fair'].includes(quality.rating)) {
      this.tradeStatistics.goodTrades++;
    } else {
      this.tradeStatistics.badTrades++;
    }

    // Update average quality
    const totalScore =
      this.tradeStatistics.averageTradeQuality *
        (this.tradeStatistics.totalTrades - 1) +
      quality.score;
    this.tradeStatistics.averageTradeQuality =
      totalScore / this.tradeStatistics.totalTrades;
  }
}
