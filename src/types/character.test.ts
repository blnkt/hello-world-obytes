import type { Character } from './character';

describe('Character Type Extensions', () => {
  describe('Character type with equippedAvatarParts', () => {
    it('should allow Character with equippedAvatarParts field', () => {
      const character: Character = {
        name: 'Test Character',
        level: 1,
        experience: 0,
        skills: [],
        equipment: [],
        abilities: [],
        equippedAvatarParts: {
          headId: 'default_head',
          torsoId: 'default_torso',
          legsId: 'default_legs',
        },
      };

      expect(character.equippedAvatarParts).toBeDefined();
      expect(character.equippedAvatarParts?.headId).toBe('default_head');
      expect(character.equippedAvatarParts?.torsoId).toBe('default_torso');
      expect(character.equippedAvatarParts?.legsId).toBe('default_legs');
    });

    it('should allow Character without equippedAvatarParts (optional)', () => {
      const character: Character = {
        name: 'Test Character',
        level: 1,
        experience: 0,
        skills: [],
        equipment: [],
        abilities: [],
      };

      expect(character.equippedAvatarParts).toBeUndefined();
    });
  });
});
