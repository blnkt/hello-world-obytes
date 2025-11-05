import type { DungeonNode, EncounterType } from '@/types/delvers-descent';

import { DungeonMapGenerator } from './map-generator';
import { REGIONS } from './regions';

class MockRegionManagerOnlyDefault {
  // eslint-disable-next-line @typescript-eslint/require-await
  async isRegionUnlocked(regionId: string): Promise<boolean> {
    // Only default region (forest_depths) is unlocked
    return regionId === 'forest_depths';
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getUnlockedRegions(): Promise<typeof REGIONS> {
    // Return only default region
    return [REGIONS.find((r) => r.id === 'forest_depths')!].filter(
      (r) => r !== undefined
    );
  }
}

class MockRegionManagerMultipleUnlocked {
  // eslint-disable-next-line @typescript-eslint/require-await
  async isRegionUnlocked(regionId: string): Promise<boolean> {
    // Multiple regions unlocked: forest_depths and desert_oasis
    return regionId === 'forest_depths' || regionId === 'desert_oasis';
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getUnlockedRegions(): Promise<typeof REGIONS> {
    // Return multiple regions
    return REGIONS.filter(
      (r) => r.id === 'forest_depths' || r.id === 'desert_oasis'
    );
  }
}

describe('Region Shortcut exclusion restrictions', () => {
  describe('Depth restriction (depths 1-10)', () => {
    it('excludes region_shortcut from depths 1-10', async () => {
      const generator = new DungeonMapGenerator({
        regionManager: new MockRegionManagerMultipleUnlocked() as any,
      });

      // Generate many samples from depths 1-10
      const samples: DungeonNode[] = [];
      for (let depth = 1; depth <= 10; depth++) {
        for (let i = 0; i < 10; i++) {
          const nodes = await generator.generateDepthLevel(depth);
          samples.push(...nodes);
        }
      }

      const allTypes = samples.map((n) => n.type);
      expect(allTypes).not.toContain<EncounterType>('region_shortcut');
      // Ensure other encounter types still appear
      expect(allTypes.length).toBeGreaterThan(0);
    });

    it('allows region_shortcut in depths > 10', async () => {
      const generator = new DungeonMapGenerator({
        regionManager: new MockRegionManagerMultipleUnlocked() as any,
      });

      // Generate many samples from depth 11
      let foundShortcut = false;
      for (let i = 0; i < 50; i++) {
        const nodes = await generator.generateDepthLevel(11);
        if (nodes.some((n) => n.type === 'region_shortcut')) {
          foundShortcut = true;
          break;
        }
      }

      // With multiple regions unlocked and depth > 10, should find shortcuts
      expect(foundShortcut).toBe(true);
    });
  });

  describe('Default region only restriction', () => {
    it('excludes region_shortcut when only default region is unlocked', async () => {
      const generator = new DungeonMapGenerator({
        regionManager: new MockRegionManagerOnlyDefault() as any,
      });

      // Generate many samples at various depths (including > 10)
      const samples: DungeonNode[] = [];
      for (let depth = 11; depth <= 15; depth++) {
        for (let i = 0; i < 10; i++) {
          const nodes = await generator.generateDepthLevel(depth);
          samples.push(...nodes);
        }
      }

      const allTypes = samples.map((n) => n.type);
      expect(allTypes).not.toContain<EncounterType>('region_shortcut');
      // Ensure other encounter types still appear
      expect(allTypes.length).toBeGreaterThan(0);
    });

    it('allows region_shortcut when multiple regions are unlocked (depth > 10)', async () => {
      const generator = new DungeonMapGenerator({
        regionManager: new MockRegionManagerMultipleUnlocked() as any,
      });

      // Generate many samples from depth 11
      let foundShortcut = false;
      for (let i = 0; i < 50; i++) {
        const nodes = await generator.generateDepthLevel(11);
        if (nodes.some((n) => n.type === 'region_shortcut')) {
          foundShortcut = true;
          break;
        }
      }

      // With multiple regions unlocked and depth > 10, should find shortcuts
      expect(foundShortcut).toBe(true);
    });
  });

  describe('Combined restrictions', () => {
    it('excludes region_shortcut when depth <= 10 even if multiple regions unlocked', async () => {
      const generator = new DungeonMapGenerator({
        regionManager: new MockRegionManagerMultipleUnlocked() as any,
      });

      // Generate samples from depths 1-10
      const samples: DungeonNode[] = [];
      for (let depth = 1; depth <= 10; depth++) {
        const nodes = await generator.generateDepthLevel(depth);
        samples.push(...nodes);
      }

      const allTypes = samples.map((n) => n.type);
      expect(allTypes).not.toContain<EncounterType>('region_shortcut');
    });

    it('excludes region_shortcut when only default unlocked even if depth > 10', async () => {
      const generator = new DungeonMapGenerator({
        regionManager: new MockRegionManagerOnlyDefault() as any,
      });

      // Generate samples from depth 11
      const samples: DungeonNode[] = [];
      for (let i = 0; i < 20; i++) {
        const nodes = await generator.generateDepthLevel(11);
        samples.push(...nodes);
      }

      const allTypes = samples.map((n) => n.type);
      expect(allTypes).not.toContain<EncounterType>('region_shortcut');
    });

    it('allows region_shortcut only when depth > 10 AND multiple regions unlocked', async () => {
      const generator = new DungeonMapGenerator({
        regionManager: new MockRegionManagerMultipleUnlocked() as any,
      });

      // Generate many samples from depth 11
      let foundShortcut = false;
      for (let i = 0; i < 50; i++) {
        const nodes = await generator.generateDepthLevel(11);
        if (nodes.some((n) => n.type === 'region_shortcut')) {
          foundShortcut = true;
          break;
        }
      }

      expect(foundShortcut).toBe(true);
    });
  });

  describe('Full map generation', () => {
    it('excludes region_shortcut from full map when restrictions apply', async () => {
      const generator = new DungeonMapGenerator({
        regionManager: new MockRegionManagerOnlyDefault() as any,
      });

      // Generate full map (will include depths 1-10)
      const map = await generator.generateFullMap(15);
      const hasShortcut = map.some((n) => n.type === 'region_shortcut');
      expect(hasShortcut).toBe(false);
    });

    it('includes region_shortcut in full map when restrictions do not apply', async () => {
      const generator = new DungeonMapGenerator({
        regionManager: new MockRegionManagerMultipleUnlocked() as any,
      });

      // Generate full map with depth > 10
      const map = await generator.generateFullMap(15);
      // Check depths > 10 for shortcuts
      const deepNodes = map.filter((n) => n.depth > 10);
      const hasShortcut = deepNodes.some((n) => n.type === 'region_shortcut');
      // Should find shortcuts in depths > 10
      expect(hasShortcut).toBe(true);
    });
  });
});
