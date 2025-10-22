import { useMemo } from 'react';

import { getEnergyCalculator } from '@/lib/delvers-descent/energy-calculator';
import type { EncounterType, Shortcut } from '@/types/delvers-descent';

// eslint-disable-next-line max-lines-per-function
export const useEnergyCalculator = () => {
  const energyCalculator = getEnergyCalculator();

  const calculateReturnCost = useMemo(() => {
    return (currentDepth: number, shortcuts: Shortcut[] = []): number => {
      return energyCalculator.calculateReturnCost(currentDepth, shortcuts);
    };
  }, [energyCalculator]);

  const calculateNodeCost = useMemo(() => {
    return (depth: number, nodeType: EncounterType): number => {
      return energyCalculator.calculateNodeCost(depth, nodeType);
    };
  }, [energyCalculator]);

  const calculateSafetyMargin = useMemo(() => {
    return (energy: number, returnCost: number): number => {
      return energyCalculator.calculateSafetyMargin(energy, returnCost);
    };
  }, [energyCalculator]);

  const applyShortcutReduction = useMemo(() => {
    return (cost: number, shortcuts: Shortcut[]): number => {
      return energyCalculator.applyShortcutReduction(cost, shortcuts);
    };
  }, [energyCalculator]);

  const canAffordReturn = useMemo(() => {
    return (energy: number, returnCost: number): boolean => {
      return energyCalculator.canAffordReturn(energy, returnCost);
    };
  }, [energyCalculator]);

  const calculatePointOfNoReturn = useMemo(() => {
    return (returnCost: number, safetyBuffer: number = 10): number => {
      return energyCalculator.calculatePointOfNoReturn(
        returnCost,
        safetyBuffer
      );
    };
  }, [energyCalculator]);

  const calculateRiskLevel = useMemo(() => {
    return (energy: number, returnCost: number): number => {
      return energyCalculator.calculateRiskLevel(energy, returnCost);
    };
  }, [energyCalculator]);

  const getRecommendedAction = useMemo(() => {
    return (
      energy: number,
      returnCost: number,
      currentDepth: number
    ): {
      action: 'continue' | 'return' | 'rest';
      reason: string;
      riskLevel: number;
    } => {
      return energyCalculator.getRecommendedAction(
        energy,
        returnCost,
        currentDepth
      );
    };
  }, [energyCalculator]);

  const calculateEnergyEfficiency = useMemo(() => {
    return (energyUsed: number, rewardsGained: number): number => {
      return energyCalculator.calculateEnergyEfficiency(
        energyUsed,
        rewardsGained
      );
    };
  }, [energyCalculator]);

  const calculateOptimalDepth = useMemo(() => {
    return (energy: number, shortcuts: Shortcut[] = []): number => {
      return energyCalculator.calculateOptimalDepth(energy, shortcuts);
    };
  }, [energyCalculator]);

  const calculatePathCost = useMemo(() => {
    return (pathDepths: number[], shortcuts: Shortcut[] = []): number => {
      return energyCalculator.calculatePathCost(pathDepths, shortcuts);
    };
  }, [energyCalculator]);

  const calculateShortcutSavings = useMemo(() => {
    return (normalReturnCost: number, shortcutReturnCost: number): number => {
      return energyCalculator.calculateShortcutSavings(
        normalReturnCost,
        shortcutReturnCost
      );
    };
  }, [energyCalculator]);

  const calculateRegenerationRate = useMemo(() => {
    return (baseRate: number = 5, modifiers: number = 0): number => {
      return energyCalculator.calculateRegenerationRate(baseRate, modifiers);
    };
  }, [energyCalculator]);

  const calculateBacktrackCost = useMemo(() => {
    return (fromDepth: number, toDepth: number): number => {
      return energyCalculator.calculateBacktrackCost(fromDepth, toDepth);
    };
  }, [energyCalculator]);

  const calculateTotalEnergyBudget = useMemo(() => {
    return (
      baseEnergy: number,
      bonuses: {
        streakBonus?: number;
        collectionBonus?: number;
        regionBonus?: number;
      } = {}
    ): number => {
      return energyCalculator.calculateTotalEnergyBudget(baseEnergy, bonuses);
    };
  }, [energyCalculator]);

  const validateEnergyCalculations = useMemo(() => {
    return (
      energy: number,
      returnCost: number
    ): {
      isValid: boolean;
      errors: string[];
    } => {
      return energyCalculator.validateEnergyCalculations(energy, returnCost);
    };
  }, [energyCalculator]);

  const getEnergyAnalysis = useMemo(() => {
    return (params: {
      currentEnergy: number;
      currentDepth: number;
      inventoryValue: number;
      shortcuts?: Shortcut[];
    }) => {
      const {
        currentEnergy,
        currentDepth,
        inventoryValue,
        shortcuts = [],
      } = params;
      const returnCost = calculateReturnCost(currentDepth, shortcuts);
      const pointOfNoReturn = calculatePointOfNoReturn(returnCost);
      const safetyMargin = calculateSafetyMargin(currentEnergy, returnCost);
      const riskLevel = calculateRiskLevel(currentEnergy, returnCost);
      const recommendedAction = getRecommendedAction(
        currentEnergy,
        returnCost,
        currentDepth
      );

      return {
        returnCost,
        pointOfNoReturn,
        riskLevel,
        recommendedAction,
        safetyMargin,
        canAffordReturn: currentEnergy >= returnCost,
        energyAfterReturn: currentEnergy - returnCost,
        maxSafeDepth: calculateOptimalDepth(currentEnergy, shortcuts),
      };
    };
  }, [
    calculateReturnCost,
    calculatePointOfNoReturn,
    calculateSafetyMargin,
    calculateRiskLevel,
    getRecommendedAction,
    calculateOptimalDepth,
  ]);

  return {
    calculateReturnCost,
    calculateNodeCost,
    calculateSafetyMargin,
    applyShortcutReduction,
    canAffordReturn,
    calculatePointOfNoReturn,
    calculateRiskLevel,
    getRecommendedAction,
    calculateEnergyEfficiency,
    calculateOptimalDepth,
    calculatePathCost,
    calculateShortcutSavings,
    calculateRegenerationRate,
    calculateBacktrackCost,
    calculateTotalEnergyBudget,
    validateEnergyCalculations,
    getEnergyAnalysis,
  };
};
