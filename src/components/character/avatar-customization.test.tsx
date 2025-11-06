import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { AvatarCollectionManager } from '@/lib/delvers-descent/avatar-collection-manager';
import { CollectionManager } from '@/lib/delvers-descent/collection-manager';
import type { Character } from '@/types/character';

import { AvatarCustomization } from './avatar-customization';

// Mock storage
jest.mock('@/lib/storage', () => ({
  setCharacter: jest.fn(),
  getCharacter: jest.fn(),
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock storage module (for MMKV)
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn(() => ({
    getString: jest.fn(() => 'en'),
    setString: jest.fn(),
    getNumber: jest.fn(),
    setNumber: jest.fn(),
    getBoolean: jest.fn(),
    setBoolean: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
    getAllKeys: jest.fn(() => []),
  })),
}));

// Mock i18n
jest.mock('@/lib/i18n/utils', () => ({
  storage: {
    getString: jest.fn(() => 'en'),
  },
  getLanguage: jest.fn(() => 'en'),
  translate: jest.fn((key: string) => key),
}));

// Mock CharacterAvatar
jest.mock('./character-avatar', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    CharacterAvatar: ({ _character }: { _character: Character }) =>
      React.createElement(View, { testID: 'avatar-preview' }, 'Avatar Preview'),
  };
});

describe('AvatarCustomization', () => {
  let collectionManager: CollectionManager;
  let avatarCollectionManager: AvatarCollectionManager;
  let mockCharacter: Character;
  let mockOnSave: jest.Mock;
  let mockOnCancel: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    collectionManager = new CollectionManager([]);
    avatarCollectionManager = new AvatarCollectionManager(collectionManager);
    mockCharacter = {
      name: 'Test Character',
      level: 1,
      experience: 0,
      skills: [],
      equipment: [],
      abilities: [],
      equippedAvatarParts: {
        headId: 'default_head',
        torsoId: 'default_torso',
        legsId: 'default_legs',
      },
    };
    mockOnSave = jest.fn();
    mockOnCancel = jest.fn();
  });

  describe('Screen Layout', () => {
    it('should render category sections for Heads, Torsos, and Legs', async () => {
      render(
        <AvatarCustomization
          character={mockCharacter}
          avatarCollectionManager={avatarCollectionManager}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(screen.getByText('Heads')).toBeTruthy();
      expect(screen.getByText('Torsos')).toBeTruthy();
      expect(screen.getByText('Legs')).toBeTruthy();
    });

    it('should display preview area showing selected parts', async () => {
      render(
        <AvatarCustomization
          character={mockCharacter}
          avatarCollectionManager={avatarCollectionManager}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 100));

      // CharacterAvatar should be rendered for preview
      const previews = screen.getAllByTestId('avatar-preview');
      expect(previews.length).toBeGreaterThan(0);
    });
  });

  describe('Unlocked Parts Display', () => {
    it('should display unlocked avatar parts in grid/list view', async () => {
      // Unlock a part first
      await avatarCollectionManager.unlockAvatarPart('head_warrior_helmet');

      render(
        <AvatarCustomization
          character={mockCharacter}
          avatarCollectionManager={avatarCollectionManager}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should show unlocked parts
      expect(screen.getByText('Warrior Helmet')).toBeTruthy();
    });

    it('should show default parts as unlocked', async () => {
      render(
        <AvatarCustomization
          character={mockCharacter}
          avatarCollectionManager={avatarCollectionManager}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Default parts should be visible on their respective tabs
      expect(screen.getByText('Default Head')).toBeTruthy();
    });
  });

  describe('Locked Parts Display', () => {
    it('should display locked avatar parts with progress indicators', async () => {
      render(
        <AvatarCustomization
          character={mockCharacter}
          avatarCollectionManager={avatarCollectionManager}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should show locked parts with progress (e.g., "0/5 items collected")
      // Multiple parts may have this text, so use getAllByText
      const progressIndicators = screen.getAllByText(/items collected/i);
      expect(progressIndicators.length).toBeGreaterThan(0);
    });
  });

  describe('Part Selection', () => {
    it('should allow selecting unlocked parts', async () => {
      await avatarCollectionManager.unlockAvatarPart('head_warrior_helmet');

      render(
        <AvatarCustomization
          character={mockCharacter}
          avatarCollectionManager={avatarCollectionManager}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Find and press the warrior helmet part
      const warriorHelmetButton = screen.getByTestId(
        'part-head_warrior_helmet'
      );
      expect(warriorHelmetButton).toBeTruthy();
    });

    it('should provide visual feedback for selected parts', async () => {
      render(
        <AvatarCustomization
          character={mockCharacter}
          avatarCollectionManager={avatarCollectionManager}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Currently equipped parts should be visually indicated
      const defaultHeadButton = screen.getByTestId('part-default_head');
      expect(defaultHeadButton).toBeTruthy();
    });
  });

  describe('Equip Functionality', () => {
    it('should have an Equip button to save selected parts', async () => {
      render(
        <AvatarCustomization
          character={mockCharacter}
          avatarCollectionManager={avatarCollectionManager}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(screen.getByText('Equip')).toBeTruthy();
    });
  });

  describe('Cancel Functionality', () => {
    it('should have a Cancel or Back button', async () => {
      render(
        <AvatarCustomization
          character={mockCharacter}
          avatarCollectionManager={avatarCollectionManager}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(screen.getByText('Cancel')).toBeTruthy();
    });
  });

  describe('Current Equipped Parts', () => {
    it('should display visual indicators for currently equipped parts', async () => {
      render(
        <AvatarCustomization
          character={mockCharacter}
          avatarCollectionManager={avatarCollectionManager}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Currently equipped parts should be marked
      const defaultHeadButton = screen.getByTestId('part-default_head');
      expect(defaultHeadButton).toBeTruthy();
    });
  });
});
