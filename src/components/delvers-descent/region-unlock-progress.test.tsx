import { render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

import { CollectionManager } from '@/lib/delvers-descent/collection-manager';
import { ALL_COLLECTION_SETS } from '@/lib/delvers-descent/collection-sets';
import { RegionManager } from '@/lib/delvers-descent/region-manager';

import { RegionUnlockProgress } from './region-unlock-progress';

// Mock the helper functions
jest.mock('@/lib/delvers-descent/region-unlock-progress-helper', () => ({
  getRegionUnlockProgress: jest.fn(),
  getAllRegionUnlockProgress: jest.fn(),
}));

describe('RegionUnlockProgress', () => {
  let collectionManager: CollectionManager;
  let regionManager: RegionManager;

  beforeEach(() => {
    collectionManager = new CollectionManager(ALL_COLLECTION_SETS);
    regionManager = new RegionManager(collectionManager);
    jest.clearAllMocks();
  });

  it('should render loading state initially', async () => {
    const {
      getAllRegionUnlockProgress,
    } = require('@/lib/delvers-descent/region-unlock-progress-helper');

    // Make the promise resolve after a delay to ensure loading state is shown
    getAllRegionUnlockProgress.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve([]), 100);
        })
    );

    render(
      <RegionUnlockProgress
        collectionManager={collectionManager}
        regionManager={regionManager}
      />
    );

    expect(screen.getByText('Loading progress...')).toBeTruthy();

    // Wait for loading to complete
    await waitFor(() => {
      expect(getAllRegionUnlockProgress).toHaveBeenCalled();
    });
  });

  it('should render progress for a specific collection set', async () => {
    const {
      getRegionUnlockProgress,
    } = require('@/lib/delvers-descent/region-unlock-progress-helper');

    getRegionUnlockProgress.mockResolvedValue({
      regionId: 'desert_oasis',
      regionName: 'Desert Oasis',
      collectionSetId: 'silk_road_set',
      collectionSetName: 'Silk Road Collection',
      itemsCollected: 2,
      itemsTotal: 5,
      isUnlocked: false,
      isComplete: false,
    });

    render(
      <RegionUnlockProgress
        collectionSetId="silk_road_set"
        collectionManager={collectionManager}
        regionManager={regionManager}
      />
    );

    expect(await screen.findByText('Region Unlock Progress')).toBeTruthy();
    expect(await screen.findByText('Desert Oasis')).toBeTruthy();
    expect(await screen.findByText('Silk Road Collection')).toBeTruthy();
    expect(await screen.findByText('2/5 items')).toBeTruthy();
    expect(screen.getByTestId('region-progress-desert_oasis')).toBeTruthy();
  });

  it('should render progress for all region unlock sets', async () => {
    const {
      getAllRegionUnlockProgress,
    } = require('@/lib/delvers-descent/region-unlock-progress-helper');

    getAllRegionUnlockProgress.mockResolvedValue([
      {
        regionId: 'desert_oasis',
        regionName: 'Desert Oasis',
        collectionSetId: 'silk_road_set',
        collectionSetName: 'Silk Road Collection',
        itemsCollected: 2,
        itemsTotal: 5,
        isUnlocked: false,
        isComplete: false,
      },
      {
        regionId: 'coastal_caves',
        regionName: 'Coastal Caves',
        collectionSetId: 'spice_trade_set',
        collectionSetName: 'Spice Trade Collection',
        itemsCollected: 3,
        itemsTotal: 4,
        isUnlocked: false,
        isComplete: false,
      },
    ]);

    render(
      <RegionUnlockProgress
        collectionManager={collectionManager}
        regionManager={regionManager}
      />
    );

    expect(await screen.findByText('Region Unlock Progress')).toBeTruthy();
    expect(await screen.findByText('Desert Oasis')).toBeTruthy();
    expect(await screen.findByText('Coastal Caves')).toBeTruthy();
    expect(screen.getByTestId('region-progress-desert_oasis')).toBeTruthy();
    expect(screen.getByTestId('region-progress-coastal_caves')).toBeTruthy();
  });

  it('should display unlocked status for unlocked regions', async () => {
    const {
      getRegionUnlockProgress,
    } = require('@/lib/delvers-descent/region-unlock-progress-helper');

    getRegionUnlockProgress.mockResolvedValue({
      regionId: 'desert_oasis',
      regionName: 'Desert Oasis',
      collectionSetId: 'silk_road_set',
      collectionSetName: 'Silk Road Collection',
      itemsCollected: 5,
      itemsTotal: 5,
      isUnlocked: true,
      isComplete: true,
    });

    render(
      <RegionUnlockProgress
        collectionSetId="silk_road_set"
        collectionManager={collectionManager}
        regionManager={regionManager}
      />
    );

    expect(await screen.findByText('Unlocked')).toBeTruthy();
  });

  it('should display ready to unlock status for complete sets', async () => {
    const {
      getRegionUnlockProgress,
    } = require('@/lib/delvers-descent/region-unlock-progress-helper');

    getRegionUnlockProgress.mockResolvedValue({
      regionId: 'desert_oasis',
      regionName: 'Desert Oasis',
      collectionSetId: 'silk_road_set',
      collectionSetName: 'Silk Road Collection',
      itemsCollected: 5,
      itemsTotal: 5,
      isUnlocked: false,
      isComplete: true,
    });

    render(
      <RegionUnlockProgress
        collectionSetId="silk_road_set"
        collectionManager={collectionManager}
        regionManager={regionManager}
      />
    );

    expect(await screen.findByText('Ready to Unlock')).toBeTruthy();
  });

  it('should render progress bar', async () => {
    const {
      getRegionUnlockProgress,
    } = require('@/lib/delvers-descent/region-unlock-progress-helper');

    getRegionUnlockProgress.mockResolvedValue({
      regionId: 'desert_oasis',
      regionName: 'Desert Oasis',
      collectionSetId: 'silk_road_set',
      collectionSetName: 'Silk Road Collection',
      itemsCollected: 2,
      itemsTotal: 5,
      isUnlocked: false,
      isComplete: false,
    });

    render(
      <RegionUnlockProgress
        collectionSetId="silk_road_set"
        collectionManager={collectionManager}
        regionManager={regionManager}
      />
    );

    // Wait for loading to complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(screen.getByTestId('progress-bar-fill')).toBeTruthy();
  });

  it('should not render progress bar for unlocked regions', async () => {
    const {
      getRegionUnlockProgress,
    } = require('@/lib/delvers-descent/region-unlock-progress-helper');

    getRegionUnlockProgress.mockResolvedValue({
      regionId: 'desert_oasis',
      regionName: 'Desert Oasis',
      collectionSetId: 'silk_road_set',
      collectionSetName: 'Silk Road Collection',
      itemsCollected: 5,
      itemsTotal: 5,
      isUnlocked: true,
      isComplete: true,
    });

    render(
      <RegionUnlockProgress
        collectionSetId="silk_road_set"
        collectionManager={collectionManager}
        regionManager={regionManager}
      />
    );

    // Wait for loading to complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Progress bar should not be rendered for unlocked regions
    const progressBar = screen.queryByTestId('progress-bar-fill');
    // The progress bar is conditionally rendered, so it might not exist
    // This test verifies the component doesn't crash
    expect(progressBar === null || progressBar === undefined).toBe(true);
  });

  it('should return null when no progress data', async () => {
    const {
      getAllRegionUnlockProgress,
    } = require('@/lib/delvers-descent/region-unlock-progress-helper');

    getAllRegionUnlockProgress.mockResolvedValue([]);

    render(
      <RegionUnlockProgress
        collectionManager={collectionManager}
        regionManager={regionManager}
      />
    );

    // Wait for loading to complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(screen.queryByText('Region Unlock Progress')).toBeNull();
  });

  it('should work without regionManager', async () => {
    const {
      getAllRegionUnlockProgress,
    } = require('@/lib/delvers-descent/region-unlock-progress-helper');

    getAllRegionUnlockProgress.mockResolvedValue([
      {
        regionId: 'desert_oasis',
        regionName: 'Desert Oasis',
        collectionSetId: 'silk_road_set',
        collectionSetName: 'Silk Road Collection',
        itemsCollected: 2,
        itemsTotal: 5,
        isUnlocked: false,
        isComplete: false,
      },
    ]);

    render(
      <RegionUnlockProgress
        collectionManager={collectionManager}
        regionManager={undefined}
      />
    );

    expect(await screen.findByText('Region Unlock Progress')).toBeTruthy();
  });
});
