import { act, renderHook } from '@testing-library/react-native';

import { useGameGridState } from './use-game-grid-state';

describe('useGameGridState', () => {
  const mockCallbacks = {
    onTurnsUpdate: jest.fn(),
    onRevealedTilesUpdate: jest.fn(),
    onGameOver: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useGameGridState(mockCallbacks));

    expect(result.current.revealedTiles.size).toBe(0);
    expect(Object.keys(result.current.tileTypes)).toHaveLength(0);
    expect(result.current.turnsUsed).toBe(0);
  });

  it('should update parent state when state changes', () => {
    const { result } = renderHook(() => useGameGridState(mockCallbacks));

    // Simulate revealing a tile
    act(() => {
      result.current.setRevealedTiles(new Set(['0-0']));
      result.current.setTurnsUsed(1);
    });

    expect(mockCallbacks.onRevealedTilesUpdate).toHaveBeenCalledWith(1);
    expect(mockCallbacks.onTurnsUpdate).toHaveBeenCalledWith(1);
  });

  it('should reset grid state when levelTiles changes', () => {
    const initialLevelTiles: (
      | 'treasure'
      | 'trap'
      | 'exit'
      | 'bonus'
      | 'neutral'
    )[] = ['neutral', 'neutral'];
    const { result, rerender } = renderHook(
      ({ levelTiles }) => useGameGridState({ ...mockCallbacks, levelTiles }),
      { initialProps: { levelTiles: initialLevelTiles } }
    );

    // Simulate some game state
    act(() => {
      result.current.setRevealedTiles(new Set(['0-0', '0-1']));
      result.current.setTileTypes({ '0-0': 'treasure', '0-1': 'trap' });
      result.current.setTurnsUsed(2);
    });

    // Verify state was set
    expect(result.current.revealedTiles.size).toBe(2);
    expect(Object.keys(result.current.tileTypes)).toHaveLength(2);
    expect(result.current.turnsUsed).toBe(2);

    // Change levelTiles (simulating level change)
    const newLevelTiles: (
      | 'treasure'
      | 'trap'
      | 'exit'
      | 'bonus'
      | 'neutral'
    )[] = ['neutral', 'neutral', 'neutral'];
    rerender({ levelTiles: newLevelTiles });

    // Verify state was reset
    expect(result.current.revealedTiles.size).toBe(0);
    expect(Object.keys(result.current.tileTypes)).toHaveLength(0);
    expect(result.current.turnsUsed).toBe(0);
  });

  it('should trigger game over when all tiles are revealed without exit', () => {
    const mockLevelTiles: (
      | 'treasure'
      | 'trap'
      | 'exit'
      | 'bonus'
      | 'neutral'
    )[] = Array(30).fill('neutral') as (
      | 'treasure'
      | 'trap'
      | 'exit'
      | 'bonus'
      | 'neutral'
    )[];
    const { result } = renderHook(() =>
      useGameGridState({ ...mockCallbacks, levelTiles: mockLevelTiles })
    );

    // Reveal all tiles
    act(() => {
      const allTileIds = Array.from(
        { length: 30 },
        (_, i) => `${Math.floor(i / 6)}-${i % 6}`
      );
      result.current.setRevealedTiles(new Set(allTileIds));
    });

    expect(mockCallbacks.onGameOver).toHaveBeenCalled();
  });

  it('should not trigger game over when exit tile is found', () => {
    const mockLevelTiles: (
      | 'treasure'
      | 'trap'
      | 'exit'
      | 'bonus'
      | 'neutral'
    )[] = Array(30).fill('neutral') as (
      | 'treasure'
      | 'trap'
      | 'exit'
      | 'bonus'
      | 'neutral'
    )[];
    mockLevelTiles[15] = 'exit'; // Place exit at position 15
    const { result } = renderHook(() =>
      useGameGridState({ ...mockCallbacks, levelTiles: mockLevelTiles })
    );

    // Reveal all tiles including exit
    act(() => {
      const allTileIds = Array.from(
        { length: 30 },
        (_, i) => `${Math.floor(i / 6)}-${i % 6}`
      );
      result.current.setRevealedTiles(new Set(allTileIds));
    });

    // Should not call onGameOver when exit is found
    expect(mockCallbacks.onGameOver).not.toHaveBeenCalled();
  });

  it('should handle tile type assignments correctly', () => {
    const mockLevelTiles: (
      | 'treasure'
      | 'trap'
      | 'exit'
      | 'bonus'
      | 'neutral'
    )[] = ['treasure', 'trap', 'exit', 'bonus', 'neutral'];
    const { result } = renderHook(() =>
      useGameGridState({ ...mockCallbacks, levelTiles: mockLevelTiles })
    );

    // Simulate revealing tiles
    act(() => {
      result.current.setRevealedTiles(new Set(['0-0', '0-1']));
      result.current.setTileTypes({ '0-0': 'treasure', '0-1': 'trap' });
    });

    expect(result.current.tileTypes['0-0']).toBe('treasure');
    expect(result.current.tileTypes['0-1']).toBe('trap');
  });
});
