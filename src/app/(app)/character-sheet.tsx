import React, { useEffect, useRef, useState } from 'react';
import { useMMKVString } from 'react-native-mmkv';

import { CharacterSheet } from '../../components/character/character-sheet';
import { useStepCountAsExperience } from '../../lib/health';
import {
  getCharacter as getStoredCharacter,
  setCharacter as saveCharacterToStorage,
} from '../../lib/storage';
import type { Character } from '../../types/character';
import { getStartingAttributes } from '../../types/character';

const initialCharacter: Character = {
  name: '',
  class: 'General Fitness',
  level: 1,
  experience: 0,
  classAttributes: getStartingAttributes('General Fitness'),
  skills: [],
  equipment: [],
  abilities: [],
  notes: '',
};

const loadCharacterFromStorage = () => {
  try {
    const savedCharacter = getStoredCharacter();
    if (savedCharacter) {
      console.log('📱 Loaded character from storage:', savedCharacter.class);
      return savedCharacter;
    } else {
      console.log('📱 No saved character found, using initial character');
      return null;
    }
  } catch (error) {
    console.error('Error loading character from storage:', error);
    return null;
  }
};

const saveCharacterToStorageAsync = async (character: Character) => {
  try {
    await saveCharacterToStorage(character);
    console.log('💾 Saved character to storage:', character.class);
  } catch (error) {
    console.error('Error saving character to storage:', error);
  }
};

export default function CharacterSheetScreen() {
  const [character, setCharacter] = useState<Character>(initialCharacter);
  const [lastCheckedDate, setLastCheckedDate] =
    useMMKVString('lastCheckedDate');
  const currentClassRef = useRef(character.class);

  // Load character data from storage on mount
  useEffect(() => {
    const savedCharacter = loadCharacterFromStorage();
    if (savedCharacter) {
      setCharacter(savedCharacter);
    }
  }, []);

  // Save character data whenever it changes
  useEffect(() => {
    saveCharacterToStorageAsync(character);
  }, [character]);

  // Update the ref when character class changes
  useEffect(() => {
    currentClassRef.current = character.class;
  }, [character.class]);

  // Default to start of today if not set
  const lastCheckedDateTime = lastCheckedDate
    ? new Date(lastCheckedDate)
    : (() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
      })();

  const { experience } = useStepCountAsExperience(lastCheckedDateTime);

  return <CharacterSheet character={character} onChange={setCharacter} />;
}
