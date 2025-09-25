import { useEffect, useState } from 'react';

// Item effect types
export type ItemEffectType =
  | 'turn-cost-reduction'
  | 'auto-reveal-neutral'
  | 'bonus-turns'
  | 'trap-immunity';

// Base item effect interface
export interface ItemEffect {
  id: string;
  type: ItemEffectType;
  itemId: string;
  itemName: string;
  itemIcon: string;
  startTime: number;
  duration: number; // in milliseconds
  isActive: boolean;
}

// Specific effect configurations
export interface TurnCostReductionEffect extends ItemEffect {
  type: 'turn-cost-reduction';
  reductionPercent: number; // e.g., 50 for 50% reduction
}

export interface AutoRevealNeutralEffect extends ItemEffect {
  type: 'auto-reveal-neutral';
  tileCount: number;
}

export interface BonusTurnsEffect extends ItemEffect {
  type: 'bonus-turns';
  turnCount: number;
}

export interface TrapImmunityEffect extends ItemEffect {
  type: 'trap-immunity';
}

// Union type for all effects
export type ActiveItemEffect =
  | TurnCostReductionEffect
  | AutoRevealNeutralEffect
  | BonusTurnsEffect
  | TrapImmunityEffect;

// Effect definitions for each item type
export const ITEM_EFFECTS = {
  'potion-energy': {
    type: 'bonus-turns' as const,
    duration: 3 * 60 * 1000, // 3 minutes
    config: { turnCount: 2 },
  },
  'wooden-sword': {
    type: 'turn-cost-reduction' as const,
    duration: 3 * 60 * 1000, // 3 minutes
    config: { reductionPercent: 50 },
  },
  shield: {
    type: 'trap-immunity' as const,
    duration: 3 * 60 * 1000, // 3 minutes
    config: {},
  },
} as const;

// Get remaining time for an effect
const getRemainingTime = (effect: ActiveItemEffect): number => {
  const now = Date.now();
  const elapsed = now - effect.startTime;
  return Math.max(0, effect.duration - elapsed);
};

// Format remaining time for display
const formatRemainingTime = (effect: ActiveItemEffect): string => {
  const remaining = getRemainingTime(effect);
  if (remaining <= 0) return '0:00';

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Hook to manage active item effects
export function useItemEffects() {
  const [activeEffects, setActiveEffects] = useState<ActiveItemEffect[]>([]);

  useEffect(() => {
    // Clean up expired effects
    const interval = setInterval(() => {
      const now = Date.now();
      setActiveEffects((prev) =>
        prev.filter((effect) => now - effect.startTime < effect.duration)
      );
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, []);

  // Activate an item effect
  const activateItemEffect = (
    itemId: string,
    itemName: string,
    itemIcon: string
  ) => {
    const effectConfig = ITEM_EFFECTS[itemId as keyof typeof ITEM_EFFECTS];
    if (!effectConfig) return null;

    const now = Date.now();
    const effect: ActiveItemEffect = {
      id: `${itemId}-${now}`,
      type: effectConfig.type,
      itemId,
      itemName,
      itemIcon,
      startTime: now,
      duration: effectConfig.duration,
      isActive: true,
      ...effectConfig.config,
    } as ActiveItemEffect;

    setActiveEffects((prev) => [...prev, effect]);
    return effect;
  };

  // Check if an effect is active
  const isEffectActive = (effectType: ItemEffectType): boolean => {
    return activeEffects.some(
      (effect) => effect.type === effectType && effect.isActive
    );
  };

  // Get active effects by type
  const getActiveEffectsByType = (type: ItemEffectType): ActiveItemEffect[] => {
    return activeEffects.filter((effect) => effect.type === type);
  };

  return {
    activeEffects,
    activateItemEffect,
    getRemainingTime,
    formatRemainingTime,
    isEffectActive,
    getActiveEffectsByType,
  };
}

// Utility functions for applying effects to game mechanics
export const applyItemEffects = {
  // Calculate turn cost with active reductions
  getTurnCost: <T extends ActiveItemEffect>(
    baseCost: number,
    activeEffects: T[]
  ): number => {
    const costReduction = activeEffects
      .filter(
        (effect): effect is Extract<T, { type: 'turn-cost-reduction' }> =>
          effect.type === 'turn-cost-reduction'
      )
      .reduce((total, effect) => {
        return total + effect.reductionPercent / 100;
      }, 0);

    return Math.max(1, Math.floor(baseCost * (1 - costReduction)));
  },

  // Check if trap immunity is active
  hasTrapImmunity: <T extends ActiveItemEffect>(
    activeEffects: T[]
  ): boolean => {
    return activeEffects.some((effect) => effect.type === 'trap-immunity');
  },

  // Get bonus turns from active effects
  getBonusTurns: <T extends ActiveItemEffect>(activeEffects: T[]): number => {
    return activeEffects
      .filter(
        (effect): effect is Extract<T, { type: 'bonus-turns' }> =>
          effect.type === 'bonus-turns'
      )
      .reduce((total, effect) => {
        return total + effect.turnCount;
      }, 0);
  },
};
