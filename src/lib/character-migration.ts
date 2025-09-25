import type { Character } from '../types/character';

// Type for old character data that includes class fields
type OldCharacterData = {
  name: string;
  class?: string;
  level: number;
  experience: number;
  classAttributes?: {
    might: number;
    speed: number;
    fortitude: number;
  };
  skills: string[];
  equipment: string[];
  abilities: string[];
  notes?: string;
};

/**
 * Migrates character data from the old format (with class fields) to the new simplified format
 * @param oldData - Character data that may contain class and classAttributes fields
 * @returns Cleaned character data without class-related fields
 */
export const migrateCharacterData = (oldData: OldCharacterData): Character => {
  // Create a new object with only the fields we want to keep
  const migratedCharacter: Character = {
    name: oldData.name,
    level: oldData.level,
    experience: oldData.experience,
    skills: oldData.skills,
    equipment: oldData.equipment,
    abilities: oldData.abilities,
    notes: oldData.notes,
  };

  return migratedCharacter;
};

/**
 * Checks if character data needs migration (contains class-related fields)
 * @param data - Character data to check
 * @returns true if migration is needed, false otherwise
 */
export const needsMigration = (data: any): boolean => {
  if (!data) return false;
  return data.class !== undefined || data.classAttributes !== undefined;
};

/**
 * Migrates character data if needed, otherwise returns the data as-is
 * @param data - Character data that may need migration
 * @returns Migrated character data or original data if no migration needed
 */
export const migrateIfNeeded = (data: any): Character => {
  if (needsMigration(data)) {
    return migrateCharacterData(data);
  }
  return data as Character;
};
