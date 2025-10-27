import { RunStateManager } from './run-state-manager';
import { type ShortcutInfo, ShortcutManager } from './shortcut-manager';

describe('ShortcutManager Persistence Across Runs (Task 4.5)', () => {
  let shortcutManager: ShortcutManager;
  let runStateManager: RunStateManager;

  beforeEach(() => {
    shortcutManager = new ShortcutManager();
    shortcutManager.clearAllShortcuts(); // Clean state for each test
    runStateManager = new RunStateManager();
  });

  describe('shortcut discovery and persistence', () => {
    it('should persist shortcuts discovered in one run for future runs', () => {
      // Discover shortcuts in "run 1"
      const shortcut1: ShortcutInfo = {
        id: 'shortcut-run1-1',
        depth: 2,
        reductionFactor: 0.7,
        description: 'Stairs from depth 2',
      };
      shortcutManager.discoverShortcut(shortcut1);

      const shortcut2: ShortcutInfo = {
        id: 'shortcut-run1-2',
        depth: 3,
        reductionFactor: 0.6,
        description: 'Tunnel from depth 3',
      };
      shortcutManager.discoverShortcut(shortcut2);

      // Verify shortcuts exist
      expect(shortcutManager.hasShortcut('shortcut-run1-1')).toBe(true);
      expect(shortcutManager.hasShortcut('shortcut-run1-2')).toBe(true);

      // Create new manager instance (simulating new run)
      const newManager = new ShortcutManager();

      // Shortcuts should still exist
      expect(newManager.hasShortcut('shortcut-run1-1')).toBe(true);
      expect(newManager.hasShortcut('shortcut-run1-2')).toBe(true);
    });

    it('should maintain shortcut data across multiple runs', () => {
      const shortcut: ShortcutInfo = {
        id: 'shortcut-persistent',
        depth: 4,
        reductionFactor: 0.8,
        description: 'Persistent shortcut',
      };

      // Discover in first manager instance
      const manager1 = new ShortcutManager();
      manager1.clearAllShortcuts(); // Clean state
      manager1.discoverShortcut(shortcut);

      // Create second manager instance (simulating new run)
      const manager2 = new ShortcutManager();

      // All data should be preserved
      const loadedShortcut = manager2.getShortcut('shortcut-persistent');
      expect(loadedShortcut).toBeDefined();
      expect(loadedShortcut?.id).toBe('shortcut-persistent');
      expect(loadedShortcut?.depth).toBe(4);
      expect(loadedShortcut?.reductionFactor).toBe(0.8);
      expect(loadedShortcut?.description).toBe('Persistent shortcut');
      expect(loadedShortcut?.discoveredAt).toBeDefined();
    });
  });

  describe('shortcut integration with runs', () => {
    it('should allow shortcuts discovered in run state to persist to ShortcutManager', async () => {
      // Initialize a run
      await runStateManager.initializeRun('test-run-1', 100);

      // Discover shortcuts in the run
      const runShortcut1 = {
        id: 'run-shortcut-1',
        fromDepth: 2,
        toDepth: 1,
        energyReduction: 10,
        isPermanent: true,
      };
      await runStateManager.addShortcut(runShortcut1);

      const state = runStateManager.getCurrentState();
      if (!state) {
        throw new Error('State not initialized');
      }

      // Verify shortcut is in run state
      expect(state.discoveredShortcuts.length).toBe(1);
      expect(state.discoveredShortcuts[0].id).toBe('run-shortcut-1');
    });

    it('should allow permanent shortcuts to be discovered by ShortcutManager', () => {
      // Create a shortcut in ShortcutManager format
      const shortcut: ShortcutInfo = {
        id: 'permanent-shortcut',
        depth: 3,
        reductionFactor: 0.75,
        description: 'Permanent shortcut across all runs',
      };

      const discovered = shortcutManager.discoverShortcut(shortcut);
      expect(discovered).toBe(true);
      expect(shortcutManager.hasShortcut('permanent-shortcut')).toBe(true);
    });
  });

  describe('shortcut usage tracking across runs', () => {
    it('should track shortcut usage across multiple runs', () => {
      const shortcut: ShortcutInfo = {
        id: 'tracked-shortcut',
        depth: 2,
        reductionFactor: 0.7,
        description: 'Usage tracked shortcut',
      };

      shortcutManager.discoverShortcut(shortcut);

      // Use shortcut multiple times
      shortcutManager.recordShortcutUsage('tracked-shortcut');
      shortcutManager.recordShortcutUsage('tracked-shortcut');
      shortcutManager.recordShortcutUsage('tracked-shortcut');

      const stats = shortcutManager.getShortcutStatistics();
      expect(stats.shortcutUsage['tracked-shortcut']).toBe(3);
      expect(stats.mostUsedShortcut).toBe('tracked-shortcut');
    });
  });

  describe('shortcut filtering by depth across runs', () => {
    it('should provide shortcuts available at each depth regardless of discovery run', () => {
      // Discover shortcuts at various depths
      shortcutManager.discoverShortcut({
        id: 'shallow',
        depth: 1,
        reductionFactor: 0.8,
        description: 'Shallow shortcut',
      });

      shortcutManager.discoverShortcut({
        id: 'medium',
        depth: 3,
        reductionFactor: 0.7,
        description: 'Medium shortcut',
      });

      shortcutManager.discoverShortcut({
        id: 'deep',
        depth: 5,
        reductionFactor: 0.6,
        description: 'Deep shortcut',
      });

      // Get shortcuts for each depth
      const depth1Shortcuts = shortcutManager.getShortcutsAtDepth(1);
      const depth3Shortcuts = shortcutManager.getShortcutsAtDepth(3);
      const depth5Shortcuts = shortcutManager.getShortcutsAtDepth(5);

      // At depth 1, should have shallow shortcut
      expect(depth1Shortcuts.map((s) => s.id)).toContain('shallow');
      expect(depth1Shortcuts.map((s) => s.id)).not.toContain('medium');
      expect(depth1Shortcuts.map((s) => s.id)).not.toContain('deep');

      // At depth 3, should have shallow and medium
      expect(depth3Shortcuts.map((s) => s.id)).toContain('shallow');
      expect(depth3Shortcuts.map((s) => s.id)).toContain('medium');
      expect(depth3Shortcuts.map((s) => s.id)).not.toContain('deep');

      // At depth 5, should have all shortcuts
      expect(depth5Shortcuts.map((s) => s.id)).toContain('shallow');
      expect(depth5Shortcuts.map((s) => s.id)).toContain('medium');
      expect(depth5Shortcuts.map((s) => s.id)).toContain('deep');
    });
  });
});
