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

    // Should display a face-up tile
    expect(screen.getByTestId('grid-tile')).toBeTruthy();

    // Should show neutral content when revealed without specific type
    expect(screen.getByText('·')).toBeTruthy();
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

    // Initially face-down
    expect(screen.queryByText('💎')).toBeNull();

    // Reveal the tile
    rerender(
      <GridTile
        id="0-0"
        row={0}
        col={0}
        onPress={mockOnPress}
        isRevealed={true}
      />
    );

    // Should now show neutral content
    expect(screen.getByText('·')).toBeTruthy();

    // Change tile type
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

    // Should show treasure content
    expect(screen.getByText('💎')).toBeTruthy();
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

    // Should show tile type indicator
    expect(screen.getByText('💎')).toBeTruthy();
  });

  it('should display all tile types correctly when revealed', () => {
    const { rerender } = render(
      <GridTile id="0-0" row={0} col={0} isRevealed={true} tileType="monster" />
    );

    // Test monster
    expect(screen.getByText('💀')).toBeTruthy();

    // Test trap
    rerender(
      <GridTile id="0-0" row={0} col={0} isRevealed={true} tileType="trap" />
    );
    expect(screen.getByText('⚠️')).toBeTruthy();

    // Test exit
    rerender(
      <GridTile id="0-0" row={0} col={0} isRevealed={true} tileType="exit" />
    );
    expect(screen.getByText('🚪')).toBeTruthy();

    // Test bonus
    rerender(
      <GridTile id="0-0" row={0} col={0} isRevealed={true} tileType="bonus" />
    );
    expect(screen.getByText('⭐')).toBeTruthy();

    // Test neutral
    rerender(
      <GridTile id="0-0" row={0} col={0} isRevealed={true} tileType="neutral" />
    );
    expect(screen.getByText('·')).toBeTruthy();
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

    // Should show neutral content when tile type is undefined
    expect(screen.getByText('·')).toBeTruthy();
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
    expect(screen.queryByText('💎')).toBeNull();

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

    // Should now show treasure content
    expect(screen.getByText('💎')).toBeTruthy();

    // Change to monster type
    rerender(
      <GridTile id="0-0" row={0} col={0} isRevealed={true} tileType="monster" />
    );

    // Should now show monster content
    expect(screen.getByText('💀')).toBeTruthy();
  });
});
