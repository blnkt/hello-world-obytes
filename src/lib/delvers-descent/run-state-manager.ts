import { storage } from '@/lib/storage';
import type {
  CollectedItem,
  RunState,
  Shortcut,
} from '@/types/delvers-descent';

const ACTIVE_RUN_STATE_KEY = 'activeRunState';

export class RunStateManager {
  private currentState: RunState | null = null;

  constructor() {
    this.loadState();
  }

  /**
   * Initialize a new run with starting energy
   */
  async initializeRun(runId: string, initialEnergy: number): Promise<void> {
    if (this.currentState && this.currentState.runId !== runId) {
      throw new Error('Cannot initialize new run while another run is active');
    }

    this.currentState = {
      runId,
      currentDepth: 0,
      currentNode: '',
      energyRemaining: initialEnergy,
      inventory: [],
      visitedNodes: [],
      discoveredShortcuts: [],
    };

    await this.saveState();
  }

  /**
   * Move to a specific node
   */
  async moveToNode(nodeId: string, energyCost: number): Promise<void> {
    if (!this.currentState) {
      throw new Error('No active run to move');
    }

    if (this.currentState.energyRemaining < energyCost) {
      throw new Error('Insufficient energy to move to node');
    }

    // Update state
    this.currentState.currentNode = nodeId;
    this.currentState.energyRemaining -= energyCost;

    // Add to visited nodes if not already visited
    if (!this.currentState.visitedNodes.includes(nodeId)) {
      this.currentState.visitedNodes.push(nodeId);
    }

    // Extract depth from node ID (assuming format: depthX-nodeY)
    const depthMatch = nodeId.match(/depth(\d+)/);
    if (depthMatch) {
      this.currentState.currentDepth = parseInt(depthMatch[1], 10);
    }

    await this.saveState();
  }

  /**
   * Add item to inventory
   */
  async addToInventory(item: CollectedItem): Promise<void> {
    if (!this.currentState) {
      throw new Error('No active run to add item to');
    }

    // Check inventory limit (if any)
    const maxInventorySize = 50; // Configurable limit
    if (this.currentState.inventory.length >= maxInventorySize) {
      throw new Error('Inventory is full');
    }

    this.currentState.inventory.push(item);
    await this.saveState();
  }

  /**
   * Remove item from inventory
   */
  async removeFromInventory(itemId: string): Promise<CollectedItem | null> {
    if (!this.currentState) {
      throw new Error('No active run to remove item from');
    }

    const itemIndex = this.currentState.inventory.findIndex(
      (item) => item.id === itemId
    );
    if (itemIndex === -1) {
      return null;
    }

    const removedItem = this.currentState.inventory.splice(itemIndex, 1)[0];
    await this.saveState();
    return removedItem;
  }

  /**
   * Update energy (for consumption or restoration)
   */
  async updateEnergy(amount: number): Promise<void> {
    if (!this.currentState) {
      throw new Error('No active run to update energy for');
    }

    this.currentState.energyRemaining = Math.max(
      0,
      this.currentState.energyRemaining + amount
    );
    await this.saveState();
  }

  /**
   * Add discovered shortcut
   */
  async addShortcut(shortcut: Shortcut): Promise<void> {
    if (!this.currentState) {
      throw new Error('No active run to add shortcut to');
    }

    // Check if shortcut already exists
    const existingShortcut = this.currentState.discoveredShortcuts.find(
      (s) => s.id === shortcut.id
    );
    if (!existingShortcut) {
      this.currentState.discoveredShortcuts.push(shortcut);
      await this.saveState();
    }
  }

  /**
   * Complete the run successfully
   */
  async completeRun(): Promise<{
    finalInventory: CollectedItem[];
    totalEnergyUsed: number;
    deepestDepth: number;
    shortcutsDiscovered: Shortcut[];
  }> {
    if (!this.currentState) {
      throw new Error('No active run to complete');
    }

    const result = {
      finalInventory: [...this.currentState.inventory],
      totalEnergyUsed: this.currentState.energyRemaining, // This should be calculated from initial energy
      deepestDepth: this.currentState.currentDepth,
      shortcutsDiscovered: [...this.currentState.discoveredShortcuts],
    };

    // Clear the active state
    this.currentState = null;
    await this.saveState();

    return result;
  }

  /**
   * Bust the run (lose rewards but preserve XP)
   */
  async bustRun(): Promise<{
    energyLost: number;
    deepestDepth: number;
    shortcutsDiscovered: Shortcut[];
  }> {
    if (!this.currentState) {
      throw new Error('No active run to bust');
    }

    const result = {
      energyLost: this.currentState.energyRemaining,
      deepestDepth: this.currentState.currentDepth,
      shortcutsDiscovered: [...this.currentState.discoveredShortcuts],
    };

    // Clear the active state
    this.currentState = null;
    await this.saveState();

    return result;
  }

  /**
   * Get current run state
   */
  getCurrentState(): RunState | null {
    return this.currentState ? { ...this.currentState } : null;
  }

  /**
   * Check if there's an active run
   */
  hasActiveRun(): boolean {
    return this.currentState !== null;
  }

  /**
   * Get current energy remaining
   */
  getCurrentEnergy(): number {
    return this.currentState?.energyRemaining || 0;
  }

