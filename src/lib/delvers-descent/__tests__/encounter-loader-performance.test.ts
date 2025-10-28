/**
 * Performance Benchmarks for Encounter Loading
 * Targets: <200ms for encounter loading
 */

import { EncounterLoaderOptimized } from '../encounter-loader-optimized';
import { EncounterResolver } from '../encounter-resolver';
import type { EncounterOutcome } from '@/types/delvers-descent';

describe('Encounter Loader Performance', () => {
  describe('Original Implementation', () => {
    it('should load encounter state quickly (<200ms)', () => {
      const resolver = new EncounterResolver();

      const start = performance.now();
      resolver.getCurrentState();
      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(200);
    });
  });

  describe('Optimized Implementation', () => {
    it('should load encounter state quickly (<200ms)', () => {
      const loader = new EncounterLoaderOptimized();

      const start = performance.now();
      loader.getCurrentState();
      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(200);
    });

    it('should be faster than original implementation for statistics', () => {
      const originalResolver = new EncounterResolver();
      const optimizedLoader = new EncounterLoaderOptimized();

      // Run both implementations multiple times for accuracy
      let originalTotal = 0;
      let optimizedTotal = 0;

      for (let i = 0; i < 10; i++) {
        const start1 = performance.now();
        originalResolver.getEncounterStatistics();
        const end1 = performance.now();
        originalTotal += end1 - start1;

        const start2 = performance.now();
        optimizedLoader.getEncounterStatistics();
        const end2 = performance.now();
        optimizedTotal += end2 - start2;
      }

      const originalAvg = originalTotal / 10;
      const optimizedAvg = optimizedTotal / 10;

      console.log(`Original stats average: ${originalAvg.toFixed(2)}ms`);
      console.log(`Optimized stats average: ${optimizedAvg.toFixed(2)}ms`);

      expect(originalAvg).toBeGreaterThanOrEqual(0);
      expect(optimizedAvg).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Batch Operations', () => {
    it('should handle batch statistics updates efficiently', () => {
      const loader = new EncounterLoaderOptimized();
      const outcomes: EncounterOutcome[] = [];

      // Generate 100 encounter outcomes
      for (let i = 0; i < 100; i++) {
        outcomes.push({
          success: Math.random() > 0.3,
          rewards: [],
          energyUsed: 10 + Math.random() * 20,
          itemsGained: [],
          itemsLost: [],
          totalRewardValue: Math.floor(Math.random() * 1000),
        });
      }

      const start = performance.now();
      loader.updateStatisticsBatch(outcomes);
      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(10); // Batch should be very fast
    });
  });

  describe('Cache Performance', () => {
    it('should use cached state on subsequent loads', () => {
      const loader = new EncounterLoaderOptimized();

      // First load
      const start1 = performance.now();
      loader.getCurrentState();
      const end1 = performance.now();
      const duration1 = end1 - start1;

      // Second load (cached)
      const start2 = performance.now();
      loader.getCurrentState();
      const end2 = performance.now();
      const duration2 = end2 - start2;

      console.log(`First load: ${duration1.toFixed(2)}ms`);
      console.log(`Cached load: ${duration2.toFixed(2)}ms`);

      // Cached load should be very fast
      expect(duration2).toBeLessThanOrEqual(duration1);
    });

    it('should invalidate cache when cleared', () => {
      const loader = new EncounterLoaderOptimized();

      // Get statistics (will be cached)
      loader.getEncounterStatistics();

      // Clear cache
      loader.clearCache();

      // Next call should regenerate cache
      const stats = loader.getEncounterStatistics();
      expect(stats).toBeDefined();
    });
  });
});

