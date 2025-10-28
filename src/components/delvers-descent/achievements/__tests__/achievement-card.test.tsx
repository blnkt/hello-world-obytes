import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AchievementCard } from '../achievement-card';
import { AchievementDefinition } from '@/lib/delvers-descent/achievement-types';

describe('AchievementCard', () => {
  const mockAchievement: AchievementDefinition = {
    id: 'test-achievement',
    category: 'milestone',
    title: 'Test Achievement',
    description: 'Test description',
    rarity: 'common',
    requirements: { type: 'depth', threshold: 5 },
    unlocked: false,
  };

  it('should render unlocked achievement', () => {
    const achievement: AchievementDefinition = {
      ...mockAchievement,
      unlocked: true,
      rewards: [{ type: 'energy', amount: 100, description: '100 energy' }],
    };

    const { getByText } = render(
      <AchievementCard achievement={achievement} />
    );

    expect(getByText('Test Achievement')).toBeTruthy();
    expect(getByText('Test description')).toBeTruthy();
    expect(getByText('common')).toBeTruthy();
    expect(getByText(/100 energy/)).toBeTruthy();
  });

  it('should render locked achievement', () => {
    const { getByText } = render(
      <AchievementCard achievement={mockAchievement} />
    );

    expect(getByText('Test Achievement')).toBeTruthy();
    expect(getByText('Test description')).toBeTruthy();
  });

  it('should render achievement with progress', () => {
    const achievement: AchievementDefinition = {
      ...mockAchievement,
      progress: { current: 3, target: 5, percentage: 60 },
    };

    const { getByText } = render(
      <AchievementCard achievement={achievement} />
    );

    expect(getByText(/3 \/ 5/)).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <AchievementCard achievement={mockAchievement} onPress={onPress} />
    );

    fireEvent.press(getByText('Test Achievement'));
    expect(onPress).toHaveBeenCalledWith(mockAchievement);
  });

  it('should handle multiple rewards', () => {
    const achievement: AchievementDefinition = {
      ...mockAchievement,
      unlocked: true,
      rewards: [
        { type: 'energy', amount: 100, description: '100 energy' },
        { type: 'items', description: 'Rare Item' },
        { type: 'title', description: 'Champion' },
      ],
    };

    const { getByText } = render(
      <AchievementCard achievement={achievement} />
    );

    expect(getByText(/100 energy/)).toBeTruthy();
    expect(getByText(/Rare Item/)).toBeTruthy();
    expect(getByText(/Champion/)).toBeTruthy();
  });
});

