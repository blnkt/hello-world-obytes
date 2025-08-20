import React, { useState } from 'react';

// Custom hook for game grid state management
export const useGameGridState = (callbacks: {
  onTurnsUpdate?: (turns: number) => void;
  onRevealedTilesUpdate?: (count: number) => void;
  onGameOver?: () => void;
  levelTiles?: ('treasure' | 'trap' | 'exit' | 'bonus' | 'neutral')[];
}) => {
  const { onTurnsUpdate, onRevealedTilesUpdate, onGameOver, levelTiles } =
    callbacks;
  const [revealedTiles, setRevealedTiles] = useState<Set<string>>(new Set());
  const [tileTypes, setTileTypes] = useState<
    Record<string, 'treasure' | 'trap' | 'exit' | 'bonus' | 'neutral'>
  >({});
  const [turnsUsed, setTurnsUsed] = useState(0);

  // Update parent component when state changes
  const updateParentState = React.useCallback(() => {
    onTurnsUpdate?.(turnsUsed);
    onRevealedTilesUpdate?.(revealedTiles.size);
  }, [turnsUsed, revealedTiles.size, onTurnsUpdate, onRevealedTilesUpdate]);

  React.useEffect(() => {
    updateParentState();
  }, [updateParentState]);

  // Reset grid state when level changes (levelTiles changes)
  React.useEffect(() => {
    setRevealedTiles(new Set());
    setTileTypes({});
    setTurnsUsed(0);
  }, [levelTiles]);

  // Check for game over condition when all tiles are revealed without finding exit
  React.useEffect(() => {
    if (revealedTiles.size === 30 && onGameOver && levelTiles) {
      // Check if any revealed tile is an exit
      const hasExit = Array.from(revealedTiles).some((tileId) => {
        const tileIndex =
          parseInt(tileId.split('-')[0]) * 6 + parseInt(tileId.split('-')[1]);
        return levelTiles[tileIndex] === 'exit';
      });

      // If no exit was found, it's game over
      if (!hasExit) {
        onGameOver();
      }
    }
  }, [revealedTiles, onGameOver, levelTiles]);

  return {
    revealedTiles,
    setRevealedTiles,
    tileTypes,
    setTileTypes,
    turnsUsed,
    setTurnsUsed,
  };
};
