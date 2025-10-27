import type { CollectedItem, EncounterType } from '@/types/delvers-descent';

export interface EncounterTypeMultipliers {
  puzzle_chamber: number;
  trade_opportunity: number;
  discovery_site: number;
  risk_event: number;
  hazard: number;
  rest_site: number;
}

export interface CollectionSetInfo {
  id: string;
  name: string;
  type: 'trade_good' | 'discovery' | 'legendary';
  items: string[];
}

export interface FailureConsequences {
  energyLoss: number;
  itemLossRisk: number;
  forcedRetreat: boolean;
  encounterLockout: boolean;
  description: string;
}

export interface FailureStatistics {
  totalFailures: number;
  totalSuccesses: number;
  failureRate: number;
  currentSeverityMultiplier: number;
}

export class RewardCalculator {
  private depthScalingFactor: number;
  private encounterTypeMultipliers: EncounterTypeMultipliers;
  private collectionSets: CollectionSetInfo[] = [];

  constructor(depthScalingFactor: number = 0.2) {
    this.depthScalingFactor = depthScalingFactor;
    this.encounterTypeMultipliers = {
      puzzle_chamber: 1.0,
      trade_opportunity: 1.2,
      discovery_site: 1.1,
      risk_event: 1.5,
      hazard: 0.8,
      rest_site: 0.5,
    };
    this.initializeCollectionSets();
  }

  getDepthScalingFactor(): number {
    return this.depthScalingFactor;
  }

  getEncounterTypeMultipliers(): EncounterTypeMultipliers {
    return { ...this.encounterTypeMultipliers };
  }

  calculateDepthScaling(depth: number): number {
    return 1 + Math.max(0, depth) * this.depthScalingFactor;
  }

  scaleRewardByDepth(baseReward: number, depth: number): number {
    return Math.round(baseReward * this.calculateDepthScaling(depth));
  }

  calculateFinalReward(
    baseReward: number,
    encounterType: EncounterType,
    depth: number
  ): number {
    const depthScaling = this.calculateDepthScaling(depth);
    const encounterMultiplier =
      this.encounterTypeMultipliers[encounterType] || 1.0;
    const baseFinalReward = baseReward * encounterMultiplier * depthScaling;

    // Add random variation (±15% to ±30% based on depth)
    const variationRange = 0.15 + depth * 0.02;
    const variation = (Math.random() - 0.5) * 2 * variationRange;
    const finalReward = baseFinalReward * (1 + variation);

    return Math.round(Math.max(1, finalReward));
  }

  generateCollectionReward(
    type: 'trade_good' | 'discovery' | 'legendary',
    depth: number
  ): CollectedItem {
    const sets = this.getCollectionSetsForType(type);
    const selectedSet = sets[Math.floor(Math.random() * sets.length)];
    const items = selectedSet.items;
    const selectedItem = items[Math.floor(Math.random() * items.length)];

    const baseValue = this.getBaseValueForType(type);
    const finalValue = this.calculateFinalReward(
      baseValue,
      this.getEncounterTypeForCollectionType(type),
      depth
    );

    return {
      id: `${type}-${selectedSet.id}-${Date.now()}-${Math.random()}`,
      type,
      setId: selectedSet.id,
      value: finalValue,
      name: selectedItem,
      description: `A ${type.replace('_', ' ')} item from the ${selectedSet.name}`,
    };
  }

  getCollectionSetsForType(
    type: 'trade_good' | 'discovery' | 'legendary'
  ): CollectionSetInfo[] {
    return this.collectionSets.filter((set) => set.type === type);
  }

  processEncounterRewards(
    baseRewards: CollectedItem[],
    encounterType: EncounterType,
    depth: number
  ): CollectedItem[] {
    return baseRewards.map((reward) => ({
      ...reward,
      value: this.calculateFinalReward(reward.value, encounterType, depth),
    }));
  }

  private initializeCollectionSets(): void {
    this.collectionSets = [
      ...this.getTradeGoodSets(),
      ...this.getDiscoverySets(),
      ...this.getLegendarySets(),
    ];
  }

  private getTradeGoodSets(): CollectionSetInfo[] {
    return [
      {
        id: 'silk_road_set',
        name: 'Silk Road Collection',
        type: 'trade_good',
        items: ['Silk Fabric', 'Fine Silk', 'Royal Silk'],
      },
      {
        id: 'spice_trade_set',
        name: 'Spice Trade Collection',
        type: 'trade_good',
        items: ['Spice Blend', 'Rare Spice', 'Legendary Spice'],
      },
      {
        id: 'gem_merchant_set',
        name: 'Gem Merchant Collection',
        type: 'trade_good',
        items: ['Common Gem', 'Precious Gem', 'Dragon Gem'],
      },
      {
        id: 'exotic_goods_set',
        name: 'Exotic Goods Collection',
        type: 'trade_good',
        items: ['Basic Potion', 'Elixir', 'Phoenix Elixir'],
      },
    ];
  }

  private getDiscoverySets(): CollectionSetInfo[] {
    return [
      {
        id: 'ancient_ruins_set',
        name: 'Ancient Ruins Collection',
        type: 'discovery',
        items: ['Ancient Artifact', 'Ruined Relic', 'Lost Treasure'],
      },
      {
        id: 'crystal_caverns_set',
        name: 'Crystal Caverns Collection',
        type: 'discovery',
        items: ['Crystal Shard', 'Prismatic Gem', 'Luminous Stone'],
      },
      {
        id: 'shadow_realm_set',
        name: 'Shadow Realm Collection',
        type: 'discovery',
        items: ['Shadow Essence', 'Dark Fragment', 'Void Crystal'],
      },
      {
        id: 'ethereal_plains_set',
        name: 'Ethereal Plains Collection',
        type: 'discovery',
        items: ['Ethereal Fragment', 'Void Stone', 'Mystic Orb'],
      },
    ];
  }

  private getLegendarySets(): CollectionSetInfo[] {
    return [
      {
        id: 'dragon_hoard_set',
        name: 'Dragon Hoard Collection',
        type: 'legendary',
        items: ['Dragon Scale', 'Dragon Heart', 'Dragon Crown'],
      },
      {
        id: 'phoenix_nest_set',
        name: 'Phoenix Nest Collection',
        type: 'legendary',
        items: ['Phoenix Feather', 'Phoenix Ash', 'Phoenix Egg'],
      },
      {
        id: 'void_treasure_set',
        name: 'Void Treasure Collection',
        type: 'legendary',
        items: ['Void Crystal', 'Void Essence', 'Void Crown'],
      },
      {
        id: 'eternal_flame_set',
        name: 'Eternal Flame Collection',
        type: 'legendary',
        items: ['Eternal Ember', 'Flame Core', 'Inferno Stone'],
      },
    ];
  }

  private getBaseValueForType(
    type: 'trade_good' | 'discovery' | 'legendary'
  ): number {
    switch (type) {
      case 'trade_good':
        return 50;
      case 'discovery':
        return 75;
      case 'legendary':
        return 150;
      default:
        return 50;
    }
  }

  private getEncounterTypeForCollectionType(
    type: 'trade_good' | 'discovery' | 'legendary'
  ): EncounterType {
    switch (type) {
      case 'trade_good':
        return 'trade_opportunity';
      case 'discovery':
        return 'discovery_site';
      case 'legendary':
        return 'risk_event';
      default:
        return 'puzzle_chamber';
    }
  }
}
