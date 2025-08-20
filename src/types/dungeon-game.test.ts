import type {
  AchievementProgress,
  ActiveItemEffect,
  DungeonGameSaveData,
  GameState,
  GameStatistics,
  GridTileState,
  ItemEffectType,
  LoadOperationResult,
  PersistenceMetadata,
  SaveOperationResult,
  TileType,
} from './dungeon-game';

describe('Dungeon Game Types', () => {
  describe('GameState', () => {
    it('should allow valid game states', () => {
      const validStates: GameState[] = ['Active', 'Win', 'Game Over'];

      validStates.forEach((state) => {
        expect(typeof state).toBe('string');
        expect(['Active', 'Win', 'Game Over']).toContain(state);
      });
    });
  });

  describe('TileType', () => {
    it('should allow valid tile types', () => {
      const validTypes: TileType[] = [
        'treasure',
        'trap',
        'exit',
        'bonus',
        'neutral',
      ];

      validTypes.forEach((type) => {
        expect(typeof type).toBe('string');
        expect(['treasure', 'trap', 'exit', 'bonus', 'neutral']).toContain(
          type
        );
      });
    });
  });

  describe('ItemEffectType', () => {
    it('should allow valid item effect types', () => {
      const validTypes: ItemEffectType[] = [
        'speed',
        'strength',
        'luck',
        'defense',
      ];

      validTypes.forEach((type) => {
        expect(typeof type).toBe('string');
        expect(['speed', 'strength', 'luck', 'defense']).toContain(type);
      });
    });
  });

  describe('GridTileState', () => {
    it('should have required properties with correct types', () => {
      const tile: GridTileState = {
        id: 'tile-1',
        x: 0,
        y: 0,
        isRevealed: false,
        type: 'neutral',
        hasBeenVisited: false,
      };

      expect(tile.id).toBe('tile-1');
      expect(tile.x).toBe(0);
      expect(tile.y).toBe(0);
      expect(tile.isRevealed).toBe(false);
      expect(tile.type).toBe('neutral');
      expect(tile.hasBeenVisited).toBe(false);
    });
  });

  describe('AchievementProgress', () => {
    it('should have required properties with correct types', () => {
      const achievements: AchievementProgress = {
        totalGamesPlayed: 5,
        gamesWon: 3,
        gamesLost: 2,
        highestLevelReached: 3,
        totalTurnsUsed: 45,
        totalTreasureFound: 8,
      };

      expect(achievements.totalGamesPlayed).toBe(5);
      expect(achievements.gamesWon).toBe(3);
      expect(achievements.gamesLost).toBe(2);
      expect(achievements.highestLevelReached).toBe(3);
      expect(achievements.totalTurnsUsed).toBe(45);
      expect(achievements.totalTreasureFound).toBe(8);
    });
  });

  describe('GameStatistics', () => {
    it('should have required properties with correct types', () => {
      const stats: GameStatistics = {
        winRate: 0.6,
        averageTurnsPerGame: 9,
        longestGameSession: 120,
        totalPlayTime: 600,
      };

      expect(stats.winRate).toBe(0.6);
      expect(stats.averageTurnsPerGame).toBe(9);
      expect(stats.longestGameSession).toBe(120);
      expect(stats.totalPlayTime).toBe(600);
    });
  });

  describe('ActiveItemEffect', () => {
    it('should have required properties with correct types', () => {
      const effect: ActiveItemEffect = {
        id: 'effect-1',
        type: 'speed',
        duration: 300,
        remainingDuration: 150,
        effectValue: 2,
        appliedAt: Date.now(),
      };

      expect(effect.id).toBe('effect-1');
      expect(effect.type).toBe('speed');
      expect(effect.duration).toBe(300);
      expect(effect.remainingDuration).toBe(150);
      expect(effect.effectValue).toBe(2);
      expect(typeof effect.appliedAt).toBe('number');
    });
  });

  describe('PersistenceMetadata', () => {
    it('should have required properties with correct types', () => {
      const metadata: PersistenceMetadata = {
        lastSaveTime: Date.now(),
        saveCount: 10,
        dataSize: 1024,
        isValid: true,
      };

      expect(typeof metadata.lastSaveTime).toBe('number');
      expect(metadata.saveCount).toBe(10);
      expect(metadata.dataSize).toBe(1024);
      expect(metadata.isValid).toBe(true);
    });
  });

  describe('SaveOperationResult', () => {
    it('should have required properties with correct types', () => {
      const result: SaveOperationResult = {
        success: true,
        metadata: {
          lastSaveTime: Date.now(),
          saveCount: 1,
          dataSize: 512,
          isValid: true,
        },
      };

      expect(result.success).toBe(true);
      expect(result.metadata).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should handle error cases', () => {
      const errorResult: SaveOperationResult = {
        success: false,
        error: 'Storage failed',
      };

      expect(errorResult.success).toBe(false);
      expect(errorResult.error).toBe('Storage failed');
      expect(errorResult.metadata).toBeUndefined();
    });
  });

  describe('LoadOperationResult', () => {
    it('should have required properties with correct types', () => {
      const result: LoadOperationResult = {
        success: true,
        data: {
          version: '1.0.0',
          timestamp: Date.now(),
          gameState: 'Active',
          level: 1,
          gridState: [],
          turnsUsed: 0,
          achievements: {
            totalGamesPlayed: 0,
            gamesWon: 0,
            gamesLost: 0,
            highestLevelReached: 0,
            totalTurnsUsed: 0,
            totalTreasureFound: 0,
          },
          statistics: {
            winRate: 0,
            averageTurnsPerGame: 0,
            longestGameSession: 0,
            totalPlayTime: 0,
          },
          itemEffects: [],
        },
      };

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should handle error cases', () => {
      const errorResult: LoadOperationResult = {
        success: false,
        error: 'Data corrupted',
      };

      expect(errorResult.success).toBe(false);
      expect(errorResult.error).toBe('Data corrupted');
      expect(errorResult.data).toBeUndefined();
    });
  });

  describe('DungeonGameSaveData', () => {
    it('should have required properties with correct types', () => {
      const saveData: DungeonGameSaveData = {
        version: '1.0.0',
        timestamp: Date.now(),
        gameState: 'Active',
        level: 1,
        gridState: [
          {
            id: 'tile-1',
            x: 0,
            y: 0,
            isRevealed: false,
            type: 'neutral',
            hasBeenVisited: false,
          },
        ],
        turnsUsed: 0,
        achievements: {
          totalGamesPlayed: 0,
          gamesWon: 0,
          gamesLost: 0,
          highestLevelReached: 0,
          totalTurnsUsed: 0,
          totalTreasureFound: 0,
        },
        statistics: {
          winRate: 0,
          averageTurnsPerGame: 0,
          longestGameSession: 0,
          totalPlayTime: 0,
        },
        itemEffects: [],
      };

      expect(saveData.version).toBe('1.0.0');
      expect(typeof saveData.timestamp).toBe('number');
      expect(saveData.gameState).toBe('Active');
      expect(saveData.level).toBe(1);
      expect(Array.isArray(saveData.gridState)).toBe(true);
      expect(saveData.turnsUsed).toBe(0);
      expect(saveData.achievements).toBeDefined();
      expect(saveData.statistics).toBeDefined();
      expect(Array.isArray(saveData.itemEffects)).toBe(true);
    });
  });
});
