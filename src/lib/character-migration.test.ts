import type { Character } from '../types/character';
import {
  migrateCharacterData,
  migrateIfNeeded,
  needsMigration,
} from './character-migration';
import { clearCharacter, getCharacter, setCharacter } from './storage';

describe('Character Migration', () => {
  describe('migrateCharacterData', () => {
    it('should remove class and classAttributes from character data', () => {
      // This test will fail initially because the migration function doesn't exist yet
      const oldCharacterData = {
        name: 'Test Character',
        class: 'General Fitness',
        level: 5,
        experience: 25000,
        classAttributes: {
          might: 8,
          speed: 8,
          fortitude: 8,
        },
        skills: ['Running', 'Swimming'],
        equipment: ['Shoes', 'Watch'],
        abilities: ['Endurance'],
        notes: 'Test notes',
      };

      const migratedCharacter = migrateCharacterData(oldCharacterData);

      expect(migratedCharacter.name).toBe('Test Character');
      expect(migratedCharacter.level).toBe(5);
      expect(migratedCharacter.experience).toBe(25000);
      expect(migratedCharacter.skills).toEqual(['Running', 'Swimming']);
      expect(migratedCharacter.equipment).toEqual(['Shoes', 'Watch']);
      expect(migratedCharacter.abilities).toEqual(['Endurance']);
      expect(migratedCharacter.notes).toBe('Test notes');

      // Should not have class-related fields
      expect(migratedCharacter).not.toHaveProperty('class');
      expect(migratedCharacter).not.toHaveProperty('classAttributes');
    });

    it('should handle character data that already has no class fields', () => {
      const alreadyMigratedData = {
        name: 'Already Clean',
        level: 3,
        experience: 15000,
        skills: ['Walking'],
        equipment: ['Shoes'],
        abilities: ['Basic Fitness'],
        notes: 'Clean data',
      };

      const migratedCharacter = migrateCharacterData(alreadyMigratedData);

      // Should add default avatar parts
      expect(migratedCharacter.equippedAvatarParts).toBeDefined();
      expect(migratedCharacter.equippedAvatarParts?.headId).toBe(
        'default_head'
      );
      expect(migratedCharacter.equippedAvatarParts?.torsoId).toBe(
        'default_torso'
      );
      expect(migratedCharacter.equippedAvatarParts?.legsId).toBe(
        'default_legs'
      );
      expect(migratedCharacter.name).toBe('Already Clean');
      expect(migratedCharacter.level).toBe(3);
    });

    it('should handle empty character data', () => {
      const emptyData = {
        name: '',
        level: 1,
        experience: 0,
        skills: [],
        equipment: [],
        abilities: [],
      };

      const migratedCharacter = migrateCharacterData(emptyData);

      // Should add default avatar parts
      expect(migratedCharacter.equippedAvatarParts).toBeDefined();
      expect(migratedCharacter.equippedAvatarParts?.headId).toBe(
        'default_head'
      );
      expect(migratedCharacter.equippedAvatarParts?.torsoId).toBe(
        'default_torso'
      );
      expect(migratedCharacter.equippedAvatarParts?.legsId).toBe(
        'default_legs'
      );
      expect(migratedCharacter.name).toBe('');
      expect(migratedCharacter.level).toBe(1);
    });

    it('should preserve all non-class fields', () => {
      const complexCharacterData = {
        name: 'Complex Character',
        class: 'Cardio Crusher',
        level: 8,
        experience: 150000,
        classAttributes: {
          might: 6,
          speed: 12,
          fortitude: 10,
        },
        skills: ['Running', 'Swimming', 'Cycling', 'Hiking'],
        equipment: ['Running Shoes', 'Swim Goggles', 'Bike', 'Backpack'],
        abilities: ['Marathon Training', 'Endurance', 'Speed'],
        notes: 'A very active character with lots of activities',
      };

      const migratedCharacter = migrateCharacterData(complexCharacterData);

      expect(migratedCharacter.name).toBe('Complex Character');
      expect(migratedCharacter.level).toBe(8);
      expect(migratedCharacter.experience).toBe(150000);
      expect(migratedCharacter.skills).toEqual([
        'Running',
        'Swimming',
        'Cycling',
        'Hiking',
      ]);
      expect(migratedCharacter.equipment).toEqual([
        'Running Shoes',
        'Swim Goggles',
        'Bike',
        'Backpack',
      ]);
      expect(migratedCharacter.abilities).toEqual([
        'Marathon Training',
        'Endurance',
        'Speed',
      ]);
      expect(migratedCharacter.notes).toBe(
        'A very active character with lots of activities'
      );

      // Should not have class-related fields
      expect(migratedCharacter).not.toHaveProperty('class');
      expect(migratedCharacter).not.toHaveProperty('classAttributes');
    });
  });

  describe('needsMigration', () => {
    it('should return true for data with class field', () => {
      const dataWithClass = {
        name: 'Test',
        class: 'General Fitness',
        level: 1,
        experience: 0,
        skills: [],
        equipment: [],
        abilities: [],
      };

      expect(needsMigration(dataWithClass)).toBe(true);
    });

    it('should return true for data with classAttributes field', () => {
      const dataWithClassAttributes = {
        name: 'Test',
        level: 1,
        experience: 0,
        classAttributes: { might: 8, speed: 8, fortitude: 8 },
        skills: [],
        equipment: [],
        abilities: [],
      };

      expect(needsMigration(dataWithClassAttributes)).toBe(true);
    });

    it('should return true for data with both class fields', () => {
      const dataWithBoth = {
        name: 'Test',
        class: 'General Fitness',
        level: 1,
        experience: 0,
        classAttributes: { might: 8, speed: 8, fortitude: 8 },
        skills: [],
        equipment: [],
        abilities: [],
      };

      expect(needsMigration(dataWithBoth)).toBe(true);
    });

    it('should return false for data without class fields but with equippedAvatarParts', () => {
      const cleanData = {
        name: 'Test',
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

      expect(needsMigration(cleanData)).toBe(false);
    });

    it('should return true for data without class fields and without equippedAvatarParts', () => {
      const cleanData = {
        name: 'Test',
        level: 1,
        experience: 0,
        skills: [],
        equipment: [],
        abilities: [],
      };

      expect(needsMigration(cleanData)).toBe(true);
    });

    it('should return false for null or undefined data', () => {
      expect(needsMigration(null)).toBe(false);
      expect(needsMigration(undefined)).toBe(false);
    });
  });

  describe('migrateIfNeeded', () => {
    it('should migrate data that needs migration', () => {
      const dataNeedingMigration = {
        name: 'Test Character',
        class: 'General Fitness',
        level: 5,
        experience: 25000,
        classAttributes: { might: 8, speed: 8, fortitude: 8 },
        skills: ['Running'],
        equipment: ['Shoes'],
        abilities: ['Endurance'],
        notes: 'Test notes',
      };

      const result = migrateIfNeeded(dataNeedingMigration);

      expect(result.name).toBe('Test Character');
      expect(result.level).toBe(5);
      expect(result.experience).toBe(25000);
      expect(result).not.toHaveProperty('class');
      expect(result).not.toHaveProperty('classAttributes');
    });

    it('should return data as-is if no migration needed', () => {
      const cleanData = {
        name: 'Clean Character',
        level: 3,
        experience: 15000,
        skills: ['Walking'],
        equipment: ['Shoes'],
        abilities: ['Basic Fitness'],
        notes: 'Clean data',
        equippedAvatarParts: {
          headId: 'default_head',
          torsoId: 'default_torso',
          legsId: 'default_legs',
        },
      };

      const result = migrateIfNeeded(cleanData);

      expect(result).toEqual(cleanData);
    });
  });

  describe('Storage Integration', () => {
    beforeEach(() => {
      // Clear any existing character data before each test
      clearCharacter();
    });

    afterEach(() => {
      // Clean up after each test
      clearCharacter();
    });

    it('should migrate character data when loading from storage', async () => {
      // Set up old character data with class fields
      const oldCharacterData = {
        name: 'Storage Test Character',
        class: 'General Fitness',
        level: 7,
        experience: 75000,
        classAttributes: {
          might: 10,
          speed: 12,
          fortitude: 8,
        },
        skills: ['Running', 'Swimming', 'Cycling'],
        equipment: ['Running Shoes', 'Swim Goggles', 'Bike'],
        abilities: ['Marathon Training', 'Endurance'],
        notes: 'Test character for storage migration',
      };

      // Store the old data directly in storage (bypassing migration)
      const { storage } = require('./storage');
      storage.set('CHARACTER_DATA', JSON.stringify(oldCharacterData));

      // Load character data - this should trigger migration
      const loadedCharacter = getCharacter();

      // Verify migration occurred
      expect(loadedCharacter).toBeTruthy();
      expect(loadedCharacter?.name).toBe('Storage Test Character');
      expect(loadedCharacter?.level).toBe(7);
      expect(loadedCharacter?.experience).toBe(75000);
      expect(loadedCharacter?.skills).toEqual([
        'Running',
        'Swimming',
        'Cycling',
      ]);
      expect(loadedCharacter?.equipment).toEqual([
        'Running Shoes',
        'Swim Goggles',
        'Bike',
      ]);
      expect(loadedCharacter?.abilities).toEqual([
        'Marathon Training',
        'Endurance',
      ]);
      expect(loadedCharacter?.notes).toBe(
        'Test character for storage migration'
      );

      // Verify class fields were removed
      expect(loadedCharacter).not.toHaveProperty('class');
      expect(loadedCharacter).not.toHaveProperty('classAttributes');
    });

    it('should not migrate already clean character data', async () => {
      // Set up clean character data
      const cleanCharacterData: Character = {
        name: 'Clean Character',
        level: 3,
        experience: 15000,
        skills: ['Walking'],
        equipment: ['Shoes'],
        abilities: ['Basic Fitness'],
        notes: 'Already clean data',
        equippedAvatarParts: {
          headId: 'default_head',
          torsoId: 'default_torso',
          legsId: 'default_legs',
        },
      };

      // Store the clean data
      await setCharacter(cleanCharacterData);

      // Load character data - should not trigger migration
      const loadedCharacter = getCharacter();

      // Verify no migration occurred
      expect(loadedCharacter).toEqual(cleanCharacterData);
    });

    it('should handle null character data gracefully', () => {
      // Ensure no character data exists
      clearCharacter();

      // Load character data - should return null
      const loadedCharacter = getCharacter();

      expect(loadedCharacter).toBeNull();
    });
  });
});
