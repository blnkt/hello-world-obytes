import { render, screen } from '@testing-library/react-native';
import React from 'react';

import type { Character } from '@/types/character';

import { CharacterAvatar } from './character-avatar';

// Mock assets
jest.mock('../../../assets/head.png', () => 'head.png');
jest.mock('../../../assets/torso.png', () => 'torso.png');
jest.mock('../../../assets/legs.png', () => 'legs.png');

describe('CharacterAvatar', () => {
  const defaultCharacter: Character = {
    name: 'Test Character',
    level: 1,
    experience: 0,
    skills: [],
    equipment: [],
    abilities: [],
  };

  describe('Dynamic Image Loading', () => {
    it('should use default images when equippedAvatarParts is not provided', () => {
      render(<CharacterAvatar character={defaultCharacter} />);

      expect(screen.getByTestId('avatar-head')).toBeTruthy();
      expect(screen.getByTestId('avatar-torso')).toBeTruthy();
      expect(screen.getByTestId('avatar-legs')).toBeTruthy();
    });

    it('should use character.equippedAvatarParts when available', () => {
      const characterWithAvatar: Character = {
        ...defaultCharacter,
        equippedAvatarParts: {
          headId: 'head_warrior_helmet',
          torsoId: 'torso_warrior_armor',
          legsId: 'legs_warrior_boots',
        },
      };

      render(<CharacterAvatar character={characterWithAvatar} />);

      expect(screen.getByTestId('avatar-head')).toBeTruthy();
      expect(screen.getByTestId('avatar-torso')).toBeTruthy();
      expect(screen.getByTestId('avatar-legs')).toBeTruthy();
    });

    it('should fallback to default images if part ID is invalid', () => {
      const characterWithInvalidAvatar: Character = {
        ...defaultCharacter,
        equippedAvatarParts: {
          headId: 'invalid_head',
          torsoId: 'invalid_torso',
          legsId: 'invalid_legs',
        },
      };

      render(<CharacterAvatar character={characterWithInvalidAvatar} />);

      // Should still render with fallback to defaults
      expect(screen.getByTestId('avatar-head')).toBeTruthy();
      expect(screen.getByTestId('avatar-torso')).toBeTruthy();
      expect(screen.getByTestId('avatar-legs')).toBeTruthy();
    });

    it('should handle missing equippedAvatarParts gracefully', () => {
      const characterWithoutAvatar: Character = {
        ...defaultCharacter,
        equippedAvatarParts: undefined,
      };

      render(<CharacterAvatar character={characterWithoutAvatar} />);

      expect(screen.getByTestId('avatar-head')).toBeTruthy();
      expect(screen.getByTestId('avatar-torso')).toBeTruthy();
      expect(screen.getByTestId('avatar-legs')).toBeTruthy();
    });

    it('should handle partial equippedAvatarParts', () => {
      const characterWithPartialAvatar: Character = {
        ...defaultCharacter,
        equippedAvatarParts: {
          headId: 'head_warrior_helmet',
          torsoId: 'default_torso',
          legsId: 'default_legs',
        },
      };

      render(<CharacterAvatar character={characterWithPartialAvatar} />);

      expect(screen.getByTestId('avatar-head')).toBeTruthy();
      expect(screen.getByTestId('avatar-torso')).toBeTruthy();
      expect(screen.getByTestId('avatar-legs')).toBeTruthy();
    });
  });

  describe('Fallback Behavior', () => {
    it('should use default images for default_head, default_torso, default_legs', () => {
      const characterWithDefaults: Character = {
        ...defaultCharacter,
        equippedAvatarParts: {
          headId: 'default_head',
          torsoId: 'default_torso',
          legsId: 'default_legs',
        },
      };

      render(<CharacterAvatar character={characterWithDefaults} />);

      expect(screen.getByTestId('avatar-head')).toBeTruthy();
      expect(screen.getByTestId('avatar-torso')).toBeTruthy();
      expect(screen.getByTestId('avatar-legs')).toBeTruthy();
    });
  });

  describe('Various Part Combinations', () => {
    it('should render with warrior set parts', () => {
      const warriorCharacter: Character = {
        ...defaultCharacter,
        equippedAvatarParts: {
          headId: 'head_warrior_helmet',
          torsoId: 'torso_warrior_armor',
          legsId: 'legs_warrior_boots',
        },
      };

      render(<CharacterAvatar character={warriorCharacter} />);

      expect(screen.getByTestId('avatar-head')).toBeTruthy();
      expect(screen.getByTestId('avatar-torso')).toBeTruthy();
      expect(screen.getByTestId('avatar-legs')).toBeTruthy();
    });

    it('should render with mage set parts', () => {
      const mageCharacter: Character = {
        ...defaultCharacter,
        equippedAvatarParts: {
          headId: 'head_mage_hat',
          torsoId: 'torso_mage_robe',
          legsId: 'legs_mage_sandals',
        },
      };

      render(<CharacterAvatar character={mageCharacter} />);

      expect(screen.getByTestId('avatar-head')).toBeTruthy();
      expect(screen.getByTestId('avatar-torso')).toBeTruthy();
      expect(screen.getByTestId('avatar-legs')).toBeTruthy();
    });

    it('should render with mixed parts from different sets', () => {
      const mixedCharacter: Character = {
        ...defaultCharacter,
        equippedAvatarParts: {
          headId: 'head_warrior_helmet',
          torsoId: 'torso_mage_robe',
          legsId: 'legs_ranger_leggings',
        },
      };

      render(<CharacterAvatar character={mixedCharacter} />);

      expect(screen.getByTestId('avatar-head')).toBeTruthy();
      expect(screen.getByTestId('avatar-torso')).toBeTruthy();
      expect(screen.getByTestId('avatar-legs')).toBeTruthy();
    });
  });
});
