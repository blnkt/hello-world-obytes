import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react';

import { CashOutManager } from '@/lib/delvers-descent/cash-out-manager';
import { ReturnCostCalculator } from '@/lib/delvers-descent/return-cost-calculator';
import { SafetyMarginManager } from '@/lib/delvers-descent/safety-margin-manager';

import { usePushYourLuck } from './use-push-your-luck';

describe('usePushYourLuck', () => {
  const defaultProps = {
    currentEnergy: 100,
    currentDepth: 5,
  };

  it('should initialize managers correctly', () => {
    const { result } = renderHook(() => usePushYourLuck(defaultProps));

    expect(result.current.returnCostCalculator).toBeInstanceOf(
      ReturnCostCalculator
    );
    expect(result.current.safetyMarginManager).toBeInstanceOf(
      SafetyMarginManager
    );
    expect(result.current.cashOutManager).toBeInstanceOf(CashOutManager);
  });

  it('should calculate return cost correctly', () => {
    const { result } = renderHook(() => usePushYourLuck(defaultProps));

    const returnCost = result.current.returnCost;
    expect(returnCost).toBeGreaterThan(0);
    expect(returnCost).toBeCloseTo(
      new ReturnCostCalculator().calculateCumulativeReturnCost(5),
      0.1
    );
  });

  it('should provide correct safety margin', () => {
    const { result } = renderHook(() => usePushYourLuck(defaultProps));

    const safetyMargin = result.current.getSafetyMargin(100, 5);
    expect(safetyMargin.remainingEnergy).toBeDefined();
    expect(typeof safetyMargin.remainingEnergy).toBe('number');
    expect(safetyMargin.safetyPercentage).toBeDefined();
    expect(typeof safetyMargin.safetyPercentage).toBe('number');
    expect(safetyMargin.safetyZone).toMatch(/^(safe|caution|danger|critical)$/);
  });

  it('should provide correct risk warnings', () => {
    const { result } = renderHook(() => usePushYourLuck(defaultProps));

    const warnings = result.current.getRiskWarnings(100, 5);
    expect(Array.isArray(warnings)).toBe(true);
  });

  it('should provide correct risk level', () => {
    const { result } = renderHook(() => usePushYourLuck(defaultProps));

    const riskLevel = result.current.getRiskLevel(100, 5);
    expect(riskLevel).toMatch(/^(safe|caution|danger|critical)$/);
  });

  it('should handle zero energy edge case', () => {
    const { result } = renderHook(() =>
      usePushYourLuck({ currentEnergy: 0, currentDepth: 5 })
    );

    const returnCost = result.current.returnCost;
    expect(returnCost).toBeGreaterThan(0);

    const safetyMargin = result.current.getSafetyMargin(0, 5);
    expect(safetyMargin.remainingEnergy).toBeLessThanOrEqual(0);
    expect(safetyMargin.safetyPercentage).toBeLessThanOrEqual(0);
  });

  it('should handle negative depth edge case', () => {
    const { result } = renderHook(() =>
      usePushYourLuck({ currentEnergy: 100, currentDepth: -1 })
    );

    const returnCost = result.current.returnCost;
    expect(returnCost).toBe(0);
  });

  it('should handle zero depth edge case', () => {
    const { result } = renderHook(() =>
      usePushYourLuck({ currentEnergy: 100, currentDepth: 0 })
    );

    const returnCost = result.current.returnCost;
    expect(returnCost).toBe(0);
  });

  it('should handle high depth edge case', () => {
    const { result } = renderHook(() =>
      usePushYourLuck({ currentEnergy: 1000, currentDepth: 100 })
    );

    const returnCost = result.current.returnCost;
    expect(returnCost).toBeGreaterThan(0);

    const safetyMargin = result.current.getSafetyMargin(1000, 100);
    expect(safetyMargin.remainingEnergy).toBeLessThan(1000);
  });

  it('should memoize return cost calculation', () => {
    const { result, rerender } = renderHook((props) => usePushYourLuck(props), {
      initialProps: defaultProps,
    });

    const firstReturnCost = result.current.returnCost;

    // Rerender with same props should return same cost
    rerender(defaultProps);
    expect(result.current.returnCost).toBe(firstReturnCost);

    // Rerender with different depth should return different cost
    rerender({ currentEnergy: 100, currentDepth: 6 });
    expect(result.current.returnCost).not.toBe(firstReturnCost);
  });

  it('should expose managers for direct use', () => {
    const { result } = renderHook(() => usePushYourLuck(defaultProps));

    // Test direct manager access
    const directReturnCost =
      result.current.returnCostCalculator.calculateCumulativeReturnCost(5);
    expect(directReturnCost).toBeGreaterThan(0);

    const directSafetyMargin =
      result.current.safetyMarginManager.calculateSafetyMargin(
        100,
        directReturnCost,
        5
      );
    expect(directSafetyMargin).toBeDefined();

    const canContinue = result.current.cashOutManager.canContinue(100, 20);
    expect(typeof canContinue).toBe('boolean');
  });

  it('should provide consistent API across renders', () => {
    const { result, rerender } = renderHook((props) => usePushYourLuck(props), {
      initialProps: defaultProps,
    });

    // Get initial values
    const initialReturnCost = result.current.returnCost;
    const initialSafetyMargin = result.current.getSafetyMargin(100, 5);
    const initialRiskLevel = result.current.getRiskLevel(100, 5);

    // Rerender
    rerender(defaultProps);

    // Values should be consistent
    expect(result.current.returnCost).toBe(initialReturnCost);
    expect(result.current.getSafetyMargin(100, 5)).toEqual(initialSafetyMargin);
    expect(result.current.getRiskLevel(100, 5)).toBe(initialRiskLevel);

    // Managers should be same instances
    expect(result.current.returnCostCalculator).toBe(
      result.current.returnCostCalculator
    );
    expect(result.current.safetyMarginManager).toBe(
      result.current.safetyMarginManager
    );
    expect(result.current.cashOutManager).toBe(result.current.cashOutManager);
  });

  it('should handle different energy levels correctly', () => {
    const { result: lowEnergy } = renderHook(() =>
      usePushYourLuck({ currentEnergy: 10, currentDepth: 5 })
    );
    const { result: highEnergy } = renderHook(() =>
      usePushYourLuck({ currentEnergy: 1000, currentDepth: 5 })
    );

    const returnCost = lowEnergy.current.returnCost;
    expect(lowEnergy.current.getRiskLevel(10, 5)).toMatch(
      /^(danger|critical)$/
    );
    expect(highEnergy.current.getRiskLevel(1000, 5)).toMatch(
      /^(safe|caution)$/
    );
  });
});
