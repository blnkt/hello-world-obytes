import type { EquippedAvatarParts } from '../types/avatar';
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
  equippedAvatarParts?: EquippedAvatarParts;
};

const DEFAULT_AVATAR_PARTS: EquippedAvatarParts = {
  headId: 'default_head',
  torsoId: 'default_torso',
  legsId: 'default_legs',
};

/**
 * Migrates character data from the old format (with class fields) to the new simplified format
 * Also ensures equippedAvatarParts are set for existing characters
 * @param oldData - Character data that may contain class and classAttributes fields
 * @returns Cleaned character data without class-related fields, with default avatar parts if missing
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
    // Ensure equippedAvatarParts are set (use existing if present, otherwise use defaults)
    equippedAvatarParts: oldData.equippedAvatarParts || DEFAULT_AVATAR_PARTS,
  };

  return migratedCharacter;
};

/**
 * Checks if character data needs migration (contains class-related fields or missing avatar parts)
 * @param data - Character data to check
 * @returns true if migration is needed, false otherwise
 */
export const needsMigration = (data: any): boolean => {
  if (!data) return false;
  return (
    data.class !== undefined ||
    data.classAttributes !== undefined ||
    !data.equippedAvatarParts
  );
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
