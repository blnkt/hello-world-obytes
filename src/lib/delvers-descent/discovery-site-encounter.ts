import type { CollectedItem, EncounterType } from '@/types/delvers-descent';

import type { CollectionManager } from './collection-manager';
import { getCollectionSetById } from './collection-sets';
import type { RegionManager } from './region-manager';
import { REGIONS } from './regions';

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
  private regionManager?: RegionManager;
  private collectionManager?: CollectionManager;
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

  constructor(
    depth: number = 1,
    regionManager?: RegionManager,
    collectionManager?: CollectionManager
  ) {
    this.depth = depth;
    this.regionManager = regionManager;
    this.collectionManager = collectionManager;
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

  /**
   * Get available region unlock sets that haven't unlocked their regions yet
   * Returns array of collection set IDs (silk_road_set, spice_trade_set, ancient_temple_set, dragons_hoard_set)
   * that are still needed to unlock regions
   */
  async getAvailableRegionUnlockSets(): Promise<string[]> {
    // If regionManager is not provided, return empty array
    if (!this.regionManager) {
      return [];
    }

    // Mapping of collection set IDs to region IDs
    const setToRegionMap: Record<string, string> = {
      silk_road_set: 'desert_oasis',
      spice_trade_set: 'coastal_caves',
      ancient_temple_set: 'mountain_pass',
      dragons_hoard_set: 'dragons_lair',
    };

    const allRegionUnlockSets = Object.keys(setToRegionMap);
    const availableSets: string[] = [];

    // Check each set to see if its region is unlocked
    for (const setId of allRegionUnlockSets) {
      const regionId = setToRegionMap[setId];
      const isUnlocked = await this.regionManager.isRegionUnlocked(regionId);
      if (!isUnlocked) {
        availableSets.push(setId);
      }
    }

    return availableSets;
  }

  getExplorationPaths(): ExplorationPath[] {
    return [...this.explorationPaths];
  }

  async processExplorationDecision(pathId: string): Promise<{
    success: boolean;
    rewards?: CollectedItem[];
    consequences?: ExplorationConsequence[];
    error?: string;
    unlockedRegion?: string;
  }> {
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

    // Generate regional discoveries (these are the actual rewards)
    await this.generateRegionalDiscoveries(path);

    this.encounterComplete = true;
    this.encounterResult = 'success';
    this.updateExplorationStatistics(true, path.outcome.riskLevel);

    // Note: Region unlock checking should happen AFTER items are processed by CollectionManager
    // See checkForRegionUnlocksAfterItemCollection() method for post-item-processing unlock check
    // The unlock check here may not detect unlocks if items haven't been added to CollectionManager yet

    return {
      success: true,
      rewards: this.regionalDiscoveries, // Use dynamically generated discoveries
      consequences: scaledOutcome.consequences,
      unlockedRegion: undefined, // Will be set by checkForRegionUnlocksAfterItemCollection()
    };
  }

  /**
   * Check all regions for unlock eligibility
   * Returns array of region IDs that can be unlocked
   */
  async checkEligibleRegions(): Promise<string[]> {
    if (!this.regionManager) {
      return [];
    }

    // Use REGIONS directly instead of calling getAllRegions() to avoid mock issues
    const eligibleRegions: string[] = [];

    for (const region of REGIONS) {
      // Skip if already unlocked
      const isUnlocked = await this.regionManager.isRegionUnlocked(region.id);
      if (isUnlocked) {
        continue;
      }

      // Check if requirements are met
      const canUnlock = await this.regionManager.canUnlockRegion(region.id);
      if (canUnlock) {
        eligibleRegions.push(region.id);
      }
    }

    return eligibleRegions;
  }

  /**
   * Automatically unlock regions when requirements are met
   * If multiple regions are eligible, randomly selects one (per PRD requirement)
   * Returns the ID of the unlocked region, or undefined if none were unlocked
   */
  async checkAndUnlockRegions(): Promise<string | undefined> {
    if (!this.regionManager) {
      return undefined;
    }

    const eligibleRegions = await this.checkEligibleRegions();

    if (eligibleRegions.length === 0) {
      return undefined;
    }

    // If multiple regions are eligible, randomly select one (per PRD requirement)
    let selectedRegionId: string;
    if (eligibleRegions.length === 1) {
      selectedRegionId = eligibleRegions[0];
    } else {
      const randomIndex = Math.floor(Math.random() * eligibleRegions.length);
      selectedRegionId = eligibleRegions[randomIndex];
    }

    // Unlock the selected region
    try {
      await this.regionManager.unlockRegion(selectedRegionId);
      return selectedRegionId;
    } catch (error) {
      // If unlock fails (e.g., requirements changed), return undefined
      console.error(`Failed to unlock region ${selectedRegionId}:`, error);
      return undefined;
    }
  }

  /**
   * Check for region unlocks AFTER items have been processed by CollectionManager
   * This method should be called after items are added to CollectionManager via addCollectedItem()
   * to ensure set completions are detected before checking for unlocks.
   *
   * This is the recommended method to use for unlock checking, as it ensures items are processed first.
   *
   * @returns The ID of the unlocked region, or undefined if none were unlocked
   */
  async checkForRegionUnlocksAfterItemCollection(): Promise<
    string | undefined
  > {
    if (!this.regionManager) {
      return undefined;
    }

    // Only check if regionManager has required methods (defensive for mocks)
    if (
      typeof this.regionManager.canUnlockRegion !== 'function' ||
      typeof this.regionManager.unlockRegion !== 'function'
    ) {
      return undefined;
    }

    try {
      return await this.checkAndUnlockRegions();
    } catch (error) {
      // Silently fail if unlock checking fails (e.g., with mock regionManagers)
      console.warn('Failed to check for region unlocks:', error);
      return undefined;
    }
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
    // Mapping of collection set IDs to region names
    const setToRegionMap: Record<string, string> = {
      silk_road_set: 'Desert Oasis',
      spice_trade_set: 'Coastal Caves',
      ancient_temple_set: 'Mountain Pass',
      dragons_hoard_set: "Dragon's Lair",
    };

    // Get all region unlock sets
    const regionUnlockSetIds = Object.keys(setToRegionMap);

    // Build RegionalCollectionSet objects from collection sets
    const regionalSets: RegionalCollectionSet[] = [];

    for (const setId of regionUnlockSetIds) {
      const collectionSet = getCollectionSetById(setId);
      if (collectionSet) {
        // Convert CollectionItem[] to CollectedItem[]
        const collectedItems: CollectedItem[] = collectionSet.items.map(
          (item) => ({
            id: item.id,
            type:
              collectionSet.category === 'trade_goods'
                ? 'trade_good'
                : collectionSet.category === 'discoveries'
                  ? 'discovery'
                  : 'legendary',
            setId: item.setId,
            value: item.value,
            name: item.name,
            description: item.description,
          })
        );

        regionalSets.push({
          id: collectionSet.id,
          name: collectionSet.name,
          region: setToRegionMap[setId],
          items: collectedItems,
        });
      }
    }

    return regionalSets;
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
    // Rewards are generated dynamically in generateRegionalDiscoveries
    // Path outcomes now only contain consequences, not rewards
    const basePaths: ExplorationPath[] = [
      {
        id: 'A',
        type: 'safe',
        description: 'Follow the well-marked trail through ancient ruins',
        outcome: {
          rewards: [], // Rewards generated dynamically
          consequences: [this.createExplorationConsequence('lose_energy', 5)],
          riskLevel: 'low',
        },
      },
      {
        id: 'B',
        type: 'risky',
        description: 'Explore the uncharted crystal formations',
        outcome: {
          rewards: [], // Rewards generated dynamically
          consequences: [this.createExplorationConsequence('lose_energy', 10)],
          riskLevel: 'medium',
        },
      },
      {
        id: 'C',
        type: 'dangerous',
        description: 'Venture into the shadowy depths',
        outcome: {
          rewards: [], // Rewards generated dynamically
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

  private async generateRegionalDiscoveries(
    path: ExplorationPath
  ): Promise<void> {
    let selectedSet: string | null = null;

    // If regionManager is available, use region unlock sets
    if (this.regionManager) {
      const availableSets = await this.getAvailableRegionUnlockSets();
      if (availableSets.length > 0) {
        // Randomly select from available region unlock sets
        const randomIndex = Math.floor(Math.random() * availableSets.length);
        selectedSet = availableSets[randomIndex];
      }
      // If all regions unlocked (no sets available), don't generate discovery
    } else {
      // Without regionManager, cannot determine which sets to use
      // Skip discovery generation for backward compatibility
      return;
    }

    // Only generate discovery if we have a valid set
    if (!selectedSet) {
      return;
    }

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
    // Try to get the collection set from collection-sets.ts
    const collectionSetData = getCollectionSetById(collectionSet);

    if (collectionSetData && collectionSetData.items.length > 0) {
      // Use actual collection set items
      const availableItems = collectionSetData.items;
      const randomIndex = Math.floor(Math.random() * availableItems.length);
      const selectedItem = availableItems[randomIndex];

      // Map CollectionItem category to CollectedItem type
      const typeMap: Record<string, 'trade_good' | 'discovery' | 'legendary'> =
        {
          trade_goods: 'trade_good',
          discoveries: 'discovery',
          legendaries: 'legendary',
        };

      return {
        id: `discovery-${collectionSet}-${selectedItem.id}-${Date.now()}-${Math.random()}`,
        type: typeMap[collectionSetData.category] || 'discovery',
        setId: collectionSet,
        value: value, // Use provided value (scaled by depth)
        name: selectedItem.name,
        description: selectedItem.description,
      };
    }

    // Generic fallback for unknown collection sets
    return {
      id: `discovery-${collectionSet}-${Date.now()}-${Math.random()}`,
      type: 'discovery',
      setId: collectionSet,
      value,
      name: 'Discovery Item',
      description: `A mysterious discovery item from ${collectionSet}`,
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
