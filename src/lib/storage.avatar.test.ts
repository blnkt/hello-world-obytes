import type { Character } from '@/types/character';

import { clearCharacter, getCharacter, setCharacter } from './storage';

describe('Character Storage with Avatar Parts', () => {
  beforeEach(() => {
    clearCharacter();
  });

  describe('setCharacter and getCharacter', () => {
    it('should save and retrieve character with equippedAvatarParts', async () => {
      const character: Character = {
        name: 'Test Character',
        level: 1,
        experience: 0,
        skills: [],
        equipment: [],
        abilities: [],
        equippedAvatarParts: {
          headId: 'head_warrior_helmet',
          torsoId: 'torso_warrior_armor',
          legsId: 'legs_warrior_boots',
        },
      };

      await setCharacter(character);
      const retrieved = getCharacter();

      expect(retrieved).not.toBeNull();
      expect(retrieved?.equippedAvatarParts).toBeDefined();
      expect(retrieved?.equippedAvatarParts?.headId).toBe(
        'head_warrior_helmet'
      );
      expect(retrieved?.equippedAvatarParts?.torsoId).toBe(
        'torso_warrior_armor'
      );
      expect(retrieved?.equippedAvatarParts?.legsId).toBe('legs_warrior_boots');
    });

    it('should add default avatar parts when retrieving character without equippedAvatarParts', async () => {
      const character: Character = {
        name: 'Test Character',
        level: 1,
        experience: 0,
        skills: [],
        equipment: [],
        abilities: [],
      };

      await setCharacter(character);
      const retrieved = getCharacter();

      expect(retrieved).not.toBeNull();
      // Migration should add default avatar parts
      expect(retrieved?.equippedAvatarParts).toBeDefined();
      expect(retrieved?.equippedAvatarParts?.headId).toBe('default_head');
      expect(retrieved?.equippedAvatarParts?.torsoId).toBe('default_torso');
      expect(retrieved?.equippedAvatarParts?.legsId).toBe('default_legs');
    });

    it('should persist equippedAvatarParts across storage operations', async () => {
      const character1: Character = {
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

      await setCharacter(character1);

      const character2: Character = {
        ...character1,
        level: 2,
        equippedAvatarParts: {
          headId: 'head_warrior_helmet',
          torsoId: 'torso_warrior_armor',
          legsId: 'legs_warrior_boots',
        },
      };

      await setCharacter(character2);
      const retrieved = getCharacter();

      expect(retrieved?.level).toBe(2);
      expect(retrieved?.equippedAvatarParts?.headId).toBe(
        'head_warrior_helmet'
      );
      expect(retrieved?.equippedAvatarParts?.torsoId).toBe(
        'torso_warrior_armor'
      );
      expect(retrieved?.equippedAvatarParts?.legsId).toBe('legs_warrior_boots');
    });
  });
});
