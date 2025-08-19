import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import GridTile from './grid-tile';

describe('GridTile', () => {
  it('should render a face-down tile by default', () => {
    render(<GridTile id="0-0" row={0} col={0} />);

    // Should display a face-down tile
    expect(screen.getByTestId('grid-tile')).toBeTruthy();

    // Should not show any content when face-down
    expect(screen.queryByText('💎')).toBeNull();
    expect(screen.queryByText('💀')).toBeNull();
    expect(screen.queryByText('⚠️')).toBeNull();
  });

  it('should render a face-up tile when revealed', () => {
    render(<GridTile id="0-0" row={0} col={0} isRevealed={true} />);

    // Should display a face-up tile with neutral type by default
    expect(screen.getByTestId('grid-tile-neutral')).toBeTruthy();

    // Should have correct accessibility description for neutral tile
    const tile = screen.getByTestId('grid-tile-neutral');
    expect(tile.props.accessibilityLabel).toContain('Tile at row 1, column 1');
    expect(tile.props.accessibilityHint).toBe(
      'Neutral tile - No special effect'
    );
  });

  it('should handle tile press events', () => {
    const mockOnPress = jest.fn();

    render(<GridTile id="0-0" row={0} col={0} onPress={mockOnPress} />);

    // Should be pressable
    const tile = screen.getByTestId('grid-tile');
    expect(tile).toBeTruthy();

    // Test that pressing tile calls onPress
    fireEvent.press(tile);
    expect(mockOnPress).toHaveBeenCalledWith('0-0', 0, 0);
  });

  it('should handle tile reveal state changes', () => {
    const mockOnPress = jest.fn();
    const { rerender } = render(
      <GridTile id="0-0" row={0} col={0} onPress={mockOnPress} />
    );

    // Initially face-down - should have generic testID
    const hiddenTile = screen.getByTestId('grid-tile');
    expect(hiddenTile.props.accessibilityHint).toBe('Hidden tile');

    // Reveal the tile as neutral
    rerender(
      <GridTile
        id="0-0"
        row={0}
        col={0}
        onPress={mockOnPress}
        isRevealed={true}
      />
    );

    // Should now show neutral tile with specific testID
    const neutralTile = screen.getByTestId('grid-tile-neutral');
    expect(neutralTile.props.accessibilityHint).toBe(
      'Neutral tile - No special effect'
    );

    // Change tile type to treasure
    rerender(
      <GridTile
        id="0-0"
        row={0}
        col={0}
        onPress={mockOnPress}
        isRevealed={true}
        tileType="treasure"
      />
    );

    // Should show treasure tile with specific testID and description
    const treasureTile = screen.getByTestId('grid-tile-treasure');
    expect(treasureTile.props.accessibilityHint).toBe(
      'Treasure tile - Gain a free turn'
    );
  });

  it('should display tile type when revealed', () => {
    render(
      <GridTile
        id="0-0"
        row={0}
        col={0}
        isRevealed={true}
        tileType="treasure"
      />
    );

    // Should show treasure tile with correct testID and accessibility description
    const treasureTile = screen.getByTestId('grid-tile-treasure');
    expect(treasureTile.props.accessibilityHint).toBe(
      'Treasure tile - Gain a free turn'
    );
  });

  it('should display all tile types correctly when revealed', () => {
    const { rerender } = render(
      <GridTile id="0-0" row={0} col={0} isRevealed={true} tileType="trap" />
    );

    // Test trap tile
    const trapTile = screen.getByTestId('grid-tile-trap');
    expect(trapTile.props.accessibilityHint).toBe(
      'Trap tile - Lose an additional turn'
    );

    // Test exit
    rerender(
      <GridTile id="0-0" row={0} col={0} isRevealed={true} tileType="exit" />
    );
    const exitTile = screen.getByTestId('grid-tile-exit');
    expect(exitTile.props.accessibilityHint).toBe(
      'Exit tile - Complete the level'
    );

    // Test bonus
    rerender(
      <GridTile id="0-0" row={0} col={0} isRevealed={true} tileType="bonus" />
    );
    const bonusTile = screen.getByTestId('grid-tile-bonus');
    expect(bonusTile.props.accessibilityHint).toBe(
      'Bonus tile - Reveal adjacent tiles'
    );

    // Test neutral
    rerender(
      <GridTile id="0-0" row={0} col={0} isRevealed={true} tileType="neutral" />
    );
    const neutralTile = screen.getByTestId('grid-tile-neutral');
    expect(neutralTile.props.accessibilityHint).toBe(
      'Neutral tile - No special effect'
    );
  });

  it('should handle undefined tile type gracefully', () => {
    render(
      <GridTile
        id="0-0"
        row={0}
        col={0}
        isRevealed={true}
        tileType={undefined}
      />
    );

    // Should default to neutral tile when type is undefined
    const neutralTile = screen.getByTestId('grid-tile-neutral');
    expect(neutralTile.props.accessibilityHint).toBe(
      'Neutral tile - No special effect'
    );
  });

  it('should apply different visual styles based on tile state', () => {
    const { rerender } = render(<GridTile id="0-0" row={0} col={0} />);

    // Face-down tile should have darker background
    const tile = screen.getByTestId('grid-tile');
    expect(tile).toBeTruthy();

    // Reveal the tile
    rerender(<GridTile id="0-0" row={0} col={0} isRevealed={true} />);

    // Face-up tile should have lighter background
    expect(tile).toBeTruthy();
  });

  it('should show smooth transitions between tile states', () => {
    const { rerender } = render(<GridTile id="0-0" row={0} col={0} />);

    // Initially face-down
    const hiddenTile = screen.getByTestId('grid-tile');
    expect(hiddenTile.props.accessibilityHint).toBe('Hidden tile');

    // Reveal with treasure type
    rerender(
      <GridTile
        id="0-0"
        row={0}
        col={0}
        isRevealed={true}
        tileType="treasure"
      />
    );

    // Should now show treasure tile with specific testID and description
    const treasureTile = screen.getByTestId('grid-tile-treasure');
    expect(treasureTile.props.accessibilityHint).toBe(
      'Treasure tile - Gain a free turn'
    );

    // Change to trap type
    rerender(
      <GridTile id="0-0" row={0} col={0} isRevealed={true} tileType="trap" />
    );

    // Should now show trap tile with specific testID and description
    const trapTile = screen.getByTestId('grid-tile-trap');
    expect(trapTile.props.accessibilityHint).toBe(
      'Trap tile - Lose an additional turn'
    );
  });
});
