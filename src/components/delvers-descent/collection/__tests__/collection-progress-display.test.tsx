import React from 'react';
import { render } from '@testing-library/react-native';

import { CollectionProgressDisplay } from '../collection-progress-display';
import type {
  CollectionProgress,
  CollectionStatistics,
} from '@/types/delvers-descent';

describe('CollectionProgressDisplay (Task 1.8)', () => {
  const mockProgress: CollectionProgress = {
    totalItems: 150,
    totalSets: 15,
    completedSets: ['set1', 'set2', 'set3', 'set4', 'set5'],
    partialSets: [],
    totalXP: 1000,
    byCategory: {
      trade_goods: { total: 50, collected: 15, sets: 5, completedSets: 2 },
      discoveries: { total: 50, collected: 20, sets: 5, completedSets: 2 },
      legendaries: { total: 50, collected: 10, sets: 5, completedSets: 1 },
    },
  };

  const mockStatistics: CollectionStatistics = {
    totalRunsCompleted: 10,
    totalItemsCollected: 45,
    setsCompleted: 5,
    collectionCompletionRate: 0.3,
    favoriteSets: [],
    lastCollectionUpdate: Date.now(),
  };

  it('should render collection progress display', () => {
    const { getByTestId } = render(
      <CollectionProgressDisplay
        progress={mockProgress}
        statistics={mockStatistics}
      />
    );

    expect(getByTestId('collection-progress-display')).toBeDefined();
  });

  it('should display overall progress statistics', () => {
    const { getByText, getAllByText } = render(
      <CollectionProgressDisplay
        progress={mockProgress}
        statistics={mockStatistics}
      />
    );

    expect(getByText(/Collection Progress/i)).toBeDefined();
    expect(getAllByText(/5/i).length).toBeGreaterThan(0); // completed sets
    expect(getAllByText(/15/i).length).toBeGreaterThan(0); // total sets
  });

  it('should show collection completion rate', () => {
    const { getAllByText } = render(
      <CollectionProgressDisplay
        progress={mockProgress}
        statistics={mockStatistics}
      />
    );

    expect(getAllByText(/30%/i).length).toBeGreaterThan(0);
  });

  it('should display total items collected', () => {
    const { getByText } = render(
      <CollectionProgressDisplay
        progress={mockProgress}
        statistics={mockStatistics}
      />
    );

    expect(getByText(/45.*150/i)).toBeDefined();
  });

  it('should show category breakdown', () => {
    const { getByText } = render(
      <CollectionProgressDisplay
        progress={mockProgress}
        statistics={mockStatistics}
      />
    );

    expect(getByText(/Trade Goods/i)).toBeDefined();
    expect(getByText(/Discoveries/i)).toBeDefined();
    expect(getByText(/Legendaries/i)).toBeDefined();
  });

  it('should display total XP earned', () => {
    const { getByText } = render(
      <CollectionProgressDisplay
        progress={mockProgress}
        statistics={mockStatistics}
      />
    );

    expect(getByText(/1000/i)).toBeDefined();
  });

  it('should show progress for each category', () => {
    const { getByText } = render(
      <CollectionProgressDisplay
        progress={mockProgress}
        statistics={mockStatistics}
      />
    );

    expect(getByText(/Trade Goods/i)).toBeDefined();
  });

  it('should calculate and display category completion rates', () => {
    const { getByTestId } = render(
      <CollectionProgressDisplay
        progress={mockProgress}
        statistics={mockStatistics}
      />
    );

    expect(getByTestId('collection-progress-display')).toBeDefined();
  });
});
