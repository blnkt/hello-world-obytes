import type { DungeonNode, EncounterType } from '@/types/delvers-descent';

import { DungeonMapGenerator } from './map-generator';

class MockRegionManagerAllUnlocked {
  // eslint-disable-next-line @typescript-eslint/require-await
  async isRegionUnlocked(_regionId: string): Promise<boolean> {
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getUnlockedRegions(): Promise<any[]> {
    // Return all regions to simulate all unlocked
    return [
      { id: 'forest_depths' },
      { id: 'ruins' },
      { id: 'caverns' },
      { id: 'sanctum' },
      { id: 'market' },
      { id: 'wastes' },
    ];
  }
}

describe('Discovery Site exclusion when all regions unlocked', () => {
  it('excludes discovery_site from encounter weights when all regions unlocked (depth-level generation)', async () => {
    const generator = new DungeonMapGenerator({
      regionManager: new MockRegionManagerAllUnlocked() as any,
    });

    // Generate many depths to sample the distribution
    const samples: DungeonNode[][] = [];
    for (let i = 0; i < 20; i++) {
      samples.push(await generator.generateDepthLevel(2));
    }

    const allTypes = samples.flat().map((n) => n.type);
    expect(allTypes).not.toContain<EncounterType>('discovery_site');
    // Ensure other encounter types still appear
    expect(allTypes.length).toBeGreaterThan(0);
  });

  it('excludes discovery_site across full map generation when all regions unlocked (integration)', async () => {
    const generator = new DungeonMapGenerator({
      regionManager: new MockRegionManagerAllUnlocked() as any,
    });

    const map = await generator.generateFullMap(5);
    const hasDiscovery = map.some((n) => n.type === 'discovery_site');
    expect(hasDiscovery).toBe(false);
  });

  it('maintains normalized weights after exclusion (no empty distributions)', async () => {
    const generator = new DungeonMapGenerator({
      regionManager: new MockRegionManagerAllUnlocked() as any,
    });

    // Attempt multiple generations; ensure we always get valid nodes
    for (let depth = 1; depth <= 3; depth++) {
      const nodes = await generator.generateDepthLevel(depth);
      expect(nodes.length).toBeGreaterThan(0);
      // All nodes should have a valid type that is not discovery_site
      nodes.forEach((node) => {
        expect(node.type).not.toBe('discovery_site');
      });
    }
  });
});
