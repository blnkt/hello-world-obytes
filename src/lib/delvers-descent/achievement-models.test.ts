import { AchievementDataModel } from './achievement-models';
import type { AchievementDefinition } from './achievement-types';

describe('Achievement Data Models', () => {
  let mockAchievement: AchievementDefinition;

  beforeEach(() => {
    mockAchievement = {
      id: 'test-achievement',
      category: 'milestone',
      title: 'Test Achievement',
      description: 'Test description',
      rarity: 'common',
      requirements: { type: 'depth', threshold: 5 },
      unlocked: false,
    };
  });

  describe('AchievementDataModel', () => {
    it('should initialize with default state', () => {
      const model = new AchievementDataModel(mockAchievement);
      const state = model.getState();

      expect(state.unlocked).toBe(false);
      expect(state.progress.current).toBe(0);
      expect(state.progress.target).toBe(5);
      expect(state.progress.percentage).toBe(0);
    });

    it('should update progress correctly', () => {
      const model = new AchievementDataModel(mockAchievement);
      const update = model.updateProgress(3);

      const progress = model.getProgress();
      expect(progress.current).toBe(3);
      expect(progress.target).toBe(5);
      expect(progress.percentage).toBe(60);
      expect(update.unlocked).toBe(false);
    });

    it('should unlock achievement when threshold is reached', () => {
      const model = new AchievementDataModel(mockAchievement);
      model.updateProgress(5);

      const state = model.getState();
      expect(state.unlocked).toBe(true);
      expect(state.unlockedAt).toBeDefined();
      expect(state.progress.percentage).toBe(100);
    });

    it('should not exceed target progress', () => {
      const model = new AchievementDataModel(mockAchievement);
      model.updateProgress(10);

      const progress = model.getProgress();
      expect(progress.current).toBe(5);
      expect(progress.percentage).toBe(100);
    });

    it('should match depth requirements correctly', () => {
      const model = new AchievementDataModel(mockAchievement);
      const result = model.checkRequirement({
        type: 'depth_reached',
        data: { depth: 5 },
        timestamp: new Date(),
      });

      expect(result.matched).toBe(true);
    });

    it('should not match incomplete requirements', () => {
      const model = new AchievementDataModel(mockAchievement);
      const result = model.checkRequirement({
        type: 'depth_reached',
        data: { depth: 3 },
        timestamp: new Date(),
      });

      expect(result.matched).toBe(false);
    });
  });
});
