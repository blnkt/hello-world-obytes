import { getItem, setItem } from '@/lib/storage';

export interface ShortcutInfo {
  id: string;
  depth: number;
  reductionFactor: number; // 0-1, where 1 = 100% reduction
  description: string;
  discoveredAt?: number;
  usageCount?: number;
}

export interface ShortcutStatistics {
  totalShortcuts: number;
  shortcutsByDepth: Record<number, number>;
  averageReductionFactor: number;
  shortcutUsage: Record<string, number>;
  mostUsedShortcut?: string;
}

const SHORTCUT_STORAGE_KEY = 'delvers_descent_shortcuts';

export class ShortcutManager {
  private shortcuts: Map<string, ShortcutInfo> = new Map();
  private shortcutUsage: Map<string, number> = new Map();

  constructor() {
    this.loadShortcuts();
  }

  /**
   * Discover a new shortcut
   */
  discoverShortcut(shortcut: ShortcutInfo): boolean {
    // Validate shortcut data
    if (!this.isValidShortcut(shortcut)) {
      return false;
    }

    // Normalize reduction factor to valid range
    const normalizedShortcut: ShortcutInfo = {
      ...shortcut,
      reductionFactor: Math.max(0, Math.min(1, shortcut.reductionFactor)),
      discoveredAt: shortcut.discoveredAt ?? Date.now(),
      usageCount: shortcut.usageCount ?? 0,
    };

    // Only discover if not already known
    if (!this.shortcuts.has(shortcut.id)) {
      this.shortcuts.set(shortcut.id, normalizedShortcut);
      this.shortcutUsage.set(shortcut.id, 0);
      this.saveShortcuts();
      return true;
    }

    return false;
  }

  /**
   * Check if a shortcut exists
   */
  hasShortcut(shortcutId: string): boolean {
    return this.shortcuts.has(shortcutId);
  }

  /**
   * Get shortcut information
   */
  getShortcut(shortcutId: string): ShortcutInfo | undefined {
    return this.shortcuts.get(shortcutId);
  }

  /**
   * Get all discovered shortcuts
   */
  getAllShortcuts(): ShortcutInfo[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Get shortcuts available at a specific depth
   */
  getShortcutsAtDepth(depth: number): ShortcutInfo[] {
    return this.getAllShortcuts().filter(shortcut => shortcut.depth <= depth);
  }

  /**
   * Get shortcut IDs available at a specific depth
   */
  getShortcutIdsAtDepth(depth: number): string[] {
    return this.getShortcutsAtDepth(depth).map(shortcut => shortcut.id);
  }

  /**
   * Calculate effective reduction factor for multiple shortcuts
   */
  calculateEffectiveReduction(currentDepth: number, shortcutIds: string[]): number {
    if (!shortcutIds || shortcutIds.length === 0) {
      return 0;
    }

    const applicableShortcuts = shortcutIds
      .map(id => this.shortcuts.get(id))
      .filter((shortcut): shortcut is ShortcutInfo => 
        shortcut !== undefined && shortcut.depth <= currentDepth
      );

    if (applicableShortcuts.length === 0) {
      return 0;
    }

    // Calculate average reduction factor
    const totalReduction = applicableShortcuts.reduce(
      (sum, shortcut) => sum + shortcut.reductionFactor,
      0
    );

    return totalReduction / applicableShortcuts.length;
  }

  /**
   * Record shortcut usage for statistics
   */
  recordShortcutUsage(shortcutId: string): void {
    if (this.shortcuts.has(shortcutId)) {
      const currentUsage = this.shortcutUsage.get(shortcutId) ?? 0;
      this.shortcutUsage.set(shortcutId, currentUsage + 1);
      
      // Update usage count in shortcut info
      const shortcut = this.shortcuts.get(shortcutId);
      if (shortcut) {
        shortcut.usageCount = (shortcut.usageCount ?? 0) + 1;
        this.shortcuts.set(shortcutId, shortcut);
      }
      
      this.saveShortcuts();
    }
  }

  /**
   * Get shortcut statistics
   */
  getShortcutStatistics(): ShortcutStatistics {
    const shortcuts = this.getAllShortcuts();
    const shortcutsByDepth: Record<number, number> = {};
    let totalReductionFactor = 0;
    const shortcutUsage: Record<string, number> = {};

    shortcuts.forEach(shortcut => {
      // Count shortcuts by depth
      shortcutsByDepth[shortcut.depth] = (shortcutsByDepth[shortcut.depth] ?? 0) + 1;
      
      // Sum reduction factors
      totalReductionFactor += shortcut.reductionFactor;
      
      // Record usage
      shortcutUsage[shortcut.id] = this.shortcutUsage.get(shortcut.id) ?? 0;
    });

    // Find most used shortcut
    let mostUsedShortcut: string | undefined;
    let maxUsage = 0;
    Object.entries(shortcutUsage).forEach(([id, usage]) => {
      if (usage > maxUsage) {
        maxUsage = usage;
        mostUsedShortcut = id;
      }
    });

    return {
      totalShortcuts: shortcuts.length,
      shortcutsByDepth,
      averageReductionFactor: shortcuts.length > 0 ? totalReductionFactor / shortcuts.length : 0,
      shortcutUsage,
      mostUsedShortcut: maxUsage > 0 ? mostUsedShortcut : undefined,
    };
  }

  /**
   * Clear all shortcuts (for testing or reset)
   */
  clearAllShortcuts(): void {
    this.shortcuts.clear();
    this.shortcutUsage.clear();
    this.saveShortcuts();
  }

  /**
   * Load shortcuts from persistent storage
   */
  private loadShortcuts(): void {
    try {
      const storedData = getItem(SHORTCUT_STORAGE_KEY);
      if (storedData) {
        const data = JSON.parse(storedData);
        
        // Load shortcuts
        if (data.shortcuts) {
          Object.entries(data.shortcuts).forEach(([id, shortcut]) => {
            this.shortcuts.set(id, shortcut as ShortcutInfo);
          });
        }
        
        // Load usage statistics
        if (data.usage) {
          Object.entries(data.usage).forEach(([id, count]) => {
            this.shortcutUsage.set(id, count as number);
          });
        }
      }
    } catch (error) {
      console.warn('Failed to load shortcuts from storage:', error);
      // Continue with empty shortcuts
    }
  }

  /**
   * Save shortcuts to persistent storage
   */
  private saveShortcuts(): void {
    try {
      const shortcutsObj: Record<string, ShortcutInfo> = {};
      this.shortcuts.forEach((shortcut, id) => {
        shortcutsObj[id] = shortcut;
      });

      const usageObj: Record<string, number> = {};
      this.shortcutUsage.forEach((count, id) => {
        usageObj[id] = count;
      });

      const data = {
        shortcuts: shortcutsObj,
        usage: usageObj,
        lastUpdated: Date.now(),
      };

      setItem(SHORTCUT_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save shortcuts to storage:', error);
    }
  }

  /**
   * Validate shortcut data
   */
  private isValidShortcut(shortcut: ShortcutInfo): boolean {
    return (
      shortcut.id &&
      shortcut.id.length > 0 &&
      shortcut.depth > 0 &&
      shortcut.reductionFactor >= 0 && // Allow values > 1, they'll be clamped
      shortcut.description &&
      shortcut.description.length > 0
    );
  }
}
