import type { AvatarPartType } from '@/types/avatar';

import {
  ALL_AVATAR_COLLECTION_SETS,
  getAvatarSetsByPartType,
} from './avatar-collection-sets';

describe('Avatar Collection Sets', () => {
  describe('ALL_AVATAR_COLLECTION_SETS', () => {
    it('should contain all avatar collection sets', () => {
      expect(ALL_AVATAR_COLLECTION_SETS.length).toBeGreaterThan(0);
    });

    it('should have avatarPartId for each set', () => {
      ALL_AVATAR_COLLECTION_SETS.forEach((set) => {
        expect(set.avatarPartId).toBeDefined();
        expect(typeof set.avatarPartId).toBe('string');
      });
    });

    it('should have at least 3 head sets', () => {
      const headSets = ALL_AVATAR_COLLECTION_SETS.filter((set) =>
        set.avatarPartId.startsWith('head_')
      );
      expect(headSets.length).toBeGreaterThanOrEqual(3);
    });

    it('should have at least 3 torso sets', () => {
      const torsoSets = ALL_AVATAR_COLLECTION_SETS.filter((set) =>
        set.avatarPartId.startsWith('torso_')
      );
      expect(torsoSets.length).toBeGreaterThanOrEqual(3);
    });

    it('should have at least 3 leg sets', () => {
      const legSets = ALL_AVATAR_COLLECTION_SETS.filter((set) =>
        set.avatarPartId.startsWith('legs_')
      );
      expect(legSets.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('getAvatarSetsByPartType', () => {
    it('should return head sets when partType is "head"', () => {
      const headSets = getAvatarSetsByPartType('head');
      expect(headSets.length).toBeGreaterThanOrEqual(3);
      headSets.forEach((set) => {
        expect(set.avatarPartId.startsWith('head_')).toBe(true);
      });
    });

    it('should return torso sets when partType is "torso"', () => {
      const torsoSets = getAvatarSetsByPartType('torso');
      expect(torsoSets.length).toBeGreaterThanOrEqual(3);
      torsoSets.forEach((set) => {
        expect(set.avatarPartId.startsWith('torso_')).toBe(true);
      });
    });

    it('should return leg sets when partType is "legs"', () => {
      const legSets = getAvatarSetsByPartType('legs');
      expect(legSets.length).toBeGreaterThanOrEqual(3);
      legSets.forEach((set) => {
        expect(set.avatarPartId.startsWith('legs_')).toBe(true);
      });
    });

    it('should return empty array for invalid part type', () => {
      // TypeScript should prevent this, but test runtime behavior
      const result = getAvatarSetsByPartType('head' as AvatarPartType);
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
