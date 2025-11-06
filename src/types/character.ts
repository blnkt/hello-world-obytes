import type { EquippedAvatarParts } from './avatar';

export type Character = {
  name: string;
  level: number;
  experience: number;
  skills: string[];
  equipment: string[];
  abilities: string[];
  notes?: string;
  equippedAvatarParts?: EquippedAvatarParts;
};

// TODO: PHASE 3 - Add inventory system - Let players collect and use items from scenarios
// TODO: PHASE 3 - Create quest system - Add daily/weekly quests with rewards

// Fitness-focused level progression
export const FITNESS_LEVELS = {
  1: { minXP: 0, name: 'Couch Potato', color: 'text-gray-500' },
  2: { minXP: 5000, name: 'Walker', color: 'text-green-600' },
  3: { minXP: 15000, name: 'Jogger', color: 'text-blue-600' },
  4: { minXP: 30000, name: 'Runner', color: 'text-purple-600' },
  5: { minXP: 50000, name: 'Athlete', color: 'text-orange-600' },
  6: { minXP: 75000, name: 'Marathoner', color: 'text-red-600' },
  7: { minXP: 100000, name: 'Ultra Runner', color: 'text-indigo-600' },
  8: { minXP: 150000, name: 'Fitness Legend', color: 'text-yellow-600' },
} as const;

export const getCharacterLevel = (experience: number): number => {
  for (let level = 8; level >= 1; level--) {
    if (
      experience >= FITNESS_LEVELS[level as keyof typeof FITNESS_LEVELS].minXP
    ) {
      return level;
    }
  }
  return 1;
};

export const getExperienceToNextLevel = (experience: number): number => {
  const currentLevel = getCharacterLevel(experience);
  const nextLevel = currentLevel + 1;

  if (nextLevel > 8) return 0; // Max level reached

  return (
    FITNESS_LEVELS[nextLevel as keyof typeof FITNESS_LEVELS].minXP - experience
  );
};

export const getLevelProgress = (
  experience: number
): { current: number; next: number; percentage: number } => {
  const currentLevel = getCharacterLevel(experience);
  const currentLevelXP =
    FITNESS_LEVELS[currentLevel as keyof typeof FITNESS_LEVELS].minXP;
  const nextLevelXP =
    currentLevel < 8
      ? FITNESS_LEVELS[(currentLevel + 1) as keyof typeof FITNESS_LEVELS].minXP
      : currentLevelXP;

  const progressInLevel = experience - currentLevelXP;
  const totalForLevel = nextLevelXP - currentLevelXP;
  const percentage =
    totalForLevel > 0 ? (progressInLevel / totalForLevel) * 100 : 100;

  return {
    current: currentLevel,
    next: currentLevel < 8 ? currentLevel + 1 : currentLevel,
    percentage: Math.min(percentage, 100),
  };
};

// Calculate XP with flat rate (no class bonuses/penalties)
export const calculateBalancedXP = (baseSteps: number): number => {
  // Flat XP gain without class-based multipliers
  return baseSteps;
};
