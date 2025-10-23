import type { TileType } from '@/types/dungeon-game';

import { TileTypeAdapter } from './tile-type-adapter';

describe('TileTypeAdapter', () => {
  let adapter: TileTypeAdapter;

  beforeEach(() => {
    adapter = new TileTypeAdapter();
  });

  describe('tile type to encounter context mapping', () => {
    it('should map treasure tiles to appropriate encounter rewards', () => {
      const treasureReward = adapter.getTileReward('treasure', 1);

      expect(treasureReward).toBeDefined();
      expect(treasureReward.type).toBe('trade_good');
      expect(treasureReward.value).toBeGreaterThan(0);
      expect(treasureReward.name).toContain('Treasure');
    });

    it('should map trap tiles to appropriate encounter consequences', () => {
      const trapConsequence = adapter.getTileConsequence('trap', 1);

      expect(trapConsequence).toBeDefined();
      expect(trapConsequence.type).toBe('lose_energy');
      expect(trapConsequence.value).toBeGreaterThan(0);
    });

    it('should map exit tiles to encounter completion', () => {
      const exitResult = adapter.getTileResult('exit', 1);

      expect(exitResult).toBeDefined();
      expect(exitResult.success).toBe(true);
      expect(exitResult.rewards).toBeDefined();
    });

    it('should map bonus tiles to special encounter effects', () => {
      const bonusEffect = adapter.getTileEffect('bonus', 1);

      expect(bonusEffect).toBeDefined();
      expect(bonusEffect.type).toBe('reveal_adjacent');
      expect(bonusEffect.description.toLowerCase()).toContain('reveal');
    });

    it('should map neutral tiles to no special effects', () => {
      const neutralEffect = adapter.getTileEffect('neutral', 1);

      expect(neutralEffect).toBeDefined();
      expect(neutralEffect.type).toBe('none');
      expect(neutralEffect.description).toBe('No special effect');
    });
  });

  describe('depth-based scaling', () => {
    it('should scale treasure rewards based on depth', () => {
      const depth1Reward = adapter.getTileReward('treasure', 1);
      const depth5Reward = adapter.getTileReward('treasure', 5);

      expect(depth5Reward.value).toBeGreaterThan(depth1Reward.value);
    });

    it('should scale trap consequences based on depth', () => {
      const depth1Consequence = adapter.getTileConsequence('trap', 1);
      const depth5Consequence = adapter.getTileConsequence('trap', 5);

      expect(depth5Consequence.value).toBeGreaterThan(depth1Consequence.value);
    });

    it('should scale bonus effects based on depth', () => {
      const depth1Effect = adapter.getTileEffect('bonus', 1);
      const depth5Effect = adapter.getTileEffect('bonus', 5);

      expect(depth5Effect.value).toBeGreaterThanOrEqual(depth1Effect.value);
    });
  });

  describe('encounter integration', () => {
    it('should provide encounter-specific tile data', () => {
      const encounterData = adapter.getEncounterTileData('puzzle_chamber', 1);

      expect(encounterData).toBeDefined();
      expect(encounterData.encounterType).toBe('puzzle_chamber');
      expect(encounterData.depth).toBe(1);
      expect(encounterData.tileMappings).toBeDefined();
    });

    it('should validate tile types for encounter context', () => {
      expect(adapter.isValidTileType('treasure')).toBe(true);
      expect(adapter.isValidTileType('trap')).toBe(true);
      expect(adapter.isValidTileType('exit')).toBe(true);
      expect(adapter.isValidTileType('bonus')).toBe(true);
      expect(adapter.isValidTileType('neutral')).toBe(true);
      expect(adapter.isValidTileType('invalid')).toBe(false);
    });

    it('should provide tile type descriptions for encounter context', () => {
      const descriptions = adapter.getTileTypeDescriptions();

      expect(descriptions).toBeDefined();
      expect(descriptions.treasure.toLowerCase()).toContain('reward');
      expect(descriptions.trap.toLowerCase()).toContain('penalt');
      expect(descriptions.exit.toLowerCase()).toContain('complete');
      expect(descriptions.bonus.toLowerCase()).toContain('special');
      expect(descriptions.neutral.toLowerCase()).toContain('safe');
    });
  });

  describe('encounter-specific adaptations', () => {
    it('should adapt tile effects for puzzle chamber encounters', () => {
      const puzzleChamberData = adapter.getEncounterTileData(
        'puzzle_chamber',
        1
      );

      expect(puzzleChamberData.tileMappings.treasure.effect.type).toBe(
        'gain_free_reveal'
      );
      expect(puzzleChamberData.tileMappings.trap.effect.type).toBe(
        'lose_additional_reveal'
      );
      expect(puzzleChamberData.tileMappings.exit.effect.type).toBe(
        'encounter_complete'
      );
      expect(puzzleChamberData.tileMappings.bonus.effect.type).toBe(
        'reveal_adjacent'
      );
      expect(puzzleChamberData.tileMappings.neutral.effect.type).toBe('none');
    });

    it('should provide consistent tile type mapping across encounters', () => {
      const allTileTypes: TileType[] = [
        'treasure',
        'trap',
        'exit',
        'bonus',
        'neutral',
      ];

      allTileTypes.forEach((tileType) => {
        const reward = adapter.getTileReward(tileType, 1);
        const consequence = adapter.getTileConsequence(tileType, 1);
        const effect = adapter.getTileEffect(tileType, 1);

        expect(reward).toBeDefined();
        expect(consequence).toBeDefined();
        expect(effect).toBeDefined();
      });
    });

    it('should handle edge cases for tile type adaptation', () => {
      // Test with extreme depth
      const extremeReward = adapter.getTileReward('treasure', 100);
      expect(extremeReward.value).toBeGreaterThan(0);

      // Test with depth 0
      const zeroDepthReward = adapter.getTileReward('treasure', 0);
      expect(zeroDepthReward.value).toBeGreaterThan(0);

      // Test with negative depth
      const negativeDepthReward = adapter.getTileReward('treasure', -1);
      expect(negativeDepthReward.value).toBeGreaterThan(0);
    });
  });

  describe('encounter context validation', () => {
    it('should validate encounter types', () => {
      expect(adapter.isValidEncounterType('puzzle_chamber')).toBe(true);
      expect(adapter.isValidEncounterType('trade_opportunity')).toBe(true);
      expect(adapter.isValidEncounterType('discovery_site')).toBe(true);
      expect(adapter.isValidEncounterType('invalid_type')).toBe(false);
    });

    it('should provide supported encounter types', () => {
      const supportedTypes = adapter.getSupportedEncounterTypes();

      expect(supportedTypes).toContain('puzzle_chamber');
      expect(supportedTypes).toContain('trade_opportunity');
      expect(supportedTypes).toContain('discovery_site');
      expect(supportedTypes.length).toBeGreaterThan(0);
    });
  });
});
