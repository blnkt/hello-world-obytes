import React, { useRef } from 'react';

import { CharacterSheet } from '../../components/character/character-sheet';
import { useExperienceData } from '../../lib/health';
import { useCharacter, useLastCheckedDate } from '../../lib/storage';
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

export default function CharacterSheetScreen() {
  const [character, setCharacter] = useCharacter();
  const currentClassRef = useRef(character?.class || initialCharacter.class);

  // Update the ref when character class changes
  React.useEffect(() => {
    if (character?.class) {
      currentClassRef.current = character.class;
    }
  }, [character?.class]);

  // Use reactive hook for last checked date
  const [lastCheckedDate] = useLastCheckedDate();

  // Default to start of today if not set
  const lastCheckedDateTime = lastCheckedDate
    ? new Date(lastCheckedDate)
    : (() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
      })();

  const { experience } = useExperienceData();

  // Use initial character if none exists in storage
  const displayCharacter = {
    ...(character || initialCharacter),
    experience,
  } as Character;

  const handleCharacterChange = React.useCallback(
    (updated: Character | ((prev: Character) => Character)) => {
      if (typeof updated === 'function') {
        const newCharacter = updated(displayCharacter);
        setCharacter(newCharacter);
      } else {
        setCharacter(updated);
      }
    },
    [displayCharacter, setCharacter]
  );

  return (
    <CharacterSheet
      character={displayCharacter}
      onChange={handleCharacterChange}
    />
  );
}
