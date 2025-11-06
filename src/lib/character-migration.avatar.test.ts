import type { Character } from '@/types/character';

import { migrateIfNeeded, needsMigration } from './character-migration';

describe('Character Migration with Avatar Parts', () => {
  describe('needsMigration', () => {
    it('should return true for character without equippedAvatarParts', () => {
      const character = {
        name: 'Test Character',
        level: 1,
        experience: 0,
        skills: [],
        equipment: [],
        abilities: [],
      };

      expect(needsMigration(character)).toBe(true);
    });

    it('should return false for character with equippedAvatarParts', () => {
      const character = {
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

      expect(needsMigration(character)).toBe(false);
    });

    it('should return true for character with class fields', () => {
      const character = {
        name: 'Test Character',
        class: 'Warrior',
        level: 1,
        experience: 0,
        skills: [],
        equipment: [],
        abilities: [],
      };

      expect(needsMigration(character)).toBe(true);
    });

    it('should return true for character with classAttributes', () => {
      const character = {
        name: 'Test Character',
        level: 1,
        experience: 0,
        classAttributes: { might: 10, speed: 8, fortitude: 8 },
        skills: [],
        equipment: [],
        abilities: [],
      };

      expect(needsMigration(character)).toBe(true);
    });
  });

  describe('migrateIfNeeded', () => {
    it('should add default avatar parts to character without equippedAvatarParts', () => {
      const character = {
        name: 'Test Character',
        level: 1,
        experience: 0,
        skills: [],
        equipment: [],
        abilities: [],
      };

      const result = migrateIfNeeded(character);

      expect(result.equippedAvatarParts).toBeDefined();
      expect(result.equippedAvatarParts?.headId).toBe('default_head');
      expect(result.equippedAvatarParts?.torsoId).toBe('default_torso');
      expect(result.equippedAvatarParts?.legsId).toBe('default_legs');
    });

    it('should preserve existing equippedAvatarParts', () => {
      const character = {
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

      const result = migrateIfNeeded(character);

      expect(result.equippedAvatarParts).toBeDefined();
      expect(result.equippedAvatarParts?.headId).toBe('head_warrior_helmet');
      expect(result.equippedAvatarParts?.torsoId).toBe('torso_warrior_armor');
      expect(result.equippedAvatarParts?.legsId).toBe('legs_warrior_boots');
    });

    it('should add default avatar parts when migrating old character with class', () => {
      const oldCharacter = {
        name: 'Old Character',
        class: 'Warrior',
        level: 5,
        experience: 25000,
        classAttributes: { might: 10, speed: 8, fortitude: 8 },
        skills: ['Running'],
        equipment: ['Shoes'],
        abilities: ['Endurance'],
        notes: 'Test notes',
      };

      const result = migrateIfNeeded(oldCharacter);

      expect(result).not.toHaveProperty('class');
      expect(result).not.toHaveProperty('classAttributes');
      expect(result.equippedAvatarParts).toBeDefined();
      expect(result.equippedAvatarParts?.headId).toBe('default_head');
      expect(result.equippedAvatarParts?.torsoId).toBe('default_torso');
      expect(result.equippedAvatarParts?.legsId).toBe('default_legs');
    });

    it('should not modify character that already has equippedAvatarParts and no class fields', () => {
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

      const result = migrateIfNeeded(character);

      expect(result).toEqual(character);
    });
  });
});
