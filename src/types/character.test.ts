import {
  calculateBalancedXP,
  type Character,
  FITNESS_LEVELS,
  getCharacterLevel,
  getExperienceToNextLevel,
  getLevelProgress,
} from './character';

describe('Character Type', () => {
  describe('Character type definition', () => {
    it('should not include class field', () => {
      // This test will fail initially because the Character type still has a class field
      const character: Character = {
        name: 'Test Character',
        level: 1,
        experience: 0,
        skills: [],
        equipment: [],
        abilities: [],
        notes: 'Test notes',
      };

      // This should compile without errors once class field is removed
      expect(character.name).toBe('Test Character');
      expect(character.level).toBe(1);
      expect(character.experience).toBe(0);
    });

    it('should not include classAttributes field', () => {
      // This test will fail initially because the Character type still has classAttributes field
      const character: Character = {
        name: 'Test Character',
        level: 1,
        experience: 0,
        skills: [],
        equipment: [],
        abilities: [],
        notes: 'Test notes',
      };

      // This should compile without errors once classAttributes field is removed
      expect(character.name).toBe('Test Character');
      expect(character.level).toBe(1);
      expect(character.experience).toBe(0);
    });
  });

  describe('Class-related constants', () => {
    it('should not export FITNESS_CLASSES constant', () => {
      // This test verifies that FITNESS_CLASSES is not exported from the module
      const characterModule = require('./character');
      expect(characterModule.FITNESS_CLASSES).toBeUndefined();
    });

    it('should not export getStartingAttributes function', () => {
      // This test verifies that getStartingAttributes is not exported from the module
      const characterModule = require('./character');
      expect(characterModule.getStartingAttributes).toBeUndefined();
    });
  });

  describe('Level progression functions', () => {
    it('should calculate character level correctly', () => {
      expect(getCharacterLevel(0)).toBe(1);
      expect(getCharacterLevel(5000)).toBe(2);
      expect(getCharacterLevel(15000)).toBe(3);
      expect(getCharacterLevel(30000)).toBe(4);
      expect(getCharacterLevel(50000)).toBe(5);
      expect(getCharacterLevel(75000)).toBe(6);
      expect(getCharacterLevel(100000)).toBe(7);
      expect(getCharacterLevel(150000)).toBe(8);
    });

    it('should calculate experience to next level correctly', () => {
      expect(getExperienceToNextLevel(0)).toBe(5000);
      expect(getExperienceToNextLevel(5000)).toBe(10000);
      expect(getExperienceToNextLevel(15000)).toBe(15000);
      expect(getExperienceToNextLevel(150000)).toBe(0); // Max level
    });

    it('should calculate level progress correctly', () => {
      const progress1 = getLevelProgress(2500);
      expect(progress1.current).toBe(1);
      expect(progress1.next).toBe(2);
      expect(progress1.percentage).toBe(50);

      const progress2 = getLevelProgress(150000);
      expect(progress2.current).toBe(8);
      expect(progress2.next).toBe(8);
      expect(progress2.percentage).toBe(100);
    });
  });

  describe('XP calculation', () => {
    it('should calculate flat XP without class bonuses', () => {
      expect(calculateBalancedXP(1000)).toBe(1000);
      expect(calculateBalancedXP(5000)).toBe(5000);
      expect(calculateBalancedXP(10000)).toBe(10000);
    });
  });

  describe('FITNESS_LEVELS constant', () => {
    it('should export FITNESS_LEVELS constant', () => {
      expect(FITNESS_LEVELS).toBeDefined();
      expect(FITNESS_LEVELS[1]).toEqual({
        minXP: 0,
        name: 'Couch Potato',
        color: 'text-gray-500',
      });
      expect(FITNESS_LEVELS[8]).toEqual({
        minXP: 150000,
        name: 'Fitness Legend',
        color: 'text-yellow-600',
      });
    });
  });
});
