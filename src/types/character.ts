export type Character = {
  name: string;
  class: string;
  level: number;
  experience: number;
  classAttributes: {
    might: number;
    speed: number;
    fortitude: number;
  };
  skills: string[];
  equipment: string[];
  abilities: string[];
  notes?: string;
};

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

export const FITNESS_CLASSES = {
  'Cardio Crusher': {
    description: 'Focus on heart health and endurance',
    strengths: {
      experience: '1.5x XP from sustained cardio (30+ min)',
      endurance: 'Bonus XP for long-distance activities',
    },
    weaknesses: {
      experience: '0.7x XP from strength training',
      flexibility: 'Struggles with varied workout types',
    },
    specialAbility: 'Marathon Training - 2x XP for 10k+ steps once per week',
    attributes: {
      might: 6,
      speed: 12,
      fortitude: 10,
    },
  },
  'Strength Seeker': {
    description: 'Build muscle and power',
    strengths: {
      experience: '1.4x XP from high-intensity activities',
      power: 'Bonus XP for strength-based movements',
    },
    weaknesses: {
      experience: '0.8x XP from low-intensity cardio',
      endurance: 'Struggles with long-duration activities',
    },
    specialAbility: 'Power Walking - 1.5x XP for 15k+ steps once per week',
    attributes: {
      might: 14,
      speed: 6,
      fortitude: 8,
    },
  },
  'Flexibility Fanatic': {
    description: 'Balance and mobility focus',
    strengths: {
      experience: '1.3x XP from varied movement patterns',
      recovery: 'Bonus XP from rest and recovery days',
    },
    weaknesses: {
      experience: '0.8x XP from single-activity focus',
      intensity: 'Struggles with high-intensity workouts',
    },
    specialAbility: 'Active Recovery - XP from rest days with light activity',
    attributes: {
      might: 5,
      speed: 8,
      fortitude: 12,
    },
  },
  'Weight Loss Warrior': {
    description: 'Calorie burning specialist',
    strengths: {
      experience: '1.2x XP from daily consistency',
      motivation: 'Bonus XP for maintaining streaks',
    },
    weaknesses: {
      experience: '0.9x XP from irregular activity patterns',
      intensity: 'Struggles with very high-intensity workouts',
    },
    specialAbility: 'Streak Master - 1.3x XP for 7+ day streaks',
    attributes: {
      might: 7,
      speed: 9,
      fortitude: 11,
    },
  },
  'General Fitness': {
    description: 'Balanced approach to overall health',
    strengths: {
      experience: '1.1x XP from all activities',
      adaptability: 'No penalties for any activity type',
    },
    weaknesses: {
      experience: 'No special bonuses',
      specialization: "Doesn't excel in any particular area",
    },
    specialAbility:
      'Wellness Balance - Small bonus XP for multiple activity types',
    attributes: {
      might: 8,
      speed: 8,
      fortitude: 8,
    },
  },
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

// Calculate XP with class bonuses/penalties
export const calculateBalancedXP = (
  baseSteps: number,
  characterClass: string
): number => {
  let multiplier = 1;

  // Class effects
  if (characterClass === 'Cardio Crusher') {
    if (baseSteps > 10000)
      multiplier *= 1.5; // Sustained cardio
    else multiplier *= 0.7; // Low intensity penalty
  } else if (characterClass === 'Strength Seeker') {
    if (baseSteps > 15000)
      multiplier *= 1.4; // High intensity
    else multiplier *= 0.8; // Low intensity penalty
  } else if (characterClass === 'Flexibility Fanatic') {
    if (baseSteps >= 3000 && baseSteps <= 8000)
      multiplier *= 1.3; // Moderate activity
    else multiplier *= 0.8; // Single activity penalty
  } else if (characterClass === 'Weight Loss Warrior') {
    multiplier *= 1.2; // Daily consistency bonus
    if (baseSteps > 15000) multiplier *= 0.9; // High intensity penalty
  } else if (characterClass === 'General Fitness') {
    multiplier *= 1.1; // General bonus
  }

  return Math.floor(baseSteps * multiplier);
};

// Get starting attributes based on class
export const getStartingAttributes = (characterClass: string) => {
  const classData =
    FITNESS_CLASSES[characterClass as keyof typeof FITNESS_CLASSES];

  if (classData && classData.attributes) {
    return classData.attributes;
  }

  // Fallback to default balanced stats
  return {
    might: 8,
    speed: 8,
    fortitude: 8,
  };
};
