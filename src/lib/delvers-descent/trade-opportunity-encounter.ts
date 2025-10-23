import type { CollectedItem, EncounterType } from '@/types/delvers-descent';

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

export class TradeOpportunityEncounter {
  private encounterType: EncounterType = 'trade_opportunity';
  private depth: number;
  private tradeOptions: TradeOption[] = [];
  private tradePosts: TradePost[] = [];
  private tradeHistory: TradeHistoryEntry[] = [];
  private encounterComplete: boolean = false;
  private encounterResult: 'success' | 'failure' | null = null;

  constructor(depth: number = 1) {
    this.depth = depth;
    this.initializeTradePosts();
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
    const basePrices = {
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
    const baseOptions: TradeOption[] = [
      {
        id: 'A',
        type: 'buy',
        description: 'Purchase valuable trade goods from the merchant',
        outcome: {
          rewards: [this.createReward('trade_good', 50)],
          consequences: [this.createConsequence('lose_energy', 10)],
        },
      },
      {
        id: 'B',
        type: 'sell',
        description: 'Sell your collected items for profit',
        outcome: {
          rewards: [this.createReward('trade_good', 30)],
          consequences: [this.createConsequence('lose_item', 1)],
        },
      },
      {
        id: 'C',
        type: 'exchange',
        description: 'Exchange items for better equipment',
        outcome: {
          rewards: [this.createReward('rare_item', 40)],
          consequences: [this.createConsequence('lose_energy', 15)],
        },
      },
    ];

    this.tradeOptions = baseOptions.map((option) => ({
      ...option,
      outcome: this.scaleOutcomeByDepth(option.outcome),
    }));
  }

  private createReward(type: string, value: number): CollectedItem {
    return {
      id: `trade-reward-${Date.now()}-${Math.random()}`,
      type: 'trade_good',
      setId: 'trade_goods',
      value,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Item`,
      description: `A valuable ${type} obtained through trade`,
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
}
