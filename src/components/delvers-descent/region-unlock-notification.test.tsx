import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { RegionUnlockNotification } from './region-unlock-notification';

// Mock the regions module
jest.mock('@/lib/delvers-descent/regions', () => ({
  getRegionById: (id: string) => {
    const regions: Record<string, any> = {
      desert_oasis: {
        id: 'desert_oasis',
        name: 'Desert Oasis',
        description: 'Sandy dunes with hidden oases and ancient ruins',
        theme: 'desert',
        startingBonus: {
          energyBonus: 5,
          itemsBonus: 0,
        },
      },
      mountain_pass: {
        id: 'mountain_pass',
        name: 'Mountain Pass',
        description: 'Treacherous mountain paths with windy cliffs',
        theme: 'mountain',
        startingBonus: {
          energyBonus: 0,
          itemsBonus: 3,
        },
      },
      dragons_lair: {
        id: 'dragons_lair',
        name: "Dragon's Lair",
        description:
          'The legendary lair of ancient dragons, filled with legendary treasures',
        theme: 'dragon',
        startingBonus: {
          energyBonus: 15,
          itemsBonus: 10,
        },
      },
    };
    return regions[id];
  },
}));

describe('RegionUnlockNotification', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should not render when visible is false', () => {
    render(
      <RegionUnlockNotification
        regionId="desert_oasis"
        visible={false}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByTestId('region-unlock-notification')).toBeNull();
  });

  it('should not render when regionId is null', () => {
    render(
      <RegionUnlockNotification
        regionId={null}
        visible={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByTestId('region-unlock-notification')).toBeNull();
  });

  it('should render region information when visible and regionId is provided', () => {
    render(
      <RegionUnlockNotification
        regionId="desert_oasis"
        visible={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByTestId('region-unlock-notification')).toBeTruthy();
    expect(screen.getByText('Region Unlocked!')).toBeTruthy();
    expect(screen.getByText('Desert Oasis')).toBeTruthy();
    expect(
      screen.getByText('Sandy dunes with hidden oases and ancient ruins')
    ).toBeTruthy();
  });

  it('should display starting bonuses correctly', () => {
    render(
      <RegionUnlockNotification
        regionId="desert_oasis"
        visible={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Starting Bonuses')).toBeTruthy();
    expect(screen.getByText('+5 starting energy')).toBeTruthy();
  });

  it('should display multiple bonuses correctly', () => {
    render(
      <RegionUnlockNotification
        regionId="dragons_lair"
        visible={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Starting Bonuses')).toBeTruthy();
    expect(
      screen.getByText('+15 starting energy, +10 starting items')
    ).toBeTruthy();
  });

  it('should display theme emoji', () => {
    render(
      <RegionUnlockNotification
        regionId="desert_oasis"
        visible={true}
        onClose={mockOnClose}
      />
    );

    // Desert theme should show 🏜️ emoji
    const emojiText = screen.getByText('🏜️');
    expect(emojiText).toBeTruthy();
  });

  it('should call onClose when close button is pressed', () => {
    render(
      <RegionUnlockNotification
        regionId="desert_oasis"
        visible={true}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByTestId('close-notification');
    fireEvent.press(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should auto-close after 5 seconds', () => {
    render(
      <RegionUnlockNotification
        regionId="desert_oasis"
        visible={true}
        onClose={mockOnClose}
      />
    );

    expect(mockOnClose).not.toHaveBeenCalled();

    // Fast-forward 5 seconds
    jest.advanceTimersByTime(5000);

    // With fake timers, the callback should execute immediately after advancing time
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not auto-close if component is unmounted', () => {
    const { unmount } = render(
      <RegionUnlockNotification
        regionId="desert_oasis"
        visible={true}
        onClose={mockOnClose}
      />
    );

    unmount();

    jest.advanceTimersByTime(5000);

    // onClose should not be called after unmount
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should handle region with no starting bonuses', () => {
    render(
      <RegionUnlockNotification
        regionId="mountain_pass"
        visible={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Starting Bonuses')).toBeTruthy();
    // Mountain pass has itemsBonus but no energyBonus, so it should show "+3 starting items"
    expect(screen.getByText('+3 starting items')).toBeTruthy();
  });
});
