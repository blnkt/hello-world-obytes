import type {
  DungeonNode,
  EncounterType,
  Shortcut,
} from '@/types/delvers-descent';

import { DEFAULT_BALANCE_CONFIG } from './balance-config';
import { type RegionManager } from './region-manager';
import { REGIONS } from './regions';
import { ReturnCostCalculator } from './return-cost-calculator';

export class DungeonMapGenerator {
  private readonly encounterTypes: EncounterType[] = [
    'puzzle_chamber',
    'discovery_site',
    'risk_event',
    'hazard',
    'rest_site',
    'safe_passage',
    'region_shortcut',
    'scoundrel',
  ];
  private readonly returnCostCalculator: ReturnCostCalculator;
  private readonly encounterWeights: { type: EncounterType; weight: number }[];
  private readonly encounterTotalWeight: number;
  private readonly regionKey?: string;
  private readonly regionManager?: RegionManager;

  constructor(config?: {
    baseMultiplier?: number;
    exponent?: number;
    regionKey?: string;
    regionManager?: RegionManager;
  }) {
    this.returnCostCalculator = new ReturnCostCalculator({
      baseMultiplier: config?.baseMultiplier ?? 5,
      exponent: config?.exponent ?? 1.5,
    });
    this.regionKey = config?.regionKey;
    this.regionManager = config?.regionManager;

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
      { type: 'discovery_site' as EncounterType, weight: dist.discovery_site },
      { type: 'risk_event' as EncounterType, weight: dist.risk_event },
      { type: 'hazard' as EncounterType, weight: dist.hazard },
      { type: 'rest_site' as EncounterType, weight: dist.rest_site },
      { type: 'safe_passage' as EncounterType, weight: dist.safe_passage },
      {
        type: 'region_shortcut' as EncounterType,
        weight: dist.region_shortcut,
      },
      { type: 'scoundrel' as EncounterType, weight: dist.scoundrel },
    ].filter((w) => w.weight > 0);

