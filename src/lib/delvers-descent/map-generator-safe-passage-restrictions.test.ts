import type { DungeonNode, EncounterType } from '@/types/delvers-descent';

import { DungeonMapGenerator } from './map-generator';
import { REGIONS } from './regions';

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

describe('Safe Passage restrictions', () => {
  describe('Depth restriction (depths 1-10)', () => {
    it('excludes safe_passage from depths 1-10', async () => {
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
      expect(allTypes).not.toContain<EncounterType>('safe_passage');
      // Ensure other encounter types still appear
      expect(allTypes.length).toBeGreaterThan(0);
    });

    it('allows safe_passage in depths > 10', async () => {
      const generator = new DungeonMapGenerator({
        regionManager: new MockRegionManagerMultipleUnlocked() as any,
      });

      // Generate many samples from depth 11
      let foundSafePassage = false;
      for (let i = 0; i < 50; i++) {
        const nodes = await generator.generateDepthLevel(11);
        if (nodes.some((n) => n.type === 'safe_passage')) {
          foundSafePassage = true;
          break;
        }
      }

      // With depth > 10, should find safe_passage
      expect(foundSafePassage).toBe(true);
    });
  });

  describe('Per-depth limit (max one per depth)', () => {
    it('allows at most one safe_passage per depth level', async () => {
      const generator = new DungeonMapGenerator({
        regionManager: new MockRegionManagerMultipleUnlocked() as any,
      });

      // Generate many depth levels at depth 11 (where safe_passage is allowed)
      for (let i = 0; i < 50; i++) {
        const nodes = await generator.generateDepthLevel(11);
        const safePassageCount = nodes.filter(
          (n) => n.type === 'safe_passage'
        ).length;

        // Should never have more than one safe_passage per depth
        expect(safePassageCount).toBeLessThanOrEqual(1);
      }
    });

    it('allows exactly one safe_passage per depth level when it appears', async () => {
      const generator = new DungeonMapGenerator({
        regionManager: new MockRegionManagerMultipleUnlocked() as any,
      });

      // Generate many depth levels until we find one with safe_passage
      let foundSafePassage = false;
      let attempts = 0;
      const maxAttempts = 100;

      while (!foundSafePassage && attempts < maxAttempts) {
        const nodes = await generator.generateDepthLevel(11);
        const safePassageNodes = nodes.filter((n) => n.type === 'safe_passage');

        if (safePassageNodes.length > 0) {
          foundSafePassage = true;
          // When safe_passage appears, there should be exactly one
          expect(safePassageNodes.length).toBe(1);
        }

        attempts++;
      }

      // Should find at least one depth level with safe_passage
      expect(foundSafePassage).toBe(true);
    });
  });

  describe('Full map generation', () => {
    it('excludes safe_passage from depths 1-10 in full map', async () => {
      const generator = new DungeonMapGenerator({
        regionManager: new MockRegionManagerMultipleUnlocked() as any,
      });

      // Generate full map (will include depths 1-10)
      const map = await generator.generateFullMap(15);
      const shallowNodes = map.filter((n) => n.depth <= 10);
      const hasSafePassageInShallow = shallowNodes.some(
        (n) => n.type === 'safe_passage'
      );
      expect(hasSafePassageInShallow).toBe(false);
    });

    it('allows safe_passage in depths > 10 in full map', async () => {
      const generator = new DungeonMapGenerator({
        regionManager: new MockRegionManagerMultipleUnlocked() as any,
      });

      // Generate multiple full maps to increase chance of finding safe_passage
      let foundSafePassage = false;
      for (let i = 0; i < 10; i++) {
        const map = await generator.generateFullMap(15);
        // Check depths > 10 for safe_passage
        const deepNodes = map.filter((n) => n.depth > 10);
        if (deepNodes.some((n) => n.type === 'safe_passage')) {
          foundSafePassage = true;
          break;
        }
      }
      // Should find safe_passage in depths > 10
      expect(foundSafePassage).toBe(true);
    });

    it('ensures at most one safe_passage per depth in full map', async () => {
      const generator = new DungeonMapGenerator({
        regionManager: new MockRegionManagerMultipleUnlocked() as any,
      });

      // Generate full map
      const map = await generator.generateFullMap(15);

      // Group nodes by depth
      const nodesByDepth = new Map<number, DungeonNode[]>();
      map.forEach((node) => {
        const depthNodes = nodesByDepth.get(node.depth) || [];
        depthNodes.push(node);
        nodesByDepth.set(node.depth, depthNodes);
      });

      // Check each depth has at most one safe_passage
      for (const [depth, nodes] of nodesByDepth.entries()) {
        const safePassageCount = nodes.filter(
          (n) => n.type === 'safe_passage'
        ).length;
        expect(safePassageCount).toBeLessThanOrEqual(1);
      }
    });
  });
});
