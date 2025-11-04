import type { EncounterType, Shortcut } from '@/types/delvers-descent';

import { getBalanceManager } from './balance-manager';

export class EnergyCalculator {
  /**
   * Calculate energy cost for a specific node using balance configuration
   * Delegates to BalanceManager for consistent calculations
   */
  calculateNodeCost(depth: number, nodeType: EncounterType): number {
    const balanceManager = getBalanceManager();
    return balanceManager.calculateNodeCost(depth, nodeType);
  }

  /**
   * Calculate return cost from current depth to surface
   * Uses linear tier-based scaling: cost increases every 5 depth levels
   */
  calculateReturnCost(
    currentDepth: number,
    shortcuts: Shortcut[] = []
  ): number {
    if (currentDepth <= 0) {
      return 0;
    }

    const balanceManager = getBalanceManager();
    let cost = 0;
    let depth = currentDepth;

    while (depth > 0) {
      const shortcut = shortcuts.find((s) => s.fromDepth === depth);

      if (shortcut) {
        // Use shortcut - apply reduction
        const baseCost = balanceManager.calculateReturnCost(depth);
        const shortcutCost = Math.max(1, baseCost - shortcut.energyReduction);
        cost += shortcutCost;
        depth = shortcut.toDepth;
      } else {
        // Normal descent
        cost += balanceManager.calculateReturnCost(depth);
        depth--;
      }
    }

    return Math.round(cost);
  }

  /**
   * Calculate safety margin for risk assessment
   * Returns the amount of energy above the return cost
   */
  calculateSafetyMargin(energy: number, returnCost: number): number {
    return Math.max(0, energy - returnCost);
  }

  /**
   * Apply shortcut reduction to a cost
   * Shortcuts provide 70% reduction (30% of original cost)
   */
  applyShortcutReduction(cost: number, shortcuts: Shortcut[]): number {
    if (shortcuts.length === 0) {
      return cost;
    }

    // Find the most beneficial shortcut
    const _bestShortcut = shortcuts.reduce((best, current) => {
      const currentReduction = current.energyReduction;
      const bestReduction = best.energyReduction;
      return currentReduction > bestReduction ? current : best;
    });

    const reducedCost = cost * 0.3; // 70% reduction
    return Math.max(1, Math.round(reducedCost));
  }

  /**
   * Check if player can afford to return to surface
   */
  canAffordReturn(energy: number, returnCost: number): boolean {
    return energy >= returnCost;
  }

  /**
   * Calculate point of no return
   * Returns the minimum energy needed to safely return
   */
  calculatePointOfNoReturn(
    returnCost: number,
    safetyBuffer: number = 10
  ): number {
    return returnCost + safetyBuffer;
  }

  /**
   * Calculate energy efficiency rating
   * Higher rating means better energy usage
   */
  calculateEnergyEfficiency(energyUsed: number, rewardsGained: number): number {
    if (energyUsed <= 0) {
      return 0;
    }

    return Math.round((rewardsGained / energyUsed) * 100);
  }

  /**
   * Calculate optimal depth for current energy
   * Returns the deepest depth the player can safely reach
   */
  calculateOptimalDepth(energy: number, shortcuts: Shortcut[] = []): number {
    let depth = 1;

    while (depth <= 20) {
      // Reasonable maximum depth
      const returnCost = this.calculateReturnCost(depth, shortcuts);
      if (returnCost > energy) {
        break;
      }
      depth++;
    }

    return Math.max(1, depth - 1);
  }

  /**
   * Calculate energy cost for a complete path
   */
  calculatePathCost(pathDepths: number[], shortcuts: Shortcut[] = []): number {
    let totalCost = 0;

    for (let i = 0; i < pathDepths.length; i++) {
      const depth = pathDepths[i];
      const nodeCost = this.calculateNodeCost(depth, 'puzzle_chamber'); // Default type
      totalCost += nodeCost;

      // Add return cost if this is the deepest point
      if (i === pathDepths.length - 1) {
        totalCost += this.calculateReturnCost(depth, shortcuts);
      }
    }

    return totalCost;
  }

