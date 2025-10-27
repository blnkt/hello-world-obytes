import type { CollectedItem, EncounterType } from '@/types/delvers-descent';

export interface TileRevealResult {
  success: boolean;
  tileType: 'treasure' | 'trap' | 'exit' | 'bonus' | 'neutral';
  effects: string[];
  error?: string;
}

export interface TileDistribution {
  exit: number;
  trap: number;
  treasure: number;
  bonus: number;
  neutral: number;
}

export interface RevealedTile {
  row: number;
  col: number;
  tileType: 'treasure' | 'trap' | 'exit' | 'bonus' | 'neutral';
}

export class PuzzleChamberEncounter {
  private readonly encounterType: EncounterType = 'puzzle_chamber';
  private readonly gridRows = 5;
  private readonly gridCols = 6;
  private readonly totalTiles = this.gridRows * this.gridCols; // 30 tiles

  private tileRevealsRemaining: number;
  private revealedTiles: RevealedTile[] = [];
  private tileDistribution: TileDistribution;
  private levelTiles: ('treasure' | 'trap' | 'exit' | 'bonus' | 'neutral')[] =
    [];
  private encounterComplete = false;
  private encounterResult: 'success' | 'failure' | null = null;
  private depth: number;

  constructor(tileReveals?: number, depth: number = 1) {
    this.depth = depth;
    this.tileRevealsRemaining =
      tileReveals || this.calculateTileRevealsForDepth(depth);
    this.tileDistribution = this.generateTileDistribution(depth);
    this.levelTiles = this.generateLevelTiles();
  }

  getEncounterType(): EncounterType {
    return this.encounterType;
  }

  getTileRevealsRemaining(): number {
    return this.tileRevealsRemaining;
  }

  getRevealedTiles(): RevealedTile[] {
    return [...this.revealedTiles];
  }

  getTileDistribution(): TileDistribution {
    return { ...this.tileDistribution };
  }

  isEncounterComplete(): boolean {
    return this.encounterComplete;
  }

  getEncounterResult(): 'success' | 'failure' | null {
    return this.encounterResult;
  }

  calculateSuccessProbability(): number {
    // Base success rate: 80-85% with optimal play
    const baseSuccessRate = 0.82;

    // Adjust based on depth (deeper = slightly harder)
    const depthAdjustment = Math.max(0, (this.depth - 1) * 0.02);

    // Adjust based on tile reveals (more reveals = higher success rate)
    const revealAdjustment = (this.tileRevealsRemaining - 8) * 0.01;

    return Math.min(
      0.9,
      Math.max(0.7, baseSuccessRate - depthAdjustment + revealAdjustment)
    );
  }

  revealTile(row: number, col: number): TileRevealResult {
    if (this.encounterComplete) {
      return this.createErrorResult('Encounter already complete');
    }

    if (this.tileRevealsRemaining <= 0) {
      this.encounterComplete = true;
      this.encounterResult = 'failure';
      return this.createErrorResult('No tile reveals remaining');
    }

    if (this.isTileAlreadyRevealed(row, col)) {
      return this.createErrorResult('Tile already revealed');
    }

    const tileType = this.getTileType(row, col);
    this.tileRevealsRemaining--;
    this.revealedTiles.push({ row, col, tileType });

    const effects = this.handleTileEffects(tileType, row, col);

    this.checkEncounterCompletion();

    return {
      success: true,
      tileType,
      effects,
    };
  }

  private createErrorResult(error: string): TileRevealResult {
    return {
      success: false,
      tileType: 'neutral',
      effects: [],
      error,
    };
  }

  private isTileAlreadyRevealed(row: number, col: number): boolean {
    return this.revealedTiles.some(
      (tile) => tile.row === row && tile.col === col
    );
  }

  private getTileType(
    row: number,
    col: number
  ): 'treasure' | 'trap' | 'exit' | 'bonus' | 'neutral' {
    const tileIndex = row * this.gridCols + col;
    return this.levelTiles[tileIndex] || 'neutral';
  }

  private handleTileEffects(
    tileType: string,
    row: number,
    col: number
  ): string[] {
    const effects: string[] = [];

    switch (tileType) {
      case 'exit':
        this.completeEncounter('success');
        effects.push('encounter_complete');
        break;
      case 'treasure':
        this.tileRevealsRemaining++;
        effects.push('gain_free_reveal');
        break;
      case 'trap':
        this.tileRevealsRemaining = Math.max(0, this.tileRevealsRemaining - 1);
        effects.push('lose_additional_reveal');
        break;
      case 'bonus':
        this.handleBonusTileEffect(row, col, effects);
        break;
      case 'neutral':
        // No special effects
        break;
    }

    return effects;
  }