    this.encounterWeights = weights;
    this.encounterTotalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  }

  /**
   * Generate a single depth level with 2-3 nodes
   * Overload: optionally provide a regionKey to apply regional distribution for this depth
   */
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  generateDepthLevel(depth: number): Promise<DungeonNode[]>;
  generateDepthLevel(depth: number, regionKey?: string): Promise<DungeonNode[]>;
  async generateDepthLevel(
    depth: number,
    regionKey?: string
  ): Promise<DungeonNode[]> {
    if (depth < 1) {
      throw new Error('Depth must be at least 1');
    }

    const nodeCount = Math.floor(Math.random() * 2) + 2; // 2-3 nodes
    // Select encounter types using weighted distribution (region-aware per call)
    const { weights, total } = await this.getWeightsForRegion(regionKey);

    const nodes: DungeonNode[] = [];

    for (let position = 0; position < nodeCount; position++) {
      const node: DungeonNode = {
        id: `depth${depth}-node${position}`,
        depth,
        position,
        type: this.pickWeightedEncounterType(weights, total),
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
   * Generate a complete dungeon map with specified maximum depth
   */
  async generateFullMap(maxDepth: number): Promise<DungeonNode[]> {
    if (maxDepth < 1) {
      throw new Error('Maximum depth must be at least 1');
    }

    const allNodes: DungeonNode[] = [];

    // Generate all depth levels
    for (let depth = 1; depth <= maxDepth; depth++) {
      const depthNodes = await this.generateDepthLevel(depth);
      allNodes.push(...depthNodes);
    }

    // Create connections between depth levels
    this.createNodeConnections(allNodes, maxDepth);

    // Add shortcuts
    const shortcuts = this.addShortcuts(allNodes, maxDepth);

    // Update return costs with shortcuts
    this.updateReturnCostsWithShortcuts(allNodes, shortcuts);

    return allNodes;
  }

  /**
   * Create connections between depth levels
   */
  private createNodeConnections(
    allNodes: DungeonNode[],
    maxDepth: number
  ): void {
    for (let depth = 1; depth < maxDepth; depth++) {
      const currentDepthNodes = allNodes.filter((node) => node.depth === depth);
      const nextDepthNodes = allNodes.filter(
        (node) => node.depth === depth + 1
      );

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
        const availableNextNodes = nextDepthNodes.filter(
          (node) => !currentNode.connections.includes(node.id)
        );
        const shuffledAvailable = this.shuffleArray([...availableNextNodes]);

        for (
          let i = 0;
          i < Math.min(additionalConnections, shuffledAvailable.length);
          i++
        ) {
          currentNode.connections.push(shuffledAvailable[i].id);
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
   * Fisher-Yates shuffle algorithm
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Pick an encounter type based on configured weights
   */
  private pickWeightedEncounterType(
    weights: { type: EncounterType; weight: number }[],
    total: number
  ): EncounterType {
    // Fallback to uniform if misconfigured
    if (!weights.length || total <= 0) {
      const shuffled = this.shuffleArray([...this.encounterTypes]);
      return shuffled[0];
    }

    const r = Math.random() * total;
    let cumulative = 0;
    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i].weight;
      if (r <= cumulative) {
        return weights[i].type;
      }
    }
    return weights[weights.length - 1].type;
  }

  /**
   * Check if all regions are unlocked
   */
  private async areAllRegionsUnlocked(): Promise<boolean> {
    if (!this.regionManager) {
      return false; // Can't determine if all unlocked without RegionManager
    }

    for (const region of REGIONS) {
      const isUnlocked = await this.regionManager.isRegionUnlocked(region.id);
      if (!isUnlocked) {
        return false;
      }
    }

    return true;
  }

  /**
   * Resolve weights for a given region key, falling back to instance defaults
   * Excludes discovery_site when all regions are unlocked
   */
  private async getWeightsForRegion(regionKey?: string): Promise<{
    weights: { type: EncounterType; weight: number }[];
    total: number;
  }> {
    let weights: { type: EncounterType; weight: number }[];

    if (!regionKey || regionKey === this.regionKey) {
      // Use instance weights
      weights = [...this.encounterWeights];
    } else {
      // Get region-specific distribution
      const regionDist =
        DEFAULT_BALANCE_CONFIG.region.encounterDistributions[regionKey];
      const dist =
        regionDist ||
        DEFAULT_BALANCE_CONFIG.region.encounterDistributions.default ||
        DEFAULT_BALANCE_CONFIG.encounter.encounterDistribution;
      weights = [
        {
          type: 'puzzle_chamber' as EncounterType,
          weight: dist.puzzle_chamber,
        },
        {
          type: 'discovery_site' as EncounterType,
          weight: dist.discovery_site,
        },
        { type: 'risk_event' as EncounterType, weight: dist.risk_event },
        { type: 'hazard' as EncounterType, weight: dist.hazard },
        { type: 'rest_site' as EncounterType, weight: dist.rest_site },
        { type: 'safe_passage' as EncounterType, weight: dist.safe_passage },
        {
          type: 'region_shortcut' as EncounterType,
          weight: dist.region_shortcut,
        },
        { type: 'scoundrel' as EncounterType, weight: dist.scoundrel },
      ];
    }

    // Filter out zero weights first
    weights = weights.filter((w) => w.weight > 0);

    // Exclude discovery_site if all regions are unlocked
    const allUnlocked = await this.areAllRegionsUnlocked();
    if (allUnlocked) {
      weights = weights.filter((w) => w.type !== 'discovery_site');
    }

    // Recalculate total after filtering
    const total = weights.reduce((sum, w) => sum + w.weight, 0);
    return { weights, total };
  }

  /**
   * Get nodes at a specific depth
   */
  getNodesAtDepth(allNodes: DungeonNode[], depth: number): DungeonNode[] {
    return allNodes.filter((node) => node.depth === depth);
  }

  /**
   * Get nodes connected to a specific node
   */
  getConnectedNodes(allNodes: DungeonNode[], nodeId: string): DungeonNode[] {
    const node = allNodes.find((n) => n.id === nodeId);
    if (!node) {
      return [];
    }

    return allNodes.filter((n) => node.connections.includes(n.id));
  }

  /**
   * Get all possible paths from surface to a specific depth
   */
  getPathsToDepth(allNodes: DungeonNode[], targetDepth: number): string[][] {
    const paths: string[][] = [];
    const surfaceNodes = this.getNodesAtDepth(allNodes, 1);

    surfaceNodes.forEach((surfaceNode) => {
      this.findPathsFromNode({
        allNodes,
        currentNodeId: surfaceNode.id,
        targetDepth,
        currentPath: [surfaceNode.id],
        allPaths: paths,
      });
    });

    return paths;
  }

  /**
   * Recursively find paths from a node to target depth
   */
  private findPathsFromNode(params: {
    allNodes: DungeonNode[];
    currentNodeId: string;
    targetDepth: number;
    currentPath: string[];
    allPaths: string[][];
  }): void {
    const { allNodes, currentNodeId, targetDepth, currentPath, allPaths } =
      params;
    const currentNode = allNodes.find((n) => n.id === currentNodeId);
    if (!currentNode) return;

    if (currentNode.depth === targetDepth) {
      allPaths.push([...currentPath]);
      return;
    }

    if (currentNode.depth > targetDepth) {
      return; // Can't go deeper than target
    }

    currentNode.connections.forEach((connectedNodeId) => {
      if (!currentPath.includes(connectedNodeId)) {
        this.findPathsFromNode({
          allNodes,
          currentNodeId: connectedNodeId,
          targetDepth,
          currentPath: [...currentPath, connectedNodeId],
          allPaths,
        });
      }
    });
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
    const ids = allNodes.map((node) => node.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      errors.push('Duplicate node IDs found');
    }

    // Check for orphaned connections
    allNodes.forEach((node) => {
      node.connections.forEach((connectionId) => {
        const connectedNode = allNodes.find((n) => n.id === connectionId);
        if (!connectedNode) {
          errors.push(
            `Node ${node.id} has invalid connection to ${connectionId}`
          );
        }
      });
    });

    // Check for surface nodes (depth 1)
    const surfaceNodes = allNodes.filter((node) => node.depth === 1);
    if (surfaceNodes.length === 0) {
      errors.push('No surface nodes found (depth 1)');
    }

    // Check for unreachable nodes
    const reachableNodes = new Set<string>();
    surfaceNodes.forEach((surfaceNode) => {
      this.markReachableNodes(allNodes, surfaceNode.id, reachableNodes);
    });

    allNodes.forEach((node) => {
      if (!reachableNodes.has(node.id)) {
        errors.push(`Node ${node.id} is unreachable from surface`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Mark all reachable nodes from a starting node
   */
  private markReachableNodes(
    allNodes: DungeonNode[],
    startNodeId: string,
    reachableNodes: Set<string>
  ): void {
    if (reachableNodes.has(startNodeId)) {
      return; // Already visited
    }

    reachableNodes.add(startNodeId);

    const startNode = allNodes.find((n) => n.id === startNodeId);
    if (startNode) {
      startNode.connections.forEach((connectedNodeId) => {
        this.markReachableNodes(allNodes, connectedNodeId, reachableNodes);
      });
    }
  }

  /**
   * Get map statistics
   */
  getMapStatistics(allNodes: DungeonNode[]): {
    totalNodes: number;
    maxDepth: number;
    nodesPerDepth: { [depth: number]: number };
    encounterTypeDistribution: { [type: string]: number };
    averageConnectionsPerNode: number;
  } {
    const maxDepth = Math.max(...allNodes.map((node) => node.depth));
    const nodesPerDepth: { [depth: number]: number } = {};
    const encounterTypeDistribution: { [type: string]: number } = {};

    // Count nodes per depth
    for (let depth = 1; depth <= maxDepth; depth++) {
      nodesPerDepth[depth] = allNodes.filter(
        (node) => node.depth === depth
      ).length;
    }

    // Count encounter types
    this.encounterTypes.forEach((type) => {
      encounterTypeDistribution[type] = allNodes.filter(
        (node) => node.type === type
      ).length;
    });

    // Calculate average connections
    const totalConnections = allNodes.reduce(
      (sum, node) => sum + node.connections.length,
      0
    );
    const averageConnectionsPerNode =
      allNodes.length > 0 ? totalConnections / allNodes.length : 0;

    return {
      totalNodes: allNodes.length,
      maxDepth,
      nodesPerDepth,
      encounterTypeDistribution,
      averageConnectionsPerNode,
    };
  }
}

// Singleton instance
let dungeonMapGeneratorInstance: DungeonMapGenerator;

export function getDungeonMapGenerator(): DungeonMapGenerator {
  if (!dungeonMapGeneratorInstance) {
    dungeonMapGeneratorInstance = new DungeonMapGenerator();
  }
  return dungeonMapGeneratorInstance;
}
