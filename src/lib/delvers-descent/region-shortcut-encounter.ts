import {
  type EncounterReward,
  type EncounterType,
  type Region,
} from '@/types/delvers-descent';

import { type RegionManager } from './region-manager';

export interface RegionShortcutOutcome {
  type: 'success' | 'failure';
  message: string;
  reward?: EncounterReward;
  consequence?: {
    energyLoss: number;
    itemLossRisk: number;
    forcedRetreat: boolean;
    encounterLockout: boolean;
  };
  targetRegionId?: string; // The region this shortcut leads to
}

export type ShortcutType =
  | 'ancient_portal'
  | 'hidden_pathway'
  | 'dimensional_rift'
  | 'underground_tunnel'
  | 'magical_teleporter';

export interface RegionShortcutConfig {
  shortcutType: ShortcutType;
  targetRegion: Region;
  quality: number; // 1-10 scale
  baseReward: EncounterReward;
  description: string;
  failureConsequence: {
    energyLoss: number;
    itemLossRisk: number; // 0.0 to 1.0
    forcedRetreat: boolean;
    encounterLockout: boolean;
  };
}

export interface RegionShortcutState {
  encounterId: string;
  encounterType: EncounterType;
  config: RegionShortcutConfig;
  isResolved: boolean;
  outcome?: RegionShortcutOutcome;
}

export class RegionShortcutEncounter {
  private state: RegionShortcutState;

  constructor(encounterId: string, config: RegionShortcutConfig) {
    this.state = {
      encounterId,
      encounterType: 'region_shortcut',
      config,
      isResolved: false,
    };
  }

  getState(): RegionShortcutState {
    return { ...this.state };
  }

  complete(): RegionShortcutOutcome {
    if (this.state.isResolved) {
      return this.state.outcome!;
    }

    const outcome: RegionShortcutOutcome = {
      type: 'success',
      message: this.getSuccessMessage(),
      reward: this.calculateReward(),
      targetRegionId: this.state.config.targetRegion.id,
    };

    this.state.outcome = outcome;
    this.state.isResolved = true;

    return outcome;
  }

  private getSuccessMessage(): string {
    const regionName = this.state.config.targetRegion.name;
    const descriptions: Record<ShortcutType, string> = {
      ancient_portal: `The portal hums with ancient magic, revealing a path to ${regionName}.`,
      hidden_pathway: `A hidden pathway opens before you, leading to ${regionName}.`,
      dimensional_rift: `The dimensional rift stabilizes, creating a gateway to ${regionName}.`,
      underground_tunnel: `The tunnel branches unexpectedly, connecting to ${regionName}.`,
      magical_teleporter: `The teleporter activates, its destination set to ${regionName}.`,
    };

    return descriptions[this.state.config.shortcutType];
  }

  private calculateReward(): EncounterReward {
    return {
      energy: 0,
      items: [],
      xp: 0,
    };
  }

  static async createRegionShortcutConfig(params: {
    regionManager: RegionManager;
    currentRegionId?: string;
    shortcutType: ShortcutType;
    quality?: number;
    depth?: number;
  }): Promise<RegionShortcutConfig> {
    const {
      regionManager,
      currentRegionId,
      shortcutType,
      quality = 5,
      depth = 1,
    } = params;
    const unlockedRegions = await regionManager.getUnlockedRegions();

    // Filter out current region
    const availableRegions = unlockedRegions.filter(
      (region) => region.id !== currentRegionId
    );

    if (availableRegions.length === 0) {
      // Fallback: if no other regions available, use first unlocked (or current if must)
      const fallbackRegion = unlockedRegions[0];
      if (!fallbackRegion) {
        throw new Error('No unlocked regions available for shortcut');
      }
      return this.createConfigForRegion({
        targetRegion: fallbackRegion,
        shortcutType,
        quality,
        depth,
      });
    }

    // Pick a random available region
    const randomIndex = Math.floor(Math.random() * availableRegions.length);
    const targetRegion = availableRegions[randomIndex];

    return this.createConfigForRegion({
      targetRegion,
      shortcutType,
      quality,
      depth,
    });
  }

  private static createConfigForRegion(params: {
    targetRegion: Region;
    shortcutType: ShortcutType;
    quality: number;
    depth: number;
  }): RegionShortcutConfig {
    const { targetRegion, shortcutType, quality, depth } = params;
    const scaledQuality = Math.max(
      1,
      Math.min(10, quality * Math.pow(depth, 0.2))
    );

    const descriptions: Record<ShortcutType, string> = {
      ancient_portal: `An ancient portal glows with mysterious energy, its destination shrouded in mist.`,
      hidden_pathway: `A hidden pathway reveals itself, winding through the darkness.`,
      dimensional_rift: `A dimensional rift tears through space, unstable but navigable.`,
      underground_tunnel: `An underground tunnel branches off, its destination unknown.`,
      magical_teleporter: `A magical teleporter hums with arcane power, ready to transport you.`,
    };

    const baseReward: EncounterReward = {
      energy: 0,
      items: [],
      xp: 0,
    };

    const failureConsequence = {
      energyLoss: Math.round(5 * Math.pow(depth, 0.8)),
      itemLossRisk: 0.05,
      forcedRetreat: false,
      encounterLockout: false,
    };

    return {
      shortcutType,
      targetRegion,
      quality: scaledQuality,
      baseReward,
      description: descriptions[shortcutType],
      failureConsequence,
    };
  }

  static getShortcutTypes(): ShortcutType[] {
    return [
      'ancient_portal',
      'hidden_pathway',
      'dimensional_rift',
      'underground_tunnel',
      'magical_teleporter',
    ];
  }
}
