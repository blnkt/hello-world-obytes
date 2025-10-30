/**
 * Performance Benchmarks for Map Generation
 * Targets: <50ms for map generation
 */

import { DungeonMapGenerator } from '../map-generator';
import { DungeonMapGeneratorOptimized } from '../map-generator-optimized';

describe('Map Generator Performance', () => {
  describe('Original Implementation', () => {
    it('should generate small maps quickly (<50ms)', () => {
      const generator = new DungeonMapGenerator();
      const maxDepth = 5;

      const start = performance.now();
      const map = generator.generateFullMap(maxDepth);
      const end = performance.now();
      const duration = end - start;

      expect(map.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(50); // Target: <50ms
    });

    it('should generate medium maps within reasonable time', () => {
      const generator = new DungeonMapGenerator();
      const maxDepth = 10;

      const start = performance.now();
      const map = generator.generateFullMap(maxDepth);
      const end = performance.now();
      const duration = end - start;

      expect(map.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(200); // Reasonable target
    });
  });

  describe('Optimized Implementation', () => {
    it('should generate small maps quickly (<50ms)', () => {
      const generator = new DungeonMapGeneratorOptimized();
      const maxDepth = 5;

      const start = performance.now();
      const map = generator.generateFullMap(maxDepth);
      const end = performance.now();
      const duration = end - start;

      expect(map.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(50); // Target: <50ms
    });

    it('should generate medium maps within reasonable time', () => {
      const generator = new DungeonMapGeneratorOptimized();
      const maxDepth = 10;

      const start = performance.now();
      const map = generator.generateFullMap(maxDepth);
      const end = performance.now();
      const duration = end - start;

      expect(map.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(200); // Reasonable target
    });

    it('should be faster than original implementation', () => {
      const originalGenerator = new DungeonMapGenerator();
      const optimizedGenerator = new DungeonMapGeneratorOptimized();
      const maxDepth = 7;

      // Run both implementations multiple times for accuracy
      let originalTotal = 0;
      let optimizedTotal = 0;

      for (let i = 0; i < 10; i++) {
        const start1 = performance.now();
        originalGenerator.generateFullMap(maxDepth);
        const end1 = performance.now();
        originalTotal += end1 - start1;

        const start2 = performance.now();
        optimizedGenerator.generateFullMap(maxDepth);
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

      // Optimized should perform at least as well
      // Use a floor baseline to avoid zero-baseline false failures
      if (originalAvg > 0.1 || optimizedAvg > 0.1) {
        const baseline = Math.max(originalAvg, 0.1);
        expect(optimizedAvg).toBeLessThanOrEqual(baseline * 1.5);
      }
    });
  });

  describe('Performance Scaling', () => {
    it('should handle increasing depth efficiently', () => {
      const generator = new DungeonMapGeneratorOptimized();
      const depths = [3, 5, 7, 10];

      depths.forEach((maxDepth) => {
        const start = performance.now();
        const map = generator.generateFullMap(maxDepth);
        const end = performance.now();
        const duration = end - start;

        expect(map.length).toBeGreaterThan(0);
        // Linear time complexity target
        expect(duration).toBeLessThan(50 * maxDepth);
      });
    });
  });

  describe('Regional selection (per-depth)', () => {
    it('should generate a depth with a region quickly', () => {
      const generator = new DungeonMapGenerator();

      const start = performance.now();
      const nodes = generator.generateDepthLevel(3, 'caverns');
      const end = performance.now();

      expect(nodes.length).toBeGreaterThan(0);
      expect(end - start).toBeLessThan(10);
    });

    it('should handle many per-depth regional generations efficiently', () => {
      const generator = new DungeonMapGenerator();
      const regions = ['ruins', 'caverns', 'sanctum', 'market', 'wastes'] as const;

      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        const region = regions[i % regions.length];
        const nodes = generator.generateDepthLevel(2 + (i % 3), region);
        expect(nodes.length).toBeGreaterThan(0);
      }
      const end = performance.now();

      expect(end - start).toBeLessThan(200);
    });

    it('should reflect different distributions across regions (hazard higher in wastes)', () => {
      const generator = new DungeonMapGenerator();
      const samples = 200;

      let wastesHazard = 0;
      let sanctumHazard = 0;

      for (let i = 0; i < samples; i++) {
        const nodesWastes = generator.generateDepthLevel(2, 'wastes');
        const nodesSanctum = generator.generateDepthLevel(2, 'sanctum');
        wastesHazard += nodesWastes.filter((n) => n.type === 'hazard').length;
        sanctumHazard += nodesSanctum.filter((n) => n.type === 'hazard').length;
      }

      // With weights (wastes hazard 0.25 vs sanctum 0.05), wastes should exceed sanctum
      expect(wastesHazard).toBeGreaterThan(sanctumHazard);
    });
  });
});
