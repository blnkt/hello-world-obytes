import React from 'react';
import { render } from '@testing-library/react-native';
import { AchievementList } from '../achievement-list';
import { AchievementDefinition } from '@/lib/delvers-descent/achievement-types';

describe('AchievementList', () => {
  const mockAchievements: AchievementDefinition[] = [
    {
      id: 'ach-1',
      category: 'milestone',
      title: 'First Step',
      description: 'Reach depth 5',
      rarity: 'common',
      requirements: { type: 'depth', threshold: 5 },
      unlocked: true,
    },
    {
      id: 'ach-2',
      category: 'milestone',
      title: 'Deep Explorer',
      description: 'Reach depth 10',
      rarity: 'uncommon',
      requirements: { type: 'depth', threshold: 10 },
      unlocked: false,
    },
    {
      id: 'ach-3',
      category: 'milestone',
      title: 'Master Delver',
      description: 'Reach depth 20',
      rarity: 'epic',
      requirements: { type: 'depth', threshold: 20 },
      unlocked: true,
    },
  ];

  it('should render achievement list with header', () => {
    const { getByText } = render(
      <AchievementList achievements={mockAchievements} />
    );

    expect(getByText('Achievements')).toBeTruthy();
    expect(getByText('2 of 3 unlocked')).toBeTruthy();
    expect(getByText(/67%/)).toBeTruthy();
  });

  it('should render with category header', () => {
    const { getByText } = render(
      <AchievementList achievements={mockAchievements} category="Milestones" />
    );

    expect(getByText('Milestones')).toBeTruthy();
  });

  it('should render all achievements', () => {
    const { getByText } = render(
      <AchievementList achievements={mockAchievements} />
    );

    expect(getByText('First Step')).toBeTruthy();
    expect(getByText('Deep Explorer')).toBeTruthy();
    expect(getByText('Master Delver')).toBeTruthy();
  });

  it('should calculate progress correctly', () => {
    const { getByText } = render(
      <AchievementList achievements={mockAchievements} />
    );

    expect(getByText('2 of 3 unlocked')).toBeTruthy();
    expect(getByText(/67%/)).toBeTruthy();
  });
});