  private handleBonusTileEffect(
    row: number,
    col: number,
    effects: string[]
  ): void {
    const adjacentTile = this.findUnrevealedAdjacentTile(row, col);
    if (adjacentTile) {
      const adjTileType = this.getTileType(adjacentTile.row, adjacentTile.col);
      this.revealedTiles.push({
        row: adjacentTile.row,
        col: adjacentTile.col,
        tileType: adjTileType,
      });
      effects.push('reveal_adjacent_tile');

      if (adjTileType === 'exit') {
        this.completeEncounter('success');
        effects.push('encounter_complete');
      }
    }
  }

  private completeEncounter(result: 'success' | 'failure'): void {
    this.encounterComplete = true;
    this.encounterResult = result;
  }

  private checkEncounterCompletion(): void {
    if (this.tileRevealsRemaining <= 0 && !this.encounterComplete) {
      this.completeEncounter('failure');
    }
  }

  generateRewards(): CollectedItem[] {
    if (!this.encounterComplete || this.encounterResult !== 'success') {
      return [];
    }

    // Base reward value
    const baseReward = 50 + this.depth * 25;

    // Bonus for efficiency (more reveals remaining = higher reward)
    const efficiencyBonus = this.tileRevealsRemaining * 5;

    // Random variation
    const variation = 0.8 + Math.random() * 0.4; // 80-120% of base

    const finalValue = Math.round((baseReward + efficiencyBonus) * variation);

    return [
      {
        id: `puzzle-chamber-reward-${Date.now()}`,
        type: 'trade_good',
        setId: 'gems',
        value: finalValue,
        name: 'Chamber Gem',
        description: `A gem discovered in the puzzle chamber at depth ${this.depth}`,
      },
    ];
  }

  private calculateTileRevealsForDepth(depth: number): number {
    // Base reveals: 10
    // Depth scaling: +1 reveal per 2 depth levels
    const baseReveals = 10;
    const depthBonus = Math.floor((depth - 1) / 2);

    return Math.min(12, Math.max(8, baseReveals + depthBonus));
  }

  private generateTileDistribution(depth: number): TileDistribution {
    // Base distribution (similar to existing dungeon game)
    const baseTrapCount = 4;
    const baseTreasureCount = 4;
    const trapIncrease = Math.min(depth - 1, 3);
    const treasureDecrease = Math.min(depth - 1, 2);

    return {
      exit: 1,
      trap: baseTrapCount + trapIncrease,
      treasure: Math.max(1, baseTreasureCount - treasureDecrease),
      bonus: 4,
      neutral:
        this.totalTiles -
        1 -
        (baseTrapCount + trapIncrease) -
        Math.max(1, baseTreasureCount - treasureDecrease) -
        4,
    };
  }

  private generateLevelTiles(): (
    | 'treasure'
    | 'trap'
    | 'exit'
    | 'bonus'
    | 'neutral'
  )[] {
    const tileTypesArray: (
      | 'treasure'
      | 'trap'
      | 'exit'
      | 'bonus'
      | 'neutral'
    )[] = [];

    // Add tiles based on distribution
    Object.entries(this.tileDistribution).forEach(([type, count]) => {
      for (let i = 0; i < count; i++) {
        tileTypesArray.push(type as any);
      }
    });

    // Shuffle using Fisher-Yates algorithm
    for (let i = tileTypesArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tileTypesArray[i], tileTypesArray[j]] = [
        tileTypesArray[j],
        tileTypesArray[i],
      ];
    }

    return tileTypesArray;
  }

  private findUnrevealedAdjacentTile(
    row: number,
    col: number
  ): { row: number; col: number } | null {
    const adjacentTiles: { row: number; col: number }[] = [];

    // Check all four directions
    if (row > 0) adjacentTiles.push({ row: row - 1, col }); // up
    if (col < this.gridCols - 1) adjacentTiles.push({ row, col: col + 1 }); // right
    if (row < this.gridRows - 1) adjacentTiles.push({ row: row + 1, col }); // down
    if (col > 0) adjacentTiles.push({ row, col: col - 1 }); // left

    // Filter to only unrevealed tiles
    const unrevealedAdjacent = adjacentTiles.filter(
      (tile) =>
        !this.revealedTiles.some(
          (revealed) => revealed.row === tile.row && revealed.col === tile.col
        )
    );

    // Return a random unrevealed adjacent tile, or null if none available
    return unrevealedAdjacent.length > 0
      ? unrevealedAdjacent[
          Math.floor(Math.random() * unrevealedAdjacent.length)
        ]
      : null;
  }
}
