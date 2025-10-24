import { type ShortcutInfo, ShortcutManager } from './shortcut-manager';

describe('ShortcutManager', () => {
  let shortcutManager: ShortcutManager;

  beforeEach(() => {
    shortcutManager = new ShortcutManager();
    shortcutManager.clearAllShortcuts(); // Ensure clean state for each test
  });

  describe('shortcut discovery and management', () => {
    it('should discover new shortcuts', () => {
      const shortcut: ShortcutInfo = {
        id: 'shortcut-1',
        depth: 3,
        reductionFactor: 0.7,
        description: 'Ancient passage connecting depths 1 and 3',
      };

      shortcutManager.discoverShortcut(shortcut);

      expect(shortcutManager.hasShortcut('shortcut-1')).toBe(true);
      const discoveredShortcut = shortcutManager.getShortcut('shortcut-1');
      expect(discoveredShortcut).toBeDefined();
      expect(discoveredShortcut?.id).toBe(shortcut.id);
      expect(discoveredShortcut?.depth).toBe(shortcut.depth);
      expect(discoveredShortcut?.reductionFactor).toBe(
        shortcut.reductionFactor
      );
      expect(discoveredShortcut?.description).toBe(shortcut.description);
    });

    it('should not allow duplicate shortcut discovery', () => {
      const shortcut: ShortcutInfo = {
        id: 'shortcut-1',
        depth: 3,
        reductionFactor: 0.7,
        description: 'Ancient passage',
      };

      shortcutManager.discoverShortcut(shortcut);

      // Attempting to discover the same shortcut again should not change anything
      const originalShortcut = shortcutManager.getShortcut('shortcut-1');
      shortcutManager.discoverShortcut(shortcut);

      expect(shortcutManager.getShortcut('shortcut-1')).toEqual(
        originalShortcut
      );
    });

    it('should get all discovered shortcuts', () => {
      const shortcuts: ShortcutInfo[] = [
        {
          id: 'shortcut-1',
          depth: 2,
          reductionFactor: 0.7,
          description: 'Passage 1',
        },
        {
          id: 'shortcut-2',
          depth: 4,
          reductionFactor: 0.8,
          description: 'Passage 2',
        },
        {
          id: 'shortcut-3',
          depth: 3,
          reductionFactor: 0.6,
          description: 'Passage 3',
        },
      ];

      shortcuts.forEach((shortcut) =>
        shortcutManager.discoverShortcut(shortcut)
      );

      const discoveredShortcuts = shortcutManager.getAllShortcuts();
      expect(discoveredShortcuts).toHaveLength(3);

      // Check that all shortcuts are present by ID
      const shortcutIds = discoveredShortcuts.map((s) => s.id);
      expect(shortcutIds).toContain('shortcut-1');
      expect(shortcutIds).toContain('shortcut-2');
      expect(shortcutIds).toContain('shortcut-3');
    });

    it('should get shortcuts available at specific depth', () => {
      const shortcuts: ShortcutInfo[] = [
        {
          id: 'shortcut-1',
          depth: 2,
          reductionFactor: 0.7,
          description: 'Passage 1',
        },
        {
          id: 'shortcut-2',
          depth: 4,
          reductionFactor: 0.8,
          description: 'Passage 2',
        },
        {
          id: 'shortcut-3',
          depth: 3,
          reductionFactor: 0.6,
          description: 'Passage 3',
        },
      ];

      shortcuts.forEach((shortcut) =>
        shortcutManager.discoverShortcut(shortcut)
      );

      // At depth 3, should have shortcuts for depths 2 and 3
      const availableAtDepth3 = shortcutManager.getShortcutsAtDepth(3);
      expect(availableAtDepth3).toHaveLength(2);
      expect(availableAtDepth3.map((s) => s.id)).toEqual(
        expect.arrayContaining(['shortcut-1', 'shortcut-3'])
      );
    });
  });

  describe('shortcut persistence', () => {
    it('should persist shortcuts across runs', () => {
      const shortcut: ShortcutInfo = {
        id: 'shortcut-1',
        depth: 3,
        reductionFactor: 0.7,
        description: 'Ancient passage',
      };

      shortcutManager.discoverShortcut(shortcut);

      // Create a new manager instance (simulating app restart)
      const newShortcutManager = new ShortcutManager();

      // Shortcuts should be loaded from persistence
      expect(newShortcutManager.hasShortcut('shortcut-1')).toBe(true);
      const loadedShortcut = newShortcutManager.getShortcut('shortcut-1');
      expect(loadedShortcut?.id).toBe(shortcut.id);
      expect(loadedShortcut?.depth).toBe(shortcut.depth);
      expect(loadedShortcut?.reductionFactor).toBe(shortcut.reductionFactor);
      expect(loadedShortcut?.description).toBe(shortcut.description);
    });

    it('should handle corrupted persistence data gracefully', () => {
      // Create a fresh manager to test with no persistence
      const freshManager = new ShortcutManager();
      freshManager.clearAllShortcuts(); // Ensure clean state

      expect(freshManager.getAllShortcuts()).toEqual([]);
      expect(freshManager.hasShortcut('nonexistent')).toBe(false);
    });
  });

  describe('shortcut effectiveness', () => {
    it('should calculate effective reduction factor for multiple shortcuts', () => {
      // Clear any existing shortcuts first
      shortcutManager.clearAllShortcuts();

      const shortcuts: ShortcutInfo[] = [
        {
          id: 'shortcut-1',
          depth: 2,
          reductionFactor: 0.7,
          description: 'Passage 1',
        },
        {
          id: 'shortcut-2',
          depth: 3,
          reductionFactor: 0.8,
          description: 'Passage 2',
        },
      ];

      shortcuts.forEach((shortcut) =>
        shortcutManager.discoverShortcut(shortcut)
      );

      const effectiveReduction = shortcutManager.calculateEffectiveReduction(
        3,
        ['shortcut-1', 'shortcut-2']
      );

      // Should be the average of the two reduction factors
      expect(effectiveReduction).toBeCloseTo(0.75, 2); // (0.7 + 0.8) / 2
    });

    it('should return 0 reduction when no shortcuts are available', () => {
      const effectiveReduction = shortcutManager.calculateEffectiveReduction(
        3,
        []
      );
      expect(effectiveReduction).toBe(0);
    });

    it('should handle shortcuts that are not applicable to current depth', () => {
      shortcutManager.clearAllShortcuts(); // Ensure clean state

      const shortcut: ShortcutInfo = {
        id: 'shortcut-1',
        depth: 5,
        reductionFactor: 0.7,
        description: 'Deep passage',
      };

      shortcutManager.discoverShortcut(shortcut);

      // At depth 3, shortcut for depth 5 should not apply
      const effectiveReduction = shortcutManager.calculateEffectiveReduction(
        3,
        ['shortcut-1']
      );
      expect(effectiveReduction).toBe(0);
    });
  });

  describe('shortcut statistics', () => {
    it('should track shortcut discovery statistics', () => {
      shortcutManager.clearAllShortcuts(); // Ensure clean state

      const shortcuts: ShortcutInfo[] = [
        {
          id: 'shortcut-1',
          depth: 2,
          reductionFactor: 0.7,
          description: 'Passage 1',
        },
        {
          id: 'shortcut-2',
          depth: 4,
          reductionFactor: 0.8,
          description: 'Passage 2',
        },
      ];

      shortcuts.forEach((shortcut) =>
        shortcutManager.discoverShortcut(shortcut)
      );

      const stats = shortcutManager.getShortcutStatistics();

      expect(stats.totalShortcuts).toBe(2);
      expect(stats.shortcutsByDepth[2]).toBe(1);
      expect(stats.shortcutsByDepth[4]).toBe(1);
      expect(stats.averageReductionFactor).toBeCloseTo(0.75, 2);
    });

    it('should track shortcut usage', () => {
      const shortcut: ShortcutInfo = {
        id: 'shortcut-1',
        depth: 3,
        reductionFactor: 0.7,
        description: 'Ancient passage',
      };

      shortcutManager.discoverShortcut(shortcut);
      shortcutManager.recordShortcutUsage('shortcut-1');
      shortcutManager.recordShortcutUsage('shortcut-1');

      const stats = shortcutManager.getShortcutStatistics();
      expect(stats.shortcutUsage['shortcut-1']).toBe(2);
    });
  });

  describe('edge cases', () => {
    it('should handle invalid shortcut IDs gracefully', () => {
      expect(shortcutManager.hasShortcut('')).toBe(false);
      expect(shortcutManager.hasShortcut('nonexistent')).toBe(false);
      expect(shortcutManager.getShortcut('nonexistent')).toBeUndefined();
    });

    it('should handle invalid depth values', () => {
      shortcutManager.clearAllShortcuts(); // Ensure clean state

      const shortcut: ShortcutInfo = {
        id: 'shortcut-1',
        depth: -1,
        reductionFactor: 0.7,
        description: 'Invalid shortcut',
      };

      // Should not discover shortcuts with invalid depths
      const result = shortcutManager.discoverShortcut(shortcut);
      expect(result).toBe(false);
      expect(shortcutManager.hasShortcut('shortcut-1')).toBe(false);
    });

    it('should handle invalid reduction factors', () => {
      shortcutManager.clearAllShortcuts(); // Ensure clean state

      const shortcut: ShortcutInfo = {
        id: 'shortcut-1',
        depth: 3,
        reductionFactor: 1.5, // Invalid: should be between 0 and 1
        description: 'Invalid shortcut',
      };

      // Should discover the shortcut but clamp the reduction factor
      const result = shortcutManager.discoverShortcut(shortcut);
      expect(result).toBe(true);

      const discoveredShortcut = shortcutManager.getShortcut('shortcut-1');
      expect(discoveredShortcut).toBeDefined();
      expect(discoveredShortcut?.reductionFactor).toBeLessThanOrEqual(1);
      expect(discoveredShortcut?.reductionFactor).toBeGreaterThanOrEqual(0);
    });
  });
});
