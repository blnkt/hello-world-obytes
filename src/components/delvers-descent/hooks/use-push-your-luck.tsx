import { useCallback, useMemo, useState } from 'react';

import { CashOutManager } from '@/lib/delvers-descent/cash-out-manager';
import { ReturnCostCalculator } from '@/lib/delvers-descent/return-cost-calculator';
import {
  type RiskWarning,
  type SafetyMargin,
  SafetyMarginManager,
} from '@/lib/delvers-descent/safety-margin-manager';

export interface UsePushYourLuckProps {
  currentEnergy: number;
  currentDepth: number;
}

export interface UsePushYourLuckReturn {
  // Cached convenience value (most common)
  returnCost: number;

  // Manager instances (for flexibility)
  returnCostCalculator: ReturnCostCalculator;
  safetyMarginManager: SafetyMarginManager;
  cashOutManager: CashOutManager;

  // Convenience getters (compute on-demand)
  getSafetyMargin: (currentEnergy: number, depth: number) => SafetyMargin;
  getRiskWarnings: (currentEnergy: number, depth: number) => RiskWarning[];
  getRiskLevel: (
    currentEnergy: number,
    depth: number
  ) => 'safe' | 'caution' | 'danger' | 'critical';
}

export const usePushYourLuck = (
  props: UsePushYourLuckProps
): UsePushYourLuckReturn => {
  const { currentEnergy: _currentEnergy, currentDepth } = props;

  // Initialize managers once (lazy initialization with useState)
  const [returnCostCalculator] = useState(() => new ReturnCostCalculator());
  const [safetyMarginManager] = useState(
    () => new SafetyMarginManager(returnCostCalculator)
  );
  const [cashOutManager] = useState(() => new CashOutManager());

  // Cache returnCost calculation (most common value)
  const returnCost = useMemo(
    () => returnCostCalculator.calculateCumulativeReturnCost(currentDepth),
    [returnCostCalculator, currentDepth]
  );

  // Convenience getters (compute on-demand, not cached)
  const getSafetyMargin = useCallback(
    (currentEnergy: number, depth: number): SafetyMargin => {
      const cost = returnCostCalculator.calculateCumulativeReturnCost(depth);
      return safetyMarginManager.calculateSafetyMargin(
        currentEnergy,
        cost,
        depth
      );
    },
    [returnCostCalculator, safetyMarginManager]
  );

  const getRiskWarnings = useCallback(
    (currentEnergy: number, depth: number): RiskWarning[] => {
      const cost = returnCostCalculator.calculateCumulativeReturnCost(depth);
      return safetyMarginManager.getRiskWarnings(currentEnergy, cost, depth);
    },
    [returnCostCalculator, safetyMarginManager]
  );

  const getRiskLevel = useCallback(
    (
      currentEnergy: number,
      depth: number
    ): 'safe' | 'caution' | 'danger' | 'critical' => {
      const safetyMargin = getSafetyMargin(currentEnergy, depth);
      return safetyMargin.safetyZone;
    },
    [getSafetyMargin]
  );

  return {
    // Cached convenience value
    returnCost,

    // Manager instances for full flexibility
    returnCostCalculator,
    safetyMarginManager,
    cashOutManager,

    // Convenience getters
    getSafetyMargin,
    getRiskWarnings,
    getRiskLevel,
  };
};
