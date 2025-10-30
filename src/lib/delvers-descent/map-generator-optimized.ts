/**
 * Optimized Dungeon Map Generator
 * Performance optimizations for <50ms map generation target
 */

import type {
  DungeonNode,
  EncounterType,
  Shortcut,
} from '@/types/delvers-descent';

import { DEFAULT_BALANCE_CONFIG } from './balance-config';
import { ReturnCostCalculator } from './return-cost-calculator';

export class DungeonMapGeneratorOptimized {
  private readonly encounterTypes: EncounterType[] = [
    'puzzle_chamber',
    'trade_opportunity',
    'discovery_site',
    'risk_event',
    'hazard',
    'rest_site',
  ];
  private readonly returnCostCalculator: ReturnCostCalculator;
  private readonly encounterWeights: { type: EncounterType; weight: number }[];
  private readonly encounterTotalWeight: number;
  private readonly regionKey?: string;

  constructor(config?: {
    baseMultiplier?: number;
    exponent?: number;
    regionKey?: string;
  }) {
    this.returnCostCalculator = new ReturnCostCalculator({
      baseMultiplier: config?.baseMultiplier ?? 5,
      exponent: config?.exponent ?? 1.5,
    });
    this.regionKey = config?.regionKey;

    // Initialize weighted distribution from balance config (region-aware)
    const regionDist = this.regionKey
      ? DEFAULT_BALANCE_CONFIG.region.encounterDistributions[this.regionKey]
      : undefined;
    const dist =
      regionDist ||
      DEFAULT_BALANCE_CONFIG.region.encounterDistributions.default ||
      DEFAULT_BALANCE_CONFIG.encounter.encounterDistribution;
    const weights: { type: EncounterType; weight: number }[] = [
      { type: 'puzzle_chamber' as EncounterType, weight: dist.puzzle_chamber },
      {
        type: 'trade_opportunity' as EncounterType,
        weight: dist.trade_opportunity,
      },
      { type: 'discovery_site' as EncounterType, weight: dist.discovery_site },
      { type: 'risk_event' as EncounterType, weight: dist.risk_event },
      { type: 'hazard' as EncounterType, weight: dist.hazard },
      { type: 'rest_site' as EncounterType, weight: dist.rest_site },
    ].filter((w) => w.weight > 0);

    this.encounterWeights = weights;
    this.encounterTotalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  }

  /**
   * Generate a complete dungeon map with specified maximum depth
   * Optimized for <50ms performance
   */
  generateFullMap(maxDepth: number): DungeonNode[] {
    if (maxDepth < 1) {
      throw new Error('Maximum depth must be at least 1');
    }

    const allNodes: DungeonNode[] = [];
    const nodesByDepth: Map<number, DungeonNode[]> = new Map();

    // Generate all depth levels with depth-based caching
    for (let depth = 1; depth <= maxDepth; depth++) {
      const depthNodes = this.generateDepthLevel(depth);
      nodesByDepth.set(depth, depthNodes);
      allNodes.push(...depthNodes);
    }

    // Create connections between depth levels (optimized with pre-computed nodes)
    this.createNodeConnectionsOptimized(allNodes, nodesByDepth, maxDepth);

    // Add shortcuts
    const shortcuts = this.addShortcuts(allNodes, maxDepth);

    // Update return costs with shortcuts
    this.updateReturnCostsWithShortcuts(allNodes, shortcuts);

    return allNodes;
  }

  /**
   * Generate a single depth level with 2-3 nodes
   */
  private generateDepthLevel(depth: number): DungeonNode[] {
    if (depth < 1) {
      throw new Error('Depth must be at least 1');
    }

    const nodeCount = Math.floor(Math.random() * 2) + 2; // 2-3 nodes

    const nodes: DungeonNode[] = [];

    for (let position = 0; position < nodeCount; position++) {
      const node: DungeonNode = {
        id: `depth${depth}-node${position}`,
        depth,
        position,
        type: this.pickWeightedEncounterType(),
        energyCost: this.calculateNodeCost(depth),
        returnCost: this.calculateReturnCost(depth),
        isRevealed: false,
        connections: [],
      };

      nodes.push(node);
    }

    return nodes;
  }

  /**
   * Create connections between depth levels (optimized)
   * Uses pre-computed nodesByDepth Map to avoid repeated filtering
   */
  private createNodeConnectionsOptimized(
    allNodes: DungeonNode[],
    nodesByDepth: Map<number, DungeonNode[]>,
    maxDepth: number
  ): void {
    for (let depth = 1; depth < maxDepth; depth++) {
      const currentDepthNodes = nodesByDepth.get(depth) || [];
      const nextDepthNodes = nodesByDepth.get(depth + 1) || [];

      // Ensure every node in next depth has at least one incoming connection
      const connectedNextNodes = new Set<string>();

      // First pass: ensure every next depth node gets at least one connection
      nextDepthNodes.forEach((nextNode) => {
        if (!connectedNextNodes.has(nextNode.id)) {
          const randomCurrentNode =
            currentDepthNodes[
              Math.floor(Math.random() * currentDepthNodes.length)
            ];
          randomCurrentNode.connections.push(nextNode.id);
          connectedNextNodes.add(nextNode.id);
        }
      });

      // Second pass: add additional random connections
      currentDepthNodes.forEach((currentNode) => {
        const additionalConnections = Math.floor(Math.random() * 2); // 0-1 additional connections
        const connectionsSet = new Set(currentNode.connections);

        let addedCount = 0;
        for (
          let i = 0;
          i < nextDepthNodes.length && addedCount < additionalConnections;
          i++
        ) {
          const candidate = nextDepthNodes[i];
          if (!connectionsSet.has(candidate.id)) {
            currentNode.connections.push(candidate.id);
            connectionsSet.add(candidate.id);
            addedCount++;
          }
        }
      });
    }
  }

