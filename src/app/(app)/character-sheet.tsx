import React, { useEffect, useState } from 'react';
import { useMMKVString } from 'react-native-mmkv';

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
  const [lastCheckedDate, setLastCheckedDate] =
    useMMKVString('lastCheckedDate');

  // Default to start of today if not set
  const lastCheckedDateTime = lastCheckedDate
    ? new Date(lastCheckedDate)
    : (() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
      })();

  const { experience, stepsByDay } =
    useStepCountAsExperience(lastCheckedDateTime);

  // Update character experience when step count changes
  useEffect(() => {
    const balancedXP = calculateBalancedXP(
      experience,
      character.fitnessBackground,
      character.class
    );
    setCharacter((prev) => ({
      ...prev,
      experience: balancedXP,
      // Level is now auto-calculated in the component
    }));
    // Update lastCheckedDate to now after each experience fetch
    setLastCheckedDate(new Date().toISOString());
  }, [
    experience,
    character.fitnessBackground,
    character.class,
    setLastCheckedDate,
  ]);

  // Manual refresh function (optional, can still use getTodayStepCount if needed)
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
      setLastCheckedDate(new Date().toISOString());
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
