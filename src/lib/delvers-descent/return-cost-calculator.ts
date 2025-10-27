import { type ShortcutInfo } from './shortcut-manager';

export interface ReturnCostCalculatorConfig {
  baseMultiplier?: number;
  exponent?: number;
  shortcutReductionFactor?: number;
}

export class ReturnCostCalculator {
  private readonly baseMultiplier: number;
  private readonly exponent: number;
  private readonly shortcutReductionFactor: number;

  constructor(config: ReturnCostCalculatorConfig = {}) {
    this.baseMultiplier = Math.max(0.1, config.baseMultiplier ?? 5); // Clamp to positive values
    this.exponent = Math.max(0.1, config.exponent ?? 1.5); // Clamp to positive values
    this.shortcutReductionFactor = Math.max(
      0,
      Math.min(1, config.shortcutReductionFactor ?? 0.3)
    ); // Clamp to 0-1 range
  }

  /**
   * Calculate the base return cost for a single depth level using exponential scaling
   * Formula: baseMultiplier * depth^exponent
   */
  calculateBaseReturnCost(depth: number): number {
    if (depth <= 0) {
      return 0;
    }

    return this.baseMultiplier * Math.pow(depth, this.exponent);
  }

  /**
   * Calculate cumulative return cost from current depth to surface
   * Sums up base costs for all depth levels from current depth down to surface (depth 1)
   */
  calculateCumulativeReturnCost(currentDepth: number): number {
    if (currentDepth <= 0) {
      return 0;
    }

    let totalCost = 0;
    for (let depth = 1; depth <= currentDepth; depth++) {
      totalCost += this.calculateBaseReturnCost(depth);
    }

    return totalCost;
  }

  /**
   * Calculate return cost with shortcut reductions applied
   * @param currentDepth - The current depth level
   * @param availableShortcuts - Array of shortcut IDs that are available
   * @param shortcutMap - Optional map of shortcut details (defaults to simple 70% reduction)
   */
  calculateReturnCostWithShortcuts(
    currentDepth: number,
    availableShortcuts: string[] = [],
    shortcutMap?: Map<string, ShortcutInfo>
  ): number {
    const baseCost = this.calculateCumulativeReturnCost(currentDepth);

    if (!availableShortcuts || availableShortcuts.length === 0) {
      return baseCost;
    }

    // If no shortcut map provided, apply default reduction factor to all shortcuts
    if (!shortcutMap) {
      return baseCost * this.shortcutReductionFactor;
    }

    // Calculate cost reduction based on specific shortcut information
    let totalReduction = 0;
    let shortcutsApplied = 0;

    for (const shortcutId of availableShortcuts) {
      const shortcut = shortcutMap.get(shortcutId);
      if (shortcut && shortcut.depth <= currentDepth) {
        totalReduction += shortcut.reductionFactor;
        shortcutsApplied++;
      }
    }

    // If no shortcuts apply, return full cost
    if (shortcutsApplied === 0) {
      return baseCost;
    }

    // Apply average reduction factor
    const averageReduction = totalReduction / shortcutsApplied;
    return baseCost * (1 - averageReduction);
  }

  /**
   * Calculate the optimal return path considering shortcuts and visited nodes
   * @param currentDepth - Current depth level
   * @param visitedNodes - Array of visited node IDs
   * @param availableShortcuts - Available shortcuts
   * @param shortcutMap - Map of shortcut details
   */
  calculateOptimalReturnCost(
    currentDepth: number,
    options: {
      visitedNodes?: string[];
      availableShortcuts?: string[];
      shortcutMap?: Map<string, ShortcutInfo>;
    } = {}
  ): number {
    const {
      visitedNodes: _visitedNodes = [],
      availableShortcuts = [],
      shortcutMap,
    } = options;
    if (currentDepth <= 0) {
      return 0;
    }

    // If no shortcuts available, return basic cumulative cost
    if (
      !availableShortcuts ||
      availableShortcuts.length === 0 ||
      !shortcutMap
    ) {
      return this.calculateCumulativeReturnCost(currentDepth);
    }

    // Create a map of depth to best shortcut for that depth
    const depthToShortcut = new Map<number, ShortcutInfo>();

    availableShortcuts.forEach((shortcutId) => {
      const shortcut = shortcutMap.get(shortcutId);
      if (shortcut && shortcut.depth <= currentDepth) {
        // Only use shortcuts for depths that have been visited
        // For now, we'll assume that if we're at depth N, we've visited depths 1 through N
        // This could be enhanced to check actual visited node depths
        const existingShortcut = depthToShortcut.get(shortcut.depth);
        if (
          !existingShortcut ||
          shortcut.reductionFactor > existingShortcut.reductionFactor
        ) {
          depthToShortcut.set(shortcut.depth, shortcut);
        }
      }
    });

    // Calculate optimal cost by considering shortcuts at each depth
    let totalCost = 0;

    for (let depth = 1; depth <= currentDepth; depth++) {
      const baseCost = this.calculateBaseReturnCost(depth);
      const shortcut = depthToShortcut.get(depth);

      if (shortcut) {
        // Apply shortcut reduction
        const reductionFactor = 1 - shortcut.reductionFactor;
        totalCost += baseCost * reductionFactor;
      } else {
        // No shortcut available for this depth
        totalCost += baseCost;
      }
    }

    return totalCost;
  }

  /**
   * Get the configuration used by this calculator
   */
  getConfig(): ReturnCostCalculatorConfig {
    return {
      baseMultiplier: this.baseMultiplier,
      exponent: this.exponent,
      shortcutReductionFactor: this.shortcutReductionFactor,
    };
  }

  /**
   * Create a new calculator with updated configuration
   */
  withConfig(
    config: Partial<ReturnCostCalculatorConfig>
  ): ReturnCostCalculator {
    return new ReturnCostCalculator({
      baseMultiplier: config.baseMultiplier ?? this.baseMultiplier,
      exponent: config.exponent ?? this.exponent,
      shortcutReductionFactor:
        config.shortcutReductionFactor ?? this.shortcutReductionFactor,
    });
  }
}