  /**
   * Add shortcuts to the dungeon (5-10% probability per depth)
   */
  private addShortcuts(allNodes: DungeonNode[], maxDepth: number): Shortcut[] {
    const shortcuts: Shortcut[] = [];

    for (let depth = 2; depth <= maxDepth; depth++) {
      const shortcutProbability = Math.random();

      // 5-10% chance per depth level
      if (shortcutProbability < 0.075) {
        // Average of 5% and 10%
        const shortcut: Shortcut = {
          id: `shortcut-depth${depth}`,
          fromDepth: depth,
          toDepth: Math.floor(Math.random() * (depth - 1)) + 1, // Random depth above
          energyReduction: Math.floor(Math.random() * 20) + 10, // 10-30 energy reduction
          isPermanent: true,
        };

        shortcuts.push(shortcut);
      }
    }

    return shortcuts;
  }

  /**
   * Update return costs considering shortcuts
   */
  private updateReturnCostsWithShortcuts(
    allNodes: DungeonNode[],
    shortcuts: Shortcut[]
  ): void {
    allNodes.forEach((node) => {
      node.returnCost = this.calculateReturnCostWithShortcuts(
        node.depth,
        shortcuts
      );
    });
  }

  /**
   * Calculate node energy cost based on depth
   */
  private calculateNodeCost(depth: number): number {
    // Base cost increases with depth: 5-25 energy
    const baseCost = 5 + (depth - 1) * 2;
    const variation = Math.floor(Math.random() * 6) - 3; // -3 to +3 variation
    return Math.max(5, baseCost + variation);
  }

  /**
   * Calculate return cost from current depth to surface
   * Now uses ReturnCostCalculator for consistency
   */
  private calculateReturnCost(depth: number): number {
    return Math.round(
      this.returnCostCalculator.calculateCumulativeReturnCost(depth)
    );
  }

  /**
   * Calculate return cost considering shortcuts
   */
  private calculateReturnCostWithShortcuts(
    depth: number,
    shortcuts: Shortcut[]
  ): number {
    let cost = 0;
    let currentDepth = depth;

    while (currentDepth > 0) {
      const shortcut = shortcuts.find((s) => s.fromDepth === currentDepth);

      if (shortcut) {
        // Use shortcut
        const shortcutCost =
          5 * Math.pow(currentDepth, 1.5) - shortcut.energyReduction;
        cost += Math.max(1, shortcutCost); // Minimum cost of 1
        currentDepth = shortcut.toDepth;
      } else {
        // Normal descent
        cost += 5 * Math.pow(currentDepth, 1.5);
        currentDepth--;
      }
    }

    return Math.round(cost);
  }

  /**
   * Inline Fisher-Yates shuffle algorithm (optimized)
   */
  private shuffleArrayInline<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Pick an encounter type based on configured weights
   */
  private pickWeightedEncounterType(): EncounterType {
    if (!this.encounterWeights.length || this.encounterTotalWeight <= 0) {
      const fallback = [...this.encounterTypes];
      return fallback[Math.floor(Math.random() * fallback.length)];
    }

    const r = Math.random() * this.encounterTotalWeight;
    let cumulative = 0;
    for (let i = 0; i < this.encounterWeights.length; i++) {
      cumulative += this.encounterWeights[i].weight;
      if (r <= cumulative) {
        return this.encounterWeights[i].type;
      }
    }
    return this.encounterWeights[this.encounterWeights.length - 1].type;
  }

  /**
   * Validate map structure
   */
  validateMap(allNodes: DungeonNode[]): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check for duplicate IDs
    const ids = new Set<string>();
    for (const node of allNodes) {
      if (ids.has(node.id)) {
        errors.push(`Duplicate node ID: ${node.id}`);
      }
      ids.add(node.id);
    }

    // Check for orphaned connections
    const nodeMap = new Map<string, DungeonNode>();
    for (const node of allNodes) {
      nodeMap.set(node.id, node);
    }

    for (const node of allNodes) {
      for (const connectionId of node.connections) {
        if (!nodeMap.has(connectionId)) {
          errors.push(
            `Node ${node.id} has invalid connection to ${connectionId}`
          );
        }
      }
    }

    // Check for surface nodes (depth 1)
    const surfaceNodes = allNodes.filter((node) => node.depth === 1);
    if (surfaceNodes.length === 0) {
      errors.push('No surface nodes found (depth 1)');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