  /**
   * Calculate energy savings from using shortcuts
   */
  calculateShortcutSavings(
    normalReturnCost: number,
    shortcutReturnCost: number
  ): number {
    return Math.max(0, normalReturnCost - shortcutReturnCost);
  }

  /**
   * Calculate risk level based on energy remaining
   * Returns a value from 0 (safe) to 100 (critical)
   */
  calculateRiskLevel(energy: number, returnCost: number): number {
    if (energy <= 0) {
      return 100; // Critical - no energy
    }

    if (energy < returnCost) {
      return 100; // Critical - can't return
    }

    const safetyMargin = this.calculateSafetyMargin(energy, returnCost);
    const riskPercentage = Math.max(0, 100 - (safetyMargin / returnCost) * 100);

    return Math.round(Math.min(100, riskPercentage));
  }

  /**
   * Calculate recommended action based on current state
   */
  getRecommendedAction(
    energy: number,
    returnCost: number,
    currentDepth: number
  ): {
    action: 'continue' | 'return' | 'rest';
    reason: string;
    riskLevel: number;
  } {
    const riskLevel = this.calculateRiskLevel(energy, returnCost);
    const safetyMargin = this.calculateSafetyMargin(energy, returnCost);

    if (riskLevel >= 80) {
      return {
        action: 'return',
        reason: 'Critical energy levels - immediate return recommended',
        riskLevel,
      };
    }

    if (riskLevel >= 60) {
      return {
        action: 'return',
        reason: 'High risk - consider returning to surface',
        riskLevel,
      };
    }

    if (safetyMargin < 20 && currentDepth > 3) {
      return {
        action: 'return',
        reason: 'Low safety margin at significant depth',
        riskLevel,
      };
    }

    if (energy > returnCost * 2) {
      return {
        action: 'continue',
        reason: 'Safe to continue exploring',
        riskLevel,
      };
    }

    return {
      action: 'rest',
      reason: 'Consider resting to recover energy',
      riskLevel,
    };
  }

  /**
   * Calculate energy regeneration rate
   * Used for rest sites
   */
  calculateRegenerationRate(
    baseRate: number = 5,
    modifiers: number = 0
  ): number {
    return Math.max(1, baseRate + modifiers);
  }

  /**
   * Calculate energy cost for backtracking
   * Moving to a previous depth costs less energy
   */
  calculateBacktrackCost(fromDepth: number, toDepth: number): number {
    if (toDepth >= fromDepth) {
      return 0; // Not backtracking
    }

    const depthDifference = fromDepth - toDepth;
    const cost = depthDifference * 2; // 2 energy per depth level
    return Math.max(1, cost); // Minimum cost of 1
  }

  /**
   * Calculate total energy budget for a run
   * Includes base energy plus any bonuses
   */
  calculateTotalEnergyBudget(
    baseEnergy: number,
    bonuses: {
      streakBonus?: number;
      collectionBonus?: number;
      regionBonus?: number;
    } = {}
  ): number {
    let total = baseEnergy;

    if (bonuses.streakBonus) {
      total += bonuses.streakBonus;
    }

    if (bonuses.collectionBonus) {
      total += bonuses.collectionBonus;
    }

    if (bonuses.regionBonus) {
      total += bonuses.regionBonus;
    }

    return Math.max(0, total);
  }

  /**
   * Validate energy calculations
   */
  validateEnergyCalculations(
    energy: number,
    returnCost: number
  ): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (energy < 0) {
      errors.push('Energy cannot be negative');
    }

    if (returnCost < 0) {
      errors.push('Return cost cannot be negative');
    }

    if (energy > 100000) {
      errors.push('Energy value seems unreasonably high');
    }

    if (returnCost > 100000) {
      errors.push('Return cost seems unreasonably high');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Singleton instance
let energyCalculatorInstance: EnergyCalculator;

export function getEnergyCalculator(): EnergyCalculator {
  if (!energyCalculatorInstance) {
    energyCalculatorInstance = new EnergyCalculator();
  }
  return energyCalculatorInstance;
}
