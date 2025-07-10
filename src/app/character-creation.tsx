import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { CharacterForm } from '@/components/character/character-form';
import { Button, FocusAwareStatusBar, SafeAreaView } from '@/components/ui';
import { setCharacter as saveCharacterToStorage } from '@/lib/storage';
import type { Character } from '@/types/character';
import { getStartingAttributes } from '@/types/character';

export default function CharacterCreation() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState('General Fitness');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateCharacter = async () => {
    if (!name.trim()) return;

    setIsCreating(true);

    try {
      const newCharacter: Character = {
        name: name.trim(),
        class: selectedClass,
        level: 1,
        experience: 0,
        classAttributes: getStartingAttributes(selectedClass),
        skills: [],
        equipment: [],
        abilities: [],
        notes: '',
      };

      await saveCharacterToStorage(newCharacter);
      console.log(
        '🎭 Created new character:',
        newCharacter.name,
        '-',
        newCharacter.class
      );
      router.replace('/(app)');
    } catch (error) {
      console.error('Error creating character:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <FocusAwareStatusBar />
      <ScrollView className="flex-1 p-4">
        <CharacterForm
          name={name}
          setName={setName}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
        />
      </ScrollView>

      <SafeAreaView className="p-4">
        <Button
          label={isCreating ? 'Creating Character...' : 'Create Character'}
          onPress={handleCreateCharacter}
          disabled={!name.trim() || isCreating}
        />
      </SafeAreaView>
    </View>
  );
}