  /**
   * Get current depth
   */
  getCurrentDepth(): number {
    return this.currentState?.currentDepth || 0;
  }

  /**
   * Get current node
   */
  getCurrentNode(): string {
    return this.currentState?.currentNode || '';
  }

  /**
   * Get inventory
   */
  getInventory(): CollectedItem[] {
    return this.currentState ? [...this.currentState.inventory] : [];
  }

  /**
   * Get visited nodes
   */
  getVisitedNodes(): string[] {
    return this.currentState ? [...this.currentState.visitedNodes] : [];
  }

  /**
   * Get discovered shortcuts
   */
  getDiscoveredShortcuts(): Shortcut[] {
    return this.currentState ? [...this.currentState.discoveredShortcuts] : [];
  }

  /**
   * Check if a node has been visited
   */
  hasVisitedNode(nodeId: string): boolean {
    return this.currentState?.visitedNodes.includes(nodeId) || false;
  }

  /**
   * Check if a shortcut has been discovered
   */
  hasDiscoveredShortcut(shortcutId: string): boolean {
    return (
      this.currentState?.discoveredShortcuts.some((s) => s.id === shortcutId) ||
      false
    );
  }

  /**
   * Get inventory item by ID
   */
  getInventoryItem(itemId: string): CollectedItem | null {
    return (
      this.currentState?.inventory.find((item) => item.id === itemId) || null
    );
  }

  /**
   * Get inventory items by type
   */
  getInventoryItemsByType(type: CollectedItem['type']): CollectedItem[] {
    return (
      this.currentState?.inventory.filter((item) => item.type === type) || []
    );
  }

  /**
   * Get inventory items by set ID
   */
  getInventoryItemsBySet(setId: string): CollectedItem[] {
    return (
      this.currentState?.inventory.filter((item) => item.setId === setId) || []
    );
  }

  /**
   * Calculate total inventory value
   */
  getTotalInventoryValue(): number {
    return (
      this.currentState?.inventory.reduce(
        (total, item) => total + item.value,
        0
      ) || 0
    );
  }

  /**
   * Get run statistics
   */
  getRunStatistics(): {
    energyRemaining: number;
    currentDepth: number;
    nodesVisited: number;
    itemsCollected: number;
    shortcutsDiscovered: number;
    inventoryValue: number;
  } {
    if (!this.currentState) {
      return {
        energyRemaining: 0,
        currentDepth: 0,
        nodesVisited: 0,
        itemsCollected: 0,
        shortcutsDiscovered: 0,
        inventoryValue: 0,
      };
    }

    return {
      energyRemaining: this.currentState.energyRemaining,
      currentDepth: this.currentState.currentDepth,
      nodesVisited: this.currentState.visitedNodes.length,
      itemsCollected: this.currentState.inventory.length,
      shortcutsDiscovered: this.currentState.discoveredShortcuts.length,
      inventoryValue: this.getTotalInventoryValue(),
    };
  }

  /**
   * Validate run state integrity
   */
  validateState(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.currentState) {
      return { isValid: true, errors: [] };
    }

    if (this.currentState.energyRemaining < 0) {
      errors.push('Energy remaining cannot be negative');
    }

    if (this.currentState.currentDepth < 0) {
      errors.push('Current depth cannot be negative');
    }

    if (this.currentState.inventory.length > 50) {
      errors.push('Inventory size exceeds maximum limit');
    }

    // Check for duplicate items in inventory
    const itemIds = this.currentState.inventory.map((item) => item.id);
    const uniqueItemIds = new Set(itemIds);
    if (itemIds.length !== uniqueItemIds.size) {
      errors.push('Duplicate items found in inventory');
    }

    // Check for duplicate visited nodes
    const uniqueVisitedNodes = new Set(this.currentState.visitedNodes);
    if (this.currentState.visitedNodes.length !== uniqueVisitedNodes.size) {
      errors.push('Duplicate visited nodes found');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Clear active run state
   */
  async clearActiveRun(): Promise<void> {
    this.currentState = null;
    await this.saveState();
  }

  /**
   * Load state from storage
   */
  private loadState(): void {
    try {
      const value = storage.getString(ACTIVE_RUN_STATE_KEY);
      this.currentState = value ? JSON.parse(value) || null : null;
    } catch (error) {
      console.error('Error loading run state:', error);
      this.currentState = null;
    }
  }

  /**
   * Save state to storage
   */
  private async saveState(): Promise<void> {
    try {
      if (this.currentState) {
        storage.set(ACTIVE_RUN_STATE_KEY, JSON.stringify(this.currentState));
      } else {
        storage.delete(ACTIVE_RUN_STATE_KEY);
      }
    } catch (error) {
      console.error('Error saving run state:', error);
      throw error;
    }
  }
}

// Singleton instance
let runStateManagerInstance: RunStateManager | null = null;

export const getRunStateManager = (): RunStateManager => {
  if (!runStateManagerInstance) {
    runStateManagerInstance = new RunStateManager();
  }
  return runStateManagerInstance;
};

// Storage functions for direct access
export const getActiveRunState = (): RunState | null => {
  const manager = getRunStateManager();
  return manager.getCurrentState();
};

export const clearActiveRunState = async (): Promise<void> => {
  const manager = getRunStateManager();
  await manager.clearActiveRun();
};
