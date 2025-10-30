import React from 'react';

import { CharacterSheet } from '../../components/character/character-sheet';
import { useExperienceData } from '../../lib/health';
import { useCharacter } from '../../lib/storage';
import type { Character } from '../../types/character';

const initialCharacter: Character = {
  name: '',
  level: 1,
  experience: 0,
  skills: [],
  equipment: [],
  abilities: [],
  notes: '',
};

export default function CharacterSheetScreen() {
  const [character, setCharacter] = useCharacter();

  // Use reactive hook for last checked date
  const { experience } = useExperienceData();

  // Use initial character if none exists in storage
  const displayCharacter = React.useMemo(
    () => ({ ...(character || initialCharacter), experience }) as Character,
    [character, experience]
  );

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
