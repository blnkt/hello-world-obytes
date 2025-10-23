import type { CollectedItem, EncounterType } from '@/types/delvers-descent';

export interface ExplorationPath {
  id: 'A' | 'B' | 'C';
  type: 'safe' | 'risky' | 'dangerous';
  description: string;
  outcome: ExplorationOutcome;
}

export interface ExplorationOutcome {
  rewards: CollectedItem[];
  consequences: ExplorationConsequence[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ExplorationConsequence {
  type: 'lose_energy' | 'lose_item' | 'force_retreat' | 'hazard_trigger';
  value: number;
  description: string;
}

export interface LoreDiscovery {
  title: string;
  content: string;
  region: string;
  era: string;
  significance: number;
}

export interface RegionalHistory {
  region: string;
  description: string;
  era: string;
  significance: number;
}

export interface MapIntelligence {
  type: 'shortcut' | 'path' | 'hazard' | 'treasure';
  description: string;
  depth: number;
  value: number;
}

export interface ShortcutInformation {
  fromDepth: number;
  toDepth: number;
  energyReduction: number;
  description: string;
}

export interface DeeperPathInformation {
  targetDepth: number;
  description: string;
  requirements: string[];
  rewards: string[];
}

export interface MapExplorationProgress {
  discoveredShortcuts: ShortcutInformation[];
  discoveredPaths: DeeperPathInformation[];
  totalIntel: number;
}

export interface LoreProgress {
  totalLore: number;
  discoveredRegions: string[];
  discoveredEras: string[];
}

export interface PathRiskAssessment {
  riskLevel: 'low' | 'medium' | 'high';
  factors: string[];
  rewardPotential: number;
}

export interface FailureConsequences {
  energyLoss: number;
  itemLossRisk: number;
  forcedRetreat: boolean;
  description: string;
}

export interface ExplorationStatistics {
  totalExplorations: number;
  successfulExplorations: number;
  failedExplorations: number;
  averageRiskLevel: number;
}

export interface RegionalCollectionSet {
  id: string;
  name: string;
  region: string;
  items: CollectedItem[];
}

export class DiscoverySiteEncounter {
  private encounterType: EncounterType = 'discovery_site';
  private depth: number;
  private explorationPaths: ExplorationPath[] = [];
  private loreDiscoveries: LoreDiscovery[] = [];
  private regionalHistory: RegionalHistory[] = [];
  private mapIntelligence: MapIntelligence[] = [];
  private regionalDiscoveries: CollectedItem[] = [];
  private explorationStatistics: ExplorationStatistics = {
    totalExplorations: 0,
    successfulExplorations: 0,
    failedExplorations: 0,
    averageRiskLevel: 0,
  };
  private encounterComplete: boolean = false;
  private encounterResult: 'success' | 'failure' | null = null;

  constructor(depth: number = 1) {
    this.depth = depth;
    this.initializeRegionalHistory();
    this.generateExplorationPaths();
    this.generateMapIntelligence();
  }

  getEncounterType(): EncounterType {
    return this.encounterType;
  }

  getDepth(): number {
    return this.depth;
  }

  getExplorationPaths(): ExplorationPath[] {
    return [...this.explorationPaths];
  }

  processExplorationDecision(pathId: string): {
    success: boolean;
    rewards?: CollectedItem[];
    consequences?: ExplorationConsequence[];
    error?: string;
  } {
    if (this.encounterComplete) {
      return { success: false, error: 'Encounter already complete' };
    }

    const path = this.explorationPaths.find((p) => p.id === pathId);
    if (!path) {
      this.encounterComplete = true;
      this.encounterResult = 'failure';
      this.updateExplorationStatistics(false, 'high');
      return { success: false, error: 'Invalid exploration path' };
    }

    // Process the exploration
    const scaledOutcome = this.scaleOutcomeByDepth(path.outcome);

    // Generate lore discoveries
    this.generateLoreDiscoveries(path);

    // Generate regional discoveries
    this.generateRegionalDiscoveries(path);

    this.encounterComplete = true;
    this.encounterResult = 'success';
    this.updateExplorationStatistics(true, path.outcome.riskLevel);

    return {
      success: true,
      rewards: scaledOutcome.rewards,
      consequences: scaledOutcome.consequences,
    };
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

    return [...this.regionalDiscoveries];
  }

  // Lore Collection System
  getLoreDiscoveries(): LoreDiscovery[] {
    return [...this.loreDiscoveries];
  }

  getRegionalHistory(): RegionalHistory[] {
    return [...this.regionalHistory];
  }

  getLoreProgress(): LoreProgress {
    const discoveredRegions = [
      ...new Set(this.loreDiscoveries.map((lore) => lore.region)),
    ];
    const discoveredEras = [
      ...new Set(this.loreDiscoveries.map((lore) => lore.era)),
    ];

    return {
      totalLore: this.loreDiscoveries.length,
      discoveredRegions,
      discoveredEras,
    };
  }

  // Map Information System
  getMapIntelligence(): MapIntelligence[] {
    return [...this.mapIntelligence];
  }

  getShortcutInformation(): ShortcutInformation[] {
    return this.mapIntelligence
      .filter((intel) => intel.type === 'shortcut')
      .map((intel) => ({
        fromDepth: this.depth,
        toDepth: Math.max(1, this.depth - 1),
        energyReduction: intel.value,
        description: intel.description,
      }));
  }

  getDeeperPathInformation(): DeeperPathInformation[] {
    return this.mapIntelligence
      .filter((intel) => intel.type === 'path')
      .map((intel) => ({
        targetDepth: this.depth + 1,
        description: intel.description,
        requirements: [`Minimum depth ${this.depth + 1}`],
        rewards: ['Enhanced rewards', 'Rare discoveries'],
      }));
  }

  getMapExplorationProgress(): MapExplorationProgress {
    return {
      discoveredShortcuts: this.getShortcutInformation(),
      discoveredPaths: this.getDeeperPathInformation(),
      totalIntel: this.mapIntelligence.length,
    };
  }

  // Regional Discovery System
  getRegionalDiscoveries(): CollectedItem[] {
    return [...this.regionalDiscoveries];
  }

  getRegionalCollectionSets(): RegionalCollectionSet[] {
    return [
      {
        id: 'ancient_ruins_set',
        name: 'Ancient Ruins Collection',
        region: 'Forgotten Depths',
        items: [],
      },
      {
        id: 'crystal_caverns_set',
        name: 'Crystal Caverns Collection',
        region: 'Crystal Depths',
        items: [],
      },
      {
        id: 'shadow_realm_set',
        name: 'Shadow Realm Collection',
        region: 'Shadow Depths',
        items: [],
      },
      {
        id: 'ethereal_plains_set',
        name: 'Ethereal Plains Collection',
        region: 'Ethereal Depths',
        items: [],
      },
    ];
  }

  // Risk/Reward System
  getPathRiskAssessment(pathId: string): PathRiskAssessment {
    const path = this.explorationPaths.find((p) => p.id === pathId);
    if (!path) {
      return {
        riskLevel: 'high',
        factors: ['Unknown path'],
        rewardPotential: 0,
      };
    }

    const factors: string[] = [];
    let rewardPotential = 50;

    switch (path.type) {
      case 'safe':
        factors.push('Well-trodden path');
        rewardPotential = 30;
        break;
      case 'risky':
        factors.push('Uncharted territory');
        rewardPotential = 60;
        break;
      case 'dangerous':
        factors.push('Hazardous conditions');
        rewardPotential = 90;
        break;
    }

    if (this.depth > 5) {
      factors.push('Deep exploration risks');
      rewardPotential += 20;
    }

    return {
      riskLevel: path.outcome.riskLevel,
      factors,
      rewardPotential,
    };
  }

  getFailureConsequences(pathId: string): FailureConsequences {
    const path = this.explorationPaths.find((p) => p.id === pathId);
    if (!path) {
      return {
        energyLoss: 15,
        itemLossRisk: 0.3,
        forcedRetreat: true,
        description: 'Failed exploration attempt',
      };
    }

    const baseEnergyLoss = 5 + this.depth * 2;
    const baseItemLossRisk = 0.1 + this.depth * 0.05;

    let energyLoss = baseEnergyLoss;
    let itemLossRisk = baseItemLossRisk;
    let forcedRetreat = false;

    switch (path.outcome.riskLevel) {
      case 'low':
        energyLoss = Math.round(baseEnergyLoss * 0.5);
        itemLossRisk = baseItemLossRisk * 0.5;
        break;
      case 'medium':
        energyLoss = baseEnergyLoss;
        itemLossRisk = baseItemLossRisk;
        break;
      case 'high':
        energyLoss = Math.round(baseEnergyLoss * 1.5);
        itemLossRisk = baseItemLossRisk * 1.5;
        forcedRetreat = Math.random() < 0.3;
        break;
    }

    return {
      energyLoss,
      itemLossRisk,
      forcedRetreat,
      description: `Failed ${path.type} exploration`,
    };
  }

  getExplorationStatistics(): ExplorationStatistics {
    return { ...this.explorationStatistics };
  }

  private initializeRegionalHistory(): void {
    this.regionalHistory = [
      {
        region: 'Forgotten Depths',
        description: 'Ancient ruins of a lost civilization',
        era: 'First Age',
        significance: 8,
      },
      {
        region: 'Crystal Depths',
        description: 'Crystalline formations with mysterious properties',
        era: 'Second Age',
        significance: 7,
      },
      {
        region: 'Shadow Depths',
        description: 'Dark realm where shadows take form',
        era: 'Third Age',
        significance: 9,
      },
      {
        region: 'Ethereal Depths',
        description: 'Floating islands in the void',
        era: 'Fourth Age',
        significance: 6,
      },
    ];
  }

  private generateExplorationPaths(): void {
    const regionalSets = [
      'ancient_ruins_set',
      'crystal_caverns_set',
      'shadow_realm_set',
      'ethereal_plains_set',
    ];

    const basePaths: ExplorationPath[] = [
      {
        id: 'A',
        type: 'safe',
        description: 'Follow the well-marked trail through ancient ruins',
        outcome: {
          rewards: [this.createDiscoveryReward(regionalSets[0], 40)],
          consequences: [this.createExplorationConsequence('lose_energy', 5)],
          riskLevel: 'low',
        },
      },
      {
        id: 'B',
        type: 'risky',
        description: 'Explore the uncharted crystal formations',
        outcome: {
          rewards: [this.createDiscoveryReward(regionalSets[1], 60)],
          consequences: [this.createExplorationConsequence('lose_energy', 10)],
          riskLevel: 'medium',
        },
      },
      {
        id: 'C',
        type: 'dangerous',
        description: 'Venture into the shadowy depths',
        outcome: {
          rewards: [this.createDiscoveryReward(regionalSets[2], 80)],
          consequences: [this.createExplorationConsequence('lose_energy', 15)],
          riskLevel: 'high',
        },
      },
    ];

    this.explorationPaths = basePaths.map((path) => ({
      ...path,
      outcome: this.scaleOutcomeByDepth(path.outcome),
    }));
  }

  private generateMapIntelligence(): void {
    this.mapIntelligence = [
      {
        type: 'shortcut',
        description: 'Hidden passage to previous depth',
        depth: this.depth - 1,
        value: 10,
      },
      {
        type: 'path',
        description: 'Ancient stairway to deeper levels',
        depth: this.depth + 1,
        value: 20,
      },
      {
        type: 'treasure',
        description: 'Cache of ancient artifacts',
        depth: this.depth,
        value: 30,
      },
      {
        type: 'hazard',
        description: 'Collapsed tunnel ahead',
        depth: this.depth,
        value: -15,
      },
    ];
  }

  private generateLoreDiscoveries(_path: ExplorationPath): void {
    const loreTemplates = [
      {
        title: 'Ancient Inscriptions',
        content: 'Mysterious runes carved into the stone walls',
        region: 'Forgotten Depths',
        era: 'First Age',
        significance: 7,
      },
      {
        title: 'Crystal Resonance',
        content: 'The crystals hum with an otherworldly frequency',
        region: 'Crystal Depths',
        era: 'Second Age',
        significance: 6,
      },
      {
        title: 'Shadow Whispers',
        content: 'Voices echo from the darkness, speaking of ancient secrets',
        region: 'Shadow Depths',
        era: 'Third Age',
        significance: 8,
      },
      {
        title: 'Ethereal Echoes',
        content: 'Fragments of memory float through the void',
        region: 'Ethereal Depths',
        era: 'Fourth Age',
        significance: 5,
      },
    ];

    const selectedLore =
      loreTemplates[Math.floor(Math.random() * loreTemplates.length)];
    const scaledLore = {
      ...selectedLore,
      significance: Math.round(
        selectedLore.significance * (1 + this.depth * 0.2)
      ),
    };

    this.loreDiscoveries.push(scaledLore);
  }

  private generateRegionalDiscoveries(path: ExplorationPath): void {
    const regionalSets = [
      'ancient_ruins_set',
      'crystal_caverns_set',
      'shadow_realm_set',
      'ethereal_plains_set',
    ];
    const setIndex = this.explorationPaths.indexOf(path);
    const selectedSet = regionalSets[setIndex] || regionalSets[0];

    const baseValue = 50;
    const depthMultiplier = 1 + this.depth * 0.2;
    const scaledValue = Math.round(baseValue * depthMultiplier);

    const discovery = this.createDiscoveryReward(selectedSet, scaledValue);
    this.regionalDiscoveries.push(discovery);
  }

  private createDiscoveryReward(
    collectionSet: string,
    value: number
  ): CollectedItem {
    const setNames: Record<string, string> = {
      ancient_ruins_set: 'Ancient Ruins',
      crystal_caverns_set: 'Crystal Caverns',
      shadow_realm_set: 'Shadow Realm',
      ethereal_plains_set: 'Ethereal Plains',
    };

    const itemNames: Record<string, string[]> = {
      ancient_ruins_set: ['Ancient Artifact', 'Ruined Relic', 'Lost Treasure'],
      crystal_caverns_set: ['Crystal Shard', 'Prismatic Gem', 'Luminous Stone'],
      shadow_realm_set: ['Shadow Essence', 'Dark Fragment', 'Void Crystal'],
      ethereal_plains_set: ['Ethereal Fragment', 'Void Stone', 'Mystic Orb'],
    };

    const setName = setNames[collectionSet] || 'Discovery';
    const availableItems = itemNames[collectionSet] || ['Discovery Item'];
    const itemName =
      availableItems[Math.floor(Math.random() * availableItems.length)];

    return {
      id: `discovery-${collectionSet}-${Date.now()}-${Math.random()}`,
      type: 'discovery',
      setId: collectionSet,
      value,
      name: itemName,
      description: `A mysterious ${itemName.toLowerCase()} discovered in the ${setName.toLowerCase()}`,
    };
  }

  private createExplorationConsequence(
    type: string,
    value: number
  ): ExplorationConsequence {
    return {
      type: type as ExplorationConsequence['type'],
      value,
      description: `Exploration consequence: ${type}`,
    };
  }

  private scaleOutcomeByDepth(outcome: ExplorationOutcome): ExplorationOutcome {
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
      riskLevel: outcome.riskLevel,
    };
  }

  private updateExplorationStatistics(
    success: boolean,
    riskLevel: string
  ): void {
    this.explorationStatistics.totalExplorations++;

    if (success) {
      this.explorationStatistics.successfulExplorations++;
    } else {
      this.explorationStatistics.failedExplorations++;
    }

    // Update average risk level
    const riskValues = { low: 1, medium: 2, high: 3 };
    const currentRiskValue =
      riskValues[riskLevel as keyof typeof riskValues] || 2;
    const totalRisk =
      this.explorationStatistics.averageRiskLevel *
        (this.explorationStatistics.totalExplorations - 1) +
      currentRiskValue;
    this.explorationStatistics.averageRiskLevel =
      totalRisk / this.explorationStatistics.totalExplorations;
  }
}
