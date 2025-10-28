import { ALL_ACHIEVEMENTS, MILESTONE_ACHIEVEMENTS } from './achievement-types';

describe('Achievement Type Definitions', () => {
  describe('Achievement Structure', () => {
    it('should have all required fields for each achievement', () => {
      ALL_ACHIEVEMENTS.forEach((achievement) => {
        expect(achievement.id).toBeTruthy();
        expect(achievement.category).toBeTruthy();
        expect(achievement.title).toBeTruthy();
        expect(achievement.description).toBeTruthy();
        expect(achievement.rarity).toBeTruthy();
        expect(achievement.requirements).toBeTruthy();
        expect(achievement.requirements.type).toBeTruthy();
        expect(achievement.requirements.threshold).toBeGreaterThan(0);
        expect(achievement.unlocked).toBe(false);
      });
    });

    it('should have unique achievement IDs', () => {
      const ids = ALL_ACHIEVEMENTS.map((a) => a.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('Milestone Achievements', () => {
    it('should define milestone achievements for various depths', () => {
      const depthAchievements = MILESTONE_ACHIEVEMENTS.filter((a) =>
        a.id.startsWith('milestone-depth')
      );
      expect(depthAchievements.length).toBeGreaterThan(0);
    });

    it('should have increasing rarity for deeper milestone achievements', () => {
      const depth5 = MILESTONE_ACHIEVEMENTS.find(
        (a) => a.id === 'milestone-depth-5'
      );
      const depth25 = MILESTONE_ACHIEVEMENTS.find(
        (a) => a.id === 'milestone-depth-25'
      );

      expect(depth5?.rarity).toBe('common');
      expect(depth25?.rarity).toBe('legendary');
    });
  });

  describe('Achievement Categories', () => {
    it('should have achievements in all categories', () => {
      const categories = new Set(ALL_ACHIEVEMENTS.map((a) => a.category));
      expect(categories.size).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Achievement Rarity Distribution', () => {
    it('should have proper rarity distribution', () => {
      const common = ALL_ACHIEVEMENTS.filter(
        (a) => a.rarity === 'common'
      ).length;
      const rare = ALL_ACHIEVEMENTS.filter((a) => a.rarity === 'rare').length;
      const legendary = ALL_ACHIEVEMENTS.filter(
        (a) => a.rarity === 'legendary'
      ).length;

      expect(common).toBeGreaterThan(0);
      expect(rare).toBeGreaterThan(0);
      expect(legendary).toBeGreaterThan(0);
    });
  });
});
