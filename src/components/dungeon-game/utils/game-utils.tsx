// Helper function to generate level tiles with difficulty scaling
export const generateLevelTiles = (level: number = 1) => {
  // Difficulty scaling: more traps, fewer treasures as level increases
  const baseTrapCount = 4;
  const baseTreasureCount = 4;
  const trapIncrease = Math.min(level - 1, 3); // Max 3 additional traps
  const treasureDecrease = Math.min(level - 1, 2); // Max 2 fewer treasures

  const tileDistribution = {
    exit: 1,
    trap: baseTrapCount + trapIncrease,
    treasure: Math.max(1, baseTreasureCount - treasureDecrease), // Minimum 1 treasure
    bonus: 4,
    neutral:
      30 -
      1 -
      (baseTrapCount + trapIncrease) -
      Math.max(1, baseTreasureCount - treasureDecrease) -
      4,
  };

  const tileTypesArray: ('treasure' | 'trap' | 'exit' | 'bonus' | 'neutral')[] =
    [];

  Object.entries(tileDistribution).forEach(([type, count]) => {
    for (let i = 0; i < count; i++) tileTypesArray.push(type as any);
  });

  for (let i = tileTypesArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tileTypesArray[i], tileTypesArray[j]] = [
      tileTypesArray[j],
      tileTypesArray[i],
    ];
  }

  return tileTypesArray;
};

// Helper function to find an unrevealed adjacent tile
export const findUnrevealedAdjacentTile = (params: {
  tileId: string;
  revealedTiles: Set<string>;
  rows: number;
  cols: number;
}): string | null => {
  const { tileId, revealedTiles, rows, cols } = params;
  const [row, col] = tileId.split('-').map(Number);
  const adjacentTiles: string[] = [];

  // Check all four directions: up, right, down, left
  if (row > 0) adjacentTiles.push(`${row - 1}-${col}`); // up
  if (col < cols - 1) adjacentTiles.push(`${row}-${col + 1}`); // right
  if (row < rows - 1) adjacentTiles.push(`${row + 1}-${col}`); // down
  if (col > 0) adjacentTiles.push(`${row}-${col - 1}`); // left

  // Filter to only unrevealed tiles
  const unrevealedAdjacent = adjacentTiles.filter(
    (id) => !revealedTiles.has(id)
  );

  // Return a random unrevealed adjacent tile, or null if none available
  return unrevealedAdjacent.length > 0
    ? unrevealedAdjacent[Math.floor(Math.random() * unrevealedAdjacent.length)]
    : null;
};

// Helper function to get tile type from level tiles
export const getTileType = (
  row: number,
  col: number,
  levelTiles: ('treasure' | 'trap' | 'exit' | 'bonus' | 'neutral')[]
): 'treasure' | 'trap' | 'exit' | 'bonus' | 'neutral' => {
  const tileIndex = row * 6 + col;
  return levelTiles[tileIndex] || 'neutral';
};
