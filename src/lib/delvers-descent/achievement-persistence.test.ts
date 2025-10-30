import { getItem, setItem } from '@/lib/storage';

import { AchievementManager } from './achievement-manager';
import type { AchievementEvent } from './achievement-models';
import {
  clearAchievements,
  loadAchievementEvents,
  loadAchievements,
  saveAchievementEvents,
  saveAchievements,
} from './achievement-persistence';
import { ALL_ACHIEVEMENTS } from './achievement-types';

jest.mock('@/lib/storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('Achievement Persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Achievement State Persistence', () => {
    it('should save achievement state', async () => {
      const manager = new AchievementManager(ALL_ACHIEVEMENTS);
      (setItem as jest.Mock).mockResolvedValue(undefined);

      await saveAchievements(manager);

      expect(setItem).toHaveBeenCalledWith(
        'delvers-descent-achievements',
        expect.stringContaining('achievements')
      );
    });

    it('should load achievement state', async () => {
      const mockData = {
        achievements: ALL_ACHIEVEMENTS.slice(0, 5),
        lastSaved: new Date().toISOString(),
      };
      (getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockData));

      const achievements = await loadAchievements();

      expect(getItem).toHaveBeenCalledWith('delvers-descent-achievements');
      expect(achievements).toHaveLength(5);
      expect(achievements[0].id).toBe(ALL_ACHIEVEMENTS[0].id);
    });

    it('should handle missing achievement data', async () => {
      (getItem as jest.Mock).mockResolvedValue(null);

      const achievements = await loadAchievements();

      expect(achievements).toHaveLength(0);
    });

    it('should clear achievement state', async () => {
      (setItem as jest.Mock).mockResolvedValue(undefined);

      await clearAchievements();

      expect(setItem).toHaveBeenCalledWith(
        'delvers-descent-achievements',
        expect.stringContaining('"achievements":[]')
      );
    });
  });

  describe('Achievement Events Persistence', () => {
    const mockEvents: AchievementEvent[] = [
      {
        type: 'depth_reached' as const,
        data: { depth: 5 },
        timestamp: new Date(),
      },
      {
        type: 'exploration' as const,
        data: { shortcutId: 'test' },
        timestamp: new Date(),
      },
    ];

    it('should save achievement events', async () => {
      (setItem as jest.Mock).mockResolvedValue(undefined);

      await saveAchievementEvents(mockEvents);

      expect(setItem).toHaveBeenCalledWith(
        'delvers-descent-achievement-events',
        JSON.stringify(mockEvents)
      );
    });

    it('should load achievement events', async () => {
      (getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockEvents));

      const events = await loadAchievementEvents();

      expect(getItem).toHaveBeenCalledWith(
        'delvers-descent-achievement-events'
      );
      expect(events).toHaveLength(2);
      expect(events[0].type).toBe('depth_reached');
    });

    it('should handle missing achievement events', async () => {
      (getItem as jest.Mock).mockResolvedValue(null);

      const events = await loadAchievementEvents();

      expect(events).toHaveLength(0);
    });
  });

  describe('Persistence Integration', () => {
    it('should save and load achievement state correctly', async () => {
      let savedData: string | null = null;
      (setItem as jest.Mock).mockImplementation((key, value) => {
        if (key === 'delvers-descent-achievements') {
          savedData = value;
        }
        return Promise.resolve();
      });
      (getItem as jest.Mock).mockImplementation(() => {
        return Promise.resolve(savedData);
      });

      const manager = new AchievementManager(ALL_ACHIEVEMENTS);
      manager.processEvent({
        type: 'depth_reached',
        data: { depth: 5 },
        timestamp: new Date(),
      });

      await saveAchievements(manager);
      const loaded = await loadAchievements();

      expect(loaded).toBeDefined();
      expect(loaded.length).toBeGreaterThan(0);
    });
  });
});
