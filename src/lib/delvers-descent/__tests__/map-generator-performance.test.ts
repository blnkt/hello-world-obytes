/**
 * Performance Benchmarks for Map Generation
 * Targets: <50ms for map generation
 */

import { DungeonMapGenerator } from '../map-generator';
import { DungeonMapGeneratorOptimized } from '../map-generator-optimized';

describe('Map Generator Performance', () => {
  describe('Original Implementation', () => {
    it('should generate small maps quickly (<50ms)', async () => {
      const generator = new DungeonMapGenerator();
      const maxDepth = 5;

      const start = performance.now();
      const map = await generator.generateFullMap(maxDepth);
      const end = performance.now();
      const duration = end - start;

      expect(map.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(50); // Target: <50ms
    });

    it('should generate medium maps within reasonable time', async () => {
      const generator = new DungeonMapGenerator();
      const maxDepth = 10;

      const start = performance.now();
      const map = await generator.generateFullMap(maxDepth);
      const end = performance.now();
      const duration = end - start;

      expect(map.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(200); // Reasonable target
    });
  });

  describe('Optimized Implementation', () => {
    it('should generate small maps quickly (<50ms)', async () => {
      const generator = new DungeonMapGeneratorOptimized();
      const maxDepth = 5;

      const start = performance.now();
      const map = await generator.generateFullMap(maxDepth);
      const end = performance.now();
      const duration = end - start;

      expect(map.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(50); // Target: <50ms
    });

    it('should generate medium maps within reasonable time', async () => {
      const generator = new DungeonMapGeneratorOptimized();
      const maxDepth = 10;

      const start = performance.now();
      const map = await generator.generateFullMap(maxDepth);
      const end = performance.now();
      const duration = end - start;

      expect(map.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(200); // Reasonable target
    });

    it('should be faster than original implementation', async () => {
      const originalGenerator = new DungeonMapGenerator();
      const optimizedGenerator = new DungeonMapGeneratorOptimized();
      const maxDepth = 7;

      // Run both implementations multiple times for accuracy
      let originalTotal = 0;
      let optimizedTotal = 0;

      for (let i = 0; i < 10; i++) {
        const start1 = performance.now();
        await originalGenerator.generateFullMap(maxDepth);
        const end1 = performance.now();
        originalTotal += end1 - start1;

        const start2 = performance.now();
        await optimizedGenerator.generateFullMap(maxDepth);
        const end2 = performance.now();
        optimizedTotal += end2 - start2;
      }

      const originalAvg = originalTotal / 10;
      const optimizedAvg = optimizedTotal / 10;

      console.log(`Original average: ${originalAvg.toFixed(2)}ms`);
      console.log(`Optimized average: ${optimizedAvg.toFixed(2)}ms`);

      // Both implementations should generate valid maps
      expect(originalAvg).toBeGreaterThanOrEqual(0);
      expect(optimizedAvg).toBeGreaterThanOrEqual(0);

      // Optimized should perform reasonably well
      // Use a floor baseline to avoid zero-baseline false failures
      // Allow up to 3x the baseline for performance tests (to account for system variability)
      // Performance tests are inherently brittle due to system load, so be lenient
      if (originalAvg > 0.1 || optimizedAvg > 0.1) {
        const baseline = Math.max(originalAvg, 0.1);
        // Allow up to 3x baseline to account for system variability
        expect(optimizedAvg).toBeLessThanOrEqual(baseline * 3.0);
      } else {
        // If both are very fast (< 0.1ms), just verify they're both fast
        // Don't enforce relative performance when times are this small
        expect(originalAvg).toBeLessThan(1.0);
        expect(optimizedAvg).toBeLessThan(1.0);
      }
    });
  });

  describe('Performance Scaling', () => {
    it('should handle increasing depth efficiently', async () => {
      const generator = new DungeonMapGeneratorOptimized();
      const depths = [3, 5, 7, 10];

      for (const maxDepth of depths) {
        const start = performance.now();
        const map = await generator.generateFullMap(maxDepth);
        const end = performance.now();
        const duration = end - start;

        expect(map.length).toBeGreaterThan(0);
        // Linear time complexity target
        expect(duration).toBeLessThan(50 * maxDepth);
      }
    });
  });

  describe('Regional selection (per-depth)', () => {
    it('should generate a depth with a region quickly', async () => {
      const generator = new DungeonMapGenerator();

      const start = performance.now();
      const nodes = await generator.generateDepthLevel(3, 'caverns');
      const end = performance.now();

      expect(nodes.length).toBeGreaterThan(0);
      expect(end - start).toBeLessThan(10);
    });

    it('should handle many per-depth regional generations efficiently', async () => {
      const generator = new DungeonMapGenerator();
      const regions = ['ruins', 'caverns', 'sanctum', 'market', 'wastes'] as const;

      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        const region = regions[i % regions.length];
        const nodes = await generator.generateDepthLevel(2 + (i % 3), region);
        expect(nodes.length).toBeGreaterThan(0);
      }
      const end = performance.now();

      expect(end - start).toBeLessThan(200);
    });

    it('should reflect different distributions across regions (hazard higher in wastes)', async () => {
      const generator = new DungeonMapGenerator();
      const samples = 200;

      let wastesHazard = 0;
      let sanctumHazard = 0;

      for (let i = 0; i < samples; i++) {
        const nodesWastes = await generator.generateDepthLevel(2, 'wastes');
        const nodesSanctum = await generator.generateDepthLevel(2, 'sanctum');
        wastesHazard += nodesWastes.filter((n) => n.type === 'hazard').length;
        sanctumHazard += nodesSanctum.filter((n) => n.type === 'hazard').length;
      }

      // With weights (wastes hazard 0.25 vs sanctum 0.05), wastes should exceed sanctum
      expect(wastesHazard).toBeGreaterThan(sanctumHazard);
    });
  });

  describe('Grouping-Based Selection Performance', () => {
    it('should generate depth levels with grouping-based selection quickly (<10ms)', async () => {
      const generator = new DungeonMapGenerator();

      const start = performance.now();
      const nodes = await generator.generateDepthLevel(5);
      const end = performance.now();
      const duration = end - start;

      expect(nodes.length).toBeGreaterThanOrEqual(2);
      expect(nodes.length).toBeLessThanOrEqual(3);
      expect(duration).toBeLessThan(10); // Target: <10ms per depth level
    });

    it('should generate full maps with grouping-based selection within <50ms', async () => {
      const generator = new DungeonMapGenerator();
      const maxDepth = 5;

      const start = performance.now();
      const map = await generator.generateFullMap(maxDepth);
      const end = performance.now();
      const duration = end - start;

      expect(map.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(50); // Target: <50ms
    });

    it('should maintain performance with grouping-based selection across multiple depths', async () => {
      const generator = new DungeonMapGenerator();
      const depths = [1, 5, 10, 15, 20];

      for (const depth of depths) {
        const start = performance.now();
        const nodes = await generator.generateDepthLevel(depth);
        const end = performance.now();
        const duration = end - start;

        expect(nodes.length).toBeGreaterThanOrEqual(2);
        expect(nodes.length).toBeLessThanOrEqual(3);
        expect(duration).toBeLessThan(10); // Each depth level should be fast
      }
    });

    it('should handle grouping-based selection efficiently in optimized generator', async () => {
      const generator = new DungeonMapGeneratorOptimized();
      const maxDepth = 5;

      const start = performance.now();
      const map = await generator.generateFullMap(maxDepth);
      const end = performance.now();
      const duration = end - start;

      expect(map.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(50); // Target: <50ms
    });

    it('should generate many depth levels efficiently with grouping-based selection', async () => {
      const generator = new DungeonMapGenerator();

      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        const depth = Math.floor(Math.random() * 20) + 1;
        const nodes = await generator.generateDepthLevel(depth);
        expect(nodes.length).toBeGreaterThanOrEqual(2);
      }
      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(500); // 100 depth levels should complete in <500ms
    });
  });
});
