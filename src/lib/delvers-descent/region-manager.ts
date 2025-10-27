import { getItem, setItem } from '@/lib/storage';
import type { Region, UnlockRequirement } from '@/types/delvers-descent';

import { type CollectionManager } from './collection-manager';
import { REGIONS } from './regions';

const UNLOCKED_REGIONS_KEY = 'unlockedRegions';
const SELECTED_REGION_KEY = 'selectedRegion';

export class RegionManager {
  private collectionManager: CollectionManager;
  private unlockedRegions: string[] = [];
  private selectedRegionId: string | null = null;

  constructor(collectionManager: CollectionManager) {
    this.collectionManager = collectionManager;
    this.loadState();
  }

  private async loadState(): Promise<void> {
    try {
      const storedUnlocks = (await getItem(UNLOCKED_REGIONS_KEY)) || [];
      this.unlockedRegions = Array.isArray(storedUnlocks) ? storedUnlocks : [];

      const storedSelected = await getItem(SELECTED_REGION_KEY);
      this.selectedRegionId =
        typeof storedSelected === 'string' ? storedSelected : null;
    } catch (error) {
      console.error('Failed to load region state:', error);
      this.unlockedRegions = [];
      this.selectedRegionId = null;
    }
  }

  private async saveState(): Promise<void> {
    try {
      await setItem(UNLOCKED_REGIONS_KEY, this.unlockedRegions);
      if (this.selectedRegionId) {
        await setItem(SELECTED_REGION_KEY, this.selectedRegionId);
      }
    } catch (error) {
      console.error('Failed to save region state:', error);
    }
  }

  /**
   * Get all regions
   */
  getAllRegions(): Region[] {
    return REGIONS;
  }

  /**
   * Get unlocked regions
   */
  async getUnlockedRegions(): Promise<Region[]> {
    await this.waitForLoad();

    return REGIONS.filter((region) => this.unlockedRegions.includes(region.id));
  }

  /**
   * Check if a region is unlocked
   */
  async isRegionUnlocked(regionId: string): Promise<boolean> {
    await this.waitForLoad();
    return this.unlockedRegions.includes(regionId);
  }

  /**
   * Get currently selected region
   */
  async getSelectedRegion(): Promise<Region | null> {
    await this.waitForLoad();

    if (!this.selectedRegionId) {
      return REGIONS[0] || null; // Default to first region
    }

    return REGIONS.find((r) => r.id === this.selectedRegionId) || null;
  }

  /**
   * Set the selected region
   */
  async selectRegion(regionId: string): Promise<void> {
    const unlocked = await this.isRegionUnlocked(regionId);
    if (!unlocked) {
      throw new Error(`Region ${regionId} is not unlocked`);
    }

    this.selectedRegionId = regionId;
    await this.saveState();
  }

  /**
   * Check if requirements are met to unlock a region
   */
  async canUnlockRegion(regionId: string): Promise<boolean> {
    const region = REGIONS.find((r) => r.id === regionId);
    if (!region || !region.unlockRequirements) {
      return true; // No requirements, always unlocked
    }

    const progress = await this.collectionManager.getCollectionProgress();

    return this.checkUnlockRequirements(region.unlockRequirements, progress);
  }

  private async checkUnlockRequirements(
    requirements: UnlockRequirement,
    progress: any
  ): Promise<boolean> {
    if (requirements.completedSets) {
      const hasAllSets = requirements.completedSets.every((setId) =>
        progress.completedSets.includes(setId)
      );
      if (!hasAllSets) return false;
    }

    if (requirements.totalItemsCollected !== undefined) {
      if (progress.totalItems < requirements.totalItemsCollected) return false;
    }

    // TODO: Check characterLevel and specificRegionCompleted if needed
    return true;
  }

  /**
   * Unlock a region based on completion requirements
   */
  async unlockRegion(regionId: string): Promise<void> {
    if (this.unlockedRegions.includes(regionId)) {
      return; // Already unlocked
    }

    const canUnlock = await this.canUnlockRegion(regionId);
    if (!canUnlock) {
      throw new Error(`Cannot unlock region ${regionId}: requirements not met`);
    }

    this.unlockedRegions.push(regionId);
    await this.saveState();
  }

  private async waitForLoad(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}
