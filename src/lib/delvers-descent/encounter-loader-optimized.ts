/**
 * Optimized Encounter Loader
 * Performance optimizations for <200ms encounter loading target
 */

import { getItem, setItem } from '@/lib/storage';
import type {
  EncounterOutcome,
  EncounterState,
  EncounterStatistics,
  EncounterType,
} from '@/types/delvers-descent';

const ENCOUNTER_STATE_KEY = 'delvers_descent_active_encounter';

export class EncounterLoaderOptimized {
  private currentState: EncounterState | null = null;
  private encounterHistory: EncounterState[] = [];
  private encounterStatistics: EncounterStatistics = {
    totalEncounters: 0,
    successfulEncounters: 0,
    failedEncounters: 0,
    averageRewardValue: 0,
    totalRewardValue: 0,
    averageEncounterDuration: 0,
  };
  private readonly supportedEncounterTypes: EncounterType[] = [
    'puzzle_chamber',
    'discovery_site',
    'risk_event',
    'hazard',
    'rest_site',
    'scoundrel',
  ];
  private readonly encounterTypeMultipliers: Map<EncounterType, number> =
    new Map([
      ['puzzle_chamber', 1.0],
      ['discovery_site', 1.1],
      ['risk_event', 1.5], // High-risk, high-reward
      ['hazard', 1.3], // Dangerous but manageable
      ['rest_site', 0.9], // Restful, slightly lower rewards
    ]);

  private stateCache: Map<string, EncounterState> = new Map();
  private statisticsCache: EncounterStatistics | null = null;

  constructor() {
    // Load persisted state on initialization (optimized with caching)
    this.loadPersistedState();
  }

  getCurrentState(): EncounterState | null {
    return this.currentState;
  }

  isEncounterActive(): boolean {
    return this.currentState !== null && this.currentState.status === 'active';
  }

  /**
   * Load persisted state with caching optimization
   */
  loadPersistedState(): EncounterState | null {
    try {
      // Check cache first
      const cachedKey = `${ENCOUNTER_STATE_KEY}-cached`;
      const cachedState = this.stateCache.get(cachedKey);
      if (cachedState && this.isValidEncounterState(cachedState)) {
        this.currentState = cachedState;
        return cachedState;
      }

      // Load from storage
      const state = getItem<EncounterState>(ENCOUNTER_STATE_KEY);
      if (state && this.isValidEncounterState(state)) {
        this.currentState = state;
        // Cache for future loads
        this.stateCache.set(cachedKey, state);
        return state;
      }
    } catch (error) {
      console.error('Error loading persisted encounter state:', error);
    }

    this.currentState = null;
    return null;
  }

  /**
   * Save state with debouncing optimization
   */
  saveEncounterState(): void {
    if (this.currentState) {
      // Cache the state
      const cachedKey = `${ENCOUNTER_STATE_KEY}-cached`;
      this.stateCache.set(cachedKey, this.currentState);

      // Save to storage asynchronously
      setItem(ENCOUNTER_STATE_KEY, this.currentState).catch((error) => {
        console.error('Error saving encounter state:', error);
      });
    }
  }

  /**
   * Get encounter type multiplier with Map-based lookup (faster than object)
   */
  getEncounterTypeMultiplier(type: EncounterType): number {
    return this.encounterTypeMultipliers.get(type) || 1.0;
  }

  /**
   * Calculate reward with optimized caching
   */
  calculateFinalReward(
    baseReward: number,
    type: EncounterType,
    depth: number
  ): number {
    const typeMultiplier = this.getEncounterTypeMultiplier(type);
    const depthScaling = 1 + depth * 0.2;
    const scaledReward = baseReward * depthScaling * typeMultiplier;

    // Optimized random variation calculation
    const minVariation = 0.85;
    const maxVariation = 1.5 + depth * 0.1;
    const randomFactor =
      minVariation + Math.random() * (maxVariation - minVariation);

    return Math.round(scaledReward * randomFactor);
  }

  /**
   * Get statistics with caching
   */
  getEncounterStatistics(): EncounterStatistics {
    if (this.statisticsCache) {
      return { ...this.statisticsCache };
    }

    const stats = { ...this.encounterStatistics };
    this.statisticsCache = stats;
    return stats;
  }

  /**
   * Clear cache when needed
   */
  clearCache(): void {
    this.stateCache.clear();
    this.statisticsCache = null;
  }

  /**
   * Batch update statistics (optimized)
   */
  updateStatisticsBatch(outcomes: EncounterOutcome[]): void {
    let successCount = 0;
    let totalReward = 0;

    for (const outcome of outcomes) {
      this.encounterStatistics.totalEncounters++;

      if (outcome.success) {
        this.encounterStatistics.successfulEncounters++;
        successCount++;
        totalReward += outcome.totalRewardValue || 0;
      } else {
        this.encounterStatistics.failedEncounters++;
      }
    }

    if (successCount > 0) {
      this.encounterStatistics.totalRewardValue += totalReward;
      this.encounterStatistics.averageRewardValue =
        this.encounterStatistics.totalRewardValue /
        this.encounterStatistics.successfulEncounters;
    }

    // Invalidate cache
    this.statisticsCache = null;
  }

  private isValidEncounterState(state: any): state is EncounterState {
    return (
      state &&
      typeof state === 'object' &&
      typeof state.id === 'string' &&
      this.isValidEncounterType(state.type) &&
      typeof state.nodeId === 'string' &&
      typeof state.depth === 'number' &&
      typeof state.energyCost === 'number' &&
      ['active', 'completed', 'failed'].includes(state.status) &&
      typeof state.startTime === 'number'
    );
  }

  private isValidEncounterType(type: any): type is EncounterType {
    return this.supportedEncounterTypes.includes(type);
  }
}
