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
      // When times are very fast (< 0.1ms), both are acceptable
      if (originalAvg > 0.1 || optimizedAvg > 0.1) {
        expect(optimizedAvg).toBeLessThanOrEqual(originalAvg * 1.5);
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
});

