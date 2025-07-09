import React, { useEffect, useState } from 'react';

import { CharacterSheet } from '../../components/character/character-sheet';
import { getTodayStepCount, useStepCountAsExperience } from '../../lib/health';
import type { Character } from '../../types/character';
import {
  calculateBalancedXP,
  getStartingAttributes,
} from '../../types/character';

const initialCharacter: Character = {
  name: '',
  fitnessBackground: 'Fitness Newbie', // Default fitness background
  class: 'General Fitness', // Default class
  level: 1, // This will be auto-calculated from experience
  experience: 0,
  attributes: getStartingAttributes('Fitness Newbie', 'General Fitness'),
  skills: [],
  equipment: [],
  abilities: [],
  notes: '',
};

export default function CharacterSheetScreen() {
  const [character, setCharacter] = useState<Character>(initialCharacter);
  const stepCountExperience = useStepCountAsExperience();

  // Update character experience when step count changes
  useEffect(() => {
    const balancedXP = calculateBalancedXP(
      stepCountExperience,
      character.fitnessBackground,
      character.class
    );
    setCharacter((prev) => ({
      ...prev,
      experience: balancedXP,
      // Level is now auto-calculated in the component
    }));
  }, [stepCountExperience, character.fitnessBackground, character.class]);

  // Manual refresh function
  const handleRefreshExperience = async () => {
    try {
      const newStepCount = await getTodayStepCount();
      const balancedXP = calculateBalancedXP(
        newStepCount || 0,
        character.fitnessBackground,
        character.class
      );
      setCharacter((prev) => ({
        ...prev,
        experience: balancedXP,
      }));
    } catch (error) {
      console.error('Error refreshing step count:', error);
    }
  };

  return (
    <CharacterSheet
      character={character}
      onChange={setCharacter}
      onRefreshExperience={handleRefreshExperience}
    />
  );
}
