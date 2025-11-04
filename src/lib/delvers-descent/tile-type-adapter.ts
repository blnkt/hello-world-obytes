import type { CollectedItem, EncounterType } from '@/types/delvers-descent';
import type { TileType } from '@/types/dungeon-game';

export interface TileReward {
  type: 'trade_good' | 'discovery' | 'legendary';
  value: number;
  name: string;
  description: string;
}

export interface TileConsequence {
  type: 'lose_energy' | 'lose_item' | 'force_retreat' | 'bust';
  value: number;
  description: string;
}

export interface TileEffect {
  type:
    | 'reveal_adjacent'
    | 'gain_free_reveal'
    | 'lose_additional_reveal'
    | 'encounter_complete'
    | 'none';
  value: number;
  description: string;
}

export interface TileResult {
  success: boolean;
  rewards: CollectedItem[];
  consequences?: TileConsequence[];
}

export interface TileMapping {
  reward: TileReward;
  consequence: TileConsequence;
  effect: TileEffect;
}

export interface EncounterTileData {
  encounterType: EncounterType;
  depth: number;
  tileMappings: Record<TileType, TileMapping>;
}

export class TileTypeAdapter {
  private readonly supportedEncounterTypes: EncounterType[] = [
    'puzzle_chamber',
    'discovery_site',
  ];

  getTileReward(tileType: TileType, depth: number): TileReward {
    const baseRewards = this.getBaseRewards();
    const reward = baseRewards[tileType];

    return {
      ...reward,
      value: this.scaleValueByDepth(reward.value, depth),
    };
  }

  getTileConsequence(tileType: TileType, depth: number): TileConsequence {
    const baseConsequences = this.getBaseConsequences();
    const consequence = baseConsequences[tileType];

    return {
      ...consequence,
      value: this.scaleValueByDepth(consequence.value, depth),
    };
  }

  getTileEffect(tileType: TileType, depth: number): TileEffect {
    const baseEffects = this.getBaseEffects();
    const effect = baseEffects[tileType];

    return {
      ...effect,
      value: this.scaleValueByDepth(effect.value, depth),
    };
  }

  getTileResult(tileType: TileType, depth: number): TileResult {
    const reward = this.getTileReward(tileType, depth);
    const consequence = this.getTileConsequence(tileType, depth);

    const collectedItem: CollectedItem = {
      id: `tile-${tileType}-${Date.now()}`,
      type: reward.type,
      setId: this.getSetIdForTileType(tileType),
      value: reward.value,
      name: reward.name,
      description: reward.description,
    };

    return {
      success: tileType === 'exit',
      rewards: tileType === 'exit' ? [collectedItem] : [],
      consequences: tileType === 'trap' ? [consequence] : undefined,
    };
  }

  getEncounterTileData(
    encounterType: EncounterType,
    depth: number
  ): EncounterTileData {
    const tileMappings: Record<TileType, TileMapping> = {
      treasure: {
        reward: this.getTileReward('treasure', depth),
        consequence: this.getTileConsequence('treasure', depth),
        effect: this.getTileEffect('treasure', depth),
      },
      trap: {
        reward: this.getTileReward('trap', depth),
        consequence: this.getTileConsequence('trap', depth),
        effect: this.getTileEffect('trap', depth),
      },
      exit: {
        reward: this.getTileReward('exit', depth),
        consequence: this.getTileConsequence('exit', depth),
        effect: this.getTileEffect('exit', depth),
      },
      bonus: {
        reward: this.getTileReward('bonus', depth),
        consequence: this.getTileConsequence('bonus', depth),
        effect: this.getTileEffect('bonus', depth),
      },
      neutral: {
        reward: this.getTileReward('neutral', depth),
        consequence: this.getTileConsequence('neutral', depth),
        effect: this.getTileEffect('neutral', depth),
      },
    };

    return {
      encounterType,
      depth,
      tileMappings,
    };
  }

  isValidTileType(tileType: string): tileType is TileType {
    return ['treasure', 'trap', 'exit', 'bonus', 'neutral'].includes(tileType);
  }

  isValidEncounterType(encounterType: string): encounterType is EncounterType {
    return this.supportedEncounterTypes.includes(
      encounterType as EncounterType
    );
  }

  getSupportedEncounterTypes(): EncounterType[] {
    return [...this.supportedEncounterTypes];
  }

  getTileTypeDescriptions(): Record<TileType, string> {
    return {
      treasure: 'Provides valuable rewards and resources',
      trap: 'Imposes penalties and consequences',
      exit: 'Completes the encounter successfully',
      bonus: 'Provides special effects and bonuses',
      neutral: 'Safe tile with no special effects',
    };
  }

  private getBaseRewards(): Record<TileType, TileReward> {
    return {
      treasure: {
        type: 'trade_good',
        value: 50,
        name: 'Treasure Chest',
        description: 'A valuable treasure chest containing precious items',
      },
      trap: {
        type: 'trade_good',
        value: 0,
        name: 'Empty Trap',
        description: 'A dangerous trap with no rewards',
      },
      exit: {
        type: 'trade_good',
        value: 100,
        name: 'Exit Portal',
        description: 'The exit portal leading to safety',
      },
      bonus: {
        type: 'trade_good',
        value: 25,
        name: 'Bonus Cache',
        description: 'A bonus cache with special rewards',
      },
      neutral: {
        type: 'trade_good',
        value: 10,
        name: 'Common Item',
        description: 'A common item found in the chamber',
      },
    };
  }

  private getBaseConsequences(): Record<TileType, TileConsequence> {
    return {
      treasure: {
        type: 'lose_energy',
        value: 0,
        description: 'No negative consequences',
      },
      trap: {
        type: 'lose_energy',
        value: 20,
        description: 'Loses additional energy due to trap damage',
      },
      exit: {
        type: 'lose_energy',
        value: 0,
        description: 'No negative consequences',
      },
      bonus: {
        type: 'lose_energy',
        value: 0,
        description: 'No negative consequences',
      },
      neutral: {
        type: 'lose_energy',
        value: 0,
        description: 'No negative consequences',
      },
    };
  }

  private getBaseEffects(): Record<TileType, TileEffect> {
    return {
      treasure: {
        type: 'gain_free_reveal',
        value: 1,
        description: 'Gains a free tile reveal',
      },
      trap: {
        type: 'lose_additional_reveal',
        value: 1,
        description: 'Loses an additional tile reveal',
      },
      exit: {
        type: 'encounter_complete',
        value: 0,
        description: 'Completes the encounter successfully',
      },
      bonus: {
        type: 'reveal_adjacent',
        value: 1,
        description: 'Reveals an adjacent tile automatically',
      },
      neutral: {
        type: 'none',
        value: 0,
        description: 'No special effect',
      },
    };
  }

  private scaleValueByDepth(baseValue: number, depth: number): number {
    if (depth <= 0) return baseValue;

    // Scale factor: 1 + (depth * 0.2)
    const scaleFactor = 1 + depth * 0.2;
    return Math.round(baseValue * scaleFactor);
  }

  private getSetIdForTileType(tileType: TileType): string {
    const setIdMap: Record<TileType, string> = {
      treasure: 'treasures',
      trap: 'traps',
      exit: 'exits',
      bonus: 'bonuses',
      neutral: 'common_items',
    };

    return setIdMap[tileType];
  }
}
